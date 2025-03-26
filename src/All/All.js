

//server

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const visitorsRouter = require('./route/visitors');
// const authRouter = require('./route/auth'); 

// const app = express();

// // CORS configuration
// app.use(cors());

// // Body parser middleware
// app.use(bodyParser.json({ limit: '10mb' })); 
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// // Debug middleware to log all requests
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // Mount the routers
// app.use('/visitors', visitorsRouter);
// app.use('/auth', authRouter); // Mount the auth router at /auth

// // Catch-all 404 handler
// app.use((req, res) => {
//   console.log(`Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({ error: 'Route not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({
//     error: 'Server error',
//     message: err.message
//   });
// });

// const PORT = 5001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Health check available at: http://localhost:${PORT}/health`);
//   console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
// });
console.log('Current directory:', __dirname);
console.log('Attempting to import visitors router from:', path.join(__dirname, 'route', 'visitors'));
console.log('Attempting to import auth router from:', path.join(__dirname, 'route', 'auth'));

const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); 

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',  // Be cautious with this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Body parser middleware with increased logging
app.use(bodyParser.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('Invalid JSON:', buf.toString());
      throw new Error('Invalid JSON');
    }
  }
})); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Comprehensive debug middleware to log all requests in detail
app.use((req, res, next) => {
  console.log(`
    ===== Incoming Request =====
    Timestamp: ${new Date().toISOString()}
    Method: ${req.method}
    URL: ${req.url}
    Headers: ${JSON.stringify(req.headers)}
    Query Params: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(req.body)}
    ===========================
  `);
  next();
});

// Explicit route logging middleware
const logRoutes = (router, routerName) => {
  if (router.stack) {
    console.log(`Routes for ${routerName}:`);
    router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(`  ${r.route.stack[0].method.toUpperCase()} ${routerName}${r.route.path}`);
      }
    });
  }
};

// Log routes before mounting
logRoutes(visitorsRouter, '/visitors');
logRoutes(authRouter, '/auth');

// Mount the routers
app.use('/visitors', visitorsRouter);
app.use('/auth', authRouter);

// Detailed 404 handler
app.use((req, res) => {
  console.error(`
    ===== 404 ROUTE NOT FOUND =====
    Full Request Details:
    Method: ${req.method}
    URL: ${req.url}
    Full Path: ${req.protocol}://${req.get('host')}${req.originalUrl}
    Headers: ${JSON.stringify(req.headers)}
  `);
  res.status(404).json({ 
    error: 'Route not found', 
    requestedUrl: req.url,
    availableRoutes: [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/branches',
      '/visitors/'
    ]
  });
});

// Enhanced error handler
app.use((err, req, res, next) => {
  console.error(`
    ===== SERVER ERROR =====
    Timestamp: ${new Date().toISOString()}
    Error: ${err.message}
    Stack Trace: ${err.stack}
    Request Details:
    Method: ${req.method}
    URL: ${req.url}
    Headers: ${JSON.stringify(req.headers)}
    Body: ${JSON.stringify(req.body)}
  `);
  
  res.status(500).json({
    error: 'Server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`
    ===== SERVER STARTUP =====
    Server is running on port ${PORT}
    
    Available Endpoints:
    - Health Check: http://localhost:${PORT}/health
    - Auth Base: http://localhost:${PORT}/auth
    - Visitors Base: http://localhost:${PORT}/visitors
  `);
});
// auth rout

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

// Branch validation route
router.post('/validate-branch', authMiddleware, async (req, res) => {
  const { email, branch } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT branches FROM admin_users WHERE email = $1', 
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userBranches = userResult.rows[0].branches;

    if (!userBranches || !userBranches.includes(branch)) {
      return res.status(403).json({ error: 'Branch access denied' });
    }

    res.json({ message: 'Branch access validated' });
  } catch (err) {
    console.error('Branch validation error:', err);
    res.status(500).json({ error: 'Server error during branch validation' });
  }
});

module.exports = router;
 
// route validate-branch

router.post('/validate-branch', authMiddleware, async (req, res) => {
  const { email, branch } = req.body;

  try {
    
    const userResult = await pool.query(
      'SELECT branches FROM admin_users WHERE email = $1', 
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userBranches = userResult.rows[0].branches;

    if (!userBranches || !userBranches.includes(branch)) {
      return res.status(403).json({ error: 'Branch access denied' });
    }

    res.json({ message: 'Branch access validated' });
  } catch (err) {
    console.error('Branch validation error:', err);
    res.status(500).json({ error: 'Server error during branch validation' });
  }
});

const express = require('express');
const visitorsController = require('../controllers/visitorsLogsController');
const authMiddleware = require('../middleware/auth')
const router = express.Router();


router.get('/index', authMiddleware, async (req, res) => {
    const { branch } = req.query;
  
    if (!branch) {
      return res.status(400).json({ error: 'Branch parameter is required' });
    }
  
    try {
      const result = await pool.query(
        'SELECT * FROM visitor_log WHERE branch = $1 OR branchName = $1', 
        [branch]
      );
  
      console.log(`Fetched ${result.rows.length} visitor logs for branch: ${branch}`);
  
      res.json(result.rows);
    } catch (err) {
      console.error(`Error fetching visitor logs for branch ${branch}:`, err);
      res.status(500).json({ error: 'Failed to fetch visitor logs' });
    }
  });

  
router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);
router.get('/', authMiddleware, visitorsController.getAllVisitorLogs);
router.get('/by-phone', authMiddleware, visitorsController.getVisitorLogsByPhoneNumber);
router.get('/:id', authMiddleware, visitorsController.getVisitorLogById);
router.post('/', authMiddleware, visitorsController.createVisitorLog);
router.put('/:id', authMiddleware, visitorsController.updateVisitorLog);
router.delete('/:id', authMiddleware, visitorsController.deleteVisitorLog);

module.exports = router;

// middleware auth

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

//auth controller
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
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

    // Check if user has any branches
    if (!user.branches || user.branches.length === 0) {
      console.log(`User ${email} has no branch access`);
      return res.status(403).json({ 
        error: 'No branch access',
        message: 'This account does not have access to any branches.'
      });
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If no specific branch provided, use the first available branch
    const selectedBranch = branch || user.branches[0];

    // Verify branch access
    if (!user.branches.includes(selectedBranch)) {
      console.log(`Branch access denied: User ${email} does not have access to ${selectedBranch}`);
      return res.status(403).json({ 
        error: 'Branch access denied',
        message: 'You do not have access to this branch.',
        availableBranches: user.branches
      });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
      branch: selectedBranch,
      role: user.role || 'user'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: selectedBranch,
        role: user.role || 'user',
        availableBranches: user.branches
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
// visitor controller


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
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName 
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
  checkTelephoneExists, 
};