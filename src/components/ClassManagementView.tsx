import React, { useState, useMemo } from 'react';
import {
  School,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  ClipboardCheck,
  X,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { ClassItem, StudentItem } from '../types';

interface ClassManagementViewProps {
  classes: ClassItem[];
  students: StudentItem[];
  onAddClass: (cls: Omit<ClassItem, 'id'>) => void;
  onUpdateClass: (cls: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onNavigateToAttendance: (classId: string) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onNavigateToAttendance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states: Cukup kolom NAMA KELAS, TINGKAT, NAMA WALI KELAS, NIP WALI KELAS, TAHUN PELAJARAN
  const [formData, setFormData] = useState({
    name: '',
    grade: '1',
    homeroomTeacher: '',
    homeroomNip: '',
    academicYear: '2024/2025',
  });

  // Calculate student count per class
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    classes.forEach((c) => {
      counts[c.id] = students.filter((s) => s.classId === c.id).length;
    });
    return counts;
  }, [classes, students]);

  // Filtered classes (Tingkat 1 s/d 6 untuk SD)
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchSearch =
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.homeroomNip && cls.homeroomNip.includes(searchTerm));
      const matchGrade = selectedGrade === 'all' || cls.grade === selectedGrade;
      return matchSearch && matchGrade;
    });
  }, [classes, searchTerm, selectedGrade]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade: '1',
      homeroomTeacher: '',
      homeroomNip: '',
      academicYear: '2024/2025',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade || '1',
      homeroomTeacher: cls.homeroomTeacher,
      homeroomNip: cls.homeroomNip || '',
      academicYear: cls.academicYear,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.homeroomTeacher.trim()) {
      alert('Mohon isi nama kelas dan nama wali kelas');
      return;
    }

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        ...formData,
      });
    } else {
      onAddClass(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Data Kelas (SD)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola rombongan belajar jenjang Sekolah Dasar (Kelas 1 sampai Kelas 6), wali kelas, dan tahun pelajaran.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Kelas Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kelas atau wali kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Tingkat:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Semua Tingkat (Kelas 1 - 6)</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada kelas yang ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci pencarian atau tambahkan kelas baru.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const studentCount = classStudentCounts[cls.id] || 0;
            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 mb-2">
                        <span>Tingkat Kelas {cls.grade} (SD)</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {cls.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        title="Edit Kelas"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(cls.id)}
                        title="Hapus Kelas"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Nama Wali Kelas:</span>
                      <span className="font-semibold text-slate-800">{cls.homeroomTeacher}</span>
                    </div>
                    {cls.homeroomNip && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-slate-400 font-medium">NIP Wali Kelas:</span>
                        <span className="font-mono text-slate-700">{cls.homeroomNip}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-medium">Tahun Pelajaran:</span>
                      <span className="font-semibold text-slate-700">{cls.academicYear}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{studentCount} Siswa Terdaftar</span>
                  </div>

                  <button
                    onClick={() => onNavigateToAttendance(cls.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Absenkan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Class (Hanya 5 Kolom: NAMA KELAS, TINGKAT, NAMA WALI KELAS, NIP WALI KELAS, TAHUN PELAJARAN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* 1. NAMA KELAS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 1A, Kelas 2B, Kelas 6A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* 2. TINGKAT (Kelas 1 sampai Kelas 6 untuk jenjang SD) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tingkat (Jenjang SD) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800"
                >
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </select>
              </div>

              {/* 3. NAMA WALI KELAS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Wali Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Wali Kelas beserta gelar"
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* 4. NIP WALI KELAS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Wali Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19850315 201001 2 015"
                  value={formData.homeroomNip}
                  onChange={(e) => setFormData({ ...formData, homeroomNip: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>

              {/* 5. TAHUN PELAJARAN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tahun Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2024/2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Data Kelas Ini?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Menghapus kelas tidak akan menghapus data siswa, namun siswa di kelas ini tidak akan
              memiliki rombel yang aktif.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteClass(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
