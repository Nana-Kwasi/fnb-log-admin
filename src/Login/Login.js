// import React, { useState, useEffect, useRef } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   // Common state
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
//   const [loadingSpinner, setLoadingSpinner] = useState(false);
  
//   // 2FA state (for non-admin users)
//   const [showVerification, setShowVerification] = useState(false);
//   const [verificationCode, setVerificationCode] = useState("");
//   const [showBranchSelection, setShowBranchSelection] = useState(false);
//   const [sessionToken, setSessionToken] = useState("");
//   const [savedIdentifier, setSavedIdentifier] = useState(""); 
//   const [authToken, setAuthToken] = useState("");
//   const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed
//   const [isAdminUser, setIsAdminUser] = useState(false);

//   const pollingIntervalRef = useRef(null);
//   const maxPollingTime = 120000; // 2 minutes
//   const pollingStartTimeRef = useRef(null);

//   const { login, loading, error, setError, authenticated } = useVisitor();

//   // API URLs
//   const API_URL = "http://localhost:5001";
//   const BRANCHES_URL = "http://localhost:5001/visitors/index";
//   const AUTH_URL = "http://localhost:5001/auth";

//   // Cleanup polling on unmount
//   useEffect(() => {
//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, []);

//   // Handle successful authentication
//   useEffect(() => {
//     if (authenticated && identifier && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       setTimeout(() => { 
//         onLogin(identifier);
//         setManualLoginAttempt(false);
//       }, 1000); 
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, identifier, onLogin, manualLoginAttempt]);

//   // Fetch branches initially
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         setFetchingBranches(true);
//         console.log("Fetching branches from:", BRANCHES_URL);
//         const response = await fetch(BRANCHES_URL);
        
//         if (!response.ok) {
//           throw new Error(`API response error: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log(`Received ${data.length} branches from API`);
        
//         const branchOptions = data
//           .filter(branch => branch.branchName && branch.branchName.trim() !== "")
//           .sort((a, b) => a.branchName.localeCompare(b.branchName));
        
//         console.log(`Found ${branchOptions.length} unique branches`);
//         setBranches(branchOptions);
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setLocalError("Failed to load branches. Please try again later.");
//       } finally {
//         setFetchingBranches(false);
//       }
//     };

//     // Only fetch branches if we need them for the admin flow or branch selection screen
//     if (!showVerification || showBranchSelection) {
//       fetchBranches();
//     }
//   }, [BRANCHES_URL, showVerification, showBranchSelection]);

//   // Check if a user is admin based on their identifier
//   const checkIfAdmin = (identifier) => {
//     return identifier.includes('@') && !identifier.startsWith('F');
//   };

//   // Start polling for 2FA status (for non-admin users)
//   const startPollingFor2FA = (token) => {
//     console.log("Starting to poll for 2FA status with token:", token);
//     setPollingStatus("pending");
//     pollingStartTimeRef.current = Date.now();
    
//     // Clear any existing interval
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//     }
    
//     pollingIntervalRef.current = setInterval(async () => {
//       try {
//         // Check if we've exceeded the max polling time
//         if (Date.now() - pollingStartTimeRef.current > maxPollingTime) {
//           clearInterval(pollingIntervalRef.current);
//           setPollingStatus("failed");
//           setLocalError("2FA verification timed out. Please try again.");
//           return;
//         }
        
//         console.log("Polling for 2FA status...");
//         const response = await fetch(`${API_URL}/users/verify2fa`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             token: token,
//             code: "" // Empty code to just check status
//           })
//         });
        
//         const data = await response.json();
//         console.log("2FA status check response:", data);
        
//         // Check for specific error conditions
//         if (!response.ok && data.status_code === "001" && data.status_message.includes("User not found in LDAP")) {
//           clearInterval(pollingIntervalRef.current);
//           setPollingStatus("failed");
//           setLocalError("User not found in LDAP. Please check your credentials.");
//           setShowVerification(false);
//           return;
//         }
        
//         // If verification was successful
//         if (response.ok && data.success) {
//           clearInterval(pollingIntervalRef.current);
//           setPollingStatus("success");
          
//           // Process the successful verification
//           setSessionToken(data.sessionToken);
//           setBranches(data.branches || []);
          
//           if (data.branches && data.branches.length === 1) {
//             // If only one branch, auto-select it and proceed to final login
//             setSelectedBranch(data.branches[0].branchName);
//             await handleFinalLogin(data.fnumber || savedIdentifier, data.branches[0].branchName, data.sessionToken);
//           } else if (data.branches && data.branches.length > 1) {
//             // If multiple branches, show branch selection screen
//             setShowVerification(false);
//             setShowBranchSelection(true);
//             setFetchingBranches(false);
//           } else {
//             setLocalError('No branches available for this user');
//             setPollingStatus("failed");
//           }
//         }
//         // If it's still pending, continue polling
        
//       } catch (err) {
//         console.error("Error polling for 2FA status:", err);
//         // Don't stop polling on error - let the timeout handle it
//       }
//     }, 3000); // Check every 3 seconds
//   };

//   // Handle initial form submission for both admin and non-admin users
//   const handleInitialSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Initial login form submitted");
//     setLocalError("");
//     setLoadingSpinner(true);

//     // Validate F-number length for non-admin users
//     if (!identifier.includes('@') && identifier.length !== 8) {
//       setLocalError("F number must be exactly 8 characters");
//       setLoadingSpinner(false);
//       return;
//     }

//     // Determine if this is an admin login or regular user
//     const isAdmin = checkIfAdmin(identifier);
//     setIsAdminUser(isAdmin);
    
//     try {
//       if (isAdmin) {
//         // Admin authentication flow
//         await handleAdminAuth(identifier, password);
//       } else {
//         // Regular user authentication flow (with 2FA)
//         await handleRegularUserAuth(identifier, password);
//       }
//     } catch (err) {
//       console.error("Authentication error:", err);
//       setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
//       setLoadingSpinner(false);
//     }
//   };

//   // Handle admin authentication
//   // Update the handleAdminAuth function in your Login component:
// const handleAdminAuth = async (email, password) => {
//   try {
//     console.log("Using admin authentication flow");
//     setLoadingSpinner(true);
    
//     // Use a new endpoint specifically for admin credential verification
//     const response = await fetch(`${AUTH_URL}/verify-admin`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         email,
//         password
//       })
//     });
    
//     const data = await response.json();
    
//     if (!response.ok || !data.success) {
//       throw new Error(data.error || "Admin authentication failed. Please check your credentials.");
//     }
    
//     // Store admin token for use in final authentication
//     setSessionToken(data.token || "");
//     setSavedIdentifier(email);
    
//     // Set branches from response if available
//     if (data.branches && Array.isArray(data.branches)) {
//       setBranches(data.branches);
//       setFetchingBranches(false);
//     }
    
//     // Now show branch selection after successful authentication
//     setShowBranchSelection(true);
//     setLoadingSpinner(false);
    
//   } catch (err) {
//     console.error("Admin authentication error:", err);
//     setLocalError(err.message || "Admin authentication failed. Please check your credentials.");
//     setLoadingSpinner(false);
//   }
// };

// // Update the handleFinalLogin function to handle the branch selection properly:
// const handleFinalLogin = async (identifier, branch, sessionToken) => {
//   setLocalError("");
//   setLoadingSpinner(true);
  
//   try {
//     console.log(`Finalizing login with branch: ${branch}`);
    
//     const selectedBranchObj = branches.find(branchObj => branchObj.branchName === branch);
//     const branchCode = selectedBranchObj ? selectedBranchObj.branchCode : '';
    
//     // For admin users, make the final login call with the selected branch
//     if (isAdminUser) {
//       const response = await fetch(`${AUTH_URL}/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${sessionToken}` // Use the temp token for authorization
//         },
//         body: JSON.stringify({
//           email: identifier,
//           password: password, // You might want to remove this for security if using the token
//           branch
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || (data.success === false)) {
//         throw new Error(data.error || 'Login failed');
//       }
      
//       // Store user data
//       const userData = {
//         ...(data.user || {}),
//         branchName: branch,
//         branchCode: branchCode || (data.user ? data.user.branchCode : ''),
//         role: 'admin'
//       };
      
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify(userData));
      
//       setManualLoginAttempt(true);
//       const success = await login(
//         identifier, 
//         userData.branchCode, 
//         data.token, 
//         branch, 
//         userData.role
//       );
      
//       if (!success) {
//         setManualLoginAttempt(false);
//         throw new Error("Login failed. Please try again.");
//       }
//     }
//     // Keep your existing regular user login flow
//     else {
//       // Regular user finalization code...
//     }
    
//   } catch (err) {
//     console.error("Login finalization error:", err);
//     setManualLoginAttempt(false);
//     setLocalError(err.message || "An unexpected error occurred. Please try again.");
//   } finally {
//     setLoadingSpinner(false);
//   }
// };



//   // Handle regular user authentication (with 2FA)
//   const handleRegularUserAuth = async (fnumber, password) => {
//     try {
//       console.log("Using regular user authentication flow with 2FA");
      
//       const response = await fetch(`${API_URL}/users/authenticate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           fnumber,
//           password
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || !data.success) {
//         // Check for specific error messages from the server
//         if (data.status_code === "001" && data.status_message.includes("User not found in LDAP")) {
//           throw new Error("User not found in LDAP. Please check your credentials.");
//         }
//         throw new Error(data.error || 'Authentication failed');
//       }
      
//       console.log("Authentication response:", data);
      
//       setAuthToken(data.token);
//       setSavedIdentifier(fnumber);
      
//       // Now show verification screen and start polling
//       setShowVerification(true);
//       startPollingFor2FA(data.token);
      
//     } catch (err) {
//       console.error("Regular user authentication error:", err);
//       throw err; // Re-throw to be caught by the caller
//     } finally {
//       setLoadingSpinner(false);
//     }
//   };

//   // Handle 2FA verification with code (for non-admin users)
//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setLocalError("");
//     setLoadingSpinner(true);
    
//     try {
//       // Manual code verification if user entered a code
//       if (!verificationCode.trim()) {
//         setLocalError("Please enter a verification code");
//         setLoadingSpinner(false);
//         return;
//       }
      
//       const response = await fetch(`${API_URL}/users/verify2fa`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           token: authToken,
//           code: verificationCode,
//           fnumber: savedIdentifier // Make sure to send the fnumber
//         })
//       });
      
//       const data = await response.json();
//       console.log("Manual 2FA verification response:", data);
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Verification failed');
//       }
      
//       // Stop polling if it's still going
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
      
//       // Process the successful verification
//       setSessionToken(data.sessionToken);
//       setBranches(data.branches || []);
      
//       if (data.branches && data.branches.length === 1) {
//         // If only one branch, auto-select it and proceed to final login
//         setSelectedBranch(data.branches[0].branchName);
//         await handleFinalLogin(data.fnumber || savedIdentifier, data.branches[0].branchName, data.sessionToken);
//       } else if (data.branches && data.branches.length > 1) {
//         // If multiple branches, show branch selection screen
//         setShowVerification(false);
//         setShowBranchSelection(true);
//         setFetchingBranches(false);
//       } else {
//         throw new Error('No branches available for this user');
//       }
      
//     } catch (err) {
//       console.error("2FA verification error:", err);
//       setLocalError(err.message || "Verification failed. Please try again.");
//     } finally {
//       setLoadingSpinner(false);
//     }
//   };

//   // Handle branch selection for both admin and non-admin users
//   const handleBranchSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Branch selection form submitted");
    
//     if (!selectedBranch) {
//       setLocalError("Please select a branch");
//       return;
//     }
    
//     await handleFinalLogin(savedIdentifier, selectedBranch, sessionToken);
//   };


//   // Cancel 2FA process and go back to login
//   const cancelAuth = () => {
//     // Stop the polling
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//     }
    
//     setShowVerification(false);
//     setPollingStatus("pending");
//     setLoadingSpinner(false);
//   };
  
//   const displayError = error || localError;

//   // Render initial login form
//   if (!showVerification && !showBranchSelection) {
//     return (
//       <div className="login-container">
//         <div className="login-card">
//           <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//           <h2>Welcome to FNB Admin</h2>
//           <form onSubmit={handleInitialSubmit}>
//             <input
//               type="text"
//               placeholder="F-Number or Email"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               maxLength={25}
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
            
//             {displayError && <p className="error-message">{displayError}</p>}
//             <button type="submit" className="login-button" disabled={loading || loadingSpinner}>
//               {loadingSpinner ? <span className="spinner"></span> : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }
  
//   if (showVerification) {
//     return (
//       <div className="login-container">
//         <div className="login-card">
//           <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//           <h2>Two-Factor Authentication</h2>
          
//           <div className="verification-status">
//             <h3>Verification Request Sent</h3>
//             <p>Please check your phone for an authentication request and approve it to continue.</p>
            
//             <div className="status-indicator">
//               {pollingStatus === "pending" && (
//                 <div className="pending-status">
//                   <span className="spinner"></span>
//                   Waiting for approval on your phone...
//                 </div>
//               )}
//               {pollingStatus === "success" && (
//                 <div className="success-status">
//                   <span className="success-icon">✓</span>
//                   Verification successful! Proceeding...
//                 </div>
//               )}
//               {pollingStatus === "failed" && (
//                 <div className="failed-status">
//                   <span className="failed-icon">✗</span>
//                   Verification failed. Please try again.
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <form onSubmit={handleVerify2FA}>
//             <p className="option-text">Or, if you have a verification code:</p>
//             <input
//               type="text"
//               placeholder="Enter verification code"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//             />
            
//             {displayError && <p className="error-message">{displayError}</p>}
            
//             <button type="submit" className="login-button" disabled={loading || loadingSpinner || pollingStatus === "success"}>
//               {loadingSpinner ? <span className="spinner"></span> : "Verify with Code"}
//             </button>
//           </form>
          
//           <button 
//             className="back-button" 
//             onClick={cancelAuth}
//             disabled={loadingSpinner}
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   // Branch selection form (for both admin and non-admin users)
//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Select Branch</h2>
//         <form onSubmit={handleBranchSubmit}>
//           <div className="select-container">
//             <select
//               value={selectedBranch}
//               onChange={(e) => setSelectedBranch(e.target.value)}
//               required
//               disabled={fetchingBranches}
//               className="branch-select"
//             >
//               <option value="">Select Branch</option>
//               {branches.map((branch) => (
//                 <option key={branch.branchCode} value={branch.branchName}>
//                   {branch.branchName}
//                 </option>
//               ))}
//             </select>
//             {fetchingBranches && (
//               <span className="select-spinner"></span>
//             )}
//           </div>
          
//           {displayError && <p className="error-message">{displayError}</p>}
//           <button type="submit" className="login-button" disabled={loading || loadingSpinner || fetchingBranches}>
//             {loadingSpinner ? <span className="spinner"></span> : "Continue"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect, useRef } from "react";
import { useVisitor } from "../context/VisitorContext";
import "../login.css";

const Login = ({ onLogin }) => {
  // Common state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [localError, setLocalError] = useState("");
  const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  
  // 2FA state (for non-admin users)
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [savedIdentifier, setSavedIdentifier] = useState(""); 
  const [authToken, setAuthToken] = useState("");
  const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showManualCodeEntry, setShowManualCodeEntry] = useState(false);

  const pollingIntervalRef = useRef(null);
  const maxPollingTime = 120000; // 2 minutes
  const pollingStartTimeRef = useRef(null);
  const buttonTimerRef = useRef(null);
  const statusCheckCountRef = useRef(0);

  const { login, loading, error, setError, authenticated } = useVisitor();

  // API URLs
  const API_URL = "http://localhost:5001";
  const BRANCHES_URL = "http://localhost:5001/visitors/index";
  const AUTH_URL = "http://localhost:5001/auth";

  // Cleanup polling and timers on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (buttonTimerRef.current) {
        clearTimeout(buttonTimerRef.current);
      }
    };
  }, []);

  // Handle successful authentication
  useEffect(() => {
    if (authenticated && identifier && manualLoginAttempt) {
      console.log("Authentication successful after manual login attempt, navigating to dashboard");
      setTimeout(() => { 
        onLogin(identifier);
        setManualLoginAttempt(false);
      }, 1000); 
    } else if (authenticated) {
      console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
    }
  }, [authenticated, identifier, onLogin, manualLoginAttempt]);

  // Fetch branches initially
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        console.log("Fetching branches from:", BRANCHES_URL);
        const response = await fetch(BRANCHES_URL);
        
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} branches from API`);
        
        const branchOptions = data
          .filter(branch => branch.branchName && branch.branchName.trim() !== "")
          .sort((a, b) => a.branchName.localeCompare(b.branchName));
        
        console.log(`Found ${branchOptions.length} unique branches`);
        setBranches(branchOptions);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setLocalError("Failed to load branches. Please try again later.");
      } finally {
        setFetchingBranches(false);
      }
    };

    // Only fetch branches if we need them for the admin flow or branch selection screen
    if (!showVerification || showBranchSelection) {
      fetchBranches();
    }
  }, [BRANCHES_URL, showVerification, showBranchSelection]);

  // Make the Verify button appear after a delay
  useEffect(() => {
    if (showVerification && !showVerifyButton) {
      buttonTimerRef.current = setTimeout(() => {
        setShowVerifyButton(true);
      }, 5000); // Show verify button after 5 seconds instead of 10
    }
    
    return () => {
      if (buttonTimerRef.current) {
        clearTimeout(buttonTimerRef.current);
      }
    };
  }, [showVerification, showVerifyButton]);

  // Check if a user is admin based on their identifier
  const checkIfAdmin = (identifier) => {
    return identifier.includes('@') && !identifier.startsWith('F');
  };

  // Check verification status without a code
  const checkVerificationStatus = async () => {
    setCheckingStatus(true);
    setLocalError("");
    statusCheckCountRef.current += 1;
    
    try {
      console.log("Checking 2FA status...");
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          code: "", // Empty code to just check status
          fnumber: savedIdentifier
        })
      });
      
      const data = await response.json();
      console.log("2FA status check response:", data);
      
      // Check for specific error conditions
      if (!response.ok && data.status_code === "001" && data.status_message && data.status_message.includes("User not found in LDAP")) {
        setPollingStatus("failed");
        setLocalError("User not found in LDAP. Please check your credentials.");
        return;
      }
      
      // If verification was successful
      if (response.ok && data.success) {
        setPollingStatus("success");
        
        // Process the successful verification
        setSessionToken(data.sessionToken);
        setBranches(data.branches || []);
        
        // Wait a moment to show success status before proceeding
        setTimeout(() => {
          if (data.branches && data.branches.length === 1) {
            // If only one branch, auto-select it and proceed to final login
            setSelectedBranch(data.branches[0].branchName);
            handleFinalLogin(data.fnumber || savedIdentifier, data.branches[0].branchName, data.sessionToken);
          } else if (data.branches && data.branches.length > 1) {
            // If multiple branches, show branch selection screen
            setShowVerification(false);
            setShowBranchSelection(true);
            setFetchingBranches(false);
          } else {
            setLocalError('No branches available for this user');
            setPollingStatus("failed");
          }
        }, 1500);
      } else {
        // Still pending or failed
        if (data.status_code === "002" && data.status_message && data.status_message.includes("Pending")) {
          setLocalError("Authentication is still pending. Please approve the request on your phone.");
          
          // If we've checked multiple times and it's still pending, show manual code option
          if (statusCheckCountRef.current > 2) {
            setShowManualCodeEntry(true);
          }
        } else {
          setPollingStatus("failed");
          setLocalError(data.status_message || "Verification failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error checking 2FA status:", err);
      setLocalError("Error checking verification status. Please try again.");
      setPollingStatus("failed");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Start polling for 2FA status (for non-admin users)
  const startPollingFor2FA = (token) => {
    console.log("Starting to poll for 2FA status with token:", token);
    setPollingStatus("pending");
    pollingStartTimeRef.current = Date.now();
    statusCheckCountRef.current = 0;
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Check status immediately after a short delay
    setTimeout(() => {
      checkVerificationStatus();
    }, 3000);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Check if we've exceeded the max polling time
        if (Date.now() - pollingStartTimeRef.current > maxPollingTime) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError("2FA verification timed out. Please try again.");
          return;
        }
        
        // Increase the status check count
        statusCheckCountRef.current += 1;
        
        // Don't check if we're already checking
        if (checkingStatus) {
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
            code: "", // Empty code to just check status
            fnumber: savedIdentifier
          })
        });
        
        const data = await response.json();
        console.log("2FA status check response:", data);
        
        // Check for specific error conditions
        if (!response.ok && data.status_code === "001" && data.status_message && data.status_message.includes("User not found in LDAP")) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError("User not found in LDAP. Please check your credentials.");
          setShowVerification(false);
          return;
        }
        
        // Check for user not found in system
        if (response.ok && data.error && data.error.includes("User not found in system")) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError("User not found in system. Please contact administrator.");
          return;
        }
        
        // If verification was successful
        if (response.ok && data.success) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("success");
          
          // Process the successful verification
          setSessionToken(data.sessionToken);
          setBranches(data.branches || []);
          
          // Wait a moment to show success status before proceeding
          setTimeout(() => {
            if (data.branches && data.branches.length === 1) {
              // If only one branch, auto-select it and proceed to final login
              setSelectedBranch(data.branches[0].branchName);
              handleFinalLogin(data.fnumber || savedIdentifier, data.branches[0].branchName, data.sessionToken);
            } else if (data.branches && data.branches.length > 1) {
              // If multiple branches, show branch selection screen
              setShowVerification(false);
              setShowBranchSelection(true);
              setFetchingBranches(false);
            } else {
              setLocalError('No branches available for this user');
              setPollingStatus("failed");
            }
          }, 1500);
        }
        // If it's still pending, continue polling
        else if (statusCheckCountRef.current > 4) {
          // After several checks, show manual code option if not already shown
          setShowManualCodeEntry(true);
        }
        
      } catch (err) {
        console.error("Error polling for 2FA status:", err);
        // Don't stop polling on error - let the timeout handle it
      }
    }, 8000); // Check less frequently (every 8 seconds)
  };

  // Handle initial form submission for both admin and non-admin users
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    console.log("Initial login form submitted");
    setLocalError("");
    setLoadingSpinner(true);

    // Validate F-number length for non-admin users
    if (!identifier.includes('@') && identifier.length !== 8) {
      setLocalError("F number must be exactly 8 characters");
      setLoadingSpinner(false);
      return;
    }

    // Determine if this is an admin login or regular user
    const isAdmin = checkIfAdmin(identifier);
    setIsAdminUser(isAdmin);
    
    try {
      if (isAdmin) {
        // Admin authentication flow
        await handleAdminAuth(identifier, password);
      } else {
        // Regular user authentication flow (with 2FA)
        await handleRegularUserAuth(identifier, password);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
      setLoadingSpinner(false);
    }
  };

  // Handle admin authentication
  const handleAdminAuth = async (email, password) => {
    try {
      console.log("Using admin authentication flow");
      setLoadingSpinner(true);
      
      // Use a new endpoint specifically for admin credential verification
      const response = await fetch(`${AUTH_URL}/verify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Admin authentication failed. Please check your credentials.");
      }
      
      // Store admin token for use in final authentication
      setSessionToken(data.token || "");
      setSavedIdentifier(email);
      
      // Set branches from response if available
      if (data.branches && Array.isArray(data.branches)) {
        setBranches(data.branches);
        setFetchingBranches(false);
      }
      
      // Now show branch selection after successful authentication
      setShowBranchSelection(true);
      setLoadingSpinner(false);
      
    } catch (err) {
      console.error("Admin authentication error:", err);
      setLocalError(err.message || "Admin authentication failed. Please check your credentials.");
      setLoadingSpinner(false);
    }
  };

  // Handle regular user authentication (with 2FA)
  const handleRegularUserAuth = async (fnumber, password) => {
    try {
      console.log("Using regular user authentication flow with 2FA");
      
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
        // Check for specific error messages from the server
        if (data.status_code === "001" && data.status_message && data.status_message.includes("User not found in LDAP")) {
          throw new Error("User not found in LDAP. Please check your credentials.");
        }
        throw new Error(data.error || 'Authentication failed');
      }
      
      console.log("Authentication response:", data);
      
      setAuthToken(data.token);
      setSavedIdentifier(fnumber);
      
      // Reset state for the verification screen
      setShowVerifyButton(false);
      setShowManualCodeEntry(false);
      setVerificationCode("");
      setPollingStatus("pending");
      
      // Now show verification screen and start polling
      setShowVerification(true);
      startPollingFor2FA(data.token);
      
    } catch (err) {
      console.error("Regular user authentication error:", err);
      throw err; // Re-throw to be caught by the caller
    } finally {
      setLoadingSpinner(false);
    }
  };

  // Handle 2FA verification with code (for non-admin users)
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
          fnumber: savedIdentifier // Make sure to send the fnumber
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
      setPollingStatus("success");
      
      // Wait a moment to show success status before proceeding
      setTimeout(() => {
        if (data.branches && data.branches.length === 1) {
          // If only one branch, auto-select it and proceed to final login
          setSelectedBranch(data.branches[0].branchName);
          handleFinalLogin(data.fnumber || savedIdentifier, data.branches[0].branchName, data.sessionToken);
        } else if (data.branches && data.branches.length > 1) {
          // If multiple branches, show branch selection screen
          setShowVerification(false);
          setShowBranchSelection(true);
          setFetchingBranches(false);
        } else {
          throw new Error('No branches available for this user');
        }
      }, 1500);
      
    } catch (err) {
      console.error("2FA verification error:", err);
      setLocalError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  // Handle final login after branch selection
  const handleFinalLogin = async (identifier, branch, sessionToken) => {
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      console.log(`Finalizing login with branch: ${branch}`);
      
      const selectedBranchObj = branches.find(branchObj => branchObj.branchName === branch);
      const branchCode = selectedBranchObj ? selectedBranchObj.branchCode : '';
      
      // For admin users, make the final login call with the selected branch
      if (isAdminUser) {
        const response = await fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}` // Use the temp token for authorization
          },
          body: JSON.stringify({
            email: identifier,
            branch
          })
        });
        
        const data = await response.json();
        
        if (!response.ok || (data.success === false)) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Store user data
        const userData = {
          ...(data.user || {}),
          branchName: branch,
          branchCode: branchCode || (data.user ? data.user.branchCode : ''),
          role: 'admin'
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setManualLoginAttempt(true);
        const success = await login(
          identifier, 
          userData.branchCode, 
          data.token, 
          branch, 
          userData.role
        );
        
        if (!success) {
          setManualLoginAttempt(false);
          throw new Error("Login failed. Please try again.");
        }
      }
      // Regular user flow with the selected branch
      else {
        console.log("Finalizing regular user login with branch:", branch);
        
        const response = await fetch(`${API_URL}/users/finalize-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fnumber: identifier,
            branch,
            sessionToken
          })
        });
        
        const data = await response.json();
        
        if (!response.ok || (data.success === false)) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Store user data
        const userData = {
          ...(data.user || {}),
          branchName: branch,
          branchCode: branchCode || (data.user ? data.user.branchCode : ''),
          role: data.user ? data.user.role : 'user'
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setManualLoginAttempt(true);
        const success = await login(
          identifier, 
          userData.branchCode, 
          data.token, 
          branch, 
          userData.role
        );
        
        if (!success) {
          setManualLoginAttempt(false);
          throw new Error("Login failed. Please try again.");
        }
      }
      
    } catch (err) {
      console.error("Login finalization error:", err);
      setManualLoginAttempt(false);
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  // Cancel 2FA process and go back to login
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
              placeholder="F-Number or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
          
          {/* More prominent Verify button - appears sooner */}
          {showVerifyButton && pollingStatus === "pending" && (
            <button 
              className="verify-status-button" 
              onClick={checkVerificationStatus}
              disabled={checkingStatus}
            >
              {checkingStatus ? <span className="spinner"></span> : "Check Verification Status"}
            </button>
          )}
          
          {/* Optional manual code entry - hidden by default but can appear after multiple failed checks */}
          {showManualCodeEntry && (
            <div className="manual-code-option">
              <p className="manual-code-hint">If you're having trouble with automatic verification:</p>
              <form onSubmit={handleVerify2FA}>
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                
                <button type="submit" className="login-button" disabled={loading || loadingSpinner || pollingStatus === "success"}>
                  {loadingSpinner ? <span className="spinner"></span> : "Verify with Code"}
                </button>
              </form>
            </div>
          )}
          
          {displayError && <p className="error-message">{displayError}</p>}
          
          <button 
            className="back-button" 
            onClick={cancelAuth}
            disabled={loadingSpinner || checkingStatus}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Branch selection form (for both admin and non-admin users)
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
                <option key={branch.branchCode || branch.branchName} value={branch.branchName}>
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