import React, { useState } from 'react';
import { Room, RoomStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { DoorOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface RoomsPageProps {
  rooms: Room[];
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ rooms }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kapasitas, setKapasitas] = useState<number>(100);
  const [lokasi, setLokasi] = useState('');
  const [status, setStatus] = useState<RoomStatus>('TERSEDIA');
  const [keterangan, setKeterangan] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingRoom(null);
    setKode(`R-${String(rooms.length + 1).padStart(2, '0')}`);
    setNama('');
    setKapasitas(100);
    setLokasi('Gedung Utama');
    setStatus('TERSEDIA');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Room) => {
    setEditingRoom(r);
    setKode(r.kode);
    setNama(r.nama);
    setKapasitas(r.kapasitas);
    setLokasi(r.lokasi);
    setStatus(r.status);
    setKeterangan(r.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode || !nama) return;

    setIsSaving(true);
    try {
      if (editingRoom) {
        const ref = doc(db, 'rooms', editingRoom.id);
        await updateDoc(ref, {
          kode,
          nama,
          kapasitas: Number(kapasitas),
          lokasi,
          status,
          keterangan,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const ref = doc(collection(db, 'rooms'));
        await setDoc(ref, {
          id: ref.id,
          kode,
          nama,
          kapasitas: Number(kapasitas),
          lokasi,
          status,
          keterangan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'rooms');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomToDelete.id));
      setRoomToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `rooms/${roomToDelete.id}`);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Ruangan & Gedung
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {rooms.length} Ruangan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar aula, ruang rapat, laboratorium, dan auditorium SMKN 1 Tegalsari.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Ruangan
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ruangan, lokasi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        >
          <option value="ALL">Semua Status</option>
          <option value="TERSEDIA">Tersedia</option>
          <option value="DIGUNAKAN">Digunakan</option>
          <option value="RENOVASI">Renovasi</option>
          <option value="TIDAK AKTIF">Tidak Aktif</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredRooms.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada ruangan yang tersedia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Kode & Nama Ruangan</th>
                  <th className="px-5 py-3.5">Lokasi Gedung</th>
                  <th className="px-5 py-3.5">Kapasitas</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Keterangan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{r.nama}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Kode: {r.kode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                      {r.lokasi}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-800">
                      {r.kapasitas} Orang
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 max-w-xs truncate text-slate-600">
                      {r.keterangan || '-'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRoomToDelete(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Ruangan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={roomToDelete?.nama}
        title="Hapus Data Ruangan / Gedung"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
        subtitle="Data sarana gedung dan ruangan SMKN 1 Tegalsari"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Ruangan *</label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="R-AULA-01"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas (Orang) *</label>
              <input
                type="number"
                min="1"
                required
                value={kapasitas}
                onChange={(e) => setKapasitas(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Ruangan *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Graha Utama Aula SMKN 1 Tegalsari"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Gedung / Lantai</label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Gedung A Lantai 2"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Ketersediaan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TERSEDIA">TERSEDIA</option>
              <option value="DIGUNAKAN">DIGUNAKAN</option>
              <option value="RENOVASI">RENOVASI</option>
              <option value="TIDAK AKTIF">TIDAK AKTIF</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Fasilitas Ruangan</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Dilengkapi sound system, proyektor, AC..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Ruangan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
