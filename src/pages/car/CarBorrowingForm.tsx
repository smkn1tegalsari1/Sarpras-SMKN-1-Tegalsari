import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Vehicle, UnitKerja, SchoolSettings } from '../../types';
import {
  generateCarBorrowingNumber,
  checkCarConflict,
  createNotification,
  logStatusHistory,
} from '../../services/db';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Car,
  Calendar,
  Clock,
  User,
  Phone,
  Gauge,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface CarBorrowingFormProps {
  vehicles: Vehicle[];
  units: UnitKerja[];
  settings: SchoolSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CarBorrowingForm: React.FC<CarBorrowingFormProps> = ({
  vehicles,
  units,
  settings,
  onSuccess,
  onCancel,
}) => {
  const { userProfile } = useAuth();

  // Form states
  const [userNama, setUserNama] = useState(userProfile?.nama || '');
  const [userUnit, setUserUnit] = useState(userProfile?.unitNama || (units[0]?.nama || ''));
  const [kegiatan, setKegiatan] = useState('');
  const [tujuanRute, setTujuanRute] = useState('');
  const [kmAwal, setKmAwal] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggalPinjam, setTanggalPinjam] = useState(todayStr);
  const [jamBerangkat, setJamBerangkat] = useState('07:30');
  const [perkiraanKembali, setPerkiraanKembali] = useState('16:00');

  const availableVehicles = vehicles.filter((v) => v.status === 'TERSEDIA');
  const [vehicleId, setVehicleId] = useState(availableVehicles[0]?.id || '');

  const [driverNama, setDriverNama] = useState('');
  const [driverHp, setDriverHp] = useState('');
  const [bbmPercent, setBbmPercent] = useState<number>(75);

  const [disetujuiOleh, setDisetujuiOleh] = useState(settings.namaPejabat || '');
  const [disetujuiJabatan, setDisetujuiJabatan] = useState(
    settings.jabatanPejabat || 'Waka Sarana & Prasarana'
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!kegiatan.trim()) {
      setErrorMsg('Kegiatan wajib diisi.');
      return;
    }
    if (!tujuanRute.trim()) {
      setErrorMsg('Tujuan/Rute wajib diisi.');
      return;
    }
    if (!tanggalPinjam) {
      setErrorMsg('Hari/Tanggal peminjaman wajib diisi.');
      return;
    }
    if (!jamBerangkat || !perkiraanKembali) {
      setErrorMsg('Jam berangkat dan perkiraan kembali wajib diisi.');
      return;
    }
    if (!vehicleId) {
      setErrorMsg('Kendaraan wajib dipilih. Mohon pastikan ada armada yang tersedia.');
      return;
    }
    if (!driverNama.trim()) {
      setErrorMsg('Nama pengemudi wajib diisi.');
      return;
    }
    if (!driverHp.trim()) {
      setErrorMsg('Nomor HP pengemudi wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Conflict Check!
      const isConflict = await checkCarConflict(
        vehicleId,
        tanggalPinjam,
        jamBerangkat,
        perkiraanKembali
      );

      if (isConflict) {
        setErrorMsg(
          'Mohon maaf, kendaraan tersebut sudah digunakan pada tanggal/waktu yang dipilih. Silakan memilih kendaraan atau waktu lain.'
        );
        setIsSubmitting(false);
        return;
      }

      const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
      const nomorPengajuan = await generateCarBorrowingNumber();
      const newRef = doc(collection(db, 'carBorrowings'));

      const payload = {
        id: newRef.id,
        nomorPengajuan,
        userId: userProfile?.uid || userProfile?.id || 'anonymous',
        userNama,
        userUnit,
        userEmail: userProfile?.email || '',
        kegiatan,
        tujuanRute,
        kmAwal,
        tanggalPinjam,
        jamBerangkat,
        perkiraanKembali,
        vehicleId,
        vehicleNama: selectedVehicle?.nama || '',
        vehicleNoPol: selectedVehicle?.nomorPolisi || '',
        driverNama,
        driverHp,
        bbmPercent: Number(bbmPercent),
        disetujuiOleh,
        disetujuiJabatan,
        catatan:
          'Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras.',
        status: 'MENUNGGU PERSETUJUAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newRef, payload);

      // Log status history
      await logStatusHistory({
        recordId: newRef.id,
        jenisPengajuan: 'MOBIL',
        statusLama: 'DRAFT',
        statusBaru: 'MENUNGGU PERSETUJUAN',
        userId: userProfile?.uid || 'user',
        userNama,
        catatan: 'Pengajuan peminjaman mobil baru dibuat oleh pemohon',
      });

      // Send notification
      await createNotification({
        userId: userProfile?.uid,
        targetRole: 'sarpras',
        title: 'Pengajuan Mobil Baru',
        message: `Pengajuan ${nomorPengajuan} untuk ${kegiatan} menunggu persetujuan.`,
        link: 'car_list',
      });

      onSuccess();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'carBorrowings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Formulir Standar SMKN 1 Tegalsari
        </span>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Kop */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                Administrasi Sarana dan Prasarana
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Pengajuan Peminjaman Mobil Sekolah
              </h2>
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Isi seluruh informasi dengan akurat untuk diverifikasi oleh Petugas Sarpras.
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
              <User className="w-4 h-4 text-blue-600" />
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
                  placeholder="Contoh: Budi Santoso, M.Kom."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unit / Program Keahlian <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userUnit}
                  onChange={(e) => setUserUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
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

          {/* SECTION 2: KEPERLUAN & TUJUAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-blue-600" />
              2. Keperluan / Tujuan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kegiatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  placeholder="Contoh: Mengantar Siswa LKS Tingkat Provinsi Jawa Timur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tujuan / Rute Perjalanan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tujuanRute}
                  onChange={(e) => setTujuanRute(e.target.value)}
                  placeholder="Contoh: Tegalsari - Jember - Surabaya (PP)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  KM Awal / Perkiraan Jarak
                </label>
                <input
                  type="text"
                  value={kmAwal}
                  onChange={(e) => setKmAwal(e.target.value)}
                  placeholder="Contoh: KM 45.200 / Estimasi 320 KM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: HARI, TANGGAL & WAKTU */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" />
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
                  value={tanggalPinjam}
                  onChange={(e) => setTanggalPinjam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jam Berangkat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={jamBerangkat}
                  onChange={(e) => setJamBerangkat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Perkiraan Kembali <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={perkiraanKembali}
                  onChange={(e) => setPerkiraanKembali(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: KENDARAAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Car className="w-4 h-4 text-blue-600" />
              4. Kendaraan Sekolah
            </h3>
            {availableVehicles.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Belum ada kendaraan yang tersedia saat ini (semua unit sedang bertugas atau servis).
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableVehicles.map((v) => (
                  <label
                    key={v.id}
                    className={`cursor-pointer p-4 rounded-2xl border transition flex flex-col justify-between ${
                      vehicleId === v.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {v.kode}
                        </span>
                        <input
                          type="radio"
                          name="vehicleOption"
                          value={v.id}
                          checked={vehicleId === v.id}
                          onChange={() => setVehicleId(v.id)}
                          className="accent-blue-600"
                        />
                      </div>
                      <p className="font-bold text-slate-900 text-xs">{v.nama}</p>
                      <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{v.nomorPolisi}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Kapasitas: {v.kapasitas} Penumpang</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: PENGEMUDI */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              5. Pengemudi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pengemudi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={driverNama}
                  onChange={(e) => setDriverNama(e.target.value)}
                  placeholder="Contoh: Pak Slamet / Driver Resmi SMKN 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  No. HP Pengemudi (WhatsApp Aktif) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={driverHp}
                  onChange={(e) => setDriverHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: KONDISI AWAL KENDARAAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Gauge className="w-4 h-4 text-blue-600" />
              6. Kondisi Awal Kendaraan
            </h3>

            {/* BBM % */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Indikator BBM Awal: <span className="text-blue-600 font-extrabold">{bbmPercent}%</span>
                </label>
                <span className="text-[11px] text-slate-500">Kapasitas Tangki</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={bbmPercent}
                onChange={(e) => setBbmPercent(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* SECTION 7: PERSETUJUAN & CATATAN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              7. Persetujuan & Pejabat Berwenang
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Disetujui oleh (Nama Pejabat)
                </label>
                <input
                  type="text"
                  value={disetujuiOleh}
                  onChange={(e) => setDisetujuiOleh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-900 italic">
              “Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras.”
            </div>
          </div>

          {/* Submit Actions */}
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
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses Pengajuan...' : 'Kirim Pengajuan Peminjaman'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
