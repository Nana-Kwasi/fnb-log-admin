import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../welcome.css";

function Welcome() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPhoneNumber, setLogoutPhoneNumber] = useState('');
  const [selectedTimeOut, setSelectedTimeOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingVisits, setPendingVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitsByDate, setVisitsByDate] = useState({});

  useEffect(() => {
    // Check if the user has already agreed to the terms
    const agreementStatus = localStorage.getItem('hasAgreed');
    if (!agreementStatus) {
      setShowPopup(true);
    }
  }, []);

  const handleAgree = () => {
    setIsAgreed(true);
    setShowPopup(false);
    localStorage.setItem('hasAgreed', 'true'); // Store the agreement status in localStorage
  };

  const handleLogoutVerification = async () => {
    if (!logoutPhoneNumber.match(/^\d+$/)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/visitorslog/visitors/by-phone?telephone=${logoutPhoneNumber}`);
      const data = await response.json();

      if (data.length === 0) {
        setError('No visits found for this phone number.');
      } else {
        // Filter visits with no timeout
        const pendingVisits = data.filter(visit => !visit.timeout);
        
        if (pendingVisits.length === 0) {
          setError('No pending visits found for this phone number.');
        } else {
          // Group visits by date
          const groupedVisits = {};
          pendingVisits.forEach(visit => {
            if (!groupedVisits[visit.date]) {
              groupedVisits[visit.date] = [];
            }
            groupedVisits[visit.date].push(visit);
          });
          
          // Sort dates in ascending order
          const sortedDates = Object.keys(groupedVisits).sort((a, b) => {
            return new Date(a) - new Date(b);
          });
          
          // Create a new object with sorted dates
          const sortedGroupedVisits = {};
          sortedDates.forEach(date => {
            sortedGroupedVisits[date] = groupedVisits[date];
          });
          
          setVisitsByDate(sortedGroupedVisits);
          setPendingVisits(pendingVisits);
          setSuccessMessage(`Found ${pendingVisits.length} pending visit(s). Please select a date.`);
        }
      }
    } catch (err) {
      console.error("Error fetching visit information:", err);
      setError('Error fetching visit information. Please try again.');
    }
    setLoading(false);
  };

  const handleDateSelection = (date) => {
    // For dates with multiple visits, select the first one
    const visitsOnDate = visitsByDate[date];
    if (visitsOnDate && visitsOnDate.length > 0) {
      setSelectedVisit(visitsOnDate[0]);
      setSuccessMessage(`Selected visit on ${date}. Please select a time out.`);
    }
  };

  const handleLogoutSubmit = async () => {
    if (!selectedTimeOut || !selectedVisit) {
      setError('Please select a date and time out.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/visitorslog/visitors/${selectedVisit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeOut: selectedTimeOut,
        }),
      });

      if (!response.ok) {
        throw new Error('Error logging time out. Please try again.');
      }

      setSuccessMessage('Time out logged successfully!');
      
      // Remove this visit from the pending visits
      const updatedPendingVisits = pendingVisits.filter(visit => visit.id !== selectedVisit.id);
      setPendingVisits(updatedPendingVisits);
      
      // Update the grouped visits
      const updatedVisitsByDate = {...visitsByDate};
      Object.keys(updatedVisitsByDate).forEach(date => {
        updatedVisitsByDate[date] = updatedVisitsByDate[date].filter(visit => visit.id !== selectedVisit.id);
        if (updatedVisitsByDate[date].length === 0) {
          delete updatedVisitsByDate[date];
        }
      });
      setVisitsByDate(updatedVisitsByDate);
      
      // Reset selection
      setSelectedVisit(null);
      setSelectedTimeOut('');
      
      // If no more pending visits, close the modal
      if (updatedPendingVisits.length === 0) {
        setTimeout(() => {
          setShowLogoutModal(false);
          setLogoutPhoneNumber('');
        }, 2000);
      }
    } catch (err) {
      console.error("Error logging time out:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  const resetLogoutProcess = () => {
    setSelectedVisit(null);
    setSelectedTimeOut('');
    setVisitsByDate({});
    setPendingVisits([]);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="welcome-container">
      {showPopup && (
        <div className="popup-container">
          <div className="popup">
            <h2 className="popup-title">Welcome!</h2>
            <p className="popup-message">
              At First National Bank, your data is being collected solely for the purpose of
              recording and monitoring visitor entries to enhance security and operational efficiency.
              By continuing, you agree to the terms of this data collection.
            </p>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="agree"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <label htmlFor="agree" className="checkbox-label">
                I agree to the data collection policy.
              </label>
            </div>
            <button
              className="popup-button"
              onClick={handleAgree}
              disabled={!isAgreed}
            >
              Proceed
            </button>
          </div>
        </div>
      )}
      {!showPopup && (
        <>
          <div className="logo-container">
            <img src={process.env.PUBLIC_URL + "/fnb back.png"} alt="FNB Logo" className="logo" />
            <h2 className="logo-text">FNB</h2>
            <h2 className="logo-text">(First National Bank)</h2>
          </div>

          <div className="welcome-header">
            <h1 className="welcome-title">Welcome to First National Bank Visitors Log Book</h1>
            <p className="welcome-description">
              Please select one of the options below to proceed:
            </p>
            <div className="button-container">
              <button onClick={() => navigate('/logbook/first-time')} className="button first-time-btn">
                First Time?
              </button>
              <button onClick={() => navigate('/logbook/been-here-before')} className="button been-here-btn">
                Been Here Before?
              </button>
              <button onClick={() => setShowLogoutModal(true)} className="logout-button">
                Log Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="popup-container">
          <div className="popup">
            <h2 className="popup-title">Visitor Logout</h2>
            
            {Object.keys(visitsByDate).length === 0 ? (
              <>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  value={logoutPhoneNumber}
                  onChange={(e) => setLogoutPhoneNumber(e.target.value)}
                  className="modal-input"
                />
                <button
                  onClick={handleLogoutVerification}
                  className="popup-button"
                  disabled={loading}
                >
                  {loading ? <div className="spinner"></div> : 'Verify'}
                </button>
              </>
            ) : (
              <>
                <p className="popup-message">Select a date to log out from:</p>
                <div className="date-selection">
                  {Object.keys(visitsByDate).map(date => (
                    <button
                      key={date}
                      onClick={() => handleDateSelection(date)}
                      className={`date-button ${selectedVisit && selectedVisit.date === date ? 'selected' : ''}`}
                    >
                      {new Date(date).toLocaleDateString()}
                      <span className="visit-count">({visitsByDate[date].length} visit{visitsByDate[date].length > 1 ? 's' : ''})</span>
                    </button>
                  ))}
                </div>
                
                {selectedVisit && (
                  <div className="time-selection">
                    <p className="visit-details">
                      Visit on {new Date(selectedVisit.date).toLocaleDateString()} at {selectedVisit.timein}
                    </p>
                    <input
                      type="time"
                      value={selectedTimeOut}
                      onChange={(e) => setSelectedTimeOut(e.target.value)}
                      className="modal-input"
                      placeholder="Select time out"
                    />
                    <button
                      onClick={handleLogoutSubmit}
                      className="popup-button"
                      disabled={loading || !selectedTimeOut}
                    >
                      {loading ? <div className="spinner"></div> : 'Submit Time Out'}
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetLogoutProcess}
                  className="reset-button"
                >
                  Back to Phone Number
                </button>
              </>
            )}
            
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            
            <button
              onClick={() => {
                setShowLogoutModal(false);
                setError('');
                setSuccessMessage('');
                setSelectedVisit(null);
                setSelectedTimeOut('');
                setLogoutPhoneNumber('');
                setVisitsByDate({});
                setPendingVisits([]);
              }}
              className="modal-close-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Welcome;




// et do a simple react js project visitors log book. the form will take Name, Date, Reason to see, Department, Purpose, Telephone, Number, Company or Location, Time In, Time Out, Signature, Image. so these are the data we will take, in your mind, how best can we take this data and where will we save it and when same visitor comes, we dont need to take all the data again, visitor will just input it telephone to pull up it information then only date, reason to see, department, purpose, time in and time out form will be available for him to input the data again. no wait, the first screen will be home page where two nice designed button will be display, First time and Being here before? then when he click the First time then all forms will be display but when he click on the being here before then telephone form will be display to pull up the only date, reason to see, department, image, purpose, time in and time out form to display. make sure the first time forms will ask for permission to open camera to take picture to upload. do you understand?

