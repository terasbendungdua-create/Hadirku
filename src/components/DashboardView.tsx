import React, { useMemo } from 'react';
import {
  Users,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  ClipboardList,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { ClassItem, StudentItem, AttendanceRecord, SchoolProfile } from '../types';

interface DashboardViewProps {
  classes: ClassItem[];
  students: StudentItem[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
  onNavigate: (tab: string, classId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  students,
  attendance,
  profile,
  onNavigate,
}) => {
  // Current Date string (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's attendance records
  const todayRecords = useMemo(() => {
    return attendance.filter((r) => r.date === todayStr);
  }, [attendance, todayStr]);

  // Statistics for Today
  const statsToday = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === 'Aktif');
    const totalActive = activeStudents.length;

    const hadir = todayRecords.filter((r) => r.status === 'Hadir').length;
    const sakit = todayRecords.filter((r) => r.status === 'Sakit').length;
    const izin = todayRecords.filter((r) => r.status === 'Izin').length;
    const alpha = todayRecords.filter((r) => r.status === 'Alpha').length;

    const totalRecorded = hadir + sakit + izin + alpha;
    const percentage = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

    return {
      totalActive,
      totalRecorded,
      hadir,
      sakit,
      izin,
      alpha,
      percentage,
      maleCount: activeStudents.filter((s) => s.gender === 'L').length,
      femaleCount: activeStudents.filter((s) => s.gender === 'P').length,
    };
  }, [students, todayRecords]);

  // Class performance comparison for today
  const classPerformance = useMemo(() => {
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id && s.status === 'Aktif');
      const clsRecords = todayRecords.filter((r) => r.classId === cls.id);

      const hadir = clsRecords.filter((r) => r.status === 'Hadir').length;
      const sakit = clsRecords.filter((r) => r.status === 'Sakit').length;
      const izin = clsRecords.filter((r) => r.status === 'Izin').length;
      const alpha = clsRecords.filter((r) => r.status === 'Alpha').length;

      const total = clsRecords.length;
      const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
      const isRecorded = total > 0;

      return {
        id: cls.id,
        name: cls.name,
        teacher: cls.homeroomTeacher,
        studentCount: classStudents.length,
        hadir,
        sakit,
        izin,
        alpha,
        percentage: pct,
        isRecorded,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [classes, students, todayRecords]);

  // Weekly Trend: Last 7 days
  const weeklyTrend = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const dayRecords = attendance.filter((r) => r.date === dStr);
      const hadir = dayRecords.filter((r) => r.status === 'Hadir').length;
      const total = dayRecords.length;
      const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      const dayDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'numeric' }).format(d);

      list.push({
        date: dStr,
        dayName,
        dayDate,
        hadir,
        total,
        pct,
        isToday: dStr === todayStr,
      });
    }

    return list;
  }, [attendance, todayStr]);

  // List of absent students today (Sakit, Izin, Alpha) for quick monitoring
  const absentStudentsToday = useMemo(() => {
    return todayRecords
      .filter((r) => r.status !== 'Hadir')
      .map((r) => {
        const cls = classes.find((c) => c.id === r.classId);
        return {
          ...r,
          className: cls ? cls.name : 'Kelas',
        };
      });
  }, [todayRecords, classes]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <School className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Tahun Ajaran {profile.academicYear} - Semester {profile.semester}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Absensi Digital Siswa
          </h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Selamat datang di sistem manajemen presensi {profile.name}. Pantau kehadiran harian,
            rekapitulasi kelas, serta ekspor laporan secara cepat dan akurat.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all transform active:scale-95"
            >
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Mulai Input Absensi
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-sm border border-emerald-500/50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              Lihat Laporan & Rekap
            </button>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card: Total Siswa */}
        <div
          onClick={() => onNavigate('students')}
          className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
              Detail <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {statsToday.totalActive}
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Total Siswa Aktif</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Laki-laki: <b className="text-slate-700">{statsToday.maleCount}</b></span>
            <span>Perempuan: <b className="text-slate-700">{statsToday.femaleCount}</b></span>
          </div>
        </div>

        {/* Card: Total Kelas */}
        <div
          onClick={() => onNavigate('classes')}
          className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
              Detail <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {classes.length}
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Total Rombel / Kelas</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sudah Diabsen:</span>
            <span className="font-bold text-emerald-600">
              {classPerformance.filter((c) => c.isRecorded).length} / {classes.length} Kelas
            </span>
          </div>
        </div>

        {/* Card: Tingkat Kehadiran Hari Ini */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-2 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Tingkat Kehadiran Hari Ini
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {statsToday.percentage}%
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              {statsToday.hadir} siswa hadir dari total {statsToday.totalRecorded} siswa yang telah diabsen hari ini.
            </p>
          </div>

          {/* Donut progress visual */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${statsToday.percentage}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-black text-slate-800">{statsToday.percentage}%</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Hadir</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Kehadiran Status Pill / Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Hadir */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Hadir
            </div>
            <div className="text-2xl font-black text-emerald-900">{statsToday.hadir}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Siswa Masuk</div>
          </div>
        </div>

        {/* Sakit */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Sakit
            </div>
            <div className="text-2xl font-black text-amber-900">{statsToday.sakit}</div>
            <div className="text-[11px] text-amber-600 font-medium">Surat/Kabar</div>
          </div>
        </div>

        {/* Izin */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Izin
            </div>
            <div className="text-2xl font-black text-blue-900">{statsToday.izin}</div>
            <div className="text-[11px] text-blue-600 font-medium">Dengan Alasan</div>
          </div>
        </div>

        {/* Alpha */}
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Alpha
            </div>
            <div className="text-2xl font-black text-rose-900">{statsToday.alpha}</div>
            <div className="text-[11px] text-rose-600 font-medium">Tanpa Keterangan</div>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid (Feature 1 & 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Tren Kehadiran 7 Hari Terakhir
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Persentase kehadiran siswa seluruh kelas dalam satu pekan
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                Pekan Aktif
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-100">
              {weeklyTrend.map((day) => {
                const heightPct = day.pct > 0 ? Math.max(day.pct, 12) : 6;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 bg-slate-800 text-white text-[11px] font-semibold rounded shadow-md pointer-events-none whitespace-nowrap">
                      {day.pct}% ({day.hadir}/{day.total} Siswa)
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg relative flex items-end justify-center overflow-hidden h-36">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-emerald-500 group-hover:to-teal-300'
                        }`}
                      />
                      <span className="absolute bottom-1.5 text-[10px] font-bold text-white drop-shadow-xs">
                        {day.pct}%
                      </span>
                    </div>

                    {/* Day Label */}
                    <div className="mt-2 text-center">
                      <span className={`block text-xs font-bold ${day.isToday ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {day.dayName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {day.dayDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                Hari Ini
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                Hari Sebelumnya
              </span>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
            >
              Laporan Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Performa Kehadiran per Kelas (Bar ranking visual) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Performa Kelas Hari Ini
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tingkat persentase kehadiran per rombel
                </p>
              </div>
            </div>

            <div className="space-y-3.5 mt-2">
              {classPerformance.map((cls, idx) => {
                const isTop = idx === 0 && cls.percentage > 0;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onNavigate('attendance', cls.id)}
                    className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isTop ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 font-bold group-hover:text-emerald-700">
                          {cls.name}
                        </span>
                      </div>
                      <span className={`font-black ${
                        cls.percentage >= 90
                          ? 'text-emerald-600'
                          : cls.percentage >= 75
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {cls.isRecorded ? `${cls.percentage}%` : 'Belum Absen'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cls.percentage >= 90
                            ? 'bg-emerald-500'
                            : cls.percentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${cls.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Wali: {cls.teacher}</span>
                      <span>{cls.hadir}/{cls.studentCount} Hadir</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('attendance')}
              className="w-full py-2 rounded-xl text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Absenkan Kelas Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Absent Students Detail Feed (Siswa Sakit / Izin / Alpha Hari Ini) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Siswa Tidak Hadir Hari Ini ({absentStudentsToday.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar siswa dengan keterangan Sakit, Izin, atau Alpha per hari ini
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Rekap Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {absentStudentsToday.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Semua Siswa Hadir!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada catatan siswa yang sakit, izin, maupun alpha untuk hari ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {absentStudentsToday.map((record) => {
              const badgeColor =
                record.status === 'Sakit'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : record.status === 'Izin'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300';

              return (
                <div
                  key={record.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{record.className}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
                      {record.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{record.studentName}</h3>
                  <div className="text-xs text-slate-400">NIS: {record.studentNis}</div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 font-medium">Keterangan: </span>
                    <span className="text-slate-700 font-semibold italic">
                      {record.note || 'Tidak ada keterangan'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
