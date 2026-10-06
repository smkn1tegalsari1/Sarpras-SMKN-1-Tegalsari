import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CarBorrowing } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  Car,
  Search,
  Filter,
  Plus,
  Calendar,
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Flag,
  FileText,
} from 'lucide-react';

interface CarBorrowingListProps {
  carBorrowings: CarBorrowing[];
  onNavigateNew: () => void;
  onNavigateCalendar: () => void;
  onOpenDetail: (item: CarBorrowing) => void;
  onPrintDoc: (item: CarBorrowing) => void;
  onUpdateStatus: (
    item: CarBorrowing,
    newStatus: CarBorrowing['status'],
    note?: string
  ) => void;
}

export const CarBorrowingList: React.FC<CarBorrowingListProps> = ({
  carBorrowings,
  onNavigateNew,
  onNavigateCalendar,
  onOpenDetail,
  onPrintDoc,
  onUpdateStatus,
}) => {
  const { role, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter based on role (Pemohon only sees their own)
  const isPemohon = role === 'pemohon';
  const roleFilteredList = isPemohon
    ? carBorrowings.filter((c) => c.userId === userProfile?.uid || c.userId === userProfile?.id)
    : carBorrowings;

  const filteredList = roleFilteredList.filter((item) => {
    const matchSearch =
      item.nomorPengajuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleNoPol.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Submenu Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Peminjaman Mobil Sekolah
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {roleFilteredList.length} Pengajuan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data peminjaman armada dinas dan cek jadwal operasional kendaraan SMKN 1 Tegalsari.
          </p>
        </div>

        {/* Submenu actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Kalender Mobil
          </button>
          <button
            onClick={onNavigateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Pengajuan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor pengajuan, nama pemohon, kegiatan, nomor polisi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Main Table or Empty State */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Car className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Tentu belum ada pengajuan.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data peminjaman mobil yang cocok dengan filter atau belum ada permohonan yang dibuat.
            </p>
            <button
              onClick={onNavigateNew}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
            >
              Buat Pengajuan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Nomor Pengajuan</th>
                  <th className="px-5 py-3.5">Pemohon & Unit</th>
                  <th className="px-5 py-3.5">Kendaraan & Nopol</th>
                  <th className="px-5 py-3.5">Kegiatan & Rute</th>
                  <th className="px-5 py-3.5">Jadwal Pinjam</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{item.nomorPengajuan}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{item.userNama}</p>
                      <p className="text-[11px] text-slate-500">{item.userUnit}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{item.vehicleNama}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                        {item.vehicleNoPol}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-slate-800 truncate">{item.kegiatan}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.tujuanRute}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{item.tanggalPinjam}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.jamBerangkat} - {item.perkiraanKembali} WIB
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Lihat Detail & Riwayat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print Document A4 Button */}
                        <button
                          onClick={() => onPrintDoc(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Cetak Formulir Resmi A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Quick Approve / Reject for Sarpras & Admin */}
                        {!isPemohon && item.status === 'MENUNGGU PERSETUJUAN' && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(item, 'DISETUJUI')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => onUpdateStatus(item, 'DITOLAK')}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] transition"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {/* Complete action */}
                        {!isPemohon && item.status === 'DISETUJUI' && (
                          <button
                            onClick={() => onUpdateStatus(item, 'SELESAI')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-2xs"
                          >
                            Selesai
                          </button>
                        )}

                        {/* Cancel action for Pemohon if still pending */}
                        {isPemohon && item.status === 'MENUNGGU PERSETUJUAN' && (
                          <button
                            onClick={() => onUpdateStatus(item, 'DIBATALKAN')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-[11px] transition"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
