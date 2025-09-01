const express = require('express');
const router = express.Router();

// Demo class data
let classes = [
  {
    id: '1',
    name: '5A',
    grade: 'Grade 5',
    academicYear: '2024-2025',
    teacher: {
      id: 'teacher-1',
      name: 'Mrs. Sarah Johnson',
      email: 'sarah.johnson@school.com',
      phone: '+254 712 345 678'
    },
    classroom: 'Room 12',
    capacity: 35,
    currentStudents: 32,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili'],
    schedule: {
      periods: 8,
      duration: 40, // minutes
      breakTime: 20 // minutes
    },
    createdAt: '2024-09-01',
    status: 'active'
  },
  {
    id: '2',
    name: '6B',
    grade: 'Grade 6',
    academicYear: '2024-2025',
    teacher: {
      id: 'teacher-2',
      name: 'Mr. Peter Wanjiku',
      email: 'peter.wanjiku@school.com',
      phone: '+254 723 456 789'
    },
    classroom: 'Room 8',
    capacity: 30,
    currentStudents: 28,
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili', 'French'],
    schedule: {
      periods: 8,
      duration: 40,
      breakTime: 20
    },
    createdAt: '2024-09-01',
    status: 'active'
  }
];

// Get all classes
router.get('/', (req, res) => {
  try {
    const { grade, teacher, status } = req.query;
    
    let filtered = [...classes];
    
    if (grade) {
      filtered = filtered.filter(c => c.grade === grade);
    }
    
    if (teacher) {
      filtered = filtered.filter(c => c.teacher.id === teacher);
    }
    
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    
    res.json({
      classes: filtered,
      total: filtered.length,
      message: 'Classes retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve classes' });
  }
});

// Get class by ID
router.get('/:id', (req, res) => {
  try {
    const classData = classes.find(c => c.id === req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({
      class: classData,
      message: 'Class retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve class' });
  }
});

// Create new class
router.post('/', (req, res) => {
  try {
    const newClass = {
      id: Date.now().toString(),
      ...req.body,
      currentStudents: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    classes.push(newClass);
    
    res.status(201).json({
      class: newClass,
      message: 'Class created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class
router.put('/:id', (req, res) => {
  try {
    const classIndex = classes.findIndex(c => c.id === req.params.id);
    
    if (classIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    classes[classIndex] = {
      ...classes[classIndex],
      ...req.body,
      id: req.params.id
    };
    
    res.json({
      class: classes[classIndex],
      message: 'Class updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete class
router.delete('/:id', (req, res) => {
  try {
    const classIndex = classes.findIndex(c => c.id === req.params.id);
    
    if (classIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check if class has students
    if (classes[classIndex].currentStudents > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete class with enrolled students. Please transfer students first.' 
      });
    }
    
    classes.splice(classIndex, 1);
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Assign student to class
router.post('/:id/students', (req, res) => {
  try {
    const { studentIds } = req.body;
    const classIndex = classes.findIndex(c => c.id === req.params.id);
    
    if (classIndex === -1) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    const classData = classes[classIndex];
    
    // Check capacity
    if (classData.currentStudents + studentIds.length > classData.capacity) {
      return res.status(400).json({ 
        error: 'Class capacity exceeded. Cannot assign all students.' 
      });
    }
    
    // Update student count
    classes[classIndex].currentStudents += studentIds.length;
    
    res.json({
      class: classes[classIndex],
      assignedStudents: studentIds.length,
      message: 'Students assigned to class successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign students to class' });
  }
});

module.exports = router;