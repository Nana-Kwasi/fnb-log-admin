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
  
//   const [showWaitingFor2FA, setShowWaitingFor2FA] = useState(false);
//   const [verificationCounter, setVerificationCounter] = useState(0);
//   const [authToken, setAuthToken] = useState("");
//   const [verificationInProgress, setVerificationInProgress] = useState(false);
//   const [showBranchSelection, setShowBranchSelection] = useState(false);
//   const [sessionToken, setSessionToken] = useState("");
//   const [savedfnumber, setSavedFnumber] = useState(""); 

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

//   // Effect for the counter animation during 2FA verification
//   useEffect(() => {
//     let interval;
//     if (verificationInProgress) {
//       setVerificationCounter(0); 
//       interval = setInterval(() => {
//         setVerificationCounter(prev => {
//           const newCount = prev + 1;
//           if (newCount >= 100) {
//             clearInterval(interval);
//             return 100;
//           }
//           return newCount;
//         });
//       }, 300); // Slightly slower animation, 30 seconds total duration
//     }
    
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [verificationInProgress]);

//   // Effect to poll the verify2FA endpoint after initial authentication
//   useEffect(() => {
//     let pollInterval;
    
//     const pollForVerification = async () => {
//       if (!authToken || !showWaitingFor2FA) return;
      
//       try {
//         const response = await fetch(`${API_URL}/users/verify2fa`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             token: authToken,
//             code: "AUTO_VERIFY", // We're not using a manual code anymore
//             fnumber: savedfnumber
//           })
//         });
        
//         const data = await response.json();
        
//         // Log the response data
//         console.log("2FA verification poll response:", data);
        
//         if (response.ok && data.success) {
//           // Verification successful
//           setVerificationInProgress(false);
//           clearInterval(pollInterval);
          
//           if (!data.userExists) {
//             setLocalError('User not found in system. Please contact administrator.');
//             return;
//           }
          
//           setSessionToken(data.sessionToken);
//           setBranches(data.branches || []);
          
//           if (data.branches && data.branches.length === 1) {
//             // If only one branch, proceed directly to final login
//             setSelectedBranch(data.branches[0].branchName);
//             await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
//           } else if (data.branches && data.branches.length > 1) {
//             // Show branch selection screen
//             setShowWaitingFor2FA(false);
//             setShowBranchSelection(true);
//             setFetchingBranches(false);
//           } else {
//             setLocalError('No branches available for this user');
//           }
//         } else if (response.status === 401 || (data && data.error && data.error.includes("rejected"))) {
//           // User rejected the 2FA on their phone
//           clearInterval(pollInterval);
//           setVerificationInProgress(false);
//           setShowWaitingFor2FA(false);
//           setLocalError("2FA verification was rejected. Please try again.");
//         }
//         // For other errors or pending status, continue polling
        
//       } catch (err) {
//         console.error("Error polling for 2FA verification:", err);
//         // Don't stop polling on network errors, continue trying
//       }
//     };
    
//     if (showWaitingFor2FA && authToken) {
//       // Initial poll immediately
//       pollForVerification();
      
//       // Then poll every 3 seconds
//       pollInterval = setInterval(pollForVerification, 3000);
//     }
    
//     return () => {
//       if (pollInterval) clearInterval(pollInterval);
//     };
//   }, [showWaitingFor2FA, authToken, savedfnumber, API_URL]);

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
      
//       // Show the waiting for 2FA screen instead of verification input
//       setShowWaitingFor2FA(true);
//       setVerificationInProgress(true);
      
//     } catch (err) {
//       console.error("Authentication error:", err);
//       setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
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

//   // Initial login form
//   if (!showWaitingFor2FA && !showBranchSelection) {
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
  
//   // 2FA waiting screen
//   if (showWaitingFor2FA) {
//     return (
//       <div className="login-container">
//         <div className="login-card">
//           <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
//           <h2>Two-Factor Authentication</h2>
          
//           <div className="verification-info">
//             <p>Please check your phone for a verification prompt</p>
//             <p>Accept the prompt on your device to continue</p>
//           </div>
          
//           <div className="verification-counter">
//             <div className="counter-display">
//               <span className="counter-number">{verificationCounter}</span>
//               <span className="counter-percent">%</span>
//             </div>
//             <div className="progress-bar">
//               <div 
//                 className="progress-fill" 
//                 style={{ width: `${verificationCounter}%` }}
//               ></div>
//             </div>
//           </div>
          
//           {displayError && <p className="error-message">{displayError}</p>}
          
//           <button 
//             className="cancel-button" 
//             onClick={() => {
//               setShowWaitingFor2FA(false);
//               setVerificationInProgress(false);
//             }}
//           >
//             Cancel
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


// new
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
  
  const [showWaitingFor2FA, setShowWaitingFor2FA] = useState(false);
  const [verificationCounter, setVerificationCounter] = useState(0);
  const [authToken, setAuthToken] = useState("");
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [savedfnumber, setSavedFnumber] = useState(""); 

  // Refs for intervals
  const counterIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);
  
  // Ref to track if initial setup has been done
  const initDoneRef = useRef(false);  

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

  // COUNTER EFFECT - Start and maintain the progress counter
  useEffect(() => {
    // Only start the counter if:
    // 1. We're showing the waiting screen
    // 2. Verification is in progress
    // 3. No counter is already running
    if (showWaitingFor2FA && verificationInProgress && !counterIntervalRef.current) {
      console.log("STARTING COUNTER INTERVAL");
      
      // Set counter to 0 initially
      setVerificationCounter(0);
      
      // Set up interval for counter
      counterIntervalRef.current = setInterval(() => {
        console.log("Incrementing counter");
        setVerificationCounter(prev => {
          const newCount = prev + 1;
          console.log("Counter now:", newCount);
          if (newCount >= 100) {
            console.log("Counter reached 100, clearing interval");
            clearInterval(counterIntervalRef.current);
            counterIntervalRef.current = null;
            return 100;
          }
          return newCount;
        });
      }, 6000); // 6 seconds per 1% (10 minutes total)
    }
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (counterIntervalRef.current) {
        console.log("Cleaning up counter interval");
        clearInterval(counterIntervalRef.current);
        counterIntervalRef.current = null;
      }
    };
  }, [showWaitingFor2FA, verificationInProgress]);

  // POLLING EFFECT - Poll the API for 2FA verification status
  useEffect(() => {
    // Only set up polling if:
    // 1. We have an auth token
    // 2. We're showing the waiting screen
    // 3. No polling is already running
    if (authToken && showWaitingFor2FA && !pollIntervalRef.current) {
      console.log("STARTING API POLLING");
      
      const pollForVerification = async () => {
        if (!authToken || !showWaitingFor2FA) {
          console.log("Conditions no longer met, skipping poll");
          return;
        }
        
        console.log("Polling 2FA API...");
        try {
          const response = await fetch(`${API_URL}/users/verify2fa`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: authToken,
              code: "AUTO_VERIFY",
              fnumber: savedfnumber
            })
          });
          
          const data = await response.json();
          console.log("2FA API response:", data);
          
          // Handle successful verification (status code 200/success flag)
          if (response.ok && data.success) {
            console.log("2FA VERIFICATION SUCCESSFUL!");
            
            // Clear both intervals
            if (counterIntervalRef.current) {
              clearInterval(counterIntervalRef.current);
              counterIntervalRef.current = null;
            }
            
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Update verification states
            setVerificationInProgress(false);
            setShowWaitingFor2FA(false);
            
            // Handle user data
            if (!data.userExists) {
              setLocalError('User not found in system. Please contact administrator.');
              return;
            }
            
            // Process branch data
            setSessionToken(data.sessionToken);
            setBranches(data.branches || []);
            
            if (data.branches && data.branches.length === 1) {
              // If only one branch, proceed directly to final login
              console.log("Only one branch, proceeding to final login");
              setSelectedBranch(data.branches[0].branchName);
              await handleFinalLogin(data.fnumber || savedfnumber, data.branches[0].branchName, data.sessionToken);
            } else if (data.branches && data.branches.length > 1) {
              // Show branch selection screen
              console.log("Multiple branches, showing selection screen");
              setShowBranchSelection(true);
              setFetchingBranches(false);
            } else {
              setLocalError('No branches available for this user');
            }
          } 
          // Handle pending status (explicit check for pending status)
          else if (data && 
                  ((data.status_code === "002") || 
                   (data.data && data.data.status === "Pending"))) {
            console.log("2FA still pending, continuing to poll");
            // Do nothing, continue polling
          }
          // Handle rejection
          else if (response.status === 401 || 
                  (data && data.error && data.error.includes("rejected")) ||
                  (data && data.status_message && data.status_message.includes("rejected"))) {
            console.log("2FA REJECTED");
            
            // Clear both intervals
            if (counterIntervalRef.current) {
              clearInterval(counterIntervalRef.current);
              counterIntervalRef.current = null;
            }
            
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Update verification states
            setVerificationInProgress(false);
            setShowWaitingFor2FA(false);
            setLocalError("2FA verification was rejected. Please try again.");
          }
          // Any other error
          else {
            console.log("Unknown response from 2FA API");
            // Continue polling, but log the issue
          }
        } catch (err) {
          console.error("Error polling for 2FA verification:", err);
          // Continue polling despite network errors
        }
      };
      
      // Poll immediately on first run
      pollForVerification();
      
      // Then set up interval for polling
      pollIntervalRef.current = setInterval(pollForVerification, 5000); // Poll every 5 seconds
    }
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      if (pollIntervalRef.current) {
        console.log("Cleaning up polling interval");
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [authToken, showWaitingFor2FA, savedfnumber, API_URL]);

  // Process initial login form submission
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
      
      // Important: Set all states BEFORE showing the waiting screen
      // to avoid race conditions
      
      // 1. Clear any existing intervals first
      if (counterIntervalRef.current) {
        clearInterval(counterIntervalRef.current);
        counterIntervalRef.current = null;
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      
      // 2. Reset verification counter
      setVerificationCounter(0);
      
      // 3. Set authentication data
      setAuthToken(data.token);
      setSavedFnumber(fnumber);
      
      // 4. Set verification state BEFORE showing waiting screen
      setVerificationInProgress(true);
      
      // 5. Finally show the waiting screen (with slight delay to ensure states are set)
      setTimeout(() => {
        setShowWaitingFor2FA(true);
        initDoneRef.current = true;
      }, 100);
      
    } catch (err) {
      console.error("Authentication error:", err);
      setLocalError(err.message || "Authentication failed. Please check your credentials and try again.");
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

  // Time display for the counter (showing estimated time remaining)
  const getTimeRemainingDisplay = () => {
    const percentRemaining = 100 - verificationCounter;
    const minutesRemaining = Math.floor((percentRemaining * 10) / 100);
    return `Approx. ${minutesRemaining} minutes remaining`;
  };

  // Initial login form
  if (!showWaitingFor2FA && !showBranchSelection) {
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
  
  // 2FA waiting screen
  if (showWaitingFor2FA) {
    return (
      <div className="login-container">
        <div className="login-card">
          <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
          <h2>Two-Factor Authentication</h2>
          
          <div className="verification-info">
            <p>Please check your phone for a verification prompt</p>
            <p>Accept the prompt on your device to continue</p>
            <p className="time-remaining">{getTimeRemainingDisplay()}</p>
          </div>
          
          <div className="verification-counter">
            <div className="counter-display">
              <span className="counter-number">{verificationCounter}</span>
              <span className="counter-percent">%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${verificationCounter}%` }}
              ></div>
            </div>
          </div>
          
          {displayError && <p className="error-message">{displayError}</p>}
          
          <button 
            className="cancel-button" 
            onClick={() => {
              // Clear intervals first
              if (counterIntervalRef.current) {
                clearInterval(counterIntervalRef.current);
                counterIntervalRef.current = null;
              }
              
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              
              // Then update state
              setVerificationInProgress(false);
              setShowWaitingFor2FA(false);
            }}
          >
            Cancel
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

//original code
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