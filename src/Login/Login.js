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
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [savedIdentifier, setSavedIdentifier] = useState(""); 
  const [authToken, setAuthToken] = useState("");
  const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Additional state for verification screen
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const pollingIntervalRef = useRef(null);
  const maxPollingTime = 120000; // 2 minutes
  const pollingStartTimeRef = useRef(null);

  const { login, loading, error, setError, authenticated } = useVisitor();

  // API URLs
  const API_URL = "http://localhost:5001";
  const BRANCHES_URL = "http://localhost:5001/visitors/index";
  const AUTH_URL = "http://localhost:5001/auth";

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
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

  // Set a timeout to show the Continue button after 20 seconds
  useEffect(() => {
    if (pollingStatus === "pending" && showVerification) {
      const timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 20000); // 20 seconds
      
      return () => clearTimeout(timer);
    }
  }, [pollingStatus, showVerification]);

  // Check if a user is admin based on their identifier
  const checkIfAdmin = (identifier) => {
    return identifier.includes('@') && !identifier.startsWith('F');
  };

  // Start polling for 2FA status (for non-admin users)
  // Improved startPollingFor2FA function that tracks API status codes and messages
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
          setLocalError("Authentication request timed out. Please try again.");
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
            code: "" // Empty code to just check status
          })
        });
        
        const data = await response.json();
        console.log("2FA status check response:", data);
        
        // Check status codes from API response
        if (data.status_code === "000" && data.status_message.includes("Successful authentication")) {
          // Authentication was successful
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("success");
          
          // Process the user data from the payload if available
          if (data.data && data.data.payload) {
            try {
              // The payload might be a JSON string that needs parsing
              const payloadData = typeof data.data.payload === 'string' 
                ? JSON.parse(data.data.payload) 
                : data.data.payload;
              
              console.log("User data extracted from payload:", payloadData);
              // You can use this data if needed
            } catch (e) {
              console.warn("Could not parse payload data:", e);
            }
          }
          
          // Process the successful verification
          const sessionTokenValue = data.sessionToken || "";
          setSessionToken(sessionTokenValue);
          
          // Get branches from response or fetch them
          if (data.branches && Array.isArray(data.branches)) {
            setBranches(data.branches);
          } else {
            // Fetch branches if not provided in response
            fetchBranchesForUser(data.data.fnumber || savedIdentifier, sessionTokenValue);
          }
          
          // Show success message briefly before moving to branch selection
          setTimeout(() => {
            handleSuccessfulVerification(data);
          }, 1500); // Show success message for 1.5 seconds before moving on
        } 
        // Check for "Pending authentication" status
        else if (data.status_code === "002" && data.status_message.includes("Pending authentication")) {
          // Authentication is still pending, continue polling
          console.log("Authentication still pending, continuing to poll...");
          // Check if the status in data.data is anything other than "Pending"
          if (data.data && data.data.status && data.data.status !== "Pending") {
            console.log(`Status changed to: ${data.data.status}`);
            if (data.data.status === "Success") {
              // Some APIs might report success here but not in the top-level status code
              clearInterval(pollingIntervalRef.current);
              setPollingStatus("success");
              
              setTimeout(() => {
                fetchUserBranchesAndProceed(data.data.fnumber || savedIdentifier, token);
              }, 1500);
            } else if (data.data.status === "Failed" || data.data.status === "Rejected") {
              clearInterval(pollingIntervalRef.current);
              setPollingStatus("failed");
              setLocalError("Authentication was rejected or failed. Please try again.");
            }
          }
        }
        // Check for user not found in LDAP
        else if (data.status_code === "001" && data.status_message.includes("User not found in LDAP")) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError("User not found in LDAP. Please check your credentials.");
          setShowVerification(false); // Go back to login form
        }
        // Handle user not found in system after successful authentication
        else if (data.status_message && data.status_message.includes("User not found in system")) {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError("User successfully authenticated but not registered in the system. Please contact an administrator.");
        }
        // General error case
        else if (data.status_code && data.status_code !== "000" && data.status_code !== "002") {
          clearInterval(pollingIntervalRef.current);
          setPollingStatus("failed");
          setLocalError(data.status_message || "Authentication failed. Please try again.");
        }
        // If we get an unexpected response format
        else if (!response.ok) {
          console.warn("Unexpected API response format:", data);
          // Don't stop polling on unexpected format, just log warning
        }
        
      } catch (err) {
        console.error("Error polling for 2FA status:", err);
        // Don't stop polling on network error - let the timeout handle it
      }
    }, 2000); // Check every 2 seconds (reduced from 3 to be more responsive)
  };

  // Helper function to handle successful verification flow
  const handleSuccessfulVerification = (data) => {
    // Extract user identifier 
    const userIdentifier = data.data && data.data.fnumber 
      ? data.data.fnumber 
      : savedIdentifier;
    
    // If branches were already fetched or provided
    if (branches && branches.length > 0) {
      if (branches.length === 1) {
        // If only one branch, auto-select it and proceed to final login
        setSelectedBranch(branches[0].branchName);
        handleFinalLogin(userIdentifier, branches[0].branchName, sessionToken);
      } else {
        // If multiple branches, show branch selection screen
        setShowVerification(false);
        setShowBranchSelection(true);
        setFetchingBranches(false);
      }
    } else {
      // No branches available error
      setLocalError('No branches available for this user');
      setPollingStatus("failed");
    }
  };

  // Helper function to fetch branches for a user and proceed with login flow
  const fetchBranchesForUser = async (fnumber, token) => {
    try {
      setFetchingBranches(true);
      
      // Fetch branches for this specific user
      const response = await fetch(`${API_URL}/users/branches/${fnumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user branches');
      }
      
      const userBranches = data.branches || [];
      setBranches(userBranches);
      
      if (userBranches.length === 1) {
        // If only one branch, auto-select it and proceed to final login
        setSelectedBranch(userBranches[0].branchName);
        handleFinalLogin(fnumber, userBranches[0].branchName, token);
      } else if (userBranches.length > 1) {
        // If multiple branches, show branch selection screen
        setShowVerification(false);
        setShowBranchSelection(true);
      } else {
        setLocalError('No branches available for this user');
        setPollingStatus("failed");
      }
      
    } catch (err) {
      console.error("Error fetching user branches:", err);
      setLocalError("Error retrieving user branches. Please try again.");
      setPollingStatus("failed");
    } finally {
      setFetchingBranches(false);
    }
  };

  // Helper function to fetch user branches and proceed (when status is success in data.data but not top level)
  const fetchUserBranchesAndProceed = async (fnumber, authToken) => {
    try {
      // Get session token first if needed
      const tokenResponse = await fetch(`${API_URL}/users/get-session-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          fnumber: fnumber
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok || !tokenData.success) {
        throw new Error(tokenData.error || 'Failed to get session token');
      }
      
      const newSessionToken = tokenData.sessionToken;
      setSessionToken(newSessionToken);
      
      // Now fetch branches for this user
      await fetchBranchesForUser(fnumber, newSessionToken);
      
    } catch (err) {
      console.error("Error in branch fetching flow:", err);
      setLocalError("Error completing authentication. Please try again.");
      setPollingStatus("failed");
    }
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
        if (data.status_code === "001" && data.status_message.includes("User not found in LDAP")) {
          throw new Error("User not found in LDAP. Please check your credentials.");
        }
        throw new Error(data.error || 'Authentication failed');
      }
      
      console.log("Authentication response:", data);
      
      setAuthToken(data.token);
      setSavedIdentifier(fnumber);
      
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

  // Handle final login with selected branch
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
            password: password, // You might want to remove this for security if using the token
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
      // Regular user final login flow
      else {
        // Implement your regular user final login flow here
        console.log("Finalizing regular user login");
        
        const response = await fetch(`${API_URL}/users/finalize-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify({
            fnumber: identifier,
            branch: branch
          })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Store user data
        const userData = {
          ...(data.user || {}),
          branchName: branch,
          branchCode: branchCode || (data.user ? data.user.branchCode : ''),
          role: 'user'
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

  // Handle branch selection for both admin and non-admin users
  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    console.log("Branch selection form submitted");
    
    if (!selectedBranch) {
      setLocalError("Please select a branch");
      return;
    }
    
    await handleFinalLogin(savedIdentifier, selectedBranch, sessionToken);
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
  
  // Handle continue button click for verification
  const handleContinue = async () => {
    setCheckingStatus(true);
    
    try {
      // Check the current verification status
      const response = await fetch(`${API_URL}/users/verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          code: "" // Empty code to just check status
        })
      });
      
      const data = await response.json();
      console.log("Manual verification status check:", data);
      
      // If verification was successful
      if (data.status_code === "000" && data.status_message.includes("Successful authentication")) {
        setPollingStatus("success");
        
        // Process the successful verification
        const sessionTokenValue = data.sessionToken || "";
        setSessionToken(sessionTokenValue);
        
        // Get branches from response or fetch them
        if (data.branches && Array.isArray(data.branches)) {
          setBranches(data.branches);
        } else {
          // Fetch branches if not provided in response
          fetchBranchesForUser(data.data?.fnumber || savedIdentifier, sessionTokenValue);
        }
        
        // Show success message briefly before moving to branch selection
        setTimeout(() => {
          handleSuccessfulVerification(data);
        }, 1500);
      } 
      // If verification is still pending, go back to waiting
      else if (data.status_code === "002" && data.status_message.includes("Pending authentication")) {
        setCheckingStatus(false);
        // Continue waiting - keep polling active
      }
      // If verification failed for any reason
      else {
        setCheckingStatus(false);
        setPollingStatus("failed");
        setLocalError(data.status_message || "Verification check failed. Please try again.");
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
      setCheckingStatus(false);
      setLocalError("Failed to check verification status. Please try again.");
    }
  };
  
  const displayError = error || localError;

  // Render verification screen component
  const verificationScreenContent = (
    <div className="login-container verification-bg">
      <div className="verification-overlay">
        <div className="verification-modal">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          
          {pollingStatus === "pending" && (
            <>
              <h2>Authentication Request</h2>
              <div className="verification-status">
                <div className="verification-spinner"></div>
                <h3>Approve on your device</h3>
                <p>We've sent an authentication request to your mobile device.</p>
                <p>Please approve it to continue.</p>
                <div className="verification-timer">
                  <div className="timer-bar"></div>
                </div>
              </div>
              
              {/* Show Continue button after 20 seconds */}
              {showContinueButton && !checkingStatus && (
                <button 
                  className="continue-button" 
                  onClick={handleContinue}
                  disabled={loadingSpinner}
                >
                  Continue
                </button>
              )}
              
              {/* Show loading spinner when checking status */}
              {checkingStatus && (
                <div className="checking-status">
                  <span className="spinner"></span>
                  <p>Checking verification status...</p>
                </div>
              )}
              
              <button 
                className="cancel-button" 
                onClick={cancelAuth}
                disabled={loadingSpinner || checkingStatus}
              >
                Cancel
              </button>
            </>
          )}
          
          {pollingStatus === "success" && (
            <>
              <h2>Authentication Successful</h2>
              <div className="verification-status success-status">
                <div className="verification-success">
                  <span className="success-icon">✓</span>
                </div>
                <h3>Approved!</h3>
                <p>Authentication successful.</p>
                <p className="loading-text">Preparing your account<span className="dot-animation">...</span></p>
              </div>
            </>
          )}
          
          {pollingStatus === "failed" && (
            <>
              <h2>Authentication Failed</h2>
              <div className="verification-status error-status">
                <div className="verification-failed">
                  <span className="failed-icon">✗</span>
                </div>
                <h3>Unable to authenticate</h3>
                <p>{displayError || "Please try again."}</p>
              </div>
              <button 
                className="retry-button" 
                onClick={cancelAuth}
                disabled={loadingSpinner}
              >
                Try Again
              </button>
            </>
          )}
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
              <small>Status: {pollingStatus}</small>
              <small>Timer: {showContinueButton ? "Continue available" : "Waiting..."}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
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
  
  // Show verification screen if needed
  if (showVerification) {
    return verificationScreenContent;
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