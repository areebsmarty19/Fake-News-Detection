import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/auth.css";

// Login component receives the onLogin prop from App.jsx
export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setGeneralError(""); // Clear general error on input change
  };

  const validate = () => {
    let newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Password validation (Simple check to match Flask requirements for testing)
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    if (!validate()) {
      return; 
    }

    setIsLoading(true); 
    setGeneralError(""); 

    try {
        // --- CRITICAL FIX: Changed URL to 127.0.0.1:5000 ---
        const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // CRITICAL FIX: credentials must be a top-level option
            credentials: 'include', 
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS (HTTP 200)
            console.log("Login successful:", data.message);
            
            // 1. Update global state in App.jsx
            if (onLogin) onLogin(); 

            // 2. Navigate to the protected home page
            navigate("/Home");

        } else {
            // FAILURE (HTTP 401 or 400)
            setGeneralError(data.message || 'Login failed due to server error.');
        }

    } catch (error) {
        console.error('Network Error:', error);
        // NOTE: This network error is what you see in the browser if the 404 is bad enough.
        setGeneralError('A network error occurred. Please try again.');

    } finally {
        setIsLoading(false); 
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb--top" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb--bottom" aria-hidden="true" />

      <div className="auth-card auth-card--enter">
        <div className="auth-badge">TruthCheck Access</div>
        <h2>Welcome Back</h2>
        <p>Sign in to continue analyzing news with confidence.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-wrap">
            <label>Email address</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-field-icon" aria-hidden="true">mail</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="auth-field-wrap">
            <label>Password</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-field-icon" aria-hidden="true">lock</span>
              <input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {generalError && <span className="error-text api-error">{generalError}</span>}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? "Logging in..." : "Log In"}
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        </form>

        <p className="footer-text">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

