import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HallBooking, StatusHistoryItem } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { subscribeStatusHistory } from '../../services/db';
import {
  Landmark,
  Calendar,
  Clock,
  User,
  Users,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  FileText,
  CheckSquare,
} from 'lucide-react';

interface HallDetailModalProps {
  data: HallBooking | null;
  onClose: () => void;
  onPrint: (item: HallBooking) => void;
  onUpdateStatus: (
    item: HallBooking,
    newStatus: HallBooking['status'],
    note?: string
  ) => void;
}

export const HallDetailModal: React.FC<HallDetailModalProps> = ({
  data,
  onClose,
  onPrint,
  onUpdateStatus,
}) => {
  const { role } = useAuth();
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [showStatusAction, setShowStatusAction] = useState(false);
  const [targetStatus, setTargetStatus] = useState<HallBooking['status'] | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition shrink-0"
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
              <User className="w-4 h-4 text-emerald-600" /> Data Pemohon & Unit
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
              <Calendar className="w-4 h-4 text-emerald-600" /> Jadwal Pemakaian Aula
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Hari / Tanggal:</span>
                <span className="font-bold text-slate-900">{data.tanggalKegiatan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Pelaksanaan:</span>
                <span className="font-bold text-slate-900">{data.jamMulai} - {data.jamSelesai} WIB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Peserta:</span>
                <span className="font-bold text-emerald-700">{data.jumlahPeserta} Orang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kegiatan & Fasilitas */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Agenda Kegiatan
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Kegiatan</span>
                <span className="font-bold text-slate-900">{data.namaKegiatan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Keperluan</span>
                <span className="font-medium text-slate-700">{data.keperluan}</span>
              </div>
              {data.keterangan && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Keterangan Tambahan</span>
                  <span className="font-medium text-slate-600 italic">{data.keterangan}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" /> Fasilitas Aula yang Diminta
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.fasilitas?.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
            {data.fasilitasLainnya && (
              <p className="text-[11px] text-slate-600 pt-1">
                <strong>Fasilitas Lainnya:</strong> {data.fasilitasLainnya}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Catatan Ketentuan Resmi */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-600">
        “Pengguna wajib menjaga kebersihan, ketertiban, keamanan, dan mengembalikan fasilitas aula seperti semula.”
      </div>

      {/* Riwayat Status */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" /> Riwayat Status & Catatan
        </h4>
        {history.length === 0 ? (
          <p className="text-slate-400 text-xs italic">Belum ada riwayat perubahan status.</p>
        ) : (
          <div className="space-y-3 pl-2 border-l-2 border-emerald-200">
            {history.map((h) => (
              <div key={h.id} className="relative pl-4 text-xs">
                <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{h.statusBaru}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Oleh: <strong>{h.userNama}</strong>
                </p>
                {h.catatan && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    "{h.catatan}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Petugas Action */}
      {!isPemohon && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Aksi Petugas Sarpras / Admin
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.status === 'MENUNGGU PERSETUJUAN' && (
              <>
                <button
                  onClick={() => {
                    setTargetStatus('DISETUJUI');
                    setShowStatusAction(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Setujui Penggunaan Aula
                </button>
                <button
                  onClick={() => {
                    setTargetStatus('DITOLAK');
                    setShowStatusAction(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Tolak Pengajuan
                </button>
              </>
            )}

            {data.status === 'DISETUJUI' && (
              <button
                onClick={() => {
                  setTargetStatus('SELESAI');
                  setShowStatusAction(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                Tandai Kegiatan Selesai
              </button>
            )}
          </div>

          {showStatusAction && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Petugas (Opsional) untuk status: <span className="text-emerald-600">{targetStatus}</span>
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Tulis catatan persetujuan atau alasan penolakan..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowStatusAction(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleActionConfirm}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Konfirmasi Update Status
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
