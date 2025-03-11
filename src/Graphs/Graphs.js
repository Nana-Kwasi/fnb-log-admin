 import React from 'react';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import "../graphs.css"

const Graphs = ({ typeCount, subjectCount }) => {
  // Convert typeCount object to array format for charts
  const typeData = Object.entries(typeCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Convert subjectCount object to array format for charts
  const subjectData = Object.entries(subjectCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Generate line chart data with timestamps
  const generateLineData = (data) => {
    return data.map((item, index) => ({
      name: item.name,
      count: item.value,
      timestamp: new Date(Date.now() - (index * 86400000)).toLocaleDateString()
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="graphs-container">
      <div className="graph-section">
        <h2>Item Entries Distribution</h2>
        <div className="graph-row">
          <div className="graph-card">
            <h3>Item Types Line Graph</h3>
            <LineChart width={600} height={300} data={generateLineData(typeData)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </div>
          <div className="graph-card">
            <h3>Item Types Distribution</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={typeData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="graph-section">
        <h2>IT Logs Distribution</h2>
        <div className="graph-row">
          <div className="graph-card">
            <h3>IT Logs Line Graph</h3>
            <LineChart width={600} height={300} data={generateLineData(subjectData)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </div>
          <div className="graph-card">
            <h3>IT Logs Distribution</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={subjectData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={80}
                fill="#82ca9d"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="tables-container">
        <div className="table-section">
          <h2>Item Entries Summary</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {typeData.map((item) => {
                const percentage = ((item.value / typeData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(2);
                return (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>{percentage}%</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-section">
          <h2>IT Logs Summary</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {subjectData.map((item) => {
                const percentage = ((item.value / subjectData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(2);
                return (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>{percentage}%</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Graphs;