/*
  # Communication and Reports Tables

  ## Overview
  This migration creates tables for managing communications (SMS, WhatsApp, Email)
  and generating various reports.

  ## Tables Created

  ### 1. messages
  Communication records
  - `id` (uuid, primary key)
  - `school_id` (uuid) - References schools
  - `sender_id` (uuid) - References profiles (who sent)
  - `channel` (text) - sms, whatsapp, email, app
  - `audience_type` (text) - all, class, individual, role
  - `audience_id` (uuid) - Class or individual ID
  - `subject` (text) - Message subject (for email)
  - `content` (text) - Message content
  - `status` (text) - pending, sent, delivered, failed
  - `sent_at` (timestamptz) - When sent
  - `delivered_count` (integer) - Number delivered
  - `total_recipients` (integer) - Total recipients
  - `created_at` (timestamptz)

  ### 2. message_recipients
  Track individual message delivery
  - `id` (uuid, primary key)
  - `message_id` (uuid) - References messages
  - `recipient_id` (uuid) - References profiles/parents
  - `phone` (text) - Recipient phone
  - `email` (text) - Recipient email
  - `status` (text) - pending, sent, delivered, failed
  - `delivered_at` (timestamptz) - Delivery time
  - `error_message` (text) - Error details
  - `created_at` (timestamptz)

  ### 3. grades
  Student academic performance
  - `id` (uuid, primary key)
  - `student_id` (uuid) - References students
  - `subject_id` (uuid) - References subjects
  - `class_id` (uuid) - References classes
  - `term` (text) - Academic term
  - `exam_type` (text) - midterm, final, assignment, quiz
  - `score` (numeric) - Earned points
  - `max_score` (numeric) - Maximum points
  - `percentage` (numeric) - Calculated percentage
  - `grade` (text) - Letter grade
  - `remarks` (text) - Teacher comments
  - `recorded_by` (uuid) - References profiles (teacher)
  - `created_at` (timestamptz)

  ### 4. report_cards
  Consolidated student reports
  - `id` (uuid, primary key)
  - `student_id` (uuid) - References students
  - `class_id` (uuid) - References classes
  - `term` (text) - Academic term
  - `academic_year` (text) - Year
  - `overall_percentage` (numeric) - Average score
  - `overall_grade` (text) - Overall grade
  - `attendance_percentage` (numeric) - Attendance rate
  - `teacher_comments` (text) - General feedback
  - `generated_at` (timestamptz) - Report creation time
  - `created_at` (timestamptz)

  ### 5. notifications
  In-app notification system
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `type` (text) - info, warning, success, error
  - `read` (boolean) - Read status
  - `link` (text) - Optional navigation link
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Admins and teachers can send messages
  - Users receive messages relevant to them
  - Grade access based on student/parent relationship
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email', 'app')),
  audience_type text NOT NULL CHECK (audience_type IN ('all', 'class', 'individual', 'role')),
  audience_id uuid,
  subject text,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at timestamptz,
  delivered_count integer DEFAULT 0,
  total_recipients integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create message_recipients table
CREATE TABLE IF NOT EXISTS message_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  phone text,
  email text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  term text NOT NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('midterm', 'final', 'assignment', 'quiz', 'test')),
  score numeric(5,2) NOT NULL,
  max_score numeric(5,2) NOT NULL,
  percentage numeric(5,2),
  grade text,
  remarks text,
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create report_cards table
CREATE TABLE IF NOT EXISTS report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  term text NOT NULL,
  academic_year text NOT NULL,
  overall_percentage numeric(5,2),
  overall_grade text,
  attendance_percentage numeric(5,2),
  teacher_comments text,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, term, academic_year)
);

ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Admins and teachers can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update messages"
  ON messages FOR UPDATE
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

CREATE POLICY "Admins can delete messages"
  ON messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for message_recipients
CREATE POLICY "Admins and teachers can view all recipients"
  ON message_recipients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Users can view their own messages"
  ON message_recipients FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "System can manage recipients"
  ON message_recipients FOR ALL
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

-- RLS Policies for grades
CREATE POLICY "Admins and teachers can view all grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents p ON p.id = sp.parent_id
      WHERE sp.student_id = grades.student_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Teachers can update grades"
  ON grades FOR UPDATE
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

CREATE POLICY "Admins can delete grades"
  ON grades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for report_cards
CREATE POLICY "Admins and teachers can view all reports"
  ON report_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Students can view own reports"
  ON report_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = report_cards.student_id
      AND students.profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's reports"
  ON report_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parents sp
      JOIN parents p ON p.id = sp.parent_id
      WHERE sp.student_id = report_cards.student_id
      AND p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins and teachers can manage reports"
  ON report_cards FOR ALL
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

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can send notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_school ON messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_class ON grades(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_term ON grades(term);
CREATE INDEX IF NOT EXISTS idx_report_cards_student ON report_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_term ON report_cards(term, academic_year);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
