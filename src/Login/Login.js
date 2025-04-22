
import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = ({ onLogin }) => {
  const [fnumber, setFnumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [localError, setLocalError] = useState("");
  const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [savedfnumber, setSavedFnumber] = useState(""); 
  const [authToken, setAuthToken] = useState("");

  const { login, loading, error, setError, authenticated } = useVisitor();

  const API_URL = "http://localhost:5001";

  useEffect(() => {
    if (authenticated && fnumber && manualLoginAttempt) {
      console.log("Authentication successful after manual login attempt, navigating to dashboard");
      setTimeout(() => { 
        onLogin(fnumber);
        setManualLoginAttempt(false);
      }, 1000); 
    } else if (authenticated) {
      console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
    }
  }, [authenticated, fnumber, onLogin, manualLoginAttempt]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    console.log("Initial login form submitted");
    setLocalError("");
    setLoadingSpinner(true);

    if (fnumber.length > 25) {
      setLocalError("F number is incorrect");
      setLoadingSpinner(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fnumber,
          password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      console.log("Authentication response:", data);
      
      setAuthToken(data.token);
      setSavedFnumber(fnumber);
      
      // Now show verification screen
      setShowVerification(true);
      
    } catch (err) {
      console.error("Authentication error:", err);
      setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      // Call the verify2FA endpoint directly - no polling needed
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          code: verificationCode
        })
      });
      
      const data = await response.json();
      console.log("2FA verification response:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      
      // If we got success, process the response
      setSessionToken(data.sessionToken);
      setBranches(data.branches || []);
      
      if (data.branches && data.branches.length === 1) {
        // If only one branch, auto-select it and proceed to final login
        setSelectedBranch(data.branches[0].branchName);
        await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
      } else if (data.branches && data.branches.length > 1) {
        // If multiple branches, show branch selection screen
        setShowVerification(false);
        setShowBranchSelection(true);
        setFetchingBranches(false);
      } else {
        throw new Error('No branches available for this user');
      }
      
    } catch (err) {
      console.error("2FA verification error:", err);
      setLocalError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    console.log("Branch selection form submitted");
    
    if (!selectedBranch) {
      setLocalError("Please select a branch");
      return;
    }
    
    await handleFinalLogin(savedfnumber, selectedBranch, sessionToken);
  };

  const handleFinalLogin = async (fnumber, branch, sessionToken) => {
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      console.log(`Finalizing login with branch: ${branch}`);
      
      const response = await fetch(`${API_URL}/users/finalize-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fnumber,
          branch,
          sessionToken
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        branchName: data.user.branch,
        branchCode: data.user.branchCode
      }));
      
      setManualLoginAttempt(true);
      const success = await login(
        fnumber, 
        data.user.branchCode, 
        data.token, 
        data.user.branch, 
        data.user.role
      );
      
      if (!success) {
        setManualLoginAttempt(false);
        throw new Error("Login failed. Please try again.");
      }
      
    } catch (err) {
      console.error("Login finalization error:", err);
      setManualLoginAttempt(false);
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };
  
  const displayError = error || localError;

  // Render initial login form
  if (!showVerification && !showBranchSelection) {
    return (
      <div className="login-container">
        <div className="login-card">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          <h2>Welcome to FNB Admin</h2>
          <form onSubmit={handleInitialSubmit}>
            <input
              type="text"
              placeholder="F-Number"
              value={fnumber}
              onChange={(e) => setFnumber(e.target.value)}
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
            
            {displayError && <p className="error-message">{displayError}</p>}
            <button type="submit" className="login-button" disabled={loading || loadingSpinner}>
              {loadingSpinner ? <span className="spinner"></span> : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // 2FA verification screen
  if (showVerification) {
    return (
      <div className="login-container">
        <div className="login-card">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          <h2>Two-Factor Authentication</h2>
          
          <div className="verification-status">
            <h3>Verification Request Sent</h3>
            <p>Please check your phone for an authentication request and approve it to continue.</p>
            
            <div className="status-indicator">
              <div className="pending-status">Waiting for approval on your phone...</div>
            </div>
          </div>
          
          <form onSubmit={handleVerify2FA}>
            <input
              type="text"
              placeholder="Enter verification code (optional)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            
            {displayError && <p className="error-message">{displayError}</p>}
            
            <button type="submit" className="login-button" disabled={loading || loadingSpinner}>
              {loadingSpinner ? <span className="spinner"></span> : "Verify"}
            </button>
          </form>
          
          <button 
            className="back-button" 
            onClick={() => {
              setShowVerification(false);
            }}
            disabled={loadingSpinner}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Branch selection form
  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Select Branch</h2>
        <form onSubmit={handleBranchSubmit}>
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
                <option key={branch.branchCode} value={branch.branchName}>
                  {branch.branchName}
                </option>
              ))}
            </select>
            {fetchingBranches && (
              <span className="select-spinner"></span>
            )}
          </div>
          
          {displayError && <p className="error-message">{displayError}</p>}
          <button type="submit" className="login-button" disabled={loading || loadingSpinner || fetchingBranches}>
            {loadingSpinner ? <span className="spinner"></span> : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;


