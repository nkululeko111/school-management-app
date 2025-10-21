// src/pages/SchoolOnboarding.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import { testSupabaseConnection } from '../../utils/testSupabase';
import './OnboardPage.css';

interface SchoolOnboardingProps {
  onBack?: () => void;
}

export default function SchoolOnboarding({ onBack }: SchoolOnboardingProps) {
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

  // Check if a school already exists and test connection
  useEffect(() => {
    const checkSchool = async () => {
      try {
        await testSupabaseConnection();
        const { data, error } = await supabase.from('schools').select('id').maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        setSchoolExists(!!data);
      } catch (err: any) {
        console.error('Error checking school:', err.message);
        setSchoolExists(false);
      }
    };
    checkSchool();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1️⃣ Check if admin email already exists
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();
      if (existingAdmin) throw new Error('Admin email already exists.');

      // 2️⃣ Sign up admin
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      });
      if (signUpError || !signUpData.user) throw signUpError || new Error('Failed to create admin user.');

      // 3️⃣ Sign in admin immediately to activate session (needed for RLS & FK)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      if (signInError || !signInData.session) throw signInError || new Error('Failed to sign in admin.');

      const userId = signInData.session.user.id;

      // 4️⃣ Create school and profile (fallback if RPC fails)
      try {
        const { error: rpcError } = await supabase.rpc('onboard_school_and_admin', {
          p_user_id: userId,
          p_school_name: schoolName,
          p_school_email: schoolEmail,
          p_school_address: schoolAddress,
          p_school_phone: schoolPhone,
          p_school_logo: schoolLogo,
          p_admin_full_name: adminName,
          p_admin_email: adminEmail
        });
        if (rpcError) throw rpcError;
      } catch (rpcError: any) {
        console.warn('RPC failed, using fallback method:', rpcError);

        // Create school
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
          .maybeSingle();
        if (schoolError || !schoolData) throw schoolError || new Error('Failed to create school.');

        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: adminName,
            email: adminEmail,
            role: 'admin',
            school_id: schoolData.id
          }]);
        if (profileError) throw profileError;
      }

      setMessage('School onboarded successfully! Check your email and log in.');

      // Reset form
      setSchoolName('');
      setSchoolEmail('');
      setSchoolAddress('');
      setSchoolPhone('');
      setSchoolLogo('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setSchoolExists(true);
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setMessage(err.message || 'Error onboarding school.');
    } finally {
      setLoading(false);
    }
  };

  if (schoolExists === null) return <p>Loading...</p>;
  if (schoolExists) return <p>School already onboarded. Please <a href="/login">login</a>.</p>;

  return (
    <div className="onboard-container">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-orange-600 hover:text-orange-700 flex items-center gap-2"
        >
          ← Back to Welcome
        </button>
      )}
      <h1>School Onboarding</h1>
      <form onSubmit={handleSubmit} className="onboard-form">
        <h2>School Information</h2>
        <input type="text" placeholder="School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} required />
        <input type="email" placeholder="School Email" value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} required />
        <input type="text" placeholder="School Address" value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} required />
        <input type="text" placeholder="School Phone" value={schoolPhone} onChange={e => setSchoolPhone(e.target.value)} />
        <input type="text" placeholder="School Logo URL" value={schoolLogo} onChange={e => setSchoolLogo(e.target.value)} />

        <h2>Admin Account</h2>
        <input type="text" placeholder="Full Name" value={adminName} onChange={e => setAdminName(e.target.value)} required />
        <input type="email" placeholder="Admin Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required autoComplete="new-password" />

        <button type="submit" disabled={loading}>{loading ? 'Onboarding...' : 'Onboard School'}</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
