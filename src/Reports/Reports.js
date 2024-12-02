import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../report.css";

const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const db = getFirestore(app);

  // Helper function to parse date strings into Date objects
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
  
    const formats = [
      { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: ["mm", "dd", "yyyy"] },
      { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: ["dd", "mm", "yyyy"] },
    ];
  
    for (const { regex, order } of formats) {
      const match = dateStr.match(regex);
      if (match) {
        const [_, part1, part2, part3] = match;
        const day = order.indexOf("dd") === 0 ? parseInt(part1, 10) : parseInt(part2, 10);
        const month = order.indexOf("mm") === 0 ? parseInt(part1, 10) - 1 : parseInt(part2, 10) - 1;
        const year = parseInt(part3, 10);
        return new Date(year, month, day);
      }
    }
  
    return null;
  };

  // Function to fetch logs from Firestore and filter by date range
  const fetchLogs = async () => {
    // Validate date selection
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "VisitorEntries"));
      const logsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const filtered = logsData.filter((log) => {
        const logDate = parseDate(log.date);
        if (!logDate) return false;
        return logDate >= start && logDate <= end;
      });
  
      setLogs(filtered);
      setFilteredLogs(filtered);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError("Failed to retrieve data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a PDF report
  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    
    // Color palette
    const primaryColor =  [255, 153, 0]; // Dark blue
    const accentColor = [0, 51, 153]; // Orange
  
    // Add logo with professional placement
    const logoWidth = 50;
    const logoHeight = 50;
    doc.addImage("/FNB logo.png", "PNG", 250, 15, logoWidth, logoHeight);
  
    // Company header
    doc.setTextColor(...primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FNB (First National Bank)", 14, 25);
  
    // Subtitle with accent color
    doc.setTextColor(...accentColor);
    doc.setFontSize(12);
    doc.text("FNB Visitors Logs Report", 14, 35);
  
    // Report metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Report Date Range: ${startDate} - ${endDate}`, 14, 45);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 52);
  
    // Add table with professional styling
    const tableData = filteredLogs.map((log, index) => [
      index + 1,
      log.name || "N/A",
      log.company || "N/A",
      log.department || "N/A",
      log.telephone || "N/A",
      log.timeIn || "N/A",
      log.timeOut || "N/A",
      log.purpose || "N/A",
      log.reason || "N/A",
      log.date || "N/A",
    ]);
  
    doc.autoTable({
      head: [["#", "Name", "Company", "Department", "Telephone", "Time In", "Time Out", "Purpose", "Reason", "Date"]],
      body: tableData,
      startY: 65,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor,
        textColor: 255 
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      },
      styles: { 
        font: 'Helvetica',
        fontSize: 9 
      }
    });
  
    // Save the PDF
    doc.save("FNB Visitor_Logs_Report.pdf");
  };

  return (
    <div className="reports">
      <h1>Generate Reports</h1>
      <div className="filter-section">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
        <button onClick={fetchLogs} className="fetch-btn">
          Fetch Logs
        </button>
      </div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredLogs.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <>
          <div className="table-container">
            <table className="log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Department</th>
                  <th>Telephone</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Purpose</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>
                    <td>{log.name || "---"}</td>
                    <td>{log.company || "---"}</td>
                    <td>{log.department || "---"}</td>
                    <td>{log.telephone || "---"}</td>
                    <td>{log.timeIn || "---"}</td>
                    <td>{log.timeOut || "---"}</td>
                    <td>{log.purpose || "---"}</td>
                    <td>{log.reason || "---"}</td>
                    <td>{log.date || "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={generatePDF} className="download-btn">
            Download PDF
          </button>
        </>
      )}
    </div>
  );
};

export default Reports;