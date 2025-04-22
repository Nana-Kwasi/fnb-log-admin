

import React, { useState, useEffect, useRef } from "react";
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
  const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed

  const pollingIntervalRef = useRef(null);
  const maxPollingTime = 120000; // 2 minutes
  const pollingStartTimeRef = useRef(null);

  const { login, loading, error, setError, authenticated } = useVisitor();

  const API_URL = "http://localhost:5001";

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
// In your Login component, modify the startPollingFor2FA function:

const startPollingFor2FA = (token) => {
  console.log("Starting to poll for 2FA status with token:", token);
  setPollingStatus("pending");
  pollingStartTimeRef.current = Date.now();
  
  // Clear any existing interval
  if (pollingIntervalRef.current) {
    clearInterval(pollingIntervalRef.current);
  }
  
  pollingIntervalRef.current = setInterval(async () => {
    try {
      // Check if we've exceeded the max polling time
      if (Date.now() - pollingStartTimeRef.current > maxPollingTime) {
        clearInterval(pollingIntervalRef.current);
        setPollingStatus("failed");
        setLocalError("2FA verification timed out. Please try again.");
        return;
      }
      
      console.log("Polling for 2FA status...");
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          fnumber: savedfnumber, // Add this line to include the fnumber in each poll request
          code: "" // Empty code to just check status
        })
      });
      
      const data = await response.json();
      console.log("2FA status check response:", data);
      
      // Check if the 2FA has been approved by looking at the status code in the response data
      if (response.ok && data.success) {
        clearInterval(pollingIntervalRef.current);
        setPollingStatus("success");
        
        // Process the successful verification
        setSessionToken(data.sessionToken);
        setBranches(data.branches || []);
        
        // Give a short delay to show the success state to the user
        setTimeout(() => {
          if (data.branches && data.branches.length === 1) {
            // If only one branch, auto-select it and proceed to final login
            setSelectedBranch(data.branches[0].branchName);
            handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
          } else if (data.branches && data.branches.length > 1) {
            // If multiple branches, show branch selection screen
            setShowVerification(false);
            setShowBranchSelection(true);
            setFetchingBranches(false);
          } else {
            setLocalError('No branches available for this user');
            setPollingStatus("failed");
          }
        }, 1000);
      }
      // Check for a specific status in the verify response data that indicates approval
      else if (response.ok && 
               data.verifyResponseData && 
               (data.verifyResponseData.status_code === '000' || 
                data.verifyResponseData.status_code === '0' || 
                data.verifyResponseData.status === 'APPROVED')) {
        clearInterval(pollingIntervalRef.current);
        setPollingStatus("success");
        
        // Process the successful verification 
        setSessionToken(data.sessionToken);
        setBranches(data.branches || []);
        
        // Give a short delay to show the success state to the user
        setTimeout(() => {
          if (data.branches && data.branches.length === 1) {
            // If only one branch, auto-select it and proceed to final login
            setSelectedBranch(data.branches[0].branchName);
            handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
          } else if (data.branches && data.branches.length > 1) {
            // If multiple branches, show branch selection screen
            setShowVerification(false);
            setShowBranchSelection(true);
            setFetchingBranches(false);
          } else {
            setLocalError('No branches available for this user');
            setPollingStatus("failed");
          }
        }, 1000);
      }
      // If it's still pending, continue polling
      
    } catch (err) {
      console.error("Error polling for 2FA status:", err);
      // Don't stop polling on error - let the timeout handle it
    }
  }, 3000); // Check every 3 seconds
};
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    console.log("Initial login form submitted");
    setLocalError("");
    setLoadingSpinner(true);

    if (fnumber.length > 25) {
      setLocalError("F number is incorrect");
      setLoadingSpinner(false);

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

    // ADMIN PATH: Special case for admin credentials
    if (fnumber === "admin@fnb.com" && password === "password12345") {
      try {
        setIsAdminFlow(true);
        // Fetch branches for admin
        console.log("Fetching branches for admin login");
        const branchResponse = await fetch(BRANCHES_URL);
        
        if (!branchResponse.ok) {
          throw new Error(`Branch API response error: ${branchResponse.status}`);
        }
        
        const branchData = await branchResponse.json();
        console.log(`Received ${branchData.length} branches from API`);
        
        const branchOptions = branchData
          .filter(branch => branch.branchName && branch.branchName.trim() !== "")
          .sort((a, b) => a.branchName.localeCompare(b.branchName));
        
        setBranches(branchOptions);
        
        // Show branch selection screen directly (skip 2FA)
        setShowBranchSelection(true);
        
      } catch (err) {
        console.error("Admin authentication error:", err);
        setLocalError(err.message || "Failed to load branches. Please try again later.");
      } finally {
        setLoadingSpinner(false);
      }
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
      
      // Now show verification screen and start polling
      setShowVerification(true);
      startPollingFor2FA(data.token);
      
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
      // Manual code verification if user entered a code
      if (!verificationCode.trim()) {
        setLocalError("Please enter a verification code");
        setLoadingSpinner(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          code: verificationCode,
          fnumber: savedfnumber // Make sure to send the fnumber
        })
      });
      
      const data = await response.json();
      console.log("Manual 2FA verification response:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      
      // Stop polling if it's still going
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Process the successful verification
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

  const cancelAuth = () => {
    // Stop the polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setShowVerification(false);
    setPollingStatus("pending");
    setLoadingSpinner(false);
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
              {pollingStatus === "pending" && (
                <div className="pending-status">
                  <span className="spinner"></span>
                  Waiting for approval on your phone...
                </div>
              )}
              {pollingStatus === "success" && (
                <div className="success-status">
                  <span className="success-icon">✓</span>
                  Verification successful! Proceeding...
                </div>
              )}
              {pollingStatus === "failed" && (
                <div className="failed-status">
                  <span className="failed-icon">✗</span>
                  Verification failed. Please try again.
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleVerify2FA}>
            <p className="option-text">Or, if you have a verification code:</p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            
            {displayError && <p className="error-message">{displayError}</p>}
            
            <button type="submit" className="login-button" disabled={loading || loadingSpinner || pollingStatus === "success"}>
              {loadingSpinner ? <span className="spinner"></span> : "Verify with Code"}
            </button>
          </form>
          
          <button 
            className="back-button" 
            onClick={cancelAuth}
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

