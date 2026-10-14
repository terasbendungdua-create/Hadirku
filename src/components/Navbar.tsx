import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileSpreadsheet,
  Settings,
  Menu,
  X,
  School,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { SchoolProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: SchoolProfile;
  onOpenSettings: () => void;
  totalStudents: number;
  totalClasses: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenSettings,
  totalStudents,
  totalClasses,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'classes', label: 'Data Kelas', icon: School },
    { id: 'students', label: 'Data Siswa', icon: Users },
    { id: 'attendance', label: 'Absensi', icon: ClipboardCheck },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ];

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Hadir<span className="text-emerald-600">Ku</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-500" />
                  Presensi Digital
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {profile.name}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick date display */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{todayStr}</span>
            </div>

            {/* School Profile / Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Pengaturan Sekolah & Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Menu Navigasi</span>
            <span className="text-[11px] text-slate-500 font-normal">{todayStr}</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'classes' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {totalClasses}
                  </span>
                )}
                {item.id === 'students' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {totalStudents}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
