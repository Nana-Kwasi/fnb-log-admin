import React, { useState, useEffect, useRef } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineLogout, AiOutlineDown, AiOutlinePieChart } from "react-icons/ai";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../dashboard.css";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, // Register ArcElement for Pie chart
  Title, 
  Tooltip, 
  Legend
);

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Use the visitor context
  const { 
    selectedBranch, 
    branchData, 
    selectedBranchName,
    loading, 
    error, 
    authenticated,
    logout,
    user
  } = useVisitor();

  const { 
    analyticsData, 
    totalVisitors, 
    visitorsToday, 
    todayVisitorsData 
  } = branchData;

  // Check if user is authenticated
  useEffect(() => {
    if (!authenticated && !loading) {
      navigate("/login");
    }
  }, [authenticated, loading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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

  // Pie chart data using the same analytics data
  const pieData = {
    labels: analyticsData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Visitors Distribution",
        data: analyticsData?.map((item) => item.visits) || [],
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',  // Blue
          'rgba(46, 204, 113, 0.8)',  // Green
          'rgba(155, 89, 182, 0.8)',  // Purple
          'rgba(241, 196, 15, 0.8)',  // Yellow
          'rgba(231, 76, 60, 0.8)',   // Red
          'rgba(230, 126, 34, 0.8)',  // Orange
          'rgba(26, 188, 156, 0.8)',  // Turquoise
          'rgba(52, 73, 94, 0.8)',    // Dark blue
          'rgba(149, 165, 166, 0.8)', // Gray
          'rgba(243, 156, 18, 0.8)',  // Orange-yellow
          'rgba(211, 84, 0, 0.8)',    // Dark orange
          'rgba(22, 160, 133, 0.8)',  // Dark turquoise
        ],
        borderColor: [
          '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', 
          '#e74c3c', '#e67e22', '#1abc9c', '#34495e',
          '#95a5a6', '#f39c12', '#d35400', '#16a085',
        ],
        borderWidth: 2,
        hoverOffset: 15,
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
  
  // Pie chart options - Updated to arrange months horizontally
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: "bottom", // Changed from "right" to "bottom" for horizontal arrangement
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyFont: {
          size: 14
        },
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} visitors (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Visitor Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 10
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold'
        },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return percentage + '%';
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    },
    cutout: '30%',
    radius: '90%'
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Use name from user object if available
    if (user.name) {
      // Format "Lastname, Firstname" to "Firstname Lastname"
      const nameParts = user.name.split(', ');
      if (nameParts.length === 2) {
        return `${nameParts[1]} ${nameParts[0]}`;
      }
      return user.name;
    }
    
    // Fallback to email or userId
    return user.email || user.userId || '';
  };

  // Get user title or role
  const getUserTitle = () => {
    if (!user) return '';
    return user.title || user.role || '';
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>FNB LOGS ADMIN DASHBOARD FOR {selectedBranchName}</h1>
        
        {selectedBranch && (
          <div className="branch-display">
          </div>
        )}
        
        {/* User profile dropdown */}
        <div className="user-profile-dropdown" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="dropdown-button"
          >
            <img 
              src="/user.png" 
              alt="User Profile" 
              className="profile-icon" 
            />
            {getUserEmail() || 'User Profile'}
            <AiOutlineDown className="dropdown-arrow" />
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-content">
              <div className="dropdown-header">
                <div className="user-name">{getUserDisplayName()}</div>
                <div className="user-title">{getUserTitle()}</div>
                <div className="user-email">{getUserEmail()}</div>
                {user && user.userId && (
                  <div className="user-id">ID: {user.userId}</div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                <AiOutlineLogout className="logout-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
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
  
          {/* Stats and Pie Chart Container */}
          <div className="stats-and-pie-container">
            <div className="stats">
              <div className="stat-card visitors-today" onClick={fetchTodayVisitors}>
                <img src="/user (1).png" alt="Visitors Today" className="stat-icon" />
                <h3>Visitors Today</h3>
                <p>{visitorsToday}</p>
                {selectedBranchName && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
               
              <div className="stat-card total-visitors">
                <img src="/group.png" alt="Total Visitors" className="stat-icon" />
                <h3>Total Visitors</h3>
                <p>{totalVisitors}</p>
                {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
              
              <div className="stat-card special">
                <img src="/diversity.png" alt="Peak Month" className="stat-icon" />
                <h3>Peak Month</h3>
                {analyticsData && analyticsData.length > 0 ? (
                  <>
                    <p>
                      {analyticsData.reduce((max, item) => (item.visits > max.visits ? item : max), analyticsData[0]).month}
                    </p>
                    <span className="peak-visitors">
                      {analyticsData.reduce((max, item) => (item.visits > max.visits ? item : max), analyticsData[0]).visits} visitors
                    </span>
                  </>
                ) : (
                  <p>No data available</p>
                )}
                {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
              </div>
            </div>
  
            {/* Pie Chart */}
            <div className="pie-chart-container">
              <h3>
                Visitor Distribution {selectedBranch ? `- ${selectedBranchName}` : ''}
              </h3>
              <div className="pie-chart-wrapper">
                <Pie data={pieData} options={pieChartOptions} />
              </div>
            </div>
          </div>
  
          <div className="charts-container">
            <div className="charts">
              <div className="chart-container">
                <h3>
                  Monthly Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Line data={lineData} options={chartOptions} />
              </div>
              <div className="chart-container">
                <h3>
                  Monthly Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
                </h3>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>
  
          {modalVisible && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    Today's Visitors {selectedBranch ? `- ${selectedBranchName}` : ''}
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
        </>
      )}
    </div>
  );
};

export default Dashboard;


// import React, { useState, useEffect } from "react";
// import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineLogout } from "react-icons/ai";
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
  // const { 
  //   selectedBranch, 
  //   branchData, 
  //   selectedBranchName,
  //   loading, 
  //   error, 
  //   authenticated,
  //   userProfile,
  //   logout
  // } = useVisitor();

//   const { 
//     analyticsData, 
//     totalVisitors, 
//     visitorsToday, 
//     todayVisitorsData 
//   } = branchData;

//   // Modified to use useEffect for authentication check instead of immediate redirect
  // useEffect(() => {
  //   if (!authenticated && !loading) {
  //     navigate("/login");
  //   }
  // }, [authenticated, loading, navigate]);

  // const handleLogout = () => {
  //   logout();
  //   navigate("/login");
  // };

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

//   // If still loading, show loading indicator instead of redirecting
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading dashboard data...</p>
//       </div>
//     );
//   }

//   // If there's an error, show error message
//   if (error) {
//     return <p className="error">{error}</p>;
//   }

//   return (
//     <div 
//       className="dashboard" 
//       style={{
//         minHeight: '100vh',
//         padding: '20px'
//       }}>
//       <div className="dashboard-header">
//         <h1 style={{color:'green'}}>FNB LOGS ADMIN DASHBOARD</h1>
        
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           width: '100%'
//         }}>
//           <div style={{
//             backgroundColor: '#f5f5f5',
//             padding: '15px',
//             borderRadius: '8px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             marginBottom: '20px',
//             minWidth: '300px'
//           }}>
//             {selectedBranch && (
//               <div className="branch-display">
//                 <h2>Branch: {selectedBranchName} {selectedBranch}</h2>
               
//               </div>
//             )}
//           </div>
          
//           {/* Logout Button */}
          // <button 
          //   onClick={handleLogout}
          //   style={{
          //     display: 'flex',
          //     alignItems: 'center',
          //     backgroundColor: 'white',
          //     color: 'white',
          //     border: 'none',
          //     borderRadius: '4px',
          //     padding: '10px 15px',
          //     cursor: 'pointer',
          //     fontWeight: 'bold',
          //     boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          //   }}
          // >
          //   <AiOutlineLogout style={{ marginRight: '5px' }} />
          //   Logout
          // </button>
//         </div>
//       </div>
      
//       <div className="calendar-container">
//         <div className="calendar-header">
//           <h2>Calendar</h2>
//           <div className="calendar-nav">
//             <button onClick={previousMonth}>
//               <AiOutlineLeft />
//             </button>
//             <span>
//               {new Date(
//                 currentDate.getFullYear(),
//                 currentDate.getMonth()
//               ).toLocaleString("default", { month: "long" })}{" "}
//               {currentDate.getFullYear()}
//             </span>
//             <button onClick={nextMonth}>
//               <AiOutlineRight />
//             </button>
//           </div>
//         </div>
//         <div className="calendar-grid">{generateCalendarDays()}</div>
//       </div>

//       <div className="stats">
//         <div className="stat-card" onClick={fetchTodayVisitors}>
//           <AiOutlineUser className="icon" />
//           <h3 style={{ color: "white" }}>Visitors Today</h3>
//           <p style={{color:'white'}}>{visitorsToday}</p>
//           {selectedBranchName && <span className="branch-indicator">{selectedBranchName}</span>}
//         </div>
         
//         <div className="stat-card">
//           <AiOutlineTeam className="icon" />
//           <h3 style={{ color: "white" }}>Total Visitors</h3>
//           <p style={{color:'white'}}>{totalVisitors}</p>
//           {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
//         </div>
//       </div>

//       <div className="charts">
//         <div className="chart-container">
//           <h3 style={{color:'green'}}>
//             Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//           </h3>
//           <Line data={lineData} options={chartOptions} />
//         </div>
//         <div className="chart-container">
//           <h3 style={{color:'green'}}>
//             Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//           </h3>
//           <Bar data={barData} options={chartOptions} />
//         </div>
//       </div>

//       {modalVisible && (
//         <div className="modal">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h2 className="modal-title">
//                 Today's Visitors {selectedBranch ? `- ${selectedBranch}` : ''}
//               </h2>
//               <button className="close-button" onClick={closeModal}>&times;</button>
//             </div>
//             <div className="modal-body">
//               {loading ? (
//                 <p>Loading...</p>
//               ) : todayVisitorsData?.length > 0 ? (
//                 <table className="modal-table">
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       <th>Company</th>
//                       <th>Purpose</th>
//                       <th>Reason</th>
//                       <th>Department</th>
//                       <th>Time In</th>
//                       <th>Time Out</th>
//                       <th>Telephone</th>
//                       <th>Branch</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {todayVisitorsData.map((visitor) => (
//                       <tr key={visitor.id || visitor.telephone}>
//                         <td>{visitor.name}</td>
//                         <td>{visitor.company}</td>
//                         <td>{visitor.purpose}</td>
//                         <td>{visitor.reason}</td>
//                         <td>{visitor.department}</td>
//                         <td>{visitor.timeIn || visitor.timein}</td>
//                         <td>{visitor.timeOut || visitor.timeout}</td>
//                         <td>{visitor.telephone}</td>
//                         <td>{visitor.branchname || visitor.branch}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <p>No visitors found for today.</p>
//               )}
//             </div>
//             <div className="modal-footer">
//               <button onClick={closeModal}>Close</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;