import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FirstTime() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    reason: '',
    department: '',
    branch: '',
    purpose: '',
    telephone: '',
    company: '',
    picture: null,
  });

  // Load departments from localStorage or use default list
  const [departments, setDepartments] = useState(() => {
    const savedDepartments = localStorage.getItem('departments');
    return savedDepartments ? JSON.parse(savedDepartments) : [
      'Select Department',
      'Human Resources',
      'Finance',
      'Information Technology',
      'Operations',
      'Marketing',
      'Legal',
      'Customer Service',
      'Risk Management',
      'Compliance',
      'Treasury'
    ];
  });

  // Optimized branches state
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState('');

  // New state for adding new department
  const [newDepartment, setNewDepartment] = useState('');
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Optimized useEffect for fetching branches
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      setBranchError('');
      
      try {
        const response = await fetch('http://localhost:5001/visitorslog/fnb_branches');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Assuming your API returns an array of objects with branch_name and branch_code
        const formattedBranches = [
          { branch_name: 'Select Branch', branch_code: '' }, // Default option
          ...data
        ];
        
        setBranches(formattedBranches);
        
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranchError('Failed to load branches. Please try again.');
        
        // Fallback to default branches if API fails
        setBranches([
          { branch_name: 'Select Branch', branch_code: '' },
          { branch_name: 'Main Branch', branch_code: 'MB001' },
          { branch_name: 'Downtown Branch', branch_code: 'DB002' }
        ]);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Save to localStorage when departments change
  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding new department
  const handleAddDepartment = () => {
    if (!newDepartment.trim()) {
      setError('Department name cannot be empty');
      return;
    }
    
    if (departments.includes(newDepartment)) {
      setError('Department already exists');
      return;
    }
    
    setDepartments([...departments, newDepartment]);
    setNewDepartment('');
    setShowAddDepartment(false);
    setError('');
  };

  const handlePictureCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      video.srcObject = stream;
      
      await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));
      video.play();
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      const picture = canvas.toDataURL('image/jpeg');
      
      const base64Size = picture.length * (3/4);
      if (base64Size > 5 * 1024 * 1024) {
        setError('Captured image is too large. Please try again.');
        return;
      }
      
      setFormData({ ...formData, picture });
      
      stream.getTracks().forEach(track => track.stop());
      
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access to capture photos.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
      console.error('Camera error:', err);
    }
  };

  const validateTelephone = async () => {
    if (!formData.telephone || formData.telephone.trim() === '') {
      setError('Please enter a telephone number.');
      return false;
    }
  
    try {
      // Log the request URL for debugging
      const url = `http://localhost:5001/visitorslog/visitors/check-telephone/${encodeURIComponent(formData.telephone)}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      // Log the response status
      console.log(`Response status: ${response.status}`);
  
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Endpoint not found (404). Please check server routes.`);
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      }
  
      const data = await response.json();
      console.log('Telephone check response:', data);
      
      if (data.exists) {
        setError('Telephone number already registered.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating telephone:', error);
      setError(`Failed to validate telephone number: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields first
    if (!formData.name || !formData.telephone || !formData.department || !formData.branch) {
      setError('Please fill in all required fields.');
      return;
    }

    const isValid = await validateTelephone();
    if (!isValid) return;

    if (!formData.picture) {
      setError('Please take a picture before submitting.');
      return;
    }

    // Find the selected branch object to get both code and name
    const selectedBranch = branches.find(branch => branch.branch_code === formData.branch);
    
    if (!selectedBranch) {
      setError('Please select a valid branch.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/visitorslog/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          reason: formData.reason,
          department: formData.department,
          branch: formData.branch, // This will be the branch_code
          branchName: selectedBranch.branch_name, // This will be the branch_name
          purpose: formData.purpose,
          telephone: formData.telephone,
          company: formData.company,
          picture: formData.picture,
          date: new Date().toISOString().split('T')[0],
          timeIn: new Date().toTimeString().split(' ')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form. Please try again later.');
      }

      alert('Thank you for Visiting First National Bank!');
      navigate('/logbook');
    } catch (error) {
      console.error("Error submitting data to the server:", error);
      setError(error.message);
    }

    setIsLoading(false);
  };

  // Retry function for branch loading
  const retryBranchLoading = async () => {
    setLoadingBranches(true);
    setBranchError('');
    
    try {
      const response = await fetch('http://localhost:5001/visitorslog/fnb_branches');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBranches([{ branch_name: 'Select Branch', branch_code: '' }, ...data]);
    } catch (error) {
      setBranchError('Failed to load branches. Please try again.');
    } finally {
      setLoadingBranches(false);
    }
  };

  // Render optimized branch field
  const renderBranchField = () => (
    <div style={styles.formGroup}>
      <label style={styles.label}>Branch: *</label>
      
      {loadingBranches ? (
        <div style={styles.loadingContainer}>
          <span>Loading branches...</span>
        </div>
      ) : (
        <>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            style={{
              ...styles.input,
              backgroundColor: branchError ? '#ffebee' : styles.input.backgroundColor
            }}
            required
          >
            {branches.map((branch, index) => (
              <option key={index} value={branch.branch_code}>
                {branch.branch_code ? 
                  `${branch.branch_name} (${branch.branch_code})` : 
                  branch.branch_name
                }
              </option>
            ))}
          </select>
          
          {branchError && (
            <div style={styles.fieldError}>
              {branchError}
              <button 
                type="button" 
                onClick={retryBranchLoading}
                style={styles.retryButton}
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#0F384A' }}>
      <div style={styles.formContainer}>
        <div style={styles.logoContainer}>
          <img src={process.env.PUBLIC_URL + "/fnb back.png"} alt="FNB Logo" style={styles.logo} />
          <h2 style={styles.logoText}>First National Bank</h2>
        </div>
        <header style={styles.formHeader}>
          <h1>Welcome Visitor</h1>
          <p>Please fill in the form below for your visit:</p>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          {renderInput('Name', 'name', 'text', formData, handleChange)}
          {renderInput('Reason to See', 'reason', 'text', formData, handleChange, false)}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Department:</label>
            <div style={styles.departmentContainer}>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={{...styles.input, width: '95%'}}
                required
              >
                {departments.map((dept, index) => (
                  <option key={index} value={index === 0 ? '' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {renderBranchField()}
          
          {renderInput('Purpose', 'purpose', 'text', formData, handleChange, false)}
          {renderInput('Telephone', 'telephone', 'tel', formData, handleChange)}
          {renderInput('Company', 'company', 'text', formData, handleChange)}

          <div style={styles.formGroup}>
            <label style={styles.label}>Take a Picture:</label>
            <button 
              type="button"
              onClick={handlePictureCapture}
              style={{
                ...styles.button,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#4CAF50'
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Open Camera
            </button>
            {formData.picture && (
              <div style={styles.previewContainer}>
                <img 
                  src={formData.picture} 
                  alt="Captured" 
                  style={styles.preview}
                />
              </div>
            )}
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" style={styles.submitButton} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

const renderInput = (label, name, type, formData, handleChange, required = true) => (
  <div style={styles.formGroup} key={name}>
    <label style={styles.label}>{label}:</label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      required={required}
      style={styles.input}
    />
  </div>
);

const styles = {
  formContainer: {
    maxWidth: '100%',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#f0f4ff',
    borderRadius: '15px',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
    width: '90%',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
  },
  codeContainer: {
    textAlign: 'center',
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '20px',
  },
  verificationCode: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#007bff',
    letterSpacing: '10px',
  },
  codeInputContainer: {
    textAlign: 'center',
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '20px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#003366',
    marginTop: '10px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#003366',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#046063',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #d3d3d3',
    fontSize: '16px',
    outline: 'none',
  },
  inputFile: {
    marginTop: '10px',
    fontSize: '16px',
    border: 'none',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '18px',
    outline: 'none',
    transition: 'background-color 0.3s ease',
  },
  submitButtonDisabled: {
    backgroundColor: '#d6d6d6',
    color: '#fff',
    pointerEvents: 'none',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    fontSize: '14px',
  },
  timeoutForm: {
    textAlign: 'center',
  },
  codeContainer: {
    textAlign: 'center',
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '20px',
  },
  verificationCode: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#007bff',
    letterSpacing: '10px',
  },
  codeInputContainer: {
    textAlign: 'center',
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    transition: 'all 0.3s ease',
  },
  previewContainer: {
    marginTop: '15px',
    textAlign: 'center',
  },
  preview: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '2px solid #ddd',
  },
  departmentContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  addButton: {
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  addNewContainer: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loadingContainer: {
    padding: '10px',
    textAlign: 'center',
    color: '#666',
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  retryButton: {
    padding: '4px 8px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default FirstTime;
