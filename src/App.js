// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "../src/Dashboard/Dashboard";
// import VisitorLogs from "../src/VisitorLogs/VisitorLogs";
// import VisitorDetail from "../src/VisitorDetail/VisitorDetail";
// import Reports from "../src/Reports/Reports";
// import Analytics from "../src/Analytics/Analytics";
// import "./styles.css";
// import { AiOutlineDashboard, AiOutlineBarChart, AiOutlineUser } from "react-icons/ai";
// import { BsPeople } from "react-icons/bs";
// import { MdReport } from "react-icons/md";

// const App = () => {
//   return (
//     <Router>
//       <div className="app">
//         <nav className="sidebar">
//           {/* Profile Section */}
//           <div className="profile-section">
//             <AiOutlineUser className="profile-icon" />
//             <p className="profile-name">Admin Name</p>
//           </div>
//           {/* Sidebar Menu */}
//           <ul>
//             <li>
//               <a href="/">
//                 <AiOutlineDashboard className="icon" />
//                 Dashboard
//               </a>
//             </li>
//             <li>
//               <a href="/visitor-logs">
//                 <BsPeople className="icon" />
//                 Visitor Logs
//               </a>
//             </li>
//             <li>
//               <a href="/reports">
//                 <MdReport className="icon" />
//                 Reports
//               </a>
//             </li>
//             <li>
//               <a href="/analytics">
//                 <AiOutlineBarChart className="icon" />
//                 Analytics
//               </a>
//             </li>
//           </ul>
//         </nav>
//         <main className="content">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/visitor-logs" element={<VisitorLogs />} />
//             <Route path="/visitor-details/:id" element={<VisitorDetail />} />            <Route path="/reports" element={<Reports />} />
//             <Route path="/analytics" element={<Analytics />} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// };

// export default App;


// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
// import Dashboard from "../src/Dashboard/Dashboard";
// import VisitorLogs from "../src/VisitorLogs/VisitorLogs";
// import VisitorDetail from "../src/VisitorDetail/VisitorDetail";
// import Reports from "../src/Reports/Reports";
// import Analytics from "../src/Analytics/Analytics";
// import Login from "../src/Login/Login";
// import "./styles.css";
// import { AiOutlineDashboard, AiOutlineBarChart, AiOutlineUser } from "react-icons/ai";
// import { BsPeople } from "react-icons/bs";
// import { MdReport } from "react-icons/md";
// import {VisitorProvider} from "../src/context/VisitorContext"
// import DispatchDash from "./DispatchDash/DispatchDash";
// import DispatchReport from "../src/DispactReport/DispatchReport";
// import Dispatch from "../src/Dispatch/Dispatch";
// import Graphs from "./Graphs/Graphs";
// import AddUsers from "../src/AddUsers/AddUsers"
// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userEmail, setUserEmail] = useState("");

//   const handleLogin = (email) => {
//     setUserEmail(email); // Save the email
//     setIsAuthenticated(true); // Authenticate user
//   };

//   const maskedEmail = userEmail
//     ? `${"*".repeat(8)}${userEmail.slice(8)}`
//     : "";

//   return (
//     <VisitorProvider>
//     <Router>
//       <div className="app">
//         {!isAuthenticated ? (
//           <Login onLogin={handleLogin} />
//         ) : (
//           <>
//             <nav className="sidebar">
//               <div className="profile-section">
//                 <AiOutlineUser className="profile-icon" />
//                 <p className="profile-name">{maskedEmail}</p>
//               </div>
//               <ul className="menu">
//                 <li>
//                   <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <AiOutlineDashboard className="icon" />
//                     Dashboard
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/visitor-logs" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <BsPeople className="icon" />
//                     Visitor Logs
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <MdReport className="icon" />
//                     Reports
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/DispatchDash" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <AiOutlineBarChart className="icon" />
//                     Dispatchs
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/AddUsers" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <AiOutlineBarChart className="icon" />
//                     Manage Users
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
//                     <AiOutlineBarChart className="icon" />
//                     Analytics
//                   </NavLink>
//                 </li>
               
//               </ul>
//             </nav>
//             <main className="content">
             
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/visitor-logs" element={<VisitorLogs />} />
//                 <Route path="/visitor-details/:id" element={<VisitorDetail />} />
//                 <Route path="/reports" element={<Reports />} />
//                 <Route path="/analytics" element={<Analytics />} />
//                 <Route path="/DispatchDash" element={<DispatchDash />} />
//                 <Route path="/Dispatch" element={<Dispatch />} />
//                 <Route path="/DispatchReport" element={<DispatchReport />} />
//                 <Route path="/Graphs" element={<Graphs />} />
//                 <Route path="AddUsers" element={<AddUsers />} />
//               </Routes>
             
//             </main>
//           </>
//         )}
//       </div>
//     </Router>
//     </VisitorProvider>
//   );
// };

// export default App;
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "../src/Dashboard/Dashboard";
import VisitorLogs from "../src/VisitorLogs/VisitorLogs";
import VisitorDetail from "../src/VisitorDetail/VisitorDetail";
import Reports from "../src/Reports/Reports";
import Analytics from "../src/Analytics/Analytics";
import Login from "../src/Login/Login";
import "./styles.css";
import { AiOutlineDashboard, AiOutlineBarChart, AiOutlineUser } from "react-icons/ai";
import { BsPeople } from "react-icons/bs";
import { MdReport } from "react-icons/md";
import { VisitorProvider, useVisitor } from "../src/context/VisitorContext";
// import DispatchDash from "./DispatchDash/DispatchDash";
// import DispatchReport from "../src/DispactReport/DispatchReport";
// import Dispatch from "../src/Dispatch/Dispatch";
import Graphs from "./Graphs/Graphs";
import AddUsers from "../src/AddUsers/AddUsers";

const AppContent = ({ handleLogin, userEmail }) => {
  const { user, authenticated } = useVisitor();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (user && user.role) {
      setIsAdmin(user.role === "admin");
    } else {
      // Check localStorage if user role isn't in context
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setIsAdmin(userData.role === "admin");
        } catch (err) {
          console.error("Error parsing user data from localStorage:", err);
          setIsAdmin(false);
        }
      }
    }
  }, [user]);
   
    

  const maskedEmail = userEmail
    ? `${"*".repeat(8)}${userEmail.slice(8)}`
    : "";

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <nav className="sidebar">
        



        <ul className="menu">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              <AiOutlineDashboard className="icon" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/visitor-logs" className={({ isActive }) => (isActive ? "active" : "")}>
              <BsPeople className="icon" />
              Visitor Logs
            </NavLink>
          </li>
          {/* <li>
            <NavLink to="/DispatchDash" className={({ isActive }) => (isActive ? "active" : "")}>
              <MdReport className="icon" />
              Dispatch
            </NavLink>
          </li> */}
          <li>
            <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
              <MdReport className="icon" />
              Reports
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/AddUsers" className={({ isActive }) => (isActive ? "active" : "")}>
                <AiOutlineBarChart className="icon" />
                Manage Users
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
              <AiOutlineBarChart className="icon" />
              Analytics
            </NavLink>
          </li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px', padding: '1px', backgroundColor: '#f0f0f0',}}>
    <img 
        src="/FNB logo.png" 
        alt="Profile Logo" 
//         className="profile-icon" 
        style={{ width: '140px', height: '140px', marginLeft:'40px'}} 
    />
    <p className="profile-name" style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333' }}>{maskedEmail}</p>
</div>

      </nav>

      
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visitor-logs" element={<VisitorLogs />} />
          <Route path="/visitor-details/:id" element={<VisitorDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* <Route path="/DispatchDash" element={<DispatchDash />} />
          <Route path="/Dispatch" element={<Dispatch />} />
          <Route path="/DispatchReport" element={<DispatchReport />} /> */}
          <Route path="/Graphs" element={<Graphs />} />
          {isAdmin && <Route path="/AddUsers" element={<AddUsers />} />}
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email) => {
    setUserEmail(email); // Save the email
    setIsAuthenticated(true); // Authenticate user
  };

  return (
    <VisitorProvider>
      <Router>
        <div className="app">
          <AppContent 
            handleLogin={handleLogin} 
            userEmail={userEmail} 
          />
        </div>
        
      </Router>
    </VisitorProvider>
  );
};

export default App;
 