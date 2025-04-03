//usercontroller
   const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

const createUser = async (req, res) => {
  const { email, password, branch, role = 'user' } = req.body;

  try {
    // Validate input
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
      'INSERT INTO users_table (email, password, branch, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
      [email, hashedPassword, branch, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });

  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Server error during user creation' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, branch, role, created_at FROM users_table');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, branch, role } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users_table SET email = $1, branch = $2, role = $3 WHERE id = $4 RETURNING *',
      [email, branch, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role
      }
    });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users_table WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User deletion error:', err);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser
};

//users route

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth'); // Reuse existing auth middleware

// Create a new user (admin-only route)
router.post('/', authMiddleware, usersController.createUser);

// Get all users (admin-only route)
router.get('/', authMiddleware, usersController.getAllUsers);

// Update a user (admin-only route)
router.put('/:id', authMiddleware, usersController.updateUser);

// Delete a user (admin-only route)
router.delete('/:id', authMiddleware, usersController.deleteUser);

module.exports = router;

//script to create the table

require('dotenv').config();
const pool = require('../db');

async function createUsersTable() {
  try {
    // Check if users_table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users_table'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating users_table...');
      
      await pool.query(`
        CREATE TABLE users_table (
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
    } else {
      console.log('users_table already exists');
    }
  } catch (err) {
    console.error('Error creating users_table:', err);
  } finally {
    pool.end();
  }
}

createUsersTable();

//update login function on authcontroller

const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    // First, check admin_users
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    let user = adminResult.rows[0];
    let userTable = 'admin_users';

    // If not found in admin_users, check users_table
    if (!user) {
      const userResult = await pool.query(
        'SELECT * FROM users_table WHERE email = $1',
        [email]
      );
      user = userResult.rows[0];
      userTable = 'users_table';
    }

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check branch access
    const branchesKey = userTable === 'admin_users' ? 'branches' : 'branch';
    const userBranches = userTable === 'admin_users' ? user[branchesKey] : [user[branchesKey]];

    if (!userBranches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Prepare payload
    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user',
      user_table: userTable
    };

    // Generate token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Respond with token and user info
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

,{"id":55,"date":"2025-04-01T23:00:00.000Z","timein":"12:41:00","timeout":null,"department":"Customer Service","company":"BOG", "telephone":"0247231486","reason":"hello","purpose":"Personal","name":"Yaw Kumi","branch":"330401","branchname":"MARKET CIRCLE BRANCH TAKORADI"}



// update all vsitors api


const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    const result = await pool.query('SELECT * FROM visitor_log');
    
    // Process dates to maintain the original database date
    const formattedResults = result.rows.map(row => {
      if (row.date) {
        // Convert the UTC date from API back to YYYY-MM-DD format
        const date = new Date(row.date);
        row.date = date.toISOString().split('T')[0];
      }
      return row;
    });
    
    console.log(`Found ${formattedResults.length} visitor logs`);
    res.json(formattedResults);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send('Server error');
  }
};


// new

const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    // Format the date directly in the SQL query to avoid timezone issues
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log
    `);
    
    console.log(`Found ${result.rows.length} visitor logs`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE id = $1
    `, [id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

//right api
const getVisitorLogsByBranchCode = async (req, res) => {
  const { branchCode } = req.query;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitor logs for branch code: ${branchCode}`);
    const result = await pool.query(
      `SELECT 
        id,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        timeIn,
        timeOut,
        department,
        company,
        picture,
        telephone,
        reason,
        purpose,
        name,
        branch,
        branchName
      FROM visitor_log 
      WHERE branch = $1`,
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitor logs for branch code ${branchCode}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error fetching branch logs:", err);
    res.status(500).send('Server error');
  }
};

// visitor api
const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log
    `);
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
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE telephone = $1
    `, [telephone]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE id = $1
    `, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// beenherebefore
const handleLogin = async () => {
  if (!phoneNumber.match(/^\d+$/)) {
    setError('Please enter a valid phone number.');
    return;
  }

  setError('');
  setLoading(true);

  try {
    const response = await fetch(`http://localhost:5001/visitors/by-phone?telephone=${phoneNumber}`);
    const data = await response.json();

    if (data.length > 0) {
      const sortedVisits = data.sort((a, b) => {
        // Updated sorting logic to handle YYYY-MM-DD formatted dates
        const dateA = new Date(`${a.date}T${a.timein || a.timeIn}`);
        const dateB = new Date(`${b.date}T${b.timein || b.timeIn}`);
        return dateB - dateA;
      });

      const userDoc = sortedVisits[0]; 
      
      setUserInfo(userDoc);
      setVisitData({
        telephone: userDoc.telephone || '',
        company: userDoc.company || '',
        department: userDoc.department || '',
        purpose: userDoc.purpose || '',
        reason: userDoc.reason || '',
        name: userDoc.name || '',
        branchName: userDoc.branchname || '',
        branch: userDoc.branch || '',
      });
      setVisitHistory(sortedVisits);
    } else {
      setError('No records found for this phone number.');
    }
  } catch (err) {
    console.error('Error fetching user information:', err);
    setError('Error fetching user information. Please try again.');
  }
  setLoading(false);
};