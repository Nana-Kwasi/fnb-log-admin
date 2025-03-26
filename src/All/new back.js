// const pool = require('../db');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// const JWT_SECRET = 'your-secret-key-should-be-in-env-file';

// const login = async (req, res) => {
//   const { email, password, branch } = req.body;

//   try {
//     console.log(`Login attempt: ${email}`);

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     const result = await pool.query(
//       'SELECT * FROM admin_users WHERE email = $1',
//       [email]
//     );

//     const user = result.rows[0];

//     if (!user) {
//       console.log(`User not found: ${email}`);
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Check if user has any branches
//     if (!user.branches || user.branches.length === 0) {
//       console.log(`User ${email} has no branch access`);
//       return res.status(403).json({ 
//         error: 'No branch access',
//         message: 'This account does not have access to any branches.'
//       });
//     }

//     // Password verification
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       console.log(`Invalid password for user: ${email}`);
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // If no specific branch provided, use the first available branch
//     const selectedBranch = branch || user.branches[0];

//     // Verify branch access
//     if (!user.branches.includes(selectedBranch)) {
//       console.log(`Branch access denied: User ${email} does not have access to ${selectedBranch}`);
//       return res.status(403).json({ 
//         error: 'Branch access denied',
//         message: 'You do not have access to this branch.',
//         availableBranches: user.branches
//       });
//     }

//     const payload = {
//       user_id: user.id,
//       email: user.email,
//       branch: selectedBranch,
//       role: user.role || 'user'
//     };

//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         branch: selectedBranch,
//         role: user.role || 'user',
//         availableBranches: user.branches
//       }
//     });

//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ error: 'Server error during login' });
//   }
// };

// module.exports = {
//   login,
//   registerUser,
//   verifyToken
// };


// //new branch endpoint
//  router.get('/index', authMiddleware, async (req, res) => {
//     const { branch } = req.query;
  
//     if (!branch) {
//       return res.status(400).json({ error: 'Branch parameter is required' });
//     }
  
//     try {
//       const result = await pool.query(
//         'SELECT * FROM visitor_log WHERE branch = $1 OR branchName = $1', 
//         [branch]
//       );
  
//       console.log(`Fetched ${result.rows.length} visitor logs for branch: ${branch}`);
  
//       res.json(result.rows);
//     } catch (err) {
//       console.error(`Error fetching visitor logs for branch ${branch}:`, err);
//       res.status(500).json({ error: 'Failed to fetch visitor logs' });
//     }
//   });

  
// router.get('/check-telephone/:telephone', visitorsController.checkTelephoneExists);
// router.get('/', authMiddleware, visitorsController.getAllVisitorLogs);
// router.get('/by-phone', authMiddleware, visitorsController.getVisitorLogsByPhoneNumber);
// router.get('/:id', authMiddleware, visitorsController.getVisitorLogById);
// router.post('/', authMiddleware, visitorsController.createVisitorLog);
// router.put('/:id', authMiddleware, visitorsController.updateVisitorLog);
// router.delete('/:id', authMiddleware, visitorsController.deleteVisitorLog);

// module.exports = router;