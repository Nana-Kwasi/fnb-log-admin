import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useVisitor } from "../context/VisitorContext";
import "../ana.css";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState("bar");

  // Get data from context instead of Firebase
  const { branchData } = useVisitor();

  const filterCurrentYearData = (data) => {
    const currentYear = new Date().getFullYear();
    return data.filter(log => {
      if (log.date) {
        const logDate = new Date(log.date);
        return !isNaN(logDate.getTime()) && logDate.getFullYear() === currentYear;
      }
      return false;
    });
  };

  useEffect(() => {
    try {
      // Use allVisitorsData from context instead of fetching from Firebase
      const allData = branchData.allVisitorsData || [];

      // Filter data for current year
      const currentYearData = filterCurrentYearData(allData);

      // Group data by month
      const groupedData = currentYearData.reduce(
        (acc, log) => {
          if (log.date) {
            const date = new Date(log.date);
            if (!isNaN(date.getTime())) {
              const month = date.toLocaleString("default", { month: "short" });
              acc.chartData[month] = (acc.chartData[month] || 0) + 1;
              
              // For weekday distribution
              const weekday = date.toLocaleString("default", { weekday: "short" });
              acc.weekdayData[weekday] = (acc.weekdayData[weekday] || 0) + 1;
              
              // For hour distribution (for histogram)
              const hour = date.getHours();
              acc.hourData[hour] = (acc.hourData[hour] || 0) + 1;
            }
          }
          
          // For company distribution
          if (log.company) {
            acc.companyData[log.company] = (acc.companyData[log.company] || 0) + 1;
          }
          
          acc.tableData.push({
            name: log.name || "N/A",
            company: log.company || "N/A",
            date: log.date || "Invalid Date",
          });
          return acc;
        },
        { chartData: {}, tableData: [], weekdayData: {}, hourData: {}, companyData: {} }
      );

      // Ensure all months are represented with 0 if no data
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const completeChartData = {};
      months.forEach(month => {
        completeChartData[month] = groupedData.chartData[month] || 0;
      });

      // Convert grouped data to arrays for ApexCharts
      const chartDataArray = Object.entries(completeChartData).map(
        ([month, visits]) => ({
          month,
          visits,
        })
      );
      
      // Prepare weekday data
      const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weekdayDataArray = weekdays.map(day => 
        groupedData.weekdayData[day] || 0
      );
      
      // Prepare hour data for histogram
      const hourDataArray = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: groupedData.hourData[i] || 0
      }));
      
      // Prepare bubble chart data (month, day of month, visits)
      const bubbleData = currentYearData.reduce((acc, log) => {
        if (log.date) {
          const date = new Date(log.date);
          if (!isNaN(date.getTime())) {
            const month = date.getMonth();
            const day = date.getDate();
            
            // Check if we already have this day
            const existingIdx = acc.findIndex(item => 
              item.month === month && item.day === day
            );
            
            if (existingIdx >= 0) {
              acc[existingIdx].visits += 1;
            } else {
              acc.push({ month, day, visits: 1 });
            }
          }
        }
        return acc;
      }, []);
      
      // Top 5 companies for radar chart
      const companyDataArray = Object.entries(groupedData.companyData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([company, count]) => ({
          company,
          count
        }));

      setAnalyticsData({
        monthly: chartDataArray,
        weekday: weekdayDataArray,
        hourly: hourDataArray,
        bubble: bubbleData,
        companies: companyDataArray
      });
      setTableData(groupedData.tableData);
      setLoading(false);
    } catch (err) {
      console.error("Error processing analytics data:", err);
      setError("Failed to process analytics data.");
      setLoading(false);
    }
  }, [branchData.allVisitorsData]); // Depend on allVisitorsData from context

  // Prepare data for various charts
  const chartSeries = analyticsData.monthly ? [
    {
      name: "Visits",
      data: analyticsData.monthly.map(item => item.visits),
    },
  ] : [];
  
  const chartCategories = analyticsData.monthly ? 
    analyticsData.monthly.map(item => item.month) : [];

  const pieSeries = analyticsData.monthly ? 
    analyticsData.monthly.map(item => item.visits) : [];
    
  const weekdaySeries = analyticsData.weekday ? [
    {
      name: "Visits by Day",
      data: analyticsData.weekday,
    }
  ] : [];
  
  const hourlyHistogramSeries = analyticsData.hourly ? [
    {
      name: "Visits",
      data: analyticsData.hourly.map(item => item.count)
    }
  ] : [];
  
  const bubbleSeries = analyticsData.bubble ? [
    {
      name: "Visits",
      data: analyticsData.bubble.map(item => ({
        x: item.month,
        y: item.day,
        z: item.visits * 10 // Scale for better visibility
      }))
    }
  ] : [];
  
  const radarSeries = analyticsData.companies ? [
    {
      name: "Company Visits",
      data: analyticsData.companies.map(item => item.count)
    }
  ] : [];
  
  const radarCategories = analyticsData.companies ?
    analyticsData.companies.map(item => item.company) : [];

  const totalVisits = analyticsData.monthly ? 
    analyticsData.monthly.reduce((sum, item) => sum + item.visits, 0) : 0;

  // Generate scatter plot data
  const generateScatterData = () => {
    if (!analyticsData.monthly) return [];
    
    return analyticsData.monthly.map((item, index) => ({
      x: index,
      y: item.visits,
    }));
  };
  
  const scatterSeries = [
    {
      name: "Monthly Distribution",
      data: generateScatterData()
    }
  ];

  const renderCurrentChart = () => {
    switch(activeTab) {
      case "bar":
        return (
          <ReactApexChart
            type="bar"
            series={chartSeries}
            options={{
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
              },
              plotOptions: {
                bar: {
                  borderRadius: 5,
                  columnWidth: "50%",
                  distributed: false,
                  dataLabels: {
                    position: "top"
                  }
                },
              },
              colors: ["#00A36C"],
              title: {
                text: `Monthly Visitor Trends ${new Date().getFullYear()}`,
                align: "center",
                style: { fontSize: "16px" }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val;
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              tooltip: { 
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              },
            }}
            height={350}
          />
        );
      case "line":
        return (
          <ReactApexChart
            type="line"
            series={chartSeries}
            options={{
              chart: {
                animations: { enabled: true },
                dropShadow: {
                  enabled: true,
                  color: "#000",
                  top: 18,
                  left: 7,
                  blur: 10,
                  opacity: 0.2
                },
                toolbar: { show: true }
              },
              xaxis: {
                categories: chartCategories,
                title: { text: "Months" },
              },
              yaxis: {
                title: { text: "Number of Visits" },
              },
              colors: ["#FF4560"],
              title: { 
                text: `Monthly Visitor Trends ${new Date().getFullYear()}`, 
                align: "center",
                style: { fontSize: "16px" }
              },
              stroke: { 
                curve: "smooth", 
                width: 3
              },
              markers: {
                size: 6,
                strokeWidth: 0,
                hover: {
                  size: 9
                }
              },
              tooltip: { 
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              },
            }}
            height={350}
          />
        );
      case "pie":
        return (
          <ReactApexChart
            type="pie"
            series={pieSeries}
            options={{
              labels: chartCategories,
              colors: [
                "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
                "#3F51B5", "#546E7A", "#D4526E", "#8D5B4C", "#F86624", 
                "#D7263D", "#1B998B"
              ],
              title: { 
                text: `Monthly Visitor Distribution ${new Date().getFullYear()}`, 
                align: "center",
                style: { fontSize: "16px" }
              },
              tooltip: { theme: "dark" },
              legend: { 
                position: "bottom",
                formatter: function(seriesName, opts) {
                  return [seriesName, " - ", opts.w.globals.series[opts.seriesIndex], " visits"];
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                  return Math.round(val) + "%";
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 300
                  },
                  legend: {
                    position: "bottom"
                  }
                }
              }]
            }}
            height={350}
          />
        );
      case "histogram":
        return (
          <ReactApexChart
            type="bar"
            series={hourlyHistogramSeries}
            options={{
              chart: {
                type: "bar",
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: "85%",
                  dataLabels: {
                    position: "top"
                  }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val > 0 ? val : "";
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              xaxis: {
                categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                title: { text: "Hour of Day" },
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Visits Distribution by Hour of Day (Histogram)",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#17A2B8"],
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              },
              grid: {
                borderColor: "#e7e7e7",
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                }
              }
            }}
            height={350}
          />
        );
      case "bubble":
        return (
          <ReactApexChart
            type="bubble"
            series={bubbleSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true },
                zoom: { enabled: true }
              },
              xaxis: {
                title: { text: "Month" },
                tickAmount: 12,
                labels: {
                  formatter: function(val) {
                    return months[Math.floor(val)];
                  }
                },
                min: -0.5,
                max: 11.5
              },
              yaxis: {
                title: { text: "Day of Month" },
                max: 31,
                min: 0
              },
              title: {
                text: "Visitor Bubble Chart (Month vs Day)",
                align: "center",
                style: { fontSize: "16px" }
              },
              fill: {
                type: "gradient",
                gradient: {
                  shade: "dark",
                  type: "vertical",
                  shadeIntensity: 0.5,
                  inverseColors: true,
                  opacityFrom: 1,
                  opacityTo: 0.8,
                  stops: [0, 100]
                }
              },
              colors: ["#6236FF"],
              tooltip: {
                theme: "dark",
                x: {
                  formatter: function(val) {
                    return months[Math.floor(val)];
                  }
                },
                z: {
                  formatter: function(val) {
                    return Math.floor(val/10) + " visits";
                  },
                  title: "Visits:"
                }
              }
            }}
            height={350}
          />
        );
      case "scatter":
        return (
          <ReactApexChart
            type="scatter"
            series={scatterSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true },
                zoom: { type: "xy" }
              },
              xaxis: {
                title: { text: "Month Index" },
                tickAmount: 12,
                labels: {
                  formatter: function(val) {
                    return chartCategories[Math.floor(val)] || "";
                  }
                }
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Monthly Visits Scatter Plot",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#FF6B6B"],
              markers: {
                size: [10, 15],
                strokeWidth: 0
              },
              tooltip: {
                theme: "dark",
                x: {
                  formatter: function(val) {
                    return chartCategories[Math.floor(val)] || "";
                  }
                },
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "radar":
        return (
          <ReactApexChart
            type="radar"
            series={radarSeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: false },
                dropShadow: {
                  enabled: true,
                  blur: 1,
                  left: 1,
                  top: 1
                }
              },
              title: {
                text: "Top Companies by Visits",
                align: "center",
                style: { fontSize: "16px" }
              },
              xaxis: {
                categories: radarCategories
              },
              fill: {
                opacity: 0.7
              },
              stroke: {
                width: 2
              },
              colors: ["#7B68EE"],
              markers: {
                size: 5,
                hover: {
                  size: 10
                }
              },
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "heatmap":
        return (
          <ReactApexChart
            type="heatmap"
            series={[
              {
                name: "Jan",
                data: generateHeatmapData(0)
              },
              {
                name: "Feb",
                data: generateHeatmapData(1)
              },
              {
                name: "Mar",
                data: generateHeatmapData(2)
              },
              {
                name: "Apr",
                data: generateHeatmapData(3)
              }
            ]}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                heatmap: {
                  shadeIntensity: 0.5,
                  colorScale: {
                    ranges: [
                      {
                        from: 0,
                        to: 10,
                        name: "low",
                        color: "#00A100"
                      },
                      {
                        from: 11,
                        to: 20,
                        name: "medium",
                        color: "#FFB200"
                      },
                      {
                        from: 21,
                        to: 50,
                        name: "high",
                        color: "#FF0000"
                      }
                    ]
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              title: {
                text: "Visitor Heat Map (Week Days x Months)",
                align: "center",
                style: { fontSize: "16px" }
              },
              xaxis: {
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              },
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "weekday":
        return (
          <ReactApexChart
            type="bar"
            series={weekdaySeries}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: true }
              },
              plotOptions: {
                bar: {
                  borderRadius: 5,
                  columnWidth: "60%",
                  dataLabels: {
                    position: "top"
                  }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: function(val) {
                  return val;
                },
                offsetY: -20,
                style: {
                  fontSize: "12px",
                  colors: ["#304758"]
                }
              },
              xaxis: {
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                title: { text: "Day of Week" }
              },
              yaxis: {
                title: { text: "Number of Visits" }
              },
              title: {
                text: "Visits Distribution by Day of Week",
                align: "center",
                style: { fontSize: "16px" }
              },
              colors: ["#FF9800"],
              tooltip: {
                theme: "dark",
                y: {
                  formatter: function(val) {
                    return val + " visits";
                  }
                }
              }
            }}
            height={350}
          />
        );
      case "radialbar":
        return (
          <ReactApexChart
            type="radialBar"
            series={analyticsData.companies ? 
              analyticsData.companies.map(item => item.count) : []}
            options={{
              chart: {
                animations: { enabled: true },
                toolbar: { show: false }
              },
              plotOptions: {
                radialBar: {
                  dataLabels: {
                    name: {
                      fontSize: "16px",
                    },
                    value: {
                      fontSize: "14px",
                    },
                    total: {
                      show: true,
                      label: "Total",
                      formatter: function() {
                        return analyticsData.companies ? 
                          analyticsData.companies.reduce((sum, item) => sum + item.count, 0) : 0;
                      }
                    }
                  },
                  hollow: {
                    size: "40%"
                  },
                  track: {
                    background: "#f2f2f2"
                  }
                }
              },
              labels: radarCategories,
              colors: ["#20c997", "#6f42c1", "#fd7e14", "#e83e8c", "#007bff"],
              title: {
                text: "Top Companies - Radial View",
                align: "center",
                style: { fontSize: "16px" }
              },
              legend: {
                show: true,
                position: "bottom"
              }
            }}
            height={350}
          />
        );
      default:
        return null;
    }
  };
  
  // Mock function to generate heatmap data
  const generateHeatmapData = (monthIndex) => {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return weekdays.map(day => {
      return {
        x: day,
        y: Math.floor(Math.random() * 30) + 5
      };
    });
  };
  
  // Array of months for charts
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="analytics">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error">{error}</p>
        </div>
      ) : (
        <>
          <div className="analytics-header">
            <h2>Analytics Dashboard</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <h3>{totalVisits}</h3>
                <p>Total Visits</p>
              </div>
              <div className="stat-card">
                <h3>{analyticsData.monthly ? analyticsData.monthly.reduce((max, item) => 
                  item.visits > max ? item.visits : max, 0) : 0}</h3>
                <p>Peak Month</p>
              </div>
              <div className="stat-card">
                <h3>{analyticsData.companies ? analyticsData.companies.length : 0}</h3>
                <p>Companies</p>
              </div>
              <div className="stat-card">
                <h3>{tableData.length}</h3>
                <p>Unique Visitors</p>
              </div>
            </div>
          </div>

          <div className="chart-tabs">
            <button 
              className={activeTab === "bar" ? "active" : ""} 
              onClick={() => setActiveTab("bar")}
            >
              Bar
            </button>
            <button 
              className={activeTab === "line" ? "active" : ""} 
              onClick={() => setActiveTab("line")}
            >
              Line
            </button>
            <button 
              className={activeTab === "pie" ? "active" : ""} 
              onClick={() => setActiveTab("pie")}
            >
              Pie
            </button>
            <button 
              className={activeTab === "histogram" ? "active" : ""} 
              onClick={() => setActiveTab("histogram")}
            >
              Histogram
            </button>
            <button 
              className={activeTab === "bubble" ? "active" : ""} 
              onClick={() => setActiveTab("bubble")}
            >
              Bubble
            </button>
            <button 
              className={activeTab === "scatter" ? "active" : ""} 
              onClick={() => setActiveTab("scatter")}
            >
              Scatter
            </button>
           
            <button 
              className={activeTab === "heatmap" ? "active" : ""} 
              onClick={() => setActiveTab("heatmap")}
            >
              Heatmap
            </button>
            <button 
              className={activeTab === "weekday" ? "active" : ""} 
              onClick={() => setActiveTab("weekday")}
            >
              Weekday
            </button>
            <button 
              className={activeTab === "radialbar" ? "active" : ""} 
              onClick={() => setActiveTab("radialbar")}
            >
              RadialBar
            </button>
          </div>

          <div className="chart-container">
            {renderCurrentChart()}
          </div>

          {/* Data Table */}
          <div className="table-section">
            <h3>Detailed Visitor Data</h3>
            <div className="table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData
                    .slice(0, showAll ? tableData.length : 5)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.company}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <button 
              className="view-all-btn" 
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
