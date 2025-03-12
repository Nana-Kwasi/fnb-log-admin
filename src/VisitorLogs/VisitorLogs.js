import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query,orderBy  } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
import "../Log.css";

const VisitorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const db = getFirestore(app);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i
  );

  
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    
    if (dateValue?.toDate instanceof Function) {
      return dateValue.toDate();
    }
    
    
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    
    if (typeof dateValue === 'string') {
      
      const cleanDate = dateValue.split('T')[0];
      const parsed = new Date(cleanDate);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
   
    if (dateValue instanceof Date && !isNaN(dateValue)) {
      return dateValue;
    }
    
    return null;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Fetch all logs and filter in memory for better date format support
        const logsRef = collection(db, "VisitorEntries");
        const q = query(logsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        
        const logsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const parsedDate = parseDate(data.date);
          
          return {
            id: doc.id,
            ...data,
            // Store both the original date and parsed date
            originalDate: data.date,
            parsedDate: parsedDate,
            // Format date for display
            date: parsedDate ? parsedDate.toISOString().split('T')[0] : 'N/A'
          };
        });

        // Filter by year and group by name
        const yearFilteredLogs = logsData.filter((log) => {
          if (!log.parsedDate) return false;
          return log.parsedDate.getFullYear() === selectedYear;
        });

        // Group logs by name
        const groupedLogs = yearFilteredLogs.reduce((acc, log) => {
          // Only update if this is the most recent entry for this name
          if (!acc[log.name] || (log.parsedDate && acc[log.name].parsedDate < log.parsedDate)) {
            acc[log.name] = log;
          }
          return acc;
        }, {});

        const logsArray = Object.values(groupedLogs);
        setLogs(logsArray);
        setFilteredLogs(logsArray);
      } catch (error) {
        console.error("Error fetching visitor logs:", error);
        setError("Error fetching visitor logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [db, selectedYear]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredLogs(
      logs.filter(
        (log) =>
          log.name.toLowerCase().includes(query) ||
          log.company.toLowerCase().includes(query) ||
          (log.date && log.date.toLowerCase().includes(query))
      )
    );
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const handleRowClick = (name) => {
    navigate(`/visitor-details/${encodeURIComponent(name)}`);
  };

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
                  key={log.name}
                  onClick={() => handleRowClick(log.name)}
                  className="clickable-row"
                >
                  <td>{log.name}</td>
                  <td>{log.company}</td>
                  <td>{log.date}</td>
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