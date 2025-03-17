API response: Array(1)0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)
Login.js:48 Unique branches: Array(1)0: "MAKOLA BRANCH"length: 1[[Prototype]]: Array(0)
Login.js:40 API response: Array(1)0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)
Login.js:48 Unique branches: Array(1)0: "MAKOLA BRANCH"length: 1[[Prototype]]: Array(0)
Login.js:76 Attempting login with: Objectbranch: "MAKOLA BRANCH"email: "franciskontoh@fnb.co.za"[[Prototype]]: Object
VisitorContext.js:52 Fetching data for branch: MAKOLA BRANCH
VisitorContext.js:60 API response for all data: Array(1)0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)
VisitorContext.js:66 Filtered branch data: Array(1)0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)
VisitorContext.js:72 Today's date formatted: 3/13/2025
VisitorContext.js:104 Grouped data: Objectmonthly: {March: 1}today: 0total: 1[[Prototype]]: Object
VisitorContext.js:113 Full year months: Array(12)
VisitorContext.js:121 Today's visitors: Array(0)
VisitorContext.js:142 Data stored in context: Object
Login.js:80 Login result: true
Login.js:83 Login successful, navigating to dashboard
Login.js:76 Attempting login with: Object
VisitorContext.js:52 Fetching data for branch: MAKOLA BRANCH
VisitorContext.js:60 API response for all data: Array(1)
VisitorContext.js:66 Filtered branch data: Array(1)0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)
VisitorContext.js:72 Today's date formatted: 3/13/2025
VisitorContext.js:104 Grouped data: Object
VisitorContext.js:113 Full year months: Array(12)
VisitorContext.js:121 Today's visitors: Array(0)
VisitorContext.js:142 Data stored in context: ObjectallVisitorsData: [{…}]0: {id: 31, date: '2025-03-12T00:00:00.000Z', timein: '12:43:15', timeout: null, department: 'Human Resources', …}length: 1[[Prototype]]: Array(0)analyticsData: (12) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]selectedBranch: "MAKOLA BRANCH"todayVisitorsData: []totalVisitors: 1visitorsToday: 0[[Prototype]]: Object
Login.js:80 Login result: true
Login.js:83 Login successful, navigating to dashboard








import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const BeenHereBefore = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [visitData, setVisitData] = useState({});
  const [visitHistory, setVisitHistory] = useState([]);
  const [error, setError] = useState('');
  const [currentVisitId, setCurrentVisitId] = useState(null);
  const [timeOut, setTimeOut] = useState(''); 


const navigate = useNavigate();
  const handleLogin = async () => {
    if (!phoneNumber.match(/^\d+$/)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/visitors/by-phone?telephone=${phoneNumber}`);
      const data = await response.json();

      if (data.length > 0) {
        const sortedVisits = data.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.timein}`);
          const dateB = new Date(`${b.date} ${b.timein}`);
          return dateB - dateA;
        });

        const userDoc = sortedVisits[0]; 
        
        setUserInfo(userDoc);
        setVisitData({
          telephone: userDoc.telephone || '',
          company: userDoc.company || '',
          department: userDoc.department || '',
          purpose: userDoc.purpose || '',
          reason: userDoc.reason || '',
          name: userDoc.name || '',
          branchName:userDoc.branchname|| '',
          branch:userDoc.branch|| '',
        });
        setVisitHistory(sortedVisits);
      } else {
        setError('No records found for this phone number.');
      }
    } catch (err) {
      console.error('Error fetching user information:', err);
      setError('Error fetching user information. Please try again.');
    }
    setLoading(false);
  };
  const handleCheckIn = async () => {
    setError('');
    setLoading(true);
  
    try {
      const newVisit = {
        name: visitData.name || userInfo.name || '',
        telephone: visitData.telephone || userInfo.telephone || '',
        company: visitData.company || '',
        department: visitData.department || '',
        purpose: visitData.purpose || '',
        reason: visitData.reason || '',
        branchName: visitData.branchName || userInfo.branchName || '',
        branch: visitData.branch || '',
        date: new Date().toISOString().split('T')[0], // Format date as YYYY-MM-DD
        timeIn: new Date().toLocaleTimeString(),
      };
      const response = await fetch('http://localhost:5001/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVisit),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create new visit entry');
      }
  
      const result = await response.json();
  
      setVisitHistory([{ ...newVisit, id: result.id }, ...visitHistory]);
      setCurrentVisitId(result.id);
      setError('Check-in successful!');
    } catch (err) {
      console.error('Error saving the new visit entry:', err);
      setError('Error saving the new visit entry. Please try again.');
    }
    setLoading(false);
  };

  // const handleTimeOut = async () => {
  //   if (!timeOut) {
  //     setError('Please select a time-out.');
  //     return;
  //   }

  //   setError('');
  //   setLoading(true);

  //   try {
  //     // Use your backend API endpoint to update the visitor entry with time out
  //     const response = await fetch(`http://localhost:5001/visitors/${currentVisitId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ timeOut }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update time out');
  //     }

  //     // Update the UI
  //     setVisitHistory((prevHistory) =>
  //       prevHistory.map((visit) =>
  //         visit.id === currentVisitId ? { ...visit, timeOut } : visit
  //       )
  //     );

  //     setError('Time out logged successfully!');
  //     setCurrentVisitId(null);
  //   } catch (err) {
  //     console.error('Error logging time out:', err);
  //     setError('Error logging time out. Please try again.');
  //   }
  //   setLoading(false);
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="been-here-container">
      <div className="logo-container">
        <img src="/fnb back.png" alt="FNB Logo" className="logo" />
        <h2 className="logo-text">FNB (First National Bank)</h2>
      </div>

      <div className="form-container">
        <h1 className="form-title">Returning Visitor</h1>
        <p className="form-description">
          Please enter your phone number to verify your identity.
        </p>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="phone-input"
        />
        {error && <p className="error-message">{error}</p>}
        <button
          onClick={handleLogin}
          className="login-button"
          disabled={loading}
        >
          {loading ? <div className="spinner"></div> : 'Verify'}
        </button>
      </div>

      {userInfo && currentVisitId === null && (
        <div className="card form-card">
          <h2>Welcome back, {userInfo.name}!</h2>
          <div className="form-container">
            {['telephone', 'company', 'department', 'purpose', 'reason','branchName','branch'].map(
              (field) => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    name={field}
                    value={visitData[field] || ''}
                    onChange={handleInputChange}
                    placeholder={`Enter ${field}`}
                    className="form-input"
                  />
                </div>
              )
            )}

            <button
              onClick={handleCheckIn}
              className="checkin-button"
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : 'Check In'}
            </button>
          </div>
        </div>
      )}

     

      {visitHistory.length > 0 && (
        <div className="card history-card">
          <h2>Visit History</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Company</th>
                <th>Department</th>
                <th>Purpose</th>
                <th>Reason</th>
                <th>Branch Name</th>
              </tr>
            </thead>
            <tbody>
              {visitHistory.map((visit, index) => (
                <tr key={index}>
                  <td>{visit.date}</td>
                  <td>{visit.timein || visit.timeIn}</td>
                  <td>{visit.timeout || visit.timeOut || '---'}</td>
                  <td>{visit.company}</td>
                  <td>{visit.department}</td>
                  <td>{visit.purpose}</td>
                  <td>{visit.reason}</td>
                  <td>{visit.branchname}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}






      
      
      import React, { useEffect, useState } from "react";
      import { useParams, useNavigate } from "react-router-dom";
      import { useVisitor } from "../context/VisitorContext";
      import "../detail.css";
      
      const VisitorDetail = () => {
        const { id: visitorName } = useParams();
        const navigate = useNavigate();
        const { branchData, loading: contextLoading, authenticated } = useVisitor();
      
        const [visitorData, setVisitorData] = useState({});
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
      
        // Redirect if not authenticated
        useEffect(() => {
          if (!authenticated && !contextLoading) {
            console.log("User not authenticated, redirecting to login");
            navigate("/login");
          }
        }, [authenticated, contextLoading, navigate]);
      
        useEffect(() => {
          const fetchVisitorDetails = async () => {
            try {
              console.log(`Fetching details for visitor: ${decodeURIComponent(visitorName)}`);
              console.log(`Total visitor records available: ${branchData.allVisitorsData?.length || 0}`);
      
              // Check if we have data in the context
              if (!branchData.allVisitorsData || branchData.allVisitorsData.length === 0) {
                setError("No visitor data available.");
                setLoading(false);
                return;
              }
      
              // Filter records for this specific visitor
              const visitorRecords = branchData.allVisitorsData.filter(
                record => record.name === decodeURIComponent(visitorName)
              );
      
              console.log(`Found ${visitorRecords.length} records for this visitor`);
      
              if (visitorRecords.length === 0) {
                setError("No visitor details found.");
                setLoading(false);
                return;
              }
      
              // Group the records by date
              const groupedData = visitorRecords.reduce((acc, record) => {
                // Format the date for display
                let dateKey;
                
                if (record.date) {
                  try {
                    // Try to parse and format the date
                    if (typeof record.date === 'string') {
                      // Handle different date formats
                      if (record.date.includes('-')) {
                        // YYYY-MM-DD format
                        const [year, month, day] = record.date.split('-');
                        dateKey = `${year}-${month}-${day}`;
                      } else if (record.date.includes('/')) {
                        // MM/DD/YYYY format
                        const [month, day, year] = record.date.split('/');
                        dateKey = `${year}-${month}-${day}`;
                      } else if (record.date.includes('T')) {
                        // ISO format
                        dateKey = new Date(record.date).toISOString().split('T')[0];
                      } else {
                        dateKey = record.date;
                      }
                    } else if (record.date instanceof Date) {
                      dateKey = record.date.toISOString().split('T')[0];
                    } else {
                      dateKey = "Unknown Date";
                    }
                  } catch (error) {
                    console.error("Error parsing date:", error);
                    dateKey = "Unknown Date";
                  }
                } else {
                  dateKey = "Unknown Date";
                }
      
                console.log(`Using date key: ${dateKey} for record:`, record);
                
                // Initialize the array for this date if it doesn't exist
                acc[dateKey] = acc[dateKey] || [];
                
                // Add the record to the appropriate date group
                acc[dateKey].push(record);
                
                return acc;
              }, {});
      
              console.log("Grouped visitor data:", groupedData);
              setVisitorData(groupedData);
              setLoading(false);
            } catch (err) {
              console.error("Error processing visitor details:", err);
              setError("Error processing visitor details. Please try again.");
              setLoading(false);
            }
          };
      
          if (authenticated && branchData) {
            fetchVisitorDetails();
          }
        }, [visitorName, branchData, authenticated]);
      
        // Function to render image from base64 data
        const renderVisitorPicture = (pictureData) => {
          if (!pictureData || pictureData === "[null]" || pictureData === "null" || pictureData === "[null]") {
            console.log("No picture data available");
            return (
              <div className="image-placeholder">No image available</div>
            );
          }
          
          try {
            console.log("Attempting to render picture data");
            
            // Check if the data is a string
            if (typeof pictureData !== 'string') {
              console.log("Picture data is not a string:", typeof pictureData);
              return <div className="image-placeholder">Invalid image data</div>;
            }
            
            // Handle cases where the data is wrapped in [] or {} brackets
            if (pictureData.startsWith('[') && pictureData.endsWith(']')) {
              try {
                const parsed = JSON.parse(pictureData);
                if (parsed === null) {
                  return <div className="image-placeholder">No image data</div>;
                }
                // If successfully parsed as array, use the first element if it's a string
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                  pictureData = parsed[0];
                }
              } catch (e) {
                // Not valid JSON, just remove the brackets
                pictureData = pictureData.substring(1, pictureData.length - 1);
              }
            }
            
            // Check if the data already has the data:image prefix
            if (pictureData.startsWith('data:image')) {
              return (
                <div className="visitor-image-container">
                  <img 
                    src={pictureData} 
                    alt="Visitor" 
                    className="visitor-image" 
                    onError={(e) => {
                      console.error("Error loading image with prefix");
                      e.target.outerHTML = '<div class="image-placeholder">Image failed to load</div>';
                    }}
                  />
                </div>
              );
            }
            
            // If it's just the base64 string without the prefix, add it
            return (
              <div className="visitor-image-container">
                <img 
                  src={`data:image/jpeg;base64,${pictureData}`} 
                  alt="Visitor" 
                  className="visitor-image"
                  onError={(e) => {
                    console.error("Error loading image without prefix");
                    e.target.outerHTML = '<div class="image-placeholder">Image failed to load</div>';
                  }}
                />
              </div>
            );
          } catch (error) {
            console.error("Error rendering visitor picture:", error);
            return (
              <div className="image-placeholder">Error displaying image</div>
            );
          }
        };
      
        if (!authenticated && !contextLoading) {
          return null;
        }
      
        return (
          <div className="visitor-details">
            <h1>Visitor Details for {decodeURIComponent(visitorName)}</h1>
            {loading || contextLoading ? (
              <p>Loading visitor details...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : (
              Object.keys(visitorData).map((date) => (
                <div key={date} className="details-section">
                  <h2>{date}</h2>
                  {visitorData[date].map((entry, index) => {
                    console.log(`Rendering entry ${index} with picture data:`, 
                      typeof entry.picture === 'string' 
                        ? `${entry.picture.substring(0, 30)}... (${entry.picture.length} chars)` 
                        : entry.picture);
                    
                    return (
                      <div key={index} className="entry-container">
                        {renderVisitorPicture(entry.picture)}
                        <table className="details-table">
                          <thead>
                            <tr>
                              <th style={{color:'black'}}>Company</th>
                              <th style={{color:'black'}}>Branch</th>
                              <th style={{color:'black'}}>Telephone</th>
                              <th style={{color:'black'}}>Time In</th>
                              <th style={{color:'black'}}>Time Out</th>
                              <th style={{color:'black'}}>Purpose</th>
                              <th style={{color:'black'}}>Department</th>
                              <th style={{color:'black'}}>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{entry.company || "---"}</td>
                              <td>{entry.branchName || entry.branchname || "---"}</td>
                              <td>{entry.telephone || "---"}</td>
                              <td>{entry.timein || entry.timeIn || "---"}</td>
                              <td>{entry.timeout || entry.timeOut || "---"}</td>
                              <td>{entry.purpose || "---"}</td>
                              <td>{entry.department || "---"}</td>
                              <td>{entry.reason || "---"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <button onClick={() => navigate(-1)} className="back-button">Back</button>
          </div>
        );
      };
      
      export default VisitorDetail;