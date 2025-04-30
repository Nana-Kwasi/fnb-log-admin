import React, { useState, useEffect, useRef } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineLogout, AiOutlineDown, AiOutlinePieChart, AiOutlineTable, AiOutlineBarChart, AiOutlineAreaChart } from "react-icons/ai";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
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
  ArcElement,
} from "chart.js";
import "../dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [visitorsByPurpose, setVisitorsByPurpose] = useState({});
  const [visitorsByDepartment, setVisitorsByDepartment] = useState({});
  const [visitorsByTimeOfDay, setVisitorsByTimeOfDay] = useState({});
  const [visitorTrends, setVisitorTrends] = useState([]);
  const [showDetailedAnalytics, setShowDetailedAnalytics] = useState(false);
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

  // Process visitor data for additional analytics
  useEffect(() => {
    if (todayVisitorsData && todayVisitorsData.length > 0) {
      // Process visitor data by purpose
      const purposeData = todayVisitorsData.reduce((acc, visitor) => {
        const purpose = visitor.purpose || "Unknown";
        acc[purpose] = (acc[purpose] || 0) + 1;
        return acc;
      }, {});
      setVisitorsByPurpose(purposeData);

      // Process visitor data by department
      const departmentData = todayVisitorsData.reduce((acc, visitor) => {
        const department = visitor.department || "Unknown";
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {});
      setVisitorsByDepartment(departmentData);
      
      // Process visitor data by time of day
      const timeData = todayVisitorsData.reduce((acc, visitor) => {
        let timeCategory = "Unknown";
        if (visitor.timeIn || visitor.timein) {
          const timeStr = visitor.timeIn || visitor.timein;
          const hour = parseInt(timeStr.split(':')[0]);
          
          if (hour >= 6 && hour < 12) timeCategory = "Morning (6AM-12PM)";
          else if (hour >= 12 && hour < 17) timeCategory = "Afternoon (12PM-5PM)";
          else if (hour >= 17 && hour < 21) timeCategory = "Evening (5PM-9PM)";
          else timeCategory = "Night (9PM-6AM)";
        }
        
        acc[timeCategory] = (acc[timeCategory] || 0) + 1;
        return acc;
      }, {});
      setVisitorsByTimeOfDay(timeData);
      
      // Generate mock visitor trends data if analyticsData exists
      if (analyticsData && analyticsData.length > 0) {
        const trends = analyticsData.map(item => ({
          month: item.month,
          weekday: Math.floor(item.visits * 0.65),
          weekend: Math.floor(item.visits * 0.35),
          withAppointment: Math.floor(item.visits * 0.4),
          withoutAppointment: Math.floor(item.visits * 0.6)
        }));
        setVisitorTrends(trends);
      }
    }
  }, [todayVisitorsData, analyticsData]);

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

  const toggleDetailedAnalytics = () => {
    setShowDetailedAnalytics(!showDetailedAnalytics);
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

  const purposePieData = {
    labels: Object.keys(visitorsByPurpose),
    datasets: [
      {
        data: Object.values(visitorsByPurpose),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const departmentDoughnutData = {
    labels: Object.keys(visitorsByDepartment),
    datasets: [
      {
        data: Object.values(visitorsByDepartment),
        backgroundColor: [
          'rgba(41, 128, 185, 0.7)',
          'rgba(142, 68, 173, 0.7)',
          'rgba(22, 160, 133, 0.7)',
          'rgba(39, 174, 96, 0.7)',
          'rgba(243, 156, 18, 0.7)',
          'rgba(211, 84, 0, 0.7)',
          'rgba(192, 57, 43, 0.7)',
          'rgba(127, 140, 141, 0.7)',
        ],
        borderColor: [
          'rgba(41, 128, 185, 1)',
          'rgba(142, 68, 173, 1)',
          'rgba(22, 160, 133, 1)',
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(211, 84, 0, 1)',
          'rgba(192, 57, 43, 1)',
          'rgba(127, 140, 141, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeOfDayBarData = {
    labels: Object.keys(visitorsByTimeOfDay),
    datasets: [
      {
        label: 'Visitors by Time of Day',
        data: Object.values(visitorsByTimeOfDay),
        backgroundColor: 'rgba(230, 126, 34, 0.7)',
        borderColor: 'rgba(230, 126, 34, 1)',
        borderWidth: 1,
      },
    ],
  };

  const visitorTrendsData = {
    labels: visitorTrends.map(item => item.month),
    datasets: [
      {
        label: 'Weekday',
        data: visitorTrends.map(item => item.weekday),
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      },
      {
        label: 'Weekend',
        data: visitorTrends.map(item => item.weekend),
        backgroundColor: 'rgba(155, 89, 182, 0.7)',
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 1,
      }
    ],
  };

  const appointmentComparisonData = {
    labels: visitorTrends.map(item => item.month),
    datasets: [
      {
        label: 'With Appointment',
        data: visitorTrends.map(item => item.withAppointment),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: 'rgba(46, 204, 113, 1)',
        borderWidth: 1,
      },
      {
        label: 'Without Appointment',
        data: visitorTrends.map(item => item.withoutAppointment),
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 1,
      }
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

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "right" },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            let value = context.raw || 0;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage = ((value * 100) / total).toFixed(1) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    }
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

  // Analytics tabs
  const renderAnalyticsTabs = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #ddd',
    }}>
      <button 
        onClick={() => setActiveTab('overview')}
        style={{
          padding: '10px 20px',
          margin: '0 5px',
          border: 'none',
          borderRadius: '5px 5px 0 0',
          cursor: 'pointer',
          backgroundColor: activeTab === 'overview' ? '#3498db' : '#f1f2f6',
          color: activeTab === 'overview' ? 'white' : '#333',
          fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
          transition: 'all 0.3s ease'
        }}
      >
        Overview
      </button>
      <button 
        onClick={() => setActiveTab('detailed')}
        style={{
          padding: '10px 20px',
          margin: '0 5px',
          border: 'none',
          borderRadius: '5px 5px 0 0',
          cursor: 'pointer',
          backgroundColor: activeTab === 'detailed' ? '#3498db' : '#f1f2f6',
          color: activeTab === 'detailed' ? 'white' : '#333',
          fontWeight: activeTab === 'detailed' ? 'bold' : 'normal',
          transition: 'all 0.3s ease'
        }}
      >
        Detailed Analysis
      </button>
      <button 
        onClick={() => setActiveTab('trends')}
        style={{
          padding: '10px 20px',
          margin: '0 5px',
          border: 'none',
          borderRadius: '5px 5px 0 0',
          cursor: 'pointer',
          backgroundColor: activeTab === 'trends' ? '#3498db' : '#f1f2f6',
          color: activeTab === 'trends' ? 'white' : '#333',
          fontWeight: activeTab === 'trends' ? 'bold' : 'normal',
          transition: 'all 0.3s ease'
        }}
      >
        Trends
      </button>
    </div>
  );

  // Render visitor distribution table
  const renderVisitorDistributionTable = () => {
    // Get top departments and purposes
    const topDepartments = Object.entries(visitorsByDepartment).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topPurposes = Object.entries(visitorsByPurpose).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    return (
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ color: 'green', marginBottom: '15px' }}>Visitor Distribution Analysis</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ width: '48%', minWidth: '300px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Top Departments</h4>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Department</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Visitors</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {topDepartments.map(([department, count]) => {
                  const percentage = ((count / Object.values(visitorsByDepartment).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                  return (
                    <tr key={department} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', textAlign: 'left' }}>{department}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{count}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ width: '48%', minWidth: '300px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Top Visit Purposes</h4>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Purpose</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Visitors</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {topPurposes.map(([purpose, count]) => {
                  const percentage = ((count / Object.values(visitorsByPurpose).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                  return (
                    <tr key={purpose} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', textAlign: 'left' }}>{purpose}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{count}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="dashboard" 
      style={{
        minHeight: '100vh',
        padding: '20px'
      }}>
      <div className="dashboard-header">
        <h1 style={{color:'green'}}>FNB LOGS ADMIN DASHBOARD FOR {selectedBranchName}</h1>
        
        {selectedBranch && (
          <div className="branch-display">
          </div>
        )}
        
        {/* User profile dropdown */}
        <div className="user-profile-dropdown" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="dropdown-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <AiOutlineUser style={{ marginRight: '5px' }} />
            {getUserEmail() || 'User Profile'}
            <AiOutlineDown style={{ marginLeft: '5px' }} />
          </button>
          
          {dropdownOpen && (
            <div 
              className="dropdown-content"
              style={{
                position: 'absolute',
                right: '0',
                backgroundColor: 'white',
                minWidth: '250px',
                boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
                zIndex: '1',
                borderRadius: '4px',
                marginTop: '5px'
              }}
            >
              <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {getUserDisplayName()}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {getUserTitle()}
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                  {getUserEmail()}
                </div>
                {user && user.userId && (
                  <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                    ID: {user.userId}
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '10px 15px',
                  border: 'none',
                  backgroundColor: '#e74c3c',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'white',
                  borderRadius: '0 0 4px 4px'
                }}
              >
                <AiOutlineLogout style={{ marginRight: '5px' }} />
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

            {/* New stat cards */}
            <div className="stat-card" style={{ backgroundColor: '#8e44ad' }}>
              <AiOutlinePieChart className="icon" />
              <h3 style={{ color: "white" }}>Analytics</h3>
              <p style={{color:'white'}}>{Object.keys(visitorsByPurpose).length || 0} Categories</p>
              {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
            </div>
            
            <div className="stat-card" style={{ backgroundColor: '#16a085' }}>
              <AiOutlineTable className="icon" />
              <h3 style={{ color: "white" }}>Departments</h3>
              <p style={{color:'white'}}>{Object.keys(visitorsByDepartment).length || 0} Active</p>
              {selectedBranch && <span className="branch-indicator">{selectedBranchName}</span>}
            </div>
          </div>

          {/* Analytics Section Tabs */}
          {renderAnalyticsTabs()}

          {/* Main charts section - conditionally render based on active tab */}
          {activeTab === 'overview' && (
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
          )}

          {/* Detailed Analysis Tab */}
          {activeTab === 'detailed' && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '20px', 
                justifyContent: 'space-between'
              }}>
                {/* Purpose Distribution Pie Chart */}
                <div style={{ 
                  flex: '1 1 45%', 
                  minWidth: '300px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ color: 'green', marginBottom: '15px' }}>Visitor Purpose Distribution</h3>
                  <div style={{ height: '300px' }}>
                    <Pie data={purposePieData} options={pieChartOptions} />
                  </div>
                </div>

                {/* Department Distribution Doughnut Chart */}
                <div style={{ 
                  flex: '1 1 45%', 
                  minWidth: '300px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ color: 'green', marginBottom: '15px' }}>Department Visitor Distribution</h3>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={departmentDoughnutData} options={pieChartOptions} />
                  </div>
                </div>
              </div>

              {/* Visitor Time of Day Distribution */}
              <div style={{ 
                marginTop: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ color: 'green', marginBottom: '15px' }}>Visitor Time-of-Day Distribution</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={timeOfDayBarData} options={chartOptions} />
                </div>
              </div>

              {/* Visitor Distribution Table */}
              {renderVisitorDistributionTable()}
            </div>
          )}

          {/* Trends Tab */}
          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div style={{ marginTop: '20px' }}>
              {/* Weekday vs Weekend Trends */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: 'green', marginBottom: '15px' }}>Weekday vs Weekend Visitor Trends</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={visitorTrendsData} options={chartOptions} />
                </div>
              </div>

              {/* Appointment vs Non-Appointment Trends */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: 'green', marginBottom: '15px' }}>Appointment vs Non-Appointment Visitors</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={appointmentComparisonData} options={chartOptions} />
                </div>
              </div>

              {/* Visitor Traffic Heatmap */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: 'green', marginBottom: '15px' }}>Visitor Traffic Pattern Analysis</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Time / Day</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Monday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Tuesday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Wednesday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Thursday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Friday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Saturday</th>
                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Sunday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Morning (8-11 AM)', 'Noon (11 AM-2 PM)', 'Afternoon (2-5 PM)', 'Evening (5-8 PM)'].map((timeSlot) => (
                        <tr key={timeSlot}>
                          <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold', textAlign: 'left' }}>{timeSlot}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                            // Generate mock traffic data
                            const isWeekend = day === 'Saturday' || day === 'Sunday';
                            const isPeakTime = timeSlot === 'Noon (11 AM-2 PM)' || timeSlot === 'Afternoon (2-5 PM)';
                            let trafficLevel;
                            let color;
                            
                            if (isWeekend) {
                              trafficLevel = isPeakTime ? 'Medium' : 'Low';
                              color = isPeakTime ? '#f39c12' : '#2ecc71';
                            } else {
                              trafficLevel = isPeakTime ? 'High' : 'Medium';
                              color = isPeakTime ? '#e74c3c' : '#f39c12';
                            }
                            
                            if (day === 'Sunday' && timeSlot !== 'Evening (5-8 PM)') {
                              trafficLevel = 'Very Low';
                              color = '#3498db';
                            }
                            
                            return (
                              <td 
                                key={`${day}-${timeSlot}`} 
                                style={{ 
                                  padding: '10px', 
                                  borderBottom: '1px solid #eee',
                                  backgroundColor: color,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              >
                                {trafficLevel}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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