import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const VisitorContext = createContext();

// Create a provider component
export const VisitorProvider = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchData, setBranchData] = useState({
    analyticsData: [],
    totalVisitors: 0,
    visitorsToday: 0,
    todayVisitorsData: [],
    allVisitorsData: [],
  });
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // API URL for fetching visitor data
  const API_URL = "http://localhost:5001/visitors";

  // Format date for API comparison - in YYYY-MM-DD format
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseAPIDate = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    try {
      // Handle ISO string format or YYYY-MM-DD format
      if (dateStr.includes("T") || dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateStr);
      }
      
      // Handle MM/DD/YYYY format if encountered
      if (dateStr.includes("/")) {
        const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
      }
      
      // Couldn't parse the date
      console.error("Unrecognized date format:", dateStr);
      return null;
    } catch (error) {
      console.error("Date parsing error:", error, "for date string:", dateStr);
      return null;
    }
  };

  // Fetch branch data from API
  const fetchBranchData = async (branchName) => {
    setLoading(true);
    setError("");
    
    try {
      console.log(`Fetching data for branch: ${branchName}`);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const allData = await response.json();
      console.log("API response for all data:", allData);
      
      // Filter data by selected branch
      const branchData = allData.filter(item => 
        (item.branchname === branchName || item.branch === branchName) && item.date
      );
      console.log("Filtered branch data:", branchData);
      
      // Process data for dashboard
      const currentYear = new Date().getFullYear();
      const today = new Date();
      const todayFormatted = formatDateForAPI(today);
      console.log("Today's date formatted:", todayFormatted);
      
      // Process all visit logs for the branch
      let totalCount = 0;
      let todayCount = 0;
      const monthlyData = {};
      const todayVisitors = [];
      
      branchData.forEach(log => {
        if (!log.date) return;
        
        try {
          const date = parseAPIDate(log.date);
          if (!date) {
            console.warn("Could not parse date for log:", log);
            return;
          }
          
          // Only count entries from current year for total
          if (date.getFullYear() === currentYear) {
            totalCount++;
            
            // Group by month for analytics
            const month = date.toLocaleString("default", { month: "long" });
            monthlyData[month] = (monthlyData[month] || 0) + 1;
            
            // Check if the entry is from today
            const logDateFormatted = formatDateForAPI(date);
            console.log(`Comparing dates: log date ${logDateFormatted} vs today ${todayFormatted}`);
            if (logDateFormatted === todayFormatted) {
              todayCount++;
              todayVisitors.push(log);
            }
          }
        } catch (e) {
          console.error("Error processing log:", log, e);
        }
      });
      
      console.log("Processed counts:", { total: totalCount, today: todayCount });
      console.log("Today's visitors:", todayVisitors);
  
      // Create array for all months in current year
      const fullYearMonths = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        });
        return { month, visits: monthlyData[month] || 0 };
      });
      console.log("Full year months data:", fullYearMonths);
      
      // Update context state
      setBranchData({
        analyticsData: fullYearMonths,
        totalVisitors: totalCount,
        visitorsToday: todayCount,
        todayVisitorsData: todayVisitors,
        allVisitorsData: branchData
      });
      
      // Store processed data in localStorage for persistence
      const dashboardData = {
        analyticsData: fullYearMonths,
        totalVisitors: totalCount,
        visitorsToday: todayCount,
        todayVisitorsData: todayVisitors,
        allVisitorsData: branchData,
        selectedBranch: branchName
      };
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
      console.log("Data stored in context:", dashboardData);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching branch data:", err);
      setError("Failed to fetch branch data. Please try again.");
      setLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email, branch) => {
    setLoading(true);
    
    try {
      const success = await fetchBranchData(branch);
      
      if (success) {
        setSelectedBranch(branch);
        setUser({ email, branch });
        setAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setSelectedBranch("");
    setBranchData({
      analyticsData: [],
      totalVisitors: 0,
      visitorsToday: 0,
      todayVisitorsData: [],
      allVisitorsData: [],
    });
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem("dashboardData");
  };

  // Check for stored session on initial load
  useEffect(() => {
    const savedData = localStorage.getItem("dashboardData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setBranchData({
          analyticsData: parsedData.analyticsData || [],
          totalVisitors: parsedData.totalVisitors || 0,
          visitorsToday: parsedData.visitorsToday || 0,
          todayVisitorsData: parsedData.todayVisitorsData || [],
          allVisitorsData: parsedData.allVisitorsData || [],
        });
        
        if (parsedData.selectedBranch) {
          setSelectedBranch(parsedData.selectedBranch);
          setAuthenticated(true);
        }
      } catch (err) {
        console.error("Error parsing stored dashboard data:", err);
        localStorage.removeItem("dashboardData");
      }
    }
  }, []);

  // Create context value
  const contextValue = {
    selectedBranch,
    branchData,
    authenticated,
    loading,
    error,
    user,
    login,
    logout,
    fetchBranchData,
    setError,
  };

  return (
    <VisitorContext.Provider value={contextValue}>
      {children}
    </VisitorContext.Provider>
  );
};

// Custom hook for using the context
export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
};