// import React, { useState } from "react";
// import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
// import { Line, Bar } from "react-chartjs-2";
// import { useNavigate } from "react-router-dom";
// import { useVisitor } from "../context/VisitorContext";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import "../dashboard.css";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// const Dashboard = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [modalVisible, setModalVisible] = useState(false);
//   const navigate = useNavigate();
  
//   // Use the visitor context
//   const { 
//     selectedBranch, 
//     branchData, 
//     selectedBranchName,
//     loading, 
//     error, 
//     authenticated 
//   } = useVisitor();

//   const { 
//     analyticsData, 
//     totalVisitors, 
//     visitorsToday, 
//     todayVisitorsData 
//   } = branchData;

//   // Check if user is authenticated
//   if (!authenticated && !loading) {
//     navigate("/login");
//     return null;
//   }

//   const fetchTodayVisitors = () => {
//     setModalVisible(true);
//   };

//   const closeModal = () => setModalVisible(false);

//   const previousMonth = () => {
//     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
//   };

//   const nextMonth = () => {
//     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
//   };

//   const generateCalendarDays = () => {
//     const daysInMonth = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() + 1,
//       0
//     ).getDate();
//     const firstDayOfMonth = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       1
//     ).getDay();

//     const calendarDays = [];
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       calendarDays.push(
//         <div key={`empty-${i}`} className="calendar-day empty"></div>
//       );
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const isToday =
//         new Date().getDate() === day &&
//         new Date().getMonth() === currentDate.getMonth() &&
//         new Date().getFullYear() === currentDate.getFullYear();

//       calendarDays.push(
//         <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
//           {day}
//         </div>
//       );
//     }
//     return calendarDays;
//   };

//   const barData = {
//     labels: analyticsData?.map((item) => item.month) || [],
//     datasets: [
//       {
//         label: "Visitors",
//         data: analyticsData?.map((item) => item.visits) || [],
//         backgroundColor: "rgba(41, 128, 185, 0.7)",
//         borderColor: "#2980b9",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const lineData = {
//     labels: analyticsData?.map((item) => item.month) || [],
//     datasets: [
//       {
//         label: "Visitors",
//         data: analyticsData?.map((item) => item.visits) || [],
//         backgroundColor: "rgba(26, 188, 156, 0.2)",
//         borderColor: "#1abc9c",
//         borderWidth: 2,
//         fill: true,
//         tension: 0.3,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: true, position: "top" },
//     },
//     scales: {
//       x: {
//         grid: { color: "rgba(0, 0, 0, 0.1)" },
//         ticks: { color: "#34495e", font: { size: 12 } },
//       },
//       y: {
//         grid: { color: "rgba(0, 0, 0, 0.1)" },
//         ticks: { color: "#34495e", font: { size: 17 } },
//       },
//     },
//   };

//   return (
//     <div 
//       className="dashboard" 
//       style={{
//         minHeight: '100vh',
//         padding: '20px'
//       }}>
//       <div className="dashboard-header">
//         <h1 style={{color:'green'}}>FNB LOGS ADMIN DASHBOARD</h1>
        
//         {selectedBranch && (
//           <div className="branch-display">
//             <h2>Branch: {selectedBranchName} {selectedBranch}</h2>
//           </div>
//         )}
//       </div>
      
//       {loading ? (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading dashboard data...</p>
//         </div>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : (
//         <>
//           <div className="calendar-container">
//             <div className="calendar-header">
//               <h2>Calendar</h2>
//               <div className="calendar-nav">
//                 <button onClick={previousMonth}>
//                   <AiOutlineLeft />
//                 </button>
//                 <span>
//                   {new Date(
//                     currentDate.getFullYear(),
//                     currentDate.getMonth()
//                   ).toLocaleString("default", { month: "long" })}{" "}
//                   {currentDate.getFullYear()}
//                 </span>
//                 <button onClick={nextMonth}>
//                   <AiOutlineRight />
//                 </button>
//               </div>
//             </div>
//             <div className="calendar-grid">{generateCalendarDays()}</div>
//           </div>

//           <div className="stats">
//             <div className="stat-card" onClick={fetchTodayVisitors}>
//               <AiOutlineUser className="icon" />
//               <h3 style={{ color: "white" }}>Visitors Today</h3>
//               <p style={{color:'white'}}>{visitorsToday}</p>
//               {selectedBranchName && <span className="branch-indicator">{selectedBranchName}</span>}
//             </div>
             
//             <div className="stat-card">
//               <AiOutlineTeam className="icon" />
//               <h3 style={{ color: "white" }}>Total Visitors</h3>
//               <p style={{color:'white'}}>{totalVisitors}</p>
//               {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
//             </div>
//           </div>

//           <div className="charts">
//             <div className="chart-container">
//               <h3 style={{color:'green'}}>
//                 Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//               </h3>
//               <Line data={lineData} options={chartOptions} />
//             </div>
//             <div className="chart-container">
//               <h3 style={{color:'green'}}>
//                 Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//               </h3>
//               <Bar data={barData} options={chartOptions} />
//             </div>
//           </div>

//           {modalVisible && (
//             <div className="modal">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h2 className="modal-title">
//                     Today's Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//                   </h2>
//                   <button className="close-button" onClick={closeModal}>&times;</button>
//                 </div>
//                 <div className="modal-body">
//                   {loading ? (
//                     <p>Loading...</p>
//                   ) : todayVisitorsData?.length > 0 ? (
//                     <table className="modal-table">
//                       <thead>
//                         <tr>
//                           <th>Name</th>
//                           <th>Company</th>
//                           <th>Purpose</th>
//                           <th>Reason</th>
//                           <th>Department</th>
//                           <th>Time In</th>
//                           <th>Time Out</th>
//                           <th>Telephone</th>
//                           <th>Branch</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {todayVisitorsData.map((visitor) => (
//                           <tr key={visitor.id || visitor.telephone}>
//                             <td>{visitor.name}</td>
//                             <td>{visitor.company}</td>
//                             <td>{visitor.purpose}</td>
//                             <td>{visitor.reason}</td>
//                             <td>{visitor.department}</td>
//                             <td>{visitor.timeIn || visitor.timein}</td>
//                             <td>{visitor.timeOut || visitor.timeout}</td>
//                             <td>{visitor.telephone}</td>
//                             <td>{visitor.branchname || visitor.branch}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <p>No visitors found for today.</p>
//                   )}
//                 </div>
//                 <div className="modal-footer">
//                   <button onClick={closeModal}>Close</button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineLogout } from "react-icons/ai";
import { Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  
  // Use the visitor context
  const { 
    selectedBranch, 
    branchData, 
    selectedBranchName,
    loading, 
    error, 
    authenticated,
    userProfile,
    logout
  } = useVisitor();

  const { 
    analyticsData, 
    totalVisitors, 
    visitorsToday, 
    todayVisitorsData 
  } = branchData;

  // Modified to use useEffect for authentication check instead of immediate redirect
  useEffect(() => {
    if (!authenticated && !loading) {
      navigate("/login");
    }
  }, [authenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchTodayVisitors = () => {
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      calendarDays.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          {day}
        </div>
      );
    }
    return calendarDays;
  };

  const barData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: "rgba(41, 128, 185, 0.7)",
        borderColor: "#2980b9",
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: "rgba(26, 188, 156, 0.2)",
        borderColor: "#1abc9c",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#34495e", font: { size: 12 } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#34495e", font: { size: 17 } },
      },
    },
  };

  // If still loading, show loading indicator instead of redirecting
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div 
      className="dashboard" 
      style={{
        minHeight: '100vh',
        padding: '20px'
      }}>
      <div className="dashboard-header">
        <h1 style={{color:'green'}}>FNB LOGS ADMIN DASHBOARD</h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            minWidth: '300px'
          }}>
            {selectedBranch && (
              <div className="branch-display">
                <h2>Branch: {selectedBranchName} {selectedBranch}</h2>
                
                {/* User profile information */}
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '5px',
                  borderLeft: '4px solid green'
                }}>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>User: {userProfile.name}</p>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '14px',
                    color: '#555'
                  }}>User ID: {userProfile.userId}</p>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '14px',
                    color: '#555'
                  }}>Title: {userProfile.title}</p>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '14px',
                    color: '#555'
                  }}>Email: {userProfile.email}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <AiOutlineLogout style={{ marginRight: '5px' }} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>Calendar</h2>
          <div className="calendar-nav">
            <button onClick={previousMonth}>
              <AiOutlineLeft />
            </button>
            <span>
              {new Date(
                currentDate.getFullYear(),
                currentDate.getMonth()
              ).toLocaleString("default", { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth}>
              <AiOutlineRight />
            </button>
          </div>
        </div>
        <div className="calendar-grid">{generateCalendarDays()}</div>
      </div>

      <div className="stats">
        <div className="stat-card" onClick={fetchTodayVisitors}>
          <AiOutlineUser className="icon" />
          <h3 style={{ color: "white" }}>Visitors Today</h3>
          <p style={{color:'white'}}>{visitorsToday}</p>
          {selectedBranchName && <span className="branch-indicator">{selectedBranchName}</span>}
        </div>
         
        <div className="stat-card">
          <AiOutlineTeam className="icon" />
          <h3 style={{ color: "white" }}>Total Visitors</h3>
          <p style={{color:'white'}}>{totalVisitors}</p>
          {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h3 style={{color:'green'}}>
            Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
          </h3>
          <Line data={lineData} options={chartOptions} />
        </div>
        <div className="chart-container">
          <h3 style={{color:'green'}}>
            Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
          </h3>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                Today's Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
              </h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>Loading...</p>
              ) : todayVisitorsData?.length > 0 ? (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Purpose</th>
                      <th>Reason</th>
                      <th>Department</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Telephone</th>
                      <th>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayVisitorsData.map((visitor) => (
                      <tr key={visitor.id || visitor.telephone}>
                        <td>{visitor.name}</td>
                        <td>{visitor.company}</td>
                        <td>{visitor.purpose}</td>
                        <td>{visitor.reason}</td>
                        <td>{visitor.department}</td>
                        <td>{visitor.timeIn || visitor.timein}</td>
                        <td>{visitor.timeOut || visitor.timeout}</td>
                        <td>{visitor.telephone}</td>
                        <td>{visitor.branchname || visitor.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No visitors found for today.</p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;