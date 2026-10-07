import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolSettings } from '../../types';
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginPageProps {
  settings: SchoolSettings;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ settings, onSuccess }) => {
  const { loginWithUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Silakan masukkan username dan password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await loginWithUsername(username.trim(), password);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk. Periksa kembali username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-blue-700 to-indigo-800 p-8 text-white text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              {settings.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
            </p>
            <h1 className="text-xl font-black tracking-tight mt-1">
              SISARPRAS
            </h1>
            <p className="text-xs font-semibold text-blue-100">
              SMK NEGERI 1 TEGALSARI
            </p>
            <p className="text-[10px] text-blue-200/80 mt-1">
              Sistem Informasi Sarana dan Prasarana
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center mb-6">
              Masuk dengan Username & Password
            </h2>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Lupa password? Hubungi Admin
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  'Memverifikasi Akun...'
                ) : (
                  <>
                    Masuk ke Sistem <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} SISARPRAS SMK Negeri 1 Tegalsari. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
};
