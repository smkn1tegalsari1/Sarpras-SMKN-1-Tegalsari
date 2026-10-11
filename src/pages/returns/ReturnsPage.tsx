import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  SchoolSettings,
  ReturnInspection,
} from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { ReturnCheckModal } from './ReturnCheckModal';
import {
  RotateCcw,
  Search,
  Filter,
  Car,
  Landmark,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ReturnsPageProps {
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  equipmentBorrowings: EquipmentBorrowing[];
  settings: SchoolSettings;
  onProcessReturn: (
    item: any,
    type: 'MOBIL' | 'AULA' | 'PERALATAN',
    inspection: ReturnInspection
  ) => Promise<void>;
}

type CategoryFilter = 'ALL' | 'MOBIL' | 'AULA' | 'PERALATAN';
type StatusViewFilter = 'ACTIVE' | 'FINISHED' | 'ALL';

interface UnifiedLoanItem {
  id: string;
  type: 'MOBIL' | 'AULA' | 'PERALATAN';
  nomorPengajuan: string;
  userNama: string;
  userUnit: string;
  asetNama: string;
  tanggalPinjam: string;
  estimasiKembali: string;
  status: string;
  pengembalian?: ReturnInspection;
  rawItem: CarBorrowing | HallBooking | EquipmentBorrowing;
}

export const ReturnsPage: React.FC<ReturnsPageProps> = ({
  carBorrowings,
  hallBookings,
  equipmentBorrowings,
  settings,
  onProcessReturn,
}) => {
  const { role, userProfile } = useAuth();
  const isPemohon = role === 'pemohon';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusViewFilter>('ACTIVE');

  // Inspection Modal State
  const [selectedItemForCheck, setSelectedItemForCheck] = useState<any>(null);
  const [selectedTypeForCheck, setSelectedTypeForCheck] = useState<'MOBIL' | 'AULA' | 'PERALATAN' | null>(null);

  // Normalize all loans into a unified view
  const unifiedItems: UnifiedLoanItem[] = [
    ...carBorrowings.map((c) => ({
      id: c.id,
      type: 'MOBIL' as const,
      nomorPengajuan: c.nomorPengajuan,
      userNama: c.userNama,
      userUnit: c.userUnit,
      asetNama: `${c.vehicleNama} (${c.vehicleNoPol})`,
      tanggalPinjam: `${c.tanggalPinjam} ${c.jamBerangkat || ''}`,
      estimasiKembali: c.perkiraanKembali || '-',
      status: c.status,
      pengembalian: c.pengembalian,
      rawItem: c,
    })),
    ...hallBookings.map((h) => ({
      id: h.id,
      type: 'AULA' as const,
      nomorPengajuan: h.nomorPengajuan,
      userNama: h.userNama,
      userUnit: h.userUnit,
      asetNama: `Aula SMKN 1 Tegalsari - ${h.namaKegiatan}`,
      tanggalPinjam: `${h.tanggalKegiatan} ${h.jamMulai || ''}`,
      estimasiKembali: `${h.jamSelesai || ''}`,
      status: h.status,
      pengembalian: h.pengembalian,
      rawItem: h,
    })),
    ...equipmentBorrowings.map((e) => ({
      id: e.id,
      type: 'PERALATAN' as const,
      nomorPengajuan: e.nomorPengajuan,
      userNama: e.userNama,
      userUnit: e.userUnit,
      asetNama: e.items?.map((it) => `${it.nama} (${it.jumlah})`).join(', ') || 'Peralatan',
      tanggalPinjam: e.tanggalPinjam,
      estimasiKembali: e.tanggalKembali,
      status: e.status,
      pengembalian: e.pengembalian,
      rawItem: e,
    })),
  ];

  // Role filter: Pemohon only sees their own borrowings
  const roleFiltered = isPemohon
    ? unifiedItems.filter(
        (it) =>
          (it.rawItem as any).userId === userProfile?.uid ||
          (it.rawItem as any).userId === userProfile?.id
      )
    : unifiedItems;

  // Global counts for metrics
  const activeCars = carBorrowings.filter((c) => c.status === 'DISETUJUI').length;
  const activeHalls = hallBookings.filter((h) => h.status === 'DISETUJUI').length;
  const activeEquipments = equipmentBorrowings.filter((e) => e.status === 'DISETUJUI').length;
  const totalNeedReturn = activeCars + activeHalls + activeEquipments;
  const totalFinished = unifiedItems.filter((it) => it.status === 'SELESAI').length;

  // Filter items
  const filteredList = roleFiltered.filter((item) => {
    // Category filter
    if (categoryFilter !== 'ALL' && item.type !== categoryFilter) return false;

    // Status filter
    if (statusFilter === 'ACTIVE' && item.status !== 'DISETUJUI') return false;
    if (statusFilter === 'FINISHED' && item.status !== 'SELESAI') return false;
    if (statusFilter === 'ALL' && !['DISETUJUI', 'SELESAI'].includes(item.status)) return false;

    // Search query
    const matchSearch =
      item.nomorPengajuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.asetNama.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const handleOpenCheck = (item: UnifiedLoanItem) => {
    setSelectedItemForCheck(item.rawItem);
    setSelectedTypeForCheck(item.type);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Pengembalian & Pengecekan Sarpras
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemeriksaan fisik mobil dinas, aula, dan peralatan sarpras setelah dipinjam sebelum disetujui selesai dan tersedia kembali.
              </p>
            </div>
          </div>
        </div>

        {/* Status notice pill */}
        <div className="flex items-center gap-2">
          {totalNeedReturn > 0 ? (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{totalNeedReturn} Sarpras Menunggu Pengecekan</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Semua Sarpras Aman & Tersedia</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Perlu Pengembalian */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Perlu Dicek (Aktif)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalNeedReturn}</span>
            <span className="text-xs font-medium text-slate-500">Unit/Pengajuan</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Sedang dipinjam & berjalan</p>
        </div>

        {/* Mobil Aktif */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mobil Beroperasi
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeCars}</span>
            <span className="text-xs font-medium text-slate-500">Armada</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Belum dikembalikan ke garasi</p>
        </div>

        {/* Aula Aktif */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Aula Digunakan
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeHalls}</span>
            <span className="text-xs font-medium text-slate-500">Kegiatan</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Perlu cek kebersihan & alat</p>
        </div>

        {/* Peralatan Aktif */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Peralatan Dipinjam
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeEquipments}</span>
            <span className="text-xs font-medium text-slate-500">Peminjaman</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Belum masuk gudang sarpras</p>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold text-slate-600">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === 'ALL'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua Sarpras
            </button>
            <button
              onClick={() => setCategoryFilter('MOBIL')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                categoryFilter === 'MOBIL'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-blue-600" />
              Mobil ({activeCars})
            </button>
            <button
              onClick={() => setCategoryFilter('AULA')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                categoryFilter === 'AULA'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              Aula ({activeHalls})
            </button>
            <button
              onClick={() => setCategoryFilter('PERALATAN')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                categoryFilter === 'PERALATAN'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-600" />
              Peralatan ({activeEquipments})
            </button>
          </div>

          {/* Status View Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Perlu Dicek (Sedang Dipinjam)
            </button>
            <button
              onClick={() => setStatusFilter('FINISHED')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'FINISHED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Sudah Selesai ({totalFinished})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor pengajuan, nama pemohon, jurusan, armada mobil, atau jenis alat..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada data pengembalian</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {statusFilter === 'ACTIVE'
                ? 'Semua peminjaman telah dikembalikan atau belum ada peminjaman aktif yang disetujui.'
                : 'Tidak ditemukan riwayat pengembalian sarpras sesuai filter pencarian Anda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tipe & No. Pengajuan</th>
                  <th className="py-3 px-4">Pemohon & Unit</th>
                  <th className="py-3 px-4">Aset yang Dipinjam</th>
                  <th className="py-3 px-4">Jadwal Pinjam</th>
                  <th className="py-3 px-4">Status & Hasil Pengecekan</th>
                  <th className="py-3 px-4 text-right">Aksi Pengecekan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Tipe & No Pengajuan */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {item.type === 'MOBIL' && (
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700" title="Mobil Dinas">
                            <Car className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === 'AULA' && (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700" title="Aula">
                            <Landmark className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === 'PERALATAN' && (
                          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700" title="Peralatan">
                            <Wrench className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <span className="font-extrabold text-slate-900 block">
                            {item.nomorPengajuan}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Pemohon & Unit */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.userNama}</div>
                      <div className="text-[11px] text-slate-500">{item.userUnit}</div>
                    </td>

                    {/* Aset yang dipinjam */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={item.asetNama}>
                        {item.asetNama}
                      </div>
                    </td>

                    {/* Jadwal Pinjam */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div>{item.tanggalPinjam}</div>
                      <div className="text-[10px] text-slate-400">
                        Sampai: {item.estimasiKembali}
                      </div>
                    </td>

                    {/* Status & Hasil Pengecekan */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={item.status as any} />
                        {item.pengembalian && (
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Kondisi: {item.pengembalian.statusKondisi}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'DISETUJUI' ? (
                        !isPemohon ? (
                          <button
                            onClick={() => handleOpenCheck(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Pemeriksaan & Pengembalian
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                            Harap kembalikan ke Petugas Sarpras
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleOpenCheck(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lihat Berita Acara
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return & Inspection Modal */}
      {selectedItemForCheck && (
        <ReturnCheckModal
          isOpen={!!selectedItemForCheck}
          onClose={() => {
            setSelectedItemForCheck(null);
            setSelectedTypeForCheck(null);
          }}
          item={selectedItemForCheck}
          itemType={selectedTypeForCheck}
          settings={settings}
          onConfirmReturn={onProcessReturn}
        />
      )}
    </div>
  );
};
