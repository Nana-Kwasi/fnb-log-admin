import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineFilter } from "react-icons/ai";
import { Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
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
  const [analyticsData, setAnalyticsData] = useState([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [visitorsToday, setVisitorsToday] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [todayVisitorsData, setTodayVisitorsData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [allVisitorsData, setAllVisitorsData] = useState([]);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5001/visitors";

  // Format date for API comparison
  const formatDateForAPI = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const parseAPIDate = (dateStr) => {
    if (!dateStr) return null;
    const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Get branch from localStorage
      const branch = localStorage.getItem("selectedBranch");
      if (branch) {
        setSelectedBranch(branch);
      }
      
      // Try to get prefetched data from localStorage
      const savedData = localStorage.getItem("dashboardData");
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setAnalyticsData(parsedData.analyticsData || []);
          setTotalVisitors(parsedData.totalVisitors || 0);
          setVisitorsToday(parsedData.visitorsToday || 0);
          setTodayVisitorsData(parsedData.todayVisitorsData || []);
          setAllVisitorsData(parsedData.allVisitorsData || []);
          
          // Fetch all branches for the dropdown
          await fetchAllBranches();
          
          setLoading(false);
        } catch (err) {
          console.error("Error parsing dashboard data:", err);
          // If there's an error parsing, fetch fresh data
          fetchDashboardData(branch);
        }
      } else {
        // No saved data, fetch fresh
        fetchDashboardData(branch);
      }
    };
    
    loadData();
  }, []);

  // Fetch all branches for the filter dropdown
  const fetchAllBranches = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const allData = await response.json();
      
      // Extract unique branch names
      const uniqueBranches = [...new Set(allData
        .map(entry => entry.branchName)
        .filter(branch => branch && branch.trim() !== "")
      )];
      
      setBranches(uniqueBranches.sort());
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  // Fetch dashboard data for a specific branch
  const fetchDashboardData = async (branchName = "") => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const allData = await response.json();
      
      // Extract unique branch names for the filter dropdown
      const uniqueBranches = [...new Set(allData
        .map(entry => entry.branchName)
        .filter(branch => branch && branch.trim() !== "")
      )];
      setBranches(uniqueBranches.sort());
      
      // Filter data by selected branch if any
      const data = branchName 
        ? allData.filter(item => item.branchName === branchName)
        : allData;
      
      setAllVisitorsData(data);
      
      const currentYear = new Date().getFullYear();
      const today = new Date();
      const todayFormatted = formatDateForAPI(today);
      
      const groupedData = data.reduce(
        (acc, log) => {
          if (log.date) {
            try {
              const date = parseAPIDate(log.date);
              
              // Only process entries from current year
              if (date && date.getFullYear() === currentYear) {
                const month = date.toLocaleString("default", { month: "long" });
                acc.monthly[month] = (acc.monthly[month] || 0) + 1;

                // Check if the entry is from today
                if (log.date === todayFormatted) {
                  acc.today += 1;
                }
              }
              
              // Include in total only if it's current year
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

      // Create array for all months in current year
      const fullYearMonths = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        });
        return { month, visits: groupedData.monthly[month] || 0 };
      });

      // Filter today's visitors
      const todayVisitors = data.filter(visitor => visitor.date === todayFormatted);

      setAnalyticsData(fullYearMonths);
      setTotalVisitors(groupedData.total);
      setVisitorsToday(groupedData.today);
      setTodayVisitorsData(todayVisitors);
      
      // Save the data in localStorage
      const dashboardData = {
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
        todayVisitorsData: todayVisitors,
        allVisitorsData: data
      };
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to fetch analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // When branch selection changes
  useEffect(() => {
    if (selectedBranch !== undefined) {
      fetchDashboardData(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchTodayVisitors = () => {
    setModalVisible(true);
    // We already have today's visitors data
  };

  const closeModal = () => setModalVisible(false);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleBranchChange = (e) => {
    const branch = e.target.value;
    setSelectedBranch(branch);
    localStorage.setItem("selectedBranch", branch);
  };

  const clearBranchFilter = () => {
    setSelectedBranch("");
    localStorage.removeItem("selectedBranch");
    fetchDashboardData("");
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
    labels: analyticsData.map((item) => item.month),
    datasets: [
      {
        label: "Visitors",
        data: analyticsData.map((item) => item.visits),
        backgroundColor: "rgba(41, 128, 185, 0.7)",
        borderColor: "#2980b9",
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: analyticsData.map((item) => item.month),
    datasets: [
      {
        label: "Visitors",
        data: analyticsData.map((item) => item.visits),
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

  return (
    <div 
      className="dashboard" 
      style={{
        minHeight: '100vh',
        padding: '20px'
      }}>
      <div className="dashboard-header">
        <h1 style={{color:'green'}}>FNB LOGS ADMIN DASHBOARD</h1>
        
        <div className="branch-filter">
          <div className="filter-container">
            <AiOutlineFilter className="filter-icon" />
            <select 
              value={selectedBranch} 
              onChange={handleBranchChange}
              className="branch-select"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            {selectedBranch && (
              <button 
                onClick={clearBranchFilter}
                className="clear-filter-btn"
              >
                Clear Filter
              </button>
            )}
          </div>
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
              {selectedBranch && <span className="branch-indicator">{selectedBranch}</span>}
            </div>
             
            <div className="stat-card">
              <AiOutlineTeam className="icon" />
              <h3 style={{ color: "white" }}>Total Visitors</h3>
              <p style={{color:'white'}}>{totalVisitors}</p>
              {selectedBranch && <span className="branch-indicator">{selectedBranch}</span>}
            </div>
          </div>

          <div className="charts">
            <div className="chart-container">
              <h3 style={{color:'green'}}>
                Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : '- All Branches'}
              </h3>
              <Line data={lineData} options={chartOptions} />
            </div>
            <div className="chart-container">
              <h3 style={{color:'green'}}>
                Monthly Visitors {selectedBranch ? `- ${selectedBranch}` : '- All Branches'}
              </h3>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {modalVisible && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">
                    Today's Visitors {selectedBranch ? `- ${selectedBranch}` : '- All Branches'}
                  </h2>
                  <button className="close-button" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  {loading ? (
                    <p>Loading...</p>
                  ) : todayVisitorsData.length > 0 ? (
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
                          <tr key={visitor.id}>
                            <td>{visitor.name}</td>
                            <td>{visitor.company}</td>
                            <td>{visitor.purpose}</td>
                            <td>{visitor.reason}</td>
                            <td>{visitor.department}</td>
                            <td>{visitor.timeIn}</td>
                            <td>{visitor.timeOut}</td>
                            <td>{visitor.telephone}</td>
                            <td>{visitor.branchName}</td>
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