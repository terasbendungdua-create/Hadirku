import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  School,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { ClassItem, StudentItem } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onImport: (
    students: Array<Omit<StudentItem, 'id'>>,
    updateExisting: boolean
  ) => { added: number; updated: number };
}

interface ParsedStudentRow {
  rowNum: number;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  parentPhone: string;
  address: string;
  isValid: boolean;
  errors: string[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [defaultClassId, setDefaultClassId] = useState<string>(classes[0]?.id || '');
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ added: number; updated: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Function to download sample template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIS': '240101',
        'NISN': '3151234561',
        'Nama Siswa': 'Ahmad Fauzan',
        'L/P': 'L',
        'Kelas': classes[0]?.name || 'Kelas 1A',
        'No HP Orang Tua': '081234567890',
        'Alamat': 'Jl. Melati No. 10',
      },
      {
        'NIS': '240102',
        'NISN': '3151234562',
        'Nama Siswa': 'Siti Aisyah',
        'L/P': 'P',
        'Kelas': classes[0]?.name || 'Kelas 1A',
        'No HP Orang Tua': '081234567891',
        'Alamat': 'Jl. Kenanga No. 15',
      },
      {
        'NIS': '240103',
        'NISN': '3151234563',
        'Nama Siswa': 'Budi Prasetyo',
        'L/P': 'L',
        'Kelas': classes[1]?.name || 'Kelas 2A',
        'No HP Orang Tua': '081234567892',
        'Alamat': 'Jl. Cempaka No. 5',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set Column Widths
    worksheet['!cols'] = [
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 26 }, // Nama Siswa
      { wch: 8 },  // L/P
      { wch: 16 }, // Kelas
      { wch: 18 }, // No HP
      { wch: 28 }, // Alamat
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    XLSX.writeFile(workbook, 'Template_Import_Siswa_SD.xlsx');
  };

  // Process Excel File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // First worksheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse to JSON array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rawJson.length === 0) {
          alert('File Excel kosong atau tidak ada baris data.');
          return;
        }

        const rows: ParsedStudentRow[] = rawJson.map((row, idx) => {
          // Flexible key matching
          const getVal = (patterns: string[]): string => {
            for (const key of Object.keys(row)) {
              const cleanedKey = key.trim().toLowerCase();
              if (patterns.some((p) => cleanedKey === p || cleanedKey.includes(p))) {
                return String(row[key]).trim();
              }
            }
            return '';
          };

          const nis = getVal(['nis', 'no induk', 'nomor induk']);
          const nisn = getVal(['nisn', 'no nisn']);
          const name = getVal(['nama', 'nama siswa', 'nama lengkap', 'student']);
          const rawGender = getVal(['l/p', 'gender', 'jk', 'jenis kelamin']).toUpperCase();
          const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' || rawGender === 'WANITA' ? 'P' : 'L';
          const rawClass = getVal(['kelas', 'class', 'rombel']);
          const parentPhone = getVal(['hp', 'telepon', 'telp', 'kontak', 'wa', 'phone']);
          const address = getVal(['alamat', 'address', 'domisili']);

          // Match Class
          let matchedClass = classes.find(
            (c) =>
              c.name.toLowerCase() === rawClass.toLowerCase() ||
              c.name.toLowerCase().replace(/\s+/g, '') === rawClass.toLowerCase().replace(/\s+/g, '')
          );

          if (!matchedClass && rawClass) {
            // Try matching grade, e.g. "1A" matching "Kelas 1A"
            matchedClass = classes.find((c) =>
              c.name.toLowerCase().includes(rawClass.toLowerCase())
            );
          }

          const resolvedClassId = matchedClass ? matchedClass.id : defaultClassId;
          const resolvedClassName = matchedClass
            ? matchedClass.name
            : classes.find((c) => c.id === defaultClassId)?.name || rawClass || '-';

          const errors: string[] = [];
          if (!nis) errors.push('NIS kosong');
          if (!name) errors.push('Nama siswa kosong');

          return {
            rowNum: idx + 2, // Excel row 2
            nis,
            nisn,
            name,
            gender,
            classId: resolvedClassId,
            className: resolvedClassName,
            parentPhone,
            address,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(rows);
      } catch (err) {
        console.error('Gagal membaca file Excel', err);
        alert('Format file Excel tidak dapat dibaca. Pastikan file berformat .xlsx atau .xls.');
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Execute Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada baris siswa yang valid untuk diimport.');
      return;
    }

    setIsProcessing(true);

    const payload: Array<Omit<StudentItem, 'id'>> = validRows.map((r) => ({
      nis: r.nis,
      nisn: r.nisn,
      name: r.name,
      gender: r.gender,
      classId: r.classId,
      className: r.className,
      parentPhone: r.parentPhone,
      address: r.address,
      status: 'Aktif',
    }));

    const result = onImport(payload, updateExisting);
    setImportResult(result);
    setIsProcessing(false);

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
      });
    } catch {
      // ignore
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Import Data Siswa dari File Excel
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah file spreadsheet (.xlsx / .xls / .csv) untuk memasukkan data siswa secara massal.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner when import done */}
          {importResult && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Import Data Siswa Berhasil!
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Sebanyak <b>{importResult.added} siswa baru</b> ditambahkan dan{' '}
                <b>{importResult.updated} siswa diperbarui</b>. Seluruh data telah terintegrasi ke dalam
                sistem.
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}

          {/* Upload Zone & Template Download (Shown when not finished) */}
          {!importResult && (
            <div className="mt-4 space-y-4">
              {/* Template download helper */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs gap-3">
                <div className="flex items-center gap-2.5 text-blue-900">
                  <Download className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Belum punya format Excel? Gunakan template standar agar pembacaan kolom otomatis akurat.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Unduh Template Excel
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : file
                    ? 'border-emerald-300 bg-slate-50'
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6" />
                </div>

                {file ? (
                  <div>
                    <span className="font-extrabold text-sm text-slate-800 block">{file.name}</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      {(file.size / 1024).toFixed(1)} KB • Klik untuk ganti file
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      Klik atau seret file Excel ke sini
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Mendukung format .xlsx, .xls, dan .csv
                    </span>
                  </div>
                )}
              </div>

              {/* Options & Fallback Class Selector */}
              {parsedRows.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kelas Default (Jika kolom kelas di Excel kosong):
                    </label>
                    <select
                      value={defaultClassId}
                      onChange={(e) => {
                        const newClassId = e.target.value;
                        setDefaultClassId(newClassId);
                        // Update rows that have missing class
                        const targetCls = classes.find((c) => c.id === newClassId);
                        setParsedRows((prev) =>
                          prev.map((r) =>
                            !r.className || r.className === '-'
                              ? {
                                  ...r,
                                  classId: newClassId,
                                  className: targetCls ? targetCls.name : '',
                                }
                              : r
                          )
                        );
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Tingkat {c.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={updateExisting}
                        onChange={(e) => setUpdateExisting(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span>Perbarui data jika NIS sudah terdaftar di sistem</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parsed Preview Table */}
          {!importResult && parsedRows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pratinjau Data ({parsedRows.length} Baris Terdeteksi)
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Siap Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {invalidCount} Tidak Lengkap
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2 px-3 text-center w-10">Baris</th>
                      <th className="py-2 px-3">NIS</th>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-3 text-center">L/P</th>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">No HP Ortu</th>
                      <th className="py-2 px-3 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.rowNum}
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}
                      >
                        <td className="py-1.5 px-3 text-center text-slate-400 font-mono">
                          {row.rowNum}
                        </td>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-800">
                          {row.nis || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-slate-500">{row.nisn || '-'}</td>
                        <td className="py-1.5 px-3 font-bold text-slate-900">
                          {row.name || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="py-1.5 px-3 text-center font-bold">{row.gender}</td>
                        <td className="py-1.5 px-3 text-purple-700 font-semibold">{row.className}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-600">
                          {row.parentPhone || '-'}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Valid
                            </span>
                          ) : (
                            <span
                              title={row.errors.join(', ')}
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 cursor-help"
                            >
                              Gagal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!importResult && (
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleExecuteImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                validCount > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              {isProcessing ? 'Memproses...' : `Import ${validCount} Data Siswa`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
