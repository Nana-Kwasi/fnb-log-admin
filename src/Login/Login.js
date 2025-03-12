import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5001/visitors";

  // Fetch all branches from the API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract unique branch names
        const uniqueBranches = [...new Set(data
          .map(entry => entry.branchName)
          .filter(branch => branch && branch.trim() !== "")
        )];
        
        setBranches(uniqueBranches.sort());
      } catch (err) {
        console.error("Error fetching branches:", err);
        setError("Failed to load branches. Please try again later.");
      } finally {
        setFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Format date for API comparison
  const formatDateForAPI = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const parseAPIDate = (dateStr) => {
    if (!dateStr) return null;
    const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.length > 25) {
      setError("F number is incorrect");
      return;
    }

    if (!selectedBranch) {
      setError("Please select a branch");
      return;
    }

    setLoading(true);

    try {
      // Fetch all data for the selected branch
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const allData = await response.json();
      
      // Filter data by selected branch if any
      const branchData = selectedBranch 
        ? allData.filter(item => item.branchName === selectedBranch)
        : allData;
      
      // Process data for dashboard
      const currentYear = new Date().getFullYear();
      const today = new Date();
      const todayFormatted = formatDateForAPI(today);
      
      const groupedData = branchData.reduce(
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
      const todayVisitors = branchData.filter(visitor => visitor.date === todayFormatted);
      
      // Prepare dashboard data
      const dashboardData = {
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
        todayVisitorsData: todayVisitors,
        allVisitorsData: branchData
      };
      
      // Store data in localStorage
      localStorage.setItem("selectedBranch", selectedBranch);
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
      
      // Complete login
      setLoading(false);
      onLogin(email, selectedBranch); // Pass email and branch to the onLogin handler
      navigate("/"); // Navigate to Dashboard
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred while fetching data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={25} // Limit input length
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="select-container">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              required
              disabled={fetchingBranches}
              className="branch-select"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {fetchingBranches && (
              <span className="select-spinner"></span>
            )}
          </div>
          
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading || fetchingBranches}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;