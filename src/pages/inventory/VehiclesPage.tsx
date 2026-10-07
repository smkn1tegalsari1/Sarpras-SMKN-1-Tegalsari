import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Car,
} from 'lucide-react';

interface VehiclesPageProps {
  vehicles: Vehicle[];
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ vehicles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState('');
  const [nomorPolisi, setNomorPolisi] = useState('');
  const [tahun, setTahun] = useState('2021');
  const [kapasitas, setKapasitas] = useState<number>(7);
  const [status, setStatus] = useState<VehicleStatus>('TERSEDIA');
  const [keterangan, setKeterangan] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successNotif, setSuccessNotif] = useState<string | null>(null);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessNotif(msg);
    setErrorNotif(null);
    setTimeout(() => setSuccessNotif(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorNotif(msg);
    setTimeout(() => setErrorNotif(null), 5000);
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setKode(`MOB-${String(vehicles.length + 1).padStart(2, '0')}`);
    setNama('');
    setJenis('Minibus / MPV');
    setNomorPolisi('');
    setTahun('2022');
    setKapasitas(7);
    setStatus('TERSEDIA');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setKode(v.kode);
    setNama(v.nama);
    setJenis(v.jenis);
    setNomorPolisi(v.nomorPolisi);
    setTahun(v.tahun);
    setKapasitas(v.kapasitas);
    setStatus(v.status);
    setKeterangan(v.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode || !nama || !nomorPolisi) return;

    setIsSaving(true);
    try {
      if (editingVehicle) {
        const ref = doc(db, 'vehicles', editingVehicle.id);
        await updateDoc(ref, {
          kode,
          nama,
          jenis,
          nomorPolisi,
          tahun,
          kapasitas: Number(kapasitas),
          status,
          keterangan,
          updatedAt: new Date().toISOString(),
        });
        showSuccess(`Data kendaraan "${nama}" berhasil diperbarui.`);
      } else {
        const ref = doc(collection(db, 'vehicles'));
        await setDoc(ref, {
          id: ref.id,
          kode,
          nama,
          jenis,
          nomorPolisi,
          tahun,
          kapasitas: Number(kapasitas),
          status,
          keterangan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showSuccess(`Kendaraan baru "${nama}" (${nomorPolisi}) berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showError(`Gagal menyimpan data armada: ${err?.message || 'Terjadi kesalahan'}`);
      handleFirestoreError(err, OperationType.WRITE, 'vehicles');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteDoc(doc(db, 'vehicles', vehicleToDelete.id));
      showSuccess(`Armada "${vehicleToDelete.nama}" (${vehicleToDelete.nomorPolisi}) berhasil dihapus.`);
      setVehicleToDelete(null);
    } catch (err: any) {
      showError(`Gagal menghapus kendaraan: ${err?.message || 'Terjadi kesalahan'}`);
      handleFirestoreError(err, OperationType.DELETE, `vehicles/${vehicleToDelete.id}`);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nomorPolisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Kendaraan Operasional
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {vehicles.length} Armada
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaris mobil dan kendaraan dinas SMKN 1 Tegalsari.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Kendaraan
        </button>
      </div>

      {/* Alert Notifikasi Sukses / Error */}
      {successNotif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotif}</span>
        </div>
      )}
      {errorNotif && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotif}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari armada, plat nomor, kode..."
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
          <option value="SERVIS">Servis</option>
          <option value="TIDAK AKTIF">Tidak Aktif</option>
        </select>
      </div>

      {/* Vehicles Grid / Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada kendaraan yang tersedia atau sesuai pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Kode & Nama Kendaraan</th>
                  <th className="px-5 py-3.5">Nomor Polisi</th>
                  <th className="px-5 py-3.5">Jenis & Tahun</th>
                  <th className="px-5 py-3.5">Kapasitas</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Keterangan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{v.nama}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Kode: {v.kode}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                        {v.nomorPolisi}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{v.jenis}</p>
                      <p className="text-[11px] text-slate-500">Tahun {v.tahun}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{v.kapasitas} Kursi</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={v.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 max-w-xs truncate text-slate-600">
                      {v.keterangan || '-'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Kendaraan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVehicleToDelete(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Kendaraan"
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
        isOpen={!!vehicleToDelete}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={vehicleToDelete ? `${vehicleToDelete.nama} (${vehicleToDelete.nomorPolisi})` : undefined}
        title="Hapus Data Kendaraan Operasional"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru'}
        subtitle="Kelola informasi armada mobil dinas SMKN 1 Tegalsari"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Kendaraan *</label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="MOB-01"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Polisi (Plat) *</label>
              <input
                type="text"
                required
                value={nomorPolisi}
                onChange={(e) => setNomorPolisi(e.target.value)}
                placeholder="P 1234 XX"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama / Merk Kendaraan *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Toyota HiAce Commuter Bus"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kendaraan</label>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                placeholder="Microbus / MPV"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun</label>
              <input
                type="text"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                placeholder="2022"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas (Orang)</label>
              <input
                type="number"
                min="1"
                value={kapasitas}
                onChange={(e) => setKapasitas(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Ketersediaan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TERSEDIA">TERSEDIA</option>
              <option value="DIGUNAKAN">DIGUNAKAN</option>
              <option value="SERVIS">SERVIS</option>
              <option value="TIDAK AKTIF">TIDAK AKTIF</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Kondisi Khusus</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Keterangan peruntukan kendaraan, lokasi parkir, dll..."
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
              {isSaving ? 'Menyimpan...' : 'Simpan Kendaraan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
