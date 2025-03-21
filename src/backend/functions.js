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


  //jwt updated
  // Updated middleware for auth

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

module.exports = function (req, res, next) {
  console.log('Auth middleware executing...');
  const token = req.header('x-auth-token');

  if (!token) {
    console.log('No token provided in request headers');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', {
      user_id: decoded.user_id,
      email: decoded.email,
      branch: decoded.branch,
      role: decoded.role
    });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

//updated authcontroller for login
// Updated login function in authController

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

    // Verify branch access
    console.log(`Checking if user ${email} has access to branch: ${branch}`);
    console.log(`User's authorized branches:`, user.branches);
    
    if (!user.branches || !user.branches.includes(branch)) {
      console.log(`Branch access denied: User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ 
        error: 'Branch access denied',
        message: 'You do not have access to this branch. Please select a branch you are authorized to access.'
      });
    }
    console.log(`Branch access granted for user ${email} to branch ${branch}`);

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

    console.log(`Creating JWT token with payload:`, payload);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    console.log(`JWT token created successfully`);

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

//endpoint to get branchcode
// Add to visitorsLogsController.js

const getVisitorsByBranchCode = async (req, res) => {
  const { branchCode } = req.params;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitors for branch code: ${branchCode}`);
    
    const result = await pool.query(
      'SELECT * FROM visitor_log WHERE branch = $1',
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitors for branch code ${branchCode}`);
    
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching visitors for branch code ${branchCode}:`, err);
    res.status(500).json({ error: 'Server error' });
  }
};

//update visitor route
// Updated visitors route

const express = require('express');
const router = express.Router();
const visitorsController = require('../controllers/visitorsLogsController');
const authMiddleware = require('../middleware/auth'); // Import auth middleware

// Public routes (no authentication required)
router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);
router.get('/branches', visitorsController.getAllBranches); // New endpoint for fetching branches

// Protected routes (authentication required)
router.get('/', authMiddleware, visitorsController.getAllVisitorLogs);
router.get('/branch/:branchCode', authMiddleware, visitorsController.getVisitorsByBranchCode); // New branch-specific endpoint
router.get('/by-phone', authMiddleware, visitorsController.getVisitorLogsByPhoneNumber);
router.get('/:id', authMiddleware, visitorsController.getVisitorLogById);
router.post('/', authMiddleware, visitorsController.createVisitorLog);
router.put('/:id', authMiddleware, visitorsController.updateVisitorLog);
router.delete('/:id', authMiddleware, visitorsController.deleteVisitorLog);

module.exports = router;

//update context screen
// Update in VisitorContext.jsx

const fetchBranchData = async (branchName, branchCode) => {
  setLoading(true);
  setError("");
  
  try {
    console.log(`Fetching data for branch: ${branchName} (code: ${branchCode})`);
    
    // Use authentication token if available
    const headers = {};
    if (token) {
      headers['x-auth-token'] = token;
      console.log('Using auth token for request');
    }
    
    // Use branch-specific endpoint if branch code is available
    const url = branchCode 
      ? `${API_URL}/branch/${branchCode}`
      : API_URL;
    
    console.log(`Requesting data from: ${url}`);
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API response received with entries:", data.length);
    
    // The rest of your existing processing code...
    // No need to filter by branch anymore since the API returns 
    // branch-specific data
  }
  // ... rest of the function remains the same
};

// Update in Login.jsx

useEffect(() => {
  const fetchBranches = async () => {
    try {
      setFetchingBranches(true);
      console.log("Fetching branches from:", `${API_URL}/branches`);
      const response = await fetch(`${API_URL}/branches`);
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} branches from API`);
      
      // Format branches for dropdown
      const formattedBranches = data.map(item => ({
        code: item.branch,
        name: item.branchname
      }));
      
      setBranches(formattedBranches);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setLocalError("Failed to load branches. Please try again later.");
    } finally {
      setFetchingBranches(false);
    }
  };

  fetchBranches();
}, [API_URL, setError]);

//update login screen dropdown

<div className="select-container">
  <select
    value={selectedBranch}
    onChange={(e) => setSelectedBranch(e.target.value)}
    required
    disabled={fetchingBranches}
    className="branch-select"
  >
    <option value="">Select Branch</option>
    {branches.map((branch) => (
      <option key={branch.code} value={branch.code}>
        {branch.name}
      </option>
    ))}
  </select>
  {fetchingBranches && (
    <span className="select-spinner"></span>
  )}
</div>



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


const getVisitorsByBranchCode = async (req, res) => {
  const { branchCode } = req.params;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitors for branch code: ${branchCode}`);
    
    const result = await pool.query(
      'SELECT * FROM visitor_log WHERE branch = $1',
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitors for branch code ${branchCode}`);
    
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching visitors for branch code ${branchCode}:`, err);
    res.status(500).json({ error: 'Server error' });
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

    // Verify branch access
    console.log(`Checking if user ${email} has access to branch: ${branch}`);
    console.log(`User's authorized branches:`, user.branches);
    
    if (!user.branches || !user.branches.includes(branch)) {
      console.log(`Branch access denied: User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ 
        error: 'Branch access denied',
        message: 'You do not have access to this branch. Please select a branch you are authorized to access.'
      });
    }
    console.log(`Branch access granted for user ${email} to branch ${branch}`);

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

    console.log(`Creating JWT token with payload:`, payload);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    console.log(`JWT token created successfully`);

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


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); // Add the auth router

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



const express = require('express');
const router = express.Router();
const visitorsController = require('../controllers/visitorsLogsController');
const authMiddleware = require('../middleware/auth'); // Import auth middleware

// Public routes (no authentication required)
router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);
router.get('/branches', visitorsController.getAllBranches); // New endpoint for fetching branches

// Protected routes (authentication required)
router.get('/', authMiddleware, visitorsController.getAllVisitorLogs);
router.get('/branch/:branchCode', authMiddleware, visitorsController.getVisitorsByBranchCode); // New branch-specific endpoint
router.get('/by-phone', authMiddleware, visitorsController.getVisitorLogsByPhoneNumber);
router.get('/:id', authMiddleware, visitorsController.getVisitorLogById);
router.post('/', authMiddleware, visitorsController.createVisitorLog);
router.put('/:id', authMiddleware, visitorsController.updateVisitorLog);
router.delete('/:id', authMiddleware, visitorsController.deleteVisitorLog);

module.exports = router;