import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
import "../Log.css";

const VisitorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const db = getFirestore(app);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "VisitorEntries"));
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
        setFilteredLogs(logsArray); // Initially display all logs
      } catch (error) {
        console.error("Error fetching visitor logs:", error);
        setError("Error fetching visitor logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [db]);

  // Update filtered logs based on search query
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredLogs(
      logs.filter(
        (log) =>
          log.name.toLowerCase().includes(query) ||
          log.company.toLowerCase().includes(query) ||
          (log.date && log.date.toLowerCase().includes(query)) // Check date field
      )
    );
  };
  

  const handleRowClick = (name) => {
    navigate(`/visitor-details/${encodeURIComponent(name)}`);
  };

  return (
    <div className="visitor-logs">
      <h1>Visitor Logs</h1>
      <div className="search-bar-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Name, Company or Date..."
          className="search-bar"
        />
      </div>
      {loading ? (
        <p>Loading visitor logs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredLogs.length === 0 ? (
        <p>No matching logs found.</p>
      ) : (
        <div className="table-container">
          <table className="log-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Date</th> {/* Add Date column */}
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
                  <td>{log.date || "N/A"}</td> {/* Display date or default */}
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
