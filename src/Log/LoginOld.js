
// old login

// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [fnumber, setFnumber] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
//   const [loadingSpinner, setLoadingSpinner] = useState(false);
  
//   const [showVerification, setShowVerification] = useState(false);
//   const [verificationCode, setVerificationCode] = useState("");
//   const [showBranchSelection, setShowBranchSelection] = useState(false);
//   const [sessionToken, setSessionToken] = useState("");
//   const [savedfnumber, setSavedFnumber] = useState(""); 
//   const [authToken, setAuthToken] = useState("");
//   const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed

//   const pollingIntervalRef = useRef(null);
//   const maxPollingTime = 120000; // 2 minutes
//   const pollingStartTimeRef = useRef(null);

//   const { login, loading, error, setError, authenticated } = useVisitor();

//   const API_URL = "http://localhost:5001";

//   useEffect(() => {
//     // Cleanup polling on unmount
//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (authenticated && fnumber && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       setTimeout(() => { 
//         onLogin(fnumber);
//         setManualLoginAttempt(false);
//       }, 1000); 
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, fnumber, onLogin, manualLoginAttempt]);

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
//             await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
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
//         // If we got an error, don't stop polling - let the timeout handle it
        
//       } catch (err) {
//         console.error("Error polling for 2FA status:", err);
//         // Don't stop polling on error - let the timeout handle it
//       }
//     }, 3000); // Check every 3 seconds
//   };

//   const handleInitialSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Initial login form submitted");
//     setLocalError("");
//     setLoadingSpinner(true);

//     if (fnumber.length > 25) {
//       setLocalError("F number is incorrect");
//       setLoadingSpinner(false);
//       return;
//     }

//     try {
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
//         throw new Error(data.error || 'Authentication failed');
//       }
      
//       console.log("Authentication response:", data);
      
//       setAuthToken(data.token);
//       setSavedFnumber(fnumber);
      
//       // Now show verification screen and start polling
//       setShowVerification(true);
//       startPollingFor2FA(data.token);
      
//     } catch (err) {
//       console.error("Authentication error:", err);
//       setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
//     } finally {
//       setLoadingSpinner(false);
//     }
//   };

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
//           fnumber: savedfnumber // Make sure to send the fnumber
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
//         await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
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

//   const handleBranchSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Branch selection form submitted");
    
//     if (!selectedBranch) {
//       setLocalError("Please select a branch");
//       return;
//     }
    
//     await handleFinalLogin(savedfnumber, selectedBranch, sessionToken);
//   };

//   const handleFinalLogin = async (fnumber, branch, sessionToken) => {
//     setLocalError("");
//     setLoadingSpinner(true);
    
//     try {
//       console.log(`Finalizing login with branch: ${branch}`);
      
//       const response = await fetch(`${API_URL}/users/finalize-login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           fnumber,
//           branch,
//           sessionToken
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Login failed');
//       }
      
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify({
//         ...data.user,
//         branchName: data.user.branch,
//         branchCode: data.user.branchCode
//       }));
      
//       setManualLoginAttempt(true);
//       const success = await login(
//         fnumber, 
//         data.user.branchCode, 
//         data.token, 
//         data.user.branch, 
//         data.user.role
//       );
      
//       if (!success) {
//         setManualLoginAttempt(false);
//         throw new Error("Login failed. Please try again.");
//       }
      
//     } catch (err) {
//       console.error("Login finalization error:", err);
//       setManualLoginAttempt(false);
//       setLocalError(err.message || "An unexpected error occurred. Please try again.");
//     } finally {
//       setLoadingSpinner(false);
//     }
//   };

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
//               placeholder="F-Number"
//               value={fnumber}
//               onChange={(e) => setFnumber(e.target.value)}
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
  
//   // 2FA verification screen
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
  
//   // Branch selection form
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


// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [fnumber, setFnumber] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
//   const [loadingSpinner, setLoadingSpinner] = useState(false);
  
//   const [showVerification, setShowVerification] = useState(false);
//   const [verificationCode, setVerificationCode] = useState("");
//   const [showBranchSelection, setShowBranchSelection] = useState(false);
//   const [sessionToken, setSessionToken] = useState("");
//   const [savedfnumber, setSavedFnumber] = useState(""); 
//   const [authToken, setAuthToken] = useState("");

//   const { login, loading, error, setError, authenticated } = useVisitor();

//   const API_URL = "http://localhost:5001";

//   useEffect(() => {
//     if (authenticated && fnumber && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       setTimeout(() => { 
//         onLogin(fnumber);
//         setManualLoginAttempt(false);
//       }, 1000); 
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, fnumber, onLogin, manualLoginAttempt]);

//   const handleInitialSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Initial login form submitted");
//     setLocalError("");
//     setLoadingSpinner(true);

//     if (fnumber.length > 25) {
//       setLocalError("F number is incorrect");
//       setLoadingSpinner(false);
//       return;
//     }

//     try {
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
//         throw new Error(data.error || 'Authentication failed');
//       }
      
//       console.log("Authentication response:", data);
      
//       setAuthToken(data.token);
//       setSavedFnumber(fnumber);
      
//       // Now show verification screen
//       setShowVerification(true);
      
//     } catch (err) {
//       console.error("Authentication error:", err);
//       setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
//     } finally {
//       setLoadingSpinner(false);
//     }
//   };

//   const handleVerify2FA = async (e) => {
//     e.preventDefault();
//     setLocalError("");
//     setLoadingSpinner(true);
    
//     try {
//       // Call the verify2FA endpoint directly - no polling needed
//       const response = await fetch(`${API_URL}/users/verify2fa`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           token: authToken,
//           code: verificationCode
//         })
//       });
      
//       const data = await response.json();
//       console.log("2FA verification response:", data);
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Verification failed');
//       }
      
//       // If we got success, process the response
//       setSessionToken(data.sessionToken);
//       setBranches(data.branches || []);
      
//       if (data.branches && data.branches.length === 1) {
//         // If only one branch, auto-select it and proceed to final login
//         setSelectedBranch(data.branches[0].branchName);
//         await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
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

//   const handleBranchSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Branch selection form submitted");
    
//     if (!selectedBranch) {
//       setLocalError("Please select a branch");
//       return;
//     }
    
//     await handleFinalLogin(savedfnumber, selectedBranch, sessionToken);
//   };

//   const handleFinalLogin = async (fnumber, branch, sessionToken) => {
//     setLocalError("");
//     setLoadingSpinner(true);
    
//     try {
//       console.log(`Finalizing login with branch: ${branch}`);
      
//       const response = await fetch(`${API_URL}/users/finalize-login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           fnumber,
//           branch,
//           sessionToken
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Login failed');
//       }
      
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify({
//         ...data.user,
//         branchName: data.user.branch,
//         branchCode: data.user.branchCode
//       }));
      
//       setManualLoginAttempt(true);
//       const success = await login(
//         fnumber, 
//         data.user.branchCode, 
//         data.token, 
//         data.user.branch, 
//         data.user.role
//       );
      
//       if (!success) {
//         setManualLoginAttempt(false);
//         throw new Error("Login failed. Please try again.");
//       }
      
//     } catch (err) {
//       console.error("Login finalization error:", err);
//       setManualLoginAttempt(false);
//       setLocalError(err.message || "An unexpected error occurred. Please try again.");
//     } finally {
//       setLoadingSpinner(false);
//     }
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
//               placeholder="F-Number"
//               value={fnumber}
//               onChange={(e) => setFnumber(e.target.value)}
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
  
//   // 2FA verification screen
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
//               <div className="pending-status">Waiting for approval on your phone...</div>
//             </div>
//           </div>
          
//           <form onSubmit={handleVerify2FA}>
//             <input
//               type="text"
//               placeholder="Enter verification code (optional)"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//             />
            
//             {displayError && <p className="error-message">{displayError}</p>}
            
//             <button type="submit" className="login-button" disabled={loading || loadingSpinner}>
//               {loadingSpinner ? <span className="spinner"></span> : "Verify"}
//             </button>
//           </form>
          
//           <button 
//             className="back-button" 
//             onClick={() => {
//               setShowVerification(false);
//             }}
//             disabled={loadingSpinner}
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   // Branch selection form
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




// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(true);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
//   const [loadingSpinner, setLoadingSpinner] = useState(false); // New state for loading spinner

//   const { login, loading, error, setError, authenticated } = useVisitor();

  
//   // const API_URL = "http://localhost:5001/visitors";
//   const BRANCHES_URL = "http://localhost:5001/visitors/index";
//   const AUTH_URL = "http://localhost:5001/auth";

//   useEffect(() => {
//     if (authenticated && email && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       setTimeout(() => { 
//         onLogin(email);
//         setManualLoginAttempt(false);
//       }, 30000);
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, email, onLogin, manualLoginAttempt]);

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

//     fetchBranches();
//   }, [BRANCHES_URL, setError]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Login form submitted");
//     setLocalError("");

//     if (email.length > 25) {
//       setLocalError("F number is incorrect");
//       return;
//     }

//     if (!selectedBranch) {
//       setLocalError("Please select a branch");
//       return;
//     }
    
//     const selectedBranchObj = branches.find(branch => branch.branchName === selectedBranch);
    
//     if (!selectedBranchObj) {
//       setLocalError("Invalid branch selection");
//       return;
//     }
    
//     const branchCode = selectedBranchObj.branchCode;
//     console.log(`Selected branch: ${selectedBranch} (code: ${branchCode})`);

//     try {
//       console.log("Login validation passed, setting manual login attempt flag");
//       setManualLoginAttempt(true);
//       setLoadingSpinner(true); // Show loading spinner
      
//       console.log("Attempting login with:", { email, branch: branchCode });
      
//       const response = await fetch(`${AUTH_URL}/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           password,
//           branch: selectedBranch
//         })
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Login failed');
//       }
      
//       const data = await response.json();
      
//       // Extract user role from response or set a default
//       const userRole = data.user && data.user.role ? data.user.role : "user";
      
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('user', JSON.stringify({
//         ...data.user,
//         branchName: selectedBranch,  // Store both branch code and name
//         branchCode: branchCode,
//         role: userRole
//       }));
      
//       // Pass role to login function
//       const success = await login(email, branchCode, data.token, selectedBranch, userRole);
      
//       console.log("Login result:", success);
      
//       if (!success) {
//         console.log("Login failed, resetting manual login attempt flag");
//         setManualLoginAttempt(false);
//         setLocalError("Login failed. Please check your credentials and try again.");
//         setLoadingSpinner(false); // Hide loading spinner
//       }
//     } catch (err) {
//       console.error("Login submission error:", err);
//       setManualLoginAttempt(false);
//       setLocalError(err.message || "An unexpected error occurred. Please try again.");
//       setLoadingSpinner(false); // Hide loading spinner
//     }
//   };
  
//   const displayError = error || localError;

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Welcome to FNB Admin</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             maxLength={25}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
          
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
//           <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
//             {loadingSpinner ? <span className="spinner"></span> : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

// original code
// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(true);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  
//   const { login, loading, error, setError, authenticated } = useVisitor();

//   // Updated API URLs
//   const API_URL = "http://localhost:5001/visitors";
//   const BRANCHES_URL = "http://localhost:5001/visitors/index";
//   const AUTH_URL = "http://localhost:5001/auth";

//   useEffect(() => {
//     if (authenticated && email && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       onLogin(email);
//       setManualLoginAttempt(false);
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, email, onLogin, manualLoginAttempt]);

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
        
//         // Store branches with their names and codes
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

//     fetchBranches();
//   }, [BRANCHES_URL, setError]);
// // Update the login form submission to include the role
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   console.log("Login form submitted");
//   setLocalError("");

//   if (email.length > 25) {
//     setLocalError("F number is incorrect");
//     return;
//   }

//   if (!selectedBranch) {
//     setLocalError("Please select a branch");
//     return;
//   }
  
//   // Find the selected branch code from the branches array
//   const selectedBranchObj = branches.find(branch => branch.branchName === selectedBranch);
  
//   if (!selectedBranchObj) {
//     setLocalError("Invalid branch selection");
//     return;
//   }
  
//   const branchCode = selectedBranchObj.branchCode;
//   console.log(`Selected branch: ${selectedBranch} (code: ${branchCode})`);

//   try {
//     console.log("Login validation passed, setting manual login attempt flag");
//     setManualLoginAttempt(true);
    
//     console.log("Attempting login with:", { email, branch: branchCode });
    
//     const response = await fetch(`${AUTH_URL}/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         password,
//         branch: selectedBranch
//       })
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Login failed');
//     }
    
//     const data = await response.json();
    
//     // Extract user role from response or set a default
//     const userRole = data.user && data.user.role ? data.user.role : "user";
    
//     localStorage.setItem('token', data.token);
//     localStorage.setItem('user', JSON.stringify({
//       ...data.user,
//       branchName: selectedBranch,  // Store both branch code and name
//       branchCode: branchCode,
//       role: userRole
//     }));
    
//     // Pass role to login function
//     const success = await login(email, branchCode, data.token, selectedBranch, userRole);
    
//     console.log("Login result:", success);
    
//     if (!success) {
//       console.log("Login failed, resetting manual login attempt flag");
//       setManualLoginAttempt(false);
//       setLocalError("Login failed. Please check your credentials and try again.");
//     }
//   } catch (err) {
//     console.error("Login submission error:", err);
//     setManualLoginAttempt(false);
//     setLocalError(err.message || "An unexpected error occurred. Please try again.");
//   }
// };
  
//   const displayError = error || localError;

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Welcome to FNB Admin</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             maxLength={25}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
          
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
//           <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
//             {loading ? <span className="spinner"></span> : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;



// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(false);
//   const [localError, setLocalError] = useState("");
//   const [loginStage, setLoginStage] = useState("credentials");

//   const { login, loading, error, setError, authenticated, token } = useVisitor();

//   const AUTH_URL = "http://localhost:5001/auth";

//   // Fetch branches after successful authentication
//   const fetchBranches = async () => {
//     try {
//       setFetchingBranches(true);
//       const response = await fetch(`${AUTH_URL}/branches`, {
//         method: 'GET',
//         headers: {
//           'x-auth-token': token,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch branches: ${response.status}`);
//       }

//       const data = await response.json();
//       const uniqueBranches = [...new Set(data.branches)].filter(branch => branch).sort();
      
//       if (uniqueBranches.length === 0) {
//         throw new Error("No branches available");
//       }
      
//       setBranches(uniqueBranches);
//       setSelectedBranch(uniqueBranches[0]); 
//       setLoginStage("branch-selection");
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//       setLocalError(err.message || "Failed to load branches. Please try again.");
//     } finally {
//       setFetchingBranches(false);
//     }
//   };

//   const handleCredentialsSubmit = async (e) => {
//     e.preventDefault();
//     setLocalError("");

//     try {
//       const success = await login(email, password);
      
//       if (success) {
//         // If login is successful, proceed to fetch branches
//         fetchBranches();
//       } else {
//         setLocalError("Login failed. Please check your credentials.");
//       }
//     } catch (err) {
//       setLocalError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleBranchSelection = async (e) => {
//     e.preventDefault();

//     try {
//       // Update user's branch context
//       const branchSuccess = await login(email, selectedBranch, token);
      
//       if (branchSuccess) {
//         onLogin(email, selectedBranch);
//       } else {
//         setLocalError("Failed to set branch. Please try again.");
//       }
//     } catch (err) {
//       setLocalError(err.message || "An unexpected error occurred");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Welcome to FNB Admin</h2>

//         {loginStage === "credentials" && (
//           <form onSubmit={handleCredentialsSubmit}>
//             <input
//               type="text"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
            
//             {localError && <p className="error-message">{localError}</p>}
            
//             <button 
//               type="submit" 
//               className="login-button" 
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         )}

//         {loginStage === "branch-selection" && (
//           <form onSubmit={handleBranchSelection}>
//             <div className="select-container">
//               <select
//                 value={selectedBranch}
//                 onChange={(e) => setSelectedBranch(e.target.value)}
//                 required
//                 disabled={fetchingBranches}
//                 className="branch-select"
//               >
//                 <option value="">Select Branch</option>
//                 {branches.map((branch) => (
//                   <option key={branch} value={branch}>
//                     {branch}
//                   </option>
//                 ))}
//               </select>
//               {fetchingBranches && (
//                 <span className="select-spinner"></span>
//               )}
//             </div>

//             {localError && <p className="error-message">{localError}</p>}
            
//             <button 
//               type="submit" 
//               className="login-button" 
//               disabled={loading || fetchingBranches}
//             >
//               {loading ? "Processing..." : "Select Branch"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;


// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";
// import "../login.css";

// const Login = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [fetchingBranches, setFetchingBranches] = useState(true);
//   const [localError, setLocalError] = useState("");
//   const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  
//   // Use the visitor context
//   const { login, loading, error, setError, authenticated } = useVisitor();

//   const API_URL = "http://localhost:5001/visitors";

//   // Modified useEffect to prevent automatic login
//   useEffect(() => {
//     // Only perform automatic login if it was triggered by a manual login attempt
//     if (authenticated && email && manualLoginAttempt) {
//       console.log("Authentication successful after manual login attempt, navigating to dashboard");
//       onLogin(email);
//       // Reset the flag after login
//       setManualLoginAttempt(false);
//     } else if (authenticated) {
//       console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
//     }
//   }, [authenticated, email, onLogin, manualLoginAttempt]);

//   // Fetch all branches from the API
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         setFetchingBranches(true);
//         console.log("Fetching branches from:", API_URL);
//         const response = await fetch(API_URL);
        
//         if (!response.ok) {
//           throw new Error(`API response error: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log(`Received ${data.length} entries from API`);
        
//         // Extract unique branch names (handle both branchname and branch)
//         const uniqueBranches = [...new Set(data
//           .map(entry => entry.branchname )
//           .filter(branch => branch && branch.trim() !== "")
//         )];
        
//         console.log(`Found ${uniqueBranches.length} unique branches`);
//         setBranches(uniqueBranches.sort());
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setLocalError("Failed to load branches. Please try again later.");
//       } finally {
//         setFetchingBranches(false);
//       }
//     };

//     fetchBranches();
//   }, [API_URL, setError]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Login form submitted");
//     setLocalError("");
  
//     if (email.length > 25) {
//       setLocalError("F number is incorrect");
//       return;
//     }
  
//     if (!selectedBranch) {
//       setLocalError("Please select a branch");
//       return;
//     }
  
//     try {
//       console.log("Login validation passed, setting manual login attempt flag");
//       // Set flag to indicate this is a manual login attempt
//       setManualLoginAttempt(true);
      
//       console.log("Attempting login with:", { email, branch: selectedBranch });
      
//       // Call the login function from the context
//       const success = await login(email, selectedBranch);
      
//       console.log("Login result:", success);
      
//       if (!success) {
//         console.log("Login failed, resetting manual login attempt flag");
//         setManualLoginAttempt(false);
//         setLocalError("Login failed. Please check your credentials and try again.");
//       }
//     } catch (err) {
//       console.error("Login submission error:", err);
//       setManualLoginAttempt(false);
//       setLocalError("An unexpected error occurred. Please try again.");
//     }
//   };

//   // Display the context error or local error
//   const displayError = error || localError;

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//         <h2>Welcome to FNB Admin</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             maxLength={25}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
          
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
//                 <option key={branch} value={branch}>
//                   {branch}
//                 </option>
//               ))}
//             </select>
//             {fetchingBranches && (
//               <span className="select-spinner"></span>
//             )}
//           </div>
          
//           {displayError && <p className="error-message">{displayError}</p>}
//           <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
//             {loading ? <span className="spinner"></span> : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

// visitor route

const express = require('express');
const router = express.Router();
const visitorsController = require('../controllers/visitorsLogsController');
router.get('/visitors/api/check-telephone/:telephone', visitorsController.checkTelephoneExists);
router.get('/visitors/api/index', visitorsController.getAllBranches);
router.get('/visitors/api/index/branch', visitorsController.getVisitorLogsByBranchCode);
router.get('/visitors/api', visitorsController.getAllVisitorLogs);
router.get('/visitors/api/by-phone', visitorsController.getVisitorLogsByPhoneNumber);
router.get('/visitors/api/:id', visitorsController.getVisitorLogById);
router.post('/visitors/api/', visitorsController.createVisitorLog);
router.put('/visitors/api/:id', visitorsController.updateVisitorLog);
router.delete('/visitors/api/:id', visitorsController.deleteVisitorLog);

module.exports = router;


// users router

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Users Controller')
const authMiddleware = require('../middleware/auth'); 


router.post('/users/api/verify-fnumber', authMiddleware, usersController.verifyFnumber);
router.post('/users/api', authMiddleware, usersController.createUser);
router.post('/users/api/authenticate', usersController.authenticateUser);
router.post('/users/api/verify2fa', usersController.verify2FA);
router.post('/users/api/finalize-login', usersController.finalizeLogin);
router.post('/users/api/checkUserBranches', usersController.checkUserBranches);
router.post('/users/api/track2FAStatus', usersController.track2FAStatus);




router.get('/users/api', authMiddleware, usersController.getAllUsers);


router.put('/users/api/:id', authMiddleware, usersController.updateUser);


router.delete('/users/api/:id', authMiddleware, usersController.deleteUser);

module.exports = router;

// auth route

//route for auth
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/api/login', authController.login);
router.post('/auth/api/register', authController.registerUser);
router.post('/auth/api/verify', authController.verifyToken);
router.post('/auth/api/verify-admin', authController.verifyAdminCredentials);

module.exports = router

// log
2025-05-08T16:00:21.280Z - GET /visitors/api/index
Route not found: GET /visitors/api/index
2025-05-08T16:00:21.290Z - GET /visitors/api/index
Route not found: GET /visitors/api/index
2025-05-08T16:05:59.271Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:06:03.543Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:06:03.546Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:06:09.176Z - POST /users/auth/verify-admin
Route not found: POST /users/auth/verify-admin
2025-05-08T16:40:17.853Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:40:17.858Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:40:20.880Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:40:20.884Z - GET /visitors/api/index/branch
Route not found: GET /visitors/api/index/branch
2025-05-08T16:40:25.144Z - POST /users/auth/verify-admin
Route not found: POST /users/auth/verify-admin

