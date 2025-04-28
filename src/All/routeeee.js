//visitor controller


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
  checkTelephoneExists, 
  getAllBranches,              
  getVisitorLogsByBranchCode 
};


// newwwwww

const checkUserBranches = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ 
      success: false, 
      error: 'F-number is required' 
    });
  }

  try {
    console.log(`[BRANCH] Checking branches for user: ${fnumber}`);
    
    // Query database for branches this user has access to
    const result = await pool.query(
      'SELECT id, email, branch, branch_code FROM users_table WHERE email = $1', 
      [fnumber]
    );
    
    if (result.rows.length === 0) {
      console.log(`[BRANCH] User ${fnumber} not found in system`);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found in system. Please contact administrator.',
        userExists: false,
        fnumber
      });
    }
    
    // Format the branches for the response
    const branches = result.rows.map(row => ({
      branchName: row.branch,
      branchCode: row.branch_code
    }));
    
    console.log(`[BRANCH] User ${fnumber} has access to ${branches.length} branches:`, 
      JSON.stringify(branches, null, 2));
    
    return res.status(200).json({
      success: true,
      userExists: true,
      fnumber,
      branches
    });
    
  } catch (err) {
    console.error('[BRANCH] Error checking user branches:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: `Server error during branch checking: ${err.message}` 
    });
  }
};

// New function to track 2FA verification status
const track2FAStatus = async (req, res) => {
  const { token, fnumber } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log("[TRACK] Checking 2FA verification status for token:", 
      token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[TRACK] Successfully obtained token for status tracking');
    
    console.log('[TRACK] Sending status check to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: "" // Empty code to just check status
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[TRACK] Status response code:', verifyResponse.status);
    
    // Return just the status information, no database checks
    const statusCode = verifyResponse.data.status_code;
    const statusMessage = verifyResponse.data.status_message;
    const dataStatus = verifyResponse.data.data?.status;
    
    // Log the specific status information
    console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);
    
    // Determine verification status
    let verificationStatus = "pending";
    
    // Check if verification is successful
    if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
      verificationStatus = "success";
    } 
    // Check if verification failed
    else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
      verificationStatus = "failed";
    }
    
    // Get the fnumber from the response if available
    const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;
    
    return res.status(200).json({
      success: true,
      statusCode,
      statusMessage,
      dataStatus,
      verificationStatus,
      fnumber: responseFnumber
    });
    
  } catch (err) {
    console.error('[TRACK] Status tracking error:', err.message);
    
    if (err.response) {
      console.error('[TRACK] Error response status:', err.response.status);
      console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during status tracking: ${err.message}` 
    });
  }
};


// routeeeee
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Users Controller')
const authMiddleware = require('../middleware/auth'); 


router.post('/verify-fnumber', authMiddleware, usersController.verifyFnumber);

router.post('/', authMiddleware, usersController.createUser);
router.post('/authenticate', usersController.authenticateUser);
router.post('/verify2fa', usersController.verify2FA);
router.post('/finalize-login', usersController.finalizeLogin);
router.post('/checkUserBranches', usersController.checkUserBranches);
router.post('/track2FAStatus', usersController.track2FAStatus);




router.get('/', authMiddleware, usersController.getAllUsers);


router.put('/:id', authMiddleware, usersController.updateUser);


router.delete('/:id', authMiddleware, usersController.deleteUser);

module.exports = router;