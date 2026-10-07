import React, { useState } from 'react';
import { UnitKerja } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Briefcase, Plus, Search, Edit2, Power, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UnitsPageProps {
  units: UnitKerja[];
}

export const UnitsPage: React.FC<UnitsPageProps> = ({ units }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitKerja | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitKerja | null>(null);

  const [nama, setNama] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
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
    setEditingUnit(null);
    setNama('');
    setStatus('aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UnitKerja) => {
    setEditingUnit(u);
    setNama(u.nama);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    setIsSaving(true);
    try {
      if (editingUnit) {
        const ref = doc(db, 'units', editingUnit.id);
        await updateDoc(ref, {
          nama,
          status,
          updatedAt: new Date().toISOString(),
        });
        showSuccess(`Unit kerja "${nama}" berhasil diperbarui.`);
      } else {
        const ref = doc(collection(db, 'units'));
        await setDoc(ref, {
          id: ref.id,
          nama,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showSuccess(`Unit kerja "${nama}" berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showError(`Gagal menyimpan unit kerja: ${err?.message || 'Terjadi kesalahan'}`);
      handleFirestoreError(err, OperationType.WRITE, 'units');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (u: UnitKerja) => {
    const newStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await updateDoc(doc(db, 'units', u.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      showSuccess(`Status unit "${u.nama}" berhasil diubah menjadi ${newStatus}.`);
    } catch (err: any) {
      showError(`Gagal mengubah status: ${err?.message || 'Terjadi kesalahan'}`);
      handleFirestoreError(err, OperationType.UPDATE, `units/${u.id}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    try {
      await deleteDoc(doc(db, 'units', unitToDelete.id));
      showSuccess(`Unit kerja "${unitToDelete.nama}" berhasil dihapus.`);
      setUnitToDelete(null);
    } catch (err: any) {
      showError(`Gagal menghapus unit kerja: ${err?.message || 'Terjadi kesalahan'}`);
      handleFirestoreError(err, OperationType.DELETE, `units/${unitToDelete.id}`);
    }
  };

  const filteredUnits = units.filter((u) =>
    u.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Unit Kerja & Jurusan
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {units.length} Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola program keahlian, tata usaha, dan unit organisasi internal SMKN 1 Tegalsari.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Unit Kerja
        </button>
      </div>

      {/* Alert Notifikasi Sukses / Error */}
      {successNotif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotif}</span>
        </div>
      )}
      {errorNotif && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotif}</span>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari unit kerja atau jurusan..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3.5">Nama Unit Kerja / Program Keahlian</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Terdaftar Sejak</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUnits.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{u.nama}</span>
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 'aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {u.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString('id-ID')}
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Nama Unit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-1.5 rounded-lg transition ${
                        u.status === 'aktif'
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.status === 'aktif' ? 'Nonaktifkan Unit' : 'Aktifkan Unit'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUnitToDelete(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Unit Kerja"
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!unitToDelete}
        onClose={() => setUnitToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={unitToDelete?.nama}
        title="Hapus Unit Kerja"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
        subtitle="Struktur jurusan dan bagian di lingkungan SMKN 1 Tegalsari"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Unit / Program Keahlian *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Rekayasa Perangkat Lunak (RPL)"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
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
              {isSaving ? 'Menyimpan...' : 'Simpan Unit Kerja'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
