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
import React, { useState } from "react";
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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLogin = (email) => {
    setUserEmail(email); // Save the email
    setIsAuthenticated(true); // Authenticate user
  };

  const maskedEmail = userEmail
    ? `${"*".repeat(8)}${userEmail.slice(8)}`
    : "";

  return (
    <Router>
      <div className="app">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <nav className="sidebar">
              <div className="profile-section">
                <AiOutlineUser className="profile-icon" />
                <p className="profile-name">{maskedEmail}</p>
              </div>
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
                <li>
                  <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
                    <MdReport className="icon" />
                    Reports
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                    <AiOutlineBarChart className="icon" />
                    Analytics
                  </NavLink>
                </li>
              </ul>
            </nav>
            <main className="content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/visitor-logs" element={<VisitorLogs />} />
                <Route path="/visitor-details/:id" element={<VisitorDetail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
