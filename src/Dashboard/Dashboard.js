import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
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
  const [allVisitorsData, setAllVisitorsData] = useState([]);
  const navigate = useNavigate();

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
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
          setSelectedBranch(parsedData.selectedBranch || "");
          
          setLoading(false);
        } catch (err) {
          console.error("Error parsing dashboard data:", err);
          setError("Error loading dashboard data. Please log in again.");
          setTimeout(() => navigate("/login"), 3000);
        }
      } else {
        // No saved data, redirect to login
        setError("No dashboard data found. Please log in first.");
        setTimeout(() => navigate("/login"), 3000);
      }
    };
    
    loadData();
  }, [navigate]);

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
        
        {selectedBranch && (
          <div className="branch-display">
            <h2>Branch: {selectedBranch}</h2>
          </div>
        )}
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
                            <td>{visitor.branchname}</td>
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