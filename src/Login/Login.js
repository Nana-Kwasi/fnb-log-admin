import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5001/visitors";

  // Fetch all branches from the API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract unique branch names
        const uniqueBranches = [...new Set(data
          .map(entry => entry.branchname)
          .filter(branch => branch && branch.trim() !== "")
        )];
        
        setBranches(uniqueBranches.sort());
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to load branches. Please try again later.");
      } finally {
        setFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.length > 25) {
      setError("F number is incorrect");
      return;
    }

    if (!selectedBranch) {
      setError("Please select a branch");
      return;
    }

    setLoading(true);

    try {
      // Simple authentication - without API call
      // In a real app, you'd validate credentials against a backend
      
      // Store branch in localStorage for dashboard to access
      localStorage.setItem("selectedBranch", selectedBranch);
      
      setLoading(false);
      onLogin(email, selectedBranch); // Pass email and branch to the onLogin handler
      navigate("/"); // Navigate to Dashboard
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={25} // Limit input length
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="select-container">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              required
              disabled={fetchingBranches}
              className="branch-select"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {fetchingBranches && (
              <span className="select-spinner"></span>
            )}
          </div>
          
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;