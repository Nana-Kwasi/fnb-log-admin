import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import app from '../Firebase/Config';
import "../Dp.css"

const PPD = () => {
  const navigate = useNavigate();
  const db = getFirestore(app);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Receive Item Form State
  const [receiveForm, setReceiveForm] = useState({
    item: '',
    receiverName: '',
    signature: ''
  });

  // Sending Out Form State
  const [sendingForm, setSendingForm] = useState({
    recorderName: '',
    item: '',
    description: '',
    signature: '',
    dispatchName:''
  });

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
        type: 'receive',
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
        type: 'sending',
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

      <div className="buttons-row">
        <div className="dropdown-container">
          <div
            className="round-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <i className="fas fa-pencil-alt"></i>
            <p>Record</p>
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => setShowReceiveModal(true)}>Receive Item</button>
              <button onClick={() => navigate('/Forms')}>Record Requested Item</button>
              <button onClick={() => setShowSendingModal(true)}> Sending Out Item</button>
            </div>
          )}
        </div>

        <div
          className="round-button"
          onClick={() => navigate('/Dreport')}
        >
          <i className="fas fa-file-alt"></i>
          <p>Report</p>
        </div>

        <div
          className="round-button"
          onClick={() => navigate('/dispatch-history')}
        >
          <i className="fas fa-history"></i>
          <p>Dispatch</p>
        </div>
      </div>

      {/* Receive Item Modal */}
      {showReceiveModal && (
        <div className="modal-overlay">
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
      )}

      {/* Sending Out Item Modal */}
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