/*
  # Classes and Subjects Tables

  ## Overview
  This migration creates tables for managing classes, subjects, and their assignments.

  ## Tables Created

  ### 1. classes
  Class/classroom information
  - `id` (uuid, primary key)
  - `school_id` (uuid) - References schools
  - `name` (text) - Class name (e.g., "5A", "6B")
  - `grade` (text) - Grade level (e.g., "Grade 5")
  - `section` (text) - Section identifier
  - `teacher_id` (uuid) - References teachers (class teacher)
  - `room_number` (text) - Physical room location
  - `capacity` (integer) - Maximum students
  - `academic_year` (text) - Year/term
  - `created_at` (timestamptz)

  ### 2. subjects
  Subject information
  - `id` (uuid, primary key)
  - `school_id` (uuid) - References schools
  - `name` (text) - Subject name
  - `code` (text) - Subject code
  - `description` (text) - Subject description
  - `created_at` (timestamptz)

  ### 3. class_subjects
  Links classes to subjects
  - `id` (uuid, primary key)
  - `class_id` (uuid) - References classes
  - `subject_id` (uuid) - References subjects
  - `teacher_id` (uuid) - References teachers
  - `periods_per_week` (integer) - Number of periods
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Admins can manage all data
  - Teachers can view their assigned classes and subjects
  - Students and parents can view class information
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade text NOT NULL,
  section text,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  room_number text,
  capacity integer DEFAULT 40,
  academic_year text DEFAULT '2024',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'students_class_id_fkey'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_class_id_fkey
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create class_subjects junction table
CREATE TABLE IF NOT EXISTS class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  periods_per_week integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Admins and teachers can view all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view their class"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.class_id = classes.id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN student_parents sp ON sp.student_id = s.id
      JOIN parents p ON p.id = sp.parent_id
      WHERE s.class_id = classes.id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update classes"
  ON classes FOR UPDATE
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

CREATE POLICY "Admins can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for subjects
CREATE POLICY "Authenticated users can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update subjects"
  ON subjects FOR UPDATE
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

CREATE POLICY "Admins can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for class_subjects
CREATE POLICY "Authenticated users can view class subjects"
  ON class_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert class subjects"
  ON class_subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update class subjects"
  ON class_subjects FOR UPDATE
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

CREATE POLICY "Admins can delete class subjects"
  ON class_subjects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_teacher ON class_subjects(teacher_id);
