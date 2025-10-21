const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Require a service role key to perform admin auth actions
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[admin routes] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables. Admin endpoints will not work.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Simple auth middleware placeholder — in production, validate JWT and ensure admin role
const requireAdmin = (req, res, next) => {
  // TODO: validate real auth; for now, allow if header x-admin: true
  if (req.headers['x-admin'] === 'true') return next();
  return res.status(403).json({ error: 'Admin access required' });
};

// Create a user (teacher, parent, student, or admin)
router.post('/users', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase admin not configured' });

  try {
    const {
      email,
      password,
      fullName,
      role, // 'admin' | 'teacher' | 'parent' | 'student'
      schoolId,
      // optional role-specific fields
      employeeNumber,
      subjects,
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      grade,
      classId,
      parentFirstName,
      parentLastName,
      parentPhone,
      parentAltPhone,
      relationship
    } = req.body;

    if (!email || !role || !schoolId) {
      return res.status(400).json({ error: 'email, role and schoolId are required' });
    }

    // 1) Create auth user; send email invite so they set their own password
    const { data: createdUser, error: adminErr } = await supabase.auth.admin.createUser({
      email,
      password: password || undefined,
      email_confirm: false,
      user_metadata: { invited_by: 'admin', role }
    });
    if (adminErr) return res.status(400).json({ error: adminErr.message });

    const userId = createdUser.user.id;

    // 2) Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'New User',
      role,
      school_id: schoolId
    });
    if (profileErr) return res.status(400).json({ error: profileErr.message });

    // 3) Role-specific records
    if (role === 'teacher') {
      const { error } = await supabase.from('teachers').insert({
        profile_id: userId,
        school_id: schoolId,
        employee_number: employeeNumber || `EMP-${Date.now()}`,
        subjects: Array.isArray(subjects) ? subjects : []
      });
      if (error) return res.status(400).json({ error: error.message });
    }

    if (role === 'student') {
      const { error } = await supabase.from('students').insert({
        profile_id: userId,
        school_id: schoolId,
        admission_number: admissionNumber || `ADM-${Date.now()}`,
        first_name: firstName || 'Student',
        last_name: lastName || 'Name',
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        grade: grade || 'Grade 1',
        class_id: classId || null
      });
      if (error) return res.status(400).json({ error: error.message });
    }

    if (role === 'parent') {
      const { error } = await supabase.from('parents').insert({
        profile_id: userId,
        first_name: parentFirstName || 'Parent',
        last_name: parentLastName || 'Name',
        phone: parentPhone || '',
        alternate_phone: parentAltPhone || null,
        email,
        relationship: relationship || 'guardian'
      });
      if (error) return res.status(400).json({ error: error.message });
    }

    // Optionally, send invite email via admin API
    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.APP_BASE_URL || 'http://localhost:5173'}/reset-password`
    });

    return res.status(201).json({
      message: 'User created and invited successfully',
      userId
    });
  } catch (err) {
    console.error('Admin create user error:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;


