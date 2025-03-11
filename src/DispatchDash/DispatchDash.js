import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import app from '../Firebase/Config';
import "../Dp.css"
import Graphs from '../Graphs/Graphs';

const PPD = () => {
  const navigate = useNavigate();
  const db = getFirestore(app);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typeCount, setTypeCount] = useState({});
  const [subjectCount, setSubjectCount] = useState({});

  // Receive Item Form State
  const [receiveForm, setReceiveForm] = useState({
    item: '',
    receiverName: '',
    signature: ''
  });
  // const getProgressColor = (count) => {
  //   if (count < 10) return '#FF4B4B';
  //   if (count < 50) return '#FFB800';
  //   return '#00CC88';
  // };
  // Sending Out Form State
  const [sendingForm, setSendingForm] = useState({
    recorderName: '',
    item: '',
    description: '',
    signature: '',
    dispatchName:''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch type counts
      const itemQuerySnapshot = await getDocs(collection(db, "ItemEntries"));
      const counts = {};
      itemQuerySnapshot.forEach((doc) => {
        const type = doc.data().type;
        counts[type] = (counts[type] || 0) + 1;
      });
      setTypeCount(counts);

      // Fetch IT-LOGS subjects
      const logsQuerySnapshot = await getDocs(collection(db, "IT-LOGS"));
      const subjectCounts = {};
      logsQuerySnapshot.forEach((doc) => {
        const subject = doc.data().subject;
        if (subject) {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
      });
      setSubjectCount(subjectCounts);
    };
    fetchData();
  }, [db]);

  const getProgressColor = (count) => {
    if (count < 10) return '#FF4B4B';
    if (count < 50) return '#FFB800';
    return '#00CC88';
  };

  const handleReceiveChange = (e) => {
    const { id, value } = e.target;
    setReceiveForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSendingChange = (e) => {
    const { id, value } = e.target;
    setSendingForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const entryId = uuidv4();
      const submissionData = {
        ...receiveForm,
        id: entryId,
        type: 'receive item',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };

      await setDoc(doc(db, "ItemEntries", entryId), submissionData);
      alert('Item received successfully!');
      setReceiveForm({ item: '', receiverName: '', signature: '' });
      setShowReceiveModal(false);
    } catch (error) {
      console.error("Error submitting receive data:", error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const entryId = uuidv4();
      const submissionData = {
        ...sendingForm,
        id: entryId,
        type: 'sending out',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };

      await setDoc(doc(db, "ItemEntries", entryId), submissionData);
      alert('Item recorded successfully!');
      setSendingForm({ recorderName: '', item: '', description: '', signature: '' });
      setShowSendingModal(false);
    } catch (error) {
      console.error("Error submitting sending data:", error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Dispatch Dashboard</h1>

      <div className="row">
        <div className="calendar-time">
          <h2 style={{color:'white'}}>Today's Date</h2>
          <p>{new Date().toLocaleDateString()}</p>
          <h2 style={{color:'white'}}>Current Time</h2>
          <p>{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="cards-container">
        {Object.keys(typeCount).map((type) => {
          const progress = Math.min((typeCount[type] / 100) * 100, 100);
          const progressColor = getProgressColor(typeCount[type]);
          
          return (
            <div key={type} className="card">
              <div className="card-header">
              </div>
              <div className="card-body">
                <div className="progress-circle-container">
                  <svg className="progress-circle">
                    <circle
                      className="progress-circle-background"
                      cx="40"
                      cy="40"
                      r="36"
                    />
                    <circle
                      className="progress-circle-value"
                      cx="40"
                      cy="40"
                      r="36"
                      style={{
                        stroke: progressColor,
                        strokeDasharray: `${progress * 2.26} 999`
                      }}
                    />
                  </svg>
                  <div className="card-count">{typeCount[type]}</div>
                </div>
                <div className="card-content">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-value"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor
                      }}
                    />
                  </div>
                  <p className="card-subtext">Total Items</p>
                  <h3 className="count">DISPATCH TYPE: {type.toUpperCase()}</h3>
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(subjectCount).map((subject) => {
          const progress = Math.min((subjectCount[subject] / 100) * 100, 100);
          const progressColor = getProgressColor(subjectCount[subject]);
          
          return (
            <div key={subject} className="card">
              <div className="card-header">
              </div>
              <div className="card-body">
                <div className="progress-circle-container">
                  <svg className="progress-circle">
                    <circle
                      className="progress-circle-background"
                      cx="40"
                      cy="40"
                      r="36"
                    />
                    <circle
                      className="progress-circle-value"
                      cx="40"
                      cy="40"
                      r="36"
                      style={{
                        stroke: progressColor,
                        strokeDasharray: `${progress * 2.26} 999`
                      }}
                    />
                  </svg>
                  <div className="card-count">{subjectCount[subject]}</div>
                </div>
                <div className="card-content">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-value"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor
                      }}
                    />
                  </div>
                  <p className="card-subtext">Total Entries</p>
                  <h3 className="count">IT LOG: {subject}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
<Graphs typeCount={typeCount} subjectCount={subjectCount} />
      <div className="buttons-row">
        <div className="dropdown-container">
          <div
            className="round-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <i className="fas fa-pencil-alt"></i>
            <p>Front-Desk</p>
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => setShowReceiveModal(true)}>Receive Item</button>
              <button onClick={() => setShowSendingModal(true)}>Log sending Out Item</button>
            </div>
          )}
        </div>

        <div
          className="round-button"
          onClick={() => navigate('/Dispatchreport')}
        >
          <i className="fas fa-file-alt"></i>
          <p>Report</p>
        </div>

        <div
          className="round-button"
          onClick={() => navigate('/Dispatch')}
        >
          <i className="fas fa-history"></i>
          <p>IT LOGS</p>
        </div>
        
      </div>
     
      {showReceiveModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowReceiveModal(false)}>×</button>
            <div className="modal-content">
              <h2>Receive Item</h2>
              <form onSubmit={handleReceiveSubmit}>
                <div className="form-group">
                  <label htmlFor="item">Item</label>
                  <input
                    type="text"
                    id="item"
                    value={receiveForm.item}
                    onChange={handleReceiveChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receiverName">Receiver's Name</label>
                  <input
                    type="text"
                    id="receiverName"
                    value={receiveForm.receiverName}
                    onChange={handleReceiveChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="signature">Signature</label>
                  <input
                    type="text"
                    id="signature"
                    value={receiveForm.signature}
                    onChange={handleReceiveChange}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit"}
                  </button>
                  <button type="button" onClick={() => setShowReceiveModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSendingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Record Sending Out Item</h2>
            <form onSubmit={handleSendingSubmit}>
              <div className="form-group">
                <label htmlFor="recorderName">Name of Recorder</label>
                <input
                  type="text"
                  id="recorderName"
                  value={sendingForm.recorderName}
                  onChange={handleSendingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dispatchName">Name of Dispatch</label>
                <input
                  type="text"
                  id="dispatchName"
                  value={sendingForm.dispatchName}
                  onChange={handleSendingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="item">Item</label>
                <input
                  type="text"
                  id="item"
                  value={sendingForm.item}
                  onChange={handleSendingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Item Description</label>
                <textarea
                  id="description"
                  value={sendingForm.description}
                  onChange={handleSendingChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="signature">Signature</label>
                <input
                  type="text"
                  id="signature"
                  value={sendingForm.signature}
                  onChange={handleSendingChange}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
                <button type="button" onClick={() => setShowSendingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPD;