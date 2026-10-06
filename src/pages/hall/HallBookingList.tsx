import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HallBooking } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  Landmark,
  Search,
  Filter,
  Plus,
  Calendar,
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
} from 'lucide-react';

interface HallBookingListProps {
  hallBookings: HallBooking[];
  onNavigateNew: () => void;
  onNavigateCalendar: () => void;
  onOpenDetail: (item: HallBooking) => void;
  onPrintDoc: (item: HallBooking) => void;
  onUpdateStatus: (
    item: HallBooking,
    newStatus: HallBooking['status'],
    note?: string
  ) => void;
}

export const HallBookingList: React.FC<HallBookingListProps> = ({
  hallBookings,
  onNavigateNew,
  onNavigateCalendar,
  onOpenDetail,
  onPrintDoc,
  onUpdateStatus,
}) => {
  const { role, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isPemohon = role === 'pemohon';
  const roleFilteredList = isPemohon
    ? hallBookings.filter((h) => h.userId === userProfile?.uid || h.userId === userProfile?.id)
    : hallBookings;

  const filteredList = roleFilteredList.filter((item) => {
    const matchSearch =
      item.nomorPengajuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keperluan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Penggunaan Ruang Aula
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {roleFilteredList.length} Pengajuan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar permohonan penggunaan Graha Utama Aula SMKN 1 Tegalsari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Kalender Aula
          </button>
          <button
            onClick={onNavigateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Pengajuan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor pengajuan, nama kegiatan, pemohon..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
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

      {/* Main Table or Empty */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Landmark className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Tentu belum ada pengajuan.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data booking aula yang ditemukan.
            </p>
            <button
              onClick={onNavigateNew}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
            >
              Buat Pengajuan Aula
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Nomor Pengajuan</th>
                  <th className="px-5 py-3.5">Pemohon & Unit</th>
                  <th className="px-5 py-3.5">Nama Kegiatan & Keperluan</th>
                  <th className="px-5 py-3.5">Hari / Tanggal</th>
                  <th className="px-5 py-3.5">Peserta</th>
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

                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-slate-800 truncate">{item.namaKegiatan}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.keperluan}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{item.tanggalKegiatan}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.jamMulai} - {item.jamSelesai} WIB
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.jumlahPeserta} org
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          title="Lihat Detail & Riwayat"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onPrintDoc(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Cetak Formulir Resmi A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

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

                        {!isPemohon && item.status === 'DISETUJUI' && (
                          <button
                            onClick={() => onUpdateStatus(item, 'SELESAI')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-2xs"
                          >
                            Selesai
                          </button>
                        )}

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
