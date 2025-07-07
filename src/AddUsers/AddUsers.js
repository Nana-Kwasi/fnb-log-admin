
// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";

// const AddUsers = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [role, setRole] = useState("user");

//   const [users, setUsers] = useState([]);
//   const [expandedUserId, setExpandedUserId] = useState(null);
//   const [editingUser, setEditingUser] = useState(null);
//   const [branches, setBranches] = useState([]);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [deleteUserId, setDeleteUserId] = useState(null); // New state for delete confirmation

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
//     setLoading(true);
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
//     } finally {
//       setLoading(false);
//       setDeleteUserId(null); // Reset delete confirmation state
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
//       width: '60%',
//       paddingRight: '20px',
//     },
//     rightPanel: {
//       width: '50%',
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
//       backgroundColor: 'red',
//       color: 'white',
//       border: 'none',
//     },
//     editButton: {
//       backgroundColor: '#007bff',
//       color: 'white',
//       border: 'none',
//     },
//     confirmationDialog: {
//       position: 'fixed',
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)',
//       padding: '20px',
//       border: '1px solid #ccc',
//       borderRadius: '8px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       backgroundColor: 'white',
//       zIndex: 1000,
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
//               {/* <option value="admin">Admin</option> */}
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
//         <h2>All Users</h2>
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
//                       style={styles.select}                    >
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
//                         onClick={() => setDeleteUserId(user.id)} // Set user ID for delete confirmation
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

//       {/* Delete Confirmation Dialog */}
//       {deleteUserId && (
//         <div style={styles.confirmationDialog}>
//           <p>Are you sure you want to delete this user?</p>
//           <div style={{display: 'flex', justifyContent: 'space-between'}}>
//             <button 
//               onClick={() => handleDeleteUser(deleteUserId)}
//               style={{...styles.actionButton, ...styles.deleteButton}}
//             >
//               Yes
//             </button>
//             <button 
//               onClick={() => setDeleteUserId(null)}
//               style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddUsers;





//new addusers



// import React, { useState, useEffect } from "react";
// import { useVisitor } from "../context/VisitorContext";

// const AddUsers = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [selectedBranch, setSelectedBranch] = useState("");
//   const [role, setRole] = useState("user");

//   const [users, setUsers] = useState([]);
//   const [expandedUserId, setExpandedUserId] = useState(null);
//   const [editingUser, setEditingUser] = useState(null);
//   const [branches, setBranches] = useState([]);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [deleteUserId, setDeleteUserId] = useState(null);
//   const [fetchingBranches, setFetchingBranches] = useState(true);

//   const { token } = useVisitor();

//   const API_URL = "http://localhost:5001/users";
//   const BRANCHES_URL = "http://localhost:5001/visitors/index";

//   // Fetch branches and users on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch branches - using the same API as in Login component
//         setFetchingBranches(true);
//         console.log("Fetching branches from:", BRANCHES_URL);
//         const branchResponse = await fetch(BRANCHES_URL);
        
//         if (!branchResponse.ok) {
//           throw new Error(`API response error: ${branchResponse.status}`);
//         }
        
//         const branchData = await branchResponse.json();
//         console.log(`Received ${branchData.length} branches from API`);
        
//         // Store branches with their names and codes
//         const branchOptions = branchData
//           .filter(branch => branch.branchName && branch.branchName.trim() !== "")
//           .sort((a, b) => a.branchName.localeCompare(b.branchName));
        
//         console.log(`Found ${branchOptions.length} unique branches`);
//         setBranches(branchOptions);
//         setFetchingBranches(false);

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
//         setFetchingBranches(false);
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

//     // Find the selected branch code from the branches array
//     const selectedBranchObj = branches.find(branch => branch.branchName === selectedBranch);
    
//     if (!selectedBranchObj) {
//       setError("Invalid branch selection");
//       setLoading(false);
//       return;
//     }
    
//     const branchCode = selectedBranchObj.branchCode;
//     console.log(`Selected branch: ${selectedBranch} (code: ${branchCode})`);

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
//           branchCode: branchCode,
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
//     setLoading(true);
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
//     } finally {
//       setLoading(false);
//       setDeleteUserId(null);
//     }
//   };

//   // Handle user update
//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // Password validation if changing password
//     if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     // Password strength check if changing password
//     if (editingUser.password && editingUser.password.length < 8) {
//       setError("Password must be at least 8 characters long");
//       setLoading(false);
//       return;
//     }

//     // Find the selected branch code
//     const selectedBranchObj = branches.find(branch => branch.branchName === editingUser.branch);
    
//     if (!selectedBranchObj) {
//       setError("Invalid branch selection");
//       setLoading(false);
//       return;
//     }
    
//     const branchCode = selectedBranchObj.branchCode;

//     try {
//       const updateData = {
//         email: editingUser.email,
//         branch: editingUser.branch,
//         branchCode: branchCode,
//         role: editingUser.role,
//         isActive: editingUser.isActive
//       };

//       // Only include password if it has been changed
//       if (editingUser.password) {
//         updateData.password = editingUser.password;
//       }

//       const response = await fetch(`${API_URL}/${editingUser.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify(updateData)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'User update failed');
//       }

//       // Update users list
//       setUsers(users.map(user => 
//         user.id === editingUser.id ? { ...user, ...updateData } : user
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

//   // Handle user enable/disable
//   const handleToggleUserStatus = async (user) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/${user.id}/status`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-auth-token': token
//         },
//         body: JSON.stringify({
//           isActive: !user.isActive
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to update user status');
//       }

//       // Update users list
//       setUsers(users.map(u => 
//         u.id === user.id ? { ...u, isActive: !u.isActive } : u
//       ));

//       setSuccess(`User ${!user.isActive ? 'enabled' : 'disabled'} successfully!`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Styles (same as previous implementation)
//    const styles = {
//     container: {
//       display: 'flex',
//       padding: '20px',
//       backgroundColor: '#f0f2f5',
//       minHeight: '100vh',
//     },
//     leftPanel: {
//       width: '60%',
//       paddingRight: '20px',
//     },
//     rightPanel: {
//       width: '50%',
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
//       position: 'relative',
//     },
//     selectContainer: {
//       position: 'relative',
//       marginBottom: '1rem',
//     },
//     selectSpinner: {
//       position: 'absolute',
//       right: '10px',
//       top: '50%',
//       transform: 'translateY(-50%)',
//       width: '20px',
//       height: '20px',
//       border: '2px solid #f3f3f3',
//       borderTop: '2px solid #3498db',
//       borderRadius: '50%',
//       animation: 'spin 1s linear infinite',
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
//       backgroundColor: 'red',
//       color: 'white',
//       border: 'none',
//     },
//     editButton: {
//       backgroundColor: '#007bff',
//       color: 'white',
//       border: 'none',
//     },
//     confirmationDialog: {
//       position: 'fixed',
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)',
//       padding: '20px',
//       border: '1px solid #ccc',
//       borderRadius: '8px',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//       backgroundColor: 'white',
//       zIndex: 1000,
//     },
//     statusBadge: {
//       display: 'inline-block',
//       padding: '3px 8px',
//       borderRadius: '4px',
//       fontSize: '12px',
//       fontWeight: 'bold',
//       marginLeft: '10px',
//     },
//     statusActive: {
//       backgroundColor: '#4CAF50',
//       color: 'white',
//     },
//     statusInactive: {
//       backgroundColor: '#F44336',
//       color: 'white',
//     },
//     toggleButton: {
//       padding: '6px 12px',
//       borderRadius: '4px',
//       cursor: 'pointer',
//       border: 'none',
//       color: 'white',
//     },
//     enableButton: {
//       backgroundColor: '#4CAF50',
//     },
//     disableButton: {
//       backgroundColor: '#F44336',
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
            
//             <div style={styles.selectContainer}>
//               <select
//                 value={selectedBranch}
//                 onChange={(e) => setSelectedBranch(e.target.value)}
//                 required
//                 style={styles.select}
//                 disabled={fetchingBranches}
//               >
//                 <option value="">Select Branch</option>
//                 {branches.map((branch) => (
//                   <option key={branch.branchCode} value={branch.branchName}>
//                     {branch.branchName}
//                   </option>
//                 ))}
//               </select>
//               {fetchingBranches && (
//                 <div style={styles.selectSpinner}></div>
//               )}
//             </div>

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
//               disabled={loading || fetchingBranches}
//               style={styles.button}
//             >
//               {loading ? 'Creating User...' : 'Create User'}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Right Panel - User Management */}
//       <div style={styles.rightPanel}>
//         <h2>All Users</h2>
//         {users.map((user) => (
//           <div key={user.id} style={styles.userCard}>
//             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//               <div>
//                 <strong>{user.email}</strong>
//                 <span 
//                   style={{
//                     ...styles.statusBadge, 
//                     // ...(user.isActive ? styles.statusActive : styles.statusInactive)
//                   }}
//                 >
//                   {user.isActive }
//                 </span>
//               </div>
//               <div>
//                 {/* <button 
//                   onClick={() => handleToggleUserStatus(user)}
//                   style={{
//                     ...styles.actionButton, 
//                     ...styles.toggleButton,
//                     ...(user.isActive ? styles.disableButton : styles.enableButton)
//                   }}
//                   disabled={loading}
//                 >
//                   {user.isActive ? 'Disable' : 'Enable'}
//                 </button> */}
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
//                 {editingUser && editingUser.id === user.id ? (
//                   <form onSubmit={handleUpdateUser}>
//                     <input
//                       type="email"
//                       value={editingUser.email}
//                       onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
//                       style={styles.input}
//                       required
//                     />
//                     <input
//                       type="password"
//                       placeholder="New Password (leave blank to keep current)"
//                       value={editingUser.password || ''}
//                       onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
//                       style={styles.input}
//                     />
//                     {editingUser.password && (
//                       <input
//                         type="password"
//                         placeholder="Confirm New Password"
//                         value={editingUser.confirmPassword || ''}
//                         onChange={(e) => setEditingUser({...editingUser, confirmPassword: e.target.value})}
//                         style={styles.input}
//                         required={!!editingUser.password}
//                       />
//                     )}
//                     <div style={styles.selectContainer}>
//                       <select
//                         value={editingUser.branch}
//                         onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
//                         style={styles.select}
//                         required
//                         disabled={fetchingBranches}
//                       >
//                         {branches.map((branch) => (
//                           <option key={branch.branchCode} value={branch.branchName}>
//                             {branch.branchName}
//                           </option>
//                         ))}
//                       </select>
//                       {fetchingBranches && (
//                         <div style={styles.selectSpinner}></div>
//                       )}
//                     </div>
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
//                     <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                    
//                     <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
//                       <button 
//                         onClick={() => setDeleteUserId(user.id)}
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
//                             role: user.role,
//                             isActive: user.isActive,
//                             password: '',
//                             confirmPassword: ''
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

//       {/* Delete Confirmation Dialog */}
//       {deleteUserId && (
//         <div style={styles.confirmationDialog}>
//           <p>Are you sure you want to delete this user?</p>
//           <div style={{display: 'flex', justifyContent: 'space-between'}}>
//             <button 
//               onClick={() => handleDeleteUser(deleteUserId)}
//               style={{...styles.actionButton, ...styles.deleteButton}}
//             >
//               Yes
//             </button>
//             <button 
//               onClick={() => setDeleteUserId(null)}
//               style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Define the spinner animation */}
//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default AddUsers;

import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";

const AddUsers = () => {
  const [fNumber, setFNumber] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [role, setRole] = useState("user");

  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [branches, setBranches] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [fetchingBranches, setFetchingBranches] = useState(true);

  // Branch management states
  const [showBranchManagement, setShowBranchManagement] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteBranchId, setDeleteBranchId] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState("");
  const [branchSuccess, setBranchSuccess] = useState("");
   
  const { token } = useVisitor();

  const API_URL = "http://localhost:5001/users";
  const BRANCHES_URL = "http://localhost:5001/fnb_branches";

  // Fetch branches from the new API
  const fetchBranches = async () => {
    try {
      setFetchingBranches(true);
      console.log("Fetching branches from:", BRANCHES_URL);
      const branchResponse = await fetch(BRANCHES_URL, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!branchResponse.ok) {
        throw new Error(`API response error: ${branchResponse.status}`);
      }
      
      const branchData = await branchResponse.json();
      console.log(`Received ${branchData.length} branches from API`);
      
      // Store branches with their names and codes
      const branchOptions = branchData
        .filter(branch => branch.branch_name && branch.branch_name.trim() !== "")
        .sort((a, b) => a.branch_name.localeCompare(b.branch_name));
      
      console.log(`Found ${branchOptions.length} unique branches`);
      setBranches(branchOptions);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches. Please try again later.");
    } finally {
      setFetchingBranches(false);
    }
  };

  // Fetch users and branches on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        await fetchBranches();

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
    if (!fNumber || !selectedBranch) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    // Find the selected branch code from the branches array
    const selectedBranchObj = branches.find(branch => branch.branch_name === selectedBranch);
    
    if (!selectedBranchObj) {
      setError("Invalid branch selection");
      setLoading(false);
      return;
    }
    
    const branchCode = selectedBranchObj.branch_code;
    console.log(`Selected branch: ${selectedBranch} (code: ${branchCode})`);

    try {
      // First call our backend to verify the F-number
      const verifyResponse = await fetch(`${API_URL}/verify-fnumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          fnumber: fNumber
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to verify F-number');
      }

      if (!verifyData.isValid) {
        throw new Error('User not found in APPSTEAM_DEV_IT_Works group');
      }

      // If verification is successful, create the user
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          email: fNumber, // Using F-number as the email/username
          branch: selectedBranch,
          branchCode: branchCode,
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
      setFNumber("");
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
    setLoading(true);
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
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  };

  // Handle user update
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Find the selected branch code
    const selectedBranchObj = branches.find(branch => branch.branch_name === editingUser.branch);
    
    if (!selectedBranchObj) {
      setError("Invalid branch selection");
      setLoading(false);
      return;
    }
    
    const branchCode = selectedBranchObj.branch_code;

    try {
      const updateData = {
        email: editingUser.email,
        branch: editingUser.branch,
        branchCode: branchCode,
        role: editingUser.role,
        isActive: editingUser.isActive
      };

      const response = await fetch(`${API_URL}/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'User update failed');
      }

      // Update users list
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...updateData } : user
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

  // Handle user enable/disable
  const handleToggleUserStatus = async (user) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      // Update users list
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      ));

      setSuccess(`User ${!user.isActive ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Branch Management Functions
  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setBranchError("");
    setBranchSuccess("");

    if (!newBranchName || !newBranchCode) {
      setBranchError("Please fill in all branch fields");
      return;
    }

    setBranchLoading(true);

    try {
      const response = await fetch(BRANCHES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          branch_name: newBranchName,
          branch_code: newBranchCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Branch creation failed');
      }

      // Add new branch to branches list
      setBranches([...branches, data.branch]);
      setBranchSuccess("Branch created successfully!");
      
      // Reset form
      setNewBranchName("");
      setNewBranchCode("");
    } catch (err) {
      setBranchError(err.message);
    } finally {
      setBranchLoading(false);
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    setBranchLoading(true);

    try {
      const response = await fetch(`${BRANCHES_URL}/${editingBranch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          branch_name: editingBranch.branch_name,
          branch_code: editingBranch.branch_code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Branch update failed');
      }

      // Update branches list
      setBranches(branches.map(branch => 
        branch.id === editingBranch.id ? { ...branch, ...editingBranch } : branch
      ));

      setBranchSuccess("Branch updated successfully!");
      setEditingBranch(null);
    } catch (err) {
      setBranchError(err.message);
    } finally {
      setBranchLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    setBranchLoading(true);
    try {
      const response = await fetch(`${BRANCHES_URL}/${branchId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }

      // Remove branch from local state
      setBranches(branches.filter(branch => branch.id !== branchId));
      setBranchSuccess("Branch deleted successfully!");
    } catch (err) {
      setBranchError(err.message);
    } finally {
      setBranchLoading(false);
      setDeleteBranchId(null);
    }
  };

  // Styles
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
      position: 'relative',
    },
    selectContainer: {
      position: 'relative',
      marginBottom: '1rem',
    },
    selectSpinner: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      border: '2px solid #f3f3f3',
      borderTop: '2px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    userCard: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      margin: '10px 0',
      padding: '15px',
    },
    branchCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
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
    confirmationDialog: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      zIndex: 1000,
    },
    statusBadge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginLeft: '10px',
    },
    statusActive: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    statusInactive: {
      backgroundColor: '#F44336',
      color: 'white',
    },
    toggleButton: {
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: 'none',
      color: 'white',
    },
    enableButton: {
      backgroundColor: '#4CAF50',
    },
    disableButton: {
      backgroundColor: '#F44336',
    },
    branchManagementButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '20px',
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
              type="text"
              placeholder="F Number"
              value={fNumber}
              onChange={(e) => setFNumber(e.target.value)}
              required
              style={styles.input}
            />
            
            <div style={styles.selectContainer}>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                required
                style={styles.select}
                disabled={fetchingBranches}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.branch_name}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              {fetchingBranches && (
                <div style={styles.selectSpinner}></div>
              )}
            </div>

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
              disabled={loading || fetchingBranches}
              style={styles.button}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* Branch Management Section */}
        <div style={styles.card}>
          <button 
            onClick={() => setShowBranchManagement(!showBranchManagement)}
            style={styles.branchManagementButton}
          >
            {showBranchManagement ? 'Hide Branch Management' : 'Manage Branches'}
          </button>

          {showBranchManagement && (
            <div>
              <h3>Branch Management</h3>
              
              {/* Add New Branch Form */}
              <form onSubmit={handleCreateBranch}>
                <input
                  type="text"
                  placeholder="Branch Name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  required
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="Branch Code"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  required
                  style={styles.input}
                />
                
                {branchError && <p style={styles.errorMessage}>{branchError}</p>}
                {branchSuccess && <p style={styles.successMessage}>{branchSuccess}</p>}

                <button 
                  type="submit" 
                  disabled={branchLoading}
                  style={{...styles.button, backgroundColor: '#28a745'}}
                >
                  {branchLoading ? 'Adding Branch...' : 'Add Branch'}
                </button>
              </form>

              {/* Existing Branches List */}
              <div style={{marginTop: '20px'}}>
                <h4>Existing Branches</h4>
                {branches.map((branch) => (
                  <div key={branch.id} style={styles.branchCard}>
                    {editingBranch && editingBranch.id === branch.id ? (
                      <form onSubmit={handleUpdateBranch}>
                        <input
                          type="text"
                          value={editingBranch.branch_name}
                          onChange={(e) => setEditingBranch({...editingBranch, branch_name: e.target.value})}
                          style={styles.input}
                          required
                        />
                        <input
                          type="text"
                          value={editingBranch.branch_code}
                          onChange={(e) => setEditingBranch({...editingBranch, branch_code: e.target.value})}
                          style={styles.input}
                          required
                        />
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <button 
                            type="submit" 
                            style={{...styles.actionButton, ...styles.editButton}}
                            disabled={branchLoading}
                          >
                            {branchLoading ? 'Updating...' : 'Save'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingBranch(null)}
                            style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <div>
                            <strong>{branch.branch_name}</strong>
                            <span style={{marginLeft: '10px', color: '#666'}}>
                              Code: {branch.branch_code}
                            </span>
                          </div>
                          <div>
                            <button 
                              onClick={() => setEditingBranch({
                                id: branch.id,
                                branch_name: branch.branch_name,
                                branch_code: branch.branch_code
                              })}
                              style={{...styles.actionButton, ...styles.editButton}}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => setDeleteBranchId(branch.id)}
                              style={{...styles.actionButton, ...styles.deleteButton}}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - User Management */}
      <div style={styles.rightPanel}>
        <h2>All Users</h2>
        {users.map((user) => (
          <div key={user.id} style={styles.userCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <strong>{user.email}</strong>
                <span 
                  style={{
                    ...styles.statusBadge, 
                    // ...(user.isActive ? styles.statusActive : styles.statusInactive)
                  }}
                >
                  {user.isActive}
                </span>
              </div>
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
                {editingUser && editingUser.id === user.id ? (
                  <form onSubmit={handleUpdateUser}>
                    <input
                      type="text"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      style={styles.input}
                      required
                    />
                    <div style={styles.selectContainer}>
                      <select
                        value={editingUser.branch}
                        onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
                        style={styles.select}
                        required
                        disabled={fetchingBranches}
                      >
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.branch_name}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      {fetchingBranches && (
                        <div style={styles.selectSpinner}></div>
                      )}
                    </div>
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
                    <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
                      <button 
                        onClick={() => setDeleteUserId(user.id)}
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
                            role: user.role,
                            isActive: user.isActive
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

      {/* Delete User Confirmation Dialog */}
      {deleteUserId && (
        <div style={styles.confirmationDialog}>
          <p>Are you sure you want to delete this user?</p>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <button 
              onClick={() => handleDeleteUser(deleteUserId)}
              style={{...styles.actionButton, ...styles.deleteButton}}
            >
              Yes
            </button>
            <button 
              onClick={() => setDeleteUserId(null)}
              style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Delete Branch Confirmation Dialog */}
      {deleteBranchId && (
        <div style={styles.confirmationDialog}>
          <p>Are you sure you want to delete this branch?</p>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <button 
              onClick={() => handleDeleteBranch(deleteBranchId)}
              style={{...styles.actionButton, ...styles.deleteButton}}
            >
              Yes
            </button>
            <button 
              onClick={() => setDeleteBranchId(null)}
              style={{...styles.actionButton, backgroundColor: '#6c757d', color: 'white'}}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Define the spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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