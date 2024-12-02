import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // Firestore imports
import app from "../Firebase/Config"; // Firebase configuration
import "../login.css";

// Use the relative URL to access the image from the public folder
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const db = getFirestore(app); // Firestore instance

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email.length > 25) {
      setError("F number is incorrect");
      return;
    }

    setLoading(true); // Show spinner

    try {
      // Get current date and time
      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTime = now.toLocaleTimeString();

      // Add login details to Firestore
      await addDoc(collection(db, "UserLogs"), {
        email,
        date: formattedDate,
        time: formattedTime,
      });

      setLoading(false); // Hide spinner after Firestore write
      onLogin(email); // Pass email to the onLogin handler
      navigate("/"); // Navigate to Dashboard
    } catch (err) {
      console.error("Error logging login details:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/FNB logo.png" alt="FNB Logo" className="login-logo" />
        <h2>Welcome to FNB Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={25} // Limit input length
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
