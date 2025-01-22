import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from '../Firebase/Config';
import { v4 as uuidv4 } from 'uuid';
import "../dispatch.css"

const Forms = () => {
  const db = getFirestore(app);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // dispatchBy: '',
    // dispatchMode: '',
    // dispatchRemarks: '',
    dispatchDate: '',
    registryNumber: '',
    toWhomSent: '',
    letterDate: '',
    locationOfLetter: '',
    subject: '',
    remarks: ''
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      dispatchDate: today,
      letterDate: today
    }));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const dispatchId = uuidv4();
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        id: dispatchId,
        timestamp: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, "DispatchEntries", dispatchId), submissionData);
      
      alert('Dispatch details submitted successfully!');
      
      // Reset form after successful submission
      setFormData({
        // dispatchBy: '',
        // dispatchMode: '',
        // dispatchRemarks: '',
        dispatchDate: formData.dispatchDate, // Keep the current date
        registryNumber: '',
        toWhomSent: '',
        letterDate: formData.letterDate, // Keep the current date
        locationOfLetter: '',
        subject: '',
        remarks: ''
      });
    } catch (error) {
      console.error("Error submitting dispatch data:", error);
      setError('Failed to submit the form. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Dispatch Activity Form</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="dispatch-form">
        {/* <section className="form-section">
          <h2>Dispatch Information</h2>
          <div className="form-group">
            <label htmlFor="dispatchBy">Dispatch By</label>
            <input 
              type="text" 
              id="dispatchBy"
              value={formData.dispatchBy}
              onChange={handleChange}
              placeholder="Enter name of dispatcher" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="dispatchMode">Mode of Dispatch</label>
            <select 
              id="dispatchMode"
              value={formData.dispatchMode}
              onChange={handleChange}
              required
            >
              <option value="">Select Mode</option>
              <option value="Courier">Courier</option>
              <option value="Email">Email</option>
              <option value="Hand Delivery">Hand Delivery</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dispatchRemarks">Dispatch Remarks</label>
            <textarea 
              id="dispatchRemarks"
              value={formData.dispatchRemarks}
              onChange={handleChange}
              placeholder="Enter remarks (optional)"
            ></textarea>
          </div>
        </section> */}

        <section className="form-section">
          <h2>Record Information</h2>
          <div className="form-group">
            <label htmlFor="dispatchDate">Date of Dispatch</label>
            <input 
              type="date" 
              id="dispatchDate"
              value={formData.dispatchDate}
              readOnly 
            />
          </div>
          <div className="form-group">
            <label htmlFor="registryNumber">Registry Number</label>
            <input 
              type="text" 
              id="registryNumber"
              value={formData.registryNumber}
              onChange={handleChange}
              placeholder="Enter registry number" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="toWhomSent">To Whom Sent</label>
            <input 
              type="text" 
              id="toWhomSent"
              value={formData.toWhomSent}
              onChange={handleChange}
              placeholder="Enter recipient's name" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="letterDate">Date of Letter</label>
            <input 
              type="date" 
              id="letterDate"
              value={formData.letterDate}
              readOnly 
            />
          </div>
          <div className="form-group">
            <label htmlFor="locationOfLetter">Location of Letter</label>
            <input 
              type="text" 
              id="locationOfLetter"
              value={formData.locationOfLetter}
              onChange={handleChange}
              placeholder="Enter letter location" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input 
              type="text" 
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter letter subject" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea 
              id="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter additional remarks (optional)"
            ></textarea>
          </div>
        </section>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Forms;