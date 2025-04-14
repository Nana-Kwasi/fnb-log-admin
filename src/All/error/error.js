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



// ssl error
  const verifyFnumber = async (req, res) => {
    const { fnumber } = req.body;
  
    if (!fnumber) {
      return res.status(400).json({ error: 'F-number is required' });
    }
  
    try {
      const searchApiUrl = 'http://172.29.18.126/adproxyservice/prod/ldap/search';
      const response = await axios.post(searchApiUrl, {
        fnumber: fnumber
      }, { 
        httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
      });



//new error
F-number verification error: AxiosError: Request failed with status code 403
    at settle (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:2031:12)
    at IncomingMessage.handleStreamEnd (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:3148:11)
    at IncomingMessage.emit (node:events:536:35)
    at endReadableNT (node:internal/streams/readable:1698:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)
    at Axios.request (C:\Users\f8877557\file-backend\new-backend\node_modules\axios\dist\node\axios.cjs:4258:41)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async verifyFnumber (C:\Users\f8877557\file-backend\new-backend\controllers\Users Controller.js:135:22) {
  code: 'ERR_BAD_REQUEST',
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
    httpsAgent: Agent {
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      defaultPort: 443,
      protocol: 'https:',
      options: [Object: null prototype],
      requests: [Object: null prototype] {},
      sockets: [Object: null prototype],
      freeSockets: [Object: null prototype] {},
      keepAliveMsecs: 1000,
      keepAlive: false,
      maxSockets: Infinity,
      maxFreeSockets: 256,
      scheduling: 'lifo',
      maxTotalSockets: Infinity,
      totalSocketCount: 1,
      maxCachedSessions: 100,
      _sessionCache: [Object],
      [Symbol(shapeMode)]: false,
      [Symbol(kCapture)]: false
    },
    method: 'post',
    url: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
    data: '{"fnumber":"F8877557"}',
    allowAbsoluteUrls: true
  },
  request: <ref *1> ClientRequest {
    _events: [Object: null prototype] {
      abort: [Function (anonymous)],
      aborted: [Function (anonymous)],
      connect: [Function (anonymous)],
      error: [Function (anonymous)],
      socket: [Function (anonymous)],
      timeout: [Function (anonymous)],
      finish: [Function: requestOnFinish]
    },
    _eventsCount: 7,
    _maxListeners: undefined,
    outputData: [],
    outputSize: 0,
    writable: true,
    destroyed: false,
    _last: true,
    chunkedEncoding: false,
    shouldKeepAlive: false,
    maxRequestsOnConnectionReached: false,
    _defaultKeepAlive: true,
    useChunkedEncodingByDefault: true,
    sendDate: false,
    _removedConnection: false,
    _removedContLen: false,
    _removedTE: false,
    strictContentLength: false,
    _contentLength: '22',
    _hasBody: true,
    _trailer: '',
    finished: true,
    _headerSent: true,
    _closed: false,
    _header: 'POST /adproxyservice/prod/ldap/search HTTP/1.1\r\n' +
      'Accept: application/json, text/plain, */*\r\n' +
      'Content-Type: application/json\r\n' +
      'User-Agent: axios/1.8.4\r\n' +
      'Content-Length: 22\r\n' +
      'Accept-Encoding: gzip, compress, deflate, br\r\n' +
      'Host: 172.29.18.126\r\n' +
      'Connection: close\r\n' +
      '\r\n',
    _keepAliveTimeout: 0,
    _onPendingData: [Function: nop],
    agent: Agent {
      _events: [Object: null prototype],
      _eventsCount: 2,
      _maxListeners: undefined,
      defaultPort: 443,
      protocol: 'https:',
      options: [Object: null prototype],
      requests: [Object: null prototype] {},
      sockets: [Object: null prototype],
      freeSockets: [Object: null prototype] {},
      keepAliveMsecs: 1000,
      keepAlive: false,
      maxSockets: Infinity,
      maxFreeSockets: 256,
      scheduling: 'lifo',
      maxTotalSockets: Infinity,
      totalSocketCount: 1,
      maxCachedSessions: 100,
      _sessionCache: [Object],
      [Symbol(shapeMode)]: false,
      [Symbol(kCapture)]: false
    },
    socketPath: undefined,
    method: 'POST',
    maxHeaderSize: undefined,
    insecureHTTPParser: undefined,
    joinDuplicateHeaders: undefined,
    path: '/adproxyservice/prod/ldap/search',
    _ended: true,
    res: IncomingMessage {
      _events: [Object],
      _readableState: [ReadableState],
      _maxListeners: undefined,
      socket: [TLSSocket],
      httpVersionMajor: 1,
      httpVersionMinor: 1,
      httpVersion: '1.1',
      complete: true,
      rawHeaders: [Array],
      rawTrailers: [],
      joinDuplicateHeaders: undefined,
      aborted: false,
      upgrade: false,
      url: '',
      method: null,
      statusCode: 403,
      statusMessage: '',
      client: [TLSSocket],
      _consuming: false,
      _dumped: false,
      req: [Circular *1],
      _eventsCount: 4,
      responseUrl: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
      redirects: [],
      [Symbol(shapeMode)]: true,
      [Symbol(kCapture)]: false,
      [Symbol(kHeaders)]: [Object],
      [Symbol(kHeadersCount)]: 10,
      [Symbol(kTrailers)]: null,
      [Symbol(kTrailersCount)]: 0
    },
    aborted: false,
    timeoutCb: null,
    upgradeOrConnect: false,
    parser: null,
    maxHeadersCount: null,
    reusedSocket: false,
    host: '172.29.18.126',
    protocol: 'https:',
    _redirectable: Writable {
      _events: [Object],
      _writableState: [WritableState],
      _maxListeners: undefined,
      _options: [Object],
      _ended: true,
      _ending: true,
      _redirectCount: 0,
      _redirects: [],
      _requestBodyLength: 22,
      _requestBodyBuffers: [],
      _eventsCount: 3,
      _onNativeResponse: [Function (anonymous)],
      _currentRequest: [Circular *1],
      _currentUrl: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
      [Symbol(shapeMode)]: true,
      [Symbol(kCapture)]: false
    },
    [Symbol(shapeMode)]: false,
    [Symbol(kCapture)]: false,
    [Symbol(kBytesWritten)]: 0,
    [Symbol(kNeedDrain)]: false,
    [Symbol(corked)]: 0,
    [Symbol(kChunkedBuffer)]: [],
    [Symbol(kChunkedLength)]: 0,
    [Symbol(kSocket)]: TLSSocket {
      _tlsOptions: [Object],
      _secureEstablished: true,
      _securePending: false,
      _newSessionPending: false,
      _controlReleased: true,
      secureConnecting: false,
      _SNICallback: null,
      servername: false,
      alpnProtocol: false,
      authorized: false,
      authorizationError: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      encrypted: true,
      _events: [Object: null prototype],
      _eventsCount: 10,
      connecting: false,
      _hadError: false,
      _parent: null,
      _host: null,
      _closeAfterHandlingError: false,
      _readableState: [ReadableState],
      _writableState: [WritableState],
      allowHalfOpen: false,
      _maxListeners: undefined,
      _sockname: null,
      _pendingData: null,
      _pendingEncoding: '',
      server: undefined,
      _server: null,
      ssl: [TLSWrap],
      _requestCert: true,
      _rejectUnauthorized: false,
      parser: null,
      _httpMessage: [Circular *1],
      [Symbol(alpncallback)]: null,
      [Symbol(res)]: [TLSWrap],
      [Symbol(verified)]: true,
      [Symbol(pendingSession)]: null,
      [Symbol(async_id_symbol)]: 469,
      [Symbol(kHandle)]: [TLSWrap],
      [Symbol(lastWriteQueueSize)]: 0,
      [Symbol(timeout)]: null,
      [Symbol(kBuffer)]: null,
      [Symbol(kBufferCb)]: null,
      [Symbol(kBufferGen)]: null,
      [Symbol(shapeMode)]: true,
      [Symbol(kCapture)]: false,
      [Symbol(kSetNoDelay)]: false,
      [Symbol(kSetKeepAlive)]: true,
      [Symbol(kSetKeepAliveInitialDelay)]: 60,
      [Symbol(kBytesRead)]: 0,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(connect-options)]: [Object]
    },
    [Symbol(kOutHeaders)]: [Object: null prototype] {
      accept: [Array],
      'content-type': [Array],
      'user-agent': [Array],
      'content-length': [Array],
      'accept-encoding': [Array],
      host: [Array]
    },
    [Symbol(errored)]: null,
    [Symbol(kHighWaterMark)]: 16384,
    [Symbol(kRejectNonStandardBodyWrites)]: false,
    [Symbol(kUniqueHeaders)]: null
  },
  response: {
    status: 403,
    statusText: '',
    headers: Object [AxiosHeaders] {
      server: 'nginx/1.20.1',
      date: 'Mon, 14 Apr 2025 14:32:18 GMT',
      'content-type': 'application/json;charset=UTF-8',
      'content-length': '120',
      connection: 'close'
    },
    config: {
      transitional: [Object],
      adapter: [Array],
      transformRequest: [Array],
      transformResponse: [Array],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: [Object],
      validateStatus: [Function: validateStatus],
      headers: [Object [AxiosHeaders]],
      httpsAgent: [Agent],
      method: 'post',
      url: 'https://172.29.18.126/adproxyservice/prod/ldap/search',
      data: '{"fnumber":"F8877557"}',
      allowAbsoluteUrls: true
    },
    request: <ref *1> ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: false,
      _last: true,
      chunkedEncoding: false,
      shouldKeepAlive: false,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: true,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: '22',
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: false,
      _header: 'POST /adproxyservice/prod/ldap/search HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'Content-Type: application/json\r\n' +
        'User-Agent: axios/1.8.4\r\n' +
        'Content-Length: 22\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Host: 172.29.18.126\r\n' +
        'Connection: close\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'POST',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: '/adproxyservice/prod/ldap/search',
      _ended: true,
      res: [IncomingMessage],
      aborted: false,
      timeoutCb: null,
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: '172.29.18.126',
      protocol: 'https:',
      _redirectable: [Writable],
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
    data: {
      statusCode: 1,
      statusMessage: 'Required header param Authorization was not passed',
      serverTimestamp: null,
      data: null
    }
  },
  status: 403
}


// create token
//request body
{
  "clientId": "8CA09F75-720F-4641-9B70-5344850DF34E",
  "duration": 300
}
https://172.29.18.126/adproxyservice/prod/client/create-token

// serach for user
// request body
{
  "fnumber": "f8872780"
}

// api endpoint
https://172.29.18.126/adproxyservice/prod/ldap/search

// controller


const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios'); 

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';



const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
    const response = await axios.post(searchApiUrl, {
      fnumber: fnumber
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
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