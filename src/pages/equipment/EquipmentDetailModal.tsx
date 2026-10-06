import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EquipmentBorrowing, StatusHistoryItem } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { subscribeStatusHistory } from '../../services/db';
import {
  Wrench,
  Calendar,
  Clock,
  User,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  CheckCheck,
} from 'lucide-react';

interface EquipmentDetailModalProps {
  data: EquipmentBorrowing | null;
  onClose: () => void;
  onPrint: (item: EquipmentBorrowing) => void;
  onUpdateStatus: (
    item: EquipmentBorrowing,
    newStatus: EquipmentBorrowing['status'],
    note?: string
  ) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  data,
  onClose,
  onPrint,
  onUpdateStatus,
}) => {
  const { role } = useAuth();
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [showStatusAction, setShowStatusAction] = useState(false);
  const [targetStatus, setTargetStatus] = useState<EquipmentBorrowing['status'] | null>(null);

  useEffect(() => {
    if (data?.id) {
      const unsub = subscribeStatusHistory(data.id, (list) => {
        setHistory(list);
      });
      return () => unsub();
    }
  }, [data?.id]);

  if (!data) return null;

  const isPemohon = role === 'pemohon';

  const handleActionConfirm = () => {
    if (targetStatus) {
      onUpdateStatus(data, targetStatus, noteInput);
      setShowStatusAction(false);
      setNoteInput('');
    }
  };

  const totalItemsCount = data.items?.reduce((acc, curr) => acc + (curr.jumlah || 1), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-lg">{data.nomorPengajuan}</span>
            <StatusBadge status={data.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dibuat pada {new Date(data.createdAt).toLocaleString('id-ID')}
          </p>
        </div>

        <button
          onClick={() => onPrint(data)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition shrink-0"
        >
          <Printer className="w-4 h-4" /> Cetak Formulir A4
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Pemohon & Jadwal */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Data Pemohon & Unit
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Pemohon</span>
                <span className="font-bold text-slate-800">{data.userNama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unit / Jurusan</span>
                <span className="font-bold text-slate-800">{data.userUnit}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Jadwal Peminjaman Peralatan
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Mulai Pinjam:</span>
                <span className="font-bold text-slate-900">{data.tanggalPinjam} {data.jamPinjam ? `(${data.jamPinjam} WIB)` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Kembali:</span>
                <span className="font-bold text-slate-900">{data.tanggalKembali} {data.jamKembali ? `(${data.jamKembali} WIB)` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Unit Dipinjam:</span>
                <span className="font-bold text-indigo-700">{totalItemsCount} Unit ({data.items?.length || 0} Jenis)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Keperluan & Catatan Petugas */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Keperluan & Keterangan
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Keperluan / Kegiatan</span>
                <span className="font-bold text-slate-900">{data.keperluan}</span>
              </div>
              {data.keterangan && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Keterangan / Lokasi</span>
                  <span className="font-medium text-slate-700">{data.keterangan}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Informasi Pengesahan Sarpras
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Pejabat Berwenang:</span>
                <span className="font-bold text-slate-800">{data.disetujuiOleh || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jabatan:</span>
                <span className="font-medium text-slate-700">{data.disetujuiJabatan || '-'}</span>
              </div>
              {data.catatanPetugas && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mt-2">
                  <span className="font-bold block text-[11px]">Catatan Petugas:</span>
                  <p className="mt-0.5">{data.catatanPetugas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Peralatan yang Dipinjam */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Daftar Peralatan & Sarana yang Dipinjam
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3 font-bold w-12 text-center">No</th>
                <th className="py-2.5 px-3 font-bold">Nama Peralatan</th>
                <th className="py-2.5 px-3 font-bold text-center w-28">Jumlah</th>
                <th className="py-2.5 px-3 font-bold text-center w-36">Kondisi Awal</th>
                <th className="py-2.5 px-3 font-bold text-center w-36">Status Alat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items && data.items.length > 0 ? (
                data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-600">{item.jumlah} Unit</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.kondisiSaatPinjam || 'BAIK'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium text-slate-600">
                      {data.status === 'SELESAI' ? (
                        <span className="text-emerald-700 font-bold">Telah Dikembalikan</span>
                      ) : (
                        <span>Dipinjamkan</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    Tidak ada rincian item barang
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Decision Box (Approval / Rejection / Return Completion) */}
      {!isPemohon && (data.status === 'MENUNGGU PERSETUJUAN' || data.status === 'DISETUJUI') && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs">Aksi Petugas Sarpras & Admin:</h4>
          
          {data.status === 'MENUNGGU PERSETUJUAN' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setTargetStatus('DISETUJUI');
                  setShowStatusAction(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Setujui Peminjaman Alat
              </button>
              <button
                onClick={() => {
                  setTargetStatus('DITOLAK');
                  setShowStatusAction(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
              >
                <XCircle className="w-4 h-4" /> Tolak Peminjaman
              </button>
            </div>
          )}

          {data.status === 'DISETUJUI' && (
            <div>
              <button
                onClick={() => {
                  setTargetStatus('SELESAI');
                  setShowStatusAction(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                <CheckCheck className="w-4 h-4" /> Verifikasi Pengembalian Selesai (Barang Kembali)
              </button>
            </div>
          )}

          {showStatusAction && (
            <div className="mt-3 p-4 rounded-xl bg-white border border-slate-300 space-y-3 animate-fadeIn">
              <p className="text-xs font-bold text-slate-800">
                Konfirmasi Status Baru: <span className="text-indigo-600">{targetStatus}</span>
              </p>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={2}
                placeholder="Tambahkan catatan petugas (kondisi saat barang kembali, alasan tolak, dsb)..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowStatusAction(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleActionConfirm}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel button for applicant if pending */}
      {isPemohon && data.status === 'MENUNGGU PERSETUJUAN' && (
        <div className="pt-2">
          <button
            onClick={() => onUpdateStatus(data, 'DIBATALKAN', 'Dibatalkan oleh pemohon')}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition"
          >
            Batalkan Pengajuan Ini
          </button>
        </div>
      )}

      {/* History Timeline */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" /> Riwayat Status & Catatan
        </h4>
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {history.length > 0 ? (
            history.map((h) => (
              <div key={h.id} className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">
                    {h.statusLama} → <span className="text-indigo-600">{h.statusBaru}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Oleh <strong className="text-slate-700">{h.userNama}</strong> pada{' '}
                    {new Date(h.timestamp).toLocaleString('id-ID')}
                  </p>
                  {h.catatan && (
                    <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] italic">
                      "{h.catatan}"
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-xs italic">Belum ada riwayat tercatat.</p>
          )}
        </div>
      </div>
    </div>
  );
};
