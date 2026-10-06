import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  UserProfile,
  UnitKerja,
  Vehicle,
  Room,
  Facility,
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  StatusHistoryItem,
  AppNotification,
  SchoolSettings,
  ApplicationStatus,
} from '../types';

// ==========================================
// DEFAULT SCHOOL SETTINGS
// ==========================================
export const DEFAULT_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMK NEGERI 1 TEGALSARI',
  instansi: 'PEMERINTAH PROVINSI JAWA TIMUR',
  dinas: 'DINAS PENDIDIKAN',
  alamat: 'Jl. KH. Syafi\'i No. 01, Dusun Padangbulan, Tegalrejo, Tegalsari, Kabupaten Banyuwangi, Jawa Timur 68485',
  telepon: '(0333) 845999',
  email: 'smkn1tegalsari@yahoo.co.id',
  website: 'smkn1tegalsari.sch.id',
  logoUrl: '',
  namaPejabat: 'Drs. H. Bambang Wijanarko, M.Pd.',
  jabatanPejabat: 'Kepala SMK Negeri 1 Tegalsari',
  nipPejabat: '19680512 199303 1 008',
  tandaTanganUrl: '',
};

// ==========================================
// SEED DATA INITIALIZER
// ==========================================
export async function seedInitialDataIfNeeded() {
  try {
    // 1. Settings
    const settingRef = doc(db, 'settings', 'general');
    const settingSnap = await getDoc(settingRef);
    if (!settingSnap.exists()) {
      await setDoc(settingRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Units
    const unitSnap = await getDocs(collection(db, 'units'));
    if (unitSnap.empty) {
      const initialUnits = [
        'Teknik Kendaraan Ringan (TKR)',
        'Teknik Komputer & Jaringan (TKJ)',
        'Rekayasa Perangkat Lunak (RPL)',
        'Tata Busana (TB)',
        'Bisnis Daring & Pemasaran (BDP)',
        'Bagian Tata Usaha (TU)',
        'Wakil Kepala Sekolah Bidang Sarpras',
        'Wakil Kepala Sekolah Bidang Kesiswaan',
        'Wakil Kepala Sekolah Bidang Kurikulum',
        'Bimbingan Konseling (BK)',
        'Unit Perpustakaan',
        'OSIS & MPK',
      ];
      for (const nama of initialUnits) {
        const newRef = doc(collection(db, 'units'));
        await setDoc(newRef, {
          id: newRef.id,
          nama,
          status: 'aktif',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 3. Vehicles
    const vehicleSnap = await getDocs(collection(db, 'vehicles'));
    if (vehicleSnap.empty) {
      const initialVehicles: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          kode: 'MOB-01',
          nama: 'Toyota HiAce Commuter Bus',
          jenis: 'Microbus',
          nomorPolisi: 'P 7012 VZ',
          tahun: '2021',
          kapasitas: 16,
          status: 'TERSEDIA',
          keterangan: 'Kondisi prima, AC dingin, khusus dinas rombongan luar kota',
        },
        {
          kode: 'MOB-02',
          nama: 'Toyota Avanza 1.3 G M/T',
          jenis: 'Minibus / MPV',
          nomorPolisi: 'P 1450 WS',
          tahun: '2020',
          kapasitas: 7,
          status: 'TERSEDIA',
          keterangan: 'Operasional kepala sekolah & dinas harian staf',
        },
        {
          kode: 'MOB-03',
          nama: 'Daihatsu Gran Max Blind Van / Pick Up',
          jenis: 'Angkutan Logistik',
          nomorPolisi: 'P 8192 UK',
          tahun: '2019',
          kapasitas: 3,
          status: 'TERSEDIA',
          keterangan: 'Angkut barang kegiatan, pameran produk jurusan & sarana',
        },
        {
          kode: 'MOB-04',
          nama: 'Isuzu Elf Long Bus',
          jenis: 'Bus Sedang',
          nomorPolisi: 'P 7552 VP',
          tahun: '2018',
          kapasitas: 20,
          status: 'SERVIS',
          keterangan: 'Sedang perawatan berkala bengkel resmi',
        },
      ];
      for (const v of initialVehicles) {
        const newRef = doc(collection(db, 'vehicles'));
        await setDoc(newRef, {
          ...v,
          id: newRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Rooms
    const roomSnap = await getDocs(collection(db, 'rooms'));
    if (roomSnap.empty) {
      const initialRooms: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          kode: 'R-AULA-01',
          nama: 'Graha Utama Aula SMKN 1 Tegalsari',
          kapasitas: 500,
          lokasi: 'Gedung A Lantai 2',
          status: 'TERSEDIA',
          keterangan: 'Dilengkapi panggung kehormatan, sound system, & LCD layar besar',
        },
        {
          kode: 'R-RAPAT-01',
          nama: 'Ruang Rapat Utama Guru & Yayasan',
          kapasitas: 50,
          lokasi: 'Gedung Utama Lantai 1',
          status: 'TERSEDIA',
          keterangan: 'Meja konferensi, mikrofon delegasi, AC central',
        },
        {
          kode: 'R-LAB-01',
          nama: 'Multimedia Center / Aula Mini',
          kapasitas: 80,
          lokasi: 'Gedung Praktik Kejuruan',
          status: 'TERSEDIA',
          keterangan: 'Untuk workshop, webinar, dan uji kompetensi',
        },
      ];
      for (const r of initialRooms) {
        const newRef = doc(collection(db, 'rooms'));
        await setDoc(newRef, {
          ...r,
          id: newRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 5. Facilities
    const facilitySnap = await getDocs(collection(db, 'facilities'));
    if (facilitySnap.empty) {
      const initialFacilities: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          nama: 'Kursi Lipat Chitose',
          jumlah: 350,
          kondisi: 'BAIK',
          lokasi: 'Gudang Sarpras Aula',
          keterangan: 'Siap digunakan untuk kegiatan aula',
        },
        {
          nama: 'Meja Rapat Panjang IBM',
          jumlah: 40,
          kondisi: 'BAIK',
          lokasi: 'Gudang Sarpras Aula',
          keterangan: 'Termasuk cover taplak meja resmi',
        },
        {
          nama: 'LCD Proyektor EPSON 4500 Lumens',
          jumlah: 3,
          kondisi: 'BAIK',
          lokasi: 'Ruang Teknis Multimedia',
          keterangan: 'HDMI & Wireless Display ready',
        },
        {
          nama: 'Sound System Yamaha Active + Subwoofer',
          jumlah: 2,
          kondisi: 'BAIK',
          lokasi: 'Gedung Aula Utama',
          keterangan: 'Output 2000 Watt',
        },
        {
          nama: 'Wireless Microphone Shure (Set)',
          jumlah: 4,
          kondisi: 'BAIK',
          lokasi: 'Ruang Operator Sarpras',
          keterangan: 'Baterai rechargeable',
        },
        {
          nama: 'Standing AC Portable 5 PK',
          jumlah: 4,
          kondisi: 'BAIK',
          lokasi: 'Aula Utama',
          keterangan: 'Fasilitas pendingin ruangan cadangan',
        },
      ];
      for (const f of initialFacilities) {
        const newRef = doc(collection(db, 'facilities'));
        await setDoc(newRef, {
          ...f,
          id: newRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 6. Default Users (username & password)
    const userSnap = await getDocs(collection(db, 'users'));
    if (userSnap.empty) {
      const initialUsers: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          uid: 'usr-admin-default',
          username: 'admin',
          password: 'admin123',
          nama: 'Administrator Sarpras',
          email: 'admin@smkn1tegalsari.sch.id',
          role: 'admin',
          unitNama: 'Wakil Kepala Sekolah Bidang Sarpras',
          jabatan: 'Koordinator Sarpras SMKN 1 Tegalsari',
          telepon: '081234567890',
          status: 'aktif',
        },
        {
          uid: 'usr-sarpras-default',
          username: 'sarpras',
          password: 'sarpras123',
          nama: 'Agus Setiawan, S.Pd.',
          email: 'sarpras@smkn1tegalsari.sch.id',
          role: 'sarpras',
          unitNama: 'Unit Layanan Sarpras',
          jabatan: 'Pengelola Kendaraan & Sarpras',
          telepon: '082198765432',
          status: 'aktif',
        },
        {
          uid: 'usr-guru-default',
          username: 'guru',
          password: 'guru123',
          nama: 'Budi Santoso, M.Kom.',
          email: 'guru@smkn1tegalsari.sch.id',
          role: 'pemohon',
          unitNama: 'Teknik Komputer & Jaringan (TKJ)',
          jabatan: 'Guru Produktif TKJ',
          telepon: '085712349988',
          status: 'aktif',
        },
      ];
      for (const u of initialUsers) {
        const newRef = doc(collection(db, 'users'));
        await setDoc(newRef, {
          ...u,
          id: newRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Auto-seed noticed:', err);
  }
}

// User lookup and password management
export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as UserProfile;
    }
    // Also try case-insensitive or exact
    const allUsers = await getDocs(collection(db, 'users'));
    for (const d of allUsers.docs) {
      const data = d.data() as UserProfile;
      if (data.username?.toLowerCase() === username.trim().toLowerCase()) {
        return { ...data, id: d.id };
      }
    }
    return null;
  } catch (err) {
    console.error('Error finding user by username:', err);
    return null;
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      password: newPassword,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

// ==========================================
// NUMBER GENERATORS
// ==========================================
export async function generateCarBorrowingNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PM-${currentYear}-`;
  try {
    const q = query(
      collection(db, 'carBorrowings'),
      where('nomorPengajuan', '>=', prefix),
      where('nomorPengajuan', '<=', prefix + '\uf8ff')
    );
    const snap = await getDocs(q);
    const nextCount = snap.size + 1;
    return `${prefix}${String(nextCount).padStart(5, '0')}`;
  } catch {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomSuffix}`;
  }
}

export async function generateHallBookingNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `AU-${currentYear}-`;
  try {
    const q = query(
      collection(db, 'hallBookings'),
      where('nomorPengajuan', '>=', prefix),
      where('nomorPengajuan', '<=', prefix + '\uf8ff')
    );
    const snap = await getDocs(q);
    const nextCount = snap.size + 1;
    return `${prefix}${String(nextCount).padStart(5, '0')}`;
  } catch {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomSuffix}`;
  }
}

export async function generateEquipmentBorrowingNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PR-${currentYear}-`;
  try {
    const q = query(
      collection(db, 'equipmentBorrowings'),
      where('nomorPengajuan', '>=', prefix),
      where('nomorPengajuan', '<=', prefix + '\uf8ff')
    );
    const snap = await getDocs(q);
    const nextCount = snap.size + 1;
    return `${prefix}${String(nextCount).padStart(5, '0')}`;
  } catch {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomSuffix}`;
  }
}

// ==========================================
// CONFLICT CHECKERS
// ==========================================
// Helper to compare time intervals
function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  // normalize e.g. "08:00" -> 480 minutes
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const sA = toMin(startA);
  const eA = toMin(endA);
  const sB = toMin(startB);
  const eB = toMin(endB);

  return sA < eB && sB < eA;
}

export async function checkCarConflict(
  vehicleId: string,
  tanggalPinjam: string,
  jamBerangkat: string,
  perkiraanKembali: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'carBorrowings'),
      where('vehicleId', '==', vehicleId),
      where('tanggalPinjam', '==', tanggalPinjam)
    );
    const snap = await getDocs(q);
    let conflict = false;

    snap.forEach((d) => {
      if (excludeId && d.id === excludeId) return;
      const data = d.data() as CarBorrowing;
      // only check active or approved or pending statuses
      if (['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(data.status)) {
        if (
          isTimeOverlapping(
            jamBerangkat,
            perkiraanKembali,
            data.jamBerangkat,
            data.perkiraanKembali
          )
        ) {
          conflict = true;
        }
      }
    });

    return conflict;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'carBorrowings');
    return false;
  }
}

export async function checkHallConflict(
  tanggalKegiatan: string,
  jamMulai: string,
  jamSelesai: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'hallBookings'),
      where('tanggalKegiatan', '==', tanggalKegiatan)
    );
    const snap = await getDocs(q);
    let conflict = false;

    snap.forEach((d) => {
      if (excludeId && d.id === excludeId) return;
      const data = d.data() as HallBooking;
      if (['MENUNGGU PERSETUJUAN', 'DISETUJUI'].includes(data.status)) {
        if (isTimeOverlapping(jamMulai, jamSelesai, data.jamMulai, data.jamSelesai)) {
          conflict = true;
        }
      }
    });

    return conflict;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'hallBookings');
    return false;
  }
}

// ==========================================
// STATUS HISTORY LOGGING
// ==========================================
export async function logStatusHistory(params: {
  recordId: string;
  jenisPengajuan: 'MOBIL' | 'AULA' | 'PERALATAN';
  statusLama: string;
  statusBaru: string;
  userId: string;
  userNama: string;
  catatan?: string;
}) {
  try {
    const colRef = collection(db, 'statusHistory');
    await addDoc(colRef, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log status history:', err);
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================
export async function createNotification(params: {
  userId?: string;
  targetRole?: 'admin' | 'sarpras' | 'pemohon' | 'all';
  title: string;
  message: string;
  link?: string;
}) {
  try {
    const colRef = collection(db, 'notifications');
    await addDoc(colRef, {
      ...params,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// ==========================================
// REAL-TIME HELPERS
// ==========================================
export function subscribeSettings(callback: (settings: SchoolSettings) => void) {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SchoolSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    }
  );
}

export function subscribeCarBorrowings(callback: (items: CarBorrowing[]) => void) {
  const colRef = collection(db, 'carBorrowings');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: CarBorrowing[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as CarBorrowing));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'carBorrowings');
    }
  );
}

export function subscribeHallBookings(callback: (items: HallBooking[]) => void) {
  const colRef = collection(db, 'hallBookings');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: HallBooking[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as HallBooking));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'hallBookings');
    }
  );
}

export function subscribeEquipmentBorrowings(callback: (items: EquipmentBorrowing[]) => void) {
  const colRef = collection(db, 'equipmentBorrowings');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: EquipmentBorrowing[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as EquipmentBorrowing));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'equipmentBorrowings');
    }
  );
}

export function subscribeVehicles(callback: (items: Vehicle[]) => void) {
  const colRef = collection(db, 'vehicles');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: Vehicle[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Vehicle));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    }
  );
}

export function subscribeRooms(callback: (items: Room[]) => void) {
  const colRef = collection(db, 'rooms');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: Room[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Room));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    }
  );
}

export function subscribeFacilities(callback: (items: Facility[]) => void) {
  const colRef = collection(db, 'facilities');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: Facility[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Facility));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'facilities');
    }
  );
}

export function subscribeUnits(callback: (items: UnitKerja[]) => void) {
  const colRef = collection(db, 'units');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: UnitKerja[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as UnitKerja));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'units');
    }
  );
}

export function subscribeUsers(callback: (items: UserProfile[]) => void) {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as UserProfile));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

export function subscribeNotifications(
  userId: string,
  role: string,
  callback: (items: AppNotification[]) => void
) {
  const colRef = collection(db, 'notifications');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const list: AppNotification[] = [];
      snap.forEach((d) => {
        const item = { ...d.data(), id: d.id } as AppNotification;
        if (
          !item.userId ||
          item.userId === userId ||
          item.targetRole === 'all' ||
          item.targetRole === role
        ) {
          list.push(item);
        }
      });
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    }
  );
}

export function subscribeStatusHistory(
  recordId: string,
  callback: (items: StatusHistoryItem[]) => void
) {
  const colRef = collection(db, 'statusHistory');
  const q = query(
    colRef,
    where('recordId', '==', recordId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: StatusHistoryItem[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as StatusHistoryItem));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'statusHistory');
    }
  );
}
