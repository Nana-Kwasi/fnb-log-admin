import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const navigate = useNavigate();
  
  // Use the visitor context
  const { login, loading, error, setError } = useVisitor();

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
  }, [API_URL, setError]);

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
  
    // Call the login function from the context
    const success = await login(email, selectedBranch);
    
    if (success) {
      navigate("/"); // Navigate to Dashboard on successful login
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