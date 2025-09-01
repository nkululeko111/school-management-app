const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Demo users for different roles
const demoUsers = [
  {
    id: '1',
    email: 'admin@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Administrator',
    role: 'admin',
    schoolId: 'demo-school'
  },
  {
    id: '2',
    email: 'teacher@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Sarah Johnson',
    role: 'teacher',
    schoolId: 'demo-school'
  },
  {
    id: '3',
    email: 'parent@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'John Mwangi',
    role: 'parent',
    schoolId: 'demo-school'
  },
  {
    id: '4',
    email: 'student@school.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Amara Okafor',
    role: 'student',
    schoolId: 'demo-school'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password
    // In production, use: const isValid = await bcrypt.compare(password, user.password);
    const isValid = true;

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        schoolId: user.schoolId 
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (for new schools/users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, schoolId } = req.body;

    // Check if user already exists
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (in production, save to database)
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      schoolId: schoolId || 'demo-school'
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        schoolId: newUser.schoolId 
      },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Token verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user,
    message: 'Token is valid'
  });
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  // In production, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

module.exports = router;