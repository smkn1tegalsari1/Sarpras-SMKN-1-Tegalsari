import React from 'react';
import { ApplicationStatus, VehicleStatus, ConditionStatus } from '../../types';

interface BadgeProps {
  status: ApplicationStatus | VehicleStatus | ConditionStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'MENUNGGU PERSETUJUAN':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20';
      break;
    case 'DISETUJUI':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20';
      break;
    case 'DITOLAK':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-400/20';
      break;
    case 'SELESAI':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/20';
      break;
    case 'DIBATALKAN':
      colorClasses = 'bg-gray-100 text-gray-600 border-gray-300';
      break;
    case 'DRAFT':
      colorClasses = 'bg-zinc-100 text-zinc-600 border-zinc-300';
      break;

    // Vehicle / Room statuses
    case 'TERSEDIA':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'DIGUNAKAN':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-300';
      break;
    case 'SERVIS':
    case 'RENOVASI':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
      break;
    case 'TIDAK AKTIF':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      break;

    // Conditions
    case 'BAIK':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'RUSAK RINGAN':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
      break;
    case 'RUSAK BERAT':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300';
      break;
    default:
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};
