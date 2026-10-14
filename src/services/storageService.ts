import { ClassItem, StudentItem, AttendanceRecord, SchoolProfile } from '../types';
import { initialClasses, initialStudents, generateInitialAttendance, initialSchoolProfile } from '../data/initialData';

const STORAGE_KEYS = {
  CLASSES: 'hadirku_classes_v2',
  STUDENTS: 'hadirku_students_v2',
  ATTENDANCE: 'hadirku_attendance_v2',
  PROFILE: 'hadirku_profile_v2',
};

export const storageService = {
  // --- Classes ---
  getClasses(): ClassItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load classes from localStorage', e);
    }
    this.saveClasses(initialClasses);
    return initialClasses;
  },

  saveClasses(classes: ClassItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to save classes', e);
    }
  },

  addClass(cls: Omit<ClassItem, 'id'>): ClassItem {
    const classes = this.getClasses();
    const newClass: ClassItem = {
      ...cls,
      id: `cls-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    classes.push(newClass);
    this.saveClasses(classes);
    return newClass;
  },

  updateClass(updated: ClassItem) {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
      classes[idx] = updated;
      this.saveClasses(classes);
      // Also update className in students
      const students = this.getStudents();
      let studentsChanged = false;
      students.forEach((s) => {
        if (s.classId === updated.id && s.className !== updated.name) {
          s.className = updated.name;
          studentsChanged = true;
        }
      });
      if (studentsChanged) {
        this.saveStudents(students);
      }
    }
  },

  deleteClass(classId: string) {
    const classes = this.getClasses().filter((c) => c.id !== classId);
    this.saveClasses(classes);
  },

  // --- Students ---
  getStudents(): StudentItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load students from localStorage', e);
    }
    this.saveStudents(initialStudents);
    return initialStudents;
  },

  saveStudents(students: StudentItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students', e);
    }
  },

  addStudent(student: Omit<StudentItem, 'id'>): StudentItem {
    const students = this.getStudents();
    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === student.classId);

    const newStudent: StudentItem = {
      ...student,
      id: `std-${Date.now()}`,
      className: cls ? cls.name : student.className || '',
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  },

  addMultipleStudents(
    incomingStudents: Array<Omit<StudentItem, 'id'>>,
    updateExisting: boolean = true
  ): { added: number; updated: number } {
    const students = this.getStudents();
    const classes = this.getClasses();
    let addedCount = 0;
    let updatedCount = 0;

    incomingStudents.forEach((incoming, idx) => {
      const cls = classes.find((c) => c.id === incoming.classId);
      const className = cls ? cls.name : incoming.className || '';
      const existingIdx = students.findIndex((s) => s.nis.trim() === incoming.nis.trim());

      if (existingIdx !== -1 && updateExisting) {
        students[existingIdx] = {
          ...students[existingIdx],
          ...incoming,
          className,
        };
        updatedCount++;
      } else if (existingIdx === -1) {
        students.push({
          ...incoming,
          id: `std-${Date.now()}-${idx}`,
          className,
        });
        addedCount++;
      }
    });

    this.saveStudents(students);
    return { added: addedCount, updated: updatedCount };
  },

  updateStudent(updated: StudentItem) {
    const students = this.getStudents();
    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === updated.classId);

    const idx = students.findIndex((s) => s.id === updated.id);
    if (idx !== -1) {
      students[idx] = {
        ...updated,
        className: cls ? cls.name : updated.className,
      };
      this.saveStudents(students);
    }
  },

  deleteStudent(studentId: string) {
    const students = this.getStudents().filter((s) => s.id !== studentId);
    this.saveStudents(students);
    // Also remove attendance
    const attendance = this.getAttendance().filter((a) => a.studentId !== studentId);
    this.saveAttendance(attendance);
  },

  deleteMultipleStudents(studentIds: string[]) {
    const idSet = new Set(studentIds);
    const students = this.getStudents().filter((s) => !idSet.has(s.id));
    this.saveStudents(students);
    const attendance = this.getAttendance().filter((a) => !idSet.has(a.studentId));
    this.saveAttendance(attendance);
  },

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load attendance from localStorage', e);
    }
    const initial = generateInitialAttendance();
    this.saveAttendance(initial);
    return initial;
  },

  saveAttendance(records: AttendanceRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save attendance', e);
    }
  },

  saveOrUpdateClassAttendance(
    date: string,
    classId: string,
    studentAttendances: Array<{
      studentId: string;
      studentNis: string;
      studentName: string;
      status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
      note?: string;
    }>
  ) {
    const allRecords = this.getAttendance();
    // Filter out existing records for this date and classId
    const otherRecords = allRecords.filter(
      (r) => !(r.date === date && r.classId === classId)
    );

    const now = new Date().toISOString();
    const newRecords: AttendanceRecord[] = studentAttendances.map((sa) => ({
      id: `att-${date}-${sa.studentId}`,
      date,
      classId,
      studentId: sa.studentId,
      studentNis: sa.studentNis,
      studentName: sa.studentName,
      status: sa.status,
      note: sa.note || '',
      recordedAt: now,
    }));

    const combined = [...otherRecords, ...newRecords];
    this.saveAttendance(combined);
    return newRecords;
  },

  // --- School Profile ---
  getSchoolProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load school profile', e);
    }
    this.saveSchoolProfile(initialSchoolProfile);
    return initialSchoolProfile;
  },

  saveSchoolProfile(profile: SchoolProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save school profile', e);
    }
  },

  // Reset to initial demo data
  resetAllData() {
    this.saveClasses(initialClasses);
    this.saveStudents(initialStudents);
    this.saveAttendance(generateInitialAttendance());
    this.saveSchoolProfile(initialSchoolProfile);
  },
};
