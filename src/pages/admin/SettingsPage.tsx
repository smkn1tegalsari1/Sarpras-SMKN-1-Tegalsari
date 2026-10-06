import React, { useState } from 'react';
import { SchoolSettings } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  Settings,
  Building2,
  Upload,
  CheckCircle,
  FileSignature,
  Save,
  Image,
} from 'lucide-react';

interface SettingsPageProps {
  settings: SchoolSettings;
  onUpdated: (newSettings: SchoolSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdated }) => {
  const [namaSekolah, setNamaSekolah] = useState(settings.namaSekolah || 'SMK NEGERI 1 TEGALSARI');
  const [instansi, setInstansi] = useState(settings.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR');
  const [dinas, setDinas] = useState(settings.dinas || 'DINAS PENDIDIKAN');
  const [alamat, setAlamat] = useState(settings.alamat || '');
  const [telepon, setTelepon] = useState(settings.telepon || '');
  const [email, setEmail] = useState(settings.email || '');
  const [website, setWebsite] = useState(settings.website || 'smkn1tegalsari.sch.id');

  // Logo upload
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [namaPejabat, setNamaPejabat] = useState(settings.namaPejabat || '');
  const [jabatanPejabat, setJabatanPejabat] = useState(settings.jabatanPejabat || '');
  const [nipPejabat, setNipPejabat] = useState(settings.nipPejabat || '');
  const [tandaTanganUrl, setTandaTanganUrl] = useState(settings.tandaTanganUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    const payload: SchoolSettings = {
      namaSekolah,
      instansi,
      dinas,
      alamat,
      telepon,
      email,
      website,
      logoUrl,
      namaPejabat,
      jabatanPejabat,
      nipPejabat,
      tandaTanganUrl,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'settings', 'general'), payload, { merge: true });
      onUpdated(payload);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pengaturan Identitas & Administrasi Sekolah
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              Kop & Pejabat
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi informasi resmi SMKN 1 Tegalsari untuk kop surat formulir dan laporan A4.
          </p>
        </div>

        {successMsg && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4" /> Pengaturan Tersimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8 text-xs">
        {/* Identitas Instansi */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" /> 1. Identitas Lembaga & Kop Surat
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Instansi *</label>
              <input
                type="text"
                required
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Dinas Pendidikan *</label>
              <input
                type="text"
                required
                value={dinas}
                onChange={(e) => setDinas(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Resmi Sekolah *</label>
              <input
                type="text"
                required
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Sekolah</label>
              <textarea
                rows={2}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Upload Logo Sekolah Resmi (Demanded specifically in Section 2) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Image className="w-4 h-4 text-blue-600" /> 2. Logo Resmi Sekolah
          </h3>
          <p className="text-[11px] text-slate-500">
            Sesuai petunjuk, logo resmi sekolah diunggah melalui formulir ini (format PNG transparan disarankan).
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center px-2">Belum ada logo</span>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition">
                <Upload className="w-4 h-4" /> Unggah File Logo Resmi
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setLogoUrl)}
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="block text-[11px] text-rose-600 hover:underline"
                >
                  Hapus Logo
                </button>
              )}
              <p className="text-[10px] text-slate-400">
                Logo ini akan otomatis dicetak pada Kop Formulir Peminjaman Mobil & Penggunaan Aula A4.
              </p>
            </div>
          </div>
        </div>

        {/* Pejabat Penandatangan */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileSignature className="w-4 h-4 text-blue-600" /> 3. Pejabat Pengesah & Tanda Tangan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pejabat *</label>
              <input
                type="text"
                required
                value={namaPejabat}
                onChange={(e) => setNamaPejabat(e.target.value)}
                placeholder="Contoh: Drs. H. Bambang Wijanarko, M.Pd."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jabatan *</label>
              <input
                type="text"
                required
                value={jabatanPejabat}
                onChange={(e) => setJabatanPejabat(e.target.value)}
                placeholder="Contoh: Kepala Sekolah / Waka Sarpras"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Pejabat</label>
              <input
                type="text"
                value={nipPejabat}
                onChange={(e) => setNipPejabat(e.target.value)}
                placeholder="Contoh: 19680512 199303 1 008"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>

          {/* Upload Tanda Tangan */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-36 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {tandaTanganUrl ? (
                <img src={tandaTanganUrl} alt="TTD" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-slate-400 text-center">Belum ada tanda tangan</span>
              )}
            </div>
            <div className="space-y-2 flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 transition">
                <Upload className="w-4 h-4 text-blue-600" /> Unggah Gambar Tanda Tangan (Opsional)
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setTandaTanganUrl)}
                />
              </label>
              {tandaTanganUrl && (
                <button
                  type="button"
                  onClick={() => setTandaTanganUrl('')}
                  className="block text-[11px] text-rose-600 hover:underline"
                >
                  Hapus Tanda Tangan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
};
