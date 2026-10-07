import React from 'react';
import { CarBorrowing, SchoolSettings } from '../../types';
import { Printer, X } from 'lucide-react';

interface PrintCarDocProps {
  data: CarBorrowing;
  settings: SchoolSettings;
  onClose: () => void;
}

export const PrintCarDoc: React.FC<PrintCarDocProps> = ({ data, settings, onClose }) => {
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
      {/* Action Toolbar (Hidden during print) */}
      <div className="print:hidden w-full max-w-[210mm] bg-white rounded-t-xl p-4 flex items-center justify-between border-b shadow-lg mb-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            A4
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Pratinjau Cetak Formulir Peminjaman Mobil</h4>
            <p className="text-xs text-slate-500">Format Resmi Standar Dinas Pendidikan Jawa Timur</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
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

      {/* Printable Sheet */}
      <div className="printable-document bg-white w-full max-w-[210mm] min-h-[297mm] p-10 shadow-2xl text-slate-900 border font-serif text-sm print:m-0 print:p-8 print:w-full print:shadow-none print:border-none print:max-w-none">
        {/* Kop Surat */}
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center relative mb-5">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt="Logo Sekolah"
              className="absolute left-2 top-1 w-20 h-20 object-contain print:block"
            />
          )}
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

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            ADMINISTRASI SARANA DAN PRASARANA
          </h3>
          <h1 className="text-base font-extrabold uppercase tracking-wide underline underline-offset-4 mt-0.5">
            FORM PEMINJAMAN MOBIL SEKOLAH
          </h1>
          <div className="flex justify-between items-center text-xs font-sans mt-3 px-2 text-slate-600">
            <span>Nomor Pengajuan: <strong className="text-slate-900">{data.nomorPengajuan}</strong></span>
            <span>Tanggal Pengajuan: <strong className="text-slate-900">{new Date(data.createdAt).toLocaleDateString('id-ID')}</strong></span>
          </div>
        </div>

        {/* Content Table */}
        <table className="w-full border-collapse border border-slate-900 text-xs mb-5 font-sans">
          <tbody>
            <tr className="bg-slate-100 font-bold border-b border-slate-900">
              <td colSpan={2} className="p-2 uppercase text-slate-800">I. Data Pemohon & Keperluan</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="w-1/3 p-2 font-semibold bg-slate-50 border-r border-slate-400">Nama Pemohon</td>
              <td className="p-2 font-bold text-slate-900">{data.userNama}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Unit / Program Keahlian</td>
              <td className="p-2">{data.userUnit}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Kegiatan</td>
              <td className="p-2 font-medium">{data.kegiatan}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Tujuan / Rute</td>
              <td className="p-2">{data.tujuanRute}</td>
            </tr>
            <tr className="border-b border-slate-900">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">KM Awal / Perkiraan Jarak</td>
              <td className="p-2">{data.kmAwal || '-'}</td>
            </tr>

            <tr className="bg-slate-100 font-bold border-b border-slate-900">
              <td colSpan={2} className="p-2 uppercase text-slate-800">II. Jadwal & Kendaraan</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Hari / Tanggal Peminjaman</td>
              <td className="p-2 font-medium">{formatDate(data.tanggalPinjam)}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Jam Berangkat - Perkiraan Kembali</td>
              <td className="p-2 font-bold">{data.jamBerangkat} WIB s/d {data.perkiraanKembali} WIB</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Kendaraan Sekolah</td>
              <td className="p-2 font-bold text-slate-900">
                {data.vehicleNama} ({data.vehicleNoPol})
              </td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Nama Pengemudi & No. HP</td>
              <td className="p-2">{data.driverNama} ({data.driverHp})</td>
            </tr>
            <tr className="border-b border-slate-900">
              <td className="p-2 font-semibold bg-slate-50 border-r border-slate-400">Kondisi Awal BBM</td>
              <td className="p-2 font-semibold">{data.bbmPercent || 0}% Tanki</td>
            </tr>
          </tbody>
        </table>

        {/* Photos Condition (Only rendered if photos were provided) */}
        {(data.fotoDepan || data.fotoKanan || data.fotoKiri || data.fotoBelakang) && (
          <div className="mb-5">
            <p className="font-bold text-xs uppercase mb-2 text-slate-800">
              III. Pemeriksaan Kondisi Fisik Kendaraan (4 Sisi)
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-sans">
              <div className="border border-slate-400 p-1.5 rounded bg-slate-50">
                <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden rounded mb-1">
                  {data.fotoDepan ? (
                    <img src={data.fotoDepan} alt="Foto Depan" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 italic">Foto Depan</span>
                  )}
                </div>
                <span className="font-semibold">Foto Depan</span>
              </div>

              <div className="border border-slate-400 p-1.5 rounded bg-slate-50">
                <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden rounded mb-1">
                  {data.fotoKanan ? (
                    <img src={data.fotoKanan} alt="Foto Kanan" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 italic">Samping Kanan</span>
                  )}
                </div>
                <span className="font-semibold">Foto Samping Kanan</span>
              </div>

              <div className="border border-slate-400 p-1.5 rounded bg-slate-50">
                <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden rounded mb-1">
                  {data.fotoKiri ? (
                    <img src={data.fotoKiri} alt="Foto Kiri" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 italic">Samping Kiri</span>
                  )}
                </div>
                <span className="font-semibold">Foto Samping Kiri</span>
              </div>

              <div className="border border-slate-400 p-1.5 rounded bg-slate-50">
                <div className="h-28 bg-slate-200 flex items-center justify-center overflow-hidden rounded mb-1">
                  {data.fotoBelakang ? (
                    <img src={data.fotoBelakang} alt="Foto Belakang" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 italic">Foto Belakang</span>
                  )}
                </div>
                <span className="font-semibold">Foto Belakang</span>
              </div>
            </div>
          </div>
        )}

        {/* Catatan Ketentuan */}
        <div className="border border-slate-300 p-2 text-[11px] font-sans italic bg-slate-50 mb-6 text-slate-700">
          “Ketersediaan kendaraan dan pemeriksaan kondisi kendaraan menjadi tanggung jawab petugas sarpras.”
        </div>

        {/* Area Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans mt-6">
          <div>
            <p className="text-slate-600">Mengetahui / Menyetujui,</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {data.disetujuiJabatan || settings.jabatanPejabat || 'Waka Bidang Sarana & Prasarana'}
            </p>
            <div className="h-20 flex items-center justify-center">
              {settings.tandaTanganUrl && (
                <img src={settings.tandaTanganUrl} alt="TTD" className="h-16 object-contain" />
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
              Tegalsari, {new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-900 mt-0.5">Pemohon Peminjaman</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">(Tanda Tangan Asli)</span>
            </div>
            <p className="font-bold underline text-slate-950">{data.userNama}</p>
            <p className="text-[10px] text-slate-600">{data.userUnit}</p>
          </div>
        </div>

        {/* Watermark status */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between text-[10px] font-sans text-slate-400">
          <span>Status Formulir: <strong>{data.status}</strong></span>
          <span>SISARPRAS SMKN 1 TEGALSARI - Sistem Terintegrasi</span>
        </div>
      </div>
    </div>
  );
};
