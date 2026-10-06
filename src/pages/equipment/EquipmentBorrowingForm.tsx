import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Facility, UnitKerja, SchoolSettings, BorrowedEquipmentItem } from '../../types';
import {
  generateEquipmentBorrowingNumber,
  createNotification,
  logStatusHistory,
} from '../../services/db';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Wrench,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  Layers,
} from 'lucide-react';

interface EquipmentBorrowingFormProps {
  facilities: Facility[];
  units: UnitKerja[];
  settings: SchoolSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EquipmentBorrowingForm: React.FC<EquipmentBorrowingFormProps> = ({
  facilities,
  units,
  settings,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth();

  const [userNama, setUserNama] = useState(userProfile?.nama || '');
  const [userUnit, setUserUnit] = useState(userProfile?.unitNama || (units[0]?.nama || ''));
  const [keperluan, setKeperluan] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggalPinjam, setTanggalPinjam] = useState(todayStr);
  const [tanggalKembali, setTanggalKembali] = useState(todayStr);
  const [jamPinjam, setJamPinjam] = useState('08:00');
  const [jamKembali, setJamKembali] = useState('15:00');

  // Selected items list
  const [selectedItems, setSelectedItems] = useState<BorrowedEquipmentItem[]>([
    {
      facilityId: facilities[0]?.id || '',
      nama: facilities[0]?.nama || 'LCD Proyektor EPSON',
      jumlah: 1,
      kondisiSaatPinjam: 'BAIK',
    },
  ]);

  const [disetujuiOleh, setDisetujuiOleh] = useState(settings.namaPejabat || '');
  const [disetujuiJabatan, setDisetujuiJabatan] = useState(
    settings.jabatanPejabat || 'Waka Sarana & Prasarana'
  );
  const [keterangan, setKeterangan] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add equipment item row
  const handleAddItemRow = () => {
    if (facilities.length === 0) return;
    setSelectedItems((prev) => [
      ...prev,
      {
        facilityId: facilities[0]?.id || '',
        nama: facilities[0]?.nama || '',
        jumlah: 1,
        kondisiSaatPinjam: 'BAIK',
      },
    ]);
  };

  // Remove row
  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length <= 1) {
      alert('Paling sedikit harus memilih 1 barang peralatan.');
      return;
    }
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Change row selection
  const handleItemChange = (index: number, facilityId: string) => {
    const fac = facilities.find((f) => f.id === facilityId);
    if (!fac) return;
    setSelectedItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        facilityId: fac.id,
        nama: fac.nama,
        kondisiSaatPinjam: fac.kondisi || 'BAIK',
      };
      return copy;
    });
  };

  // Change quantity
  const handleQtyChange = (index: number, qty: number) => {
    setSelectedItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        jumlah: Math.max(1, qty),
      };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userNama.trim()) {
      setErrorMsg('Nama pemohon wajib diisi.');
      return;
    }
    if (!userUnit.trim()) {
      setErrorMsg('Unit kerja wajib diisi.');
      return;
    }
    if (!keperluan.trim()) {
      setErrorMsg('Keperluan peminjaman wajib diisi.');
      return;
    }
    if (!tanggalPinjam || !tanggalKembali) {
      setErrorMsg('Tanggal pinjam dan tanggal kembali wajib diisi.');
      return;
    }
    if (tanggalKembali < tanggalPinjam) {
      setErrorMsg('Tanggal kembali tidak boleh lebih awal dari tanggal pinjam.');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg('Pilih minimal satu peralatan yang ingin dipinjam.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nomorPengajuan = await generateEquipmentBorrowingNumber();
      const newRef = doc(collection(db, 'equipmentBorrowings'));

      const payload = {
        id: newRef.id,
        nomorPengajuan,
        userId: userProfile?.uid || userProfile?.id || 'anonymous',
        userNama: userNama.trim(),
        userUnit: userUnit.trim(),
        userEmail: userProfile?.email || '',
        keperluan: keperluan.trim(),
        tanggalPinjam,
        tanggalKembali,
        jamPinjam,
        jamKembali,
        items: selectedItems,
        disetujuiOleh,
        disetujuiJabatan,
        keterangan: keterangan.trim(),
        status: 'MENUNGGU PERSETUJUAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newRef, payload);

      // Log status history
      await logStatusHistory({
        recordId: newRef.id,
        jenisPengajuan: 'PERALATAN',
        statusLama: 'DRAFT',
        statusBaru: 'MENUNGGU PERSETUJUAN',
        userId: userProfile?.uid || 'user',
        userNama,
        catatan: `Pengajuan peminjaman ${selectedItems.length} item peralatan dibuat`,
      });

      // Notification to sarpras
      await createNotification({
        userId: userProfile?.uid,
        targetRole: 'sarpras',
        title: 'Pengajuan Peminjaman Peralatan Baru',
        message: `Pengajuan ${nomorPengajuan} untuk ${keperluan} menunggu persetujuan.`,
        link: 'equipment_list',
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'equipmentBorrowings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Formulir Peminjaman Peralatan Sarpras
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-linear-to-r from-indigo-700 to-blue-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                Administrasi Sarana dan Prasarana
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Pengajuan Peminjaman Peralatan & Sarpras
              </h2>
            </div>
          </div>
          <p className="text-xs text-indigo-100 mt-2">
            Peminjaman proyektor, sound system, mikrofon, kursi, meja, dan alat pendukung kegiatan sekolah.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Perhatian:</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* SECTION 1: DATA PEMOHON */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              1. Data Pemohon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pemohon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userNama}
                  onChange={(e) => setUserNama(e.target.value)}
                  placeholder="Nama pemohon / penanggung jawab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unit Kerja / Jurusan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userUnit}
                  onChange={(e) => setUserUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.nama}>
                      {u.nama}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: KEPERLUAN & WAKTU */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-indigo-600" />
              2. Keperluan & Jadwal Peminjaman
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keperluan / Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Workshop Pembelajaran Multimedia Jurusan TKJ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Mulai Pinjam <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPinjam}
                  onChange={(e) => setTanggalPinjam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Perkiraan Tanggal Pengembalian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKembali}
                  onChange={(e) => setTanggalKembali(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jam Pengambilan Alat
                </label>
                <input
                  type="time"
                  value={jamPinjam}
                  onChange={(e) => setJamPinjam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jam Pengembalian Alat
                </label>
                <input
                  type="time"
                  value={jamKembali}
                  onChange={(e) => setJamKembali(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DAFTAR PERALATAN YANG DIPINJAM */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                3. Rincian Peralatan yang Dipinjam
              </h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Barang Lain
              </button>
            </div>

            <div className="space-y-3">
              {selectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    {idx + 1}
                  </span>

                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 sm:hidden">
                      Peralatan
                    </label>
                    <select
                      value={item.facilityId}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      {facilities.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.nama} (Tersedia: {fac.jumlah} Unit, Kondisi: {fac.kondisi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 sm:hidden">
                      Jumlah Unit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.jumlah}
                      onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                      placeholder="Jumlah"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-center"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 sm:hidden">
                      Kondisi Awal
                    </label>
                    <span className="inline-block w-full py-2.5 px-3 rounded-xl bg-slate-200/70 font-semibold text-center text-slate-700">
                      {item.kondisiSaatPinjam || 'BAIK'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition self-end sm:self-center"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: PERSETUJUAN & KETENTUAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              4. Pengesahan & Keterangan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Disetujui oleh (Pejabat Berwenang)
                </label>
                <input
                  type="text"
                  value={disetujuiOleh}
                  onChange={(e) => setDisetujuiOleh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={disetujuiJabatan}
                  onChange={(e) => setDisetujuiJabatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan / Lokasi Penggunaan Alat
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Keterangan ruangan tempat alat digunakan, kabel pendukung, dll..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-950 italic">
              “Peminjam bertanggung jawab penuh atas keutuhan, kebersihan, dan keselamatan peralatan sarpras sekolah yang dipinjam, serta wajib mengembalikan tepat waktu dalam kondisi baik.”
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Pengajuan...' : 'Kirim Pengajuan Peminjaman Alat'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
