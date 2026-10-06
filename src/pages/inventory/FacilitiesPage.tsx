import React, { useState } from 'react';
import { Facility, ConditionStatus } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Wrench, Plus, Search, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

interface FacilitiesPageProps {
  facilities: Facility[];
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({ facilities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);

  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState<number>(1);
  const [kondisi, setKondisi] = useState<ConditionStatus>('BAIK');
  const [lokasi, setLokasi] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = () => {
    setEditingFacility(null);
    setNama('');
    setJumlah(10);
    setKondisi('BAIK');
    setLokasi('Gudang Sarpras / Aula');
    setKeterangan('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Facility) => {
    setEditingFacility(f);
    setNama(f.nama);
    setJumlah(f.jumlah);
    setKondisi(f.kondisi);
    setLokasi(f.lokasi);
    setKeterangan(f.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return;

    setIsSaving(true);
    try {
      if (editingFacility) {
        const ref = doc(db, 'facilities', editingFacility.id);
        await updateDoc(ref, {
          nama,
          jumlah: Number(jumlah),
          kondisi,
          lokasi,
          keterangan,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const ref = doc(collection(db, 'facilities'));
        await setDoc(ref, {
          id: ref.id,
          nama,
          jumlah: Number(jumlah),
          kondisi,
          lokasi,
          keterangan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'facilities');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!facilityToDelete) return;
    try {
      await deleteDoc(doc(db, 'facilities', facilityToDelete.id));
      setFacilityToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `facilities/${facilityToDelete.id}`);
    }
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchSearch =
      f.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCond = conditionFilter === 'ALL' || f.kondisi === conditionFilter;
    return matchSearch && matchCond;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data Fasilitas & Perlengkapan Sarpras
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {facilities.length} Item
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaris kursi, meja, sound system, proyektor, dan perlengkapan SMKN 1 Tegalsari.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Fasilitas
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari fasilitas, perlengkapan, lokasi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        >
          <option value="ALL">Semua Kondisi</option>
          <option value="BAIK">Baik</option>
          <option value="RUSAK RINGAN">Rusak Ringan</option>
          <option value="RUSAK BERAT">Rusak Berat</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredFacilities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada data fasilitas yang tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Nama Fasilitas / Perlengkapan</th>
                  <th className="px-5 py-3.5">Jumlah Unit</th>
                  <th className="px-5 py-3.5">Kondisi Fisik</th>
                  <th className="px-5 py-3.5">Lokasi Penyimpanan</th>
                  <th className="px-5 py-3.5">Keterangan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacilities.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">{f.nama}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-800">
                      {f.jumlah} Unit
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={f.kondisi} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                      {f.lokasi}
                    </td>

                    <td className="px-5 py-4 max-w-xs truncate text-slate-600">
                      {f.keterangan || '-'}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFacilityToDelete(f)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Fasilitas"
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
        isOpen={!!facilityToDelete}
        onClose={() => setFacilityToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={facilityToDelete?.nama}
        title="Hapus Data Fasilitas & Inventaris"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}
        subtitle="Inventarisasi perlengkapan dan sarana kegiatan"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Fasilitas / Aset *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Wireless Microphone Shure (Set)"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Unit *</label>
              <input
                type="number"
                min="1"
                required
                value={jumlah}
                onChange={(e) => setJumlah(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Fisik</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as ConditionStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BAIK">BAIK</option>
                <option value="RUSAK RINGAN">RUSAK RINGAN</option>
                <option value="RUSAK BERAT">RUSAK BERAT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lokasi Penyimpanan</label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Gudang Sarpras Gedung Aula"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Spesifikasi</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Spesifikasi teknis, nomor seri, dll..."
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
              {isSaving ? 'Menyimpan...' : 'Simpan Fasilitas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
