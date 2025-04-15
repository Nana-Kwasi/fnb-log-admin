// //new endpoints
// /adproxyservice/prod/ldap/search-and-authenticate

// /adproxyservice/prod/ldap/verify2fa


// //auth controller

// const pool = require('../db');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// const JWT_SECRET = 'your-secret-key-should-be-in-env-file';


// const login = async (req, res) => {
//   const { email, password, branch } = req.body;

//   try {
//     console.log(`Login attempt: ${email} for branch ${branch}`);

//     if (!email || !password || !branch) {
//       return res.status(400).json({ error: 'Email, password, and branch are required' });
//     }

//     const adminResult = await pool.query(
//       'SELECT * FROM admin_users WHERE email = $1',
//       [email]
//     );

//     let user = adminResult.rows[0];
//     let userTable = 'admin_users';

//     if (!user) {
//       const userResult = await pool.query(
//         'SELECT * FROM users_table WHERE email = $1',
//         [email]
//       );
//       user = userResult.rows[0];
//       userTable = 'users_table';
//     }

//     if (!user) {
//       console.log(`User not found: ${email}`);
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const branchesKey = userTable === 'admin_users' ? 'branches' : 'branch';
//     const userBranches = userTable === 'admin_users' ? user[branchesKey] : [user[branchesKey]];

//     if (!userBranches.includes(branch)) {
//       console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
//       return res.status(403).json({ error: 'You do not have access to this branch' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       console.log(`Invalid password for user: ${email}`);
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const payload = {
//       user_id: user.id,
//       email: user.email,
//       branch: branch,
//       role: user.role || 'user',
//       user_table: userTable
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         branch: branch,
//         role: user.role || 'user',
//       }
//     });

//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ error: 'Server error during login' });
//   }
// };


// const registerUser = async (req, res) => {
//   const { email, password, branches, role } = req.body;

//   try {
   
    
    
//     if (!email || !password || !branches || !Array.isArray(branches)) {
//       return res.status(400).json({ error: 'Email, password, and branches array are required' });
//     }

   
//     const checkUser = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
//     if (checkUser.rows.length > 0) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

    
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

    
//     const result = await pool.query(
//       'INSERT INTO admin_users (email, password, branches, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role, created_at',
//       [email, hashedPassword, branches, role || 'user']
//     );

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: result.rows[0].id,
//         email: result.rows[0].email,
//         role: result.rows[0].role,
//         created_at: result.rows[0].created_at
//       }
//     });

//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ error: 'Server error during registration' });
//   }
// };


// const verifyToken = (req, res) => {
//   const token = req.header('x-auth-token');

//   if (!token) {
//     return res.status(401).json({ error: 'No token, authorization denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ valid: true, user: decoded });
//   } catch (err) {
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// };

// module.exports = {
//   login,
//   registerUser,
//   verifyToken,
  
// };

// // auth route

// //route for auth
// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.post('/login', authController.login);
// router.post('/register', authController.registerUser);
// router.post('/verify', authController.verifyToken);

// module.exports = router

// //server
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const visitorsRouter = require('./route/visitors');
// const authRouter = require('./route/auth'); 
// const usersRouter = require('./route/users')
// // const cron = require('node-cron');

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
// app.use('/users', usersRouter)

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

// // cron.schedule('0 0 * * *', async() => {
// //   console.log('running schedule job to update admin branches');
// //   await updateAdminBranches();
// // });


// const PORT = 5001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Health check available at: http://localhost:${PORT}/health`);
//   console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
// });

// // group to serach users from
// APPSTEAM_DEV_IT_Works



// // below is the new endpoints request body and how the controller should be like

//  // request body for the search and authenticate
//  {
//     "fnumber": "string",
//     "password": "string"
//   }
// // search and authenticate controlls accept
// Controls Accept header.
// Example Value
// Schema
// {
//   "statusCode": 0,
//   "statusMessage": "string",
//   "serverTimestamp": "2025-04-09T12:42:05.319Z",
//   "data": {
//     "status_code": "string",
//     "status_message": "string",
//     "server_timestamp": "2025-04-09T12:42:05.319Z",
//     "token": "string"
//   }
// }

// // verify controlls accept
// Controls Accept header.
// Example Value
// Schema
// {
//   "status_code": "string",
//   "status_message": "string",
//   "server_timestamp": "2025-04-09T12:44:36.681Z",
//   "data": {
//     "authId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "clientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "status": "Pending",
//     "statusMessage": "string",
//     "payload": "string",
//     "dateCreated": "2025-04-09T12:44:36.684Z",
//     "lastUpdated": "2025-04-09T12:44:36.684Z",
//     "fnumber": "string"
//   }
// }

// //users controller
// const pool = require('../db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// const createUser = async (req, res) => {
//   const { email, password, branch, role = 'user' } = req.body;

//   try {
//     if (!email || !password || !branch) {
//       return res.status(400).json({ error: 'Email, password, and branch are required' });
//     }

//     const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    
//     if (checkUser.rows.length > 0) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const result = await pool.query(
//       'INSERT INTO users_table (email, password, branch, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
//       [email, hashedPassword, branch, role]
//     );

//     res.status(201).json({
//       message: 'User created successfully',
//       user: {
//         id: result.rows[0].id,
//         email: result.rows[0].email,
//         branch: result.rows[0].branch,
//         role: result.rows[0].role,
//         created_at: result.rows[0].created_at
//       }
//     });

//   } catch (err) {
//     console.error('User creation error:', err);
//     res.status(500).json({ error: 'Server error during user creation' });
//   }
// };



// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { email, branch, role, is_active } = req.body;
  
//     try {
//       const result = await pool.query(
//         'UPDATE users_table SET email = $1, branch = $2, role = $3, is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *',
//         [email, branch, role, is_active, id]
//       );
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       res.json({
//         message: 'User updated successfully',
//         user: {
//           id: result.rows[0].id,
//           email: result.rows[0].email,
//           branch: result.rows[0].branch,
//           role: result.rows[0].role,
//           is_active: result.rows[0].is_active
//         }
//       });
//     } catch (err) {
//       console.error('User update error:', err);
//       res.status(500).json({ error: 'Server error during user update' });
//     }
//   };
  
//   // Update getAllUsers to include is_active
//   const getAllUsers = async (req, res) => {
//     try {
//       const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
//       res.json(result.rows);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       res.status(500).json({ error: 'Server error while fetching users' });
//     }
//   };
  
// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query('DELETE FROM users_table WHERE id = $1', [id]);
    
//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (err) {
//     console.error('User deletion error:', err);
//     res.status(500).json({ error: 'Server error during user deletion' });
//   }
// };

// module.exports = {
//   createUser,
//   getAllUsers,
//   updateUser,
//   deleteUser
// };

// // search api
// /adproxyservice/prod/ldap/search

// //request body
// {
//   "fnumber": "string"
// }

// // response
// {
//   "statusCode": 0,
//   "statusMessage": "string",
//   "serverTimestamp": "2025-04-09T16:02:49.354Z",
//   "data": {
//     "userId": "string",
//     "mobile": "string",
//     "email": "string",
//     "userPrincipalName": "string",
//     "title": "string",
//     "name": "string",
//     "manager": "string",
//     "memberOf": [
//       "string"
//     ]
//   }
// }

// // auth api
// /adproxyservice/prod/Idap/authenticate

// //Request body
// {
//   "fnumber": "string",
//   "password": "string"
// }

// // response
// {
//     "status_code": "string",
//     "status_message": "string",
//     "server_timestamp": "2025-04-09T16:05:25.874Z",
//     "token": "string"
//   }




//   //new users controller
  
//   const pool = require('../db');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const axios = require('axios'); // You'll need to install axios

// const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// // New function to verify if F-number exists in the APPSTEAM_DEV_IT_Works group
// const verifyFnumber = async (req, res) => {
//   const { fnumber } = req.body;

//   if (!fnumber) {
//     return res.status(400).json({ error: 'F-number is required' });
//   }

//   try {
//     // Make request to search API
//     const searchApiUrl = '/adproxyservice/prod/ldap/search';
//     const response = await axios.post(searchApiUrl, {
//       fnumber: fnumber
//     });

//     // Check if the response indicates a successful search
//     if (response.data.statusCode !== 0) {
//       return res.status(400).json({ 
//         isValid: false, 
//         error: `Search API error: ${response.data.statusMessage}` 
//       });
//     }

//     // Check if user belongs to APPSTEAM_DEV_IT_Works group
//     const userGroups = response.data.data.memberOf || [];
//     const isInRequiredGroup = userGroups.some(group => 
//       group.includes('APPSTEAM_DEV_IT_Works')
//     );

//     if (!isInRequiredGroup) {
//       return res.status(403).json({ 
//         isValid: false, 
//         error: 'User not a member of the required group' 
//       });
//     }

//     // Return user information if valid
//     return res.status(200).json({
//       isValid: true,
//       userData: {
//         name: response.data.data.name,
//         email: response.data.data.email,
//         title: response.data.data.title
//       }
//     });
//   } catch (err) {
//     console.error('F-number verification error:', err);
//     return res.status(500).json({ 
//       isValid: false, 
//       error: 'Server error during F-number verification' 
//     });
//   }
// };

// // Modified to use F-number instead of email/password
// const createUser = async (req, res) => {
//   const { email, branch, branchCode, role = 'user' } = req.body;

//   try {
//     if (!email || !branch) {
//       return res.status(400).json({ error: 'F-number and branch are required' });
//     }

//     const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
//     if (checkUser.rows.length > 0) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Note: No password hashing since we're no longer storing passwords

//     const result = await pool.query(
//       'INSERT INTO users_table (email, branch, branch_code, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
//       [email, branch, branchCode, role]
//     );

//     res.status(201).json({
//       message: 'User created successfully',
//       user: {
//         id: result.rows[0].id,
//         email: result.rows[0].email,
//         branch: result.rows[0].branch,
//         role: result.rows[0].role,
//         created_at: result.rows[0].created_at
//       }
//     });
//   } catch (err) {
//     console.error('User creation error:', err);
//     res.status(500).json({ error: 'Server error during user creation' });
//   }
// };

// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { email, branch, branchCode, role, is_active } = req.body;

//   try {
//     const result = await pool.query(
//       'UPDATE users_table SET email = $1, branch = $2, branch_code = $3, role = $4, is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *',
//       [email, branch, branchCode, role, is_active, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       message: 'User updated successfully',
//       user: {
//         id: result.rows[0].id,
//         email: result.rows[0].email,
//         branch: result.rows[0].branch,
//         role: result.rows[0].role,
//         is_active: result.rows[0].is_active
//       }
//     });
//   } catch (err) {
//     console.error('User update error:', err);
//     res.status(500).json({ error: 'Server error during user update' });
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ error: 'Server error while fetching users' });
//   }
// };

// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query('DELETE FROM users_table WHERE id = $1', [id]);

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (err) {
//     console.error('User deletion error:', err);
//     res.status(500).json({ error: 'Server error during user deletion' });
//   }
// };

// module.exports = {
//   createUser,
//   getAllUsers,
//   updateUser,
//   deleteUser,
//   verifyFnumber  // Export the new function
// };

// //add it to the route
// router.post('/verify-fnumber', auth, userController.verifyFnumber);



// error
PS C:\Users\f8877557\file-backend> cd new-backend
PS C:\Users\f8877557\file-backend\new-backend> node server.js
Server is running on port 5001
Health check available at: http://localhost:5001/health
Auth endpoints available at: http://localhost:5001/auth/login
Connected to the database
2025-04-10T10:06:50.410Z - GET /visitors/index
Fetching all unique branches
2025-04-10T10:06:50.415Z - GET /auth/verify
Route not found: GET /auth/verify
2025-04-10T10:06:50.420Z - GET /auth/verify
Route not found: GET /auth/verify
Found 6 unique branches
2025-04-10T10:06:50.528Z - GET /visitors/index
Fetching all unique branches
Found 6 unique branches
2025-04-10T10:06:53.822Z - POST /auth/login
Login attempt: admin@fnb.com for branch ACCRA BRANCH
2025-04-10T10:06:53.894Z - GET /visitors/index/branch?branchCode=330102
Fetching visitor logs for branch code: 330102
2025-04-10T10:06:53.896Z - GET /visitors/index
Fetching all unique branches
Found 2 visitor logs for branch code 330102
Found 6 unique branches
2025-04-10T10:06:53.987Z - GET /visitors/index
Fetching all unique branches
Found 6 unique branches
2025-04-10T10:06:53.991Z - GET /users
2025-04-10T10:06:53.998Z - GET /users
2025-04-10T10:07:10.359Z - POST /users/verify-fnumber
F-number verification error: AxiosError: unable to verify the first certificate
    at AxiosError.from (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:857:14)
    at RedirectableRequest.handleRequestError (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:3169:25)   
    at RedirectableRequest.emit (node:events:524:28)
    at eventHandlers.<computed> (C:\Users\f8877557\file-backend\new-backend\node_modules\follow-redirects\index.js:49:24)
    at ClientRequest.emit (node:events:524:28)
    at emitErrorEvent (node:_http_client:104:11)
    at TLSSocket.socketErrorListener (node:_http_client:518:5)
    at TLSSocket.emit (node:events:524:28)
    at emitErrorNT (node:internal/streams/destroy:170:8)
    at emitErrorCloseNT (node:internal/streams/destroy:129:3)
    at Axios.request (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:4258:41)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async verifyFnumber (C:\Users\f8877557\file-backend\new-backend\controllers\Users Controller.js:135:22) {
  code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    },
    adapter: [ 'xhr', 'http', 'fetch' ],
    transformRequest: [ [Function: transformRequest] ],
    transformResponse: [ [Function: transformResponse] ],
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: [Function [FormData]], Blob: [class Blob] },
    validateStatus: [Function: validateStatus],
    headers: Object [AxiosHeaders] {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'User-Agent': 'axios/1.8.4',
      'Content-Length': '22',
      'Accept-Encoding': 'gzip, compress, deflate, br'
    },
    method: 'post',
    url: 'http://172.29.18.126/adproxyservice/prod/ldap/search',
    data: '{"fnumber":"F8877557"}',
    allowAbsoluteUrls: true
  },
  request: <ref *1> Writable {
    _events: {
      close: undefined,
      error: [Function: handleRequestError],
      prefinish: undefined,
      finish: undefined,
      drain: undefined,
      response: [Function: handleResponse],
      socket: [Function: handleRequestSocket]
    },
    _writableState: WritableState {
      highWaterMark: 16384,
      length: 0,
      corked: 0,
      onwrite: [Function: bound onwrite],
      writelen: 0,
      bufferedIndex: 0,
      pendingcb: 0,
      [Symbol(kState)]: 17580812,
      [Symbol(kBufferedValue)]: null
    },
    _maxListeners: undefined,
    _options: {
      maxRedirects: 21,
      maxBodyLength: Infinity,
      protocol: 'https:',
      path: '/adproxyservice/prod/ldap/search',
      method: 'GET',
      headers: [Object: null prototype],
      agents: [Object],
      auth: undefined,
      family: undefined,
      beforeRedirect: [Function: dispatchBeforeRedirect],
      beforeRedirects: [Object],
      hostname: '172.29.18.126',
      port: '',
      agent: undefined,
      nativeProtocols: [Object],
      pathname: '/adproxyservice/prod/ldap/search',
      href: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
      query: undefined,
      search: '',
      hash: ''
    },
    _ended: true,
    _ending: true,
    _redirectCount: 1,
    _redirects: [],
    _requestBodyLength: 22,
    _requestBodyBuffers: [],
    _eventsCount: 3,
    _onNativeResponse: [Function (anonymous)],
    _currentRequest: ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: false,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: false,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: 0,
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: false,
      _header: 'GET /adproxyservice/prod/ldap/search HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'User-Agent: axios/1.8.4\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Host: 172.29.18.126\r\n' +
        'Connection: keep-alive\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'GET',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: '/adproxyservice/prod/ldap/search',
      _ended: false,
      res: null,
      aborted: false,
      timeoutCb: [Function: emitRequestTimeout],
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: '172.29.18.126',
      protocol: 'https:',
      _redirectable: [Circular *1],
      [Symbol(shapeMode)]: false,
      [Symbol(kCapture)]: false,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kChunkedBuffer)]: [],
      [Symbol(kChunkedLength)]: 0,
      [Symbol(kSocket)]: [TLSSocket],
      [Symbol(kOutHeaders)]: [Object: null prototype],
      [Symbol(errored)]: null,
      [Symbol(kHighWaterMark)]: 16384,
      [Symbol(kRejectNonStandardBodyWrites)]: false,
      [Symbol(kUniqueHeaders)]: null
    },
    _currentUrl: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
    _isRedirect: true,
    [Symbol(shapeMode)]: true,
    [Symbol(kCapture)]: false
  },
  cause: Error: unable to verify the first certificate
      at TLSSocket.onConnectSecure (node:_tls_wrap:1679:34)
      at TLSSocket.emit (node:events:524:28)
      at TLSSocket._finishInit (node:_tls_wrap:1078:8)
      at ssl.onhandshakedone (node:_tls_wrap:864:12) {
    code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
  }
}


// usercontrol


const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // You'll need to install axios

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';



const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    const searchApiUrl = 'http://172.29.18.126/adproxyservice/prod/ldap/search';
    const response = await axios.post(searchApiUrl, {
      fnumber: fnumber
    });

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
  verifyFnumber  
};



// controller for f number
const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    // Step 1: Create token using client ID
    const createTokenUrl = 'https://172.29.18.126/adproxyservice/prod/client/create-token';
    console.log('Requesting token from:', createTokenUrl);
    
    const tokenResponse = await axios.post(createTokenUrl, {
      clientId: "8CA09F75-720F-4641-9B70-5344850DF34E",
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', JSON.stringify(tokenResponse.data, null, 2));

    // Check if token exists in the response
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      return res.status(400).json({ 
        isValid: false, 
        error: `Failed to obtain authorization token: ${
          tokenResponse.data && tokenResponse.data.statusMessage 
            ? tokenResponse.data.statusMessage 
            : 'Unknown error'
        }` 
      });
    }

    const authToken = tokenResponse.data.data.token;
    console.log('Successfully obtained token');

    // Step 2: Use the token to search for the user
    const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
    console.log('Searching for user at:', searchApiUrl);
    
    const response = await axios.post(searchApiUrl, {
      fnumber: fnumber
    }, { 
      headers: {
        'Authorization': authToken
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Search response status:', response.status);
    console.log('Search response data:', JSON.stringify(response.data, null, 2));

    if (response.data.statusCode !== 0) {
      return res.status(400).json({ 
        isValid: false, 
        error: `Search API error: ${response.data.statusMessage}` 
      });
    }

    // Return the user data if found
    return res.status(200).json({
      isValid: true,
      userData: {
        name: response.data.data.name,
        email: response.data.data.email,
        title: response.data.data.title
      }
    });
  } catch (err) {
    console.error('F-number verification error details:', err.message);
    
    // If there's a response in the error, log it
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      isValid: false, 
      error: `Server error during F-number verification: ${err.message}` 
    });
  }
};

// error 
PS C:\Users\f8877557\file-backend> cd new-backend
PS C:\Users\f8877557\file-backend\new-backend> node server.js
Server is running on port 5001
Health check available at: http://localhost:5001/health
Auth endpoints available at: http://localhost:5001/auth/login
Connected to the database
2025-04-15T08:34:08.475Z - GET /visitors/index
Fetching all unique branches
2025-04-15T08:34:08.478Z - GET /auth/verify
Route not found: GET /auth/verify
2025-04-15T08:34:08.483Z - GET /auth/verify
Route not found: GET /auth/verify
2025-04-15T08:34:08.490Z - GET /visitors/index
Fetching all unique branches
Found 6 unique branches
Found 6 unique branches
2025-04-15T08:34:12.491Z - POST /auth/login
Login attempt: admin@fnb.com for branch ADUM BRANCH KUMASI
2025-04-15T08:34:12.628Z - GET /visitors/index/branch?branchCode=330601
Fetching visitor logs for branch code: 330601
Found 1 visitor logs for branch code 330601
2025-04-15T08:34:12.640Z - GET /visitors/index
Fetching all unique branches
Found 6 unique branches
2025-04-15T08:34:12.649Z - GET /visitors/index
Fetching all unique branches
Found 6 unique branches
2025-04-15T08:34:12.662Z - GET /users
2025-04-15T08:34:12.671Z - GET /users
2025-04-15T08:34:24.074Z - POST /users/verify-fnumber
Requesting token from: https://172.29.18.126/adproxyservice/prod/client/create-token
Token response status: 200
Token response data: {
  "statusCode": 0,
  "statusMessage": "Success",
  "serverTimestamp": "2025-04-15T08:33:45.195547243",
  "data": {
    "clientId": "8ca09f75-720f-4641-9b70-5344850df34e",
    "code": "vl_123",
    "email": "visitors@gmail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4Y2EwOWY3NS03MjBmLTQ2NDEtOWI3MC01MzQ0ODUwZGYzNGUiLCJpYXQiOjE3NDQ3MDYwMjUsImV4cCI6MTc0NDcwNjMyNX0.jMxnB-5FCxecc4suVHGXf75b3h-4m_QjfmvIryzhTeY",
    "tokenExpiryDate": "2025-04-14T17:07:35.929133"
  }
}
Successfully obtained token
Searching for user at: https://172.29.18.126/adproxyservice/prod/ldap/search
F-number verification error details: Request failed with status code 401
F-number verification error details: Request failed with status code 401
F-number verification error details: Request failed with status code 401
F-number verification error details: Request failed with status code 401
Error response status: 401
Error response data: {
  "statusCode": 1,
  "statusMessage": "Unauthorized. Invalidtoken",
  "serverTimestamp": null,
  "data": null
}


// adding users controller
const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    // Step 1: Create token using client ID
    const createTokenUrl = 'https://172.29.18.126/adproxyservice/prod/client/create-token';
    console.log('Requesting token from:', createTokenUrl);
    
    const tokenResponse = await axios.post(createTokenUrl, {
      clientId: "8CA09F75-720F-4641-9B70-5344850DF34E",
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', JSON.stringify(tokenResponse.data, null, 2));

    // Check if token exists in the response
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      return res.status(400).json({ 
        isValid: false, 
        error: `Failed to obtain authorization token: ${
          tokenResponse.data && tokenResponse.data.statusMessage 
            ? tokenResponse.data.statusMessage 
            : 'Unknown error'
        }` 
      });
    }

    const authToken = tokenResponse.data.data.token;
    console.log('Successfully obtained token');

    // Step 2: Use the token to search for the user
    const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
    console.log('Searching for user at:', searchApiUrl);
    
    // FIXED: Added 'Bearer ' prefix to the Authorization header
    const response = await axios.post(searchApiUrl, {
      fnumber: fnumber
    }, { 
      headers: {
        'Authorization': `Bearer ${authToken}`  // Added "Bearer" prefix
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Search response status:', response.status);
    console.log('Search response data:', JSON.stringify(response.data, null, 2));

    if (response.data.statusCode !== 0) {
      return res.status(400).json({ 
        isValid: false, 
        error: `Search API error: ${response.data.statusMessage}` 
      });
    }

    // Return the user data if found
    return res.status(200).json({
      isValid: true,
      userData: {
        name: response.data.data.name,
        email: response.data.data.email,
        title: response.data.data.title
      }
    });
  } catch (err) {
    console.error('F-number verification error details:', err.message);
    
    // If there's a response in the error, log it
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      isValid: false, 
      error: `Server error during F-number verification: ${err.message}` 
    });
  }
};

// response

{"statusCode":0,"statusMessage":"Success","serverTimestamp":"2025-04-14T16:38:04.213137362","data":{"userId":"F5353203","mobile":"+233208600342","email":"wise.ofori@firstnationalbank.com.gh","userPrincipalName":"F5353203@FNB.CO.ZA","title":"National Service Personnel E","name":"Ofori, Wise","manager":"CN=Quartey\\, Andrews,OU=DomainUsers,DC=fnb,DC=co,DC=za","memberOf":["CN=APPSTEAM_DEV_IT_Works,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=AWS_INT_FNBGhana_EC2,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=AWS_QA_FNBGhana_EC2,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=AWS_DEV_FNBGhana_EC2,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=W365_VDI_2vCPU8GB256GB_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=ELevyPS_PROD_IT_FNBG Application Access,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=AWS_DEV_UNIFIED_FNBGhanaIT,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=GlobalWorkDay_CloudApps_Ghana_Users,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=CLOUD_VDI_LIMITEDACCESS_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=GlobalERP_CloudApps_All_Employees,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=Myappstore_Prod_AllUsers_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=FRGOracleSaaSUsers_Non-PRD_ERP_FRG,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=t24dev_aws_nonprod_corelite,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=GlobalERP_CloudApps_All_Users,OU=Office365,OU=DomainUsers,DC=fnb,DC=co,DC=za","CN=FRGOracleSaaSTech_Non-PRD_ERP_FRG,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=DATAACCESS_PROD_GHANA_ANALYST,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=Udemy_Learning_FNB_Access,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=FILESHARE_DIGITAL_ITFIREANDBRIMSON_RW,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=2V_production_FNB_Staff,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=DLP_Level-1-FullLockdown_prod_FNB,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=Online-dev-web-dev_prod_digital_fol,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=Online-wtl_uat_digital_fol,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za","CN=Venafi_Prod_FNB_GhanaRequester,OU=Admin Groups,OU=ADCCreated,DC=fnb,DC=co,DC=za","CN=Server_AD_GHA_Admins,OU=Admin Groups,OU=ADCCreated,DC=fnb,DC=co,DC=za","CN=Sccm_Sql_LocalGroup,OU=GlobalSecurityGroups,OU=DomainGroups,DC=fnb,DC=co,DC=za"]}}