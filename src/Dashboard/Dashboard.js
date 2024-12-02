import React, { useState, useEffect } from "react";
import { AiOutlineUser, AiOutlineTeam, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
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

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "VisitorEntries"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        const today = new Date();
        const groupedData = data.reduce(
          (acc, log) => {
            if (log.date) {
              const date = new Date(log.date);
              if (!isNaN(date.getTime())) {
                const month = date.toLocaleString("default", { month: "long" });
                acc.monthly[month] = (acc.monthly[month] || 0) + 1;
  
                if (date.toDateString() === today.toDateString()) {
                  acc.today += 1;
                }
              }
            }
            acc.total += 1;
            return acc;
          },
          { monthly: {}, today: 0, total: 0 }
        );
  
        const fullYearMonths = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(2022, i).toLocaleString("default", {
            month: "long",
          });
          return { month, visits: groupedData.monthly[month] || 0 };
        });
  
        setAnalyticsData(fullYearMonths);
        setTotalVisitors(groupedData.total);
        setVisitorsToday(groupedData.today || 0); // Ensure count resets to 0 if no records for today
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [db]);
  

  const fetchTodayVisitors = async () => {
    setModalVisible(true);
    setLoading(true);
  
    try {
      const today = new Date();
      const formattedToday = `${String(today.getDate()).padStart(2, "0")}/${String(
        today.getMonth() + 1
      ).padStart(2, "0")}/${today.getFullYear()}`;
  
      const q = query(collection(db, "VisitorEntries"), where("date", "==", formattedToday));
      const snapshot = await getDocs(q);
  
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setTodayVisitorsData(data);
      setVisitorsToday(data.length); // Set visitor count for today
    } catch (error) {
      console.error("Error fetching today's visitors:", error);
      setError("Failed to fetch today's visitors.");
      setVisitorsToday(0); // Reset count to 0 on error
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
        ticks: { color: "#34495e", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
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
              <p>{visitorsToday}</p>
            </div>
            <div className="stat-card">
              <AiOutlineTeam className="icon" />
              <h3 style={{ color: "white" }}>Total Visitors</h3>
              <p>{totalVisitors}</p>
            </div>
          </div>

          <div className="charts">
            <div className="chart-container">
              <h3>Monthly Visitors (Line Graph)</h3>
              <Line data={lineData} options={chartOptions} />
            </div>
            <div className="chart-container">
              <h3>Monthly Visitors (Bar Chart)</h3>
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {modalVisible && (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Today's Visitors</h2>
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
