import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  trend?: string;
  onClick?: () => void;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-600 text-white',
    accent: 'text-blue-700',
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    accent: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-600 text-white',
    accent: 'text-amber-700',
  },
  rose: {
    bg: 'bg-rose-50 text-rose-600 border-rose-100',
    iconBg: 'bg-rose-600 text-white',
    accent: 'text-rose-700',
  },
  indigo: {
    bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    accent: 'text-indigo-700',
  },
  purple: {
    bg: 'bg-purple-50 text-purple-600 border-purple-100',
    iconBg: 'bg-purple-600 text-white',
    accent: 'text-purple-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  onClick,
}) => {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-emerald-600">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl shadow-xs ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>SMKN 1 Tegalsari</span>
        <span className="font-medium text-slate-500">Live Realtime</span>
      </div>
    </div>
  );
};
