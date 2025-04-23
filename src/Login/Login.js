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
  
  // Authentication states
  const [authenticationState, setAuthenticationState] = useState("initial"); // initial, authenticating, verifying, branchSelection
  const [authTimer, setAuthTimer] = useState(0);
  const [sessionToken, setSessionToken] = useState("");
  const [savedfnumber, setSavedFnumber] = useState(""); 
  const [authToken, setAuthToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const { login, loading, error, setError, authenticated } = useVisitor();

  const API_URL = "http://localhost:5001";
  const AUTH_URL = "http://localhost:5001/auth";

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

  // Timer effect for verification waiting period
  useEffect(() => {
    let interval;
    if (authenticationState === "verifying" && authTimer < 60) {
      interval = setInterval(() => {
        setAuthTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authenticationState, authTimer]);

  // Function to check if user is an admin
  const checkIfAdmin = (email) => {
    return email.toLowerCase() === "admin";
  };

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

    // Check if the user is an admin
    const adminCheck = checkIfAdmin(fnumber);
    setIsAdmin(adminCheck);

    if (adminCheck) {
      // Admin authentication path (direct login without 2FA)
      try {
        console.log("Admin login detected, using direct authentication");
        setAuthenticationState("authenticating");
        
        const response = await fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: fnumber,
            password,
            branch: "" // Will be selected later
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Admin authentication failed');
        }
        
        console.log("Admin authentication successful, fetching branches");
        
        // Fetch available branches for admin
        const branchesResponse = await fetch(`${API_URL}/visitors/index`);
        
        if (!branchesResponse.ok) {
          throw new Error('Failed to fetch branches');
        }
        
        const branchesData = await branchesResponse.json();
        
        console.log(`Received ${branchesData.length} branches from API`);
        
        const branchOptions = branchesData
          .filter(branch => branch.branchName && branch.branchName.trim() !== "")
          .sort((a, b) => a.branchName.localeCompare(b.branchName));
        
        console.log(`Found ${branchOptions.length} unique branches`);
        setBranches(branchOptions);
        
        // Show branch selection for admin
        setSavedFnumber(fnumber);
        setSessionToken(data.token); // Store token for later use
        setAuthenticationState("branchSelection");
        setFetchingBranches(false);
        
      } catch (err) {
        console.error("Admin authentication error:", err);
        setLocalError(err.message || "Admin authentication failed. Please check your credentials.");
        setAuthenticationState("initial");
      } finally {
        setLoadingSpinner(false);
      }
    } else {
      // Regular user authentication path (with 2FA)
      try {
        setAuthenticationState("authenticating");
        
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
        
        // Check if we got a proper auth token from the LDAP service
        if (!data.token) {
          throw new Error('Authentication failed. No token received from service.');
        }
        
        setAuthToken(data.token);
        setSavedFnumber(fnumber);
        
        // Start verification process automatically
        setAuthenticationState("verifying");
        setAuthTimer(0);
        
        // Start polling for verification status
        pollVerificationStatus(data.token);
        
      } catch (err) {
        console.error("Authentication error:", err);
        setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
        setAuthenticationState("initial");
      } finally {
        setLoadingSpinner(false);
      }
    }
  };

  const pollVerificationStatus = async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          code: "" // Empty code for polling
        })
      });
      
      const data = await response.json();
      console.log("2FA verification status:", data);
      
      if (response.ok && data.success) {
        // Verification successful
        setSessionToken(data.sessionToken);
        
        if (data.branches && data.branches.length === 1) {
          // If only one branch, auto-select it and proceed to final login
          await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
        } else if (data.branches && data.branches.length > 1) {
          // If multiple branches, show branch selection screen
          setBranches(data.branches);
          setAuthenticationState("branchSelection");
        } else {
          throw new Error('No branches available for this user');
        }
      } else if (response.status === 202) {
        // Still waiting for verification, continue polling if we haven't hit 60 seconds
        if (authTimer < 55) {
          setTimeout(() => pollVerificationStatus(token), 5000);
        }
        // If we're at 60 seconds, the user will need to click "Proceed" which will call verify2fa again
      } else {
        // Verification failed
        throw new Error(data.error || 'Verification failed');
      }
      
    } catch (err) {
      console.error("2FA verification polling error:", err);
      // Only show error if not a timeout/polling issue
      if (authTimer >= 55) {
        setLocalError("Please click Proceed when you've approved the request on your phone.");
      }
    }
  };

  const handleManualVerification = async () => {
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          code: "" // We're not using manual code entry anymore
        })
      });
      
      const data = await response.json();
      console.log("Manual 2FA verification response:", data);
      
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
        setAuthenticationState("branchSelection");
      } else {
        throw new Error('No branches available for this user');
      }
      
    } catch (err) {
      console.error("Manual verification error:", err);
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
    
    if (isAdmin) {
      await handleAdminBranchLogin(savedfnumber, selectedBranch, sessionToken);
    } else {
      await handleFinalLogin(savedfnumber, selectedBranch, sessionToken);
    }
  };

  const handleAdminBranchLogin = async (fnumber, branch, token) => {
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      console.log(`Finalizing admin login with branch: ${branch}`);
      
      const selectedBranchObj = branches.find(b => b.branchName === branch);
      
      if (!selectedBranchObj) {
        throw new Error('Invalid branch selection');
      }
      
      const branchCode = selectedBranchObj.branchCode;
      
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: fnumber,
          password, // This is not ideal but we're reusing the login endpoint
          branch: branch
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      const userRole = data.user && data.user.role ? data.user.role : "admin";
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        branchName: branch,
        branchCode: branchCode,
        role: userRole
      }));
      
      setManualLoginAttempt(true);
      const success = await login(
        fnumber, 
        branchCode, 
        data.token, 
        branch, 
        userRole
      );
      
      if (!success) {
        setManualLoginAttempt(false);
        throw new Error("Login failed. Please try again.");
      }
      
    } catch (err) {
      console.error("Admin branch login error:", err);
      setManualLoginAttempt(false);
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
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
  
  const resetLogin = () => {
    setAuthenticationState("initial");
    setAuthTimer(0);
    setLoadingSpinner(false);
    setLocalError("");
  };
  
  const displayError = error || localError;

  // Initial login form
  if (authenticationState === "initial") {
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
  
  // Authentication in progress
  if (authenticationState === "authenticating") {
    return (
      <div className="login-container">
        <div className="login-card">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          <h2>Authenticating</h2>
          
          <div className="verification-status">
            <div className="status-indicator">
              <span className="spinner"></span>
              <div className="pending-status">Verifying your credentials...</div>
            </div>
          </div>
          
          {displayError && <p className="error-message">{displayError}</p>}
          
          <button 
            className="back-button" 
            onClick={resetLogin}
            disabled={loadingSpinner}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // 2FA verification in progress
  if (authenticationState === "verifying") {
    return (
      <div className="login-container">
        <div className="login-card">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          <h2>Two-Factor Authentication</h2>
          
          <div className="verification-status">
            <h3>Verification Request Sent</h3>
            <p>Please check your phone for an authentication request and approve it to continue.</p>
            
            <div className="status-indicator">
              <span className="spinner"></span>
              <div className="pending-status">Waiting for approval on your phone... ({authTimer}s)</div>
            </div>
          </div>
          
          {displayError && <p className="error-message">{displayError}</p>}
          
          {authTimer >= 60 ? (
            <button 
              className="login-button" 
              onClick={handleManualVerification}
              disabled={loadingSpinner}
            >
              {loadingSpinner ? <span className="spinner"></span> : "Proceed"}
            </button>
          ) : null}
          
          <button 
            className="back-button" 
            onClick={resetLogin}
            disabled={loadingSpinner}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Branch selection form
  if (authenticationState === "branchSelection") {
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
            
            <button 
              className="back-button" 
              onClick={resetLogin}
              disabled={loadingSpinner}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return null;
};
 
export default Login;

// auth
const authenticateUser = async (req, res) => {
  const { fnumber, password } = req.body;

  if (!fnumber || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'F-number and password are required' 
    });
  }

  try {
    console.log(`[AUTH] Authentication attempt for user: ${fnumber}`);
    
    const authToken = await getAuthToken();
    console.log('[AUTH] Successfully obtained token for authentication');
    
    console.log('[AUTH] Sending authentication request to LDAP service');
    const authResponse = await axios.post(LDAP_AUTH_URL, {
      fnumber,
      password
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[AUTH] Auth response status:', authResponse.status);
    
    // First, let's check for invalid credentials scenarios
    if (authResponse.data && 
        (authResponse.data.status_code === '401' || 
         authResponse.data.status_code === 401 ||
         (authResponse.data.status_message && 
          authResponse.data.status_message.toLowerCase().includes('invalid credentials')))) {
      console.log('[AUTH] Invalid credentials for user:', fnumber);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials. Please check your F-number and password.' 
      });
    }
    
    // Check for any other error conditions
    if (!authResponse.data || 
        (authResponse.data.status_code !== '000' && 
         authResponse.data.status_code !== '0' && 
         authResponse.data.status_code !== 0)) {
      console.error('[AUTH] Authentication failed:', JSON.stringify(authResponse.data, null, 2));
      return res.status(401).json({ 
        success: false, 
        error: authResponse.data?.status_message || 'Authentication failed. Please try again.' 
      });
    }
    
    // Check if we have a valid token in the response
    if (!authResponse.data.token) {
      console.error('[AUTH] Authentication response missing token');
      return res.status(500).json({ 
        success: false, 
        error: 'Authentication system error. Please try again later.' 
      });
    }
    
    console.log('[AUTH] Authentication successful for user:', fnumber);
    console.log('[AUTH] Returning token for 2FA verification');
    
    // Log all data when authentication is successful
    console.log('[AUTH] Full auth response data:', JSON.stringify(authResponse.data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful, proceed with 2FA verification',
      token: authResponse.data.token, 
      data: authResponse.data 
    });
    
  } catch (err) {
    console.error('[AUTH] Authentication error:', err.message);
    
    // If there's a specific error related to credentials in the response
    if (err.response && err.response.data) {
      const errorData = err.response.data;
      
      // Check for common error patterns that indicate invalid credentials
      if (errorData.status_code === 401 || 
          (errorData.status_message && 
           errorData.status_message.toLowerCase().includes('invalid')) ||
          (errorData.error && 
           errorData.error.toLowerCase().includes('credentials'))) {
        
        console.log('[AUTH] Server reported invalid credentials');
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials. Please check your F-number and password.' 
        });
      }
      
      console.error('[AUTH] Error response status:', err.response.status);
      console.error('[AUTH] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Authentication failed. Please try again later.` 
    });
  }
};

// verify
const verify2FA = async (req, res) => {
  const { token, code } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log(`[2FA] Verification attempt with token: ${token.substring(0, 8)}...`);
    
    // Check the status of the 2FA verification
    const verifyResponse = await axios.post(VERIFICATION_STATUS_URL, {
      token,
      code: code || ""
    }, { 
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[2FA] Verification response status:', verifyResponse.status);
    
    // If verification is still pending
    if (verifyResponse.data && verifyResponse.data.status === "pending") {
      console.log('[2FA] Verification still pending for token:', token.substring(0, 8));
      return res.status(202).json({ 
        success: false, 
        pending: true,
        error: 'Verification still pending. Please approve the request on your device.' 
      });
    }
    
    // If verification failed
    if (!verifyResponse.data || verifyResponse.data.status !== "approved") {
      console.error('[2FA] Verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      return res.status(401).json({ 
        success: false, 
        error: verifyResponse.data?.message || 'Verification failed. Please try again.' 
      });
    }
    
    console.log('[2FA] Verification successful for token:', token.substring(0, 8));
    
    // Get user information and available branches
    const userInfo = await getUserInfo(verifyResponse.data.user_id);
    const branches = await getUserBranches(verifyResponse.data.user_id);
    
    // Generate a session token
    const sessionToken = generateSessionToken(verifyResponse.data.user_id);
    
    return res.status(200).json({
      success: true,
      message: 'Verification successful',
      sessionToken: sessionToken,
      fnumber: userInfo.fnumber,
      branches: branches
    });
    
  } catch (err) {
    console.error('[2FA] Verification error:', err.message);
    
    if (err.response && err.response.data) {
      console.error('[2FA] Error response status:', err.response.status);
      console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Verification failed. Please try again later.` 
    });
  }
};