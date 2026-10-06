import React, { useState } from 'react';
import {
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  Vehicle,
  Room,
  Facility,
  UnitKerja,
  SchoolSettings,
} from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import * as XLSX from 'xlsx';
import {
  FileBarChart2,
  Printer,
  Download,
  Filter,
  Calendar,
  Car,
  Landmark,
  Wrench,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface ReportsPageProps {
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  equipmentBorrowings: EquipmentBorrowing[];
  vehicles: Vehicle[];
  rooms: Room[];
  facilities: Facility[];
  units: UnitKerja[];
  settings: SchoolSettings;
  defaultMode?: 'CARS' | 'HALLS' | 'EQUIPMENT' | 'REKAP';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  carBorrowings,
  hallBookings,
  equipmentBorrowings,
  vehicles,
  rooms,
  facilities,
  units,
  settings,
  defaultMode = 'CARS',
}) => {
  const [reportType, setReportType] = useState<'CARS' | 'HALLS' | 'EQUIPMENT' | 'REKAP'>(
    defaultMode
  );

  // Filters
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(currentMonthStart);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [pemohonSearch, setPemohonSearch] = useState('');

  // Filter Cars
  const filteredCars = carBorrowings.filter((c) => {
    const matchDate = (!startDate || c.tanggalPinjam >= startDate) && (!endDate || c.tanggalPinjam <= endDate);
    const matchUnit = selectedUnit === 'ALL' || c.userUnit === selectedUnit;
    const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchPemohon = !pemohonSearch || c.userNama.toLowerCase().includes(pemohonSearch.toLowerCase());
    return matchDate && matchUnit && matchStatus && matchPemohon;
  });

  // Filter Halls
  const filteredHalls = hallBookings.filter((h) => {
    const matchDate = (!startDate || h.tanggalKegiatan >= startDate) && (!endDate || h.tanggalKegiatan <= endDate);
    const matchUnit = selectedUnit === 'ALL' || h.userUnit === selectedUnit;
    const matchStatus = selectedStatus === 'ALL' || h.status === selectedStatus;
    const matchPemohon = !pemohonSearch || h.userNama.toLowerCase().includes(pemohonSearch.toLowerCase());
    return matchDate && matchUnit && matchStatus && matchPemohon;
  });

  // Filter Equipments
  const filteredEquipments = equipmentBorrowings.filter((eq) => {
    const matchDate = (!startDate || eq.tanggalPinjam >= startDate) && (!endDate || eq.tanggalPinjam <= endDate);
    const matchUnit = selectedUnit === 'ALL' || eq.userUnit === selectedUnit;
    const matchStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;
    const itemsSummary = eq.items?.map((it) => it.nama).join(' ') || '';
    const matchPemohon =
      !pemohonSearch ||
      eq.userNama.toLowerCase().includes(pemohonSearch.toLowerCase()) ||
      itemsSummary.toLowerCase().includes(pemohonSearch.toLowerCase()) ||
      eq.keperluan.toLowerCase().includes(pemohonSearch.toLowerCase());
    return matchDate && matchUnit && matchStatus && matchPemohon;
  });

  // Export Excel Functionality
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (reportType === 'CARS' || reportType === 'REKAP') {
      const carData = filteredCars.map((c, idx) => ({
        No: idx + 1,
        'Nomor Pengajuan': c.nomorPengajuan,
        Pemohon: c.userNama,
        Unit: c.userUnit,
        Kegiatan: c.kegiatan,
        'Tujuan Rute': c.tujuanRute,
        Kendaraan: `${c.vehicleNama} (${c.vehicleNoPol})`,
        'Tanggal Pinjam': c.tanggalPinjam,
        'Jam Berangkat': c.jamBerangkat,
        'Perkiraan Kembali': c.perkiraanKembali,
        Pengemudi: `${c.driverNama} (${c.driverHp})`,
        'BBM (%)': c.bbmPercent,
        Status: c.status,
      }));
      const wsCars = XLSX.utils.json_to_sheet(carData);
      XLSX.utils.book_append_sheet(wb, wsCars, 'Peminjaman Mobil');
    }

    if (reportType === 'HALLS' || reportType === 'REKAP') {
      const hallData = filteredHalls.map((h, idx) => ({
        No: idx + 1,
        'Nomor Pengajuan': h.nomorPengajuan,
        Pemohon: h.userNama,
        Unit: h.userUnit,
        'Nama Kegiatan': h.namaKegiatan,
        Keperluan: h.keperluan,
        'Tanggal Kegiatan': h.tanggalKegiatan,
        'Jam Mulai': h.jamMulai,
        'Jam Selesai': h.jamSelesai,
        'Jumlah Peserta': h.jumlahPeserta,
        Fasilitas: h.fasilitas?.join(', ') || '',
        Status: h.status,
      }));
      const wsHalls = XLSX.utils.json_to_sheet(hallData);
      XLSX.utils.book_append_sheet(wb, wsHalls, 'Penggunaan Aula');
    }

    if (reportType === 'EQUIPMENT' || reportType === 'REKAP') {
      const equipmentData = filteredEquipments.map((eq, idx) => ({
        No: idx + 1,
        'Nomor Pengajuan': eq.nomorPengajuan,
        Pemohon: eq.userNama,
        Unit: eq.userUnit,
        Keperluan: eq.keperluan,
        'Tanggal Pinjam': eq.tanggalPinjam,
        'Tanggal Kembali': eq.tanggalKembali,
        'Jam Pinjam': eq.jamPinjam || '-',
        'Jam Kembali': eq.jamKembali || '-',
        'Peralatan yang Dipinjam': eq.items?.map((it) => `${it.nama} (${it.jumlah} unit)`).join(', ') || '-',
        'Total Unit': eq.items?.reduce((acc, curr) => acc + (curr.jumlah || 1), 0) || 0,
        Status: eq.status,
        'Catatan Petugas': eq.catatanPetugas || '-',
      }));
      const wsEquipments = XLSX.utils.json_to_sheet(equipmentData);
      XLSX.utils.book_append_sheet(wb, wsEquipments, 'Peminjaman Peralatan');
    }

    if (reportType === 'REKAP') {
      const vehicleData = vehicles.map((v, i) => ({
        No: i + 1,
        Kode: v.kode,
        'Nama Kendaraan': v.nama,
        'Nomor Polisi': v.nomorPolisi,
        Jenis: v.jenis,
        Kapasitas: v.kapasitas,
        Status: v.status,
      }));
      const wsVehicles = XLSX.utils.json_to_sheet(vehicleData);
      XLSX.utils.book_append_sheet(wb, wsVehicles, 'Armada Kendaraan');

      const facilityData = facilities.map((f, i) => ({
        No: i + 1,
        'Nama Sarana / Fasilitas': f.nama,
        Jumlah: f.jumlah,
        Kondisi: f.kondisi,
        Lokasi: f.lokasi,
        Keterangan: f.keterangan || '-',
      }));
      const wsFacilities = XLSX.utils.json_to_sheet(facilityData);
      XLSX.utils.book_append_sheet(wb, wsFacilities, 'Inventaris Sarpras');
    }

    const fileName = `Laporan_Sarpras_SMKN1Tegalsari_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Non-print action header */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Laporan Sarana & Prasarana
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi data resmi pemanfaatan mobil dinas, ruang aula, peralatan sekolah, dan inventaris SMKN 1 Tegalsari.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" /> Cetak / PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Report Tab Selector */}
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl max-w-2xl text-xs font-bold gap-1">
          <button
            onClick={() => setReportType('CARS')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'CARS' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Peminjaman Mobil
          </button>
          <button
            onClick={() => setReportType('HALLS')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'HALLS' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Penggunaan Aula
          </button>
          <button
            onClick={() => setReportType('EQUIPMENT')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'EQUIPMENT' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Peminjaman Peralatan
          </button>
          <button
            onClick={() => setReportType('REKAP')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'REKAP' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Rekap Sarpras
          </button>
        </div>

        {/* Filters Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Kerja / Jurusan</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 font-medium"
              >
                <option value="ALL">Semua Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.nama}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Pengajuan</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
                <option value="DISETUJUI">Disetujui</option>
                <option value="DITOLAK">Ditolak</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cari Pemohon / Alat</label>
              <input
                type="text"
                value={pemohonSearch}
                onChange={(e) => setPemohonSearch(e.target.value)}
                placeholder="Nama pemohon, alat, kegiatan..."
                className="w-full p-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Document (Visible in browser & fully styled for print) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 font-sans print:m-0 print:p-6 print:border-none print:shadow-none">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center relative mb-6 font-serif">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="absolute left-2 top-0 w-16 h-16 object-contain"
            />
          )}
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {settings.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
          </h4>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {settings.dinas || 'DINAS PENDIDIKAN'}
          </h4>
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-950 mt-0.5">
            {settings.namaSekolah || 'SMK NEGERI 1 TEGALSARI'}
          </h2>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {settings.alamat} | Telp: {settings.telepon}
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-sm font-extrabold uppercase text-slate-900 underline underline-offset-4">
            {reportType === 'CARS' && 'LAPORAN REKAPITULASI PEMINJAMAN MOBIL SEKOLAH'}
            {reportType === 'HALLS' && 'LAPORAN REKAPITULASI PENGGUNAAN RUANG AULA'}
            {reportType === 'EQUIPMENT' && 'LAPORAN REKAPITULASI PEMINJAMAN PERALATAN SARPRAS'}
            {reportType === 'REKAP' && 'REKAPITULASI KESELURUHAN SARANA DAN PRASARANA'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Periode: {new Date(startDate).toLocaleDateString('id-ID')} s/d{' '}
            {new Date(endDate).toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* CARS REPORT TABLE */}
        {(reportType === 'CARS' || reportType === 'REKAP') && (
          <div className="space-y-2 mb-8">
            <h4 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" /> 1. Data Peminjaman Mobil ({filteredCars.length} Dokumen)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8">No</th>
                    <th className="p-2 border-r border-slate-300">No. Pengajuan</th>
                    <th className="p-2 border-r border-slate-300">Pemohon / Unit</th>
                    <th className="p-2 border-r border-slate-300">Kegiatan & Rute</th>
                    <th className="p-2 border-r border-slate-300">Kendaraan</th>
                    <th className="p-2 border-r border-slate-300">Tanggal / Jam</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCars.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                        Tidak ada data peminjaman mobil pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredCars.map((c, i) => (
                      <tr key={c.id}>
                        <td className="p-2 border-r border-slate-200 text-center">{i + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-bold whitespace-nowrap">
                          {c.nomorPengajuan}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <p className="font-bold text-slate-900">{c.userNama}</p>
                          <p className="text-[10px] text-slate-500">{c.userUnit}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <p className="font-medium text-slate-800">{c.kegiatan}</p>
                          <p className="text-[10px] text-slate-500">{c.tujuanRute}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                          <p className="font-bold">{c.vehicleNama}</p>
                          <p className="text-[10px] text-slate-500">{c.vehicleNoPol}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                          <p>{c.tanggalPinjam}</p>
                          <p className="text-[10px] text-slate-500">{c.jamBerangkat} - {c.perkiraanKembali}</p>
                        </td>
                        <td className="p-2 whitespace-nowrap font-semibold">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HALLS REPORT TABLE */}
        {(reportType === 'HALLS' || reportType === 'REKAP') && (
          <div className="space-y-2 mb-8">
            <h4 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-600" /> 2. Data Penggunaan Aula ({filteredHalls.length} Kegiatan)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8">No</th>
                    <th className="p-2 border-r border-slate-300">No. Pengajuan</th>
                    <th className="p-2 border-r border-slate-300">Pemohon / Unit</th>
                    <th className="p-2 border-r border-slate-300">Nama Kegiatan</th>
                    <th className="p-2 border-r border-slate-300">Tanggal & Jam</th>
                    <th className="p-2 border-r border-slate-300">Peserta</th>
                    <th className="p-2 border-r border-slate-300">Fasilitas</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredHalls.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                        Tidak ada data penggunaan aula pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredHalls.map((h, i) => (
                      <tr key={h.id}>
                        <td className="p-2 border-r border-slate-200 text-center">{i + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-bold whitespace-nowrap">
                          {h.nomorPengajuan}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <p className="font-bold text-slate-900">{h.userNama}</p>
                          <p className="text-[10px] text-slate-500">{h.userUnit}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <p className="font-medium text-slate-800">{h.namaKegiatan}</p>
                          <p className="text-[10px] text-slate-500">{h.keperluan}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                          <p>{h.tanggalKegiatan}</p>
                          <p className="text-[10px] text-slate-500">{h.jamMulai} - {h.jamSelesai}</p>
                        </td>
                        <td className="p-2 border-r border-slate-200 font-bold text-center">
                          {h.jumlahPeserta}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[10px] max-w-xs truncate">
                          {h.fasilitas?.join(', ')}
                        </td>
                        <td className="p-2 whitespace-nowrap font-semibold">
                          <StatusBadge status={h.status} size="sm" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EQUIPMENT REPORT TABLE */}
        {(reportType === 'EQUIPMENT' || reportType === 'REKAP') && (
          <div className="space-y-2 mb-8">
            <h4 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600" /> {reportType === 'REKAP' ? '3.' : '1.'} Data Peminjaman Peralatan / Sarpras ({filteredEquipments.length} Dokumen)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8">No</th>
                    <th className="p-2 border-r border-slate-300">No. Dokumen</th>
                    <th className="p-2 border-r border-slate-300">Pemohon & Unit</th>
                    <th className="p-2 border-r border-slate-300">Keperluan Kegiatan</th>
                    <th className="p-2 border-r border-slate-300">Rincian Peralatan Dipinjam</th>
                    <th className="p-2 border-r border-slate-300">Jadwal Pinjam</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEquipments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                        Tidak ada data peminjaman peralatan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredEquipments.map((eq, i) => {
                      const totalUnits =
                        eq.items?.reduce((acc, curr) => acc + (curr.jumlah || 1), 0) || 0;

                      return (
                        <tr key={eq.id}>
                          <td className="p-2 border-r border-slate-200 text-center">{i + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-bold whitespace-nowrap">
                            {eq.nomorPengajuan}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {new Date(eq.createdAt).toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <p className="font-bold text-slate-900">{eq.userNama}</p>
                            <p className="text-[10px] text-slate-500">{eq.userUnit}</p>
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <p className="font-medium text-slate-800">{eq.keperluan}</p>
                            {eq.keterangan && (
                              <p className="text-[10px] text-slate-500">{eq.keterangan}</p>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <div className="space-y-0.5">
                              {eq.items?.map((it, idx) => (
                                <div key={idx} className="text-[11px] text-slate-700">
                                  • <strong>{it.nama}</strong>: {it.jumlah} unit ({it.kondisiSaatPinjam || 'BAIK'})
                                </div>
                              ))}
                            </div>
                            <div className="text-[10px] text-indigo-700 font-bold mt-1">
                              Total: {totalUnits} unit
                            </div>
                          </td>
                          <td className="p-2 border-r border-slate-200 whitespace-nowrap">
                            <p className="font-semibold">{eq.tanggalPinjam} s/d {eq.tanggalKembali}</p>
                            {eq.jamPinjam && (
                              <p className="text-[10px] text-slate-500">{eq.jamPinjam} - {eq.jamKembali || '16:00'}</p>
                            )}
                          </td>
                          <td className="p-2 whitespace-nowrap font-semibold">
                            <StatusBadge status={eq.status} size="sm" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tanda Tangan Pengesahan Laporan */}
        <div className="mt-12 pt-6 grid grid-cols-2 text-center text-xs font-serif">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {settings.jabatanPejabat || 'Kepala SMK Negeri 1 Tegalsari'}
            </p>
            <div className="h-20 flex items-center justify-center">
              {settings.tandaTanganUrl && (
                <img src={settings.tandaTanganUrl} alt="TTD" className="h-16 object-contain" />
              )}
            </div>
            <p className="font-bold underline text-slate-950">
              {settings.namaPejabat || 'Drs. H. Bambang Wijanarko, M.Pd.'}
            </p>
            {settings.nipPejabat && (
              <p className="text-[10px] text-slate-600">NIP. {settings.nipPejabat}</p>
            )}
          </div>

          <div>
            <p className="text-slate-600">
              Tegalsari, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold text-slate-900 mt-0.5">Pengelola Sarana & Prasarana</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
            </div>
            <p className="font-bold underline text-slate-950">Petugas Sarpras SMKN 1 Tegalsari</p>
            <p className="text-[10px] text-slate-600">NIP. -</p>
          </div>
        </div>
      </div>
    </div>
  );
};
