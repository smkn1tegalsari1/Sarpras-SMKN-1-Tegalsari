import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolSettings, AppNotification, UserRole } from '../../types';
import {
  Bell,
  Menu,
  ShieldCheck,
  User,
  LogOut,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  settings: SchoolSettings;
  notifications: AppNotification[];
  onOpenMobileMenu: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  notifications,
  onOpenMobileMenu,
  setActiveTab,
}) => {
  const { userProfile, role, switchDemoRole, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabelMap: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'ADMINISTRATOR', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    sarpras: { label: 'PETUGAS SARPRAS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    pemohon: { label: 'PEMOHON (GURU / STAF)', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile toggle & School title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  SISARPRAS
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  SMKN 1 TEGALSARI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                Sistem Informasi Sarana dan Prasarana
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Role Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Role Tester for Evaluator / Multi-Role Switching */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="px-2 font-medium text-slate-500 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Role:
            </span>
            {(['admin', 'sarpras', 'pemohon'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchDemoRole(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition text-xs capitalize ${
                  role === r
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'sarpras' ? 'Sarpras' : r}
              </button>
            ))}
          </div>

          {/* Active Role Tag */}
          <span
            className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${roleLabelMap[role].color}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {roleLabelMap[role].label}
          </span>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Pemberitahuan Sistem</h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {notifications.length} notifikasi
                  </span>
                </div>
                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Belum ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition border border-slate-100 cursor-pointer"
                        onClick={() => {
                          if (n.link) setActiveTab(n.link);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 text-blue-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">
                              {new Date(n.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition text-left"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {userProfile?.nama?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {userProfile?.nama || 'Pengguna'}
                </p>
                <p className="text-[10px] text-slate-500 leading-none">
                  {userProfile?.unitNama || 'SMKN 1 Tegalsari'}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{userProfile?.nama}</p>
                  <p className="text-xs text-slate-500 truncate">{userProfile?.email}</p>
                  <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                    Unit: {userProfile?.unitNama || 'Umum'}
                  </div>
                </div>

                <div className="p-1">
                  <div className="md:hidden py-2 px-3 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Ganti Role Demo</p>
                    <div className="flex gap-1">
                      {(['admin', 'sarpras', 'pemohon'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchDemoRole(r);
                            setShowUserMenu(false);
                          }}
                          className={`flex-1 py-1 text-xs rounded font-medium capitalize ${
                            role === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Sistem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
