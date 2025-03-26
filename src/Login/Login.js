import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [localError, setLocalError] = useState("");
  const [loginStage, setLoginStage] = useState("credentials");

  const { login, loading, error, setError, authenticated, token } = useVisitor();

  const AUTH_URL = "http://localhost:5001/auth";

  // Fetch branches after successful authentication
  const fetchBranches = async () => {
    try {
      setFetchingBranches(true);
      const response = await fetch(`${AUTH_URL}/branches`, {
        method: 'GET',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.status}`);
      }

      const data = await response.json();
      const uniqueBranches = [...new Set(data.branches)].filter(branch => branch).sort();
      
      if (uniqueBranches.length === 0) {
        throw new Error("No branches available");
      }
      
      setBranches(uniqueBranches);
      setSelectedBranch(uniqueBranches[0]); 
      setLoginStage("branch-selection");
    } catch (err) {
      console.error("Error fetching branches:", err);
      setLocalError(err.message || "Failed to load branches. Please try again.");
    } finally {
      setFetchingBranches(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    try {
      const success = await login(email, password);
      
      if (success) {
        // If login is successful, proceed to fetch branches
        fetchBranches();
      } else {
        setLocalError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setLocalError(err.message || "An unexpected error occurred");
    }
  };

  const handleBranchSelection = async (e) => {
    e.preventDefault();

    try {
      // Update user's branch context
      const branchSuccess = await login(email, selectedBranch, token);
      
      if (branchSuccess) {
        onLogin(email, selectedBranch);
      } else {
        setLocalError("Failed to set branch. Please try again.");
      }
    } catch (err) {
      setLocalError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB Admin</h2>

        {loginStage === "credentials" && (
          <form onSubmit={handleCredentialsSubmit}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {localError && <p className="error-message">{localError}</p>}
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {loginStage === "branch-selection" && (
          <form onSubmit={handleBranchSelection}>
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

            {localError && <p className="error-message">{localError}</p>}
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading || fetchingBranches}
            >
              {loading ? "Processing..." : "Select Branch"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;