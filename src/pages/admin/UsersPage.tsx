import React, { useState } from 'react';
import { UserProfile, UserRole, UnitKerja } from '../../types';
import { Modal } from '../../components/common/Modal';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Users,
  Plus,
  Search,
  Edit2,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  Lock,
  UserCheck,
} from 'lucide-react';

interface UsersPageProps {
  users: UserProfile[];
  units: UnitKerja[];
}

export const UsersPage: React.FC<UsersPageProps> = ({ users, units }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('pemohon');
  const [unitNama, setUnitNama] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [isSaving, setIsSaving] = useState(false);

  // Modal Reset Password Khusus
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  // Reveal password map in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setNama('');
    setPassword('123456');
    setShowPassword(true);
    setRole('pemohon');
    setUnitNama(units[0]?.nama || 'Teknik Komputer & Jaringan (TKJ)');
    setStatus('aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setUsername(u.username || u.email?.split('@')[0] || '');
    setNama(u.nama);
    setPassword(u.password || '');
    setShowPassword(false);
    setRole(u.role);
    setUnitNama(u.unitNama || units[0]?.nama || '');
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const openResetPasswordModal = (u: UserProfile) => {
    setUserToResetPassword(u);
    setNewPassword('123456');
    setShowNewPassword(true);
    setIsPasswordModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !nama.trim()) return;

    setIsSaving(true);
    try {
      if (editingUser) {
        const ref = doc(db, 'users', editingUser.id);
        const updatePayload: Record<string, any> = {
          username: cleanUsername,
          nama: nama.trim(),
          role,
          unitNama,
          status,
          updatedAt: new Date().toISOString(),
        };
        // Update password if provided
        if (password.trim()) {
          updatePayload.password = password.trim();
        }
        await updateDoc(ref, updatePayload);
        showSuccess(`Pengguna "${cleanUsername}" berhasil diperbarui.`);
      } else {
        // Check if username already exists in current list
        const exists = users.some(
          (u) => u.username?.toLowerCase() === cleanUsername
        );
        if (exists) {
          alert(`Username "${cleanUsername}" sudah digunakan. Silakan gunakan username lain.`);
          setIsSaving(false);
          return;
        }

        const newUid = 'usr-' + Date.now();
        const ref = doc(db, 'users', newUid);
        await setDoc(ref, {
          id: newUid,
          uid: newUid,
          username: cleanUsername,
          password: password.trim() || '123456',
          nama: nama.trim(),
          email: `${cleanUsername}@smkn1tegalsari.sch.id`,
          role,
          unitNama,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showSuccess(`Pengguna baru "${cleanUsername}" berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword || !newPassword.trim()) return;

    setIsSavingPassword(true);
    try {
      const ref = doc(db, 'users', userToResetPassword.id);
      await updateDoc(ref, {
        password: newPassword.trim(),
        updatedAt: new Date().toISOString(),
      });
      showSuccess(
        `Password untuk pengguna "${userToResetPassword.username || userToResetPassword.nama}" berhasil diubah.`
      );
      setIsPasswordModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userToResetPassword.id}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus akun pengguna "${u.username || u.nama}"?`
      )
    )
      return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
      showSuccess(`Pengguna "${u.username || u.nama}" berhasil dihapus.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${u.id}`);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessNotif(msg);
    setTimeout(() => setSuccessNotif(null), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const uName = (u.username || u.email?.split('@')[0] || '').toLowerCase();
    const fName = (u.nama || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchSearch = uName.includes(query) || fName.includes(query);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Pengguna (Username & Password)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
              {users.length} Akun Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah dan atur akun staf/guru menggunakan Username & Password langsung tanpa perlu email. Admin dapat merubah password jika lupa.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Alert Notifikasi Sukses */}
      {successNotif && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotif}</span>
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
            placeholder="Cari berdasarkan username atau nama lengkap..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
        >
          <option value="ALL">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="sarpras">Petugas Sarpras</option>
          <option value="pemohon">Pemohon</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Nama Lengkap</th>
              <th className="px-5 py-3.5">Role Akses</th>
              <th className="px-5 py-3.5">Unit Kerja / Jurusan</th>
              <th className="px-5 py-3.5">Password</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 italic">
                  Belum ada data pengguna yang cocok.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const uUsername = u.username || u.email?.split('@')[0] || '-';
                const isPwVisible = !!visiblePasswords[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        @{uUsername}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{u.nama}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : u.role === 'sarpras'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-700">
                      {u.unitNama || '-'}
                    </td>

                    {/* Password column with peek button */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-slate-700">
                        <span>
                          {isPwVisible
                            ? u.password || '(default 123456)'
                            : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition"
                          title={isPwVisible ? 'Sembunyikan' : 'Lihat'}
                        >
                          {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Khusus Ubah Password jika lupa */}
                        <button
                          onClick={() => openResetPasswordModal(u)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 flex items-center gap-1 transition"
                          title="Ubah / Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          Ubah Password
                        </button>

                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru'}
        subtitle="Kelola username, password, dan hak akses internal SMKN 1 Tegalsari"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Username * (Untuk Login)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                placeholder="contoh: budi_guru / sarpras01"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Gunakan huruf kecil tanpa spasi. Pengguna akan masuk menggunakan username ini.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengguna *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Budi Santoso, M.Kom."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password Masuk *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password (misal: 123456)"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Pengguna</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pemohon">Pemohon (Guru / Staf)</option>
                <option value="sarpras">Petugas Sarpras</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Unit Kerja / Jurusan</label>
            <select
              value={unitNama}
              onChange={(e) => setUnitNama(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.nama}>
                  {u.nama}
                </option>
              ))}
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
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Akun Pengguna'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Khusus Reset / Ganti Password jika Lupa */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ubah / Reset Password Pengguna"
        subtitle={`Pengguna: ${userToResetPassword?.nama} (@${userToResetPassword?.username || userToResetPassword?.email?.split('@')[0]})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            Admin dapat mengatur ulang password pengguna ini jika lupa. Pengguna dapat langsung login dengan password baru ini.
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Masukkan Password Baru *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Contoh: 123456 atau password baru"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
            >
              {isSavingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
