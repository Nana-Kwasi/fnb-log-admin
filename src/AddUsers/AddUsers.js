
import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";

const AddUsers = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [role, setRole] = useState("user");

  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [branches, setBranches] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useVisitor();

  const API_URL = "http://localhost:5001/users";
  const VISITORS_URL = "http://localhost:5001/visitors";

  // Fetch branches and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        const branchResponse = await fetch(VISITORS_URL);
        if (!branchResponse.ok) {
          throw new Error(`API response error: ${branchResponse.status}`);
        }
        const branchData = await branchResponse.json();
        const uniqueBranches = [...new Set(branchData
          .map(entry => entry.branchname)
          .filter(branch => branch && branch.trim() !== "")
        )];
        setBranches(uniqueBranches.sort());

        // Fetch users
        const usersResponse = await fetch(API_URL, {
          headers: {
            'x-auth-token': token
          }
        });
        if (!usersResponse.ok) {
          throw new Error(`API response error: ${usersResponse.status}`);
        }
        const userData = await usersResponse.json();
        setUsers(userData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      }
    };

    fetchData();
  }, [token]);

  // Handle new user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs
    if (!email || !password || !selectedBranch) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Password strength check
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          email,
          password,
          branch: selectedBranch,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'User creation failed');
      }

      // Add new user to users list
      setUsers([...users, data.user]);

      setSuccess("User created successfully!");
      
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedBranch("");
      setRole("user");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
      setSuccess("User deleted successfully!");
      setExpandedUserId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle user update
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          email: editingUser.email,
          branch: editingUser.branch,
          role: editingUser.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'User update failed');
      }

      // Update users list
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...editingUser } : user
      ));

      setSuccess("User updated successfully!");
      setEditingUser(null);
      setExpandedUserId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Styles (same as previous implementation)
  const styles = {
    container: {
      display: 'flex',
      padding: '20px',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
    },
    leftPanel: {
      width: '60%',
      paddingRight: '20px',
    },
    rightPanel: {
      width: '50%',
      overflowY: 'auto',
      maxHeight: '100vh',
    },
    card: {
      background: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    userCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      margin: '10px 0',
      padding: '15px',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    errorMessage: {
      color: '#e74c3c',
      marginBottom: '1rem',
    },
    successMessage: {
      color: '#2ecc71',
      marginBottom: '1rem',
    },
    actionButton: {
      padding: '8px 15px',
      margin: '0 5px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    deleteButton: {
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
    },
    editButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
    },
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - User Creation Form */}
      <div style={styles.leftPanel}>
        <div style={styles.card}>
          <h2>Create New User</h2>
          <form onSubmit={handleCreateUser}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
            
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {error && <p style={styles.errorMessage}>{error}</p>}
            {success && <p style={styles.successMessage}>{success}</p>}

            <button 
              type="submit" 
              disabled={loading}
              style={styles.button}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - User Management */}
      <div style={styles.rightPanel}>
        <h2>All Users</h2>
        {users.map((user) => (
          <div key={user.id} style={styles.userCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <strong>{user.email}</strong>
              <div>
                <button 
                  onClick={() => {
                    setExpandedUserId(expandedUserId === user.id ? null : user.id);
                    setEditingUser(null);
                  }}
                  style={{...styles.actionButton, backgroundColor: '#17a2b8', color: 'white'}}
                >
                  {expandedUserId === user.id ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </div>
            
            {expandedUserId === user.id && (
              <div>
                {editingUser ? (
                  <form onSubmit={handleUpdateUser}>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      style={styles.input}
                      required
                    />
                    <select
                      value={editingUser.branch}
                      onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
                      style={styles.select}
                      required
                    >
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      style={styles.select}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <button 
                        type="submit" 
                        style={{...styles.actionButton, ...styles.editButton}}
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingUser(null);
                          setExpandedUserId(null);
                        }}
                        style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p>Branch: {user.branch}</p>
                    <p>Role: {user.role}</p>
                    <p>Created At: {new Date(user.created_at).toLocaleString()}</p>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => {
                          setEditingUser({
                            id: user.id,
                            email: user.email,
                            branch: user.branch,
                            role: user.role
                          });
                        }}
                        style={{...styles.actionButton, ...styles.editButton}}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddUsers;












// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";

// const AddUsers = () => {
//   // Form state for new user
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [role, setRole] = useState("user");

//   // User management state
//   const [users, setUsers] = useState([]);
//   const [expandedUserId, setExpandedUserId] = useState(null);
//   const [editingUser, setEditingUser] = useState(null);
//   const [branches, setBranches] = useState([]);

//   // Other states
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { token } = useVisitor();

//   const API_URL = "http://localhost:5001/users";
//   const VISITORS_URL = "http://localhost:5001/visitors";

//   // Fetch branches and users on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch branches
//         const branchResponse = await fetch(VISITORS_URL);
//         if (!branchResponse.ok) {
//           throw new Error(`API response error: ${branchResponse.status}`);
//         }
//         const branchData = await branchResponse.json();
//         const uniqueBranches = [...new Set(branchData
//           .map(entry => entry.branchname)
//           .filter(branch => branch && branch.trim() !== "")
//         )];
//         setBranches(uniqueBranches.sort());

//         // Fetch users
//         const usersResponse = await fetch(API_URL, {
//           headers: {
//             'x-auth-token': token
//           }
//         });
//         if (!usersResponse.ok) {
//           throw new Error(`API response error: ${usersResponse.status}`);
//         }
//         const userData = await usersResponse.json();
//         setUsers(userData);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load data. Please try again later.");
//       }
//     };

//     fetchData();
//   }, [token]);

//   // Handle new user creation
//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     // Validate inputs
//     if (!email || !password || !selectedBranch) {
//       setError("Please fill in all required fields");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     // Password strength check
//     if (password.length < 8) {
//       setError("Password must be at least 8 characters long");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify({
//           email,
//           password,
//           branch: selectedBranch,
//           role
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'User creation failed');
//       }

//       // Add new user to users list
//       setUsers([...users, data.user]);

//       setSuccess("User created successfully!");
      
//       // Reset form
//       setEmail("");
//       setPassword("");
//       setConfirmPassword("");
//       setSelectedBranch("");
//       setRole("user");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle user deletion
//   const handleDeleteUser = async (userId) => {
//     try {
//       const response = await fetch(`${API_URL}/${userId}`, {
//         method: 'DELETE',
//         headers: {
//           'x-auth-token': token
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete user');
//       }

//       // Remove user from local state
//       setUsers(users.filter(user => user.id !== userId));
//       setSuccess("User deleted successfully!");
//       setExpandedUserId(null);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle user update
//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/${editingUser.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify({
//           email: editingUser.email,
//           branch: editingUser.branch,
//           role: editingUser.role
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'User update failed');
//       }

//       // Update users list
//       setUsers(users.map(user => 
//         user.id === editingUser.id ? { ...user, ...editingUser } : user
//       ));

//       setSuccess("User updated successfully!");
//       setEditingUser(null);
//       setExpandedUserId(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Styles (same as previous implementation)
//   const styles = {
//     container: {
//       display: 'flex',
//       padding: '20px',
//       backgroundColor: '#f0f2f5',
//       minHeight: '100vh',
//     },
//     leftPanel: {
//       width: '40%',
//       paddingRight: '20px',
//     },
//     rightPanel: {
//       width: '60%',
//       overflowY: 'auto',
//       maxHeight: '100vh',
//     },
//     card: {
//       background: '#fff',
//       padding: '2rem',
//       borderRadius: '8px',
//       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//       marginBottom: '20px',
//     },
//     input: {
//       width: '100%',
//       padding: '0.75rem',
//       marginBottom: '1rem',
//       border: '1px solid #ccc',
//       borderRadius: '4px',
//       fontSize: '1rem',
//     },
//     select: {
//       width: '100%',
//       padding: '0.75rem',
//       marginBottom: '1rem',
//       border: '1px solid #ccc',
//       borderRadius: '4px',
//       fontSize: '1rem',
//     },
//     userCard: {
//       backgroundColor: '#fff',
//       borderRadius: '8px',
//       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//       margin: '10px 0',
//       padding: '15px',
//     },
//     button: {
//       width: '100%',
//       padding: '0.75rem',
//       backgroundColor: '#007bff',
//       color: '#fff',
//       border: 'none',
//       borderRadius: '4px',
//       fontSize: '1rem',
//       cursor: 'pointer',
//       transition: 'background-color 0.3s ease',
//     },
//     errorMessage: {
//       color: '#e74c3c',
//       marginBottom: '1rem',
//     },
//     successMessage: {
//       color: '#2ecc71',
//       marginBottom: '1rem',
//     },
//     actionButton: {
//       padding: '8px 15px',
//       margin: '0 5px',
//       borderRadius: '4px',
//       cursor: 'pointer',
//     },
//     deleteButton: {
//       backgroundColor: '#dc3545',
//       color: 'white',
//       border: 'none',
//     },
//     editButton: {
//       backgroundColor: '#007bff',
//       color: 'white',
//       border: 'none',
//     },
//   };

//   return (
//     <div style={styles.container}>
//       {/* Left Panel - User Creation Form */}
//       <div style={styles.leftPanel}>
//         <div style={styles.card}>
//           <h2>Create New User</h2>
//           <form onSubmit={handleCreateUser}>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               style={styles.input}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               style={styles.input}
//             />
//             <input
//               type="password"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//               style={styles.input}
//             />
            
//             <select
//               value={selectedBranch}
//               onChange={(e) => setSelectedBranch(e.target.value)}
//               required
//               style={styles.select}
//             >
//               <option value="">Select Branch</option>
//               {branches.map((branch) => (
//                 <option key={branch} value={branch}>
//                   {branch}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               style={styles.select}
//             >
//               <option value="user">User</option>
//               <option value="admin">Admin</option>
//             </select>

//             {error && <p style={styles.errorMessage}>{error}</p>}
//             {success && <p style={styles.successMessage}>{success}</p>}

//             <button 
//               type="submit" 
//               disabled={loading}
//               style={styles.button}
//             >
//               {loading ? 'Creating User...' : 'Create User'}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Right Panel - User Management */}
//       <div style={styles.rightPanel}>
//         <h2>Existing Users</h2>
//         {users.map((user) => (
//           <div key={user.id} style={styles.userCard}>
//             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//               <strong>{user.email}</strong>
//               <div>
//                 <button 
//                   onClick={() => {
//                     setExpandedUserId(expandedUserId === user.id ? null : user.id);
//                     setEditingUser(null);
//                   }}
//                   style={{...styles.actionButton, backgroundColor: '#17a2b8', color: 'white'}}
//                 >
//                   {expandedUserId === user.id ? 'Collapse' : 'Expand'}
//                 </button>
//               </div>
//             </div>
            
//             {expandedUserId === user.id && (
//               <div>
//                 {editingUser ? (
//                   <form onSubmit={handleUpdateUser}>
//                     <input
//                       type="email"
//                       value={editingUser.email}
//                       onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
//                       style={styles.input}
//                       required
//                     />
//                     <select
//                       value={editingUser.branch}
//                       onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
//                       style={styles.select}
//                       required
//                     >
//                       {branches.map((branch) => (
//                         <option key={branch} value={branch}>
//                           {branch}
//                         </option>
//                       ))}
//                     </select>
//                     <select
//                       value={editingUser.role}
//                       onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
//                       style={styles.select}
//                     >
//                       <option value="user">User</option>
//                       <option value="admin">Admin</option>
//                     </select>
//                     <div style={{display: 'flex', justifyContent: 'space-between'}}>
//                       <button 
//                         type="submit" 
//                         style={{...styles.actionButton, ...styles.editButton}}
//                         disabled={loading}
//                       >
//                         {loading ? 'Updating...' : 'Save Changes'}
//                       </button>
//                       <button 
//                         type="button"
//                         onClick={() => {
//                           setEditingUser(null);
//                           setExpandedUserId(null);
//                         }}
//                         style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 ) : (
//                   <div>
//                     <p>Branch: {user.branch}</p>
//                     <p>Role: {user.role}</p>
//                     <p>Created At: {new Date(user.created_at).toLocaleString()}</p>
                    
//                     <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
//                       <button 
//                         onClick={() => handleDeleteUser(user.id)}
//                         style={{...styles.actionButton, ...styles.deleteButton}}
//                       >
//                         Delete
//                       </button>
//                       <button 
//                         onClick={() => {
//                           setEditingUser({
//                             id: user.id,
//                             email: user.email,
//                             branch: user.branch,
//                             role: user.role
//                           });
//                         }}
//                         style={{...styles.actionButton, ...styles.editButton}}
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddUsers;







// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";

// const UsersManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [expandedUserId, setExpandedUserId] = useState(null);
//   const [editingUser, setEditingUser] = useState(null);
//   const [branches, setBranches] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { token } = useVisitor();

//   const API_URL = "http://localhost:5001/users";
//   const VISITORS_URL = "http://localhost:5001/visitors";

//   // Fetch branches and users on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch branches
//         const branchResponse = await fetch(VISITORS_URL);
//         if (!branchResponse.ok) {
//           throw new Error(`API response error: ${branchResponse.status}`);
//         }
//         const branchData = await branchResponse.json();
//         const uniqueBranches = [...new Set(branchData
//           .map(entry => entry.branchname)
//           .filter(branch => branch && branch.trim() !== "")
//         )];
//         setBranches(uniqueBranches.sort());

//         // Fetch users
//         const usersResponse = await fetch(API_URL, {
//           headers: {
//             'x-auth-token': token
//           }
//         });
//         if (!usersResponse.ok) {
//           throw new Error(`API response error: ${usersResponse.status}`);
//         }
//         const userData = await usersResponse.json();
//         setUsers(userData);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load data. Please try again later.");
//       }
//     };

//     fetchData();
//   }, [token]);

//   // Handle user deletion
//   const handleDeleteUser = async (userId) => {
//     try {
//       const response = await fetch(`${API_URL}/${userId}`, {
//         method: 'DELETE',
//         headers: {
//           'x-auth-token': token
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete user');
//       }

//       // Remove user from local state
//       setUsers(users.filter(user => user.id !== userId));
//       setSuccess("User deleted successfully!");
//       setExpandedUserId(null);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle user update
//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/${editingUser.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify({
//           email: editingUser.email,
//           branch: editingUser.branch,
//           role: editingUser.role
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'User update failed');
//       }

//       // Update users list
//       setUsers(users.map(user => 
//         user.id === editingUser.id ? { ...user, ...editingUser } : user
//       ));

//       setSuccess("User updated successfully!");
//       setEditingUser(null);
//       setExpandedUserId(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Styles
//   const styles = {
//     container: {
//       padding: '20px',
//       backgroundColor: '#f0f2f5',
//       minHeight: '100vh',
//     },
//     userCard: {
//       backgroundColor: '#fff',
//       borderRadius: '8px',
//       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//       margin: '10px 0',
//       padding: '15px',
//     },
//     cardHeader: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },
//     input: {
//       width: '100%',
//       padding: '0.5rem',
//       marginBottom: '10px',
//       border: '1px solid #ccc',
//       borderRadius: '4px',
//     },
//     buttonGroup: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       marginTop: '10px',
//     },
//     button: {
//       padding: '8px 15px',
//       borderRadius: '4px',
//       cursor: 'pointer',
//     },
//     deleteButton: {
//       backgroundColor: '#dc3545',
//       color: 'white',
//       border: 'none',
//     },
//     editButton: {
//       backgroundColor: '#007bff',
//       color: 'white',
//       border: 'none',
//     },
//     toggleButton: {
//       backgroundColor: '#28a745',
//       color: 'white',
//       border: 'none',
//     },
//     errorMessage: {
//       color: '#dc3545',
//       marginBottom: '10px',
//     },
//     successMessage: {
//       color: '#28a745',
//       marginBottom: '10px',
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <h1>User Management</h1>
      
//       {error && <div style={styles.errorMessage}>{error}</div>}
//       {success && <div style={styles.successMessage}>{success}</div>}
      
//       {users.map((user) => (
//         <div key={user.id} style={styles.userCard}>
//           <div style={styles.cardHeader}>
//             <strong>{user.email}</strong>
//             <button 
//               onClick={() => {
//                 setExpandedUserId(expandedUserId === user.id ? null : user.id);
//                 setEditingUser(null);
//               }}
//               style={styles.button}
//             >
//               {expandedUserId === user.id ? 'Collapse' : 'Expand'}
//             </button>
//           </div>
          
//           {expandedUserId === user.id && (
//             <div>
//               {editingUser ? (
//                 <form onSubmit={handleUpdateUser}>
//                   <input
//                     type="email"
//                     value={editingUser.email}
//                     onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
//                     style={styles.input}
//                     required
//                   />
//                   <select
//                     value={editingUser.branch}
//                     onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
//                     style={styles.input}
//                     required
//                   >
//                     {branches.map((branch) => (
//                       <option key={branch} value={branch}>
//                         {branch}
//                       </option>
//                     ))}
//                   </select>
//                   <select
//                     value={editingUser.role}
//                     onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
//                     style={styles.input}
//                   >
//                     <option value="user">User</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                   <div style={styles.buttonGroup}>
//                     <button 
//                       type="submit" 
//                       style={{...styles.button, ...styles.editButton}}
//                       disabled={loading}
//                     >
//                       {loading ? 'Updating...' : 'Save Changes'}
//                     </button>
//                     <button 
//                       type="button"
//                       onClick={() => {
//                         setEditingUser(null);
//                         setExpandedUserId(null);
//                       }}
//                       style={{...styles.button, backgroundColor: '#6c757d', color: 'white'}}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               ) : (
//                 <div>
//                   <p>Branch: {user.branch}</p>
//                   <p>Role: {user.role}</p>
//                   <p>Created At: {new Date(user.created_at).toLocaleString()}</p>
                  
//                   <div style={styles.buttonGroup}>
//                     <button 
//                       onClick={() => handleDeleteUser(user.id)}
//                       style={{...styles.button, ...styles.deleteButton}}
//                     >
//                       Delete
//                     </button>
//                     <button 
//                       onClick={() => {
//                         setEditingUser({
//                           id: user.id,
//                           email: user.email,
//                           branch: user.branch,
//                           role: user.role
//                         });
//                       }}
//                       style={{...styles.button, ...styles.editButton}}
//                     >
//                       Edit
//                     </button>
//                     <button 
//                       style={{...styles.button, ...styles.toggleButton}}
//                     >
//                       {user.is_active ? 'Disable' : 'Enable'}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UsersManagement;




// add this to the uesre controller
//ALTER TABLE users_table ADD COLUMN is_active BOOLEAN DEFAULT true;

// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { email, branch, role, is_active } = req.body;

//   try {
//     const result = await pool.query(
//       'UPDATE users_table SET email = $1, branch = $2, role = $3, is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *',
//       [email, branch, role, is_active, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       message: 'User updated successfully',
//       user: {
//         id: result.rows[0].id,
//         email: result.rows[0].email,
//         branch: result.rows[0].branch,
//         role: result.rows[0].role,
//         is_active: result.rows[0].is_active
//       }
//     });
//   } catch (err) {
//     console.error('User update error:', err);
//     res.status(500).json({ error: 'Server error during user update' });
//   }
// };

// // Update getAllUsers to include is_active
// const getAllUsers = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT id, email, branch, role, created_at, is_active FROM users_table');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ error: 'Server error while fetching users' });
//   }
// };

// module.exports = {
//   createUser,
//   getAllUsers,
//   updateUser,
//   deleteUser
// };