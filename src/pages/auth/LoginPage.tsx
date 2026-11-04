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
  const { loginWithUsername, loginWithGoogle } = useAuth();
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
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center mx-auto mb-4 border border-white/40">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo SMKN 1 Tegalsari" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-blue-700" />
              )}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
              {settings.instansi || 'PEMERINTAH PROVINSI JAWA TIMUR'}
            </p>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 uppercase">
              SISTEM INFORMASI SARPRAS
            </h1>
            <p className="text-xs font-semibold text-blue-100 mt-0.5">
              SMK NEGERI 1 TEGALSARI
            </p>
            <p className="text-[10px] text-blue-200/80 mt-1">
              Pengelolaan Sarana & Prasarana Sekolah
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

            {/* Google Workspace Sign-In Divider & Button per skill specification */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="relative flex py-1 items-center mb-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Atau Masuk Dengan
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setErrorMsg(null);
                  try {
                    await loginWithGoogle();
                    onSuccess();
                  } catch (err: any) {
                    setErrorMsg(err.message || 'Gagal masuk dengan Akun Google.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Masuk dengan Google (Google Drive)</span>
              </button>
            </div>
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
