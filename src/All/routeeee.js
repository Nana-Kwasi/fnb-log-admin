// update admin
// You can add this function to your auth controller or create a new utility file

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
    
    // Update all admin users with the latest branches
    const updateResult = await pool.query(
      'UPDATE admin_users SET branches = $1',
      [branches]
    );
    
    console.log(`Updated ${updateResult.rowCount} admin users with latest branches:`, branches);
    
  } catch (err) {
    console.error('Error updating admin branches:', err);
  }
}

//update create visitorlog
// Modify your createVisitorLog function in the visitor controller
const createVisitorLog = async (req, res) => {
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO visitor_log (date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch, branchName]
    );
    
    // If this is a new branch, update admin users
    if (branchName) {
      const checkBranch = await pool.query(
        'SELECT EXISTS(SELECT 1 FROM admin_users WHERE $1 = ANY(branches)) as "exists"', 
        [branchName]
      );
      
      if (!checkBranch.rows[0].exists) {
        // This is a new branch not in admin_users, update all admin users
        await updateAdminBranches();
      }
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

