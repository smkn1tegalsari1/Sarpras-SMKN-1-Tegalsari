import React, { useState } from 'react';
import { AppNotification } from '../../types';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  Car,
  Landmark,
  Wrench,
  ArrowRight,
  Filter,
  Sparkles,
  Inbox,
  ExternalLink,
} from 'lucide-react';

interface OfficerNotificationsCardProps {
  notifications: AppNotification[];
  onNavigate: (tab: string) => void;
  onMarkAsRead: (id: string) => Promise<void> | void;
  onMarkAllAsRead: (ids: string[]) => Promise<void> | void;
}

export const OfficerNotificationsCard: React.FC<OfficerNotificationsCardProps> = ({
  notifications,
  onNavigate,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadList = notifications.filter((n) => !n.read);
  const unreadCount = unreadList.length;

  const filteredNotifications =
    filterMode === 'UNREAD' ? unreadList : notifications;

  const handleMarkItemRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingId(id);
    try {
      await onMarkAsRead(id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadList.length === 0) return;
    setIsMarkingAll(true);
    try {
      await onMarkAllAsRead(unreadList.map((n) => n.id));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await onMarkAsRead(notif.id);
    }
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  const getNotificationIcon = (title: string, message: string, link?: string) => {
    const text = `${title} ${message} ${link || ''}`.toLowerCase();
    if (text.includes('mobil') || text.includes('kendaraan') || link?.includes('car')) {
      return <Car className="w-4 h-4 text-blue-600" />;
    }
    if (text.includes('aula') || text.includes('gedung') || text.includes('ruang') || link?.includes('hall')) {
      return <Landmark className="w-4 h-4 text-emerald-600" />;
    }
    if (text.includes('alat') || text.includes('peralatan') || text.includes('fasilitas') || link?.includes('equipment')) {
      return <Wrench className="w-4 h-4 text-indigo-600" />;
    }
    return <Bell className="w-4 h-4 text-amber-600" />;
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Baru saja';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-50/70 to-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-2xl bg-blue-600 text-white shadow-xs">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-base">
                Notifikasi Terbaru Petugas
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                  {unreadCount} Belum Dibaca
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Semua Terbaca
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemberitahuan pengajuan masuk, verifikasi berkas, dan status peminjaman sarpras.
            </p>
          </div>
        </div>

        {/* Filter Controls & Mark All as Read */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'ALL'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilterMode('UNREAD')}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === 'UNREAD'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold transition disabled:opacity-50"
              title="Tandai semua notifikasi telah dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 sm:p-5 flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              {filterMode === 'UNREAD'
                ? 'Tidak ada notifikasi yang belum dibaca'
                : 'Belum ada notifikasi sistem'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterMode === 'UNREAD'
                ? 'Semua pemberitahuan dan permohonan sarpras telah Anda tinjau.'
                : 'Notifikasi akan muncul otomatis saat guru atau staf mengajukan peminjaman.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredNotifications.slice(0, 8).map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group relative p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                  !item.read
                    ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-200/80 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                {/* Status Dot / Icon */}
                <div className="shrink-0 mt-0.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      !item.read
                        ? 'bg-blue-100/80 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {getNotificationIcon(item.title, item.message, item.link)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5
                      className={`text-xs font-bold truncate ${
                        !item.read ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h5>
                    <span className="shrink-0 text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${
                      !item.read ? 'text-slate-800 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    {item.link && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-700 group-hover:underline">
                        Buka Permohonan <ArrowRight className="w-3 h-3" />
                      </span>
                    )}

                    {!item.read && (
                      <button
                        type="button"
                        disabled={loadingId === item.id}
                        onClick={(e) => handleMarkItemRead(e, item.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded-md transition"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                </div>

                {/* Right indicator badge if unread */}
                {!item.read && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Sinkronisasi notifikasi real-time dari Firebase Firestore
        </span>
        <span className="text-[11px] text-slate-400">
          Menampilkan hingga 8 notifikasi terbaru
        </span>
      </div>
    </div>
  );
};
