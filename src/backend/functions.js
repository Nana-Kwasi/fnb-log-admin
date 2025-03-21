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