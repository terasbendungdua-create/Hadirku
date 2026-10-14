import * as XLSX from 'xlsx';
import { AttendanceRecord, ClassItem, SchoolProfile, StudentItem } from '../types';

export const exportUtils = {
  /**
   * Export Laporan Harian Kehadiran ke file Excel (.xlsx)
   */
  exportDailyAttendanceExcel(
    date: string,
    cls: ClassItem | undefined,
    students: StudentItem[],
    records: AttendanceRecord[],
    profile: SchoolProfile
  ) {
    const className = cls ? cls.name : 'Semua Kelas';
    const homeroom = cls ? cls.homeroomTeacher : '-';

    // Build data rows
    const dataRows = students.map((std, idx) => {
      const rec = records.find((r) => r.studentId === std.id && r.date === date);
      const status = rec ? rec.status : 'Belum Absen';
      const note = rec?.note || '-';

      return {
        'No': idx + 1,
        'NIS': std.nis,
        'NISN': std.nisn,
        'Nama Siswa': std.name,
        'L/P': std.gender,
        'Kelas': std.className || className,
        'Status Kehadiran': status,
        'Keterangan / Alasan': note,
      };
    });

    // Summary calculation
    const hadir = records.filter((r) => r.date === date && r.status === 'Hadir').length;
    const sakit = records.filter((r) => r.date === date && r.status === 'Sakit').length;
    const izin = records.filter((r) => r.date === date && r.status === 'Izin').length;
    const alpha = records.filter((r) => r.date === date && r.status === 'Alpha').length;
    const totalRecorded = hadir + sakit + izin + alpha;
    const pct = totalRecorded > 0 ? ((hadir / totalRecorded) * 100).toFixed(1) : '0';

    // Create Worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      [`LAPORAN ABSENSI HARIAN SISWA - ${profile.name.toUpperCase()}`],
      [`Tanggal: ${date} | Kelas: ${className} | Wali Kelas: ${homeroom}`],
      [`Tahun Ajaran: ${profile.academicYear} | Semester: ${profile.semester}`],
      [
        `Rekap: Hadir: ${hadir} | Sakit: ${sakit} | Izin: ${izin} | Alpha: ${alpha} | Total Siswa: ${students.length} | Persentase Hadir: ${pct}%`,
      ],
      [],
    ]);

    // Append table data starting from A7
    XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: 'A7' });

    // Auto column widths
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama
      { wch: 6 },  // L/P
      { wch: 14 }, // Kelas
      { wch: 18 }, // Status
      { wch: 30 }, // Keterangan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Harian');

    const fileName = `Laporan_Absensi_${className.replace(/\s+/g, '_')}_${date}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Export Laporan Bulanan Rekapitulasi Kehadiran ke file Excel (.xlsx)
   */
  exportMonthlyAttendanceExcel(
    monthYear: string, // YYYY-MM
    monthName: string, // e.g. "Oktober 2026"
    cls: ClassItem | undefined,
    students: StudentItem[],
    records: AttendanceRecord[],
    profile: SchoolProfile
  ) {
    const className = cls ? cls.name : 'Semua Kelas';
    const homeroom = cls ? cls.homeroomTeacher : '-';

    // Filter records for this month
    const monthRecords = records.filter((r) => r.date.startsWith(monthYear));

    // Calculate per-student counts
    const dataRows = students.map((std, idx) => {
      const studentRecs = monthRecords.filter((r) => r.studentId === std.id);
      const h = studentRecs.filter((r) => r.status === 'Hadir').length;
      const s = studentRecs.filter((r) => r.status === 'Sakit').length;
      const i = studentRecs.filter((r) => r.status === 'Izin').length;
      const a = studentRecs.filter((r) => r.status === 'Alpha').length;
      const total = h + s + i + a;
      const pct = total > 0 ? ((h / total) * 100).toFixed(1) + '%' : '0%';

      return {
        'No': idx + 1,
        'NIS': std.nis,
        'NISN': std.nisn,
        'Nama Siswa': std.name,
        'L/P': std.gender,
        'Kelas': std.className || className,
        'Hadir (H)': h,
        'Sakit (S)': s,
        'Izin (I)': i,
        'Alpha (A)': a,
        'Total Hari': total,
        '% Kehadiran': pct,
      };
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      [`REKAPITULASI ABSENSI BULANAN SISWA - ${profile.name.toUpperCase()}`],
      [`Bulan: ${monthName} | Kelas: ${className} | Wali Kelas: ${homeroom}`],
      [`Tahun Ajaran: ${profile.academicYear} | Semester: ${profile.semester}`],
      [],
    ]);

    // Append table data starting from A6
    XLSX.utils.sheet_add_json(worksheet, dataRows, { origin: 'A6' });

    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama
      { wch: 6 },  // L/P
      { wch: 14 }, // Kelas
      { wch: 10 }, // H
      { wch: 10 }, // S
      { wch: 10 }, // I
      { wch: 10 }, // A
      { wch: 12 }, // Total
      { wch: 14 }, // %
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Bulanan');

    const fileName = `Rekap_Bulanan_${className.replace(/\s+/g, '_')}_${monthYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Export to CSV format
   */
  exportToCSV(data: any[], fileName: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Print standard layout
   */
  triggerPrint() {
    window.print();
  },
};
