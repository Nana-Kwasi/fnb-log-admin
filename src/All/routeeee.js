
//rout auth
const express = require('express');
const router = express.Router();
const { login, registerUser, verifyToken } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Register route
router.post('/register', registerUser);

// Token verification route
router.post('/verify', verifyToken);

// Branches route (as you already had)
router.get('/branches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT branchname FROM visitor_log');
    
    const branches = result.rows.map(row => row.branchname).filter(branch => branch);
    
    res.json({ branches });
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Branch validation route
router.post('/validate-branch', authMiddleware, async (req, res) => {
  const { email, branch } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT branches FROM admin_users WHERE email = $1', 
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const userBranches = userResult.rows[0].branches;

    if (!userBranches || !userBranches.includes(branch)) {
      return res.status(403).json({ error: 'Branch access denied' });
    }

    res.json({ message: 'Branch access validated' });
  } catch (err) {
    console.error('Branch validation error:', err);
    res.status(500).json({ error: 'Server error during branch validation' });
  }
});

module.exports = router;
