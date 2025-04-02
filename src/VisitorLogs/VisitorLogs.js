import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVisitor } from "../context/VisitorContext";
import "../Log.css";

const VisitorLogs = () => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  
  // Use the visitor context
  const { 
    branchData, 
    loading, 
    error, 
    authenticated 
  } = useVisitor();

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i
  );

  // Check if user is authenticated
  useEffect(() => {
    if (!authenticated && !loading) {
      navigate("/login");
    }
  }, [authenticated, loading, navigate]);

  // Filter logs by year and search query
  useEffect(() => {
    if (branchData.allVisitorsData?.length > 0) {
      const yearFilteredLogs = branchData.allVisitorsData.filter((log) => {
        if (!log.date) return false;
        
        // Parse the date
        let parsedDate;
        try {
          if (typeof log.date === 'string') {
            if (log.date.includes('-')) {
              // YYYY-MM-DD format (database format)
              const parts = log.date.split('-');
              if (parts.length >= 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS Date
                const day = parseInt(parts[2].split('T')[0], 10);
                parsedDate = new Date(year, month, day);
              }
            } else if (log.date.includes('T')) {
              // ISO date string
              parsedDate = new Date(log.date);
            } else if (log.date.includes('/')) {
              // MM/DD/YYYY format
              const [month, day, year] = log.date.split('/').map(num => parseInt(num, 10));
              parsedDate = new Date(year, month - 1, day);
            } else {
              // Try direct parsing as a fallback
              parsedDate = new Date(log.date);
            }
          } else if (log.date instanceof Date) {
            parsedDate = log.date;
          }
          
          // Ensure we have a valid date
          if (isNaN(parsedDate.getTime())) {
            console.warn("Invalid date detected:", log.date);
            return false;
          }
          
          return parsedDate && parsedDate.getFullYear() === selectedYear;
        } catch (err) {
          console.error("Error parsing date:", err, log.date);
          return false;
        }
      });

      // Group logs by name to show only the most recent entry per person
      const groupedLogs = yearFilteredLogs.reduce((acc, log) => {
        const existingLog = acc[log.name];
        
        if (!existingLog) {
          acc[log.name] = log;
        } else {
          // Compare dates to keep the most recent
          let existingDate, currentDate;
          
          try {
            if (typeof existingLog.date === 'string') {
              if (existingLog.date.includes('-')) {
                // YYYY-MM-DD format
                const parts = existingLog.date.split('-');
                existingDate = new Date(
                  parseInt(parts[0], 10),
                  parseInt(parts[1], 10) - 1,
                  parseInt(parts[2].split('T')[0], 10)
                );
              } else {
                existingDate = new Date(existingLog.date);
              }
            } else {
              existingDate = existingLog.date;
            }
            
            if (typeof log.date === 'string') {
              if (log.date.includes('-')) {
                // YYYY-MM-DD format
                const parts = log.date.split('-');
                currentDate = new Date(
                  parseInt(parts[0], 10),
                  parseInt(parts[1], 10) - 1,
                  parseInt(parts[2].split('T')[0], 10)
                );
              } else {
                currentDate = new Date(log.date);
              }
            } else {
              currentDate = log.date;
            }
            
            if (currentDate > existingDate) {
              acc[log.name] = log;
            }
          } catch (err) {
            console.error("Error comparing dates:", err);
            // Keep existing log in case of error
          }
        }
        
        return acc;
      }, {});

      const logsArray = Object.values(groupedLogs);
      
      // Apply search filter if query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        setFilteredLogs(
          logsArray.filter(
            (log) =>
              (log.name && log.name.toLowerCase().includes(query)) ||
              (log.company && log.company.toLowerCase().includes(query)) ||
              (log.date && log.date.toString().toLowerCase().includes(query))
          )
        );
      } else {
        setFilteredLogs(logsArray);
      }
    } else {
      setFilteredLogs([]);
    }
  }, [branchData.allVisitorsData, selectedYear, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const handleRowClick = (name) => {
    navigate(`/visitor-details/${encodeURIComponent(name)}`);
  };

  // Format date for display
  const formatDate = (dateValue) => {
    try {
      if (!dateValue) return "N/A";
      
      let date;
      if (typeof dateValue === 'string') {
        if (dateValue.includes('-')) {
          // YYYY-MM-DD format
          const parts = dateValue.split('-');
          if (parts.length >= 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS Date
            const day = parseInt(parts[2].split('T')[0], 10);
            date = new Date(year, month, day);
          } else {
            date = new Date(dateValue);
          }
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return "Invalid Date";
      }
      
      if (isNaN(date.getTime())) {
        return dateValue.toString(); // Return original if parsing failed
      }
      
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
      
      // Alternatively, uncomment this to use locale-specific formatting:
      // return date.toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateValue?.toString() || "N/A";
    }
  };

  if (!authenticated && !loading) {
    return null;
  }

  return (
    <div className="visitor-logs">
      <h1>Visitor Logs</h1>
      <div className="controls-container">
        <div className="year-filter">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="year-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="search-bar-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by Name, Company or Date..."
            className="search-bar"
          />
        </div>
      </div>
      {loading ? (
        <p>Loading visitor logs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredLogs.length === 0 ? (
        <p>No matching logs found for {selectedYear}.</p>
      ) : (
        <div className="table-container">
          <table className="log-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Date</th>
                <th>Number</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id || log.name}
                  onClick={() => handleRowClick(log.name)}
                  className="clickable-row"
                >
                  <td>{log.name}</td>
                  <td>{log.company}</td>
                  <td>{formatDate(log.date)}</td>
                  <td>{log.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VisitorLogs;