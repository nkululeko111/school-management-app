import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { BarChart3, FilePlus2, Loader2, Save, Search } from 'lucide-react';

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  grade: string;
  class_id: string | null;
}

interface GradeRow {
  score: number;
  max_score: number;
  subject_id: string;
}

const ReportCards: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;
    return students.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(query));
  }, [students, searchTerm]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!user?.schoolId) return;
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, first_name, last_name, grade, class_id')
          .eq('school_id', user.schoolId)
          .order('last_name');
        if (error) throw error;
        setStudents(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [user?.schoolId]);

  const generateAndSaveReport = async () => {
    if (!selectedStudentId) {
      setError('Select a student');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Fetch grades for the student for the selected term and year
      const { data: grades, error: gradesErr } = await supabase
        .from('grades')
        .select('score, max_score, subject_id, class_id')
        .eq('student_id', selectedStudentId)
        .eq('term', term);
      if (gradesErr) throw gradesErr;

      const gradeRows: GradeRow[] = (grades || []).map(g => ({
        score: Number(g.score || 0),
        max_score: Number(g.max_score || 0),
        subject_id: g.subject_id
      }));

      const totalScore = gradeRows.reduce((sum, r) => sum + (isNaN(r.score) ? 0 : r.score), 0);
      const totalMax = gradeRows.reduce((sum, r) => sum + (isNaN(r.max_score) ? 0 : r.max_score), 0);
      const overallPercentage = totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(2)) : 0;

      // Simple overall grade mapping
      const letter = overallPercentage >= 80 ? 'A' : overallPercentage >= 70 ? 'B' : overallPercentage >= 60 ? 'C' : overallPercentage >= 50 ? 'D' : 'E';

      // Attendance percentage from latest month if available
      const monthStr = `${academicYear}-01-01`;
      const { data: attRows } = await supabase
        .from('attendance_summary')
        .select('attendance_percentage')
        .eq('student_id', selectedStudentId)
        .order('month', { ascending: false })
        .limit(1);
      const attendancePct = attRows && attRows.length > 0 ? Number(attRows[0].attendance_percentage) : null;

      // Need class_id for report row
      const selectedStudent = students.find(s => s.id === selectedStudentId);
      const classId = selectedStudent?.class_id || null;

      // Upsert into report_cards
      const { error: rcErr } = await supabase.from('report_cards').upsert({
        student_id: selectedStudentId,
        class_id: classId,
        term,
        academic_year: academicYear,
        overall_percentage: overallPercentage,
        overall_grade: letter,
        attendance_percentage: attendancePct,
        teacher_comments: null
      }, { onConflict: 'student_id,term,academic_year' });
      if (rcErr) throw rcErr;

      setMessage('Report card generated and saved.');
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Report Cards</h1>
                <p className="text-gray-600 mt-1">Generate and save report cards per student</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Type name..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select value={term} onChange={e=>setTerm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  <option>Term 1</option>
                  <option>Term 2</option>
                  <option>Term 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input value={academicYear} onChange={e=>setAcademicYear(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 max-h-96 overflow-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="p-6 text-center text-gray-600">Loading students...</div>
                ) : (
                  <ul>
                    {filteredStudents.map(s => (
                      <li key={s.id}>
                        <button
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b text-left ${selectedStudentId === s.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                        >
                          <span className="font-medium text-gray-800">{s.first_name} {s.last_name}</span>
                          <span className="text-sm text-gray-600">{s.grade}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
                  <button
                    onClick={generateAndSaveReport}
                    disabled={saving || !selectedStudentId}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${saving || !selectedStudentId ? 'bg-gray-300 text-gray-600' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <FilePlus2 className="w-5 h-5" />}
                    Generate Report
                  </button>

                  {message && <div className="mt-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{message}</div>}
                  {error && <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportCards;


