import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/auth.css";

export default function SignUp() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(""); // State for general API errors
  const [isLoading, setIsLoading] = useState(false); // State for loading visual
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setGeneralError(""); // Clear general error on input change
  };

  const validate = () => {
    let newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => { // Make handleSubmit asynchronous
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true); // Start loading
    setGeneralError(""); // Clear previous errors

    try {
        // --- CRITICAL FIX: Changed URL to 127.0.0.1:5000 ---
        const response = await fetch('http://127.0.0.1:5000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // CRITICAL FIX: credentials must be a top-level option
            credentials: 'include',
            // Flask only needs email and password for the User model
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS (HTTP 201 Created)
            alert("Registration successful! You can now log in."); // Simple success message
            navigate("/login");

        } else {
            // FAILURE (HTTP 409 Conflict - User exists, or 400)
            setGeneralError(data.message || 'Registration failed. Please check your details.');
        }

    } catch (error) {
        console.error('Network Error:', error);
        setGeneralError('A network error occurred. Please try again.');

    } finally {
        setIsLoading(false); // Stop loading regardless of result
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb--top" aria-hidden="true" />
      <div className="auth-bg-orb auth-bg-orb--bottom" aria-hidden="true" />

      <div className="auth-card auth-card--enter auth-card--wide">
        <div className="auth-badge">Join TruthCheck</div>
        <h2>Create Account</h2>
        <p>Start verifying information in real-time with your personal dashboard.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-wrap">
            <label>Username</label>
            <div className="auth-input-wrap">
              <span className="material-symbols-outlined auth-field-icon" aria-hidden="true">person</span>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "input-error" : ""}
              />
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

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
            {isLoading ? "Signing Up..." : "Sign Up"}
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
