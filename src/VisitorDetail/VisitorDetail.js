import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "../Firebase/Config";
import "../detail.css";

const VisitorDetail = () => {
  const { id: visitorName } = useParams();
  const navigate = useNavigate();
  const db = getFirestore(app);

  const [visitorData, setVisitorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVisitorDetails = async () => {
      try {
        const q = query(
          collection(db, "VisitorEntries"),
          where("name", "==", decodeURIComponent(visitorName))
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const groupedData = snapshot.docs.reduce((acc, doc) => {
            const data = doc.data();
            const date = data.date || "Unknown Date";
            acc[date] = acc[date] || [];
            acc[date].push(data);
            return acc;
          }, {});

          setVisitorData(groupedData);
        } else {
          setError("No visitor details found.");
        }
      } catch (err) {
        console.error("Error fetching visitor details:", err);
        setError("Error fetching visitor details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorDetails();
  }, [visitorName, db]);

  return (
    <div className="visitor-details">
      <h1>Visitor Details for {visitorName}</h1>
      {loading ? (
        <p>Loading visitor details...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        Object.keys(visitorData).map((date) => (
          <div key={date} className="details-section">
            <h2>{date}</h2>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Purpose</th>
                  <th>Telephone</th>
                  <th>Department</th>
                  <th>Reason</th>
                  <th>ID</th>

                </tr>
              </thead>
              <tbody>
                {visitorData[date].map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.timeIn || "---"}</td>
                    <td>{entry.timeOut || "---"}</td>
                    <td>{entry.purpose || "---"}</td>
                    <td>{entry.telephone || "---"}</td>
                    <td>{entry.department || "---"}</td>
                    <td>{entry.reason || "---"}</td>
                    <td>{entry.id || "---"}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default VisitorDetail;
