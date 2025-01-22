import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Create query to filter by selected year
        const logsRef = collection(db, "VisitorEntries");
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        
        const q = query(
          logsRef,
          where("date", ">=", startDate),
          where("date", "<=", endDate)
        );
        
        const snapshot = await getDocs(q);
        const logsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group logs by name to avoid repetition
        const groupedLogs = logsData.reduce((acc, log) => {
          acc[log.name] = acc[log.name] || {
            name: log.name,
            company: log.company,
            date: log.date,
          };
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
  }, [db, selectedYear]); // Add selectedYear as dependency

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
                  <td>{log.date || "N/A"}</td>
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