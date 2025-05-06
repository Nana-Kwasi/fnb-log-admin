
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

// auth controller

const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';


const login = async (req, res) => {
  const { email, password, branch } = req.body;

  try {
    console.log(`Login attempt: ${email} for branch ${branch}`);

    if (!email || !password || !branch) {
      return res.status(400).json({ error: 'Email, password, and branch are required' });
    }

    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    let user = adminResult.rows[0];
    let userTable = 'admin_users';

    if (!user) {
      const userResult = await pool.query(
        'SELECT * FROM users_table WHERE email = $1',
        [email]
      );
      user = userResult.rows[0];
      userTable = 'users_table';
    }

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const branchesKey = userTable === 'admin_users' ? 'branches' : 'branch';
    const userBranches = userTable === 'admin_users' ? user[branchesKey] : [user[branchesKey]];

    if (!userBranches.includes(branch)) {
      console.log(`User ${email} attempted to access unauthorized branch: ${branch}`);
      return res.status(403).json({ error: 'You do not have access to this branch' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user_id: user.id,
      email: user.email,
      branch: branch,
      role: user.role || 'user',
      user_table: userTable
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: branch,
        role: user.role || 'user',
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};


const registerUser = async (req, res) => {
  const { email, password, branches, role } = req.body;

  try {
   
    
    
    if (!email || !password || !branches || !Array.isArray(branches)) {
      return res.status(400).json({ error: 'Email, password, and branches array are required' });
    }

   
    const checkUser = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const result = await pool.query(
      'INSERT INTO admin_users (email, password, branches, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role, created_at',
      [email, hashedPassword, branches, role || 'user']
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};


const verifyToken = (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
// 1. Create a new backend endpoint for admin verification only

// In your authController.js
const verifyAdminCredentials = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Verify admin credentials
    const adminResult = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    const user = adminResult.rows[0];

    if (!user) {
      console.log(`Admin not found: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Invalid password for admin: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Get available branches for this admin
    const branches = user.branches || [];
    
    // Generate a temporary token for branch selection
    const tempToken = jwt.sign({ 
      user_id: user.id,
      email: user.email,
      role: user.role || 'admin',
      temp: true // Flag to indicate this is a temporary token
    }, JWT_SECRET, { expiresIn: '5m' });

    // Return success with available branches and temporary token
    return res.json({
      success: true,
      token: tempToken,
      branches: branches.map(branch => ({ branchName: branch, branchCode: branch })) // Format branches like your API
    });

  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};

module.exports = {
  login,
  registerUser,
  verifyToken,
  verifyAdminCredentials
};

// server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const visitorsRouter = require('./route/visitors');
const authRouter = require('./route/auth'); 
const usersRouter = require('./route/users')
// const cron = require('node-cron');

const app = express();

// CORS configuration
app.use(cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' })); 
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount the routers
app.use('/visitors', visitorsRouter);
app.use('/auth', authRouter); // Mount the auth router at /auth
app.use('/users', usersRouter)

// Catch-all 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});



const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Auth endpoints available at: http://localhost:${PORT}/auth/login`);
});

// users controller


const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'your-secret-key-should-be-in-env-file';
const LDAP_AUTH_URL = "https://172.29.18.126/adproxyservice/prod/ldap/authenticate";
const LDAP_VERIFY_2FA_URL = "https://172.29.18.126/adproxyservice/prod/ldap/verify2fa";
const TOKEN_URL = 'https://172.29.18.126/adproxyservice/prod/client/renew-token';
const CLIENT_ID = "8CA09F75-720F-4641-9B70-5344850DF34E";

const getAuthToken = async () => {
  try {
    console.log('Requesting token from:', TOKEN_URL);
    
    const tokenResponse = await axios.post(TOKEN_URL, {
      clientId: CLIENT_ID,
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      throw new Error(`Failed to obtain authorization token: ${
        tokenResponse.data && tokenResponse.data.statusMessage 
          ? tokenResponse.data.statusMessage 
          : 'Unknown error'
      }`);
    }

    const rawToken = tokenResponse.data.data.token;
    return `Bearer ${rawToken}`;
  } catch (err) {
    console.error('Error getting auth token:', err.message);
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
};
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

const checkUserBranches = async (req, res) => {
  const { fnumber } = req.body;
  
  if (!fnumber) {
    return res.status(400).json({
      success: false,
      error: 'F-number is required'
    });
  }
  
  try {
    console.log(`[BRANCH] Checking branches for user: ${fnumber}`);
    
    // Convert to lowercase to match database format
    const lowerCaseFnumber = fnumber.toLowerCase();
    
    console.log(`[BRANCH] Querying database with value: ${lowerCaseFnumber}`);
    
    // Use the email column since that's where the F-number is stored
    const result = await pool.query(
      'SELECT id, email, branch, branch_code FROM users_table WHERE email = $1',
      [lowerCaseFnumber]
    );
    
    if (result.rows.length === 0) {
      console.log(`[BRANCH] User ${fnumber} not found in system`);
      return res.status(404).json({
        success: false,
        error: 'User not found in system. Please contact administrator.',
        userExists: false,
        fnumber
      });
    }
    
    // Format the branches for the response
    const branches = result.rows.map(row => ({
      branchName: row.branch,
      branchCode: row.branch_code
    }));
    
    console.log(`[BRANCH] User ${fnumber} has access to ${branches.length} branches:`,
      JSON.stringify(branches, null, 2));
    
    // Generate a session token if needed
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    return res.status(200).json({
      success: true,
      userExists: true,
      fnumber,
      branches,
      sessionToken // Include session token in response
    });
    
  } catch (err) {
    console.error('[BRANCH] Error checking user branches:', err.message);
    return res.status(500).json({
      success: false,
      error: `Server error during branch checking: ${err.message}`
    });
  }
};

const track2FAStatus = async (req, res) => {
  const { token, fnumber } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  try {
    console.log("[TRACK] Checking 2FA verification status for token:", 
      token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[TRACK] Successfully obtained token for status tracking');
    
    console.log('[TRACK] Sending status check to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: "" // Empty code to just check status
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[TRACK] Status response code:', verifyResponse.status);
    
    // Return just the status information, no database checks
    const statusCode = verifyResponse.data.status_code;
    const statusMessage = verifyResponse.data.status_message;
    const dataStatus = verifyResponse.data.data?.status;
    
    // Log the specific status information
    console.log(`[TRACK] Status code: ${statusCode}, Message: ${statusMessage}, Data status: ${dataStatus}`);
    
    // Determine verification status
    let verificationStatus = "pending";
    
    // Check if verification is successful
    if (statusCode === "000" || statusCode === "0" || statusCode === 0) {
      verificationStatus = "success";
    } 
    // Check if verification failed
    else if (statusCode !== "002" && statusMessage?.toLowerCase() !== "pending authentication") {
      verificationStatus = "failed";
    }
    
    // Get the fnumber from the response if available
    const responseFnumber = verifyResponse.data.data?.fnumber || fnumber;
    
    return res.status(200).json({
      success: true,
      statusCode,
      statusMessage,
      dataStatus,
      verificationStatus,
      fnumber: responseFnumber
    });
    
  } catch (err) {
    console.error('[TRACK] Status tracking error:', err.message);
    
    if (err.response) {
      console.error('[TRACK] Error response status:', err.response.status);
      console.error('[TRACK] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during status tracking: ${err.message}` 
    });
  }
};



const verify2FA = async (req, res) => {
  const { token, code, fnumber: requestFnumber } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    console.log("[2FA] Starting 2FA verification process");
    if (code) {
      console.log("[2FA] Verifying with code:", code);
    } else {
      console.log("[2FA] Checking 2FA status without code");
    }
    console.log("[2FA] Using token:", token.substring(0, 10) + "..." + token.substring(token.length - 10));
    
    const authToken = await getAuthToken();
    console.log('[2FA] Successfully obtained token for 2FA verification');
    
    console.log('[2FA] Sending verification request to LDAP service');
    const verifyResponse = await axios.post(LDAP_VERIFY_2FA_URL, {
      token,
      code: code || "" // Send empty string if no code provided
    }, { 
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });
    
    console.log('[2FA] Verify response status:', verifyResponse.status);
    console.log('[2FA] Verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    if (!verifyResponse.data || 
        (verifyResponse.data.status_code !== '000' && 
         verifyResponse.data.status_code !== '0' && 
         verifyResponse.data.status_code !== 0)) {
      console.error('[2FA] 2FA verification failed:', JSON.stringify(verifyResponse.data, null, 2));
      return res.status(401).json({ 
        success: false, 
        error: verifyResponse.data?.status_message || '2FA verification failed',
        data: verifyResponse.data 
      });
    }
    
    console.log('[2FA] 2FA verification successful');
    
    const fnumber = verifyResponse.data.fnumber || 
                   (verifyResponse.data.data && verifyResponse.data.data.fnumber) ||
                   requestFnumber;
                   
    if (!fnumber) {
      console.error('[2FA] No fnumber found in response or request');
      return res.status(400).json({
        success: false,
        error: 'Unable to identify user. Missing F-number in response.',
      });
    }
    
    console.log(`[2FA] User identified as: ${fnumber}`);
    
    // Generate a session token
    const sessionToken = jwt.sign(
      { 
        fnumber: fnumber
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    console.log(`[2FA] Session token generated for user: ${fnumber}`);
    console.log('[2FA] 2FA verification process complete, returning success response');
    
    // Log all data when 2FA verification is successful
    console.log('[2FA] Full verify response data:', JSON.stringify(verifyResponse.data, null, 2));
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful',
      fnumber,
      sessionToken,
      verifyResponseData: verifyResponse.data 
    });
    
  } catch (err) {
    console.error('[2FA] 2FA verification error:', err.message);
    
    if (err.response) {
      console.error('[2FA] Error response status:', err.response.status);
      console.error('[2FA] Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      success: false, 
      error: `Server error during 2FA verification: ${err.message}` 
    });
  }
};







const finalizeLogin = async (req, res) => {
  const { fnumber, branch, sessionToken } = req.body;

  if (!fnumber || !branch || !sessionToken) {
    return res.status(400).json({ error: 'F-number, branch, and session token are required' });
  }
  
  try {
    let decodedToken;
    try {
      decodedToken = jwt.verify(sessionToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid session token' });
    }
    
    // Ensure the user exists and has access to the selected branch
    const result = await pool.query(
      'SELECT * FROM users_table WHERE email = $1 AND branch = $2',
      [fnumber, branch]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have access to the selected branch' });
    }
    
    const user = result.rows[0];
    
    // Create a new JWT token for the authenticated session
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        branch: user.branch, 
        branchCode: user.branch_code, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        branch: user.branch,
        branchCode: user.branch_code,
        role: user.role
      }
    });
    
  } catch (err) {
    console.error('Login finalization error:', err);
    return res.status(500).json({ error: 'Server error during login finalization' });
  }
};

// Get user's branches




const verifyFnumber = async (req, res) => {
  const { fnumber } = req.body;

  if (!fnumber) {
    return res.status(400).json({ error: 'F-number is required' });
  }

  try {
    const createTokenUrl = 'https://172.29.18.126/adproxyservice/prod/client/renew-token';
    console.log('Requesting token from:', createTokenUrl);
    
    const tokenResponse = await axios.post(createTokenUrl, {
      clientId: "8CA09F75-720F-4641-9B70-5344850DF34E",
      duration: 300
    }, { 
      httpsAgent: new require('https').Agent({ rejectUnauthorized: false }) 
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', JSON.stringify(tokenResponse.data, null, 2));

    // Check if token exists in the response
    if (!tokenResponse.data || tokenResponse.data.statusCode !== 0 || !tokenResponse.data.data || !tokenResponse.data.data.token) {
      console.error('Invalid token response:', tokenResponse.data);
      return res.status(400).json({ 
        isValid: false, 
        error: `Failed to obtain authorization token: ${
          tokenResponse.data && tokenResponse.data.statusMessage 
            ? tokenResponse.data.statusMessage 
            : 'Unknown error'
        }` 
      });
    }

    const rawToken = tokenResponse.data.data.token;
    const authToken = `Bearer ${rawToken}`;
    console.log('Successfully obtained token');
    console.log('Using authorization header:', authToken);

    const searchApiUrl = 'https://172.29.18.126/adproxyservice/prod/ldap/search';
    console.log('Searching for user at:', searchApiUrl);
    
    console.log('Attempting API call with Bearer token in Authorization header');
    try {
      const requestConfig = {
        url: searchApiUrl,
        method: 'post',
        data: { fnumber: fnumber },
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        httpsAgent: new require('https').Agent({ rejectUnauthorized: false })
      };
      
      console.log('Request configuration:', JSON.stringify({
        url: requestConfig.url,
        method: requestConfig.method,
        headers: requestConfig.headers,
        data: requestConfig.data
      }, null, 2));
      
      const response = await axios(requestConfig);
      
      console.log('Search response status:', response.status);
      console.log('Search response data:', JSON.stringify(response.data, null, 2));

      if (response.data.statusCode !== 0) {
        return res.status(400).json({ 
          isValid: false, 
          error: `Search API error: ${response.data.statusMessage}` 
        });
      }

      
      return res.status(200).json({
        isValid: true,
        userData: {
          name: response.data.data.name,
          email: response.data.data.email,
          title: response.data.data.title,
          memberOf: response.data.data.memberOf
        }
      });
    } catch (err) {
      console.error('Search API call failed:', err.message);
      
      // If there's a response in the error, log it
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
      }
      
      throw new Error(`Failed to authenticate with the search API: ${err.message}`);
    }
  } catch (err) {
    console.error('F-number verification error details:', err.message);
    
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
    }
    
    return res.status(500).json({ 
      isValid: false, 
      error: `Server error during F-number verification: ${err.message}` 
    });
  }
};

const createUser = async (req, res) => {
  const { email, branch, branchCode, role = 'user' } = req.body;

  try {
    if (!email || !branch) {
      return res.status(400).json({ error: 'F-number and branch are required' });
    }

    const checkUser = await pool.query('SELECT * FROM users_table WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }


    const result = await pool.query(
      'INSERT INTO users_table (email, branch, branch_code, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, branch, role, created_at',
      [email, branch, branchCode, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role,
        created_at: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'Server error during user creation' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, branch, branchCode, role, is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users_table SET email = $1, branch = $2, branch_code = $3, role = $4, is_active = COALESCE($5, is_active) WHERE id = $6 RETURNING *',
      [email, branch, branchCode, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        branch: result.rows[0].branch,
        role: result.rows[0].role,
        is_active: result.rows[0].is_active
      }
    });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users_table WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User deletion error:', err);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  verifyFnumber,
  authenticateUser,
  verify2FA,
  finalizeLogin,
  track2FAStatus,
  checkUserBranches
};

// visitors log controller
const getAllVisitorLogs = async (req, res) => {
  try {
    console.log("Fetching all visitor logs");
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log
    `);
    console.log(`Found ${result.rows.length} visitor logs`);
    console.log("Sample data:", result.rows.slice(0, 2)); // Log first 2 entries
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send('Server error');
  }
};


const getVisitorLogsByPhoneNumber = async (req, res) => {
  const { telephone } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE telephone = $1
    `, [telephone]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
const checkTelephoneExists = async (req, res) => {
  const { telephone } = req.params;
  
  // Basic validation
  if (!telephone || telephone.trim() === '') {
    return res.status(400).json({ 
      error: 'Telephone number is required',
      exists: false
    });
  }

  try {
    console.log(`Checking if telephone exists: ${telephone}`);
    
    // First check if the pool connection is working
    const testQuery = await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Then perform the actual query
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM visitor_log WHERE telephone = $1) as "exists"', 
      [telephone]
    );
    
    console.log('Query result:', result.rows[0]);
    
    res.json({ 
      exists: result.rows[0].exists,
      message: result.rows[0].exists ? 'Telephone number already registered' : 'Telephone number is available'
    });
  } catch (err) {
    console.error('Error checking telephone:', err);
    res.status(500).json({ 
      error: 'Failed to check telephone number', 
      details: err.message,
      exists: false
    });
  }
};

const getVisitorLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        TO_CHAR(date, 'YYYY-MM-DD') as date, 
        timeIn, 
        timeOut, 
        department, 
        company, 
        picture, 
        telephone, 
        reason, 
        purpose, 
        name, 
        branch,
        branchName
      FROM visitor_log 
      WHERE id = $1
    `, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const getAllBranches = async (req, res) => {
  try {
    console.log("Fetching all unique branches");
    const result = await pool.query(
      'SELECT DISTINCT branchName, branch FROM visitor_log WHERE branchName IS NOT NULL AND branch IS NOT NULL'
    );
    
    const branches = result.rows.map(row => ({
      branchName: row.branchname,
      branchCode: row.branch
    }));
    
    console.log(`Found ${branches.length} unique branches`);
    res.json(branches);
  } catch (err) {
    console.error("Database query error fetching branches:", err);
    res.status(500).send('Server error');
  }
};

const getVisitorLogsByBranchCode = async (req, res) => {
  const { branchCode } = req.query;
  
  if (!branchCode) {
    return res.status(400).json({ error: 'Branch code is required' });
  }
  
  try {
    console.log(`Fetching visitor logs for branch code: ${branchCode}`);
    const result = await pool.query(
      `SELECT 
        id,
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        timeIn,
        timeOut,
        department,
        company,
        picture,
        telephone,
        reason,
        purpose,
        name,
        branch,
        branchName
      FROM visitor_log 
      WHERE branch = $1`,
      [branchCode]
    );
    
    console.log(`Found ${result.rows.length} visitor logs for branch code ${branchCode}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error fetching branch logs:", err);
    res.status(500).send('Server error');
  }
};



const createVisitorLog = async (req, res) => {
  const { date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName // New field
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO visitor_log (date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *',
      [date, timeIn, timeOut, department, company, picture, telephone, reason, purpose, name, branch,branchName]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const updateVisitorLog = async (req, res) => {
  const { id } = req.params;
  const { timeOut } = req.body;
  try {
    const result = await pool.query(
      'UPDATE visitor_log SET timeOut = $1 WHERE id = $2 RETURNING *',
      [timeOut, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating visitor log:', err);
    res.status(500).send('Server error');
  }
};

const deleteVisitorLog = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM visitor_log WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllVisitorLogs,
  getVisitorLogsByPhoneNumber,
  getVisitorLogById,
  createVisitorLog,
  updateVisitorLog,
  deleteVisitorLog,
  checkTelephoneExists, 
  getAllBranches,              
  getVisitorLogsByBranchCode 
};

// auth route
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registerUser);
router.post('/verify', authController.verifyToken);
router.post('/verify-admin', authController.verifyAdminCredentials);

module.exports = router

// rout users
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/Users Controller')
const authMiddleware = require('../middleware/auth'); 


router.post('/verify-fnumber', authMiddleware, usersController.verifyFnumber);

router.post('/', authMiddleware, usersController.createUser);
router.post('/authenticate', usersController.authenticateUser);
router.post('/verify2fa', usersController.verify2FA);
router.post('/finalize-login', usersController.finalizeLogin);
router.post('/checkUserBranches', usersController.checkUserBranches);
router.post('/track2FAStatus', usersController.track2FAStatus);

