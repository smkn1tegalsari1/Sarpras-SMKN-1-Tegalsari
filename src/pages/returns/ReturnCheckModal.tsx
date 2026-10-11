import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  ReturnInspection,
  SchoolSettings,
  EquipmentReturnCheckItem,
  UserRole,
} from '../../types';
import {
  Car,
  Landmark,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Calendar,
  X,
  Gauge,
  Fuel,
  Sparkles,
  CheckSquare,
  FileCheck2,
  RotateCcw,
} from 'lucide-react';

interface ReturnCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CarBorrowing | HallBooking | EquipmentBorrowing | null;
  itemType: 'MOBIL' | 'AULA' | 'PERALATAN' | null;
  settings: SchoolSettings;
  onConfirmReturn: (
    item: any,
    type: 'MOBIL' | 'AULA' | 'PERALATAN',
    inspection: ReturnInspection
  ) => Promise<void>;
}

export const ReturnCheckModal: React.FC<ReturnCheckModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType,
  settings,
  onConfirmReturn,
}) => {
  const { userProfile, role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inspector details
  const [checkedBy, setCheckedBy] = useState('');
  const [checkedByNip, setCheckedByNip] = useState('');
  const [checkedByRole, setCheckedByRole] = useState<UserRole>('sarpras');

  // Overall condition & outcome
  const [statusKondisi, setStatusKondisi] = useState<'SESUAI' | 'RUSAK' | 'KOTOR' | 'PERLU_PERBAIKAN'>('SESUAI');
  const [catatanPemeriksa, setCatatanPemeriksa] = useState('');
  const [statusAsetSetelahKembali, setStatusAsetSetelahKembali] = useState<'TERSEDIA' | 'SERVIS' | 'RENOVASI'>('TERSEDIA');

  // Mobil state
  const [kmAkhir, setKmAkhir] = useState<string>('');
  const [bbmAkhir, setBbmAkhir] = useState<number>(100);
  const [kebersihanMobil, setKebersihanMobil] = useState<'BERSIH' | 'CUKUP' | 'KOTOR'>('BERSIH');
  const [kondisiFisikMobil, setKondisiFisikMobil] = useState<'BAIK' | 'MULUS' | 'LECET' | 'PENYOK'>('BAIK');
  const [kelengkapanMobil, setKelengkapanMobil] = useState({
    stnk: true,
    kunci: true,
    banSerep: true,
    dongkrak: true,
  });

  // Aula state
  const [kebersihanAula, setKebersihanAula] = useState<'BERSIH' | 'CUKUP' | 'KOTOR'>('BERSIH');
  const [kondisiFasilitasAula, setKondisiFasilitasAula] = useState<'LENGKAP_BAIK' | 'ADA_KERUSAKAN' | 'KOTOR'>('LENGKAP_BAIK');
  const [catatanFasilitasAula, setCatatanFasilitasAula] = useState('');

  // Equipment state
  const [itemsCheck, setItemsCheck] = useState<EquipmentReturnCheckItem[]>([]);

  // Initialize form state when item changes
  useEffect(() => {
    if (!item) return;

    // Check if item already has pengembalian (Read-only or review mode)
    if (item.pengembalian) {
      const p = item.pengembalian;
      setCheckedBy(p.checkedBy || '');
      setCheckedByNip(p.checkedByNip || '');
      setCheckedByRole(p.checkedByRole || 'sarpras');
      setStatusKondisi(p.statusKondisi || 'SESUAI');
      setCatatanPemeriksa(p.catatanPemeriksa || '');
      setStatusAsetSetelahKembali(p.statusAsetSetelahKembali || 'TERSEDIA');

      if (p.kmAkhir !== undefined) setKmAkhir(String(p.kmAkhir));
      if (p.bbmAkhir !== undefined) setBbmAkhir(p.bbmAkhir);
      if (p.kebersihanMobil) setKebersihanMobil(p.kebersihanMobil);
      if (p.kondisiFisikMobil) setKondisiFisikMobil(p.kondisiFisikMobil);
      if (p.kelengkapanMobil) setKelengkapanMobil(p.kelengkapanMobil);

      if (p.kebersihanAula) setKebersihanAula(p.kebersihanAula);
      if (p.kondisiFasilitasAula) setKondisiFasilitasAula(p.kondisiFisikMobil ? 'LENGKAP_BAIK' : p.kondisiFasilitasAula);
      if (p.catatanFasilitasAula) setCatatanFasilitasAula(p.catatanFasilitasAula);

      if (p.itemsCheck) setItemsCheck(p.itemsCheck);
      return;
    }

    // Default initializer for new inspection
    const defaultOfficer = userProfile?.nama || settings.namaPengelola || settings.namaPejabat || 'Petugas Sarpras';
    const defaultNip = userProfile?.role === 'admin' ? (settings.nipPejabat || '') : (settings.nipPengelola || settings.nipPejabat || '');
    setCheckedBy(defaultOfficer);
    setCheckedByNip(defaultNip);
    setCheckedByRole((userProfile?.role as UserRole) || 'sarpras');
    setStatusKondisi('SESUAI');
    setStatusAsetSetelahKembali('TERSEDIA');
    setErrorMsg(null);

    if (itemType === 'MOBIL') {
      const car = item as CarBorrowing;
      const initialKm = Number(car.kmAwal) || 0;
      setKmAkhir(initialKm ? String(initialKm + 10) : '10');
      setBbmAkhir(car.bbmPercent || 80);
      setKebersihanMobil('BERSIH');
      setKondisiFisikMobil('BAIK');
      setKelengkapanMobil({
        stnk: true,
        kunci: true,
        banSerep: true,
        dongkrak: true,
      });
      setCatatanPemeriksa('Kendaraan dikembalikan dalam kondisi baik dan lengkap sesuai saat dipinjam.');
    } else if (itemType === 'AULA') {
      setKebersihanAula('BERSIH');
      setKondisiFasilitasAula('LENGKAP_BAIK');
      setCatatanFasilitasAula('Semua sarana aula telah dikembalikan ke posisi semula dalam kondisi bersih & berfungsi normal.');
      setCatatanPemeriksa('Pemeriksaan aula selesai. Ruangan telah rapi dan bersih.');
    } else if (itemType === 'PERALATAN') {
      const eq = item as EquipmentBorrowing;
      const initialItems: EquipmentReturnCheckItem[] = (eq.items || []).map((it) => ({
        facilityId: it.facilityId,
        nama: it.nama,
        jumlahDipinjam: it.jumlah,
        jumlahKembali: it.jumlah,
        kondisiAwal: it.kondisiSaatPinjam || 'BAIK',
        kondisiKembali: 'BAIK',
        catatanItem: 'Lengkap dan berfungsi normal',
      }));
      setItemsCheck(initialItems);
      setCatatanPemeriksa('Semua peralatan sarpras telah diperiksa dan dikembalikan ke gudang secara lengkap.');
    }
  }, [item, itemType, userProfile, settings]);

  if (!isOpen || !item || !itemType) return null;

  const isAlreadyFinished = item.status === 'SELESAI';
  const isPemohon = role === 'pemohon';

  // Calculations for car distance
  const kmAwalNum = itemType === 'MOBIL' ? Number((item as CarBorrowing).kmAwal || 0) : 0;
  const kmAkhirNum = Number(kmAkhir || 0);
  const distanceTraveled = kmAkhirNum > kmAwalNum ? kmAkhirNum - kmAwalNum : 0;

  const handleEquipmentItemChange = (
    index: number,
    field: keyof EquipmentReturnCheckItem,
    value: any
  ) => {
    setItemsCheck((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAlreadyFinished) return;

    if (!checkedBy.trim()) {
      setErrorMsg('Nama petugas pemeriksa wajib diisi.');
      return;
    }

    if (itemType === 'MOBIL') {
      if (!kmAkhir || Number(kmAkhir) < 0) {
        setErrorMsg('KM Akhir kendaraan wajib diisi dengan angka valid.');
        return;
      }
    }

    if (itemType === 'PERALATAN') {
      // Validate all returned quantities
      for (const it of itemsCheck) {
        if (Number(it.jumlahKembali) < 0) {
          setErrorMsg(`Jumlah kembali untuk ${it.nama} tidak boleh negatif.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const inspection: ReturnInspection = {
      checkedAt: new Date().toISOString(),
      checkedBy,
      checkedByRole,
      checkedByNip: checkedByNip || undefined,
      statusKondisi,
      catatanPemeriksa: catatanPemeriksa || 'Pemeriksaan selesai.',
      statusAsetSetelahKembali,
      ...(itemType === 'MOBIL' && {
        kmAwal: (item as CarBorrowing).kmAwal,
        kmAkhir: Number(kmAkhir),
        jarakTempuh: distanceTraveled,
        bbmAwal: (item as CarBorrowing).bbmPercent,
        bbmAkhir: Number(bbmAkhir),
        kebersihanMobil,
        kondisiFisikMobil,
        kelengkapanMobil,
      }),
      ...(itemType === 'AULA' && {
        kebersihanAula,
        kondisiFasilitasAula,
        catatanFasilitasAula,
      }),
      ...(itemType === 'PERALATAN' && {
        itemsCheck,
      }),
    };

    try {
      await onConfirmReturn(item, itemType, inspection);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan hasil pemeriksaan pengembalian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              {itemType === 'MOBIL' && <Car className="w-6 h-6 text-sky-300" />}
              {itemType === 'AULA' && <Landmark className="w-6 h-6 text-emerald-300" />}
              {itemType === 'PERALATAN' && <Wrench className="w-6 h-6 text-amber-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {isAlreadyFinished ? 'BERITA ACARA SELESAI' : 'PEMERIKSAAN PENGEMBALIAN'}
                </span>
                <span className="text-xs font-semibold text-blue-200">{item.nomorPengajuan}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {itemType === 'MOBIL' && 'Pemeriksaan & Pengembalian Mobil Dinas'}
                {itemType === 'AULA' && 'Pemeriksaan & Pengembalian Ruangan Aula'}
                {itemType === 'PERALATAN' && 'Pemeriksaan & Pengembalian Peralatan Sarpras'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-800">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Banner Notice */}
          {!isAlreadyFinished ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Standar Prosedur Pengecekan Sarpras:</p>
                <p className="text-blue-800/90 mt-0.5">
                  Admin atau Petugas Sarpras harus memeriksa kondisi fisik kendaraan, aula, atau alat inventaris sebelum menyetujui pengembalian.
                  Setelah disetujui, status peminjaman menjadi <strong>SELESAI</strong> dan sarpras otomatis <strong>TERSEDIA KEMBALI</strong> untuk peminjam lainnya.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Peminjaman Ini Telah Selesai & Telah Diperiksa</p>
                <p className="text-emerald-800/90 mt-0.5">
                  Diperiksa oleh <strong>{item.pengembalian?.checkedBy || 'Petugas'}</strong> pada{' '}
                  {item.pengembalian?.checkedAt
                    ? new Date(item.pengembalian.checkedAt).toLocaleString('id-ID')
                    : 'Waktu selesai'}. Sarpras telah kembali tersedia.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Ringkasan Peminjaman */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              1. Data Peminjam & Sarpras
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Pemohon</span>
                <span className="font-bold text-slate-800">{item.userNama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unit Kerja / Jurusan</span>
                <span className="font-bold text-slate-800">{item.userUnit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Pinjam</span>
                <span className="font-bold text-slate-800">
                  {itemType === 'MOBIL' && (item as CarBorrowing).tanggalPinjam}
                  {itemType === 'AULA' && (item as HallBooking).tanggalKegiatan}
                  {itemType === 'PERALATAN' && (item as EquipmentBorrowing).tanggalPinjam}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sarpras Dipinjam</span>
                <span className="font-bold text-blue-700">
                  {itemType === 'MOBIL' && `${(item as CarBorrowing).vehicleNama} (${(item as CarBorrowing).vehicleNoPol})`}
                  {itemType === 'AULA' && `${(item as HallBooking).namaKegiatan}`}
                  {itemType === 'PERALATAN' && `${(item as EquipmentBorrowing).items?.length || 0} Jenis Barang`}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Form Pengecekan Spesifik Berdasarkan Tipe */}
          {/* MOBIL FORM */}
          {itemType === 'MOBIL' && (
            <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Car className="w-4 h-4 text-blue-600" />
                2. Pemeriksaan Kondisi Fisik Mobil
              </h3>

              {/* Odometer and BBM comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>KM Awal (Saat Berangkat)</span>
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-base font-extrabold text-slate-800">
                    {(item as CarBorrowing).kmAwal || '0'} KM
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <label className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
                    <span>KM Akhir (Saat Kembali) <span className="text-rose-500">*</span></span>
                    <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  </label>
                  <input
                    type="number"
                    disabled={isAlreadyFinished}
                    value={kmAkhir}
                    onChange={(e) => setKmAkhir(e.target.value)}
                    placeholder="Masukkan KM Akhir"
                    className="w-full px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {distanceTraveled > 0 && (
                    <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                      Total Jarak Tempuh: +{distanceTraveled} KM
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-1 font-bold">
                    <span>Level BBM Saat Kembali</span>
                    <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      disabled={isAlreadyFinished}
                      value={bbmAkhir}
                      onChange={(e) => setBbmAkhir(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs font-extrabold text-slate-800 w-10 text-right">
                      {bbmAkhir}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    BBM Awal: {(item as CarBorrowing).bbmPercent || 0}%
                  </span>
                </div>
              </div>

              {/* Physical condition & cleanliness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kondisi Body & Mesin Kendaraan
                  </label>
                  <select
                    disabled={isAlreadyFinished}
                    value={kondisiFisikMobil}
                    onChange={(e) => setKondisiFisikMobil(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BAIK">Kondisi Baik & Mulus (Sesuai Semula)</option>
                    <option value="MULUS">Sangat Baik / Mulus</option>
                    <option value="LECET">Ada Lecet / Goresan Baru</option>
                    <option value="PENYOK">Ada Bagian Penyok / Kerusakan Body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kebersihan Interior & Eksterior
                  </label>
                  <select
                    disabled={isAlreadyFinished}
                    value={kebersihanMobil}
                    onChange={(e) => setKebersihanMobil(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BERSIH">Bersih & Rapi</option>
                    <option value="CUKUP">Cukup Bersih</option>
                    <option value="KOTOR">Kotor / Perlu Dicuci</option>
                  </select>
                </div>
              </div>

              {/* Checklist kelengkapan */}
              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-700 mb-2">
                  Pemeriksaan Kelengkapan Surat & Alat Mobil:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      disabled={isAlreadyFinished}
                      checked={kelengkapanMobil.stnk}
                      onChange={(e) =>
                        setKelengkapanMobil((prev) => ({ ...prev, stnk: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">STNK Asli</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      disabled={isAlreadyFinished}
                      checked={kelengkapanMobil.kunci}
                      onChange={(e) =>
                        setKelengkapanMobil((prev) => ({ ...prev, kunci: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Kunci Kontak</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      disabled={isAlreadyFinished}
                      checked={kelengkapanMobil.banSerep}
                      onChange={(e) =>
                        setKelengkapanMobil((prev) => ({ ...prev, banSerep: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Ban Serep</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      disabled={isAlreadyFinished}
                      checked={kelengkapanMobil.dongkrak}
                      onChange={(e) =>
                        setKelengkapanMobil((prev) => ({ ...prev, dongkrak: e.target.checked }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">Dongkrak & Kunci</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* AULA FORM */}
          {itemType === 'AULA' && (
            <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Landmark className="w-4 h-4 text-emerald-600" />
                2. Pemeriksaan Kebersihan & Fasilitas Aula
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kebersihan Ruangan Aula Setelah Acara
                  </label>
                  <select
                    disabled={isAlreadyFinished}
                    value={kebersihanAula}
                    onChange={(e) => setKebersihanAula(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BERSIH">Bersih & Rapi Sesuai Semula</option>
                    <option value="CUKUP">Cukup Bersih</option>
                    <option value="KOTOR">Kotor / Masih Ada Sampah Acara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kondisi Fasilitas yang Digunakan
                  </label>
                  <select
                    disabled={isAlreadyFinished}
                    value={kondisiFasilitasAula}
                    onChange={(e) => setKondisiFasilitasAula(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LENGKAP_BAIK">Lengkap & Berfungsi Baik</option>
                    <option value="ADA_KERUSAKAN">Ada Fasilitas Rusak / Bermasalah</option>
                    <option value="KOTOR">Fasilitas Kotor / Perlu Dicuci</option>
                  </select>
                </div>
              </div>

              {/* Fasilitas yang dipinjam */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1.5">
                  Daftar Fasilitas Aula yang Dipakai:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(item as HallBooking).fasilitas?.map((fas, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {fas}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Kondisi Sarana Aula
                </label>
                <textarea
                  disabled={isAlreadyFinished}
                  rows={2}
                  value={catatanFasilitasAula}
                  onChange={(e) => setCatatanFasilitasAula(e.target.value)}
                  placeholder="Catatan lampu, AC, LCD, Sound System atau susunan kursi setelah selesai..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* PERALATAN FORM */}
          {itemType === 'PERALATAN' && (
            <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Wrench className="w-4 h-4 text-indigo-600" />
                2. Pemeriksaan Rincian Barang Peralatan yang Dikembalikan
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold">Nama Barang</th>
                      <th className="py-2.5 px-3 font-bold text-center">Dipinjam</th>
                      <th className="py-2.5 px-3 font-bold text-center">Dikembalikan</th>
                      <th className="py-2.5 px-3 font-bold">Kondisi Kembali</th>
                      <th className="py-2.5 px-3 font-bold">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsCheck.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {it.nama}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Kondisi awal: {it.kondisiAwal}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-600">
                          {it.jumlahDipinjam}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={it.jumlahDipinjam}
                            disabled={isAlreadyFinished}
                            value={it.jumlahKembali}
                            onChange={(e) =>
                              handleEquipmentItemChange(idx, 'jumlahKembali', Number(e.target.value))
                            }
                            className={`w-16 px-2 py-1 rounded-lg border text-center font-bold text-xs ${
                              it.jumlahKembali === it.jumlahDipinjam
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : 'border-rose-300 bg-rose-50 text-rose-800'
                            }`}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            disabled={isAlreadyFinished}
                            value={it.kondisiKembali}
                            onChange={(e) =>
                              handleEquipmentItemChange(idx, 'kondisiKembali', e.target.value)
                            }
                            className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                          >
                            <option value="BAIK">BAIK</option>
                            <option value="RUSAK RINGAN">RUSAK RINGAN</option>
                            <option value="RUSAK BERAT">RUSAK BERAT</option>
                            <option value="HILANG">HILANG</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            disabled={isAlreadyFinished}
                            value={it.catatanItem || ''}
                            onChange={(e) =>
                              handleEquipmentItemChange(idx, 'catatanItem', e.target.value)
                            }
                            placeholder="Catatan..."
                            className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Kesimpulan & Petugas Pemeriksa */}
          <div className="space-y-4 border border-slate-200 rounded-2xl p-4 bg-slate-50">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              3. Kesimpulan Pemeriksaan & Ketersediaan Aset Kembali
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Kesesuaian Kondisi Sarpras
                </label>
                <select
                  disabled={isAlreadyFinished}
                  value={statusKondisi}
                  onChange={(e) => setStatusKondisi(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SESUAI">Sesuai Keadaan Semula (Baik & Lengkap)</option>
                  <option value="KOTOR">Kotor / Perlu Dibersihkan</option>
                  <option value="PERLU_PERBAIKAN">Ada Kendala Ringan / Perlu Penanganan</option>
                  <option value="RUSAK">Ada Kerusakan / Kehilangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status Aset Setelah Pengembalian Disetujui
                </label>
                <select
                  disabled={isAlreadyFinished}
                  value={statusAsetSetelahKembali}
                  onChange={(e) => setStatusAsetSetelahKembali(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TERSEDIA">TERSEDIA (Dapat langsung dipinjam kembali)</option>
                  {itemType === 'MOBIL' && <option value="SERVIS">SERVIS (Masuk jadwal perawatan)</option>}
                  {itemType === 'AULA' && <option value="RENOVASI">RENOVASI (Perlu perbaikan sebelum dipakai lagi)</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Berita Acara Pemeriksa <span className="text-rose-500">*</span>
              </label>
              <textarea
                disabled={isAlreadyFinished}
                required
                rows={2}
                value={catatanPemeriksa}
                onChange={(e) => setCatatanPemeriksa(e.target.value)}
                placeholder="Tuliskan catatan hasil pemeriksaan fisik oleh petugas sarpras..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Identitas Petugas Pemeriksa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Petugas Pemeriksa (Admin / Sarpras)
                </label>
                <input
                  type="text"
                  disabled={isAlreadyFinished}
                  required
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  placeholder="Nama Petugas"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP Petugas Pemeriksa (Opsional)
                </label>
                <input
                  type="text"
                  disabled={isAlreadyFinished}
                  value={checkedByNip}
                  onChange={(e) => setCheckedByNip(e.target.value)}
                  placeholder="NIP Petugas"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
            >
              {isAlreadyFinished ? 'Tutup Berita Acara' : 'Batal'}
            </button>

            {!isAlreadyFinished && !isPemohon && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting
                  ? 'Menyimpan Pemeriksaan...'
                  : 'Setujui Selesai Peminjaman (Aset Kembali Tersedia)'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
