import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Import the CSS file for styling
import userIcon from "../assets/icons/user.png";
import hideIcon from "../assets/icons/hide.png";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSkip = () => {
    navigate('/home', { state: { fromSkip: true } });
  };

  return (
    <div className="login-container">
      <div className="skip-button">
        <button onClick={handleSkip}>Skip</button>
      </div>
      
      <div className="login-box">
        <div className="login-header">
          <img 
            src={require("../assets/logo.png")} 
            alt="Nepal Police Logo" 
            className="logo"
          />
          <div className="header-text">
            <h1><span>Welcome to</span><br/>Nepal Police App</h1>
            <p>You can start by creating an account or by logging in our app.</p>
          </div>
        </div>

        <div className="signin-section">
          <h2>Sign In</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="email"
                placeholder="Email/Username"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <img src={userIcon} alt="User" className="input-icon" />
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <img 
                src={hideIcon} 
                alt="Toggle password" 
                className="input-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>

        <a href="/signup" className="signup-link">
          Don't have an account yet? <span>Sign Up</span>
        </a>
      </div>
    </div>
  );
};

export default Login;
