import React, { useState, useEffect } from "react";
import { useVisitor } from "../context/VisitorContext";
import ReactApexChart from "react-apexcharts";
import "../ana.css";

const Analytics = () => {
  const { branchData, selectedBranch, loading: contextLoading, fetchBranchData } = useVisitor();
  const [analyticsData, setAnalyticsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);
  const [visitsToday, setVisitsToday] = useState(0);
  const [selectedChartType, setSelectedChartType] = useState("bar");

  // Function to parse date safely
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

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return "N/A";
    const d = parseDate(date);
    return d instanceof Date && !isNaN(d) 
      ? d.toLocaleDateString()
      : "Invalid Date";
  };

  // Filter data for current year
  const filterCurrentYearData = (data) => {
    const currentYear = new Date().getFullYear();
    return data.filter(log => {
      if (log.date) {
        const logDate = parseDate(log.date);
        return logDate && !isNaN(logDate.getTime()) && logDate.getFullYear() === currentYear;
      }
      return false;
    });
  };

  // Check if a date is today
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const date = parseDate(dateStr);
    if (!date) return false;
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  useEffect(() => {
    const processData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch data if not already available
        if (branchData.allVisitorsData.length === 0) {
          await fetchBranchData(selectedBranch);
        }
        
        const allVisitorData = branchData.allVisitorsData;
        
        // Filter data for current year
        const currentYearData = filterCurrentYearData(allVisitorData);
        
        // Count today's visits
        const todayVisits = allVisitorData.filter(log => isToday(log.date)).length;
        setVisitsToday(todayVisits);
        
        // Group data by month
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = Array(12).fill(0);
        
        currentYearData.forEach(log => {
          if (log.date) {
            const date = parseDate(log.date);
            if (date && !isNaN(date.getTime())) {
              const monthIndex = date.getMonth();
              monthlyData[monthIndex]++;
            }
          }
        });
        
        // Convert to format expected by chart
        const chartDataArray = monthNames.map((month, index) => ({
          month,
          visits: monthlyData[index]
        }));
        
        setAnalyticsData(chartDataArray);
        setTotalVisits(currentYearData.length);
        
        // Prepare table data
        const visitorTableData = currentYearData.map(log => ({
          name: log.name || "N/A",
          company: log.company || "N/A",
          department: log.department || "N/A",
          date: formatDateForDisplay(log.date),
          timeIn: log.timeIn || "N/A",
          purpose: log.purpose || "N/A"
        }));
        
        setTableData(visitorTableData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing analytics data:", err);
        setError("Failed to process analytics data");
        setLoading(false);
      }
    };
    
    processData();
  }, [branchData.allVisitorsData, fetchBranchData, selectedBranch]);

  // Prepare data for ApexCharts
  const chartSeries = [
    {
      name: "Visits",
      data: analyticsData.map((item) => item.visits),
    },
  ];
  const chartCategories = analyticsData.map((item) => item.month);

  const pieSeries = analyticsData.map((item) => item.visits);

  // Generate chart colors
  const generateChartColors = () => {
    const colors = [
      "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", 
      "#3F51B5", "#546E7A", "#D4526E", "#8D5B4C", "#F86624", 
      "#D7263D", "#1B998B"
    ];
    return colors;
  };

  const chartOptions = {
    bar: {
      chart: { 
        animations: { enabled: true },
        toolbar: { show: true }
      },
      xaxis: {
        categories: chartCategories,
        title: { text: "Months" },
      },
      yaxis: {
        title: { text: "Number of Visits" },
        min: 0,
        forceNiceScale: true,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "60%",
          distributed: true,
        },
      },
      colors: ["#00A36C"],
      title: {
        text: `Monthly Visitor Trends ${new Date().getFullYear()} - ${selectedBranch} Branch`,
        align: "center",
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      tooltip: { theme: "light" },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val > 0 ? val : '';
        },
        style: {
          colors: ['#333']
        }
      },
      legend: { show: false }
    },
    line: {
      chart: {
        animations: { enabled: true },
        toolbar: { show: true }
      },
      xaxis: {
        categories: chartCategories,
        title: { text: "Months" },
      },
      yaxis: {
        title: { text: "Number of Visits" },
        min: 0,
        forceNiceScale: true,
      },
      colors: ["#FF4560"],
      title: { 
        text: `Monthly Visitor Trends ${new Date().getFullYear()} - ${selectedBranch} Branch`, 
        align: "center",
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      stroke: { curve: "smooth", width: 3 },
      tooltip: { theme: "light" },
      markers: {
        size: 5,
        hover: { size: 7 }
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val > 0 ? val : '';
        },
        style: {
          colors: ['#333']
        }
      }
    },
    pie: {
      labels: chartCategories,
      colors: generateChartColors(),
      title: { 
        text: `Monthly Visitor Distribution ${new Date().getFullYear()} - ${selectedBranch} Branch`, 
        align: "center",
        style: {
          fontSize: '16px',
          fontWeight: 'bold'
        }
      },
      tooltip: { theme: "light" },
      legend: { position: "bottom" },
      dataLabels: {
        enabled: true,
        formatter: function(val, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return value > 0 ? `${opts.w.globals.labels[opts.seriesIndex]}: ${value}` : '';
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };

  return (
    <div className="analytics-container">
      {loading || contextLoading ? (
        <div className="loading-container">
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error">{error}</p>
        </div>
      ) : (
        <>
          <div className="analytics-header">
            <h1>Analytics Dashboard</h1>
            <p className="branch-info">Branch: <strong>{selectedBranch}</strong></p>
          </div>
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Visits</h3>
              <p className="stat-value">{totalVisits}</p>
              <p className="stat-label">This Year</p>
            </div>
            <div className="stat-card">
              <h3>Today's Visits</h3>
              <p className="stat-value">{visitsToday}</p>
              <p className="stat-label">Today</p>
            </div>
            <div className="stat-card">
              <h3>Monthly Average</h3>
              <p className="stat-value">
                {totalVisits > 0 ? Math.round(totalVisits / 12 * 10) / 10 : 0}
              </p>
              <p className="stat-label">Visits per Month</p>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-controls">
              <h2>Visitor Trends</h2>
              <div className="chart-type-toggle">
                <button 
                  className={`chart-type-btn ${selectedChartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setSelectedChartType('bar')}
                >
                  Bar Chart
                </button>
                <button 
                  className={`chart-type-btn ${selectedChartType === 'line' ? 'active' : ''}`}
                  onClick={() => setSelectedChartType('line')}
                >
                  Line Chart
                </button>
                <button 
                  className={`chart-type-btn ${selectedChartType === 'pie' ? 'active' : ''}`}
                  onClick={() => setSelectedChartType('pie')}
                >
                  Pie Chart
                </button>
              </div>
            </div>
            
            {selectedChartType === 'bar' && (
              <ReactApexChart
                type="bar"
                series={chartSeries}
                options={chartOptions.bar}
                height={350}
              />
            )}
            
            {selectedChartType === 'line' && (
              <ReactApexChart
                type="line"
                series={chartSeries}
                options={chartOptions.line}
                height={350}
              />
            )}
            
            {selectedChartType === 'pie' && (
              <ReactApexChart
                type="pie"
                series={pieSeries.filter(val => val > 0)}
                options={{
                  ...chartOptions.pie,
                  labels: chartCategories.filter((_, i) => pieSeries[i] > 0)
                }}
                height={350}
              />
            )}
          </div>

          <div className="table-section">
            <h2>Detailed Visitor Data</h2>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Department</th>
                    <th>Purpose</th>
                    <th>Time In</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">No visitor data available</td>
                    </tr>
                  ) : (
                    tableData
                      .slice(0, showAll ? tableData.length : 5)
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.company}</td>
                          <td>{item.department}</td>
                          <td>{item.purpose}</td>
                          <td>{item.timeIn}</td>
                          <td>{item.date}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
            
            {tableData.length > 5 && (
              <button onClick={() => setShowAll((prev) => !prev)} className="view-all-btn">
                {showAll ? "Show Less" : `View All (${tableData.length})`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;