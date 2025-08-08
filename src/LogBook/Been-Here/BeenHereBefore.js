import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BeenHereBefore = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [visitData, setVisitData] = useState({});
  const [visitHistory, setVisitHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentVisitId, setCurrentVisitId] = useState(null);
  const [branchList, setBranchList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('http://localhost:5001/visitorslog/fnb_branches');
        const data = await res.json();
  
        // Normalize the field names to match what your frontend expects
        const normalized = data.map(b => ({
          branchName: b.branch_name,
          branchCode: b.branch_code
        }));
  
        setBranchList(normalized);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
  
    fetchBranches();
  }, []);
  
  const handleLogin = async () => {
    if (!phoneNumber.match(/^\d+$/)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/visitorslog/visitors/by-phone?telephone=${phoneNumber}`);
      const data = await response.json();

      if (data.length > 0) {
        const sortedVisits = data.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.timein || a.timeIn}`);
          const dateB = new Date(`${b.date}T${b.timein || b.timeIn}`);
          return dateB - dateA;
        });

        const userDoc = sortedVisits[0];

        setUserInfo(userDoc);
        setVisitData({
          telephone: userDoc.telephone || '',
          company: userDoc.company || '',
          department: userDoc.department || '',
          purpose: userDoc.purpose || '',
          reason: userDoc.reason || '',
          name: userDoc.name || '',
          branchName: userDoc.branchname || '',
          branch: userDoc.branch || '',
        });
        setVisitHistory(sortedVisits);
      } else {
        setError('No records found for this phone number.');
      }
    } catch (err) {
      console.error('Error fetching user information:', err);
      setError('Error fetching user information. Please try again.');
    }

    setLoading(false);
  };

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const newVisit = {
        name: visitData.name || userInfo.name || '',
        telephone: visitData.telephone || userInfo.telephone || '',
        company: visitData.company || '',
        department: visitData.department || '',
        purpose: visitData.purpose || '',
        reason: visitData.reason || '',
        branchName: visitData.branchName || userInfo.branchName || '',
        branch: visitData.branch || '',
        date: new Date().toISOString().split('T')[0],
        timeIn: new Date().toLocaleTimeString(),
      };

      const response = await fetch('http://localhost:5001/visitorslog/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVisit),
      });

      if (!response.ok) {
        throw new Error('Failed to create new visit entry');
      }

      const result = await response.json();
      setVisitHistory([{ ...newVisit, id: result.id }, ...visitHistory]);
      setCurrentVisitId(result.id);
      setSuccess('Check-in successful!');
    } catch (err) {
      console.error('Error saving the new visit entry:', err);
      setError('Error saving the new visit entry. Please try again.');
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'branchName') {
      const selectedBranch = branchList.find(branch => branch.branchName === value);
      setVisitData(prev => ({
        ...prev,
        branchName: value,
        branch: selectedBranch ? selectedBranch.branchCode : '',
      }));
    } else if (name === 'branch') {
      const selectedBranch = branchList.find(branch => branch.branchCode === value);
      setVisitData(prev => ({
        ...prev,
        branch: value,
        branchName: selectedBranch ? selectedBranch.branchName : '',
      }));
    } else {
      setVisitData(prev => ({ ...prev, [name]: value }));
    }
  };
  

  return (
    <div className="been-here-container">
      <div className="logo-container">
        <img src={process.env.PUBLIC_URL + "/fnb back.png"} alt="FNB Logo" className="logo" />
        <h2 className="logo-text">FNB (First National Bank)</h2>
      </div>

      <div className="form-container">
        <h1 className="form-title">Returning Visitor</h1>
        <p className="form-description">
          Please enter your phone number to verify your identity.
        </p>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="phone-input"
        />
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        {success && <p className="success-message" style={{ color: 'green' }}>{success}</p>}
        <button
          onClick={handleLogin}
          className="login-button"
          disabled={loading}
        >
          {loading ? <div className="spinner"></div> : 'Verify'}
        </button>
      </div>

      {userInfo && currentVisitId === null && (
        <div className="card form-card">
          <h2>Welcome back, {userInfo.name}!</h2>
          <div className="form-container">
            {['telephone', 'company', 'department', 'purpose', 'reason'].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type="text"
                  name={field}
                  value={visitData[field] || ''}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field}`}
                  className="form-input"
                />
              </div>
            ))}

  {/* Branch Name Dropdown */}
<div className="form-group">
  <label>Branch Name</label>
  <select
    name="branchName"
    value={visitData.branchName || ''}
    onChange={handleInputChange}
    className="form-input"
  >
    <option value="">-- Select Branch Name --</option>
    {branchList.map((branch, idx) => (
      <option key={idx} value={branch.branchName}>
        {branch.branchName}
      </option>
    ))}
  </select>
</div>

{/* Branch Code Dropdown */}
<div className="form-group">
  <label>Branch Code</label>
  <select
    name="branch"
    value={visitData.branch || ''}
    onChange={handleInputChange}
    className="form-input"
  >
    <option value="">-- Select Branch Code --</option>
    {branchList.map((branch, idx) => (
      <option key={idx} value={branch.branchCode}>
        {branch.branchCode}
      </option>
    ))}
  </select>
</div>

            <button
              onClick={handleCheckIn}
              className="checkin-button"
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : 'Check In'}
            </button>
          </div>
        </div>
      )}

      {visitHistory.length > 0 && (
        <div className="card history-card">
          <h2>Visit History</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Company</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Reason</th>
                <th>Branch Name</th>
              </tr>
            </thead>
            <tbody>
              {visitHistory.map((visit, index) => (
                <tr key={index}>
                  <td>{visit.date}</td>
                  <td>{visit.timein || visit.timeIn}</td>
                  <td>{visit.timeout || visit.timeOut || '---'}</td>
                  <td>{visit.company}</td>
                  <td>{visit.department}</td>
                  <td>{visit.purpose}</td>
                  <td>{visit.reason}</td>
                  <td>{visit.branchname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    
  <style>
  {`
    .been-here-container {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #e8f0fe, #d9eaf7, #f2f6fa);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-radius: 16px;
    max-width: 950px;
    margin: 50px auto;
    overflow: hidden;
    border: 1px solid #e3e9ef;
}

    .logo-container {
      margin-bottom: 30px;
    }
       .form descrip {
      font-size: 28px;
    }

    .logo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
      margin-bottom: 15px;
    }

    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: linear-gradient(to right, #3498db, #2ecc71);
      -webkit-background-clip: text;
      color: transparent;
    }

    .form-container {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 30px;
    }

    .form-title {
      font-size: 28px;
      color: #34495e;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .form-description {
      font-size: 22px;
      color:rgb(15, 105, 111);
      margin-bottom: 20px;
    }

    .phone-input, .form-input {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin-bottom: 15px;
      transition: box-shadow 0.3s ease;
    }

    .phone-input:focus, .form-input:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 8px rgba(52, 152, 219, 0.4);
    }

    .form-group {
      margin-bottom: 15px;
      text-align: left;
    }

    label {
      font-size: 14px;
      color: #34495e;
      font-weight: bold;
      margin-bottom: 5px;
      display: block;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .login-button, .checkin-button {
      padding: 14px 40px;
      font-size: 16px;
      font-weight: bold;
      color: white;
      background: linear-gradient(to right, #3498db, #2ecc71);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.3s ease, background 0.3s ease;
    }

    .login-button:hover, .checkin-button:hover {
      background: linear-gradient(to right, #2ecc71, #3498db);
      transform: translateY(-3px);
    }

    .login-button:disabled, .checkin-button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
      transform: none;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
      text-align: left;
    }

    .card h2 {
      color: #2c3e50;
      font-size: 20px;
      margin-bottom: 15px;
    }

    .history-card {
      overflow-x: auto;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      text-align: left;
    }

    .history-table th, .history-table td {
      border: 1px solid #ddd;
      padding: 10px;
      font-size: 14px;
    }

    .history-table th {
      background: #3498db;
      color: white;
      text-transform: uppercase;
    }

    .warning {
      color: #e74c3c;
      font-weight: bold;
      font-size: 13px;
    }

    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `}
</style>

    </div>
  );
};

export default BeenHereBefore;