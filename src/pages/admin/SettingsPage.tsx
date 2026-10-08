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
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || ''); // Logo Sekolah (Kanan)
  const [logoProvinsiUrl, setLogoProvinsiUrl] = useState(settings.logoProvinsiUrl || ''); // Logo Provinsi (Kiri)

  // Pejabat 1: Kepala Sekolah / Waka Sarpras
  const [namaPejabat, setNamaPejabat] = useState(settings.namaPejabat || '');
  const [jabatanPejabat, setJabatanPejabat] = useState(settings.jabatanPejabat || '');
  const [nipPejabat, setNipPejabat] = useState(settings.nipPejabat || '');
  const [tandaTanganUrl, setTandaTanganUrl] = useState(settings.tandaTanganUrl || '');

  // Pejabat 2: Pengelola Sarana & Prasarana
  const [namaPengelola, setNamaPengelola] = useState(
    settings.namaPengelola || 'Moch. Nurul Huda, S.Pd.'
  );
  const [jabatanPengelola, setJabatanPengelola] = useState(
    settings.jabatanPengelola || 'Pengelola Sarana & Prasarana'
  );
  const [nipPengelola, setNipPengelola] = useState(
    settings.nipPengelola || '19850314 201101 1 012'
  );
  const [tandaTanganPengelolaUrl, setTandaTanganPengelolaUrl] = useState(
    settings.tandaTanganPengelolaUrl || ''
  );

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
      logoProvinsiUrl,
      namaPejabat,
      jabatanPejabat,
      nipPejabat,
      tandaTanganUrl,
      namaPengelola,
      jabatanPengelola,
      nipPengelola,
      tandaTanganPengelolaUrl,
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

        {/* Upload Logo Kop Surat: Provinsi (Kiri) & Sekolah (Kanan) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-600" /> 2. Pengaturan Logo Kop Surat & Laporan
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Format PNG transparan atau JPG disarankan (Maks 2MB)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Sesuai standar administrasi, kop surat laporan dan bukti peminjaman menampilkan <strong>Logo Provinsi di sebelah KIRI</strong> dan <strong>Logo Sekolah di sebelah KANAN</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KARTU 1: LOGO PROVINSI (SEBELAH KIRI) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Logo Pemerintah Provinsi</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Posisi: KIRI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Lambang Pemerintah Provinsi Jawa Timur / Dinas Pendidikan. Diletakkan di sebelah kiri kop surat.
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {logoProvinsiUrl ? (
                      <img
                        src={logoProvinsiUrl}
                        alt="Logo Provinsi"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <span className="text-[9px] text-slate-400 block leading-tight font-medium">
                          Belum ada Logo Provinsi
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition shadow-2xs">
                      <Upload className="w-3.5 h-3.5" /> Unggah Logo Provinsi
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setLogoProvinsiUrl)}
                      />
                    </label>

                    {logoProvinsiUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoProvinsiUrl('')}
                        className="block text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Hapus Logo Provinsi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KARTU 2: LOGO SEKOLAH (SEBELAH KANAN) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Logo Resmi Sekolah</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Posisi: KANAN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Lambang resmi SMK Negeri 1 Tegalsari. Diletakkan di sebelah kanan kop surat.
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <span className="text-[9px] text-slate-400 block leading-tight font-medium">
                          Belum ada Logo Sekolah
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-2xs">
                      <Upload className="w-3.5 h-3.5" /> Unggah Logo Sekolah
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
                        className="block text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Hapus Logo Sekolah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pratinjau Kop Surat Live */}
          <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pratinjau Tata Letak Kop Surat (Laporan & Dokumen Resmi):
            </div>
            <div className="border-b-4 border-double border-slate-900 pb-3 relative text-center font-serif bg-slate-50/50 p-4 rounded-xl">
              {/* Logo Kiri (Provinsi) */}
              <div className="absolute left-3 top-3 w-14 h-14 rounded-lg flex items-center justify-center">
                {logoProvinsiUrl ? (
                  <img src={logoProvinsiUrl} alt="Logo Provinsi" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-[8px] text-slate-400 font-sans p-0.5 leading-tight">
                    <span>Logo</span>
                    <span>Provinsi</span>
                    <span className="text-[7px] text-amber-600 font-bold">(Kiri)</span>
                  </div>
                )}
              </div>

              {/* Logo Kanan (Sekolah) */}
              <div className="absolute right-3 top-3 w-14 h-14 rounded-lg flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-[8px] text-slate-400 font-sans p-0.5 leading-tight">
                    <span>Logo</span>
                    <span>Sekolah</span>
                    <span className="text-[7px] text-blue-600 font-bold">(Kanan)</span>
                  </div>
                )}
              </div>

              {/* Teks Lembaga di Tengah */}
              <div className="px-16 sm:px-20 text-center">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                  {instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
                </h4>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                  {dinas || 'DINAS PENDIDIKAN'}
                </h4>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-950 mt-0.5 leading-tight">
                  {namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
                </h2>
                <p className="text-[9px] text-slate-600 mt-1 font-sans leading-tight">
                  {alamat || 'Jl. KH. Syafi\'i No. 01, Dusun Padangbulan, Tegalrejo, Tegalsari, Banyuwangi'}
                </p>
                <p className="text-[9px] text-slate-500 font-sans leading-tight">
                  Telp: {telepon || '(0333) 845999'} | Email: {email || 'smkn1tegalsari@yahoo.co.id'} | Web: {website || 'smkn1tegalsari.sch.id'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pejabat Penandatangan Laporan & Dokumen */}
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-blue-600" /> 3. Pejabat Pengesah & Tanda Tangan Laporan
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Data pejabat yang tercetak pada bagian bawah seluruh lembar laporan resmi: Kepala Sekolah/Waka Sarpras berdampingan dengan Pengelola Sarana & Prasarana.
            </p>
          </div>

          {/* 3.1 KEPALA SEKOLAH / WAKA SARPRAS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Pejabat 1: Kepala Sekolah / Waka Sarpras (Pihak Mengetahui)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Kolom Kiri Laporan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pejabat *</label>
                <input
                  type="text"
                  required
                  value={namaPejabat}
                  onChange={(e) => setNamaPejabat(e.target.value)}
                  placeholder="Contoh: Drs. H. Bambang Wijanarko, M.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan Pejabat *</label>
                <input
                  type="text"
                  required
                  value={jabatanPejabat}
                  onChange={(e) => setJabatanPejabat(e.target.value)}
                  placeholder="Contoh: Kepala SMK Negeri 1 Tegalsari / Waka Sarpras"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Pejabat</label>
                <input
                  type="text"
                  value={nipPejabat}
                  onChange={(e) => setNipPejabat(e.target.value)}
                  placeholder="Contoh: 19680512 199303 1 008"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>
            </div>

            {/* Upload Tanda Tangan Pejabat 1 */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {tandaTanganUrl ? (
                  <img src={tandaTanganUrl} alt="TTD Pejabat" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-[9px] text-slate-400 text-center px-1">Tanpa TTD digital</span>
                )}
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition">
                  <Upload className="w-3.5 h-3.5" /> Unggah Tanda Tangan Pejabat 1
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
                    className="block text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Hapus Tanda Tangan
                  </button>
                )}
                <p className="text-[10px] text-slate-400">
                  Opsional. Format PNG transparan disarankan agar tanda tangan menyatu rapi dengan dokumen.
                </p>
              </div>
            </div>
          </div>

          {/* 3.2 PENGELOLA SARANA & PRASARANA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Pejabat 2: Pengelola Sarana & Prasarana
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Kolom Kanan Laporan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pengelola Sarpras *</label>
                <input
                  type="text"
                  required
                  value={namaPengelola}
                  onChange={(e) => setNamaPengelola(e.target.value)}
                  placeholder="Contoh: Moch. Nurul Huda, S.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan *</label>
                <input
                  type="text"
                  required
                  value={jabatanPengelola}
                  onChange={(e) => setJabatanPengelola(e.target.value)}
                  placeholder="Contoh: Pengelola Sarana & Prasarana"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP Pengelola</label>
                <input
                  type="text"
                  value={nipPengelola}
                  onChange={(e) => setNipPengelola(e.target.value)}
                  placeholder="Contoh: 19850314 201101 1 012"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                />
              </div>
            </div>

            {/* Upload Tanda Tangan Pengelola Sarpras */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-16 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {tandaTanganPengelolaUrl ? (
                  <img src={tandaTanganPengelolaUrl} alt="TTD Pengelola" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-[9px] text-slate-400 text-center px-1">Tanpa TTD digital</span>
                )}
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition">
                  <Upload className="w-3.5 h-3.5" /> Unggah Tanda Tangan Pengelola Sarpras
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setTandaTanganPengelolaUrl)}
                  />
                </label>
                {tandaTanganPengelolaUrl && (
                  <button
                    type="button"
                    onClick={() => setTandaTanganPengelolaUrl('')}
                    className="block text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Hapus Tanda Tangan
                  </button>
                )}
                <p className="text-[10px] text-slate-400">
                  Opsional. Format PNG transparan disarankan. Ditampilkan di samping tanda tangan Kepala Sekolah pada laporan.
                </p>
              </div>
            </div>
          </div>

          {/* Pratinjau Tanda Tangan Laporan Live */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pratinjau Tanda Tangan Bawah Pada Seluruh Laporan:
            </div>
            <div className="grid grid-cols-2 text-center text-xs font-serif p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-600">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-0.5">{jabatanPejabat || 'Kepala Sekolah / Waka Sarpras'}</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {tandaTanganUrl ? (
                    <img src={tandaTanganUrl} alt="TTD" className="h-14 object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-300 italic">(Tanda Tangan)</span>
                  )}
                </div>
                <p className="font-bold underline text-slate-950">{namaPejabat || 'Nama Pejabat 1'}</p>
                {nipPejabat && <p className="text-[10px] text-slate-500 font-sans">NIP. {nipPejabat}</p>}
              </div>

              <div>
                <p className="text-slate-600">
                  Banyuwangi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-bold text-slate-900 mt-0.5">{jabatanPengelola || 'Pengelola Sarana & Prasarana'}</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {tandaTanganPengelolaUrl ? (
                    <img src={tandaTanganPengelolaUrl} alt="TTD Pengelola" className="h-14 object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-300 italic">(Tanda Tangan)</span>
                  )}
                </div>
                <p className="font-bold underline text-slate-950">{namaPengelola || 'Pengelola Sarpras'}</p>
                {nipPengelola ? (
                  <p className="text-[10px] text-slate-500 font-sans">NIP. {nipPengelola}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-sans">NIP. -</p>
                )}
              </div>
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
