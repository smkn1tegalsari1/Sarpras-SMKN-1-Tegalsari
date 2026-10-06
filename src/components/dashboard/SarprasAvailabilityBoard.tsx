import React, { useState, useMemo } from 'react';
import {
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  Vehicle,
  Room,
  Facility,
} from '../../types';
import {
  Car,
  Landmark,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SarprasAvailabilityBoardProps {
  carBorrowings: CarBorrowing[];
  hallBookings: HallBooking[];
  equipmentBorrowings: EquipmentBorrowing[];
  vehicles: Vehicle[];
  rooms: Room[];
  facilities: Facility[];
  onNavigate: (tab: string) => void;
  onOpenCarDetail: (item: CarBorrowing) => void;
  onOpenHallDetail: (item: HallBooking) => void;
  onOpenEquipmentDetail?: (item: EquipmentBorrowing) => void;
}

export const SarprasAvailabilityBoard: React.FC<SarprasAvailabilityBoardProps> = ({
  carBorrowings,
  hallBookings,
  equipmentBorrowings,
  vehicles,
  rooms,
  facilities,
  onNavigate,
  onOpenCarDetail,
  onOpenHallDetail,
  onOpenEquipmentDetail,
}) => {
  // Active Category: 'MOBIL' | 'AULA' | 'ALAT'
  const [activeCategory, setActiveCategory] = useState<'MOBIL' | 'AULA' | 'ALAT'>('MOBIL');

  // Month Navigator
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // View Mode: 'DAILY' (Rincian per tanggal terpilih) | 'MATRIX' (Kalender Matriks Bulan Ini)
  const [viewMode, setViewMode] = useState<'DAILY' | 'MATRIX'>('DAILY');

  // Navigation handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthLabel = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysList = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dObj = new Date(year, month, dayNum);
      const dayName = dObj.toLocaleDateString('id-ID', { weekday: 'short' });
      return { dayNum, dateStr: dStr, dayName };
    });
  }, [year, month, daysInMonth]);

  // Selected date formatted for title
  const selectedDateFormatted = useMemo(() => {
    try {
      const d = new Date(selectedDateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  // Active bookings on the selected date
  const activeCarsOnDate = useMemo(() => {
    return carBorrowings.filter(
      (c) =>
        c.tanggalPinjam === selectedDateStr &&
        ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(c.status)
    );
  }, [carBorrowings, selectedDateStr]);

  const activeHallsOnDate = useMemo(() => {
    return hallBookings.filter(
      (h) =>
        h.tanggalKegiatan === selectedDateStr &&
        ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(h.status)
    );
  }, [hallBookings, selectedDateStr]);

  const activeEquipmentsOnDate = useMemo(() => {
    return equipmentBorrowings.filter(
      (eq) =>
        eq.tanggalPinjam <= selectedDateStr &&
        eq.tanggalKembali >= selectedDateStr &&
        ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(eq.status)
    );
  }, [equipmentBorrowings, selectedDateStr]);

  // Vehicle status map on selected date
  const vehicleAvailability = useMemo(() => {
    return vehicles.map((v) => {
      const booking = activeCarsOnDate.find(
        (b) => b.vehicleId === v.id || b.vehicleNoPol === v.nomorPolisi
      );
      return {
        vehicle: v,
        booking: booking || null,
        isAvailable: !booking,
      };
    });
  }, [vehicles, activeCarsOnDate]);

  // Room status map on selected date
  const roomAvailability = useMemo(() => {
    return rooms.map((r) => {
      // If code/name matches, or default aula
      const isMainAula = r.kode.includes('AULA') || r.nama.toLowerCase().includes('aula');
      const booking = isMainAula
        ? activeHallsOnDate[0] || null
        : activeHallsOnDate.find((b) => b.namaKegiatan.toLowerCase().includes(r.nama.toLowerCase())) || null;

      return {
        room: r,
        booking: booking || null,
        isAvailable: !booking,
      };
    });
  }, [rooms, activeHallsOnDate]);

  // Facility / Equipment availability map on selected date
  const facilityAvailability = useMemo(() => {
    return facilities.map((f) => {
      let borrowedQty = 0;
      const relevantBookings: EquipmentBorrowing[] = [];

      activeEquipmentsOnDate.forEach((eq) => {
        const item = eq.items?.find(
          (it) => it.facilityId === f.id || it.nama.toLowerCase() === f.nama.toLowerCase()
        );
        if (item) {
          borrowedQty += item.jumlah || 1;
          relevantBookings.push(eq);
        }
      });

      const remainingQty = Math.max(0, f.jumlah - borrowedQty);
      return {
        facility: f,
        totalQty: f.jumlah,
        borrowedQty,
        remainingQty,
        isFullyBooked: remainingQty === 0 && f.jumlah > 0,
        isPartiallyBooked: borrowedQty > 0 && remainingQty > 0,
        isAvailable: borrowedQty === 0,
        bookings: relevantBookings,
      };
    });
  }, [facilities, activeEquipmentsOnDate]);

  // Quick summary counts for selected date
  const freeCarsCount = vehicleAvailability.filter((v) => v.isAvailable).length;
  const bookedCarsCount = vehicleAvailability.filter((v) => !v.isAvailable).length;

  const freeRoomsCount = roomAvailability.filter((r) => r.isAvailable).length;
  const bookedRoomsCount = roomAvailability.filter((r) => !r.isAvailable).length;

  const freeEquipCount = facilityAvailability.filter((f) => f.isAvailable).length;
  const bookedEquipCount = facilityAvailability.filter((f) => !f.isAvailable).length;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Header & Intro */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
              Cek Ketersediaan Sarana & Prasarana
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Real-time
            </span>
          </div>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
            Periksa ketersediaan armada mobil sekolah, ruang aula, dan peralatan inventaris berdasarkan kalender bulan ini. Ketahui mana saja yang sudah dibooking atau masih kosong sebelum mengajukan.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl backdrop-blur-md self-start md:self-auto border border-white/10">
          <button
            onClick={() => setViewMode('DAILY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'DAILY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-indigo-100 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Detail Tanggal
          </button>
          <button
            onClick={() => setViewMode('MATRIX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'MATRIX'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-indigo-100 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Kalender Matriks
          </button>
        </div>
      </div>

      {/* Category Tabs & Month Navigator Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('MOBIL')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeCategory === 'MOBIL'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Ketersediaan Mobil</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === 'MOBIL'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {freeCarsCount} Bebas
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('AULA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeCategory === 'AULA'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Aula & Ruangan</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === 'AULA'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {freeRoomsCount} Bebas
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('ALAT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              activeCategory === 'ALAT'
                ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Peralatan / Inventaris</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === 'ALAT'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {freeEquipCount} Bebas
            </span>
          </button>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-xl transition"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-slate-800 uppercase tracking-tight">
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-xl transition"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Date Carousel Strip (Horizontal date picker for the month) */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 min-w-max">
          {daysList.map((day) => {
            const isSelected = selectedDateStr === day.dateStr;
            const isToday = day.dateStr === todayStr;

            // Check if there are bookings on this date for the active category
            let hasBooking = false;
            if (activeCategory === 'MOBIL') {
              hasBooking = carBorrowings.some(
                (c) =>
                  c.tanggalPinjam === day.dateStr &&
                  ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(c.status)
              );
            } else if (activeCategory === 'AULA') {
              hasBooking = hallBookings.some(
                (h) =>
                  h.tanggalKegiatan === day.dateStr &&
                  ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(h.status)
              );
            } else {
              hasBooking = equipmentBorrowings.some(
                (e) =>
                  e.tanggalPinjam <= day.dateStr &&
                  e.tanggalKembali >= day.dateStr &&
                  ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(e.status)
              );
            }

            return (
              <button
                key={day.dayNum}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`flex flex-col items-center justify-center w-12 py-1.5 rounded-xl text-xs transition relative ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-md'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="text-[10px] uppercase opacity-75">{day.dayName}</span>
                <span className="text-sm font-extrabold leading-tight">{day.dayNum}</span>

                {/* Dot indicator if booked */}
                {hasBooking && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isSelected ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Header Status Banner */}
      <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-800">
            Kondisi Pada: <span className="text-blue-700">{selectedDateFormatted}</span>
          </span>
          {selectedDateStr === todayStr && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
              Hari Ini
            </span>
          )}
        </div>

        {/* Status Legend indicators */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Tersedia</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Menunggu Persetujuan</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Sudah Dibooking</span>
          </span>
        </div>
      </div>

      {/* CONTENT: MODE 1 - DAILY CARDS */}
      {viewMode === 'DAILY' && (
        <div className="p-5 sm:p-6">
          {/* CATEGORY 1: MOBIL SEKOLAH */}
          {activeCategory === 'MOBIL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicleAvailability.map(({ vehicle, booking, isAvailable }) => (
                  <div
                    key={vehicle.id}
                    className={`rounded-2xl border p-4.5 transition flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-xs'
                        : booking?.status === 'DISETUJUI'
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div>
                      {/* Top status header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {vehicle.kode} • {vehicle.jenis}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                            {vehicle.nama}
                          </h4>
                          <span className="inline-block mt-0.5 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {vehicle.nomorPolisi}
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Tersedia
                          </span>
                        ) : booking?.status === 'DISETUJUI' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Sudah Dibooking
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Menunggu Konfirmasi
                          </span>
                        )}
                      </div>

                      {/* Middle Details */}
                      <div className="py-3 text-xs space-y-2">
                        {isAvailable ? (
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 text-xs">
                            <p className="font-semibold text-emerald-900">
                              Armada siap digunakan pada tanggal ini.
                            </p>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Kapasitas {vehicle.kapasitas} orang penumpang.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>No. Pengajuan:</span>
                              <strong className="text-slate-800">{booking?.nomorPengajuan}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Pemohon:</span>
                              <strong className="text-slate-800">
                                {booking?.userNama} ({booking?.userUnit})
                              </strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Agenda / Rute:</span>
                              <strong className="text-slate-800 truncate max-w-[170px]" title={booking?.kegiatan}>
                                {booking?.kegiatan}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                              <span>Waktu:</span>
                              <strong className="text-blue-700">
                                {booking?.jamBerangkat} s/d {booking?.perkiraanKembali} WIB
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action button */}
                    <div className="pt-2">
                      {isAvailable ? (
                        <button
                          onClick={() => onNavigate('car_new')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajukan Mobil Ini
                        </button>
                      ) : (
                        <button
                          onClick={() => booking && onOpenCarDetail(booking)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Detail Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY 2: AULA & RUANGAN */}
          {activeCategory === 'AULA' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomAvailability.map(({ room, booking, isAvailable }) => (
                  <div
                    key={room.id}
                    className={`rounded-2xl border p-4.5 transition flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-xs'
                        : booking?.status === 'DISETUJUI'
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div>
                      {/* Top status header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {room.kode} • {room.lokasi}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                            {room.nama}
                          </h4>
                          <span className="inline-block mt-0.5 text-xs text-slate-500 font-medium">
                            Kapasitas: <strong>{room.kapasitas} orang</strong>
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Tersedia
                          </span>
                        ) : booking?.status === 'DISETUJUI' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Sedang Digunakan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Ada Pengajuan
                          </span>
                        )}
                      </div>

                      {/* Middle Details */}
                      <div className="py-3 text-xs space-y-2">
                        {isAvailable ? (
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 text-xs">
                            <p className="font-semibold text-emerald-900">
                              Ruangan kosong & siap dipakai.
                            </p>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              {room.keterangan || 'Fasilitas sound system, LCD proyektor & kursi tersedia.'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>No. Pengajuan:</span>
                              <strong className="text-slate-800">{booking?.nomorPengajuan}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Pemohon:</span>
                              <strong className="text-slate-800">
                                {booking?.userNama} ({booking?.userUnit})
                              </strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px]">
                              <span>Nama Kegiatan:</span>
                              <strong className="text-slate-800 truncate max-w-[170px]" title={booking?.namaKegiatan}>
                                {booking?.namaKegiatan}
                              </strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                              <span>Waktu Pakai:</span>
                              <strong className="text-emerald-700">
                                {booking?.jamMulai} s/d {booking?.jamSelesai} WIB
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action button */}
                    <div className="pt-2">
                      {isAvailable ? (
                        <button
                          onClick={() => onNavigate('hall_new')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Booking Ruangan Ini
                        </button>
                      ) : (
                        <button
                          onClick={() => booking && onOpenHallDetail(booking)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Detail Agenda
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY 3: PERALATAN / SARPRAS */}
          {activeCategory === 'ALAT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilityAvailability.map(({ facility, totalQty, borrowedQty, remainingQty, isAvailable, isPartiallyBooked, isFullyBooked, bookings }) => (
                  <div
                    key={facility.id}
                    className={`rounded-2xl border p-4.5 transition flex flex-col justify-between ${
                      isAvailable
                        ? 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xs'
                        : isFullyBooked
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div>
                      {/* Top status header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Lokasi: {facility.lokasi}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                            {facility.nama}
                          </h4>
                          <span className="inline-block mt-0.5 text-xs text-slate-600 font-semibold">
                            Total Inventaris: <strong>{totalQty} Unit</strong>
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lengkap ({remainingQty})
                          </span>
                        ) : isFullyBooked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Habis Dipinjam
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Sisa {remainingQty} Unit
                          </span>
                        )}
                      </div>

                      {/* Middle Details */}
                      <div className="py-3 text-xs space-y-2">
                        {isAvailable ? (
                          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-950 text-xs">
                            <p className="font-semibold text-indigo-900">
                              Semua unit ({totalQty} barang) siap dipinjam.
                            </p>
                            <p className="text-[11px] text-indigo-700 mt-0.5">
                              Kondisi: {facility.kondisi || 'BAIK'}. Siap pakai kegiatan sekolah.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200">
                            <div className="flex items-center justify-between text-slate-600 text-[11px]">
                              <span>Unit Dipinjam:</span>
                              <strong className="text-rose-600 font-bold">{borrowedQty} Unit</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 text-[11px]">
                              <span>Sisa Tersedia:</span>
                              <strong className="text-emerald-700 font-bold">{remainingQty} Unit</strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                              <span className="block font-bold text-slate-700 mb-0.5">Peminjam Saat Ini:</span>
                              <div className="space-y-1 max-h-20 overflow-y-auto">
                                {bookings.map((b) => (
                                  <div key={b.id} className="text-[10px] text-slate-600 flex justify-between">
                                    <span className="truncate max-w-[130px]">• {b.userNama} ({b.userUnit})</span>
                                    <span className="font-semibold text-indigo-700">{b.nomorPengajuan}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action button */}
                    <div className="pt-2">
                      {remainingQty > 0 ? (
                        <button
                          onClick={() => onNavigate('equipment_new')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Pinjam Peralatan Ini
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('equipment_list')}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Antrean Peminjaman
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: MODE 2 - MONTHLY AVAILABILITY MATRIX */}
      {viewMode === 'MATRIX' && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs text-slate-500">
            <p>
              Matriks kalender menunjukkan status ketersediaan sarana sepanjang bulan{' '}
              <strong className="text-slate-800">{monthLabel}</strong>.
            </p>
            <div className="flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Hijau = Bebas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Kuning = Menunggu
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Merah = Booked
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                  <th className="p-3 sticky left-0 bg-slate-100 z-10 w-56 font-extrabold border-r border-slate-200 whitespace-nowrap">
                    Nama Sarana / Aset
                  </th>
                  {daysList.map((d) => {
                    const isToday = d.dateStr === todayStr;
                    return (
                      <th
                        key={d.dayNum}
                        onClick={() => setSelectedDateStr(d.dateStr)}
                        className={`p-1.5 text-center cursor-pointer min-w-[34px] border-r border-slate-200 transition ${
                          isToday
                            ? 'bg-blue-100 text-blue-900 font-black'
                            : selectedDateStr === d.dateStr
                            ? 'bg-slate-800 text-white font-black'
                            : 'hover:bg-slate-200/80 font-bold'
                        }`}
                      >
                        <div className="text-[9px] uppercase font-normal">{d.dayName.charAt(0)}</div>
                        <div className="text-xs">{d.dayNum}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {/* Rows based on active category */}
                {activeCategory === 'MOBIL' &&
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60">
                      <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="truncate max-w-[170px]">{v.nama}</p>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {v.nomorPolisi}
                            </span>
                          </div>
                        </div>
                      </td>
                      {daysList.map((d) => {
                        const booking = carBorrowings.find(
                          (c) =>
                            c.tanggalPinjam === d.dateStr &&
                            (c.vehicleId === v.id || c.vehicleNoPol === v.nomorPolisi) &&
                            ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(c.status)
                        );

                        return (
                          <td
                            key={d.dayNum}
                            onClick={() => {
                              setSelectedDateStr(d.dateStr);
                              if (booking) onOpenCarDetail(booking);
                            }}
                            className={`p-1 text-center border-r border-slate-100 cursor-pointer transition ${
                              booking?.status === 'DISETUJUI'
                                ? 'bg-rose-500 text-white font-bold hover:bg-rose-600'
                                : booking?.status === 'MENUNGGU PERSETUJUAN'
                                ? 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500'
                                : 'bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                            title={
                              booking
                                ? `${booking.nomorPengajuan} - ${booking.userNama} (${booking.kegiatan}): ${booking.jamBerangkat} s/d ${booking.perkiraanKembali}`
                                : 'Tersedia / Siap Dipinjam'
                            }
                          >
                            <div className="text-[10px] font-bold">
                              {booking ? (booking.status === 'DISETUJUI' ? '✕' : '⏳') : '✓'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                {activeCategory === 'AULA' &&
                  rooms.map((r) => {
                    const isMainAula = r.kode.includes('AULA') || r.nama.toLowerCase().includes('aula');
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <p className="truncate max-w-[170px]">{r.nama}</p>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {r.lokasi}
                              </span>
                            </div>
                          </div>
                        </td>
                        {daysList.map((d) => {
                          const booking = hallBookings.find(
                            (h) =>
                              h.tanggalKegiatan === d.dateStr &&
                              ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(h.status) &&
                              (isMainAula || h.namaKegiatan.toLowerCase().includes(r.nama.toLowerCase()))
                          );

                          return (
                            <td
                              key={d.dayNum}
                              onClick={() => {
                                setSelectedDateStr(d.dateStr);
                                if (booking) onOpenHallDetail(booking);
                              }}
                              className={`p-1 text-center border-r border-slate-100 cursor-pointer transition ${
                                booking?.status === 'DISETUJUI'
                                  ? 'bg-rose-500 text-white font-bold hover:bg-rose-600'
                                  : booking?.status === 'MENUNGGU PERSETUJUAN'
                                  ? 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500'
                                  : 'bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800'
                              }`}
                              title={
                                booking
                                  ? `${booking.nomorPengajuan} - ${booking.userNama} (${booking.namaKegiatan}): ${booking.jamMulai} s/d ${booking.jamSelesai}`
                                  : 'Tersedia / Siap Dipakai'
                              }
                            >
                              <div className="text-[10px] font-bold">
                                {booking ? (booking.status === 'DISETUJUI' ? '✕' : '⏳') : '✓'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                {activeCategory === 'ALAT' &&
                  facilities.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/60">
                      <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <p className="truncate max-w-[170px]">{f.nama}</p>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Total: {f.jumlah} unit
                            </span>
                          </div>
                        </div>
                      </td>
                      {daysList.map((d) => {
                        let borrowed = 0;
                        equipmentBorrowings.forEach((eq) => {
                          if (
                            eq.tanggalPinjam <= d.dateStr &&
                            eq.tanggalKembali >= d.dateStr &&
                            ['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(eq.status)
                          ) {
                            const it = eq.items?.find(
                              (i) => i.facilityId === f.id || i.nama.toLowerCase() === f.nama.toLowerCase()
                            );
                            if (it) borrowed += it.jumlah || 1;
                          }
                        });

                        const remaining = Math.max(0, f.jumlah - borrowed);
                        const isFull = remaining === 0 && f.jumlah > 0;
                        const isPartial = borrowed > 0 && remaining > 0;

                        return (
                          <td
                            key={d.dayNum}
                            onClick={() => setSelectedDateStr(d.dateStr)}
                            className={`p-1 text-center border-r border-slate-100 cursor-pointer transition ${
                              isFull
                                ? 'bg-rose-500 text-white font-bold hover:bg-rose-600'
                                : isPartial
                                ? 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500'
                                : 'bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                            title={
                              isFull
                                ? `Habis Dipinjam (0/${f.jumlah})`
                                : isPartial
                                ? `Tersisa ${remaining} dari ${f.jumlah} unit`
                                : `Tersedia lengkap (${f.jumlah} unit)`
                            }
                          >
                            <div className="text-[10px] font-bold">
                              {isFull ? '0' : remaining}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info & Quick Link */}
      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Klik pada tanggal di kalender strip untuk memeriksa status sarana di hari lain, atau lihat kalender sarpras lengkap.
          </span>
        </div>
        <button
          onClick={() => onNavigate('sarpras_calendar')}
          className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition shrink-0"
        >
          Buka Kalender Sarpras Penuh <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
