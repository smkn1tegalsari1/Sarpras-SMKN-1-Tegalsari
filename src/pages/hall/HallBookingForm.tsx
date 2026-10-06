import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UnitKerja, SchoolSettings } from '../../types';
import {
  generateHallBookingNumber,
  checkHallConflict,
  createNotification,
  logStatusHistory,
} from '../../services/db';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Landmark,
  Calendar,
  Clock,
  User,
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Info,
} from 'lucide-react';

interface HallBookingFormProps {
  units: UnitKerja[];
  settings: SchoolSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

const AVAILABLE_FACILITIES = [
  'Meja',
  'Kursi',
  'LCD',
  'Sound',
  'Mic',
  'AC/Kipas',
];

export const HallBookingForm: React.FC<HallBookingFormProps> = ({
  units,
  settings,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth();

  const [userNama, setUserNama] = useState(userProfile?.nama || '');
  const [userUnit, setUserUnit] = useState(userProfile?.unitNama || (units[0]?.nama || ''));
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [keperluan, setKeperluan] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggalKegiatan, setTanggalKegiatan] = useState(todayStr);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('14:00');
  const [jumlahPeserta, setJumlahPeserta] = useState<number>(100);

  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'Meja',
    'Kursi',
    'LCD',
    'Sound',
  ]);
  const [hasLainnya, setHasLainnya] = useState(false);
  const [fasilitasLainnya, setFasilitasLainnya] = useState('');

  const [disetujuiOleh, setDisetujuiOleh] = useState(settings.namaPejabat || '');
  const [disetujuiJabatan, setDisetujuiJabatan] = useState(
    settings.jabatanPejabat || 'Waka Sarana & Prasarana'
  );
  const [keterangan, setKeterangan] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!userNama.trim()) {
      setErrorMsg('Nama pemohon wajib diisi.');
      return;
    }
    if (!userUnit.trim()) {
      setErrorMsg('Unit/Program Keahlian wajib diisi.');
      return;
    }
    if (!namaKegiatan.trim()) {
      setErrorMsg('Nama kegiatan wajib diisi.');
      return;
    }
    if (!keperluan.trim()) {
      setErrorMsg('Keperluan kegiatan wajib diisi.');
      return;
    }
    if (!tanggalKegiatan) {
      setErrorMsg('Hari/Tanggal kegiatan wajib diisi.');
      return;
    }
    if (!jamMulai || !jamSelesai) {
      setErrorMsg('Waktu mulai dan selesai wajib diisi.');
      return;
    }
    if (!jumlahPeserta || jumlahPeserta <= 0) {
      setErrorMsg('Jumlah peserta wajib diisi lebih dari 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Conflict check for Hall Booking as requested in Section 20
      const isConflict = await checkHallConflict(tanggalKegiatan, jamMulai, jamSelesai);

      if (isConflict) {
        setErrorMsg(
          'Tanggal dan waktu aula telah digunakan. Silakan memilih waktu lain.'
        );
        setIsSubmitting(false);
        return;
      }

      const nomorPengajuan = await generateHallBookingNumber();
      const newRef = doc(collection(db, 'hallBookings'));

      const payloadFacilities = [...selectedFacilities];
      if (hasLainnya && fasilitasLainnya) {
        payloadFacilities.push('Lainnya');
      }

      const payload = {
        id: newRef.id,
        nomorPengajuan,
        userId: userProfile?.uid || userProfile?.id || 'anonymous',
        userNama,
        userUnit,
        userEmail: userProfile?.email || '',
        namaKegiatan,
        keperluan,
        tanggalKegiatan,
        jamMulai,
        jamSelesai,
        jumlahPeserta: Number(jumlahPeserta),
        fasilitas: payloadFacilities,
        fasilitasLainnya: hasLainnya ? fasilitasLainnya : '',
        disetujuiOleh,
        disetujuiJabatan,
        keterangan,
        status: 'MENUNGGU PERSETUJUAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newRef, payload);

      // Audit status history
      await logStatusHistory({
        recordId: newRef.id,
        jenisPengajuan: 'AULA',
        statusLama: 'DRAFT',
        statusBaru: 'MENUNGGU PERSETUJUAN',
        userId: userProfile?.uid || 'user',
        userNama,
        catatan: 'Pengajuan booking aula baru dibuat oleh pemohon',
      });

      // Notification
      await createNotification({
        userId: userProfile?.uid,
        targetRole: 'sarpras',
        title: 'Pengajuan Aula Baru',
        message: `Pengajuan ${nomorPengajuan} untuk ${namaKegiatan} menunggu persetujuan.`,
        link: 'hall_list',
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'hallBookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Formulir Penggunaan Ruang Aula
        </span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-linear-to-r from-emerald-700 to-teal-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                Administrasi Sarana dan Prasarana
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Pengajuan Penggunaan Ruang Aula
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-2">
            Graha Utama Aula SMKN 1 Tegalsari & Ruang Pertemuan Serbaguna.
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
              <User className="w-4 h-4 text-emerald-600" />
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
                  placeholder="Nama lengkap pemohon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unit / Program Keahlian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userUnit}
                  onChange={(e) => setUserUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
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

          {/* SECTION 2: KEGIATAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-emerald-600" />
              2. Kegiatan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  placeholder="Contoh: Rapat Pleno Komite Sekolah & Wali Murid"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keperluan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Sosialisasi Program Prakerin & Penilaian Akhir Semester"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: HARI, TANGGAL & WAKTU */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-600" />
              3. Hari, Tanggal & Waktu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hari / Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKegiatan}
                  onChange={(e) => setTanggalKegiatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mulai Jam <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Selesai Jam <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PESERTA */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-emerald-600" />
              4. Peserta
            </h3>
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Peserta (Orang) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={jumlahPeserta}
                onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                placeholder="100"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* SECTION 5: FASILITAS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              5. Fasilitas Aula yang Diperlukan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_FACILITIES.map((facility) => {
                const checked = selectedFacilities.includes(facility);
                return (
                  <label
                    key={facility}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      checked
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacility(facility)}
                      className="accent-emerald-600 w-4 h-4 rounded"
                    />
                    <span className="text-xs">{facility}</span>
                  </label>
                );
              })}

              {/* Lainnya option */}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  hasLainnya
                    ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasLainnya}
                  onChange={(e) => setHasLainnya(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4 rounded"
                />
                <span className="text-xs">Lainnya...</span>
              </label>
            </div>

            {hasLainnya && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tuliskan Fasilitas Lainnya yang Dibutuhkan
                </label>
                <input
                  type="text"
                  value={fasilitasLainnya}
                  onChange={(e) => setFasilitasLainnya(e.target.value)}
                  placeholder="Contoh: Karpet merah podium, 2 unit standing banner, terminal colokan listrik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>
            )}
          </div>

          {/* SECTION 6: PERSETUJUAN & KETERANGAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              6. Persetujuan & Keterangan Tambahan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Disetujui oleh
                </label>
                <input
                  type="text"
                  value={disetujuiOleh}
                  onChange={(e) => setDisetujuiOleh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan Penggunaan / Kebutuhan Lain
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Keterangan tambahan untuk teknisi atau kebersihan aula..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                />
              </div>
            </div>

            {/* Note required by Section 18 */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 italic">
              “Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.”
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Pengajuan...' : 'Kirim Pengajuan Booking Aula'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
