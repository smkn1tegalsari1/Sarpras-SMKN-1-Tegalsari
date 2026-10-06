import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CarBorrowing, HallBooking, EquipmentBorrowing, Vehicle, Room, Facility } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { SarprasAvailabilityBoard } from '../components/dashboard/SarprasAvailabilityBoard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Car,
  Landmark,
  Wrench,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';

interface DashboardProps {
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  equipmentBorrowings?: EquipmentBorrowing[];
  vehicles: Vehicle[];
  rooms: Room[];
  facilities?: Facility[];
  onNavigate: (tab: string) => void;
  onOpenCarDetail: (item: CarBorrowing) => void;
  onOpenHallDetail: (item: HallBooking) => void;
  onOpenEquipmentDetail?: (item: EquipmentBorrowing) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  carBorrowings,
  hallBookings,
  equipmentBorrowings = [],
  vehicles,
  rooms,
  facilities = [],
  onNavigate,
  onOpenCarDetail,
  onOpenHallDetail,
  onOpenEquipmentDetail,
}) => {
  const { role, userProfile } = useAuth();

  // If role is pemohon, show their own stats primarily, but let sarpras/admin see global
  const isPemohon = role === 'pemohon';
  const displayedCars = isPemohon
    ? carBorrowings.filter((c) => c.userId === userProfile?.uid || c.userId === userProfile?.id)
    : carBorrowings;
  const displayedHalls = isPemohon
    ? hallBookings.filter((h) => h.userId === userProfile?.uid || h.userId === userProfile?.id)
    : hallBookings;
  const displayedEquipments = isPemohon
    ? equipmentBorrowings.filter((e) => e.userId === userProfile?.uid || e.userId === userProfile?.id)
    : equipmentBorrowings;

  const totalPengajuan = displayedCars.length + displayedHalls.length + displayedEquipments.length;
  const pendingCount =
    displayedCars.filter((c) => c.status === 'MENUNGGU PERSETUJUAN').length +
    displayedHalls.filter((h) => h.status === 'MENUNGGU PERSETUJUAN').length +
    displayedEquipments.filter((e) => e.status === 'MENUNGGU PERSETUJUAN').length;
  const approvedCount =
    displayedCars.filter((c) => c.status === 'DISETUJUI').length +
    displayedHalls.filter((h) => h.status === 'DISETUJUI').length +
    displayedEquipments.filter((e) => e.status === 'DISETUJUI').length;
  const rejectedCount =
    displayedCars.filter((c) => c.status === 'DITOLAK').length +
    displayedHalls.filter((h) => h.status === 'DITOLAK').length +
    displayedEquipments.filter((e) => e.status === 'DITOLAK').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const carsToday = carBorrowings.filter(
    (c) => c.tanggalPinjam === todayStr && ['DISETUJUI', 'MENUNGGU PERSETUJUAN'].includes(c.status)
  ).length;
  const hallsToday = hallBookings.filter(
    (h) => h.tanggalKegiatan === todayStr && ['DISETUJUI', 'MENUNGGU PERSETUJUAN'].includes(h.status)
  ).length;
  const equipmentsToday = equipmentBorrowings.filter(
    (e) => e.tanggalPinjam <= todayStr && e.tanggalKembali >= todayStr && ['DISETUJUI', 'MENUNGGU PERSETUJUAN'].includes(e.status)
  ).length;

  // Recent applications (combined and sorted by createdAt)
  const combinedRecent = [
    ...displayedCars.map((c) => ({
      id: c.id,
      tipe: 'MOBIL' as const,
      nomor: c.nomorPengajuan,
      pemohon: c.userNama,
      unit: c.userUnit,
      kegiatan: c.kegiatan,
      tanggal: c.tanggalPinjam,
      waktu: `${c.jamBerangkat} - ${c.perkiraanKembali}`,
      status: c.status,
      raw: c,
    })),
    ...displayedHalls.map((h) => ({
      id: h.id,
      tipe: 'AULA' as const,
      nomor: h.nomorPengajuan,
      pemohon: h.userNama,
      unit: h.userUnit,
      kegiatan: h.namaKegiatan,
      tanggal: h.tanggalKegiatan,
      waktu: `${h.jamMulai} - ${h.jamSelesai}`,
      status: h.status,
      raw: h,
    })),
    ...displayedEquipments.map((e) => ({
      id: e.id,
      tipe: 'PERALATAN' as const,
      nomor: e.nomorPengajuan,
      pemohon: e.userNama,
      unit: e.userUnit,
      kegiatan: e.keperluan,
      tanggal: `${e.tanggalPinjam} s/d ${e.tanggalKembali}`,
      waktu: `${e.jamPinjam || '08:00'} - ${e.jamKembali || '15:00'}`,
      status: e.status,
      raw: e,
    })),
  ].sort((a, b) => new Date(b.raw.createdAt).getTime() - new Date(a.raw.createdAt).getTime());

  // Monthly stats chart calculation (Last 6 months)
  const monthsData = (() => {
    const months = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const mLabel = d.toLocaleDateString('id-ID', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const carCount = carBorrowings.filter((c) => c.createdAt?.startsWith(yearMonth)).length;
      const hallCount = hallBookings.filter((h) => h.createdAt?.startsWith(yearMonth)).length;
      const eqCount = equipmentBorrowings.filter((e) => e.createdAt?.startsWith(yearMonth)).length;

      months.push({
        label: mLabel,
        cars: carCount,
        halls: hallCount,
        equipments: eqCount,
        total: carCount + hallCount + eqCount,
      });
    }
    return months;
  })();

  const maxMonthValue = Math.max(...monthsData.map((m) => m.total), 5);

  const [distributionView, setDistributionView] = useState<'TYPE' | 'STATUS'>('TYPE');

  // Distribution Pie Data
  const typePieData = [
    { name: 'Peminjaman Mobil', value: displayedCars.length, color: '#2563eb' },
    { name: 'Penggunaan Aula', value: displayedHalls.length, color: '#10b981' },
    { name: 'Peralatan Sarpras', value: displayedEquipments.length, color: '#6366f1' },
  ].filter((d) => d.value > 0);

  const statusPieData = [
    {
      name: 'Menunggu',
      value: pendingCount,
      color: '#f59e0b',
    },
    {
      name: 'Disetujui',
      value: approvedCount,
      color: '#10b981',
    },
    {
      name: 'Ditolak',
      value: rejectedCount,
      color: '#ef4444',
    },
    {
      name: 'Selesai',
      value:
        displayedCars.filter((c) => c.status === 'SELESAI').length +
        displayedHalls.filter((h) => h.status === 'SELESAI').length +
        displayedEquipments.filter((e) => e.status === 'SELESAI').length,
      color: '#3b82f6',
    },
  ].filter((d) => d.value > 0);

  const activePieData =
    distributionView === 'TYPE'
      ? typePieData.length > 0
        ? typePieData
        : [{ name: 'Belum Ada', value: 1, color: '#cbd5e1' }]
      : statusPieData.length > 0
      ? statusPieData
      : [{ name: 'Belum Ada', value: 1, color: '#cbd5e1' }];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Sistem Administrasi Sarana & Prasarana Aktif
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {userProfile?.nama}!
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Sistem Informasi Sarana dan Prasarana (SISARPRAS) SMK Negeri 1 Tegalsari.
            Kelola pengajuan peminjaman kendaraan operasional, pemakaian aula, dan inventaris sekolah secara transparan & terkoordinasi.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('car_new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition"
            >
              <Car className="w-4 h-4" />
              Ajukan Mobil Sekolah
            </button>
            <button
              onClick={() => onNavigate('hall_new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition"
            >
              <Landmark className="w-4 h-4" />
              Ajukan Pemakaian Aula
            </button>
            <button
              onClick={() => onNavigate('equipment_new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition shadow-md"
            >
              <Wrench className="w-4 h-4" />
              Pinjam Peralatan / Sarpras
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 6 Metric Stat Cards Requested in Section 6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Pengajuan"
          value={totalPengajuan}
          subtitle={isPemohon ? 'Pengajuan Anda' : 'Seluruh Unit Kerja'}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={pendingCount}
          subtitle="Perlu diverifikasi"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Disetujui"
          value={approvedCount}
          subtitle="Telah divalidasi"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Ditolak"
          value={rejectedCount}
          subtitle="Tidak disetujui"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Mobil Hari Ini"
          value={carsToday}
          subtitle="Peminjaman aktif"
          icon={Car}
          color="indigo"
          onClick={() => onNavigate('car_list')}
        />
        <StatCard
          title="Aula Hari Ini"
          value={hallsToday}
          subtitle="Agenda kegiatan"
          icon={Landmark}
          color="purple"
          onClick={() => onNavigate('hall_list')}
        />
      </div>

      {/* Real-time Sarpras Availability Board (Mobil, Aula, Peralatan) */}
      <SarprasAvailabilityBoard
        carBorrowings={carBorrowings}
        hallBookings={hallBookings}
        equipmentBorrowings={equipmentBorrowings}
        vehicles={vehicles}
        rooms={rooms}
        facilities={facilities}
        onNavigate={onNavigate}
        onOpenCarDetail={onOpenCarDetail}
        onOpenHallDetail={onOpenHallDetail}
        onOpenEquipmentDetail={onOpenEquipmentDetail}
      />

      {/* Interactive Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Interactive Chart */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Tren Pengajuan Bulanan
                </h3>
                <p className="text-xs text-slate-500">
                  Data statistik real-time 6 bulan terakhir dari Firestore
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-blue-600"></span> Mobil
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Aula
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500"></span> Alat
                </span>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="w-full h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthsData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const cars = payload.find((p) => p.dataKey === 'cars')?.value || 0;
                        const halls = payload.find((p) => p.dataKey === 'halls')?.value || 0;
                        const equipments = payload.find((p) => p.dataKey === 'equipments')?.value || 0;
                        const total = Number(cars) + Number(halls) + Number(equipments);
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl text-xs border border-slate-700 min-w-[190px]">
                            <p className="font-bold text-slate-200 border-b border-slate-700 pb-1.5 mb-2">
                              Bulan {label}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-blue-400">
                                <span>Peminjaman Mobil:</span>
                                <span className="font-bold text-white">{cars}</span>
                              </div>
                              <div className="flex justify-between items-center text-emerald-400">
                                <span>Penggunaan Aula:</span>
                                <span className="font-bold text-white">{halls}</span>
                              </div>
                              <div className="flex justify-between items-center text-indigo-400">
                                <span>Peminjaman Alat:</span>
                                <span className="font-bold text-white">{equipments}</span>
                              </div>
                              <div className="pt-1.5 border-t border-slate-700 flex justify-between items-center font-bold text-slate-300">
                                <span>Total Pengajuan:</span>
                                <span className="text-white">{total}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="cars"
                    name="Peminjaman Mobil"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="halls"
                    name="Penggunaan Aula"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="equipments"
                    name="Peminjaman Alat"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata pengajuan aktif: <strong>{(totalPengajuan / 6).toFixed(1)} per bulan</strong></span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('sarpras_calendar')}>
              Lihat Kalender Lengkap →
            </span>
          </div>
        </div>

        {/* Distribution Interactive PieChart */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-600" />
                Distribusi Pengajuan
              </h3>

              {/* View Switcher Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setDistributionView('TYPE')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    distributionView === 'TYPE'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Jenis
                </button>
                <button
                  onClick={() => setDistributionView('STATUS')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    distributionView === 'STATUS'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Status
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              {distributionView === 'TYPE'
                ? 'Perbandingan pemanfaatan Mobil vs Aula'
                : 'Status verifikasi pengajuan sarpras'}
            </p>

            {/* Recharts PieChart (Donut) */}
            <div className="w-full h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={activePieData.length > 1 ? 5 : 0}
                    dataKey="value"
                  >
                    {activePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const total = activePieData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = total > 0 ? Math.round((Number(data.value) / total) * 100) : 0;
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-lg text-xs border border-slate-700">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300">
                              {data.value} pengajuan ({percent}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center donut metric */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{totalPengajuan}</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total</span>
              </div>
            </div>

            {/* Legend pills */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {activePieData.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 ml-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Unit Siap Pakai:</span>
            <span className="font-bold text-slate-800">
              {vehicles.filter((v) => v.status === 'TERSEDIA').length} Mobil •{' '}
              {rooms.filter((r) => r.status === 'TERSEDIA').length} Ruangan
            </span>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pengajuan Terbaru</h3>
            <p className="text-xs text-slate-500">
              {isPemohon ? 'Daftar pengajuan yang Anda buat' : 'Daftar seluruh pengajuan sarpras masuk'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('car_list')}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {combinedRecent.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Tentu belum ada pengajuan.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Mulai membuat permohonan peminjaman kendaraan dinas atau booking ruang aula sekarang.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('car_new')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                Buat Pengajuan Mobil
              </button>
              <button
                onClick={() => onNavigate('hall_new')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
              >
                Buat Pengajuan Aula
              </button>
              <button
                onClick={() => onNavigate('equipment_new')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                Buat Pengajuan Alat
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Nomor & Jenis</th>
                  <th className="px-5 py-3.5">Pemohon & Unit</th>
                  <th className="px-5 py-3.5">Nama Kegiatan</th>
                  <th className="px-5 py-3.5">Jadwal Tanggal</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedRecent.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg ${
                            item.tipe === 'MOBIL'
                              ? 'bg-blue-100 text-blue-700'
                              : item.tipe === 'AULA'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {item.tipe === 'MOBIL' ? (
                            <Car className="w-3.5 h-3.5" />
                          ) : item.tipe === 'AULA' ? (
                            <Landmark className="w-3.5 h-3.5" />
                          ) : (
                            <Wrench className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{item.nomor}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.tipe === 'MOBIL'
                              ? 'Peminjaman Mobil'
                              : item.tipe === 'AULA'
                              ? 'Penggunaan Aula'
                              : 'Peminjaman Peralatan'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{item.pemohon}</p>
                      <p className="text-[11px] text-slate-500">{item.unit}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate">
                      <span className="font-medium text-slate-700">{item.kegiatan}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{item.tanggal}</p>
                      <span className="text-[10px] text-slate-400">{item.waktu}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          if (item.tipe === 'MOBIL') onOpenCarDetail(item.raw as CarBorrowing);
                          else if (item.tipe === 'AULA') onOpenHallDetail(item.raw as HallBooking);
                          else if (onOpenEquipmentDetail) onOpenEquipmentDetail(item.raw as EquipmentBorrowing);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-[11px] transition"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
