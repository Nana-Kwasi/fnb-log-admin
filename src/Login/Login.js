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
  const [manualLoginAttempt, setManualLoginAttempt] = useState(false);
  
  const { login, loading, error, setError, authenticated } = useVisitor();

  // Updated API URLs
  const API_URL = "http://localhost:5001/visitors";
  const BRANCHES_URL = "http://localhost:5001/visitors/index";
  const AUTH_URL = "http://localhost:5001/auth";

  useEffect(() => {
    if (authenticated && email && manualLoginAttempt) {
      console.log("Authentication successful after manual login attempt, navigating to dashboard");
      onLogin(email);
      setManualLoginAttempt(false);
    } else if (authenticated) {
      console.log("Already authenticated from storage, but not navigating (waiting for manual login)");
    }
  }, [authenticated, email, onLogin, manualLoginAttempt]);

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
        
        // Store branches with their names and codes
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

    fetchBranches();
  }, [BRANCHES_URL, setError]);
// Update the login form submission to include the role
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Login form submitted");
  setLocalError("");

  if (email.length > 25) {
    setLocalError("F number is incorrect");
    return;
  }

  if (!selectedBranch) {
    setLocalError("Please select a branch");
    return;
  }
  
  // Find the selected branch code from the branches array
  const selectedBranchObj = branches.find(branch => branch.branchName === selectedBranch);
  
  if (!selectedBranchObj) {
    setLocalError("Invalid branch selection");
    return;
  }
  
  const branchCode = selectedBranchObj.branchCode;
  console.log(`Selected branch: ${selectedBranch} (code: ${branchCode})`);

  try {
    console.log("Login validation passed, setting manual login attempt flag");
    setManualLoginAttempt(true);
    
    console.log("Attempting login with:", { email, branch: branchCode });
    
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        branch: branchCode
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    
    // Extract user role from response or set a default
    const userRole = data.user && data.user.role ? data.user.role : "user";
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      ...data.user,
      branchName: selectedBranch,  // Store both branch code and name
      branchCode: branchCode,
      role: userRole
    }));
    
    // Pass role to login function
    const success = await login(email, branchCode, data.token, selectedBranch, userRole);
    
    console.log("Login result:", success);
    
    if (!success) {
      console.log("Login failed, resetting manual login attempt flag");
      setManualLoginAttempt(false);
      setLocalError("Login failed. Please check your credentials and try again.");
    }
  } catch (err) {
    console.error("Login submission error:", err);
    setManualLoginAttempt(false);
    setLocalError(err.message || "An unexpected error occurred. Please try again.");
  }
};
  
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
          <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;