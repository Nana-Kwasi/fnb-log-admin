//update the updatebranches for admin on auth controller
async function updateAdminBranches() {
  try {
    console.log('Updating admin users with latest branches...');
    
    // Get all distinct branches from visitor_log
    const branchesResult = await pool.query(`
      SELECT DISTINCT branchname FROM visitor_log WHERE branchname IS NOT NULL AND branchname != '';
    `);
    
    const branches = branchesResult.rows.map(row => row.branchname);
    
    if (branches.length === 0) {
      console.log('No branches found to update');
      return;
    }
    
    // Get all admin users
    const adminsResult = await pool.query('SELECT id, branches FROM admin_users');
    
    // For each admin, update their branches to include all current branches
    for (const admin of adminsResult.rows) {
      // Get current admin branches
      const currentBranches = admin.branches || [];
      
      // Add any new branches that don't exist in the admin's current branches
      const updatedBranches = [...new Set([...currentBranches, ...branches])];
      
      // Update this specific admin with the combined branches
      await pool.query(
        'UPDATE admin_users SET branches = $1 WHERE id = $2',
        [updatedBranches, admin.id]
      );
    }
    
    console.log(`Updated admin users with latest branches:`, branches);
    
  } catch (err) {
    console.error('Error updating admin branches:', err);
  }
}

// new file
// utils.js
const pool = require('../db');

async function updateAdminBranches() {
  try {
    console.log('Updating admin users with latest branches...');
    
    // Get all distinct branches from visitor_log
    const branchesResult = await pool.query(`
      SELECT DISTINCT branchname FROM visitor_log WHERE branchname IS NOT NULL AND branchname != '';
    `);
    
    const branches = branchesResult.rows.map(row => row.branchname);
    
    if (branches.length === 0) {
      console.log('No branches found to update');
      return;
    }
    
    // Get all admin users
    const adminsResult = await pool.query('SELECT id, branches FROM admin_users');
    
    // For each admin, update their branches to include all current branches
    for (const admin of adminsResult.rows) {
      // Get current admin branches
      const currentBranches = admin.branches || [];
      
      // Add any new branches that don't exist in the admin's current branches
      const updatedBranches = [...new Set([...currentBranches, ...branches])];
      
      // Update this specific admin with the combined branches
      await pool.query(
        'UPDATE admin_users SET branches = $1 WHERE id = $2',
        [updatedBranches, admin.id]
      );
    }
    
    console.log(`Updated admin users with latest branches:`, branches);
    
  } catch (err) {
    console.error('Error updating admin branches:', err);
  }
}

module.exports = {
  updateAdminBranches
};

// create visitor
// visitor controller
const pool = require('../db');
const { updateAdminBranches } = require('../utils'); // Import the function

// Rest of your controller code remains the same

const createVisitorLog = async (req, res) => {
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO visitor_log (date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName]
    );
    
    // If branchName is provided, update admin users branches
    if (branchName) {
      // Always call updateAdminBranches to ensure all admins have this branch
      await updateAdminBranches();
      console.log(`Updated admin branches after adding visitor log with branch: ${branchName}`);
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating visitor log:', err);
    res.status(500).send('Server error');
  }
};

// Rest of your code remains the same