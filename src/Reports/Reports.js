import React, { useState, useEffect } from "react";
import { useVisitor } from "../path/to/VisitorContext"; // Update this path as needed
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../report.css";

const Reports = () => {
  const { branchData, selectedBranch, loading: contextLoading, fetchBranchData } = useVisitor();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [reportType, setReportType] = useState("date"); // "date" or "year"

  // Format date for display in YYYY-MM-DD format
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d instanceof Date && !isNaN(d) 
      ? d.toISOString().split('T')[0]
      : "";
  };

  // Parse date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Handle standard date input format (YYYY-MM-DD)
    if (dateStr.includes("-")) {
      return new Date(dateStr);
    }
    
    // Handle ISO format
    if (dateStr.includes("T")) {
      return new Date(dateStr);
    }
    
    // Handle MM/DD/YYYY format
    if (dateStr.includes("/")) {
      const [month, day, year] = dateStr.split('/').map(num => parseInt(num, 10));
      return new Date(year, month - 1, day);
    }
    
    return null;
  };

  useEffect(() => {
    // Initialize with today's date as end date and a week ago as start date
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    setEndDate(formatDateForDisplay(today));
    setStartDate(formatDateForDisplay(weekAgo));
    
    // Set current year as default
    setSelectedYear(today.getFullYear().toString());
  }, []);

  // Generate filtered logs based on date range or year
  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      // Only fetch data if we don't have it already
      if (branchData.allVisitorsData.length === 0) {
        await fetchBranchData(selectedBranch);
      }

      if (reportType === "date") {
        if (!startDate || !endDate) {
          throw new Error("Please select both start and end dates");
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (start > end) {
          throw new Error("Start date must be before end date");
        }

        const filtered = branchData.allVisitorsData.filter((log) => {
          const logDate = parseDate(log.date);
          return logDate && logDate >= start && logDate <= end;
        });

        setFilteredLogs(filtered);
      } else {
        if (!selectedYear) {
          throw new Error("Please select a year");
        }

        const yearNum = parseInt(selectedYear, 10);
        
        const filtered = branchData.allVisitorsData.filter((log) => {
          const logDate = parseDate(log.date);
          return logDate && logDate.getFullYear() === yearNum;
        });

        setFilteredLogs(filtered);
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.message || "Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    
    const primaryColor = [255, 153, 0];
    const accentColor = [0, 51, 153];
  
    // Add logo
    try {
      const logoWidth = 50;
      const logoHeight = 50;
      doc.addImage("/FNB logo.png", "PNG", 250, 15, logoWidth, logoHeight);
    } catch (e) {
      console.warn("Could not add logo image:", e);
    }
  
    // Add title and header
    doc.setTextColor(...primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FNB (First National Bank)", 14, 25);
  
    doc.setTextColor(...accentColor);
    doc.setFontSize(12);
    doc.text(`FNB Visitors Logs Report - ${selectedBranch} Branch`, 14, 35);
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const dateRange = reportType === "year" 
      ? `Year: ${selectedYear}` 
      : `Date Range: ${startDate} - ${endDate}`;
    doc.text(dateRange, 14, 45);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 52);
    doc.text(`Total Entries: ${filteredLogs.length}`, 14, 59);
  
    // Prepare table data
    const tableData = filteredLogs.map((log, index) => [
      index + 1,
      log.name || "N/A",
      log.company || "N/A",
      log.department || "N/A",
      log.telephone || "N/A",
      log.timeIn || "N/A",
      log.timeOut || "N/A",
      log.purpose || "N/A",
      (log.reason || log.comments || "N/A"),
      formatDateForDisplay(log.date) || "N/A",
    ]);
  
    // Generate table
    doc.autoTable({
      head: [["#", "Name", "Company", "Department", "Telephone", "Time In", "Time Out", "Purpose", "Comments", "Date"]],
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
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 15 }, // #
        9: { cellWidth: 25 }, // Date
      }
    });
  
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
  
    // Save PDF
    const filename = reportType === "year" 
      ? `FNB_${selectedBranch}_Visitor_Logs_${selectedYear}.pdf` 
      : `FNB_${selectedBranch}_Visitor_Logs_${startDate}_to_${endDate}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Visitor Reports</h1>
        <p className="branch-info">Branch: <strong>{selectedBranch}</strong></p>
      </div>
      
      <div className="filter-tabs">
        <button 
          className={`tab-btn ${reportType === 'date' ? 'active' : ''}`}
          onClick={() => setReportType('date')}
        >
          Date Range Report
        </button>
        <button 
          className={`tab-btn ${reportType === 'year' ? 'active' : ''}`}
          onClick={() => setReportType('year')}
        >
          Yearly Report
        </button>
      </div>

      <div className="filter-container">
        {reportType === 'date' ? (
          <div className="date-range-section">
            <div className="filter-inputs">
              <div className="input-group">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="end-date">End Date:</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="yearly-section">
            <div className="filter-inputs">
              <div className="input-group">
                <label htmlFor="year-select">Select Year:</label>
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  required
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        <button 
          onClick={generateReport} 
          className="generate-btn"
          disabled={loading || contextLoading}
        >
          {loading || contextLoading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && filteredLogs.length === 0 && (
        <div className="no-data-message">
          <p>{filteredLogs.length === 0 ? 'No data available for the selected period.' : 'Generate a report to view data.'}</p>
        </div>
      )}

      {!loading && !error && filteredLogs.length > 0 && (
        <>
          <div className="report-stats">
            <div className="stat-card">
              <h3>Total Entries</h3>
              <p className="stat-value">{filteredLogs.length}</p>
            </div>
          </div>

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
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{log.name || "---"}</td>
                    <td>{log.company || "---"}</td>
                    <td>{log.department || "---"}</td>
                    <td>{log.telephone || "---"}</td>
                    <td>{log.timeIn || "---"}</td>
                    <td>{log.timeOut || "---"}</td>
                    <td>{log.purpose || "---"}</td>
                    <td>{log.reason || log.comments || "---"}</td>
                    <td>{formatDateForDisplay(log.date) || "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="actions-container">
            <button onClick={generatePDF} className="download-btn">
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

// import React, { useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { getFirestore } from "firebase/firestore";
// import app from "../Firebase/Config";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import "../report.css";

// const Reports = () => {
//   const [logs, setLogs] = useState([]);
//   const [filteredLogs, setFilteredLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const db = getFirestore(app);

//   // Helper function to parse date strings in YYYY-MM-DD format
//  // Helper function to parse "DD/MM/YYYY" format to a valid Date object
// const parseDate = (dateStr) => {
//   try {
//     const parts = dateStr.split("/"); // Split the date by "/"
//     if (parts.length === 3) {
//       const day = parseInt(parts[0], 10); // Day is the first part
//       const month = parseInt(parts[1], 10) - 1; // Month is zero-based
//       const year = parseInt(parts[2], 10); // Year is the last part
//       return new Date(year, month, day);
//     }
//     return null;
//   } catch (err) {
//     console.error("Invalid date format:", dateStr);
//     return null;
//   }
// };

// // Function to fetch logs from Firestore and filter by date range
// const fetchLogs = async () => {
//   if (!startDate || !endDate) {
//     alert("Please select both start and end dates.");
//     return;
//   }

//   setLoading(true);
//   setError("");

//   try {
//     const snapshot = await getDocs(collection(db, "VisitorEntries"));
//     const logsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//     // Convert input dates to Date objects
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999); // Include the full end day

//     const filtered = logsData.filter((log) => {
//       const logDate = parseDate(log.date); // Parse the "DD/MM/YYYY" format
//       if (!logDate) {
//         console.log("Skipping log with invalid date:", log);
//         return false;
//       }
//       return logDate >= start && logDate <= end;
//     });

//     setLogs(filtered);
//     setFilteredLogs(filtered);
//   } catch (error) {
//     console.error("Error fetching logs:", error);
//     setError("Failed to retrieve data. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };


//   // Function to generate a PDF report
//   const generatePDF = () => {
//     const doc = new jsPDF("landscape");

//     // Color palette
//     const primaryColor = [255, 153, 0]; // Orange
//     const accentColor = [0, 51, 153]; // Dark blue

//     // Add logo
//     const logoWidth = 50;
//     const logoHeight = 50;
//     doc.addImage("/FNB logo.png", "PNG", 250, 15, logoWidth, logoHeight);

//     // Company header
//     doc.setTextColor(...primaryColor);
//     doc.setFont("Helvetica", "bold");
//     doc.setFontSize(14);
//     doc.text("FNB (First National Bank)", 14, 25);

//     // Subtitle
//     doc.setTextColor(...accentColor);
//     doc.setFontSize(12);
//     doc.text("FNB Visitors Logs Report", 14, 35);

//     // Report metadata
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(10);
//     doc.text(`Report Date Range: ${startDate} - ${endDate}`, 14, 45);
//     doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 52);

//     // Add table
//     const tableData = filteredLogs.map((log, index) => [
//       index + 1,
//       log.name || "N/A",
//       log.company || "N/A",
//       log.department || "N/A",
//       log.telephone || "N/A",
//       log.timeIn || "N/A",
//       log.timeOut || "N/A",
//       log.purpose || "N/A",
//       log.reason || "N/A",
//       log.date || "N/A",
//     ]);

//     doc.autoTable({
//       head: [["#", "Name", "Company", "Department", "Telephone", "Time In", "Time Out", "Purpose", "Reason", "Date"]],
//       body: tableData,
//       startY: 65,
//       theme: "striped",
//       headStyles: {
//         fillColor: primaryColor,
//         textColor: 255,
//       },
//       alternateRowStyles: {
//         fillColor: [240, 240, 240],
//       },
//       styles: {
//         font: "Helvetica",
//         fontSize: 9,
//       },
//     });

//     // Save the PDF
//     doc.save("FNB Visitor_Logs_Report.pdf");
//   };

//   return (
//     <div className="reports">
//       <h1>Generate Reports</h1>
//       <div className="filter-section">
//         <label>
//           Start Date:
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             required
//           />
//         </label>
//         <label>
//           End Date:
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             required
//           />
//         </label>
//         <button onClick={fetchLogs} className="fetch-btn">
//           Fetch Logs
//         </button>
//       </div>
//       {loading ? (
//         <p>Loading data...</p>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : filteredLogs.length === 0 ? (
//         <p>No data available for the selected date range.</p>
//       ) : (
//         <>
//           <div className="table-container">
//             <table className="log-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Name</th>
//                   <th>Company</th>
//                   <th>Department</th>
//                   <th>Telephone</th>
//                   <th>Time In</th>
//                   <th>Time Out</th>
//                   <th>Purpose</th>
//                   <th>Reason</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredLogs.map((log, index) => (
//                   <tr key={log.id}>
//                     <td>{index + 1}</td>
//                     <td>{log.name || "---"}</td>
//                     <td>{log.company || "---"}</td>
//                     <td>{log.department || "---"}</td>
//                     <td>{log.telephone || "---"}</td>
//                     <td>{log.timeIn || "---"}</td>
//                     <td>{log.timeOut || "---"}</td>
//                     <td>{log.purpose || "---"}</td>
//                     <td>{log.reason || "---"}</td>
//                     <td>{log.date || "---"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <button onClick={generatePDF} className="download-btn">
//             Download PDF
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Reports;
