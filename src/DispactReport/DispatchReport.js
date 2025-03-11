import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import app from '../Firebase/Config';
import "../dispatchreport.css"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  headerSection: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    border: 1,
    borderColor: '#93c5fd',
  },
  statsSectionTitle: {
    fontSize: 18,
    color: '#1e40af',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    padding: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minHeight: 40,
    padding: 8,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    padding: 8,
    textAlign: 'left',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 12,
    color: '#6b7280',
  }
});
const PDFReport = ({ data, stats, reportType }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{reportType === 'IT-LOGS' ? 'Dispatch Report' : 'Item Entries Report'}</Text>
        <Text style={styles.dateText}>
          Generated on: {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Summary Statistics</Text>
        <View style={styles.statsRow}>
          {reportType === 'IT-LOGS' ? (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Dispatches</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Unique Recipients</Text>
                <Text style={styles.statValue}>{stats.uniqueRecipients}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Most Used Mode</Text>
                <Text style={styles.statValue}>{stats.mostUsedMode}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Items</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Unique Receivers</Text>
                <Text style={styles.statValue}>{stats.uniqueReceivers}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Most Common Item</Text>
                <Text style={styles.statValue}>{stats.mostCommonItem}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {reportType === 'IT-LOGS' ? (
            <>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Registry Number</Text>
              <Text style={styles.tableHeaderCell}>Dispatched By</Text>
              <Text style={styles.tableHeaderCell}>Mode</Text>
              <Text style={styles.tableHeaderCell}>Recipient</Text>
              <Text style={styles.tableHeaderCell}>Subject</Text>
              <Text style={styles.tableHeaderCell}>Location</Text>
            </>
          ) : (
            <>
              <Text style={styles.tableHeaderCell}>Date</Text>
              <Text style={styles.tableHeaderCell}>Time</Text>
              <Text style={styles.tableHeaderCell}>Item</Text>
              <Text style={styles.tableHeaderCell}>Receiver</Text>
              <Text style={styles.tableHeaderCell}>Signature</Text>
              <Text style={styles.tableHeaderCell}>Type</Text>
            </>
          )}
        </View>

        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
            {reportType === 'IT-LOGS' ? (
              <>
                <Text style={styles.tableCell}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                <Text style={styles.tableCell}>{item.registryNumber}</Text>
                <Text style={styles.tableCell}>{item.dispatchBy}</Text>
                <Text style={styles.tableCell}>{item.dispatchMode}</Text>
                <Text style={styles.tableCell}>{item.toWhomSent}</Text>
                <Text style={styles.tableCell}>{item.subject}</Text>
                <Text style={styles.tableCell}>{item.locationOfLetter}</Text>
              </>
            ) : (
              <>
                <Text style={styles.tableCell}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                <Text style={styles.tableCell}>{item.time}</Text>
                <Text style={styles.tableCell}>{item.item}</Text>
                <Text style={styles.tableCell}>{item.receiverName}</Text>
                <Text style={styles.tableCell}>{item.signature}</Text>
                <Text style={styles.tableCell}>{item.type}</Text>
              </>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        This report is automatically generated and is confidential.
      </Text>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

const ReportScreen = () => {
  const db = getFirestore(app);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dispatchData, setDispatchData] = useState([]);
  const [itemEntriesData, setItemEntriesData] = useState([]);
  const [filteredDispatchData, setFilteredDispatchData] = useState([]);
  const [filteredItemEntriesData, setFilteredItemEntriesData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('IT-LOGS');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dispatchSnapshot = await getDocs(
        query(collection(db, "IT-LOGS"), orderBy("timestamp", "desc"))
      );
      
      const itemEntriesSnapshot = await getDocs(
        query(collection(db, "ItemEntries"), orderBy("timestamp", "desc"))
      );
      
      const dispatchDataArray = dispatchSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      
      const itemEntriesDataArray = itemEntriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
      }));
      
      setDispatchData(dispatchDataArray);
      setFilteredDispatchData(dispatchDataArray);
      setItemEntriesData(itemEntriesDataArray);
      setFilteredItemEntriesData(itemEntriesDataArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError('Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }
  
    const filterData = (data) => {
      return data.filter(item => {
        // Convert timestamp to date if it's a Firestore timestamp
        const itemDate = item.timestamp?.toDate?.() || new Date(item.timestamp);
        
        // Set start date to beginning of day (00:00:00)
        const start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);
        
        // Set end date to end of day (23:59:59)
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
  
        // Make sure we have valid dates before comparing
        if (isNaN(itemDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error('Invalid date encountered:', { itemDate, start, end });
          return false;
        }
  
        return itemDate >= start && itemDate <= end;
      });
    };
  
    const filteredDispatch = filterData(dispatchData);
    const filteredItems = filterData(itemEntriesData);
  
    console.log('Filtered Dispatch Data:', filteredDispatch.length);
    console.log('Filtered Items Data:', filteredItems.length);
  
    setFilteredDispatchData(filteredDispatch);
    setFilteredItemEntriesData(filteredItems);
  };

  const resetFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilteredDispatchData(dispatchData);
    setFilteredItemEntriesData(itemEntriesData);
  };

  const getDispatchStats = () => {
    const mostUsedMode = filteredDispatchData.length > 0
      ? Object.entries(
          filteredDispatchData.reduce((acc, curr) => {
            acc[curr.dispatchMode] = (acc[curr.dispatchMode] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    return {
      total: filteredDispatchData.length,
      uniqueRecipients: new Set(filteredDispatchData.map(item => item.toWhomSent)).size,
      mostUsedMode
    };
  };

  const getItemEntriesStats = () => {
    const mostCommonItem = filteredItemEntriesData.length > 0
      ? Object.entries(
          filteredItemEntriesData.reduce((acc, curr) => {
            acc[curr.item] = (acc[curr.item] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    return {
      total: filteredItemEntriesData.length,
      uniqueReceivers: new Set(filteredItemEntriesData.map(item => item.receiverName)).size,
      mostCommonItem
    };
  };

  const getChartData = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyData = Array(12).fill().map(() => ({
      count: 0,
      items: []
    }));
    
    const data = reportType === 'IT-LOGS' ? filteredDispatchData : filteredItemEntriesData;
    
    data.forEach(item => {
      const month = new Date(item.timestamp).getMonth();
      monthlyData[month].count++;
      monthlyData[month].items.push(item);
    });
    
    return monthlyData.map((data, index) => ({
      name: monthNames[index],
      value: data.count,
      items: data.items
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const { items } = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-total">Total: {payload[0].value}</p>
          
          {items.map((item, index) => (
            <div key={index} className="tooltip-item">
              {reportType === 'IT-LOGS' ? (
                <>
                  <p>📅 Date: {new Date(item.timestamp).toLocaleDateString()}</p>
                  <p>📝 Subject: {item.subject}</p>
                  <p>📬 Mode: {item.dispatchMode}</p>
                  <p>👤 Dispatched By: {item.dispatchBy}</p>
                  <p>📍 Location: {item.locationOfLetter}</p>
                  <p>📋 Registry: {item.registryNumber}</p>
                </>
              ) : (
                <>
                  <p>📅 Date: {new Date(item.timestamp).toLocaleDateString()}</p>
                  <p>⏰ Time: {item.time}</p>
                  <p>📦 Item: {item.item}</p>
                  <p>👤 Receiver: {item.receiverName}</p>
                  <p>✍️ Signature: {item.signature}</p>
                  <p>📝 Type: {item.type}</p>
                </>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const barColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#FF9999',
    '#88D8B0', '#FF8C94', '#9BB7D4', '#B5EAD7', '#C7CEEA', '#FFB7B2'
  ];

  if (isLoading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="report-container">
      <header className="report-header">
        <h1>📊 Reports Dashboard</h1>
        <div className="header-controls">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="report-type-select"
          >
            <option value="IT-LOGS">IT-Logs</option>
            <option value="ItemEntries">FrontDesk-Dispatch Report</option>
            <option value="both">Both Reports</option>
          </select>
          <button 
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '❌ Hide Filters' : '🔍 Show Filters'}
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-section">
          <div className="date-filters">
          <div className="date-input-group">
  <span>📅</span>
  <input
    type="date"
    value={dateRange.startDate}
    onChange={(e) => {
      console.log('Start Date Changed:', e.target.value);
      setDateRange(prev => ({ ...prev, startDate: e.target.value }));
    }}
    placeholder="Start Date"
  />
</div>
<div className="date-input-group">
  <span>📅</span>
  <input
    type="date"
    value={dateRange.endDate}
    onChange={(e) => {
      console.log('End Date Changed:', e.target.value);
      setDateRange(prev => ({ ...prev, endDate: e.target.value }));
    }}
    placeholder="End Date"
  />
</div>
            <button className="apply-filter-button" onClick={handleFilter}>
              Apply Filter
            </button>
            <button className="reset-filter-button" onClick={resetFilter}>
              Reset
            </button>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="report-content">
        {(reportType === 'IT-LOGS' || reportType === 'both') && (
          <div className="dispatch-report-section">
            <div className="stats-section">
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Total Dispatches</h3>
                <p style={{color: 'white'}}>{filteredDispatchData.length}</p>
              </div>
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Unique Recipients</h3>
                <p style={{color: 'white'}}>{new Set(filteredDispatchData.map(item => item.toWhomSent)).size}</p>
              </div>
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Mode Of Delivery</h3>
                <p style={{color: 'white'}}>
                  {filteredDispatchData> 0
                    ? Object.entries(
                        filteredDispatchData.reduce((acc, curr) => {
                          acc[curr.dispatchMode] = (acc[curr.dispatchMode] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort((a, b) => b[1] - a[1])[0][0]
                    : 'Not Available'}
                </p>
              </div>
            </div>

            <div className="chart-section">
              <h2>Monthly Dispatch Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()} margin={{ top: 30, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    stroke="#666"
                  />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Number of Dispatches"
                    radius={[4, 4, 0, 0]}
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % 12]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-section">
              <div className="table-header">
                <h2>Dispatch Records</h2>
                <PDFDownloadLink
                  document={<PDFReport data={filteredDispatchData} stats={getDispatchStats()} reportType="IT-LOGS" />}
                  fileName={`dispatch_report_${new Date().toISOString().split('T')[0]}.pdf`}
                  className="download-button"
                >
                  {({ loading }) =>
                    loading ? '⏳ Preparing PDF...' : '📥 Download PDF Report'
                  }
                </PDFDownloadLink>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{color: 'black'}}>Date</th>
                      <th style={{color: 'black'}}>Registry Number</th>
                      <th style={{color: 'black'}}>Dispatched By</th>
                      <th style={{color: 'black'}}>Mode</th>
                      <th style={{color: 'black'}}>Recipient</th>
                      <th style={{color: 'black'}}>Subject</th>
                      <th style={{color: 'black'}}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatchData.map(item => (
                      <tr key={item.id}>
                        <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                        <td>{item.registryNumber}</td>
                        <td>{item.dispatchBy}</td>
                        <td>{item.dispatchMode}</td>
                        <td>{item.toWhomSent}</td>
                        <td>{item.subject}</td>
                        <td>{item.locationOfLetter}</td>
                      </tr>
                    ))}
                    {filteredDispatchData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No dispatch records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(reportType === 'ItemEntries' || reportType === 'both') && (
          <div className="item-entries-section">
            <div className="stats-section">
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Total Items</h3>
                <p style={{color: 'white'}}>{filteredItemEntriesData.length}</p>
              </div>
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Unique Receivers</h3>
                <p style={{color: 'white'}}>{new Set(filteredItemEntriesData.map(item => item.receiverName)).size}</p>
              </div>
              <div className="stat-card">
                <h3 style={{color: 'white'}}>Most Common Item</h3>
                <p style={{color: 'white'}}>
                  {filteredItemEntriesData.length > 0
                    ? Object.entries(
                        filteredItemEntriesData.reduce((acc, curr) => {
                          acc[curr.item] = (acc[curr.item] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort((a, b) => b[1] - a[1])[0][0]
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="chart-section">
              <h2>Monthly Item Entries Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()} margin={{ top: 30, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    stroke="#666"
                  />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Number of Items"
                    radius={[4, 4, 0, 0]}
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % 12]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-section">
              <div className="table-header">
                <h2>Item Entries Records</h2>
                <PDFDownloadLink
                  document={<PDFReport data={filteredItemEntriesData} stats={getItemEntriesStats()} reportType="ItemEntries" />}
                  fileName={`item_entries_report_${new Date().toISOString().split('T')[0]}.pdf`}
                  className="download-button"
                >
                  {({ loading }) =>
                    loading ? '⏳ Preparing PDF...' : '📥 Download PDF Report'
                  }
                </PDFDownloadLink>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{color: 'black'}}>Date</th>
                      <th style={{color: 'black'}}>Time</th>
                      <th style={{color: 'black'}}>Item</th>
                      <th style={{color: 'black'}}>Receiver</th>
                      <th style={{color: 'black'}}>Signature</th>
                      <th style={{color: 'black'}}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItemEntriesData.map(item => (
                      <tr key={item.id}>
                        <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                        <td>{item.time}</td>
                        <td>{item.item}</td>
                        <td>{item.receiverName}</td>
                        <td>{item.signature}</td>
                        <td>{item.type}</td>
                      </tr>
                    ))}
                    {filteredItemEntriesData.length === 0 && (
                      <tr>
                        <td colSpan="6" className="no-data">
                          No item entries found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportScreen;
