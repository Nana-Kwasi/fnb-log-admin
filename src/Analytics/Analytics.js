import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
import ReactApexChart from "react-apexcharts";
import "../ana.css";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "VisitorEntries"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group data by month
        const groupedData = data.reduce(
          (acc, log) => {
            if (log.date) {
              const date = new Date(log.date);
              if (!isNaN(date.getTime())) {
                const month = date.toLocaleString("default", { month: "short" });
                acc.chartData[month] = (acc.chartData[month] || 0) + 1;
              }
            }
            acc.tableData.push({
              name: log.name || "N/A",
              company: log.company || "N/A",
              date: log.date || "Invalid Date",
            });
            return acc;
          },
          { chartData: {}, tableData: [] }
        );

        // Convert grouped data to an array for ApexCharts
        const chartDataArray = Object.entries(groupedData.chartData).map(
          ([month, visits]) => ({
            month,
            visits,
          })
        );

        setAnalyticsData(chartDataArray);
        setTableData(groupedData.tableData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  // Prepare data for ApexCharts
  const chartSeries = [
    {
      name: "Visits",
      data: analyticsData.map((item) => item.visits),
    },
  ];
  const chartCategories = analyticsData.map((item) => item.month);

  const pieSeries = analyticsData.map((item) => item.visits);

  const totalVisits = analyticsData.reduce((sum, item) => sum + item.visits, 0);

  return (
    <div className="analytics">
      {/* <h2>Visitor Analytics</h2> */}
      {loading ? (
        <p>Loading analytics data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <h3>Total Visits: {totalVisits}</h3>

          {/* Bar Chart */}
          {/* <h3>Visitor Trends (Bar Chart)</h3> */}
          <ReactApexChart
            type="bar"
            series={chartSeries}
            options={{
              chart: { animations: { enabled: true } },
              xaxis: {
                categories: chartCategories,
                title: { text: "Months" },
              },
              yaxis: {
                title: { text: "Number of Visits" },
              },
              plotOptions: {
                bar: {
                  borderRadius: 3,
                  columnWidth: "40%", // Smaller bars
                },
              },
              colors: ["#00A36C"], // Bar color
              title: {
                text: "Monthly Visitor Trends (Bar Chart)",
                align: "center",
              },
              tooltip: { theme: "dark" },
            }}
            height={350}
          />

          {/* Valley Line Chart */}
          {/* <h3>Visitor Trends (Valley Line Chart)</h3> */}
          <ReactApexChart
            type="line"
            series={chartSeries}
            options={{
              chart: {
                animations: { enabled: true },
              },
              xaxis: {
                categories: chartCategories,
                title: { text: "Months" },
              },
              yaxis: {
                title: { text: "Number of Visits" },
              },
              colors: ["#FF4560"], // Valley line color
              title: { text: "Monthly Visitor Trends (Valley Line)", align: "center" },
              stroke: { curve: "stepline", width: 2 }, // Valley effect
              tooltip: { theme: "dark" },
            }}
            height={350}
          />

          {/* Pie Chart */}
          {/* <h3>Visitor Distribution (Pie Chart)</h3> */}
          <ReactApexChart
            type="pie"
            series={pieSeries}
            options={{
              labels: chartCategories,
              colors: ["#008FFB", "#FF4560", "#00E396", "#FEB019"],
              title: { text: "Monthly Visitor Distribution", align: "center" },
              tooltip: { theme: "dark" },
              legend: { position: "bottom" },
            }}
            height={350}
          />

          {/* Data Table */}
          <h3>Detailed Visitor Data</h3>
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
                    <td>{item.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? "Show Less" : "View All"}
          </button>
        </>
      )}
    </div>
  );
};

export default Analytics;
