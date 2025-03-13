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

  // Format date for API comparison
  const formatDateForAPI = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const parseAPIDate = (dateStr) => {
    if (!dateStr) return null;
    
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    // Handle ISO string format
    if (dateStr.includes("T")) {
      return new Date(dateStr);
    }
    
    // Handle MM/DD/YYYY format
    const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
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
        item.branchname === branchName || item.branch === branchName
      );
      console.log("Filtered branch data:", branchData);
      
      // Process data for dashboard
      const currentYear = new Date().getFullYear();
      const today = new Date();
      const todayFormatted = formatDateForAPI(today);
      console.log("Today's date formatted:", todayFormatted);
      
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
                const logDate = formatDateForAPI(date);
                if (logDate === todayFormatted) {
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
      console.log("Grouped data:", groupedData);
  
      // Create array for all months in current year
      const fullYearMonths = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        });
        return { month, visits: groupedData.monthly[month] || 0 };
      });
      console.log("Full year months:", fullYearMonths);
  
      // Filter today's visitors
      const todayVisitors = branchData.filter(visitor => {
        if (!visitor.date) return false;
        const visitorDate = parseAPIDate(visitor.date);
        return visitorDate && formatDateForAPI(visitorDate) === todayFormatted;
      });
      console.log("Today's visitors:", todayVisitors);
      
      // Update context state
      setBranchData({
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
        todayVisitorsData: todayVisitors,
        allVisitorsData: branchData
      });
      
      // Store processed data in localStorage for persistence
      const dashboardData = {
        analyticsData: fullYearMonths,
        totalVisitors: groupedData.total,
        visitorsToday: groupedData.today,
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