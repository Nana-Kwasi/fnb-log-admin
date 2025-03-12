import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight, AiOutlineFilter } from "react-icons/ai";
import { Line, Bar } from "react-chartjs-2";
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

  const API_URL = "http://localhost:5001/visitors";

  // Retrieve branch from localStorage on initial load
  useEffect(() => {
    const branch = localStorage.getItem("selectedBranch");
    if (branch) {
      setSelectedBranch(branch);
    }
  }, []);

  const formatDateForAPI = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const parseAPIDate = (dateStr) => {
    if (!dateStr) return null;
    const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const fetchData = async () => {
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
        const data = selectedBranch 
          ? allData.filter(item => item.branchName === selectedBranch)
          : allData;
        
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

        setAnalyticsData(fullYearMonths);
        setTotalVisitors(groupedData.total);
        setVisitorsToday(groupedData.today);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch]); // Re-fetch when selected branch changes

  const fetchTodayVisitors = async () => {
    setModalVisible(true);
    setLoading(true);

    try {
      const today = new Date();
      const formattedToday = formatDateForAPI(today);
      
      // Fetch all visitor logs and filter for today's entries on client side
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const allVisitors = await response.json();
      
      // Filter by date and branch if selected
      let todayVisitors = allVisitors.filter(visitor => visitor.date === formattedToday);
      
      if (selectedBranch) {
        todayVisitors = todayVisitors.filter(visitor => visitor.branchName === selectedBranch);
      }

      setTodayVisitorsData(todayVisitors);
      setVisitorsToday(todayVisitors.length);
    } catch (error) {
      console.error("Error fetching today's visitors:", error);
      setError("Failed to fetch today's visitors.");
      setVisitorsToday(0);
    } finally {
      setLoading(false);
    }
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
          </div>
        </div>
      </div>
      
      {loading ? (
        <p>Loading...</p>
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