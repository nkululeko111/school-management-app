// src/pages/SchoolOnboarding.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import './OnboardPage.css';

export default function SchoolOnboarding() {
  const [schoolExists, setSchoolExists] = useState<boolean | null>(null);

  // School fields
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');

  // Admin fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if a school already exists
  useEffect(() => {
    const checkSchool = async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') console.error(error);
      setSchoolExists(!!data);
    };
    checkSchool();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1️⃣ Create school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: schoolName,
          email: schoolEmail,
          address: schoolAddress,
          phone: schoolPhone,
          logo_url: schoolLogo
        }])
        .select()
        .single();

      if (schoolError) throw schoolError;

      // 2️⃣ Sign up first admin
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
      });

      if (userError || !userData.user) throw userError || new Error('No user returned');

      // 3️⃣ Create profile for admin
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userData.user.id,
          full_name: adminName,
          email: adminEmail,
          role: 'admin',
          school_id: schoolData.id
        }]);

      if (profileError) throw profileError;

      setMessage('School onboarded successfully! Please log in.');
      // Reset form fields
      setSchoolName('');
      setSchoolEmail('');
      setSchoolAddress('');
      setSchoolPhone('');
      setSchoolLogo('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setSchoolExists(true);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error onboarding school');
    } finally {
      setLoading(false);
    }
  };

  if (schoolExists === null) return <p>Loading...</p>;
  if (schoolExists) return <p>School already onboarded. Please <a href="/login">login</a>.</p>;

  return (
    <div className="onboard-container">
      <h1>School Onboarding</h1>
      <form onSubmit={handleSubmit} className="onboard-form">
        <h2>School Information</h2>
        <input
          type="text"
          placeholder="School Name"
          value={schoolName}
          onChange={e => setSchoolName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="School Email"
          value={schoolEmail}
          onChange={e => setSchoolEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="School Address"
          value={schoolAddress}
          onChange={e => setSchoolAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="School Phone"
          value={schoolPhone}
          onChange={e => setSchoolPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="School Logo URL"
          value={schoolLogo}
          onChange={e => setSchoolLogo(e.target.value)}
        />

        <h2>Admin Account</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={adminName}
          onChange={e => setAdminName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Admin Email"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={adminPassword}
          onChange={e => setAdminPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Onboarding...' : 'Onboard School'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
