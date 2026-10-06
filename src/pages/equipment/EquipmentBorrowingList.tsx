import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EquipmentBorrowing } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Calendar,
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';

interface EquipmentBorrowingListProps {
  equipmentBorrowings: EquipmentBorrowing[];
  onNavigateNew: () => void;
  onNavigateCalendar: () => void;
  onOpenDetail: (item: EquipmentBorrowing) => void;
  onPrintDoc: (item: EquipmentBorrowing) => void;
  onUpdateStatus: (
    item: EquipmentBorrowing,
    newStatus: EquipmentBorrowing['status'],
    note?: string
  ) => void;
}

export const EquipmentBorrowingList: React.FC<EquipmentBorrowingListProps> = ({
  equipmentBorrowings,
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
    ? equipmentBorrowings.filter(
        (c) => c.userId === userProfile?.uid || c.userId === userProfile?.id
      )
    : equipmentBorrowings;

  const filteredList = roleFilteredList.filter((item) => {
    const itemsSummary = item.items?.map((it) => it.nama).join(' ') || '';
    const matchSearch =
      item.nomorPengajuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keperluan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());

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
              Peminjaman Peralatan Sarpras
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
              {roleFilteredList.length} Pengajuan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data peminjaman peralatan inventaris (proyektor, sound, mikrofon, meja, dsb) SMKN 1 Tegalsari.
          </p>
        </div>

        {/* Submenu actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateCalendar}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Kalender Sarpras
          </button>
          <button
            onClick={onNavigateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Pinjam Peralatan Baru
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
            placeholder="Cari nomor pengajuan, nama pemohon, kegiatan, nama alat..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
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
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Belum ada pengajuan peminjaman peralatan.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data peminjaman peralatan yang cocok dengan filter atau belum ada permohonan yang dibuat.
            </p>
            <button
              onClick={onNavigateNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Pengajuan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">No. Pengajuan</th>
                  <th className="py-3 px-4 font-bold">Pemohon & Unit</th>
                  <th className="py-3 px-4 font-bold">Keperluan / Acara</th>
                  <th className="py-3 px-4 font-bold">Peralatan yang Dipinjam</th>
                  <th className="py-3 px-4 font-bold">Jadwal Pinjam</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => {
                  const totalUnits =
                    item.items?.reduce((acc, curr) => acc + (curr.jumlah || 1), 0) || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.nomorPengajuan}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.userNama}</div>
                        <div className="text-[11px] text-slate-500">{item.userUnit}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={item.keperluan}>
                          {item.keperluan}
                        </div>
                        {item.keterangan && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.keterangan}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {item.items && item.items.length > 0 ? (
                            <span>
                              {item.items[0].nama}{' '}
                              <strong className="text-indigo-600">({item.items[0].jumlah}x)</strong>
                              {item.items.length > 1 && (
                                <span className="text-slate-500 text-[11px]">
                                  {' '}+{item.items.length - 1} lainnya
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>Total: {totalUnits} unit barang</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {item.tanggalPinjam}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          s/d {item.tanggalKembali}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenDetail(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Lihat Detail & Riwayat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(item.status === 'DISETUJUI' || item.status === 'SELESAI') && (
                            <button
                              onClick={() => onPrintDoc(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Cetak Formulir Resmi A4"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick action for Sarpras / Admin */}
                          {!isPemohon && item.status === 'MENUNGGU PERSETUJUAN' && (
                            <>
                              <button
                                onClick={() =>
                                  onUpdateStatus(item, 'DISETUJUI', 'Disetujui cepat dari tabel pengajuan')
                                }
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                title="Setujui Cepat"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  onUpdateStatus(item, 'DITOLAK', 'Ditolak dari tabel pengajuan')
                                }
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                title="Tolak"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
