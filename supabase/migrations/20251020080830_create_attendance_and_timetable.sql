/*
  # Attendance and Timetable Tables

  ## Overview
  This migration creates tables for tracking student attendance and managing class timetables.

  ## Tables Created

  ### 1. attendance
  Daily attendance records
  - `id` (uuid, primary key)
  - `student_id` (uuid) - References students
  - `class_id` (uuid) - References classes
  - `date` (date) - Attendance date
  - `status` (text) - present, absent, late, excused
  - `marked_by` (uuid) - References profiles (teacher)
  - `notes` (text) - Additional notes
  - `notification_sent` (boolean) - Parent notification flag
  - `created_at` (timestamptz)

  ### 2. timetable_periods
  Time slot definitions
  - `id` (uuid, primary key)
  - `school_id` (uuid) - References schools
  - `period_number` (integer) - Period sequence
  - `start_time` (time) - Start time
  - `end_time` (time) - End time
  - `period_type` (text) - class, break, lunch
  - `created_at` (timestamptz)

  ### 3. timetable
  Weekly schedule
  - `id` (uuid, primary key)
  - `class_id` (uuid) - References classes
  - `subject_id` (uuid) - References subjects
  - `teacher_id` (uuid) - References teachers
  - `period_id` (uuid) - References timetable_periods
  - `day_of_week` (integer) - 1-5 (Monday-Friday)
  - `room_number` (text) - Classroom location
  - `academic_year` (text) - Year/term
  - `created_at` (timestamptz)

  ### 4. attendance_summary
  Monthly attendance statistics
  - `id` (uuid, primary key)
  - `student_id` (uuid) - References students
  - `month` (date) - Month being tracked
  - `total_days` (integer) - School days in month
  - `present_days` (integer) - Days present
  - `absent_days` (integer) - Days absent
  - `late_days` (integer) - Days late
  - `attendance_percentage` (numeric) - Calculated percentage
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Admins and teachers can manage attendance
  - Parents can view their children's attendance
  - Students can view their own attendance
*/

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create timetable_periods table
CREATE TABLE IF NOT EXISTS timetable_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  period_number integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  period_type text DEFAULT 'class' CHECK (period_type IN ('class', 'break', 'lunch', 'assembly')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, period_number)
);

ALTER TABLE timetable_periods ENABLE ROW LEVEL SECURITY;

-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  period_id uuid REFERENCES timetable_periods(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  room_number text,
  academic_year text DEFAULT '2024',
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, period_id, day_of_week)
);

ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Create attendance_summary table
CREATE TABLE IF NOT EXISTS attendance_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  month date NOT NULL,
  total_days integer DEFAULT 0,
  present_days integer DEFAULT 0,
  absent_days integer DEFAULT 0,
  late_days integer DEFAULT 0,
  attendance_percentage numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, month)
);

ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "Admins and teachers can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance.student_id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents p ON p.id = sp.parent_id
      WHERE sp.student_id = attendance.student_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and teachers can mark attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for timetable_periods
CREATE POLICY "Authenticated users can view periods"
  ON timetable_periods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert periods"
  ON timetable_periods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update periods"
  ON timetable_periods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete periods"
  ON timetable_periods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for timetable
CREATE POLICY "Admins and teachers can view timetable"
  ON timetable FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view their class timetable"
  ON timetable FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.class_id = timetable.class_id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's timetable"
  ON timetable FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN student_parents sp ON sp.student_id = s.id
      JOIN parents p ON p.id = sp.parent_id
      WHERE s.class_id = timetable.class_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert timetable"
  ON timetable FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update timetable"
  ON timetable FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete timetable"
  ON timetable FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for attendance_summary
CREATE POLICY "Admins and teachers can view all summaries"
  ON attendance_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view own summary"
  ON attendance_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_summary.student_id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's summary"
  ON attendance_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents p ON p.id = sp.parent_id
      WHERE sp.student_id = attendance_summary.student_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "System can manage summaries"
  ON attendance_summary FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_periods_school ON timetable_periods(school_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_teacher ON timetable(teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_student ON attendance_summary(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_month ON attendance_summary(month);
