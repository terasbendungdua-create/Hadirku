import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Printer,
  Download,
  School,
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { ClassItem, StudentItem, AttendanceRecord, SchoolProfile } from '../types';
import { exportUtils } from '../utils/exportUtils';

interface ReportViewProps {
  classes: ClassItem[];
  students: StudentItem[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
}

export const ReportView: React.FC<ReportViewProps> = ({
  classes,
  students,
  attendance,
  profile,
}) => {
  // Report mode: 'daily' (harian) or 'monthly' (bulanan)
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');

  // Filters
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    todayStr.substring(0, 7) // YYYY-MM
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected Class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Target students based on class selection
  const targetStudents = useMemo(() => {
    if (selectedClassId === 'all') {
      return students.filter((s) => s.status === 'Aktif');
    }
    return students.filter((s) => s.classId === selectedClassId && s.status === 'Aktif');
  }, [students, selectedClassId]);

  // --- DAILY REPORT DATA ---
  const dailyReportData = useMemo(() => {
    return targetStudents.map((std, idx) => {
      const rec = attendance.find(
        (r) => r.studentId === std.id && r.date === selectedDate
      );
      const cls = classes.find((c) => c.id === std.classId);
      const status = rec ? rec.status : 'Belum Absen';
      const note = rec?.note || '-';

      return {
        no: idx + 1,
        studentId: std.id,
        nis: std.nis,
        nisn: std.nisn,
        name: std.name,
        gender: std.gender,
        className: cls ? cls.name : std.className || '-',
        status,
        note,
      };
    }).filter((item) => {
      if (filterStatus === 'all') return true;
      return item.status === filterStatus;
    });
  }, [targetStudents, attendance, selectedDate, classes, filterStatus]);

  // Daily statistics
  const dailyStats = useMemo(() => {
    const records = attendance.filter(
      (r) =>
        r.date === selectedDate &&
        (selectedClassId === 'all' || r.classId === selectedClassId)
    );
    const hadir = records.filter((r) => r.status === 'Hadir').length;
    const sakit = records.filter((r) => r.status === 'Sakit').length;
    const izin = records.filter((r) => r.status === 'Izin').length;
    const alpha = records.filter((r) => r.status === 'Alpha').length;
    const total = targetStudents.length;
    const totalRecorded = hadir + sakit + izin + alpha;
    const pct = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

    return { hadir, sakit, izin, alpha, total, totalRecorded, pct };
  }, [attendance, selectedDate, selectedClassId, targetStudents]);

  // --- MONTHLY REPORT DATA ---
  const monthlyReportData = useMemo(() => {
    // Records for the chosen month (e.g. 2026-10)
    const monthRecords = attendance.filter(
      (r) =>
        r.date.startsWith(selectedMonth) &&
        (selectedClassId === 'all' || r.classId === selectedClassId)
    );

    // Group per student
    return targetStudents.map((std, idx) => {
      const cls = classes.find((c) => c.id === std.classId);
      const studentRecs = monthRecords.filter((r) => r.studentId === std.id);

      const h = studentRecs.filter((r) => r.status === 'Hadir').length;
      const s = studentRecs.filter((r) => r.status === 'Sakit').length;
      const i = studentRecs.filter((r) => r.status === 'Izin').length;
      const a = studentRecs.filter((r) => r.status === 'Alpha').length;
      const totalDays = h + s + i + a;
      const pct = totalDays > 0 ? Math.round((h / totalDays) * 100) : 0;

      return {
        no: idx + 1,
        studentId: std.id,
        nis: std.nis,
        nisn: std.nisn,
        name: std.name,
        gender: std.gender,
        className: cls ? cls.name : std.className || '-',
        hadir: h,
        sakit: s,
        izin: i,
        alpha: a,
        totalDays,
        pct,
      };
    });
  }, [targetStudents, attendance, selectedMonth, selectedClassId, classes]);

  // Monthly aggregated totals
  const monthlyAggregates = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    monthlyReportData.forEach((row) => {
      hadir += row.hadir;
      sakit += row.sakit;
      izin += row.izin;
      alpha += row.alpha;
    });

    const total = hadir + sakit + izin + alpha;
    const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { hadir, sakit, izin, alpha, total, pct };
  }, [monthlyReportData]);

  // Formatted date and month strings for display and export
  const formattedSelectedDate = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const formattedSelectedMonth = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // Export to Excel handler
  const handleExportExcel = () => {
    if (reportType === 'daily') {
      exportUtils.exportDailyAttendanceExcel(
        selectedDate,
        currentClass,
        targetStudents,
        attendance,
        profile
      );
    } else {
      exportUtils.exportMonthlyAttendanceExcel(
        selectedMonth,
        formattedSelectedMonth,
        currentClass,
        targetStudents,
        attendance,
        profile
      );
    }
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    if (reportType === 'daily') {
      const csvData = dailyReportData.map((d) => ({
        No: d.no,
        NIS: d.nis,
        NISN: d.nisn,
        Nama: d.name,
        'L/P': d.gender,
        Kelas: d.className,
        Status: d.status,
        Keterangan: d.note,
      }));
      exportUtils.exportToCSV(
        csvData,
        `Laporan_Harian_${selectedClassId !== 'all' ? currentClass?.name : 'Semua'}_${selectedDate}.csv`
      );
    } else {
      const csvData = monthlyReportData.map((d) => ({
        No: d.no,
        NIS: d.nis,
        NISN: d.nisn,
        Nama: d.name,
        'L/P': d.gender,
        Kelas: d.className,
        Hadir: d.hadir,
        Sakit: d.sakit,
        Izin: d.izin,
        Alpha: d.alpha,
        TotalHari: d.totalDays,
        Persentase: `${d.pct}%`,
      }));
      exportUtils.exportToCSV(
        csvData,
        `Rekap_Bulanan_${selectedClassId !== 'all' ? currentClass?.name : 'Semua'}_${selectedMonth}.csv`
      );
    }
  };

  // Trigger print / save as PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 print-container">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Laporan & Rekap Presensi Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi presensi harian dan bulanan dengan opsi cetak dokumen resmi, unduh Excel (.xlsx), atau PDF.
          </p>
        </div>

        {/* Action Buttons: Print, Excel, CSV */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            title="Cetak format surat resmi atau Simpan sebagai PDF"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Cetak / PDF
          </button>

          <button
            onClick={handleExportExcel}
            title="Unduh file spreadsheet Excel asli"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Unduh Excel (.xlsx)
          </button>

          <button
            onClick={handleExportCSV}
            title="Unduh file CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Report Tabs & Filter Controls (Hidden in Print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Switcher Tab: Laporan Harian vs Bulanan */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setReportType('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              reportType === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            Laporan Harian
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              reportType === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Laporan Rekap Bulanan
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
          {/* Tanggal / Bulan Picker */}
          {reportType === 'daily' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Tanggal Laporan
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Bulan & Tahun
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Filter Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Pilih Rombongan Belajar / Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Semua Kelas ({students.length} Siswa)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Wali: {cls.homeroomTeacher})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Khusus Laporan Harian */}
          {reportType === 'daily' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Filter Status Kehadiran
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="all">Semua Status</option>
                <option value="Hadir">Hadir Saja</option>
                <option value="Sakit">Sakit Saja</option>
                <option value="Izin">Izin Saja</option>
                <option value="Alpha">Alpha Saja</option>
                <option value="Belum Absen">Belum Absen</option>
              </select>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center h-10">
              <span>Menampilkan rekapitulasi 1 bulan penuh per siswa.</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINTABLE OFFICIAL SCHOOL DOCUMENT LAYOUT (Kop Surat & Table) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        {/* Kop Surat Resmi Sekolah (Standar Indonesia) */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
          <div className="text-center space-y-0.5">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-slate-900">
              {profile.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              NPSN: {profile.npsn} • {profile.address}, {profile.city}
            </p>
            <p className="text-xs text-slate-500">
              Telp: {profile.phone} | Email: {profile.email}
            </p>
          </div>
        </div>

        {/* Judul Laporan & Meta Information */}
        <div className="text-center mb-6">
          <h3 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
            {reportType === 'daily'
              ? 'LAPORAN PRESENSI HARIAN SISWA'
              : 'REKAPITULASI PRESENSI BULANAN SISWA'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {reportType === 'daily'
              ? `Tanggal: ${formattedSelectedDate}`
              : `Bulan: ${formattedSelectedMonth}`}
            {' • '}
            Kelas: <b className="text-slate-900">{currentClass ? currentClass.name : 'Semua Kelas'}</b>
            {' • '}
            Tahun Ajaran: {profile.academicYear} (Semester {profile.semester})
          </p>
        </div>

        {/* Ringkasan Statistik Presensi */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {reportType === 'daily' ? (
            <>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Siswa</span>
                <div className="text-lg font-black text-slate-900">{dailyStats.total}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-[10px] uppercase font-semibold text-emerald-700">Hadir (H)</span>
                <div className="text-lg font-black">{dailyStats.hadir}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="text-[10px] uppercase font-semibold text-amber-700">Sakit (S)</span>
                <div className="text-lg font-black">{dailyStats.sakit}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                <span className="text-[10px] uppercase font-semibold text-blue-700">Izin (I)</span>
                <div className="text-lg font-black">{dailyStats.izin}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-semibold text-rose-700">Alpha (A)</span>
                <div className="text-lg font-black">{dailyStats.alpha}</div>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Siswa</span>
                <div className="text-lg font-black text-slate-900">{targetStudents.length}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="text-[10px] uppercase font-semibold text-emerald-700">Total Hadir</span>
                <div className="text-lg font-black">{monthlyAggregates.hadir}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="text-[10px] uppercase font-semibold text-amber-700">Total Sakit</span>
                <div className="text-lg font-black">{monthlyAggregates.sakit}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                <span className="text-[10px] uppercase font-semibold text-blue-700">Total Izin</span>
                <div className="text-lg font-black">{monthlyAggregates.izin}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-semibold text-rose-700">Total Alpha</span>
                <div className="text-lg font-black">{monthlyAggregates.alpha}</div>
              </div>
            </>
          )}
        </div>

        {/* ======================= */}
        {/* TABLE 1: LAPORAN HARIAN */}
        {/* ======================= */}
        {reportType === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-2.5 px-3 border border-slate-300 w-10 text-center">No</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-24">NIS</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-28">NISN</th>
                  <th className="py-2.5 px-3 border border-slate-300">Nama Lengkap Siswa</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-12 text-center">L/P</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-28">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-300 w-28 text-center">Status</th>
                  <th className="py-2.5 px-3 border border-slate-300">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200">
                {dailyReportData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data presensi yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  dailyReportData.map((row) => (
                    <tr key={row.studentId} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 border border-slate-300 text-center text-slate-500">
                        {row.no}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono font-medium">
                        {row.nis}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono text-slate-500">
                        {row.nisn || '-'}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-bold">
                        {row.gender}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-medium text-slate-700">
                        {row.className}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.status === 'Hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Sakit'
                              ? 'bg-amber-100 text-amber-800'
                              : row.status === 'Izin'
                              ? 'bg-blue-100 text-blue-800'
                              : row.status === 'Alpha'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-slate-700 italic">
                        {row.note}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================= */}
        {/* TABLE 2: REKAP BULANAN    */}
        {/* ========================= */}
        {reportType === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-2.5 px-3 border border-slate-300 w-10 text-center" rowSpan={2}>
                    No
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 w-24" rowSpan={2}>
                    NIS
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300" rowSpan={2}>
                    Nama Lengkap Siswa
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 w-12 text-center" rowSpan={2}>
                    L/P
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 w-24" rowSpan={2}>
                    Kelas
                  </th>
                  <th
                    className="py-1 px-3 border border-slate-300 text-center bg-slate-200/80"
                    colSpan={4}
                  >
                    Rekapitulasi Kehadiran
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 w-16 text-center" rowSpan={2}>
                    Total Hari
                  </th>
                  <th className="py-2.5 px-3 border border-slate-300 w-20 text-center" rowSpan={2}>
                    % Hadir
                  </th>
                </tr>
                <tr className="bg-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-wider text-center">
                  <th className="py-1 px-2 border border-slate-300 text-emerald-800 bg-emerald-50">H</th>
                  <th className="py-1 px-2 border border-slate-300 text-amber-800 bg-amber-50">S</th>
                  <th className="py-1 px-2 border border-slate-300 text-blue-800 bg-blue-50">I</th>
                  <th className="py-1 px-2 border border-slate-300 text-rose-800 bg-rose-50">A</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200">
                {monthlyReportData.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 border border-slate-300 text-center text-slate-500">
                      {row.no}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-mono font-medium">
                      {row.nis}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                      {row.name}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold">
                      {row.gender}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-medium text-slate-700">
                      {row.className}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-bold text-emerald-700 bg-emerald-50/30">
                      {row.hadir}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-bold text-amber-700 bg-amber-50/30">
                      {row.sakit}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-bold text-blue-700 bg-blue-50/30">
                      {row.izin}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-bold text-rose-700 bg-rose-50/30">
                      {row.alpha}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-700">
                      {row.totalDays}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-black text-emerald-700">
                      {row.pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kolom Tanda Tangan Resmi (Wali Kelas & Kepala Sekolah) */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="text-center">
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-20" />
            <p className="font-extrabold underline">{profile.principalName}</p>
            <p className="font-mono text-slate-600">NIP. {profile.principalNip}</p>
          </div>

          <div className="text-center">
            <p className="text-slate-500">
              {profile.city},{' '}
              {new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date())}
            </p>
            <p className="font-bold">
              {currentClass ? `Wali Kelas ${currentClass.name}` : 'Guru / Petugas Presensi'}
            </p>
            <div className="h-20" />
            <p className="font-extrabold underline">
              {currentClass ? currentClass.homeroomTeacher : 'Petugas Presensi Sekolah'}
            </p>
            <p className="font-mono text-slate-600">
              {currentClass?.homeroomNip ? `NIP. ${currentClass.homeroomNip}` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
