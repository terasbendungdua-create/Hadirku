export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';

export interface ClassItem {
  id: string;
  name: string; // e.g. "X MIPA 1", "XI IPS 2"
  grade: string; // e.g. "10", "11", "12"
  major?: string; // e.g. "MIPA", "IPS", "Bahasa", "Teknik Komputer"
  homeroomTeacher: string; // Wali Kelas
  homeroomNip?: string; // NIP Wali Kelas
  academicYear: string; // e.g. "2024/2025"
  room?: string; // Ruang Kelas
  createdAt?: string;
}

export interface StudentItem {
  id: string;
  nis: string; // Nomor Induk Siswa (e.g. 240101)
  nisn: string; // Nomor Induk Siswa Nasional (10 digit)
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className?: string; // calculated or stored
  parentPhone?: string;
  address?: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string; // Keterangan izin / alasan sakit / catatan
  recordedAt: string;
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}

export interface DayAttendanceStat {
  date: string;
  formattedDate: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  percentage: number;
}

export interface ClassAttendanceStat {
  classId: string;
  className: string;
  totalStudents: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  percentage: number;
}
