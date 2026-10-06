import React, { useState, useMemo } from 'react';
import { CarBorrowing, HallBooking, EquipmentBorrowing, UnitKerja } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Car,
  Landmark,
  Wrench,
  Clock,
  User,
  Filter,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';

interface SarprasCalendarProps {
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  equipmentBorrowings?: EquipmentBorrowing[];
  units?: UnitKerja[];
  onOpenCarDetail: (item: CarBorrowing) => void;
  onOpenHallDetail: (item: HallBooking) => void;
  onOpenEquipmentDetail?: (item: EquipmentBorrowing) => void;
}

export const SarprasCalendar: React.FC<SarprasCalendarProps> = ({
  carBorrowings,
  hallBookings,
  equipmentBorrowings = [],
  units = [],
  onOpenCarDetail,
  onOpenHallDetail,
  onOpenEquipmentDetail,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MOBIL' | 'AULA' | 'PERALATAN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Normalize all events
  const allEvents = useMemo(() => [
    ...carBorrowings.map((c) => ({
      id: c.id,
      jenis: 'MOBIL' as const,
      tanggal: c.tanggalPinjam,
      jam: `${c.jamBerangkat} - ${c.perkiraanKembali}`,
      kegiatan: c.kegiatan,
      pemohon: c.userNama,
      unit: c.userUnit,
      resource: `${c.vehicleNama} (${c.vehicleNoPol})`,
      status: c.status,
      raw: c,
    })),
    ...hallBookings.map((h) => ({
      id: h.id,
      jenis: 'AULA' as const,
      tanggal: h.tanggalKegiatan,
      jam: `${h.jamMulai} - ${h.jamSelesai}`,
      kegiatan: h.namaKegiatan,
      pemohon: h.userNama,
      unit: h.userUnit,
      resource: 'Graha Utama Aula',
      status: h.status,
      raw: h,
    })),
    ...equipmentBorrowings.map((eq) => ({
      id: eq.id,
      jenis: 'PERALATAN' as const,
      tanggal: eq.tanggalPinjam,
      jam: `${eq.jamPinjam || '08:00'} - ${eq.jamKembali || '15:00'}`,
      kegiatan: eq.keperluan,
      pemohon: eq.userNama,
      unit: eq.userUnit,
      resource: eq.items?.map((it) => `${it.nama} (${it.jumlah})`).join(', ') || 'Peralatan',
      status: eq.status,
      raw: eq,
    })),
  ], [carBorrowings, hallBookings, equipmentBorrowings]);

  // Extract distinct units from events and props
  const availableUnits = useMemo(() => {
    const unitSet = new Set<string>();
    units.forEach((u) => unitSet.add(u.nama));
    allEvents.forEach((ev) => {
      if (ev.unit) unitSet.add(ev.unit);
    });
    return Array.from(unitSet).sort();
  }, [units, allEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchType = typeFilter === 'ALL' || ev.jenis === typeFilter;
      const matchStatus = statusFilter === 'ALL' || ev.status === statusFilter;
      const matchUnit = unitFilter === 'ALL' || ev.unit === unitFilter;
      return matchType && matchStatus && matchUnit;
    });
  }, [allEvents, typeFilter, statusFilter, unitFilter]);

  // Events on selected day
  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((ev) => ev.tanggal === selectedDateStr);
  }, [filteredEvents, selectedDateStr]);

  const hasActiveFilter = typeFilter !== 'ALL' || statusFilter !== 'ALL' || unitFilter !== 'ALL';

  const resetFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setUnitFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kalender Kegiatan Sarpras
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              {filteredEvents.length} Terjadwal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal operasional mobil dinas dan pemakaian ruang aula SMKN 1 Tegalsari.
          </p>
        </div>

        {/* Quick action: Reset if filtered */}
        {hasActiveFilter && (
          <button
            onClick={resetFilters}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Filter
          </button>
        )}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Kalender Sarpras
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Menampilkan {filteredEvents.length} dari {allEvents.length} kegiatan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* 1. Filter Jenis Kegiatan */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">
              Jenis Sarana:
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('MOBIL')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  typeFilter === 'MOBIL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Mobil
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('AULA')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  typeFilter === 'AULA' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" /> Aula
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('PERALATAN')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  typeFilter === 'PERALATAN' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" /> Alat
              </button>
            </div>
          </div>

          {/* 2. Filter Status (dengan Tombol Cepat "Hanya Disetujui") */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-[11px] font-bold text-slate-600">
              Status Pengajuan:
            </label>
            <div className="flex gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none transition ${
                  statusFilter === 'DISETUJUI'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <option value="ALL">Semua Status</option>
                <option value="DISETUJUI">Hanya Disetujui</option>
                <option value="MENUNGGU PERSETUJUAN">Menunggu Persetujuan</option>
                <option value="SELESAI">Selesai</option>
                <option value="DITOLAK">Ditolak</option>
              </select>

              {/* Quick toggle pill for "Hanya Disetujui" as requested */}
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'DISETUJUI' ? 'ALL' : 'DISETUJUI')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 border transition ${
                  statusFilter === 'DISETUJUI'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
                title="Tampilkan hanya jadwal yang sudah disetujui"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {statusFilter === 'DISETUJUI' ? 'Aktif' : 'Disetujui Saja'}
              </button>
            </div>
          </div>

          {/* 3. Filter Jenis Unit Kerja / Jurusan */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-blue-600" />
              Unit Kerja / Jurusan:
            </label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none transition ${
                unitFilter !== 'ALL'
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              <option value="ALL">Semua Unit Kerja</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Pills Indicator */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400 font-medium">Filter Aktif:</span>
            {typeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                Jenis: {typeFilter}
                <button type="button" onClick={() => setTypeFilter('ALL')} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Status: {statusFilter}
                <button type="button" onClick={() => setStatusFilter('ALL')} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {unitFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                Unit: {unitFilter}
                <button type="button" onClick={() => setUnitFilter('ALL')} className="hover:text-purple-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Calendar left, Day Schedule right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Calendar View */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          {/* Month control header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-extrabold text-slate-900 capitalize">
                {monthName}
              </h3>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                Hari Ini
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday names */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Day blocks */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/50" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              // Events on this date (filtered)
              const dayEvs = filteredEvents.filter((ev) => ev.tanggal === dateStr);
              const carCount = dayEvs.filter((ev) => ev.jenis === 'MOBIL').length;
              const hallCount = dayEvs.filter((ev) => ev.jenis === 'AULA').length;
              const eqCount = dayEvs.filter((ev) => ev.jenis === 'PERALATAN').length;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : isToday
                      ? 'border-amber-400 bg-amber-50/30'
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvs.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvs.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / indicators */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {carCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 truncate">
                        <Car className="w-2.5 h-2.5 shrink-0" /> {carCount} Mobil
                      </span>
                    )}
                    {hallCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 truncate">
                        <Landmark className="w-2.5 h-2.5 shrink-0" /> {hallCount} Aula
                      </span>
                    )}
                    {eqCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 truncate">
                        <Wrench className="w-2.5 h-2.5 shrink-0" /> {eqCount} Alat
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Agenda Sarpras Terjadwal
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              {new Date(selectedDateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedDayEvents.length} kegiatan pada tanggal ini {hasActiveFilter ? '(sesuai filter)' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3 max-h-[500px]">
            {selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada agenda peminjaman mobil, aula, atau peralatan pada tanggal ini
                {hasActiveFilter ? ' yang cocok dengan filter yang dipilih.' : '.'}
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (ev.jenis === 'MOBIL') onOpenCarDetail(ev.raw as CarBorrowing);
                    else if (ev.jenis === 'AULA') onOpenHallDetail(ev.raw as HallBooking);
                    else if (onOpenEquipmentDetail) onOpenEquipmentDetail(ev.raw as EquipmentBorrowing);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ev.jenis === 'MOBIL'
                          ? 'bg-blue-100 text-blue-700'
                          : ev.jenis === 'AULA'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {ev.jenis === 'MOBIL' ? (
                        <Car className="w-3 h-3" />
                      ) : ev.jenis === 'AULA' ? (
                        <Landmark className="w-3 h-3" />
                      ) : (
                        <Wrench className="w-3 h-3" />
                      )}
                      {ev.jenis === 'MOBIL'
                        ? 'Peminjaman Mobil'
                        : ev.jenis === 'AULA'
                        ? 'Penggunaan Aula'
                        : 'Peminjaman Alat'}
                    </span>
                    <StatusBadge status={ev.status} size="sm" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition">
                      {ev.kegiatan}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {ev.resource}
                    </p>
                  </div>

                  {/* Unit badge tag */}
                  {ev.unit && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-semibold">
                      <Briefcase className="w-3 h-3 text-purple-500" />
                      {ev.unit}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" /> {ev.jam} WIB
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3 text-slate-400" /> {ev.pemohon}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
