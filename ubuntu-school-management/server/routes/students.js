const express = require('express');
const router = express.Router();

// Demo student data
let students = [
  {
    id: '1',
    name: 'Amara Okafor',
    email: 'amara.okafor@school.com',
    admissionNumber: 'ASM001',
    grade: 'Grade 5',
    class: '5A',
    dateOfBirth: '2014-03-15',
    gender: 'Female',
    address: '123 Lagos Street, Nairobi',
    parentName: 'Dr. Chike Okafor',
    parentContact: '+254 712 345 678',
    parentEmail: 'chike.okafor@email.com',
    emergencyContact: '+254 723 456 789',
    medicalInfo: 'No known allergies',
    admissionDate: '2020-01-15',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    attendance: 95,
    academicRecord: {
      currentGPA: 3.8,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili']
    },
    status: 'active'
  },
  {
    id: '2',
    name: 'Kwame Asante',
    email: 'kwame.asante@school.com',
    admissionNumber: 'ASM002',
    grade: 'Grade 5',
    class: '5A',
    dateOfBirth: '2014-07-22',
    gender: 'Male',
    address: '456 Accra Road, Nairobi',
    parentName: 'Mrs. Akosua Asante',
    parentContact: '+254 723 456 789',
    parentEmail: 'akosua.asante@email.com',
    emergencyContact: '+254 734 567 890',
    medicalInfo: 'Asthma - inhaler required',
    admissionDate: '2020-01-20',
    avatar: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    attendance: 88,
    academicRecord: {
      currentGPA: 3.5,
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili']
    },
    status: 'active'
  }
];

// Get all students
router.get('/', (req, res) => {
  try {
    const { grade, class: className, search } = req.query;
    
    let filteredStudents = [...students];
    
    if (grade) {
      filteredStudents = filteredStudents.filter(s => s.grade === grade);
    }
    
    if (className) {
      filteredStudents = filteredStudents.filter(s => s.class === className);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.admissionNumber.toLowerCase().includes(searchTerm) ||
        s.parentName.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      students: filteredStudents,
      total: filteredStudents.length,
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});

// Get student by ID
router.get('/:id', (req, res) => {
  try {
    const student = students.find(s => s.id === req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      student,
      message: 'Student retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve student' });
  }
});

// Add new student
router.post('/', (req, res) => {
  try {
    const newStudent = {
      id: Date.now().toString(),
      ...req.body,
      admissionDate: new Date().toISOString().split('T')[0],
      attendance: 100,
      academicRecord: {
        currentGPA: 0,
        subjects: req.body.subjects || []
      },
      status: 'active'
    };
    
    students.push(newStudent);
    
    res.status(201).json({
      student: newStudent,
      message: 'Student added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Update student
router.put('/:id', (req, res) => {
  try {
    const studentIndex = students.findIndex(s => s.id === req.params.id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    students[studentIndex] = {
      ...students[studentIndex],
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };
    
    res.json({
      student: students[studentIndex],
      message: 'Student updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', (req, res) => {
  try {
    const studentIndex = students.findIndex(s => s.id === req.params.id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    students.splice(studentIndex, 1);
    
    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove student' });
  }
});

// Bulk operations
router.post('/bulk', (req, res) => {
  try {
    const { operation, studentIds, updates } = req.body;
    
    if (operation === 'update') {
      studentIds.forEach(id => {
        const studentIndex = students.findIndex(s => s.id === id);
        if (studentIndex !== -1) {
          students[studentIndex] = { ...students[studentIndex], ...updates };
        }
      });
    } else if (operation === 'delete') {
      students = students.filter(s => !studentIds.includes(s.id));
    }
    
    res.json({ 
      message: `Bulk ${operation} completed successfully`,
      affectedCount: studentIds.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Bulk operation failed' });
  }
});

module.exports = router;