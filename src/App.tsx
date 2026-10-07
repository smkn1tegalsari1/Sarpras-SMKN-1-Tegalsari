import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { CarBorrowingList } from './pages/car/CarBorrowingList';
import { CarBorrowingForm } from './pages/car/CarBorrowingForm';
import { CarDetailModal } from './pages/car/CarDetailModal';
import { HallBookingList } from './pages/hall/HallBookingList';
import { HallBookingForm } from './pages/hall/HallBookingForm';
import { HallDetailModal } from './pages/hall/HallDetailModal';
import { EquipmentBorrowingList } from './pages/equipment/EquipmentBorrowingList';
import { EquipmentBorrowingForm } from './pages/equipment/EquipmentBorrowingForm';
import { EquipmentDetailModal } from './pages/equipment/EquipmentDetailModal';
import { SarprasCalendar } from './pages/calendar/SarprasCalendar';
import { VehiclesPage } from './pages/inventory/VehiclesPage';
import { RoomsPage } from './pages/inventory/RoomsPage';
import { FacilitiesPage } from './pages/inventory/FacilitiesPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { UnitsPage } from './pages/admin/UnitsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { PrintCarDoc } from './components/print/PrintCarDoc';
import { PrintHallDoc } from './components/print/PrintHallDoc';
import { PrintEquipmentDoc } from './components/print/PrintEquipmentDoc';
import { Modal } from './components/common/Modal';
import {
  CarBorrowing,
  HallBooking,
  EquipmentBorrowing,
  Vehicle,
  Room,
  Facility,
  UnitKerja,
  UserProfile,
  UserRole,
  AppNotification,
  SchoolSettings,
  ApplicationStatus,
} from './types';
import {
  subscribeSettings,
  subscribeCarBorrowings,
  subscribeHallBookings,
  subscribeEquipmentBorrowings,
  subscribeVehicles,
  subscribeRooms,
  subscribeFacilities,
  subscribeUnits,
  subscribeUsers,
  subscribeNotifications,
  DEFAULT_SETTINGS,
  logStatusHistory,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './services/db';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

const ALLOWED_TABS_BY_ROLE: Record<UserRole, string[]> = {
  admin: [
    'dashboard',
    'car_list',
    'car_new',
    'hall_list',
    'hall_new',
    'equipment_list',
    'equipment_new',
    'sarpras_calendar',
    'vehicles',
    'rooms',
    'facilities',
    'report_cars',
    'report_halls',
    'report_equipment',
    'report_rekap',
    'users',
    'units',
    'settings',
  ],
  sarpras: [
    'dashboard',
    'car_list',
    'car_new',
    'hall_list',
    'hall_new',
    'equipment_list',
    'equipment_new',
    'sarpras_calendar',
    'vehicles',
    'rooms',
    'facilities',
    'report_cars',
    'report_halls',
    'report_equipment',
    'report_rekap',
  ],
  pemohon: [
    'dashboard',
    'car_list',
    'car_new',
    'hall_list',
    'hall_new',
    'equipment_list',
    'equipment_new',
    'sarpras_calendar',
  ],
};

const AppContent: React.FC = () => {
  const { userProfile, role, loading } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enforce strict role-based tab access
  useEffect(() => {
    const allowed = ALLOWED_TABS_BY_ROLE[role] || ['dashboard'];
    if (!allowed.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  // Real-time Firestore state
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [carBorrowings, setCarBorrowings] = useState<CarBorrowing[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [equipmentBorrowings, setEquipmentBorrowings] = useState<EquipmentBorrowing[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [units, setUnits] = useState<UnitKerja[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modals and print sheets
  const [selectedCarDetail, setSelectedCarDetail] = useState<CarBorrowing | null>(null);
  const [selectedHallDetail, setSelectedHallDetail] = useState<HallBooking | null>(null);
  const [selectedEquipmentDetail, setSelectedEquipmentDetail] = useState<EquipmentBorrowing | null>(null);
  const [carToPrint, setCarToPrint] = useState<CarBorrowing | null>(null);
  const [hallToPrint, setHallToPrint] = useState<HallBooking | null>(null);
  const [equipmentToPrint, setEquipmentToPrint] = useState<EquipmentBorrowing | null>(null);

  // Real-time Firestore subscriptions
  useEffect(() => {
    const unsubSettings = subscribeSettings(setSettings);
    const unsubCars = subscribeCarBorrowings(setCarBorrowings);
    const unsubHalls = subscribeHallBookings(setHallBookings);
    const unsubEquipments = subscribeEquipmentBorrowings(setEquipmentBorrowings);
    const unsubVehicles = subscribeVehicles(setVehicles);
    const unsubRooms = subscribeRooms(setRooms);
    const unsubFacilities = subscribeFacilities(setFacilities);
    const unsubUnits = subscribeUnits(setUnits);
    const unsubUsers = subscribeUsers(setUsers);

    return () => {
      unsubSettings();
      unsubCars();
      unsubHalls();
      unsubEquipments();
      unsubVehicles();
      unsubRooms();
      unsubFacilities();
      unsubUnits();
      unsubUsers();
    };
  }, []);

  // Notifications subscription
  useEffect(() => {
    if (userProfile?.uid) {
      const unsubNotif = subscribeNotifications(
        userProfile.uid,
        userProfile.role,
        setNotifications
      );
      return () => unsubNotif();
    }
  }, [userProfile?.uid, userProfile?.role]);

  // Handle Car Borrowing status update
  const handleUpdateCarStatus = async (
    item: CarBorrowing,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    try {
      const ref = doc(db, 'carBorrowings', item.id);
      await updateDoc(ref, {
        status: newStatus,
        catatanPetugas: note || '',
        updatedAt: new Date().toISOString(),
      });

      // Update vehicle status accordingly
      if (item.vehicleId) {
        const vRef = doc(db, 'vehicles', item.vehicleId);
        if (newStatus === 'DISETUJUI') {
          await updateDoc(vRef, { status: 'DIGUNAKAN' });
        } else if (['SELESAI', 'DITOLAK', 'DIBATALKAN'].includes(newStatus)) {
          await updateDoc(vRef, { status: 'TERSEDIA' });
        }
      }

      // Log status history
      await logStatusHistory({
        recordId: item.id,
        jenisPengajuan: 'MOBIL',
        statusLama: item.status,
        statusBaru: newStatus,
        userId: userProfile?.uid || 'user',
        userNama: userProfile?.nama || 'Petugas',
        catatan: note || `Status diperbarui menjadi ${newStatus}`,
      });

      // Notification
      let notifTitle = 'Pembaruan Peminjaman Mobil';
      let notifMsg = `Pengajuan ${item.nomorPengajuan} diperbarui menjadi ${newStatus}.`;
      if (newStatus === 'DISETUJUI') {
        notifTitle = 'Pengajuan Mobil Disetujui';
        notifMsg = 'Pengajuan Anda telah disetujui.';
      } else if (newStatus === 'DITOLAK') {
        notifTitle = 'Pengajuan Mobil Ditolak';
        notifMsg = 'Pengajuan Anda ditolak.';
      }

      await createNotification({
        userId: item.userId,
        title: notifTitle,
        message: notifMsg,
        link: 'car_list',
      });

      // Close modal if open
      setSelectedCarDetail(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `carBorrowings/${item.id}`);
    }
  };

  // Handle Hall Booking status update
  const handleUpdateHallStatus = async (
    item: HallBooking,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    try {
      const ref = doc(db, 'hallBookings', item.id);
      await updateDoc(ref, {
        status: newStatus,
        catatanPetugas: note || '',
        updatedAt: new Date().toISOString(),
      });

      await logStatusHistory({
        recordId: item.id,
        jenisPengajuan: 'AULA',
        statusLama: item.status,
        statusBaru: newStatus,
        userId: userProfile?.uid || 'user',
        userNama: userProfile?.nama || 'Petugas',
        catatan: note || `Status diperbarui menjadi ${newStatus}`,
      });

      let notifTitle = 'Pembaruan Penggunaan Aula';
      let notifMsg = `Pengajuan ${item.nomorPengajuan} diperbarui menjadi ${newStatus}.`;
      if (newStatus === 'DISETUJUI') {
        notifTitle = 'Pengajuan Aula Disetujui';
        notifMsg = 'Pengajuan Anda telah disetujui.';
      } else if (newStatus === 'DITOLAK') {
        notifTitle = 'Pengajuan Aula Ditolak';
        notifMsg = 'Pengajuan Anda ditolak.';
      }

      await createNotification({
        userId: item.userId,
        title: notifTitle,
        message: notifMsg,
        link: 'hall_list',
      });

      setSelectedHallDetail(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hallBookings/${item.id}`);
    }
  };

  // Handle Equipment Borrowing status update
  const handleUpdateEquipmentStatus = async (
    item: EquipmentBorrowing,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    try {
      const ref = doc(db, 'equipmentBorrowings', item.id);
      await updateDoc(ref, {
        status: newStatus,
        catatanPetugas: note || '',
        updatedAt: new Date().toISOString(),
      });

      await logStatusHistory({
        recordId: item.id,
        jenisPengajuan: 'PERALATAN',
        statusLama: item.status,
        statusBaru: newStatus,
        userId: userProfile?.uid || 'user',
        userNama: userProfile?.nama || 'Petugas',
        catatan: note || `Status diperbarui menjadi ${newStatus}`,
      });

      let notifTitle = 'Pembaruan Peminjaman Peralatan';
      let notifMsg = `Pengajuan ${item.nomorPengajuan} diperbarui menjadi ${newStatus}.`;
      if (newStatus === 'DISETUJUI') {
        notifTitle = 'Peminjaman Peralatan Disetujui';
        notifMsg = 'Pengajuan peminjaman peralatan Anda telah disetujui.';
      } else if (newStatus === 'DITOLAK') {
        notifTitle = 'Peminjaman Peralatan Ditolak';
        notifMsg = 'Pengajuan peminjaman peralatan Anda ditolak.';
      } else if (newStatus === 'SELESAI') {
        notifTitle = 'Peminjaman Peralatan Selesai';
        notifMsg = 'Pengembalian peralatan telah diverifikasi dan selesai.';
      }

      await createNotification({
        userId: item.userId,
        title: notifTitle,
        message: notifMsg,
        link: 'equipment_list',
      });

      setSelectedEquipmentDetail(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `equipmentBorrowings/${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-wide">Memuat SISARPRAS SMKN 1 Tegalsari...</p>
      </div>
    );
  }

  // If user is not logged in
  if (!userProfile) {
    return <LoginPage settings={settings} onSuccess={() => setActiveTab('dashboard')} />;
  }

  const pendingCarCount = carBorrowings.filter((c) => c.status === 'MENUNGGU PERSETUJUAN').length;
  const pendingHallCount = hallBookings.filter((h) => h.status === 'MENUNGGU PERSETUJUAN').length;
  const pendingEquipmentCount = equipmentBorrowings.filter((e) => e.status === 'MENUNGGU PERSETUJUAN').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        settings={settings}
        pendingCarCount={pendingCarCount}
        pendingHallCount={pendingHallCount}
        pendingEquipmentCount={pendingEquipmentCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          settings={settings}
          notifications={notifications}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              carBorrowings={carBorrowings}
              hallBookings={hallBookings}
              equipmentBorrowings={equipmentBorrowings}
              vehicles={vehicles}
              rooms={rooms}
              facilities={facilities}
              notifications={notifications}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCarDetail={(item) => setSelectedCarDetail(item)}
              onOpenHallDetail={(item) => setSelectedHallDetail(item)}
              onOpenEquipmentDetail={(item) => setSelectedEquipmentDetail(item)}
              onMarkNotificationAsRead={markNotificationAsRead}
              onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
            />
          )}

          {activeTab === 'car_list' && (
            <CarBorrowingList
              carBorrowings={carBorrowings}
              onNavigateNew={() => setActiveTab('car_new')}
              onNavigateCalendar={() => setActiveTab('sarpras_calendar')}
              onOpenDetail={(item) => setSelectedCarDetail(item)}
              onPrintDoc={(item) => setCarToPrint(item)}
              onUpdateStatus={handleUpdateCarStatus}
            />
          )}

          {activeTab === 'car_new' && (
            <CarBorrowingForm
              vehicles={vehicles}
              units={units}
              settings={settings}
              onSuccess={() => setActiveTab('car_list')}
              onCancel={() => setActiveTab('car_list')}
            />
          )}

          {activeTab === 'hall_list' && (
            <HallBookingList
              hallBookings={hallBookings}
              onNavigateNew={() => setActiveTab('hall_new')}
              onNavigateCalendar={() => setActiveTab('sarpras_calendar')}
              onOpenDetail={(item) => setSelectedHallDetail(item)}
              onPrintDoc={(item) => setHallToPrint(item)}
              onUpdateStatus={handleUpdateHallStatus}
            />
          )}

          {activeTab === 'hall_new' && (
            <HallBookingForm
              units={units}
              settings={settings}
              onSuccess={() => setActiveTab('hall_list')}
              onCancel={() => setActiveTab('hall_list')}
            />
          )}

          {activeTab === 'equipment_list' && (
            <EquipmentBorrowingList
              equipmentBorrowings={equipmentBorrowings}
              onNavigateNew={() => setActiveTab('equipment_new')}
              onNavigateCalendar={() => setActiveTab('sarpras_calendar')}
              onOpenDetail={(item) => setSelectedEquipmentDetail(item)}
              onPrintDoc={(item) => setEquipmentToPrint(item)}
              onUpdateStatus={handleUpdateEquipmentStatus}
            />
          )}

          {activeTab === 'equipment_new' && (
            <EquipmentBorrowingForm
              facilities={facilities}
              units={units}
              settings={settings}
              onSuccess={() => setActiveTab('equipment_list')}
              onCancel={() => setActiveTab('equipment_list')}
            />
          )}

          {activeTab === 'sarpras_calendar' && (
            <SarprasCalendar
              carBorrowings={carBorrowings}
              hallBookings={hallBookings}
              equipmentBorrowings={equipmentBorrowings}
              units={units}
              onOpenCarDetail={(item) => setSelectedCarDetail(item)}
              onOpenHallDetail={(item) => setSelectedHallDetail(item)}
              onOpenEquipmentDetail={(item) => setSelectedEquipmentDetail(item)}
            />
          )}

          {/* SARANA & PRASARANA (Hanya Admin & Sarpras) */}
          {(role === 'admin' || role === 'sarpras') && (
            <>
              {activeTab === 'vehicles' && <VehiclesPage vehicles={vehicles} />}
              {activeTab === 'rooms' && <RoomsPage rooms={rooms} />}
              {activeTab === 'facilities' && <FacilitiesPage facilities={facilities} />}
            </>
          )}

          {/* LAPORAN (Hanya Admin & Sarpras) */}
          {(role === 'admin' || role === 'sarpras') && (
            <>
              {activeTab === 'report_cars' && (
                <ReportsPage
                  carBorrowings={carBorrowings}
                  hallBookings={hallBookings}
                  equipmentBorrowings={equipmentBorrowings}
                  vehicles={vehicles}
                  rooms={rooms}
                  facilities={facilities}
                  units={units}
                  settings={settings}
                  defaultMode="CARS"
                />
              )}

              {activeTab === 'report_halls' && (
                <ReportsPage
                  carBorrowings={carBorrowings}
                  hallBookings={hallBookings}
                  equipmentBorrowings={equipmentBorrowings}
                  vehicles={vehicles}
                  rooms={rooms}
                  facilities={facilities}
                  units={units}
                  settings={settings}
                  defaultMode="HALLS"
                />
              )}

              {activeTab === 'report_equipment' && (
                <ReportsPage
                  carBorrowings={carBorrowings}
                  hallBookings={hallBookings}
                  equipmentBorrowings={equipmentBorrowings}
                  vehicles={vehicles}
                  rooms={rooms}
                  facilities={facilities}
                  units={units}
                  settings={settings}
                  defaultMode="EQUIPMENT"
                />
              )}

              {activeTab === 'report_rekap' && (
                <ReportsPage
                  carBorrowings={carBorrowings}
                  hallBookings={hallBookings}
                  equipmentBorrowings={equipmentBorrowings}
                  vehicles={vehicles}
                  rooms={rooms}
                  facilities={facilities}
                  units={units}
                  settings={settings}
                  defaultMode="REKAP"
                />
              )}
            </>
          )}

          {/* ADMINISTRASI (Hanya Admin) */}
          {role === 'admin' && (
            <>
              {activeTab === 'users' && <UsersPage users={users} units={units} />}
              {activeTab === 'units' && <UnitsPage units={units} />}
              {activeTab === 'settings' && (
                <SettingsPage settings={settings} onUpdated={(s) => setSettings(s)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Car Detail Modal */}
      {selectedCarDetail && (
        <Modal
          isOpen={!!selectedCarDetail}
          onClose={() => setSelectedCarDetail(null)}
          title="Detail Peminjaman Mobil Sekolah"
          subtitle={`Nomor: ${selectedCarDetail.nomorPengajuan}`}
          maxWidth="3xl"
        >
          <CarDetailModal
            data={selectedCarDetail}
            onClose={() => setSelectedCarDetail(null)}
            onPrint={(item) => {
              setSelectedCarDetail(null);
              setCarToPrint(item);
            }}
            onUpdateStatus={handleUpdateCarStatus}
          />
        </Modal>
      )}

      {/* Hall Detail Modal */}
      {selectedHallDetail && (
        <Modal
          isOpen={!!selectedHallDetail}
          onClose={() => setSelectedHallDetail(null)}
          title="Detail Penggunaan Ruang Aula"
          subtitle={`Nomor: ${selectedHallDetail.nomorPengajuan}`}
          maxWidth="3xl"
        >
          <HallDetailModal
            data={selectedHallDetail}
            onClose={() => setSelectedHallDetail(null)}
            onPrint={(item) => {
              setSelectedHallDetail(null);
              setHallToPrint(item);
            }}
            onUpdateStatus={handleUpdateHallStatus}
          />
        </Modal>
      )}

      {/* Equipment Detail Modal */}
      {selectedEquipmentDetail && (
        <Modal
          isOpen={!!selectedEquipmentDetail}
          onClose={() => setSelectedEquipmentDetail(null)}
          title="Detail Peminjaman Peralatan / Sarpras"
          subtitle={`Nomor: ${selectedEquipmentDetail.nomorPengajuan}`}
          maxWidth="3xl"
        >
          <EquipmentDetailModal
            data={selectedEquipmentDetail}
            onClose={() => setSelectedEquipmentDetail(null)}
            onPrint={(item) => {
              setSelectedEquipmentDetail(null);
              setEquipmentToPrint(item);
            }}
            onUpdateStatus={handleUpdateEquipmentStatus}
          />
        </Modal>
      )}

      {/* Printable Car Borrowing Sheet A4 */}
      {carToPrint && (
        <PrintCarDoc
          data={carToPrint}
          settings={settings}
          onClose={() => setCarToPrint(null)}
        />
      )}

      {/* Printable Hall Booking Sheet A4 */}
      {hallToPrint && (
        <PrintHallDoc
          data={hallToPrint}
          settings={settings}
          onClose={() => setHallToPrint(null)}
        />
      )}

      {/* Printable Equipment Borrowing Sheet A4 */}
      {equipmentToPrint && (
        <PrintEquipmentDoc
          data={equipmentToPrint}
          settings={settings}
          onClose={() => setEquipmentToPrint(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
