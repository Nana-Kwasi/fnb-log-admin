//controller for auth


const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const JWT_SECRET = 'your-secret-key-should-be-in-env-file';


const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    
    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

   
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    
    if (user.branches && !user.branches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

   
    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user'
    };

   
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

   
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: branch,
        role: user.role || 'user',
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};


const registerUser = async (req, res) => {
  const { email, password, branches, role } = req.body;

  try {
   
    
    
    if (!email || !password || !branches || !Array.isArray(branches)) {
      return res.status(400).json({ error: 'Email, password, and branches array are required' });
    }

   
    const checkUser = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const result = await pool.query(
      'INSERT INTO admin_users (email, password, branches, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role, created_at',
      [email, hashedPassword, branches, role || 'user']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};


const verifyToken = (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = {
  login,
  registerUser,
  verifyToken
};



//controller for visitor

const pool = require('../db');

const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    const result = await pool.query('SELECT * FROM visitor_log');
    console.log(`Found ${result.rows.length} visitor logs`);
    console.log("Sample data:", result.rows.slice(0, 2)); // Log first 2 entries
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogsByPhoneNumber = async (req, res) => {
  const { telephone } = req.query;
  try {
    const result = await pool.query('SELECT * FROM visitor_log WHERE telephone = $1', [telephone]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const checkTelephoneExists = async (req, res) => {
  const { telephone } = req.params;
  
  // Basic validation
  if (!telephone || telephone.trim() === '') {
    return res.status(400).json({ 
      error: 'Telephone number is required',
      exists: false
    });
  }

  try {
    console.log(`Checking if telephone exists: ${telephone}`);
    
    // First check if the pool connection is working
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Then perform the actual query
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM visitor_log WHERE telephone = $1) as "exists"', 
      [telephone]
    );
    
    console.log('Query result:', result.rows[0]);
    
    res.json({ 
      exists: result.rows[0].exists,
      message: result.rows[0].exists ? 'Telephone number already registered' : 'Telephone number is available'
    });
  } catch (err) {
    console.error('Error checking telephone:', err);
    res.status(500).json({ 
      error: 'Failed to check telephone number', 
      details: err.message,
      exists: false
    });
  }
};
const getVisitorLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM visitor_log WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const createVisitorLog = async (req, res) => {
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName // New field
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO visitor_log (date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *',
      [date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const updateVisitorLog = async (req, res) => {
  const { id } = req.params;
  const { timeOut } = req.body;
  try {
    const result = await pool.query(
      'UPDATE visitor_log SET timeOut = $1 WHERE id = $2 RETURNING *',
      [timeOut, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating visitor log:', err);
    res.status(500).send('Server error');
  }
};

const deleteVisitorLog = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM visitor_log WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllVisitorLogs,
  getVisitorLogsByPhoneNumber,
  getVisitorLogById,
  createVisitorLog,
  updateVisitorLog,
  deleteVisitorLog,
  checkTelephoneExists, // Export the new function
};

//middleware for auth

const jwt = require('jsonwebtoken');


const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

module.exports = function (req, res, next) {
  
  const token = req.header('x-auth-token');

  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

 
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

//route for auth
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registerUser);
router.post('/verify', authController.verifyToken);

module.exports = router

//routh for visitor
// const express = require('express');
// const router = express.Router();
// const visitorsController = require('../controllers/visitorsLogsController');



// // Existing routes
// router.get('/by-phone', visitorsController.getVisitorLogsByPhoneNumber);
// router.get('/:id', visitorsController.getVisitorLogById);
// router.post('/', visitorsController.createVisitorLog);
// router.put('/:id', visitorsController.updateVisitorLog);
// router.delete('/:id', visitorsController.deleteVisitorLog);
// router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);




const express = require('express');
const router = express.Router();
const visitorsController = require('../controllers/visitorsLogsController');
router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);

// Route to get all visitor logs
router.get('/', visitorsController.getAllVisitorLogs);

// Other existing routes
router.get('/by-phone', visitorsController.getVisitorLogsByPhoneNumber);
router.get('/:id', visitorsController.getVisitorLogById);
router.post('/', visitorsController.createVisitorLog);
router.put('/:id', visitorsController.updateVisitorLog);
router.delete('/:id', visitorsController.deleteVisitorLog);

module.exports = router;

//server

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); 

const app = express();

// CORS configuration
app.use(cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount the routers
app.use('/visitors', visitorsRouter);
app.use('/auth', authRouter); // Mount the auth router at /auth

// Catch-all 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
});

// script for creating admin user

require('dotenv').config(); // If you're using environment variables
const pool = require('../db');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    // Check if admin_users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating admin_users table...');
      
      await pool.query(`
        CREATE TABLE admin_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          branches TEXT[] NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW(),
          last_login TIMESTAMP
        );
      `);
      
      console.log('Table created successfully');
    } else {
      console.log('Table admin_users already exists');
    }

   
    const email = 'admin@fnb.com';
    const password = 'password12345'; 
    
   
    const userCheck = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      console.log(`Admin user ${email} already exists`);
      return;
    }
    
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    
    const branchesResult = await pool.query(`
      SELECT DISTINCT branchname FROM visitor_log WHERE branchname IS NOT NULL AND branchname != '';
    `);
    
    const branches = branchesResult.rows.map(row => row.branchname);
    
    
    if (branches.length === 0) {
      branches.push('No Branch');
    }
    
    
    await pool.query(
      'INSERT INTO admin_users (email, password, branches, role) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, branches, 'admin']
    );
    
    console.log(`Admin user ${email} created successfully with access to branches:`, branches);
    console.log('Please change the default password after first login!');
    
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    pool.end();
  }
}

createAdminUser();