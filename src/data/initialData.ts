import { ClassItem, StudentItem, AttendanceRecord, SchoolProfile } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'SD Negeri 1 Harapan Bangsa',
  npsn: '20104521',
  address: 'Jl. Pendidikan No. 45, Kecamatan Sukamaju',
  city: 'Kota Pelajar',
  phone: '(021) 7894561',
  email: 'info@sdn1harapanbangsa.sch.id',
  principalName: 'Dra. Hj. Siti Nurjanah, M.Pd.',
  principalNip: '19680512 199303 2 004',
  academicYear: '2024/2025',
  semester: 'Ganjil',
};

export const initialClasses: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'Kelas 1A',
    grade: '1',
    homeroomTeacher: 'Siti Rahmawati, S.Pd.SD',
    homeroomNip: '19840215 200801 2 011',
    academicYear: '2024/2025',
  },
  {
    id: 'cls-2',
    name: 'Kelas 2A',
    grade: '2',
    homeroomTeacher: 'Ahmad Fauzi, S.Pd.SD',
    homeroomNip: '19790620 200501 1 008',
    academicYear: '2024/2025',
  },
  {
    id: 'cls-3',
    name: 'Kelas 3A',
    grade: '3',
    homeroomTeacher: 'Dra. Endang Lestari',
    homeroomNip: '19721104 199802 2 003',
    academicYear: '2024/2025',
  },
  {
    id: 'cls-4',
    name: 'Kelas 4A',
    grade: '4',
    homeroomTeacher: 'I Made Suryanata, S.Pd.',
    homeroomNip: '19860812 201001 1 015',
    academicYear: '2024/2025',
  },
  {
    id: 'cls-5',
    name: 'Kelas 5A',
    grade: '5',
    homeroomTeacher: 'Nurul Hidayati, S.Pd.',
    homeroomNip: '19810319 200604 2 012',
    academicYear: '2024/2025',
  },
  {
    id: 'cls-6',
    name: 'Kelas 6A',
    grade: '6',
    homeroomTeacher: 'Drs. Budi Santoso, M.Pd.',
    homeroomNip: '19750510 200003 1 005',
    academicYear: '2024/2025',
  },
];

export const initialStudents: StudentItem[] = [
  // Kelas 1A (cls-1)
  {
    id: 'std-101',
    nis: '240101',
    nisn: '3151234561',
    name: 'Aditya Pratama Putra',
    gender: 'L',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567801',
    address: 'Jl. Merdeka No. 12',
    status: 'Aktif',
  },
  {
    id: 'std-102',
    nis: '240102',
    nisn: '3151234562',
    name: 'Anindya Putri Maharani',
    gender: 'P',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567802',
    address: 'Jl. Anggrek No. 5',
    status: 'Aktif',
  },
  {
    id: 'std-103',
    nis: '240103',
    nisn: '3151234563',
    name: 'Bagas Satria Wicaksono',
    gender: 'L',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567803',
    address: 'Komplek Griya Asri B-3',
    status: 'Aktif',
  },
  {
    id: 'std-104',
    nis: '240104',
    nisn: '3151234564',
    name: 'Clarissa Aurelia Chandra',
    gender: 'P',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567804',
    address: 'Jl. Melati Raya No. 88',
    status: 'Aktif',
  },
  {
    id: 'std-105',
    nis: '240105',
    nisn: '3151234565',
    name: 'Dimas Arya Nugraha',
    gender: 'L',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567805',
    address: 'Jl. Mawar Indah No. 14',
    status: 'Aktif',
  },
  {
    id: 'std-106',
    nis: '240106',
    nisn: '3151234566',
    name: 'Farah Nabila Zahra',
    gender: 'P',
    classId: 'cls-1',
    className: 'Kelas 1A',
    parentPhone: '081234567806',
    address: 'Jl. Cendrawasih No. 20',
    status: 'Aktif',
  },

  // Kelas 2A (cls-2)
  {
    id: 'std-201',
    nis: '230201',
    nisn: '3142234501',
    name: 'Galang Rambu Anarki',
    gender: 'L',
    classId: 'cls-2',
    className: 'Kelas 2A',
    parentPhone: '081398765401',
    address: 'Jl. Pahlawan No. 7',
    status: 'Aktif',
  },
  {
    id: 'std-202',
    nis: '230202',
    nisn: '3142234502',
    name: 'Hana Althafunnisa',
    gender: 'P',
    classId: 'cls-2',
    className: 'Kelas 2A',
    parentPhone: '081398765402',
    address: 'Perumahan Indah Permai C-12',
    status: 'Aktif',
  },
  {
    id: 'std-203',
    nis: '230203',
    nisn: '3142234503',
    name: 'Ilham Kurniawan',
    gender: 'L',
    classId: 'cls-2',
    className: 'Kelas 2A',
    parentPhone: '081398765403',
    address: 'Jl. Kenanga No. 4',
    status: 'Aktif',
  },
  {
    id: 'std-204',
    nis: '230204',
    nisn: '3142234504',
    name: 'Jessica Nathania',
    gender: 'P',
    classId: 'cls-2',
    className: 'Kelas 2A',
    parentPhone: '081398765404',
    address: 'Jl. Surya Kencana No. 9',
    status: 'Aktif',
  },

  // Kelas 3A (cls-3)
  {
    id: 'std-301',
    nis: '220101',
    nisn: '3133234501',
    name: 'Larasati Dewi Kusuma',
    gender: 'P',
    classId: 'cls-3',
    className: 'Kelas 3A',
    parentPhone: '081512345601',
    address: 'Jl. Teratai No. 15',
    status: 'Aktif',
  },
  {
    id: 'std-302',
    nis: '220102',
    nisn: '3133234502',
    name: 'Muhammad Fadhil Akbar',
    gender: 'L',
    classId: 'cls-3',
    className: 'Kelas 3A',
    parentPhone: '081512345602',
    address: 'Jl. Gatot Subroto No. 34',
    status: 'Aktif',
  },
  {
    id: 'std-303',
    nis: '220103',
    nisn: '3133234503',
    name: 'Nadira Safitri',
    gender: 'P',
    classId: 'cls-3',
    className: 'Kelas 3A',
    parentPhone: '081512345603',
    address: 'Perumahan Bukit Hijau D-9',
    status: 'Aktif',
  },

  // Kelas 4A (cls-4)
  {
    id: 'std-401',
    nis: '210201',
    nisn: '3124234501',
    name: 'Putri Ayu Wandira',
    gender: 'P',
    classId: 'cls-4',
    className: 'Kelas 4A',
    parentPhone: '081723456701',
    address: 'Jl. Kartini No. 22',
    status: 'Aktif',
  },
  {
    id: 'std-402',
    nis: '210202',
    nisn: '3124234502',
    name: 'Raden Mas Bagus Panji',
    gender: 'L',
    classId: 'cls-4',
    className: 'Kelas 4A',
    parentPhone: '081723456702',
    address: 'Jl. Veteran No. 19',
    status: 'Aktif',
  },
  {
    id: 'std-403',
    nis: '210203',
    nisn: '3124234503',
    name: 'Salma Aulia Ramadhani',
    gender: 'P',
    classId: 'cls-4',
    className: 'Kelas 4A',
    parentPhone: '081723456703',
    address: 'Komplek Permata Indah A-5',
    status: 'Aktif',
  },

  // Kelas 5A (cls-5)
  {
    id: 'std-501',
    nis: '200101',
    nisn: '3115234501',
    name: 'Umar Abdullah',
    gender: 'L',
    classId: 'cls-5',
    className: 'Kelas 5A',
    parentPhone: '081934567801',
    address: 'Jl. Hayam Wuruk No. 50',
    status: 'Aktif',
  },
  {
    id: 'std-502',
    nis: '200102',
    nisn: '3115234502',
    name: 'Vanya Alicia Salsabila',
    gender: 'P',
    classId: 'cls-5',
    className: 'Kelas 5A',
    parentPhone: '081934567802',
    address: 'Jl. Gajah Mada No. 16',
    status: 'Aktif',
  },

  // Kelas 6A (cls-6)
  {
    id: 'std-601',
    nis: '190101',
    nisn: '3105234501',
    name: 'Wahyu Hidayat',
    gender: 'L',
    classId: 'cls-6',
    className: 'Kelas 6A',
    parentPhone: '081934567803',
    address: 'Jl. Sudirman No. 71',
    status: 'Aktif',
  },
  {
    id: 'std-602',
    nis: '190102',
    nisn: '3105234502',
    name: 'Zahra Maulida Az-Zahra',
    gender: 'P',
    classId: 'cls-6',
    className: 'Kelas 6A',
    parentPhone: '081934567804',
    address: 'Jl. Imam Bonjol No. 25',
    status: 'Aktif',
  },
];

// Generate past attendance records
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const dateStr = d.toISOString().split('T')[0];

    initialStudents.forEach((student, idx) => {
      let status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha' = 'Hadir';
      let note = '';

      if ((idx + offset) % 17 === 0) {
        status = 'Sakit';
        note = 'Flu dan demam';
      } else if ((idx + offset) % 11 === 0) {
        status = 'Izin';
        note = 'Acara keluarga';
      } else if ((idx + offset) % 27 === 0) {
        status = 'Alpha';
        note = 'Tanpa keterangan';
      }

      records.push({
        id: `att-${dateStr}-${student.id}`,
        date: dateStr,
        classId: student.classId,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.name,
        status,
        note,
        recordedAt: `${dateStr}T07:15:00.000Z`,
      });
    });
  }

  return records;
}
