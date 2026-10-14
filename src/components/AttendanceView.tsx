import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ClipboardCheck,
  Calendar,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Save,
  CheckCheck,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { ClassItem, StudentItem, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  classes: ClassItem[];
  students: StudentItem[];
  attendance: AttendanceRecord[];
  initialClassId?: string;
  onSaveAttendance: (
    date: string,
    classId: string,
    records: Array<{
      studentId: string;
      studentNis: string;
      studentName: string;
      status: AttendanceStatus;
      note?: string;
    }>
  ) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  classes,
  students,
  attendance,
  initialClassId,
  onSaveAttendance,
}) => {
  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Selected class & date
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Success message state
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Local state for current attendance sheet: map of studentId -> { status, note }
  const [sheetData, setSheetData] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});

  // Active students in the selected class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) => s.classId === selectedClassId && s.status === 'Aktif'
    );
  }, [students, selectedClassId]);

  // Selected class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Load existing records when class or date changes
  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;

    const existingForClass = attendance.filter(
      (r) => r.date === selectedDate && r.classId === selectedClassId
    );

    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};

    classStudents.forEach((std) => {
      const found = existingForClass.find((r) => r.studentId === std.id);
      if (found) {
        initialMap[std.id] = {
          status: found.status,
          note: found.note || '',
        };
      } else {
        // Default to Hadir if not yet recorded
        initialMap[std.id] = {
          status: 'Hadir',
          note: '',
        };
      }
    });

    setSheetData(initialMap);
    setSavedSuccessMsg(null);
  }, [selectedClassId, selectedDate, attendance, classStudents]);

  // Handle status change for a student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setSheetData((prev) => ({
      ...prev,
      [studentId]: {
        status,
        note: status === 'Izin' || status === 'Sakit' ? prev[studentId]?.note || '' : '',
      },
    }));
  };

  // Handle note change (misal isian keterangan izin)
  const handleNoteChange = (studentId: string, note: string) => {
    setSheetData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  // Mark all students in this class as Hadir
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    classStudents.forEach((std) => {
      updated[std.id] = {
        status: 'Hadir',
        note: '',
      };
    });
    setSheetData(updated);
  };

  // Summary counts for this current sheet
  const currentCounts = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    Object.values(sheetData).forEach((item) => {
      if (item.status === 'Hadir') hadir++;
      else if (item.status === 'Sakit') sakit++;
      else if (item.status === 'Izin') izin++;
      else if (item.status === 'Alpha') alpha++;
    });

    const total = classStudents.length;
    const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { hadir, sakit, izin, alpha, total, pct };
  }, [sheetData, classStudents]);

  // Check if this class has been saved on this date before
  const isAlreadySavedBefore = useMemo(() => {
    return attendance.some(
      (r) => r.date === selectedDate && r.classId === selectedClassId
    );
  }, [attendance, selectedDate, selectedClassId]);

  // Handle Save
  const handleSave = () => {
    if (!selectedClassId || classStudents.length === 0) {
      alert('Tidak ada siswa di kelas ini untuk diabsen.');
      return;
    }

    // Check if any Izin without note
    const missingIzinNote = classStudents.find((std) => {
      const data = sheetData[std.id];
      return data?.status === 'Izin' && (!data.note || data.note.trim() === '');
    });

    if (missingIzinNote) {
      const confirmSave = window.confirm(
        `Siswa "${missingIzinNote.name}" berstatus IZIN tetapi kolom keterangan izin belum diisi. Apakah ingin tetap menyimpan atau mengisi keterangan terlebih dahulu? (Klik Cancel untuk mengisi)`
      );
      if (!confirmSave) return;
    }

    const payload = classStudents.map((std) => {
      const data = sheetData[std.id] || { status: 'Hadir' as AttendanceStatus, note: '' };
      return {
        studentId: std.id,
        studentNis: std.nis,
        studentName: std.name,
        status: data.status,
        note: data.note,
      };
    });

    onSaveAttendance(selectedDate, selectedClassId, payload);

    // Fire confetti for celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
      });
    } catch (e) {
      // ignore
    }

    setSavedSuccessMsg(
      `Absensi kelas ${currentClass?.name} tanggal ${selectedDate} berhasil disimpan!`
    );

    setTimeout(() => {
      setSavedSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Presensi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Lembar Absensi Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilih kelas dan tanggal presensi, lalu tandai status kehadiran siswa. Jika izin, sertakan alasan pada kolom isian.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          Simpan Data Absensi
        </button>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">{savedSuccessMsg}</div>
              <div className="text-xs text-emerald-600">
                Data presensi telah tersimpan dan terintegrasi ke seluruh dashboard & laporan.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSavedSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Selector Panel (Kelas & Tanggal) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Pilih Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-emerald-600" />
              1. Pilih Kelas Yang Diabsenkan
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} (Wali: {cls.homeroomTeacher})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pilih Tanggal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              2. Pilih Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            />
          </div>

          {/* Status Record Info & Quick Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              title="Tandai semua siswa berstatus Hadir"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Tandai Semua Hadir
            </button>
          </div>
        </div>

        {/* Selected Info Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Wali Kelas: <b className="text-slate-900">{currentClass?.homeroomTeacher || '-'}</b>
            </span>
            <span>•</span>
            <span>
              Ruang: <b className="text-slate-900">{currentClass?.room || '-'}</b>
            </span>
            <span>•</span>
            <span>
              Status Database:{' '}
              {isAlreadySavedBefore ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Sudah Terisi (Bisa Diperbarui)
                </span>
              ) : (
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Belum Pernah Diabsen
                </span>
              )}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Total Siswa di Rombel: <b className="text-slate-900">{classStudents.length} Siswa</b>
          </div>
        </div>
      </div>

      {/* Summary Chips for this active session */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Siswa</span>
          <div className="text-xl font-black text-slate-800">{currentCounts.total}</div>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-center">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase">Hadir (H)</span>
          <div className="text-xl font-black text-emerald-900">{currentCounts.hadir}</div>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-center">
          <span className="text-[11px] text-amber-700 font-semibold uppercase">Sakit (S)</span>
          <div className="text-xl font-black text-amber-900">{currentCounts.sakit}</div>
        </div>
        <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-center">
          <span className="text-[11px] text-blue-700 font-semibold uppercase">Izin (I)</span>
          <div className="text-xl font-black text-blue-900">{currentCounts.izin}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-rose-700 font-semibold uppercase">Alpha (A)</span>
          <div className="text-xl font-black text-rose-900">{currentCounts.alpha}</div>
        </div>
      </div>

      {/* Attendance List */}
      {classStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada siswa aktif di kelas ini</h3>
          <p className="text-xs text-slate-400 mt-1">
            Silakan tambahkan siswa ke kelas <b>{currentClass?.name}</b> pada menu Data Siswa terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Presensi Siswa ({classStudents.length} Siswa)
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Tingkat Kehadiran Kelas: {currentCounts.pct}%
            </span>
          </div>

          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center w-14">L/P</th>
                  <th className="py-3 px-4 text-center w-80">Status Kehadiran</th>
                  <th className="py-3 px-4">Keterangan / Alasan (Muncul Saat Izin/Sakit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {classStudents.map((std, idx) => {
                  const currentStatus = sheetData[std.id]?.status || 'Hadir';
                  const currentNote = sheetData[std.id]?.note || '';
                  const isIzin = currentStatus === 'Izin';
                  const isSakit = currentStatus === 'Sakit';

                  return (
                    <tr
                      key={std.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        currentStatus === 'Alpha'
                          ? 'bg-rose-50/20'
                          : currentStatus === 'Sakit'
                          ? 'bg-amber-50/20'
                          : currentStatus === 'Izin'
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {std.nis}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {std.name}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {std.gender}
                      </td>

                      {/* 4 Status Buttons: H, S, I, A */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 gap-1 border border-slate-200">
                          {/* Hadir */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'Hadir')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            Hadir (H)
                          </button>

                          {/* Sakit */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'Sakit')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Sakit'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            Sakit (S)
                          </button>

                          {/* Izin (Jika dipilih, muncul isian kolom keterangan izin) */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'Izin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Izin'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            Izin (I)
                          </button>

                          {/* Alpha */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(std.id, 'Alpha')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === 'Alpha'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            Alpha (A)
                          </button>
                        </div>
                      </td>

                      {/* Kolom Keterangan Izin / Catatan */}
                      <td className="py-3 px-4">
                        {isIzin ? (
                          <div className="animate-in fade-in">
                            <input
                              type="text"
                              required
                              placeholder="Ketik keterangan izin (contoh: Acara keluarga, Lomba)..."
                              value={currentNote}
                              onChange={(e) => handleNoteChange(std.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-blue-50/70 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-blue-900 placeholder-blue-400"
                            />
                            <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                              * Kolom keterangan izin wajib diisi
                            </span>
                          </div>
                        ) : isSakit ? (
                          <div className="animate-in fade-in">
                            <input
                              type="text"
                              placeholder="Keterangan sakit (contoh: Demam, Ada surat dokter)..."
                              value={currentNote}
                              onChange={(e) => handleNoteChange(std.id, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-amber-900 placeholder-amber-400"
                            />
                          </div>
                        ) : currentStatus === 'Alpha' ? (
                          <span className="text-[11px] text-rose-500 font-semibold">
                            Tanpa keterangan
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Smartphone / Mobile View (Touch optimized cards) */}
          <div className="md:hidden divide-y divide-slate-100">
            {classStudents.map((std, idx) => {
              const currentStatus = sheetData[std.id]?.status || 'Hadir';
              const currentNote = sheetData[std.id]?.note || '';
              const isIzin = currentStatus === 'Izin';
              const isSakit = currentStatus === 'Sakit';

              return (
                <div key={std.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <h4 className="text-sm font-bold text-slate-900">{std.name}</h4>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        NIS: {std.nis} • {std.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        currentStatus === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'Sakit'
                          ? 'bg-amber-100 text-amber-800'
                          : currentStatus === 'Izin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  {/* Status Buttons Grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'Hadir')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        currentStatus === 'Hadir'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'Sakit')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        currentStatus === 'Sakit'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'Izin')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        currentStatus === 'Izin'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(std.id, 'Alpha')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        currentStatus === 'Alpha'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Alpha
                    </button>
                  </div>

                  {/* Keterangan Izin Input (Muncul saat izin) */}
                  {isIzin && (
                    <div className="p-3 bg-blue-50/90 rounded-xl border border-blue-200 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-blue-900 mb-1">
                        Isi Keterangan Izin: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Mengikuti lomba / acara keluarga..."
                        value={currentNote}
                        onChange={(e) => handleNoteChange(std.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Catatan Sakit */}
                  {isSakit && (
                    <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Catatan Sakit (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Demam, flu, ada surat dokter..."
                        value={currentNote}
                        onChange={(e) => handleNoteChange(std.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Save Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Pastikan seluruh siswa telah terdata status kehadirannya sebelum menyimpan.
            </div>

            <button
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Presensi Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
