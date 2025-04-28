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


// logss


[2FA] Verify response data: {
  "status_code": "000",
  "status_message": "Successful authentication",
  "server_timestamp": "2025-04-28T09:21:14.775414588",
  "data": {
    "authId": "12bd4050-46e1-4fea-b432-9ed348185725",
    "clientId": "8ca09f75-720f-4641-9b70-5344850df34e",
    "status": "Success",
    "statusMessage": null,
    "payload": "{\"userId\":\"F8877557\",\"mobile\":\"+233592486117\",\"email\":\"Francis.Kontoh@firstnationalbank.com.gh\",\"userPrincipalName\":\"F8877557@fnb.co.za\",\"title\":\"Internship\",\"name\":\"Kontoh, Francis\",\"manager\":\"CN=Eshun\\\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"memberOf\":[\"CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za\"]}",
    "dateCreated": "2025-04-28T09:20:55.088801",
    "lastUpdated": "2025-04-28T09:21:09.752403",
    "fnumber": "F8877557"
  }
}
[2FA] 2FA verification successful
[2FA] User identified as: F8877557
[2FA] Session token generated for user: F8877557
[2FA] 2FA verification process complete, returning success response
[2FA] Full verify response data: {
  "status_code": "000",
  "status_message": "Successful authentication",
  "server_timestamp": "2025-04-28T09:21:14.775414588",
  "data": {
    "authId": "12bd4050-46e1-4fea-b432-9ed348185725",
    "clientId": "8ca09f75-720f-4641-9b70-5344850df34e",
    "status": "Success",
    "statusMessage": null,
    "payload": "{\"userId\":\"F8877557\",\"mobile\":\"+233592486117\",\"email\":\"Francis.Kontoh@firstnationalbank.com.gh\",\"userPrincipalName\":\"F8877557@fnb.co.za\",\"title\":\"Internship\",\"name\":\"Kontoh, Francis\",\"manager\":\"CN=Eshun\\\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"memberOf\":[\"CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za\"]}",
    "dateCreated": "2025-04-28T09:20:55.088801",
    "lastUpdated": "2025-04-28T09:21:09.752403",
    "fnumber": "F8877557"
  }
}
2025-04-28T09:21:45.852Z - POST /users/checkUserBranches
[BRANCH] Checking branches for user: F8877557
[BRANCH] User F8877557 not found in system





// new getusersbranches
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
    
    // Convert to lowercase to match database format
    const lowerCaseFnumber = fnumber.toLowerCase();
    
    console.log(`[BRANCH] Querying database with value: ${lowerCaseFnumber}`);
    
    // Use the email column since that's where the F-number is stored
    const result = await pool.query(
      'SELECT id, email, branch, branch_code FROM users_table WHERE email = $1',
      [lowerCaseFnumber]
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
    
    // Generate a session token if needed
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    return res.status(200).json({
      success: true,
      userExists: true,
      fnumber,
      branches,
      sessionToken // Include session token in response
    });
    
  } catch (err) {
    console.error('[BRANCH] Error checking user branches:', err.message);
    return res.status(500).json({
      success: false,
      error: `Server error during branch checking: ${err.message}`
    });
  }
};




// new logs

[2FA] Verify response data: {
  "status_code": "000",
  "status_message": "Successful authentication",
  "server_timestamp": "2025-04-28T10:34:52.584277011",
  "data": {
    "authId": "1aa39c70-e784-4acc-aca1-0f485d0fc5ce",
    "clientId": "8ca09f75-720f-4641-9b70-5344850df34e",
    "status": "Success",
    "statusMessage": null,
    "payload": "{\"userId\":\"F8877557\",\"mobile\":\"+233592486117\",\"email\":\"Francis.Kontoh@firstnationalbank.com.gh\",\"userPrincipalName\":\"F8877557@fnb.co.za\",\"title\":\"Internship\",\"name\":\"Kontoh, Francis\",\"manager\":\"CN=Eshun\\\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"memberOf\":[\"CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za\"]}",
    "dateCreated": "2025-04-28T10:34:04.456075",
    "lastUpdated": "2025-04-28T10:34:49.242715",
    "fnumber": "F8877557"
  }
}
[2FA] 2FA verification successful
[2FA] User identified as: F8877557
[2FA] Session token generated for user: F8877557
[2FA] 2FA verification process complete, returning success response
[2FA] Full verify response data: {
  "status_code": "000",
  "status_message": "Successful authentication",
  "server_timestamp": "2025-04-28T10:34:52.584277011",
  "data": {
    "authId": "1aa39c70-e784-4acc-aca1-0f485d0fc5ce",
    "clientId": "8ca09f75-720f-4641-9b70-5344850df34e",
    "status": "Success",
    "statusMessage": null,
    "payload": "{\"userId\":\"F8877557\",\"mobile\":\"+233592486117\",\"email\":\"Francis.Kontoh@firstnationalbank.com.gh\",\"userPrincipalName\":\"F8877557@fnb.co.za\",\"title\":\"Internship\",\"name\":\"Kontoh, Francis\",\"manager\":\"CN=Eshun\\\\, Kwesi,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"memberOf\":[\"CN=AppsDevelopmentTeam_PROD_IT_FNBGhana,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=CLOUD_VDI_FULLACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalWorkDay_CloudApps_All_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za\",\"CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=Users for 2FA testing,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=One Drive Test,OU=DomainGroups,DC=fnb,DC=co,DC=za\",\"CN=InternetUsers - All,OU=InterNet Access,OU=Security,OU=Groups,OU=FNBUsers,DC=fnb,DC=co,DC=za\"]}",
    "dateCreated": "2025-04-28T10:34:04.456075",
    "lastUpdated": "2025-04-28T10:34:49.242715",
    "fnumber": "F8877557"
  }
}
2025-04-28T10:35:24.061Z - POST /users/checkUserBranches
[BRANCH] Checking branches for user: F8877557
[BRANCH] Querying database with value: f8877557
[BRANCH] User F8877557 has access to 1 branches: [
  {
    "branchName": "AIRPORT BRANCH",
    "branchCode": "330119"
  }
]


// hope

const checkUserBranches = async () => {
  setCheckingBranches(true);
  try {
    console.log("Checking user branches...");
    const response = await fetch(`${API_URL}/users/checkUserBranches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fnumber: savedIdentifier
      })
    });
    
    const data = await response.json();
    console.log("Check user branches response:", data);
    
    // Debug the response structure
    console.log("Response structure:", JSON.stringify(data));
    
    // Make sure we have branches before proceeding
    if (!response.ok) {
      setLocalError("Failed to retrieve branch access. Please contact support.");
      return;
    }
    
    // Check for branches in the response - handle different possible structures
    const branchesArray = data.branches || (Array.isArray(data) ? data : []);
    
    if (branchesArray && branchesArray.length > 0) {
      // Store session token if provided
      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
      }
      
      // Set branches from response
      setBranches(branchesArray);
      
      if (branchesArray.length === 1) {
        // If only one branch, auto-select it and proceed to final login
        setSelectedBranch(branchesArray[0].branchName);
        console.log("Auto-selecting single branch:", branchesArray[0].branchName);
        
        // Complete final login with the auto-selected branch
        await handleFinalLogin(savedIdentifier, branchesArray[0].branchName, sessionToken || data.sessionToken);
      } else {
        // If multiple branches, show branch selection screen
        setTimeout(() => {
          setShowVerification(false);
          setShowBranchSelection(true);
          setFetchingBranches(false);
        }, 1000);
      }
    } else {
      setLocalError('No branches available for this user');
    }
  } catch (err) {
    console.error("Error checking user branches:", err);
    setLocalError("Failed to check branch access. Please try again.");
  } finally {
    setCheckingBranches(false);
  }
};


// hope is in

const verify2FA = async (req, res) => {
  const { token, code, fnumber: requestFnumber } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    console.log("[2FA] Starting 2FA verification process");
    if (code) {
      console.log("[2FA] Verifying with code:", code);
    } else {
      console.log("[2FA] Checking 2FA status without code");
    }
    console.log("[2FA] Using token:", token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[2FA] Successfully obtained token for 2FA verification');
    
    console.log('[2FA] Sending verification request to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: code || "" // Send empty string if no code provided
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[2FA] Verify response status:', verifyResponse.status);
    console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    if (!verifyResponse.data || 
        (verifyResponse.data.status_code !== '000' && 
         verifyResponse.data.status_code !== '0' && 
         verifyResponse.data.status_code !== 0)) {
      console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      return res.status(401).json({ 
        success: false, 
        error: verifyResponse.data?.status_message || '2FA verification failed',
        data: verifyResponse.data 
      });
    }
    
    console.log('[2FA] 2FA verification successful');
    
    const fnumber = verifyResponse.data.fnumber || 
                   (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                   requestFnumber;
                   
    if (!fnumber) {
      console.error('[2FA] No fnumber found in response or request');
      return res.status(400).json({
        success: false,
        error: 'Unable to identify user. Missing F-number in response.',
      });
    }
    
    console.log(`[2FA] User identified as: ${fnumber}`);
    
    // Generate a session token
    const sessionToken = jwt.sign(
      { 
        fnumber: fnumber
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    console.log(`[2FA] Session token generated for user: ${fnumber}`);
    console.log('[2FA] 2FA verification process complete, returning success response');
    
    // Log all data when 2FA verification is successful
    console.log('[2FA] Full verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful',
      fnumber,
      sessionToken,
      verifyResponseData: verifyResponse.data 
    });
    
  } catch (err) {
    console.error('[2FA] 2FA verification error:', err.message);
    
    if (err.response) {
      console.error('[2FA] Error response status:', err.response.status);
      console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during 2FA verification: ${err.message}` 
    });
  }
};