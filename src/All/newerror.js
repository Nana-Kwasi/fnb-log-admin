PS C:\Users\f8877557\file-backend> cd new-backend
PS C:\Users\f8877557\file-backend\new-backend> node server.js
C:\Users\f8877557\file-backend\new-backend\node_modules\express\lib\router\index.js:469
      throw new TypeError('Router.use() requires a middleware function but got a ' + gettype(fn))
      ^

TypeError: Router.use() requires a middleware function but got a Object
    at Function.use (C:\Users\f8877557\file-backend\new-backend\node_modules\express\lib\router\index.js:469:13)
    at Function.<anonymous> (C:\Users\f8877557\file-backend\new-backend\node_modules\express\lib\application.js:227:21)
    at Array.forEach (<anonymous>)
    at Function.use (C:\Users\f8877557\file-backend\new-backend\node_modules\express\lib\application.js:224:7)
    at Object.<anonymous> (C:\Users\f8877557\file-backend\new-backend\server.js:29:5)
    at Module._compile (node:internal/modules/cjs/loader:1562:14)
    at Object..js (node:internal/modules/cjs/loader:1699:10)
    at Module.load (node:internal/modules/cjs/loader:1313:32)
    at Function._load (node:internal/modules/cjs/loader:1123:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)

Node.js v22.13.1
PS C:\Users\f8877557\file-backend\new-backend> 

//userscontrollers

const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

const registerNewUser = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    // Validation
    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    // Check if user already exists
    const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users_table (email, password, branch, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, branch, created_at',
      [email, hashedPassword, branch]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        created_at: result.rows[0].created_at
      }
    });

  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Server error during user registration' });
  }
};

// Modify login controller to support users_table
const loginUser = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    // Check both admin_users and users_table
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    const userResult = await pool.query(
      'SELECT * FROM users_table WHERE email = $1',
      [email]
    );

    const user = adminResult.rows[0] || userResult.rows[0];

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check branch access
    if (user.branches && !user.branches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create payload
    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user'
    };

    // Generate token
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

// Script to create users_table
const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users_table (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      );
    `);
    console.log('users_table created successfully');
  } catch (err) {
    console.error('Error creating users_table:', err);
  }
};

module.exports = {
  registerNewUser,
  loginUser,
  createUsersTable
};
//route users
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController')


router.post('/register', usersController.registerNewUser);

module.export = router;

// server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const usersRouter = require('./route/users')

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

// Mount the visitors router
app.use('/visitors', visitorsRouter);
app.use('./users', usersRouter);

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
  console.log(`Check telephone endpoint: http://localhost:${PORT}/visitors/check-telephone/:telephone`);
});


//route auth

//rout auth
const express = require('express');
const router = express.Router();
const { login, registerUser, verifyToken } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); 
// Login route
router.post('/login', login);

// Register route
router.post('/register', registerUser);

// Token verification route
router.post('/verify', verifyToken);

// Branches route (as you already had)
router.get('/branches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT branchname FROM visitor_log');
    
    const branches = result.rows.map(row => row.branchname).filter(branch => branch);
    
    res.json({ branches });
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});
