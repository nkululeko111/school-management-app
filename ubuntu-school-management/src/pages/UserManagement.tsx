import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Users, UserPlus, GraduationCap, Shield, School, Loader2 } from 'lucide-react';

type Role = 'teacher' | 'student' | 'parent' | 'admin';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Shared fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Teacher fields
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [subjects, setSubjects] = useState<string>('');

  // Student fields
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [grade, setGrade] = useState('');
  const [classId, setClassId] = useState('');

  // Parent fields
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentAltPhone, setParentAltPhone] = useState('');
  const [relationship, setRelationship] = useState('guardian');

  const [classes, setClasses] = useState<{ id: string; name: string; grade: string }[]>([]);

  const schoolId = user?.schoolId || '';

  useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) return;
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade')
        .eq('school_id', schoolId)
        .order('grade');
      if (!error && data) setClasses(data);
    };
    loadClasses();
  }, [schoolId]);

  const roleIcon = useMemo(() => {
    switch (role) {
      case 'teacher': return GraduationCap;
      case 'student': return Users;
      case 'parent': return Shield;
      default: return School;
    }
  }, [role]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (!schoolId) throw new Error('Missing school context');

      const payload: Record<string, any> = {
        email,
        fullName,
        role,
        schoolId,
      };

      if (role === 'teacher') {
        payload.employeeNumber = employeeNumber || undefined;
        payload.subjects = subjects
          ? subjects.split(',').map(s => s.trim()).filter(Boolean)
          : [];
      }

      if (role === 'student') {
        payload.admissionNumber = admissionNumber || undefined;
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.dateOfBirth = dateOfBirth || undefined;
        payload.gender = gender || undefined;
        payload.grade = grade || undefined;
        payload.classId = classId || undefined;
      }

      if (role === 'parent') {
        payload.parentFirstName = parentFirstName || undefined;
        payload.parentLastName = parentLastName || undefined;
        payload.parentPhone = parentPhone || undefined;
        payload.parentAltPhone = parentAltPhone || undefined;
        payload.relationship = relationship || undefined;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Temporary dev header; replace with real JWT validation in production
          'x-admin': 'true'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');

      setMessage('User created and invited successfully.');
      setEmail('');
      setFullName('');
      setEmployeeNumber('');
      setSubjects('');
      setAdmissionNumber('');
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setGender('');
      setGrade('');
      setClassId('');
      setParentFirstName('');
      setParentLastName('');
      setParentPhone('');
      setParentAltPhone('');
      setRelationship('guardian');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = roleIcon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64 pt-16">
        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600 mt-1">Create teachers, students, parents, and admins</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {(['teacher','student','parent','admin'] as Role[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    role === r ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="capitalize font-medium">{r}</span>
                </button>
              ))}
            </div>

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shared */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={fullName} onChange={e=>setFullName(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>

              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <input value={employeeNumber} onChange={e=>setEmployeeNumber(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma-separated)</label>
                    <input value={subjects} onChange={e=>setSubjects(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                </>
              )}

              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                    <input value={admissionNumber} onChange={e=>setAdmissionNumber(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input value={firstName} onChange={e=>setFirstName(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input value={lastName} onChange={e=>setLastName(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)} type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <input value={grade} onChange={e=>setGrade(e.target.value)} type="text" placeholder="e.g., Grade 5" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select value={classId} onChange={e=>setClassId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option value="">Select class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.grade} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {role === 'parent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input value={parentFirstName} onChange={e=>setParentFirstName(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input value={parentLastName} onChange={e=>setParentLastName(e.target.value)} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input value={parentPhone} onChange={e=>setParentPhone(e.target.value)} type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                    <input value={parentAltPhone} onChange={e=>setParentAltPhone(e.target.value)} type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <select value={relationship} onChange={e=>setRelationship(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isSubmitting ? 'bg-gray-300 text-gray-600' : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  Create {role}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;


