import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CarBorrowing, StatusHistoryItem } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { subscribeStatusHistory } from '../../services/db';
import {
  Car,
  Calendar,
  Clock,
  User,
  Phone,
  Printer,
  History,
  CheckCircle2,
  XCircle,
  Flag,
  FileText,
  Camera,
  AlertCircle,
} from 'lucide-react';

interface CarDetailModalProps {
  data: CarBorrowing | null;
  onClose: () => void;
  onPrint: (item: CarBorrowing) => void;
  onUpdateStatus: (
    item: CarBorrowing,
    newStatus: CarBorrowing['status'],
    note?: string
  ) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  data,
  onClose,
  onPrint,
  onUpdateStatus,
}) => {
  const { role } = useAuth();
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [showStatusAction, setShowStatusAction] = useState(false);
  const [targetStatus, setTargetStatus] = useState<CarBorrowing['status'] | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition shrink-0"
        >
          <Printer className="w-4 h-4" /> Cetak Dokumen A4
        </button>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Data Pemohon & Kendaraan */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Data Pemohon & Unit
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Pemohon</span>
                <span className="font-bold text-slate-800">{data.userNama}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unit Kerja</span>
                <span className="font-bold text-slate-800">{data.userUnit}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" /> Kendaraan & Pengemudi
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Armada Mobil:</span>
                <span className="font-bold text-slate-900">{data.vehicleNama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Polisi:</span>
                <span className="font-bold text-slate-900">{data.vehicleNoPol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pengemudi:</span>
                <span className="font-bold text-slate-900">{data.driverNama} ({data.driverHp})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kondisi BBM:</span>
                <span className="font-bold text-blue-600">{data.bbmPercent || 0}% Tanki</span>
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal & Agenda */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Jadwal & Kegiatan
            </h4>
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Agenda Kegiatan</span>
                <span className="font-bold text-slate-900 text-xs">{data.kegiatan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tujuan / Rute</span>
                <span className="font-medium text-slate-800">{data.tujuanRute}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Pinjam</span>
                  <span className="font-bold text-slate-900">{data.tanggalPinjam}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Waktu</span>
                  <span className="font-bold text-slate-900">{data.jamBerangkat} - {data.perkiraanKembali} WIB</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">KM Awal / Perkiraan</span>
                <span className="font-medium text-slate-700">{data.kmAwal || '-'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Pejabat Penyetuju
            </h4>
            <p className="text-slate-700">
              <strong>{data.disetujuiOleh || 'Kepala Sekolah / Waka Sarpras'}</strong>
            </p>
            <p className="text-slate-500 text-[11px]">{data.disetujuiJabatan || 'SMKN 1 Tegalsari'}</p>
          </div>
        </div>
      </div>

      {/* 4 Photos Condition (Only shown if photos were provided) */}
      {(data.fotoDepan || data.fotoKanan || data.fotoKiri || data.fotoBelakang) && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" /> Dokumentasi Kondisi Fisik (4 Sisi)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-slate-200 rounded-xl p-2 text-center bg-slate-50">
              <span className="text-[10px] font-bold text-slate-600 mb-1 block">Foto Depan</span>
              <div className="h-28 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                {data.fotoDepan ? (
                  <img src={data.fotoDepan} alt="Depan" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-[10px]">Tidak ada foto</span>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-2 text-center bg-slate-50">
              <span className="text-[10px] font-bold text-slate-600 mb-1 block">Samping Kanan</span>
              <div className="h-28 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                {data.fotoKanan ? (
                  <img src={data.fotoKanan} alt="Kanan" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-[10px]">Tidak ada foto</span>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-2 text-center bg-slate-50">
              <span className="text-[10px] font-bold text-slate-600 mb-1 block">Samping Kiri</span>
              <div className="h-28 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                {data.fotoKiri ? (
                  <img src={data.fotoKiri} alt="Kiri" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-[10px]">Tidak ada foto</span>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-2 text-center bg-slate-50">
              <span className="text-[10px] font-bold text-slate-600 mb-1 block">Foto Belakang</span>
              <div className="h-28 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                {data.fotoBelakang ? (
                  <img src={data.fotoBelakang} alt="Belakang" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-[10px]">Tidak ada foto</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 27: Status History Audit Timeline */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Riwayat Status & Catatan
        </h4>
        {history.length === 0 ? (
          <p className="text-slate-400 text-xs italic">Belum ada catatan riwayat perubahan status.</p>
        ) : (
          <div className="space-y-3 pl-2 border-l-2 border-blue-200">
            {history.map((h) => (
              <div key={h.id} className="relative pl-4 text-xs">
                <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{h.statusBaru}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Diubah oleh: <strong>{h.userNama}</strong>
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

      {/* Action Buttons & Status Changer */}
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
                  Setujui Pengajuan
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
                Tandai Peminjaman Selesai
              </button>
            )}
          </div>

          {showStatusAction && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Catatan Petugas (Opsional) untuk status: <span className="text-blue-600">{targetStatus}</span>
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Tulis catatan jika ada (alasan penolakan atau keterangan pengembalian)..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Konfirmasi Update Status
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close button */}
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
