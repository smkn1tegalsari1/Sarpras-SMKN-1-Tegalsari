import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  listDriveFiles,
  uploadDriveFile,
  createDriveFolder,
  deleteDriveFile,
  DriveFile,
} from '../../services/drive';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Upload,
  FolderPlus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  HardDrive,
  Download,
  Filter,
  FileCheck,
} from 'lucide-react';

export const GoogleDrivePage: React.FC = () => {
  const { driveToken, connectGoogleDrive, userProfile } = useAuth();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Navigation state (Folder hierarchy)
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<{ id?: string; name: string }[]>([
    { id: undefined, name: 'Drive Saya' },
  ]);

  // Modals & User Confirmation
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Destructive Action Confirmation Dialog state (Mandatory per workspace skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (token = driveToken, folderId = currentFolderId) => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      let query = folderId ? `'${folderId}' in parents` : "'root' in parents";
      if (filterType === 'DOCS') {
        query += " and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType contains 'text/')";
      } else if (filterType === 'SHEETS') {
        query += " and (mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheet' or mimeType contains 'excel')";
      } else if (filterType === 'IMAGES') {
        query += " and mimeType contains 'image/'";
      }

      const res = await listDriveFiles(token, {
        q: query,
        pageSize: 50,
      });
      setFiles(res.files || []);
    } catch (err: any) {
      console.error('Fetch Drive files error:', err);
      setErrorMsg(err.message || 'Gagal memuat berkas Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driveToken) {
      fetchFiles(driveToken, currentFolderId);
    }
  }, [driveToken, currentFolderId, filterType]);

  const handleConnect = async () => {
    setErrorMsg(null);
    try {
      const token = await connectGoogleDrive();
      if (token) {
        setSuccessMsg('Berhasil menghubungkan Google Drive.');
        fetchFiles(token, currentFolderId);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyambungkan ke Google Drive.');
    }
  };

  const handleOpenFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderPath[index];
    setFolderPath((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveToken || !newFolderName.trim()) return;

    try {
      await createDriveFolder(driveToken, newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setIsFolderModalOpen(false);
      setSuccessMsg('Folder baru berhasil dibuat di Google Drive.');
      fetchFiles(driveToken, currentFolderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat folder.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !driveToken) return;

    setIsUploading(true);
    setUploadProgress(`Mengunggah "${file.name}"...`);
    try {
      await uploadDriveFile(driveToken, file, file.name, currentFolderId, file.type);
      setSuccessMsg(`Berkas "${file.name}" berhasil diunggah ke Google Drive.`);
      fetchFiles(driveToken, currentFolderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Explicit confirmation dialog handler for deletion (MANDATORY per Workspace skill)
  const confirmDelete = async () => {
    if (!driveToken || !fileToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(driveToken, fileToDelete.id);
      setSuccessMsg(`Berkas "${fileToDelete.name}" berhasil dihapus dari Google Drive.`);
      setFileToDelete(null);
      fetchFiles(driveToken, currentFolderId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus berkas.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = Number(bytes);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Integrasi Google Drive Sarpras
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola arsip dokumen peminjaman, surat dinas, foto kondisi sarpras, dan berkas inventaris langsung di Google Drive.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {driveToken ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-amber-500" /> Folder Baru
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" /> Unggah Berkas
              </button>
              <button
                onClick={() => fetchFiles(driveToken, currentFolderId)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                title="Segarkan"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Hubungkan ke Google Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">
            ✕
          </button>
        </div>
      )}

      {uploadProgress && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {!driveToken ? (
        /* Not Connected State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Hubungkan Akun Google Drive Anda
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Aplikasi SISARPRAS SMKN 1 Tegalsari terintegrasi dengan Google Drive API untuk mengelola, menyimpan, dan mengunduh berkas laporan, bukti fisik pengecekan pengembalian, dan dokumen resmi sekolah dengan izin dari pengguna.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleConnect}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sambungkan Google Drive</span>
            </button>
          </div>
        </div>
      ) : (
        /* Connected Drive Explorer */
        <div className="space-y-4">
          {/* Breadcrumb & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Breadcrumb Path */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 flex-wrap">
                {folderPath.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() => handleNavigateBreadcrumb(idx)}
                      className={`hover:text-blue-600 transition flex items-center gap-1 ${
                        idx === folderPath.length - 1 ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {idx === 0 && <HardDrive className="w-3.5 h-3.5" />}
                      <span>{item.name}</span>
                    </button>
                    {idx < folderPath.length - 1 && <span className="text-slate-400">/</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-600 overflow-x-auto">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === 'ALL' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('DOCS')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === 'DOCS' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Dokumen
                </button>
                <button
                  onClick={() => setFilterType('SHEETS')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === 'SHEETS' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Spreadsheet
                </button>
                <button
                  onClick={() => setFilterType('IMAGES')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === 'IMAGES' ? 'bg-white text-purple-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Foto / Gambar
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berkas atau folder di Google Drive..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Files List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">Memuat berkas dari Google Drive...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-slate-700">Folder ini kosong</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gunakan tombol "Unggah Berkas" atau "Folder Baru" untuk menambahkan dokumen.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="py-3 px-4">Nama Berkas / Folder</th>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Ukuran</th>
                      <th className="py-3 px-4">Terakhir Diubah</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      return (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition group">
                          {/* Nama */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {getFileIcon(file.mimeType)}
                              {isFolder ? (
                                <button
                                  onClick={() => handleOpenFolder(file)}
                                  className="font-bold text-slate-800 hover:text-blue-600 text-left cursor-pointer transition"
                                >
                                  {file.name}
                                </button>
                              ) : (
                                <span className="font-semibold text-slate-800">{file.name}</span>
                              )}
                            </div>
                          </td>

                          {/* Tipe */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {isFolder
                              ? 'Folder'
                              : file.mimeType.split('.').pop()?.split('/').pop() || 'Berkas'}
                          </td>

                          {/* Ukuran */}
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {isFolder ? '-' : formatFileSize(file.size)}
                          </td>

                          {/* Tanggal */}
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                  title="Buka di Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              {file.webContentLink && (
                                <a
                                  href={file.webContentLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                  title="Unduh Berkas"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Berkas (Memerlukan Konfirmasi)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-500" /> Buat Folder Baru di Drive
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Folder akan dibuat di: <strong>{folderPath[folderPath.length - 1]?.name}</strong>
            </p>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Contoh: Laporan Sarpras 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Buat Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY: Explicit User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Konfirmasi Hapus Berkas Google Drive
                </h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <p className="text-slate-600">Apakah Anda yakin ingin menghapus berkas berikut dari Google Drive?</p>
              <div className="flex items-center gap-2 mt-2 font-bold text-slate-900">
                {getFileIcon(fileToDelete.mimeType)}
                <span className="truncate">{fileToDelete.name}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus Berkas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
