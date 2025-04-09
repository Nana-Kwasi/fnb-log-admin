//new endpoints
/adproxyservice/prod/ldap/search-and-authenticate

/adproxyservice/prod/ldap/verify2fa


//auth controller

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

    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    let user = adminResult.rows[0];
    let userTable = 'admin_users';

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

    const branchesKey = userTable === 'admin_users' ? 'branches' : 'branch';
    const userBranches = userTable === 'admin_users' ? user[branchesKey] : [user[branchesKey]];

    if (!userBranches.includes(branch)) {
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
      role: user.role || 'user',
      user_table: userTable
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
  verifyToken,
  
};

// auth route

//route for auth
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registerUser);
router.post('/verify', authController.verifyToken);

module.exports = router

//server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); 
const usersRouter = require('./route/users')
// const cron = require('node-cron');

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
app.use('/users', usersRouter)

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

// cron.schedule('0 0 * * *', async() => {
//   console.log('running schedule job to update admin branches');
//   await updateAdminBranches();
// });


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
});

// group to serach users from
APPSTEAM_DEV_IT_Works



// below is the new endpoints request body and how the controller should be like

 // request body for the search and authenticate
 {
    "fnumber": "string",
    "password": "string"
  }
// search and authenticate controlls accept
Controls Accept header.
Example Value
Schema
{
  "statusCode": 0,
  "statusMessage": "string",
  "serverTimestamp": "2025-04-09T12:42:05.319Z",
  "data": {
    "status_code": "string",
    "status_message": "string",
    "server_timestamp": "2025-04-09T12:42:05.319Z",
    "token": "string"
  }
}

// verify controlls accept
Controls Accept header.
Example Value
Schema
{
  "status_code": "string",
  "status_message": "string",
  "server_timestamp": "2025-04-09T12:44:36.681Z",
  "data": {
    "authId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "clientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "Pending",
    "statusMessage": "string",
    "payload": "string",
    "dateCreated": "2025-04-09T12:44:36.684Z",
    "lastUpdated": "2025-04-09T12:44:36.684Z",
    "fnumber": "string"
  }
}

//users controller
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

const createUser = async (req, res) => {
  const { email, password, branch, role = 'user' } = req.body;

  try {
    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// search api
/adproxyservice/prod/ldap/search

//request body
{
  "fnumber": "string"
}

// response
{
  "statusCode": 0,
  "statusMessage": "string",
  "serverTimestamp": "2025-04-09T16:02:49.354Z",
  "data": {
    "userId": "string",
    "mobile": "string",
    "email": "string",
    "userPrincipalName": "string",
    "title": "string",
    "name": "string",
    "manager": "string",
    "memberOf": [
      "string"
    ]
  }
}

// auth api
/adproxyservice/prod/Idap/authenticate

//Request body
{
  "fnumber": "string",
  "password": "string"
}

// response
{
    "status_code": "string",
    "status_message": "string",
    "server_timestamp": "2025-04-09T16:05:25.874Z",
    "token": "string"
  }




  //new users controller
  const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // You'll need to install axios

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// New function to verify if F-number exists in the APPSTEAM_DEV_IT_Works group
const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    // Make request to search API
    const searchApiUrl = '/adproxyservice/prod/ldap/search';
    const response = await axios.post(searchApiUrl, {
      fnumber: fnumber
    });

    // Check if the response indicates a successful search
    if (response.data.statusCode !== 0) {
      return res.status(400).json({ 
        isValid: false, 
        error: `Search API error: ${response.data.statusMessage}` 
      });
    }

    // Check if user belongs to APPSTEAM_DEV_IT_Works group
    const userGroups = response.data.data.memberOf || [];
    const isInRequiredGroup = userGroups.some(group => 
      group.includes('APPSTEAM_DEV_IT_Works')
    );

    if (!isInRequiredGroup) {
      return res.status(403).json({ 
        isValid: false, 
        error: 'User not a member of the required group' 
      });
    }

    // Return user information if valid
    return res.status(200).json({
      isValid: true,
      userData: {
        name: response.data.data.name,
        email: response.data.data.email,
        title: response.data.data.title
      }
    });
  } catch (err) {
    console.error('F-number verification error:', err);
    return res.status(500).json({ 
      isValid: false, 
      error: 'Server error during F-number verification' 
    });
  }
};

// Modified to use F-number instead of email/password
const createUser = async (req, res) => {
  const { email, branch, branchCode, role = 'user' } = req.body;

  try {
    if (!email || !branch) {
      return res.status(400).json({ error: 'F-number and branch are required' });
    }

    const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Note: No password hashing since we're no longer storing passwords

    const result = await pool.query(
      'INSERT INTO users_table (email, branch, branch_code, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
      [email, branch, branchCode, role]
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
  const { email, branch, branchCode, role, is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users_table SET email = $1, branch = $2, branch_code = $3, role = $4, is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *',
      [email, branch, branchCode, role, is_active, id]
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
  deleteUser,
  verifyFnumber  // Export the new function
};

//add it to the route
router.post('/verify-fnumber', auth, userController.verifyFnumber);
