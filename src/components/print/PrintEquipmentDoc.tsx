import React from 'react';
import { EquipmentBorrowing, SchoolSettings } from '../../types';
import { Printer, X } from 'lucide-react';

interface PrintEquipmentDocProps {
  data: EquipmentBorrowing;
  settings: SchoolSettings;
  onClose: () => void;
}

export const PrintEquipmentDoc: React.FC<PrintEquipmentDocProps> = ({ data, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-4 flex flex-col items-center">
      {/* Action Toolbar */}
      <div className="print:hidden w-full max-w-[210mm] bg-white rounded-t-xl p-4 flex items-center justify-between border-b shadow-lg mb-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            A4
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Pratinjau Cetak Peminjaman Peralatan / Sarpras</h4>
            <p className="text-xs text-slate-500">Format Resmi Standar SMKN 1 Tegalsari</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sheet */}
      <div className="printable-document bg-white w-full max-w-[210mm] min-h-[297mm] p-10 shadow-2xl text-slate-900 border font-serif text-sm print:m-0 print:p-8 print:w-full print:shadow-none print:border-none print:max-w-none">
        {/* Kop Surat (Logo Provinsi KIRI & Logo Sekolah KANAN) */}
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center relative mb-5">
          {settings.logoProvinsiUrl && (
            <img
              src={settings.logoProvinsiUrl}
              alt="Logo Provinsi"
              className="absolute left-2 top-1 w-20 h-20 object-contain print:block"
            />
          )}
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="absolute right-2 top-1 w-20 h-20 object-contain print:block"
            />
          )}
          <div className="px-24">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {settings.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
            </h4>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {settings.dinas || 'DINAS PENDIDIKAN'}
            </h4>
            <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-950 mt-0.5">
              {settings.namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
            </h2>
            <p className="text-[11px] font-sans text-slate-600 mt-1">
              {settings.alamat}
            </p>
            <p className="text-[11px] font-sans text-slate-600">
              Telp: {settings.telepon} | Email: {settings.email} | Web: {settings.website || 'smkn1tegalsari.sch.id'}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            ADMINISTRASI SARANA DAN PRASARANA
          </h3>
          <h1 className="text-base font-extrabold uppercase tracking-wide underline underline-offset-4 mt-0.5">
            FORMULIR BUKTI PEMINJAMAN PERALATAN SARPRAS
          </h1>
          <div className="flex justify-between items-center text-xs font-sans mt-3 px-2 text-slate-600">
            <span>Nomor Dokumen: <strong className="text-slate-900">{data.nomorPengajuan}</strong></span>
            <span>Tanggal Pengajuan: <strong className="text-slate-900">{new Date(data.createdAt).toLocaleDateString('id-ID')}</strong></span>
          </div>
        </div>

        {/* Content Table: Identitas Pemohon & Kegiatan */}
        <table className="w-full border-collapse border border-slate-900 text-xs mb-4 font-sans">
          <tbody>
            <tr className="bg-slate-100 font-bold border-b border-slate-900">
              <td colSpan={2} className="p-2 uppercase text-slate-800">I. Data Pemohon & Kegiatan</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="w-1/3 p-2 font-semibold bg-slate-50 border-r border-slate-400">Nama Pemohon</td>
              <td className="p-2 font-bold text-slate-900">{data.userNama}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Unit Kerja / Jurusan</td>
              <td className="p-2">{data.userUnit}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Keperluan / Nama Kegiatan</td>
              <td className="p-2 font-bold text-slate-900">{data.keperluan}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Tanggal Pinjam</td>
              <td className="p-2 font-medium">{formatDate(data.tanggalPinjam)} {data.jamPinjam ? `(${data.jamPinjam} WIB)` : ''}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Tanggal Pengembalian</td>
              <td className="p-2 font-medium">{formatDate(data.tanggalKembali)} {data.jamKembali ? `(${data.jamKembali} WIB)` : ''}</td>
            </tr>
            {data.keterangan && (
              <tr className="border-b border-slate-900">
                <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Catatan / Lokasi Pakai</td>
                <td className="p-2">{data.keterangan}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Content Table: Rincian Barang / Peralatan */}
        <table className="w-full border-collapse border border-slate-900 text-xs mb-5 font-sans">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-slate-900 text-center">
              <th className="p-2 border-r border-slate-400 w-10">No</th>
              <th className="p-2 border-r border-slate-400 text-left">Nama Peralatan / Sarana</th>
              <th className="p-2 border-r border-slate-400 w-24">Jumlah Unit</th>
              <th className="p-2 border-r border-slate-400 w-32">Kondisi Awal</th>
              <th className="p-2 w-32">Kondisi Kembali</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.length > 0 ? (
              data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="p-2 text-center border-r border-slate-300 font-semibold">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{item.nama}</td>
                  <td className="p-2 text-center border-r border-slate-300 font-bold">{item.jumlah} Unit</td>
                  <td className="p-2 text-center border-r border-slate-300">{item.kondisiSaatPinjam || 'BAIK'}</td>
                  <td className="p-2 text-center text-slate-400 italic">
                    {data.status === 'SELESAI' ? 'BAIK (Lengkap)' : '[ ................ ]'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center text-slate-500">Tidak ada rincian item barang</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Catatan Ketentuan Tanggung Jawab */}
        <div className="border border-slate-300 p-2.5 text-[11px] font-sans bg-slate-50 mb-8 text-slate-700 leading-relaxed">
          <p className="font-bold mb-1">Ketentuan Peminjaman Sarana dan Prasarana:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Peralatan hanya digunakan untuk kepentingan kedinasan / kegiatan resmi SMK Negeri 1 Tegalsari.</li>
            <li>Peminjam bertanggung jawab memelihara, menjaga kebersihan, dan memastikan keselamatan barang.</li>
            <li>Apabila terjadi kerusakan atau kehilangan akibat kelalaian peminjam, peminjam wajib memperbaiki atau mengganti sesuai spesifikasi semula.</li>
            <li>Pengembalian barang wajib diverifikasi oleh Petugas Sarana dan Prasarana.</li>
          </ol>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans mt-8">
          <div>
            <p className="text-slate-600">Mengetahui / Menyetujui,</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {data.disetujuiJabatan || settings.jabatanPejabat || 'Waka Sarana & Prasarana'}
            </p>
            <div className="h-24 flex items-center justify-center">
              {settings.tandaTanganUrl && (
                <img src={settings.tandaTanganUrl} alt="TTD" className="h-20 object-contain" />
              )}
            </div>
            <p className="font-bold underline text-slate-950">
              {data.disetujuiOleh || settings.namaPejabat}
            </p>
            {settings.nipPejabat && (
              <p className="text-[10px] text-slate-600">NIP. {settings.nipPejabat}</p>
            )}
          </div>

          <div>
            <p className="text-slate-600">
              Banyuwangi, {new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-900 mt-0.5">Penanggung Jawab / Pemohon</p>
            <div className="h-24 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">(Tanda Tangan Asli)</span>
            </div>
            <p className="font-bold underline text-slate-950">{data.userNama}</p>
            <p className="text-[10px] text-slate-600">{data.userUnit}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-3 border-t border-slate-200 flex justify-between text-[10px] font-sans text-slate-400">
          <span>Status Pengajuan: <strong>{data.status}</strong></span>
          <span>SISARPRAS SMKN 1 TEGALSARI</span>
        </div>
      </div>
    </div>
  );
};
