
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

// new context
import React, { createContext, useState, useContext, useEffect } from "react";

const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchName, setSelectedBranchName] = useState(""); // Add this new state
  const [branchData, setBranchData] = useState({
    analyticsData: [],
    totalVisitors: 0,
    visitorsToday: 0,
    todayVisitorsData: [],
    allVisitorsData: [],
  });
  
  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // Updated API URLs to match backend routes
  // const API_URL = "http://localhost:5001/visitors";
  const BRANCH_DATA_URL = "http://localhost:5001/visitors/api/index/branch";
  const AUTH_URL = "http://localhost:5001/auth/api";

  // Date formatting utilities
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const parseAPIDate = (dateStr) => {
  if (!dateStr) {
    console.log("parseAPIDate: No date provided");
    return null;
  }
  console.log(`parseAPIDate: Parsing date string: "${dateStr}"`);
  
  if (dateStr instanceof Date) {
    console.log("parseAPIDate: Input is already a Date object");
    return dateStr;
  }
  
  try {
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
      const parsedDate = new Date(year, month - 1, day);
      console.log(`parseAPIDate: Parsed as YYYY-MM-DD: ${parsedDate}`);
      return parsedDate;
    }
    
    if (typeof dateStr === 'string' && dateStr.includes("T")) {
      const parsedDate = new Date(dateStr);
      console.log(`parseAPIDate: Parsed as ISO: ${parsedDate}`);
      return parsedDate;
    }
    
    if (typeof dateStr === 'string' && dateStr.includes("/")) {
      const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
      const parsedDate = new Date(year, month - 1, day);
      console.log(`parseAPIDate: Parsed as MM/DD/YYYY: ${parsedDate}`);
      return parsedDate;
    }
    
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      console.log(`parseAPIDate: Unrecognized date format: ${dateStr}`);
      return null;
    }
    
    console.log(`parseAPIDate: Parsed with default parser: ${parsedDate}`);
    return parsedDate;
  } catch (e) {
    console.error(`parseAPIDate: Error parsing date "${dateStr}":`, e);
    return null;
  }
};
  const fetchBranchData = async (branchCode) => {
    setLoading(true);
    setError("");
    
    try {
      console.log(`Fetching data for branch code: ${branchCode}`);
      
      const headers = {};
      if (token) {
        headers['x-auth-token'] = token;
      }
      
      const response = await fetch(`${BRANCH_DATA_URL}?branchCode=${branchCode}`, { headers });
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const branchData = await response.json();
      console.log("API response received with entries:", branchData.length);
      
      const currentYear = new Date().getFullYear();
      const today = new Date();
      const todayFormatted = formatDateForAPI(today);
      console.log("Today's date formatted for comparison:", todayFormatted);
      
      branchData.forEach((item, index) => {
        if (item.date) {
          const parsedDate = parseAPIDate(item.date);
          console.log(`Entry ${index} date: "${item.date}" -> Parsed: ${parsedDate ? parsedDate.toISOString() : 'null'}`);
        } else {
          console.log(`Entry ${index} has no date`);
        }
      });
      
      const groupedData = branchData.reduce(
        (acc, log) => {
          if (log.date) {
            try {
              const date = parseAPIDate(log.date);
              
              if (!date) {
                console.log(`Invalid date format for entry:`, log);
                return acc;
              }
              
              if (date && date.getFullYear() === currentYear) {
                const month = date.toLocaleString("default", { month: "long" });
                acc.monthly[month] = (acc.monthly[month] || 0) + 1;
  
                const logDate = formatDateForAPI(date);
                console.log(`Comparing dates: logDate=${logDate}, todayFormatted=${todayFormatted}`);
                if (logDate === todayFormatted) {
                  acc.today += 1;
                  console.log(`Today match found! Today count: ${acc.today}`);
                }
              }
              
              if (date && date.getFullYear() === currentYear) {
                acc.total += 1;
              }
            } catch (e) {
              console.error("Date parsing error:", e);
            }
          }
          return acc;
        },
        { monthly: {}, today: 0, total: 0 }
      );
      
      console.log("Grouped data results:", {
        total: groupedData.total,
        today: groupedData.today,
        monthCounts: groupedData.monthly
      });
  
      const fullYearMonths = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        });
        return { month, visits: groupedData.monthly[month] || 0 };
      });
      
      const todayVisitors = branchData.filter(visitor => {
        if (!visitor.date) return false;
        const visitorDate = parseAPIDate(visitor.date);
        const formattedVisitorDate = visitorDate ? formatDateForAPI(visitorDate) : null;
        const isToday = formattedVisitorDate === todayFormatted;
        
        if (isToday) {
          console.log(`Today's visitor found:`, visitor);
        }
        
        return isToday;
      });
      
      console.log(`Found ${todayVisitors.length} visitors today`);
      
      if (todayVisitors.length > 0) {
        console.log("Today's visitors detail:", todayVisitors);
      }
      
      setBranchData({
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
        todayVisitorsData: todayVisitors,
        allVisitorsData: branchData
      });
      
      const dashboardData = {
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
        lastUpdated: new Date().toISOString(), 
        selectedBranch: branchCode,
        selectedBranchName: selectedBranchName 
      };
      
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
      console.log("Data stored in localStorage", dashboardData);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching branch data:", err);
      setError("Failed to fetch branch data. Please try again.");
      setLoading(false);
      return false;
    }
  };
const parseUserProfileFromResponse = (verifyResponseData) => {
  console.log("Parsing user profile from verify2fa response");
  
  if (!verifyResponseData) return null;
  
  try {
    // Extract user data from verify2fa response
    const { data } = verifyResponseData;
    
    if (!data) {
      console.log("No data object found in verify2fa response");
      return null;
    }
    
    // Try to parse the payload if it's a string
    let payloadData = {};
    if (typeof data.payload === 'string') {
      try {
        payloadData = JSON.parse(data.payload);
        console.log("Successfully parsed payload data", payloadData);
      } catch (err) {
        console.error("Error parsing payload JSON:", err);
      }
    } else if (typeof data.payload === 'object') {
      payloadData = data.payload;
    }
    
    // Extract the relevant user information
    const userProfile = {
      userId: data.fnumber || payloadData.userId || payloadData.fnumber || "",
      name: payloadData.name || "",
      title: payloadData.title || "",
      email: payloadData.email || "",
      mobile: payloadData.mobile || ""
    };
    
    console.log("Extracted user profile:", userProfile);
    return userProfile;
  } catch (err) {
    console.error("Error extracting user profile from verify2fa response:", err);
    return null;
  }
};

  const verifyToken = async () => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${AUTH_URL}/verify`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      return response.ok;
    } catch (err) {
      console.error("Token verification error:", err);
      return false;
    }
  };

 
// Update your login function to include the profile parsing
const login = async (email, branchCode, authToken = null, branchName = "", role = "", verifyResponseData = null) => {
  setLoading(true);
  setError("");
  
  try {
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('token', authToken);
      
      // Extract user profile from verify2fa response if available
      const userProfile = verifyResponseData ? parseUserProfileFromResponse(verifyResponseData) : null;
      
      const userData = { 
        email, 
        branchCode, 
        branchName, 
        role,
        // Add user profile data if available
        ...(userProfile ? userProfile : {})
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setSelectedBranch(branchCode);
      setSelectedBranchName(branchName);
      setAuthenticated(true);
      
      await fetchBranchData(branchCode);
      
      setLoading(false);
      return true;
    }
    
    console.log(`Attempting login for ${email} at branch ${branchCode}`);
    
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: 'default-needed-in-body', branch: branchCode })
    });
    
    if (!response.ok) {
      throw new Error("Authentication failed");
    }
    
    const data = await response.json();
    
    // Extract user profile from verify2fa response if available
    const userProfile = verifyResponseData ? parseUserProfileFromResponse(verifyResponseData) : null;
    
    const userDataToStore = {
      ...(data.user || { email, branchCode, branchName, role }),
      // Add user profile data if available
      ...(userProfile ? userProfile : {})
    };
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userDataToStore));
    
    setToken(data.token);
    setUser(userDataToStore);
    setSelectedBranch(branchCode);
    setSelectedBranchName(branchName);
    setAuthenticated(true);
    
    await fetchBranchData(branchCode);
    
    setLoading(false);
    return true;
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Login failed. Please try again.");
    setLoading(false);
    return false;
  }
};

  const logout = () => {
    console.log("Logging out, clearing context and localStorage");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem("dashboardData");
    
    setToken(null);
    setSelectedBranch("");
    setSelectedBranchName("");
    setBranchData({
      analyticsData: [],
      totalVisitors: 0,
      visitorsToday: 0,
      todayVisitorsData: [],
      allVisitorsData: [],
    });
    setAuthenticated(false);
    setUser(null);
  };

  
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const savedData = localStorage.getItem("dashboardData");
      
      if (storedToken && storedUser) {
        try {
          const response = await fetch(`${AUTH_URL}/verify`, {
            headers: {
              'x-auth-token': storedToken
            }
          });
          
          if (response.ok) {
            const userData = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
            setAuthenticated(true);
            
            if (userData.branchCode) {
              setSelectedBranch(userData.branchCode);
              setSelectedBranchName(userData.branchName || "");
            }
            
            if (savedData) {
              try {
                console.log("Found saved dashboard data in localStorage");
                const parsedData = JSON.parse(savedData);
                
                const lastUpdated = new Date(parsedData.lastUpdated || 0);
                const today = new Date();
                const isSameDay = lastUpdated.toDateString() === today.toDateString();
                
                if (isSameDay) {
                  console.log("Restoring dashboard data from localStorage:", parsedData);
                  setBranchData({
                    analyticsData: parsedData.analyticsData || [],
                    totalVisitors: parsedData.totalVisitors || 0,
                    visitorsToday: parsedData.visitorsToday || 0,
                    todayVisitorsData: parsedData.todayVisitorsData || [],
                    allVisitorsData: parsedData.allVisitorsData || [],
                  });
                } else {
                  console.log("Saved data is from a different day, fetching fresh data");
                  if (userData.branchCode) {
                    fetchBranchData(userData.branchCode);
                  }
                }
              } catch (err) {
                console.error("Error parsing stored dashboard data:", err);
                localStorage.removeItem("dashboardData");
                if (userData.branchCode) {
                  fetchBranchData(userData.branchCode);
                }
              }
            } else if (userData.branchCode) {
              // No saved data but we have branch info, fetch fresh data
              fetchBranchData(userData.branchCode);
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem("dashboardData");
          }
        } catch (err) {
          console.error('Token verification error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem("dashboardData");
        }
      } else {
        console.log("No saved authentication found in localStorage");
      }
    };
    
    checkAuth();
  }, []);

  // Create context value
  const contextValue = {
    // Authentication context
    authenticated,
    user,
    loading,
    error,
    token,
    login,
    logout,
    
    // Visitor tracking context
    selectedBranch,
    selectedBranchName,
    branchData,
    fetchBranchData,
    setError,
  };

  return (
    <VisitorContext.Provider value={contextValue}>
      {children}
    </VisitorContext.Provider>
  );
};

// Custom hook for using the context
export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
};


// LOGIN UPDATED CODE
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
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [savedIdentifier, setSavedIdentifier] = useState(""); 
  const [authToken, setAuthToken] = useState("");
  const [pollingStatus, setPollingStatus] = useState("pending"); // pending, success, failed
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showManualCodeEntry, setShowManualCodeEntry] = useState(false);
  const [verifyButtonVisible, setVerifyButtonVisible] = useState(false); // Changed to false initially
  
  // Timer states
  const [remainingTime, setRemainingTime] = useState(60); // Changed from 50 to 60 seconds
  const [showTimer, setShowTimer] = useState(false);
  const [checkingBranches, setCheckingBranches] = useState(false);

  // Transition states
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("Checking your assigned branches...");
  const [transitionProgress, setTransitionProgress] = useState(0);
  
  const pollingIntervalRef = useRef(null);
  const maxPollingTime = 120000; // 2 minutes
  const pollingStartTimeRef = useRef(null);
  const buttonFadeIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const { login, loading, error, setError, authenticated } = useVisitor();

  // API URLs - UPDATED to match backend routes
  const API_URL = "http://localhost:5001";
  const BRANCHES_URL = "http://localhost:5001/visitors/api/index"; // Updated
  const AUTH_URL = "http://localhost:5001/auth/api"; // Updated

  // Cleanup polling and timers on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (buttonFadeIntervalRef.current) {
        clearInterval(buttonFadeIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
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

  // New effect to show the check verification status button after 10 seconds
  useEffect(() => {
    if (showVerification && pollingStatus === "pending") {
      // Initially hide the button for 10 seconds
      setVerifyButtonVisible(false);
      
      // Show button after 10 seconds
      const buttonShowTimer = setTimeout(() => {
        setVerifyButtonVisible(true);
        
        // Start the fading effect after button appears
        buttonFadeIntervalRef.current = setInterval(() => {
          setVerifyButtonVisible(prev => !prev);
        }, 1500); // Toggle visibility every 1.5 seconds
      }, 10000); // 10 seconds delay
      
      return () => {
        clearTimeout(buttonShowTimer);
        if (buttonFadeIntervalRef.current) {
          clearInterval(buttonFadeIntervalRef.current);
        }
      };
    }
  }, [showVerification, pollingStatus]);
  
  // Timer countdown effect
  useEffect(() => {
    if (showVerification && showTimer && remainingTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [showVerification, showTimer, remainingTime]);

  // Transition effect for successful verification
  useEffect(() => {
    if (showTransition) {
      // Update progress over 15 seconds (increased from 10)
      const progressInterval = setInterval(() => {
        setTransitionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 0.67; // Adjusted for 15 seconds
        });
      }, 100); // 15 seconds = 100 steps × 150ms

      // Change message halfway through
      const messageTimer = setTimeout(() => {
        setTransitionMessage("Thank you for hanging on");
      }, 7500); // 7.5 seconds (half of 15)

      // Complete transition after 15 seconds
      const completeTimer = setTimeout(() => {
        setShowTransition(false);
        setShowVerification(false);
        setShowBranchSelection(true);
      }, 15000); // 15 seconds (increased from 10)

      return () => {
        clearInterval(progressInterval);
        clearTimeout(messageTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [showTransition]);

  // Check if a user is admin based on their identifier
  const checkIfAdmin = (identifier) => {
    return identifier.includes('@') && !identifier.startsWith('F');
  };

  // New function to track 2FA status
  const track2FAStatus = async () => {
    try {
      console.log("Tracking 2FA status...");
      const response = await fetch(`${API_URL}/users/api/track2FAStatus`, { // Updated
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authToken,
          fnumber: savedIdentifier
        })
      });
      
      const data = await response.json();
      console.log("Track 2FA status response:", data);
      
      if (response.ok && data.success && data.status === "Success") {
        // 2FA verification was successful
        setPollingStatus("success");
        clearInterval(pollingIntervalRef.current);
        
        // Save the 2FA status response for user data extraction
        sessionStorage.setItem('verify2faResponse', JSON.stringify(data));
        
        // Now check user branches
        await checkUserBranches(data);
      }
    } catch (err) {
      console.error("Error tracking 2FA status:", err);
    }
  };
  
  // Function to check user branches
  const checkUserBranches = async () => {
    setCheckingBranches(true);
    try {
      console.log("Checking user branches...");
      const response = await fetch(`${API_URL}/users/api/checkUserBranches`, { // Updated
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fnumber: savedIdentifier
        })
      });
      
      const data = await response.json();
      console.log("Check user branches response:", data);
      console.log("Response structure:", JSON.stringify(data));
      
      if (!response.ok) {
        setLocalError("Failed to retrieve branch access. Please contact support.");
        return;
      }
      
      // Handle different possible response structures
      const branchesArray = data.branches || (Array.isArray(data) ? data : []);
      
      if (branchesArray && branchesArray.length > 0) {
        // Store session token if provided
        if (data.sessionToken) {
          setSessionToken(data.sessionToken);
        }
        
        // Set branches from response
        setBranches(branchesArray);
        
        if (branchesArray.length === 1) {
          // If only one branch, auto-select it and proceed to final login
          setSelectedBranch(branchesArray[0].branchName);
          console.log("Auto-selecting single branch:", branchesArray[0].branchName);
          
          // Complete final login with the auto-selected branch
          await handleFinalLogin(savedIdentifier, branchesArray[0].branchName, sessionToken || data.sessionToken);
        } else {
          // If multiple branches, show transition screen then branch selection
          setShowTransition(true);
          setTransitionProgress(0);
        }
      } else {
        setLocalError('No branches available for this user');
      }
    } catch (err) {
      console.error("Error checking user branches:", err);
      setLocalError("Failed to check branch access. Please try again.");
    } finally {
      setCheckingBranches(false);
    }
  };

  // Check verification status function
  const checkVerificationStatus = async () => {
    setCheckingStatus(true);
    setLocalError("");
    
    try {
      console.log("Manually checking 2FA status...");
      const response = await fetch(`${API_URL}/users/api/verify2fa`, { // Updated
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
      console.log("Manual 2FA status check response:", data);
      
      // First, check if 2FA verification itself was successful
      const is2FASuccessful = response.ok && (
        data.success === true || 
        data.status_code === "000" || 
        data.status_code === 0
      );
      
      if (is2FASuccessful) {
        setPollingStatus("success"); // Mark 2FA itself as successful
        
        // Now check user branches using the separate API
        await checkUserBranches();
        return;
      }
      
      // Handle pending status appropriately
      if (data.status_code === "002" || data.status_message?.includes("Pending")) {
        setLocalError("Authentication is still pending. Please approve the request on your phone.");
        return;
      }
      
      // If it's not successful and not pending, it's failed
      setPollingStatus("failed");
      setLocalError(data.status_message || data.error || "Verification failed. Please try again.");
      
    } catch (err) {
      console.error("Error checking 2FA status:", err);
      setLocalError("Error checking verification status. Please try again.");
      setPollingStatus("failed");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Updated polling function that uses track2FAStatus
  const startPollingFor2FA = (token) => {
    console.log("Starting to poll for 2FA status with token:", token);
    setPollingStatus("pending");
    pollingStartTimeRef.current = Date.now();
    
    // Start countdown timer
    setRemainingTime(60); // Changed to 60 seconds
    setShowTimer(true);
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Use a longer interval to reduce API calls (5 seconds instead of 3)
    pollingIntervalRef.current = setInterval(async () => {
      // Skip polling if we're manually checking or if status is no longer pending
      if (checkingStatus || pollingStatus !== "pending") {
        return;
      }
      
      // Check if we've exceeded the max polling time
      if (Date.now() - pollingStartTimeRef.current > maxPollingTime) {
        clearInterval(pollingIntervalRef.current);
        setPollingStatus("failed");
        setLocalError("2FA verification timed out. Please try again.");
        return;
      }
      
      // Use the new track2FAStatus API instead of calling verify2fa directly
      await track2FAStatus();
      
    }, 5000); 
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
      const response = await fetch(`${AUTH_URL}/verify-admin`, { // Updated
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

  // Handle final login after branch selection
  const handleFinalLogin = async (identifier, branch, sessionToken) => {
    setLocalError("");
    setLoadingSpinner(true);
    
    try {
      console.log(`Finalizing login with branch: ${branch}`);
      
      const selectedBranchObj = branches.find(branchObj => branchObj.branchName === branch);
      const branchCode = selectedBranchObj ? selectedBranchObj.branchCode : '';
      
      // Get the stored 2FA response if available
      const storedVerifyResponse = sessionStorage.getItem('verify2faResponse');
      const verifyResponseData = storedVerifyResponse ? JSON.parse(storedVerifyResponse) : null;
      
      // For admin users, make the final login call with the selected branch
      if (isAdminUser) {
        const response = await fetch(`${AUTH_URL}/login`, { // Updated
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
          userData.role,
          verifyResponseData
        );
        
        if (!success) {
          setManualLoginAttempt(false);
          throw new Error("Login failed. Please try again.");
        }
      }
      // Regular user flow
      else {
        console.log("Finalizing regular user login");
        
        const userData = {
          fnumber: identifier,
          branchName: branch,
          branchCode: branchCode,
          role: 'user'
        };
        
        localStorage.setItem('token', sessionToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setManualLoginAttempt(true);
        const success = await login(
          identifier, 
          branchCode,
          sessionToken, 
          branch, 
          userData.role,
          verifyResponseData
        );
        
        if (!success) {
          setManualLoginAttempt(false);
          throw new Error("Login failed. Please try again.");
        }
      }
      
      // Clean up the stored 2FA response after successful login
      sessionStorage.removeItem('verify2faResponse');
      
    } catch (err) {
      console.error("Login finalization error:", err);
      setManualLoginAttempt(false);
      setLocalError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoadingSpinner(false);
    }
  };

  // Handle regular user authentication (with 2FA)
  const handleRegularUserAuth = async (fnumber, password) => {
    try {
      console.log("Using regular user authentication flow with 2FA");
      
      const response = await fetch(`${API_URL}/users/api/authenticate`, { // Updated
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
        if (data.status_code === "001" && data.status_message?.includes("User not found in LDAP")) {
          throw new Error("User not found in LDAP. Please check your credentials.");
        }
        throw new Error(data.error || 'Authentication failed');
      }
      
      console.log("Authentication response:", data);
      
      setAuthToken(data.token);
      setSavedIdentifier(fnumber);
      
      // Reset state for the verification screen
      setVerifyButtonVisible(false); // Will be shown after 10 seconds timer
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
      
      const response = await fetch(`${API_URL}/users/api/verify2fa`, { // Updated
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
      
      setPollingStatus("success");
      
      // Save the 2FA verification response for user data extraction
      sessionStorage.setItem('verify2faResponse', JSON.stringify(data));
      
      // After successful 2FA verification, check branches
      await checkUserBranches(data);
      
    } catch (err) {
      console.error("2FA verification error:", err);
      setLocalError(err.message || "Verification failed. Please try again.");
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

  // Toggle manual code entry
  const toggleManualCodeEntry = () => {
    setShowManualCodeEntry(!showManualCodeEntry);
  };

  // Cancel 2FA process and go back to login
  const cancelAuth = () => {
    // Stop the polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    if (buttonFadeIntervalRef.current) {
      clearInterval(buttonFadeIntervalRef.current);
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setShowVerification(false);
    setPollingStatus("pending");
    setLoadingSpinner(false);
    setShowTimer(false);
  };
  
  const displayError = error || localError;

  // debugg
  
// 3. Print all registered routes - add this after route registration
console.log('\n=== REGISTERED ROUTES ===');
function printRoutes(stack, basePath = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .join(', ').toUpperCase();
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // This is a router middleware
      const routerBasePath = basePath + (layer.regexp.source.replace(/\\\//g, '/').replace(/\^\//g, '').replace(/\\/g, '').replace(/\?.*$/, '') || '/');
      printRoutes(layer.handle.stack, routerBasePath);
    }
  });
}
printRoutes(app._router.stack);
console.log('======================\n');

// 4. Add a 404 handler at the very end
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// 5. Error handler
app.use((err, req, res, next) => {
  console.error(`[500] Server error for ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});