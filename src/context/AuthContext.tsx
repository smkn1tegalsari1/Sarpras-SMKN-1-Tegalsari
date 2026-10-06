import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { seedInitialDataIfNeeded } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  loginWithUsername: (username: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, nama: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Default demo user profiles with usernames and passwords
const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    id: 'demo-admin-id',
    uid: 'demo-admin-uid',
    username: 'admin',
    password: 'admin123',
    nama: 'Administrator Sarpras',
    email: 'admin.sarpras@smkn1tegalsari.sch.id',
    role: 'admin',
    unitNama: 'Wakil Kepala Sekolah Bidang Sarpras',
    jabatan: 'Koordinator Sarpras SMKN 1 Tegalsari',
    telepon: '081234567890',
    status: 'aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  sarpras: {
    id: 'demo-sarpras-id',
    uid: 'demo-sarpras-uid',
    username: 'sarpras',
    password: 'sarpras123',
    nama: 'Agus Setiawan, S.Pd.',
    email: 'petugas.sarpras@smkn1tegalsari.sch.id',
    role: 'sarpras',
    unitNama: 'Unit Layanan Sarpras',
    jabatan: 'Pengelola Kendaraan & Sarpras',
    telepon: '082198765432',
    status: 'aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  pemohon: {
    id: 'demo-pemohon-id',
    uid: 'demo-pemohon-uid',
    username: 'guru',
    password: 'guru123',
    nama: 'Budi Santoso, M.Kom.',
    email: 'budi.guru@smkn1tegalsari.sch.id',
    role: 'pemohon',
    unitNama: 'Teknik Komputer & Jaringan (TKJ)',
    jabatan: 'Guru Produktif TKJ',
    telepon: '085712349988',
    status: 'aktif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize DB seeds on mount
  useEffect(() => {
    seedInitialDataIfNeeded();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // New user registration profile
            const isDefaultAdmin =
              user.email?.toLowerCase().includes('admin') ||
              user.email?.toLowerCase().includes('smektiofficial') ||
              user.email?.toLowerCase().includes('tegalsari');

            const newProfile: UserProfile = {
              id: user.uid,
              uid: user.uid,
              username: user.email?.split('@')[0]?.toLowerCase() || 'pengguna',
              nama: user.displayName || user.email?.split('@')[0] || 'Pengguna SMKN 1 Tegalsari',
              email: user.email || '',
              role: isDefaultAdmin ? 'admin' : 'pemohon',
              unitNama: 'Teknik Komputer & Jaringan (TKJ)',
              telepon: '08123456789',
              status: 'aktif',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Fallback to active demo profile if network or permissions initial hiccup
          setUserProfile(DEMO_PROFILES.admin);
        }
      } else {
        setCurrentUser(null);
        // Default to active demo admin for immediate access
        const savedDemo = localStorage.getItem('sisarpras_demo_role') as UserRole;
        if (savedDemo && DEMO_PROFILES[savedDemo]) {
          setUserProfile(DEMO_PROFILES[savedDemo]);
        } else {
          setUserProfile(DEMO_PROFILES.admin);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithUsername = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const cleanUser = username.trim().toLowerCase();
      // 1. Try finding in Firestore users collection
      const userRef = collection(db, 'users');
      const snap = await getDocs(userRef);
      let matchedDoc: UserProfile | null = null;

      for (const d of snap.docs) {
        const u = { ...d.data(), id: d.id } as UserProfile;
        if (
          u.username?.trim().toLowerCase() === cleanUser ||
          (u.email && u.email.split('@')[0].toLowerCase() === cleanUser)
        ) {
          matchedDoc = u;
          break;
        }
      }

      if (matchedDoc) {
        if (matchedDoc.status === 'nonaktif') {
          throw new Error('Akun ini sedang dinonaktifkan. Silakan hubungi Administrator.');
        }
        if (matchedDoc.password && matchedDoc.password !== pass) {
          throw new Error('Password salah. Silakan periksa kembali atau hubungi Administrator.');
        }
        setUserProfile(matchedDoc);
        localStorage.setItem('sisarpras_demo_role', matchedDoc.role);
        return;
      }

      // 2. Check built-in demo profiles
      const demoRoles: UserRole[] = ['admin', 'sarpras', 'pemohon'];
      for (const r of demoRoles) {
        const p = DEMO_PROFILES[r];
        if (
          (p.username && p.username.toLowerCase() === cleanUser) ||
          r === cleanUser
        ) {
          if (p.password && p.password !== pass) {
            throw new Error('Password salah. Silakan periksa kembali.');
          }
          setUserProfile(p);
          localStorage.setItem('sisarpras_demo_role', r);
          return;
        }
      }

      throw new Error(`Username "${username}" tidak ditemukan.`);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // If Firebase Auth project doesn't have email-password provider enabled yet in console,
      // provide instant simulated login based on email
      const lower = email.toLowerCase();
      let selectedRole: UserRole = 'pemohon';
      if (lower.includes('admin')) selectedRole = 'admin';
      else if (lower.includes('sarpras')) selectedRole = 'sarpras';

      const matchedProfile = {
        ...DEMO_PROFILES[selectedRole],
        email,
        nama: email.split('@')[0].toUpperCase(),
      };
      setUserProfile(matchedProfile);
      localStorage.setItem('sisarpras_demo_role', selectedRole);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    nama: string,
    role: UserRole = 'pemohon'
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        id: res.user.uid,
        uid: res.user.uid,
        username: email.split('@')[0].toLowerCase(),
        nama,
        email,
        role,
        unitNama: 'Umum / Staf',
        status: 'aktif',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      // Fallback local registration
      const newProfile: UserProfile = {
        id: 'user-' + Date.now(),
        uid: 'user-' + Date.now(),
        username: email.split('@')[0].toLowerCase(),
        nama,
        email,
        role,
        unitNama: 'Umum / Staf',
        status: 'aktif',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(newProfile);
      localStorage.setItem('sisarpras_demo_role', role);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('sisarpras_demo_role');
  };

  const switchDemoRole = async (targetRole: UserRole) => {
    localStorage.setItem('sisarpras_demo_role', targetRole);
    setUserProfile(DEMO_PROFILES[targetRole]);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    try {
      if (currentUser?.uid) {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.id}`);
    }
  };

  const currentRole: UserRole = userProfile?.role || 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: currentRole,
        loading,
        loginWithUsername,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchDemoRole,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
