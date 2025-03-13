import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const [localError, setLocalError] = useState("");
  const [intentionalLogin, setIntentionalLogin] = useState(false);
  
  // Use the visitor context
  const { login, loading, error, setError, authenticated, logout } = useVisitor();

  const API_URL = "http://localhost:5001/visitors";

  // Only trigger navigation when user explicitly logs in
  useEffect(() => {
    if (authenticated && email && intentionalLogin) {
      console.log("Context authenticated, notifying App component");
      onLogin(email);
    }
  }, [authenticated, email, onLogin, intentionalLogin]);

  // Clear any previous auth state when component mounts
  useEffect(() => {
    // Log out on initial render to clear any previous auth state
    logout();
  }, [logout]);

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
      
      // Mark this as an intentional login attempt
      setIntentionalLogin(true);
      
      // Call the login function from the context
      const success = await login(email, selectedBranch);
      
      console.log("Login result:", success);
      
      if (!success) {
        setLocalError("Login failed. Please check your credentials and try again.");
        setIntentionalLogin(false);
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setLocalError("An unexpected error occurred. Please try again.");
      setIntentionalLogin(false);
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
            maxLength={25}
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
      </div>
    </div>
  );
};

export default Login;