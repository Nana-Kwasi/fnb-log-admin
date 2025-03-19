//visitor db


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



// controller
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



//server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');

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


//db
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Visitors Database',
  password: 'P@ssw0rd__!!',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to the database');
  }
});

module.exports = pool;


//api format
OAuth 2.0 Bearer Token Usage
OAuth 2.0 Bearer Token Usage
 
Standard API Format:
 
http://localhost:5001/controller/function
 
Example:
Login: POST -> http://localhost:5001/auth/login
 
Get all visitors -> http://localhost:5001/visitors/index
 
Get visitors from specific branch -> http://localhost:5001/visitors/index?branchCode=3001
 


// controllers/authController.js
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// JWT secret key (use an environment variable in production)
const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// Login user
const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    // Validate inputs
    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    // Query the database for the user
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has access to the requested branch
    if (user.branches && !user.branches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

    // Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token payload (don't include sensitive data)
    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user'
    };

    // Generate JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Send response with token and user info
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

// Register new user (admin only)
const registerUser = async (req, res) => {
  const { email, password, branches, role } = req.body;

  try {
    // Check if user making request is admin (implement middleware for this later)
    
    // Validate inputs
    if (!email || !password || !branches || !Array.isArray(branches)) {
      return res.status(400).json({ error: 'Email, password, and branches array are required' });
    }

    // Check if user already exists
    const checkUser = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
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

// Verify JWT token
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

// middleware/auth.js

const jwt = require('jsonwebtoken');

// JWT secret key (should match the one in the controller)
const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};


// updated server

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


// updated login

import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const [localError, setLocalError] = useState("");
  const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  
  // Use the visitor context
  const { login, loading, error, setError, authenticated } = useVisitor();

  const API_URL = "http://localhost:5001/visitors";
  const AUTH_URL = "http://localhost:5001/auth";

  // Modified useEffect to prevent automatic login
  useEffect(() => {
    // Only perform automatic login if it was triggered by a manual login attempt
    if (authenticated && email && manualLoginAttempt) {
      console.log("Authentication successful after manual login attempt, navigating to dashboard");
      onLogin(email);
      // Reset the flag after login
      setManualLoginAttempt(false);
    } else if (authenticated) {
      console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
    }
  }, [authenticated, email, onLogin, manualLoginAttempt]);

  // Fetch all branches from the API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        console.log("Fetching branches from:", API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} entries from API`);
        
        // Extract unique branch names (handle both branchname and branch)
        const uniqueBranches = [...new Set(data
          .map(entry => entry.branchname )
          .filter(branch => branch && branch.trim() !== "")
        )];
        
        console.log(`Found ${uniqueBranches.length} unique branches`);
        setBranches(uniqueBranches.sort());
      } catch (err) {
        console.error("Error fetching branches:", err);
        setLocalError("Failed to load branches. Please try again later.");
      } finally {
        setFetchingBranches(false);
      }
    };

    fetchBranches();
  }, [API_URL, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login form submitted");
    setLocalError("");
  
    if (email.length > 25) {
      setLocalError("F number is incorrect");
      return;
    }
  
    if (!selectedBranch) {
      setLocalError("Please select a branch");
      return;
    }
  
    try {
      console.log("Login validation passed, setting manual login attempt flag");
      // Set flag to indicate this is a manual login attempt
      setManualLoginAttempt(true);
      
      console.log("Attempting login with:", { email, branch: selectedBranch });
      
      // Use the JWT authentication API
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          branch: selectedBranch
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Call the login function from context (or update to use the JWT)
      const success = await login(email, selectedBranch, data.token);
      
      console.log("Login result:", success);
      
      if (!success) {
        console.log("Login failed, resetting manual login attempt flag");
        setManualLoginAttempt(false);
        setLocalError("Login failed. Please check your credentials and try again.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setManualLoginAttempt(false);
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Display the context error or local error
  const displayError = error || localError;

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={25}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
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
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {fetchingBranches && (
              <span className="select-spinner"></span>
            )}
          </div>
          
          {displayError && <p className="error-message">{displayError}</p>}
          <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;