// script to create admin users

require('dotenv').config(); 
const pool = require('../db');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    
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

// users controll
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



const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, branch, role, is_active } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE users_table SET email = $1, branch = $2, role = $3, is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *',
        [email, branch, role, is_active, id]
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
          role: result.rows[0].role,
          is_active: result.rows[0].is_active
        }
      });
    } catch (err) {
      console.error('User update error:', err);
      res.status(500).json({ error: 'Server error during user update' });
    }
  };
  
  // Update getAllUsers to include is_active
  const getAllUsers = async (req, res) => {
    try {
      const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Server error while fetching users' });
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


const getAllBranches = async (req, res) => {
  try {
    console.log("Fetching all unique branches");
    const result = await pool.query(
      'SELECT DISTINCT branchName, branch FROM visitor_log WHERE branchName IS NOT NULL AND branch IS NOT NULL'
    );
    
    // Map the results to get branch name and code pairs
    const branches = result.rows.map(row => ({
      branchName: row.branchname,
      branchCode: row.branch
    }));
    
    console.log(`Found ${branches.length} unique branches`);
    res.json(branches);
  } catch (err) {
    console.error("Database query error fetching branches:", err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogsByBranchCode = async (req, res) => {
  const { branchCode } = req.query;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitor logs for branch code: ${branchCode}`);
    const result = await pool.query(
      'SELECT * FROM visitor_log WHERE branch = $1',
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitor logs for branch code ${branchCode}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error fetching branch logs:", err);
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
  getAllBranches,              // Add this new function
  getVisitorLogsByBranchCode 
};
