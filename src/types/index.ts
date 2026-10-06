export type UserRole = 'admin' | 'sarpras' | 'pemohon';

export type UserStatus = 'aktif' | 'nonaktif';

export interface UserProfile {
  id: string;
  uid: string;
  username: string;
  nama: string;
  email?: string;
  password?: string;
  role: UserRole;
  unitId?: string;
  unitNama?: string;
  jabatan?: string;
  telepon?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UnitKerja {
  id: string;
  nama: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
  updatedAt: string;
}

export type VehicleStatus = 'TERSEDIA' | 'DIGUNAKAN' | 'SERVIS' | 'TIDAK AKTIF';

export interface Vehicle {
  id: string;
  kode: string;
  nama: string;
  jenis: string;
  nomorPolisi: string;
  tahun: string;
  kapasitas: number;
  status: VehicleStatus;
  keterangan?: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
}

export type RoomStatus = 'TERSEDIA' | 'DIGUNAKAN' | 'RENOVASI' | 'TIDAK AKTIF';

export interface Room {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  status: RoomStatus;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConditionStatus = 'BAIK' | 'RUSAK RINGAN' | 'RUSAK BERAT';

export interface Facility {
  id: string;
  nama: string;
  jumlah: number;
  kondisi: ConditionStatus;
  lokasi: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'MENUNGGU PERSETUJUAN'
  | 'DISETUJUI'
  | 'DITOLAK'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface CarBorrowing {
  id: string;
  nomorPengajuan: string; // PM-YYYY-00001
  userId: string;
  userNama: string;
  userUnit: string;
  userEmail?: string;
  kegiatan: string;
  tujuanRute: string;
  kmAwal: string;
  tanggalPinjam: string; // YYYY-MM-DD
  jamBerangkat: string;  // HH:mm
  perkiraanKembali: string; // HH:mm or YYYY-MM-DD HH:mm
  vehicleId: string;
  vehicleNama: string;
  vehicleNoPol: string;
  driverNama: string;
  driverHp: string;
  bbmPercent: number;
  fotoDepan?: string;
  fotoKanan?: string;
  fotoKiri?: string;
  fotoBelakang?: string;
  disetujuiOleh?: string;
  disetujuiJabatan?: string;
  catatan?: string;
  catatanPetugas?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HallBooking {
  id: string;
  nomorPengajuan: string; // AU-YYYY-00001
  userId: string;
  userNama: string;
  userUnit: string;
  userEmail?: string;
  namaKegiatan: string;
  keperluan: string;
  tanggalKegiatan: string; // YYYY-MM-DD
  jamMulai: string;       // HH:mm
  jamSelesai: string;     // HH:mm
  jumlahPeserta: number;
  fasilitas: string[];    // Meja, Kursi, LCD, Sound, Mic, AC/Kipas, Lainnya
  fasilitasLainnya?: string;
  disetujuiOleh?: string;
  disetujuiJabatan?: string;
  keterangan?: string;
  catatanPetugas?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowedEquipmentItem {
  facilityId: string;
  nama: string;
  jumlah: number;
  kondisiSaatPinjam: string;
}

export interface EquipmentBorrowing {
  id: string;
  nomorPengajuan: string; // PR-YYYY-00001
  userId: string;
  userNama: string;
  userUnit: string;
  userEmail?: string;
  keperluan: string;
  tanggalPinjam: string;   // YYYY-MM-DD
  tanggalKembali: string;  // YYYY-MM-DD
  jamPinjam?: string;
  jamKembali?: string;
  items: BorrowedEquipmentItem[];
  disetujuiOleh?: string;
  disetujuiJabatan?: string;
  keterangan?: string;
  catatanPetugas?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  recordId: string;
  jenisPengajuan: 'MOBIL' | 'AULA' | 'PERALATAN';
  statusLama: string;
  statusBaru: string;
  userId: string;
  userNama: string;
  catatan?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'all';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SchoolSettings {
  id?: string;
  namaSekolah: string;
  instansi: string;
  dinas: string;
  alamat: string;
  telepon: string;
  email: string;
  website?: string;
  logoUrl?: string;
  namaPejabat: string;
  jabatanPejabat: string;
  nipPejabat?: string;
  tandaTanganUrl?: string;
  updatedAt?: string;
}
