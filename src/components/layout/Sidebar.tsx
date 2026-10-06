import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolSettings } from '../../types';
import {
  LayoutDashboard,
  Car,
  Landmark,
  CalendarDays,
  Truck,
  DoorOpen,
  Wrench,
  FileBarChart2,
  FileSpreadsheet,
  Users,
  Briefcase,
  Settings,
  X,
  PlusCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  settings: SchoolSettings;
  pendingCarCount?: number;
  pendingHallCount?: number;
  pendingEquipmentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  settings,
  pendingCarCount = 0,
  pendingHallCount = 0,
  pendingEquipmentCount = 0,
}) => {
  const { role, userProfile } = useAuth();

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navItemClass = (tab: string) => {
    const isActive = activeTab === tab;
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Top */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo SMKN 1 Tegalsari"
                className="w-10 h-10 object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex flex-col items-center justify-center text-white shadow-xs font-bold text-xs">
                <span>SMK</span>
                <span className="text-[9px] -mt-1 text-blue-200">TEGAL</span>
              </div>
            )}
            <div>
              <h1 className="text-xs font-extrabold text-slate-900 leading-tight">
                SMK NEGERI 1 TEGALSARI
              </h1>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                Banyuwangi, Jawa Timur
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Buttons for Pemohon */}
        <div className="p-2.5 border-b border-slate-100 bg-blue-50/40">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSelectTab('car_new')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-blue-600 text-white text-[10px] font-bold shadow-xs hover:bg-blue-700 transition"
              title="Pengajuan Peminjaman Mobil"
            >
              <Car className="w-3.5 h-3.5 mb-0.5" />
              <span>Mobil</span>
            </button>
            <button
              onClick={() => handleSelectTab('hall_new')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold shadow-xs hover:bg-emerald-700 transition"
              title="Pengajuan Penggunaan Aula"
            >
              <Landmark className="w-3.5 h-3.5 mb-0.5" />
              <span>Aula</span>
            </button>
            <button
              onClick={() => handleSelectTab('equipment_new')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-indigo-600 text-white text-[10px] font-bold shadow-xs hover:bg-indigo-700 transition"
              title="Pengajuan Peminjaman Peralatan"
            >
              <Wrench className="w-3.5 h-3.5 mb-0.5" />
              <span>Alat</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* DASHBOARD */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              Menu Utama
            </div>
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={navItemClass('dashboard')}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                DASHBOARD
              </span>
            </button>
          </div>

          {/* PEMINJAMAN */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              PEMINJAMAN
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelectTab('car_list')}
                className={navItemClass('car_list')}
              >
                <span className="flex items-center gap-2.5">
                  <Car className="w-4 h-4" />
                  Peminjaman Mobil
                </span>
                {pendingCarCount > 0 && role !== 'pemohon' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                    {pendingCarCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelectTab('hall_list')}
                className={navItemClass('hall_list')}
              >
                <span className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4" />
                  Penggunaan Aula
                </span>
                {pendingHallCount > 0 && role !== 'pemohon' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                    {pendingHallCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelectTab('equipment_list')}
                className={navItemClass('equipment_list')}
              >
                <span className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4" />
                  Peminjaman Peralatan
                </span>
                {pendingEquipmentCount > 0 && role !== 'pemohon' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                    {pendingEquipmentCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelectTab('sarpras_calendar')}
                className={navItemClass('sarpras_calendar')}
              >
                <span className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4" />
                  Kalender Sarpras
                </span>
              </button>
            </div>
          </div>

          {/* SARANA & PRASARANA (Petugas & Admin) */}
          {(role === 'admin' || role === 'sarpras') && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                SARANA & PRASARANA
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleSelectTab('vehicles')}
                  className={navItemClass('vehicles')}
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4" />
                    Kendaraan
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('rooms')}
                  className={navItemClass('rooms')}
                >
                  <span className="flex items-center gap-2.5">
                    <DoorOpen className="w-4 h-4" />
                    Ruangan
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('facilities')}
                  className={navItemClass('facilities')}
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4" />
                    Fasilitas
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* LAPORAN (Petugas & Admin) */}
          {(role === 'admin' || role === 'sarpras') && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                LAPORAN
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleSelectTab('report_cars')}
                  className={navItemClass('report_cars')}
                >
                  <span className="flex items-center gap-2.5">
                    <FileBarChart2 className="w-4 h-4" />
                    Laporan Peminjaman Mobil
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('report_halls')}
                  className={navItemClass('report_halls')}
                >
                  <span className="flex items-center gap-2.5">
                    <FileBarChart2 className="w-4 h-4" />
                    Laporan Penggunaan Aula
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('report_equipment')}
                  className={navItemClass('report_equipment')}
                >
                  <span className="flex items-center gap-2.5">
                    <FileBarChart2 className="w-4 h-4" />
                    Laporan Peminjaman Peralatan
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('report_rekap')}
                  className={navItemClass('report_rekap')}
                >
                  <span className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    Rekap Sarpras
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ADMINISTRASI (Hanya Admin) */}
          {role === 'admin' && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                ADMINISTRASI
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleSelectTab('users')}
                  className={navItemClass('users')}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Pengguna
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('units')}
                  className={navItemClass('units')}
                >
                  <span className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    Unit Kerja
                  </span>
                </button>
                <button
                  onClick={() => handleSelectTab('settings')}
                  className={navItemClass('settings')}
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    Pengaturan
                  </span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {userProfile?.nama?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {userProfile?.nama}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tight truncate">
                {role} • {userProfile?.unitNama || 'SMKN 1'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
