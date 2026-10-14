import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Phone,
  School,
  X,
  AlertTriangle,
  UserCheck,
  UserX,
  CheckSquare,
  Square,
  MinusSquare,
  Check,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { StudentItem, ClassItem } from '../types';
import { ExcelImportModal } from './ExcelImportModal';

interface StudentManagementViewProps {
  students: StudentItem[];
  classes: ClassItem[];
  onAddStudent: (student: Omit<StudentItem, 'id'>) => void;
  onUpdateStudent: (student: StudentItem) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteMultipleStudents?: (studentIds: string[]) => void;
  onImportStudents?: (
    students: Array<Omit<StudentItem, 'id'>>,
    updateExisting: boolean
  ) => { added: number; updated: number };
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onImportStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  
  // Single delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Checkbox multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Bulk delete confirmation modal state
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Excel import modal state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<{
    nis: string;
    nisn: string;
    name: string;
    gender: 'L' | 'P';
    classId: string;
    parentPhone: string;
    address: string;
    status: 'Aktif' | 'Nonaktif';
  }>({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    classId: classes[0]?.id || '',
    parentPhone: '',
    address: '',
    status: 'Aktif',
  });

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        s.nisn.includes(searchTerm);
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const matchGender = selectedGender === 'all' || s.gender === selectedGender;
      return matchSearch && matchClass && matchGender;
    });
  }, [students, searchTerm, selectedClassId, selectedGender]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const male = students.filter((s) => s.gender === 'L').length;
    const female = students.filter((s) => s.gender === 'P').length;
    const active = students.filter((s) => s.status === 'Aktif').length;
    return { total, male, female, active };
  }, [students]);

  // Checkbox selection logic
  const isAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedIds.includes(s.id));
  }, [filteredStudents, selectedIds]);

  const isSomeFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    const count = filteredStudents.filter((s) => selectedIds.includes(s.id)).length;
    return count > 0 && count < filteredStudents.length;
  }, [filteredStudents, selectedIds]);

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Unselect all currently filtered students
      const filteredIdSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Select all currently filtered students
      const newIds = new Set([...selectedIds, ...filteredStudents.map((s) => s.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleToggleSelectOne = (studentId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleSelectAllInView = () => {
    const allFiltered = filteredStudents.map((s) => s.id);
    setSelectedIds(Array.from(new Set([...selectedIds, ...allFiltered])));
  };

  // Bulk Delete Execution
  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;

    if (onDeleteMultipleStudents) {
      onDeleteMultipleStudents(selectedIds);
    } else {
      selectedIds.forEach((id) => onDeleteStudent(id));
    }

    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      gender: 'L',
      classId: selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || '',
      parentPhone: '',
      address: '',
      status: 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: StudentItem) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      name: student.name,
      gender: student.gender,
      classId: student.classId,
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nis.trim() || !formData.classId) {
      alert('Mohon isi NIS, Nama Siswa, dan pilih Kelas');
      return;
    }

    const selectedCls = classes.find((c) => c.id === formData.classId);

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        ...formData,
        className: selectedCls ? selectedCls.name : '',
      });
    } else {
      onAddStudent({
        ...formData,
        className: selectedCls ? selectedCls.name : '',
      });
    }

    setIsModalOpen(false);
  };

  // Get details of selected students for deletion preview
  const selectedStudentsDetails = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Data Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data induk siswa: NIS/NISN, nama lengkap, penempatan kelas otomatis, dan pilihan hapus tunggal maupun massal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            style={{ width: '179.762px' }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm shadow-xs transition-all transform active:scale-95 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            Import File Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <div className="text-xs text-slate-400 font-semibold">Total Siswa</div>
          <div className="text-xl font-black text-slate-800 mt-0.5">{stats.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <div className="text-xs text-blue-500 font-semibold">Laki-Laki (L)</div>
          <div className="text-xl font-black text-blue-700 mt-0.5">{stats.male}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <div className="text-xs text-pink-500 font-semibold">Perempuan (P)</div>
          <div className="text-xl font-black text-pink-700 mt-0.5">{stats.female}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
          <div className="text-xs text-emerald-500 font-semibold">Status Aktif</div>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{stats.active}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, NIS, atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5">
            <School className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {classes.map((cls) => {
                const count = students.filter((s) => s.classId === cls.id).length;
                return (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter Gender */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>
      </div>

      {/* Floating Bulk Action Bar (Muncul bila ada siswa yang dicentang / dipilih) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-3 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base">
                {selectedIds.length} Siswa Terpilih
              </span>
              <span className="hidden sm:inline text-xs text-slate-300 ml-2">
                (dari total {filteredStudents.length} siswa yang tampil)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isAllFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua yang Tampil'}
            </button>

            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              Reset
            </button>

            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Siswa Terpilih ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada siswa ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1">
            Silakan sesuaikan kata kunci atau tambahkan siswa baru ke dalam sistem.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Header Controls: Select All toggle indicator & count */}
          <div className="p-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isAllFilteredSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeFilteredSelected;
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span>Pilih Semua Siswa ({filteredStudents.length})</span>
              </label>

              {selectedIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {selectedIds.length} dipilih
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Desktop Table View with Checkboxes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isSomeFilteredSelected;
                        }
                      }}
                      onChange={handleToggleSelectAll}
                      title="Pilih semua siswa"
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">NIS / NISN</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4 text-center">L/P</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Kontak Ortu</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((std, idx) => {
                  const studentClass = classes.find((c) => c.id === std.classId);
                  const classNameDisplay = studentClass ? studentClass.name : std.className || '-';
                  const isSelected = selectedIds.includes(std.id);

                  return (
                    <tr
                      key={std.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/60 font-medium'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(std.id)}
                          aria-label={`Pilih ${std.name}`}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">{std.nis}</div>
                        <div className="font-mono text-[11px] text-slate-400">{std.nisn || '-'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{std.name}</div>
                        {std.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{std.address}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            std.gender === 'L'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          {std.gender}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100">
                          <School className="w-3 h-3 text-purple-500" />
                          {classNameDisplay}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {std.parentPhone ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {std.parentPhone}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            std.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {std.status === 'Aktif' ? (
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {std.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(std)}
                            title="Edit Siswa"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(std.id)}
                            title="Hapus Siswa"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View with Checkboxes (Smartphone & Tab) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredStudents.map((std, idx) => {
              const studentClass = classes.find((c) => c.id === std.classId);
              const classNameDisplay = studentClass ? studentClass.name : std.className || '-';
              const isSelected = selectedIds.includes(std.id);

              return (
                <div
                  key={std.id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? 'bg-emerald-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(std.id)}
                        className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <h4 className="text-sm font-bold text-slate-900">{std.name}</h4>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          NIS: {std.nis} {std.nisn ? `• NISN: ${std.nisn}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(std)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(std.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                      <School className="w-3 h-3 text-purple-500" />
                      {classNameDisplay}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          std.gender === 'L'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {std.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                      <span className="text-emerald-600 font-semibold">{std.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <b>{filteredStudents.length}</b> dari total {students.length} siswa
            </span>
            {selectedIds.length > 0 && (
              <span className="font-bold text-emerald-700">
                {selectedIds.length} siswa ditandai
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 240101"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NISN (10 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0071234561"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kelas: Otomatis tampil dari data kelas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kelas (Otomatis Tampil) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-800"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Kelas {c.grade} - Wali: {c.homeroomTeacher})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label
                      className={`flex items-center justify-center py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        formData.gender === 'L'
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        className="sr-only"
                        checked={formData.gender === 'L'}
                        onChange={() => setFormData({ ...formData, gender: 'L' })}
                      />
                      Laki-laki (L)
                    </label>

                    <label
                      className={`flex items-center justify-center py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        formData.gender === 'P'
                          ? 'bg-pink-50 border-pink-400 text-pink-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        className="sr-only"
                        checked={formData.gender === 'P'}
                        onChange={() => setFormData({ ...formData, gender: 'P' })}
                      />
                      Perempuan (P)
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. HP / WA Orang Tua
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status Siswa
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alamat Domisili Siswa
                </label>
                <input
                  type="text"
                  placeholder="Jl. Merdeka No. 10..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Data Siswa Ini?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Data absensi dan riwayat presensi yang berkaitan dengan siswa ini juga akan dibersihkan.
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
                  onDeleteStudent(deleteConfirmId);
                  // also remove from selected if present
                  setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmId));
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL (Hapus Siswa Terpilih Sekaligus) */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-center text-slate-900">
              Hapus {selectedIds.length} Siswa Sekaligus?
            </h3>

            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Anda akan menghapus secara permanen <b>{selectedIds.length} data siswa</b> yang dicentang.
              Seluruh riwayat presensi dan absensi siswa-siswa ini juga akan dibersihkan dari database.
            </p>

            {/* Selected names preview */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                Daftar Siswa Yang Akan Dihapus:
              </span>
              <ul className="text-xs space-y-1 text-slate-700">
                {selectedStudentsDetails.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="font-semibold truncate max-w-[200px]">{s.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{s.nis} ({s.className})</span>
                  </li>
                ))}
                {selectedStudentsDetails.length > 5 && (
                  <li className="text-[11px] font-bold text-slate-500 italic pt-1">
                    ... dan {selectedStudentsDetails.length - 5} siswa lainnya
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus {selectedIds.length} Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        classes={classes}
        onImport={(incoming, updateExisting) => {
          if (onImportStudents) {
            return onImportStudents(incoming, updateExisting);
          }
          return { added: 0, updated: 0 };
        }}
      />
    </div>
  );
};
