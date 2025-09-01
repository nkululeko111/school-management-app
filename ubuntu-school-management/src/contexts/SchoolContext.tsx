import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  admissionNumber: string;
  parentContact: string;
  avatar?: string;
  attendance: number;
  lastAttendance?: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  teacher: string;
  studentCount: number;
  subjects: string[];
}

interface SchoolContextType {
  students: Student[];
  classes: Class[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  markAttendance: (studentId: string, present: boolean) => void;
  getClassStudents: (classId: string) => Student[];
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Amara Okafor',
      grade: 'Grade 5',
      class: '5A',
      admissionNumber: 'ASM001',
      parentContact: '+254 712 345 678',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      attendance: 95,
      lastAttendance: '2025-01-15'
    },
    {
      id: '2',
      name: 'Kwame Asante',
      grade: 'Grade 5',
      class: '5A',
      admissionNumber: 'ASM002',
      parentContact: '+254 723 456 789',
      avatar: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      attendance: 88,
      lastAttendance: '2025-01-14'
    },
    {
      id: '3',
      name: 'Fatima Diallo',
      grade: 'Grade 6',
      class: '6B',
      admissionNumber: 'ASM003',
      parentContact: '+254 734 567 890',
      avatar: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      attendance: 92,
      lastAttendance: '2025-01-15'
    }
  ]);

  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: '5A',
      grade: 'Grade 5',
      teacher: 'Mrs. Sarah Johnson',
      studentCount: 32,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili']
    },
    {
      id: '2',
      name: '6B',
      grade: 'Grade 6',
      teacher: 'Mr. Peter Wanjiku',
      studentCount: 28,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili', 'French']
    }
  ]);

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates } : student
    ));
  };

  const markAttendance = (studentId: string, present: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    updateStudent(studentId, { 
      lastAttendance: today,
      attendance: present ? 100 : 0 // Simplified for demo
    });
  };

  const getClassStudents = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return [];
    return students.filter(student => student.class === classData.name);
  };

  return (
    <SchoolContext.Provider value={{
      students,
      classes,
      addStudent,
      updateStudent,
      markAttendance,
      getClassStudents
    }}>
      {children}
    </SchoolContext.Provider>
  );
};