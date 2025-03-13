import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  
  // Use the visitor context
  const { login, loading, error, setError, authenticated } = useVisitor();

  const API_URL = "http://localhost:5001/visitors";

  // Check if authenticated and navigate - using useCallback to maintain reference
  const checkAndNavigate = useCallback(() => {
    if (authenticated) {
      console.log("User is authenticated, attempting to navigate");
      // Use a timeout to ensure state updates have completed
      setTimeout(() => {
        console.log("Executing delayed navigation");
        navigate("/", { replace: true });
      }, 100);
    }
  }, [authenticated, navigate]);

  // Initial check for authentication
  useEffect(() => {
    checkAndNavigate();
  }, [checkAndNavigate]);

  // Fetch all branches from the API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        console.log("Fetching branches from:", API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response:", data);
        
        // Extract unique branch names (handle both branchname and branch)
        const uniqueBranches = [...new Set(data
          .map(entry => entry.branchname || entry.branch)
          .filter(branch => branch && branch.trim() !== "")
        )];
        
        console.log("Unique branches:", uniqueBranches);
        setBranches(uniqueBranches.sort());
      } catch (err) {
        console.error("Error fetching branches:", err);
        setLocalError("Failed to load branches. Please try again later.");
      } finally {
        setFetchingBranches(false);
      }
    };

    fetchBranches();
  }, [API_URL, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
  
    if (email.length > 25) {
      setLocalError("F number is incorrect");
      return;
    }
  
    if (!selectedBranch) {
      setLocalError("Please select a branch");
      return;
    }
  
    try {
      console.log("Attempting login with:", { email, branch: selectedBranch });
      // Call the login function from the context
      const success = await login(email, selectedBranch);
      
      console.log("Login result:", success);
      
      if (success) {
        console.log("Login successful, triggering navigation check");
        // Force a check for authentication state after login
        checkAndNavigate();
        
        // Backup direct navigation if the effect doesn't trigger
        setTimeout(() => {
          console.log("Executing fallback direct navigation");
          navigate("/", { replace: true });
        }, 500);
      } else {
        setLocalError("Login failed. Please check your credentials and try again.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setLocalError("An unexpected error occurred. Please try again.");
    }
  };

  // Display the context error or local error
  const displayError = error || localError;

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
          
          {displayError && <p className="error-message">{displayError}</p>}
          <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
        <div className="debug-info" style={{ display: 'none' }}>
          <p>Authentication state: {authenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;