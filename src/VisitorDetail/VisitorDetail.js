// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useVisitor } from "../context/VisitorContext";
// import "../detail.css";

// const VisitorDetail = () => {
//   const { id: visitorName } = useParams();
//   const navigate = useNavigate();
//   const { branchData, loading: contextLoading, authenticated } = useVisitor();

//   const [visitorData, setVisitorData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!authenticated && !contextLoading) {
//       console.log("User not authenticated, redirecting to login");
//       navigate("/login");
//     }
//   }, [authenticated, contextLoading, navigate]);

//   useEffect(() => {
//     const fetchVisitorDetails = async () => {
//       try {
//         console.log(`Fetching details for visitor: ${decodeURIComponent(visitorName)}`);
//         console.log(`Total visitor records available: ${branchData.allVisitorsData?.length || 0}`);

//         // Check if we have data in the context
//         if (!branchData.allVisitorsData || branchData.allVisitorsData.length === 0) {
//           setError("No visitor data available.");
//           setLoading(false);
//           return;
//         }

//         // Filter records for this specific visitor
//         const visitorRecords = branchData.allVisitorsData.filter(
//           record => record.name === decodeURIComponent(visitorName)
//         );

//         console.log(`Found ${visitorRecords.length} records for this visitor`);

//         if (visitorRecords.length === 0) {
//           setError("No visitor details found.");
//           setLoading(false);
//           return;
//         }

//         // Group the records by date
//         const groupedData = visitorRecords.reduce((acc, record) => {
//           // Format the date for display
//           let dateKey;
          
//           if (record.date) {
//             try {
//               // Try to parse and format the date
//               if (typeof record.date === 'string') {
//                 // Handle different date formats
//                 if (record.date.includes('-')) {
//                   // YYYY-MM-DD format
//                   const [year, month, day] = record.date.split('-');
//                   dateKey = `${year}-${month}-${day}`;
//                 } else if (record.date.includes('/')) {
//                   // MM/DD/YYYY format
//                   const [month, day, year] = record.date.split('/');
//                   dateKey = `${year}-${month}-${day}`;
//                 } else if (record.date.includes('T')) {
//                   // ISO format
//                   dateKey = new Date(record.date).toISOString().split('T')[0];
//                 } else {
//                   dateKey = record.date;
//                 }
//               } else if (record.date instanceof Date) {
//                 dateKey = record.date.toISOString().split('T')[0];
//               } else {
//                 dateKey = "Unknown Date";
//               }
//             } catch (error) {
//               console.error("Error parsing date:", error);
//               dateKey = "Unknown Date";
//             }
//           } else {
//             dateKey = "Unknown Date";
//           }

//           console.log(`Using date key: ${dateKey} for record:`, record);
          
//           // Initialize the array for this date if it doesn't exist
//           acc[dateKey] = acc[dateKey] || [];
          
//           // Add the record to the appropriate date group
//           acc[dateKey].push(record);
          
//           return acc;
//         }, {});

//         console.log("Grouped visitor data:", groupedData);
//         setVisitorData(groupedData);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error processing visitor details:", err);
//         setError("Error processing visitor details. Please try again.");
//         setLoading(false);
//       }
//     };

//     if (authenticated && branchData) {
//       fetchVisitorDetails();
//     }
//   }, [visitorName, branchData, authenticated]);

//   if (!authenticated && !contextLoading) {
//     return null;
//   }

//   return (
//     <div className="visitor-details">
//       <h1>Visitor Details for {decodeURIComponent(visitorName)}</h1>
//       {loading || contextLoading ? (
//         <p>Loading visitor details...</p>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : (
//         Object.keys(visitorData).map((date) => (
//           <div key={date} className="details-section">
//             <h2>{date}</h2>
//             <table className="details-table">
//               <thead>
//                 <tr>
//                   <th style={{color:'black'}}>Company</th>
//                   <th style={{color:'black'}}>Branch</th>
//                   <th style={{color:'black'}}>Telephone</th>
//                   <th style={{color:'black'}}>Time In</th>
//                   <th style={{color:'black'}}>Time Out</th>
//                   <th style={{color:'black'}}>Purpose</th>
//                   <th style={{color:'black'}}>Department</th>
//                   <th style={{color:'black'}}>Reason</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {visitorData[date].map((entry, index) => (
//                   <tr key={index}>
//                     <td>{entry.company || "---"}</td>
//                     <td>{entry.branch || entry.branchname || "---"}</td>
//                     <td>{entry.telephone || "---"}</td>
//                     <td>{entry.timeIn || "---"}</td>
//                     <td>{entry.timeOut || "---"}</td>
//                     <td>{entry.purpose || "---"}</td>
//                     <td>{entry.department || "---"}</td>
//                     <td>{entry.reason || "---"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))
//       )}
//       <button onClick={() => navigate(-1)} className="back-button">Back</button>
//     </div>
//   );
// };

// export default VisitorDetail;



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