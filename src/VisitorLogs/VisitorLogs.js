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
        if (typeof log.date === 'string') {
          if (log.date.includes('T')) {
            // ISO date string
            parsedDate = new Date(log.date);
          } else if (log.date.includes('/')) {
            // MM/DD/YYYY format
            const [month, day, year] = log.date.split('/').map(num => parseInt(num, 10));
            parsedDate = new Date(year, month - 1, day);
          }
        } else if (log.date instanceof Date) {
          parsedDate = log.date;
        }
        
        return parsedDate && parsedDate.getFullYear() === selectedYear;
      });

      // Group logs by name to show only the most recent entry per person
      const groupedLogs = yearFilteredLogs.reduce((acc, log) => {
        const existingLog = acc[log.name];
        
        if (!existingLog) {
          acc[log.name] = log;
        } else {
          // Compare dates to keep the most recent
          const existingDate = new Date(existingLog.date);
          const currentDate = new Date(log.date);
          
          if (currentDate > existingDate) {
            acc[log.name] = log;
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
                  <td>{typeof log.date === 'string' ? log.date : log.date.toLocaleDateString()}</td>
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