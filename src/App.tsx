import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ClassManagementView } from './components/ClassManagementView';
import { StudentManagementView } from './components/StudentManagementView';
import { AttendanceView } from './components/AttendanceView';
import { ReportView } from './components/ReportView';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { storageService } from './services/storageService';
import {
  ClassItem,
  StudentItem,
  AttendanceRecord,
  SchoolProfile,
  AttendanceStatus,
} from './types';
import {
  LayoutDashboard,
  School,
  Users,
  ClipboardCheck,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetClassForAttendance, setTargetClassForAttendance] = useState<string | undefined>(
    undefined
  );

  // Core application data loaded from storage
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [profile, setProfile] = useState<SchoolProfile>(storageService.getSchoolProfile());

  // UI Modals & Toasts
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setClasses(storageService.getClasses());
    setStudents(storageService.getStudents());
    setAttendance(storageService.getAttendance());
    setProfile(storageService.getSchoolProfile());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Class Handlers ---
  const handleAddClass = (newCls: Omit<ClassItem, 'id'>) => {
    const created = storageService.addClass(newCls);
    setClasses(storageService.getClasses());
    showToast(`Kelas ${created.name} berhasil ditambahkan!`);
  };

  const handleUpdateClass = (updated: ClassItem) => {
    storageService.updateClass(updated);
    setClasses(storageService.getClasses());
    setStudents(storageService.getStudents()); // In case class name changed
    showToast(`Data kelas ${updated.name} berhasil diperbarui!`);
  };

  const handleDeleteClass = (classId: string) => {
    storageService.deleteClass(classId);
    setClasses(storageService.getClasses());
    showToast('Data kelas berhasil dihapus.');
  };

  // --- Student Handlers ---
  const handleAddStudent = (newStd: Omit<StudentItem, 'id'>) => {
    const created = storageService.addStudent(newStd);
    setStudents(storageService.getStudents());
    showToast(`Siswa ${created.name} berhasil ditambahkan!`);
  };

  const handleUpdateStudent = (updated: StudentItem) => {
    storageService.updateStudent(updated);
    setStudents(storageService.getStudents());
    showToast(`Data siswa ${updated.name} berhasil diperbarui!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    storageService.deleteStudent(studentId);
    setStudents(storageService.getStudents());
    setAttendance(storageService.getAttendance());
    showToast('Data siswa berhasil dihapus.');
  };

  const handleDeleteMultipleStudents = (studentIds: string[]) => {
    storageService.deleteMultipleStudents(studentIds);
    setStudents(storageService.getStudents());
    setAttendance(storageService.getAttendance());
    showToast(`${studentIds.length} data siswa berhasil dihapus.`);
  };

  const handleImportStudents = (
    incoming: Array<Omit<StudentItem, 'id'>>,
    updateExisting: boolean
  ) => {
    const res = storageService.addMultipleStudents(incoming, updateExisting);
    setStudents(storageService.getStudents());
    showToast(`Berhasil mengimpor: ${res.added} siswa baru, ${res.updated} diperbarui!`);
    return res;
  };

  // --- Attendance Handlers ---
  const handleSaveAttendance = (
    date: string,
    classId: string,
    records: Array<{
      studentId: string;
      studentNis: string;
      studentName: string;
      status: AttendanceStatus;
      note?: string;
    }>
  ) => {
    storageService.saveOrUpdateClassAttendance(date, classId, records);
    setAttendance(storageService.getAttendance());
    const cls = classes.find((c) => c.id === classId);
    showToast(`Presensi kelas ${cls?.name || ''} tanggal ${date} tersimpan!`);
  };

  // --- Navigation Helper ---
  const handleNavigate = (tab: string, classId?: string) => {
    if (classId) {
      setTargetClassForAttendance(classId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile Bottom Navigation items
  const mobileNavItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'attendance', label: 'Absensi', icon: ClipboardCheck },
    { id: 'classes', label: 'Kelas', icon: School },
    { id: 'students', label: 'Siswa', icon: Users },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalStudents={students.length}
        totalClasses={classes.length}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            classes={classes}
            students={students}
            attendance={attendance}
            profile={profile}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManagementView
            classes={classes}
            students={students}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            onNavigateToAttendance={(classId) => handleNavigate('attendance', classId)}
          />
        )}

        {activeTab === 'students' && (
          <StudentManagementView
            students={students}
            classes={classes}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onDeleteMultipleStudents={handleDeleteMultipleStudents}
            onImportStudents={handleImportStudents}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            classes={classes}
            students={students}
            attendance={attendance}
            initialClassId={targetClassForAttendance}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {activeTab === 'reports' && (
          <ReportView
            classes={classes}
            students={students}
            attendance={attendance}
            profile={profile}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Very convenient for smartphones & tabs) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg no-print">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={(updatedProfile) => {
          storageService.saveSchoolProfile(updatedProfile);
          setProfile(updatedProfile);
          showToast('Profil sekolah berhasil disimpan!');
        }}
        onResetData={() => {
          storageService.resetAllData();
          loadAllData();
          showToast('Data berhasil direset ke sampel awal!');
        }}
      />
    </div>
  );
}
