import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'female'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Generate avatar based on gender for signup only
  const generateAvatar = (name, gender) => {
    const seed = encodeURIComponent(name);
    
    // Try Dicebear first, with fallback to UI Avatars
    try {
      if (gender === 'female') {
        // Female avatars with longer hair and feminine features
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&hair=longHairStraight&hairColor=brown&accessories=round&clothingColor=blue01&skinColor=light`;
      } else {
        // Male avatars with shorter hair and masculine features  
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&hair=shortHairShortFlat&hairColor=black&accessories=wayfarers&clothingColor=gray01&skinColor=light`;
      }
    } catch (error) {
      // Fallback to UI Avatars with gender-specific colors
      const bgColor = gender === 'female' ? 'ff69b4' : '4169e1';
      return `https://ui-avatars.com/api/?name=${seed}&background=${bgColor}&color=fff&size=200&rounded=true`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('quizPortalUsers') || '{}');
      let userData;

      if (isSignUp) {
        // For signup, create new user
        userData = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          avatar: generateAvatar(formData.name, formData.gender),
          joinDate: new Date().toISOString(),
          level: 'Beginner'
        };
        
        // Store user data for future logins
        existingUsers[formData.email] = userData;
        localStorage.setItem('quizPortalUsers', JSON.stringify(existingUsers));
      } else {
        // For login, check if user exists
        if (existingUsers[formData.email]) {
          userData = existingUsers[formData.email];
        } else {
          // Create user if doesn't exist (fallback)
          userData = {
            id: Date.now(),
            name: formData.email.split('@')[0],
            email: formData.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.email.split('@')[0])}&background=7c3aed&color=fff`,
            joinDate: new Date().toISOString(),
            level: 'Beginner'
          };
          
          // Store for future reference
          existingUsers[formData.email] = userData;
          localStorage.setItem('quizPortalUsers', JSON.stringify(existingUsers));
        }
      }

      login(userData);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <LogIn size={32} />
              </div>
              <h1 className="login-title">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="login-subtitle">
                {isSignUp 
                  ? 'Join thousands of students improving their knowledge'
                  : 'Sign in to continue your learning journey'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {isSignUp && (
                <>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      <User size={18} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      👤 Gender
                    </label>
                    <div className="gender-selection">
                      <label className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleInputChange}
                        />
                        <div className="gender-content">
                          <span className="gender-emoji">👩</span>
                          <span className="gender-label">Female</span>
                        </div>
                      </label>
                      <label className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleInputChange}
                        />
                        <div className="gender-content">
                          <span className="gender-emoji">👨</span>
                          <span className="gender-label">Male</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <Lock size={18} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              )}

              {errors.submit && (
                <div className="error-message submit-error">{errors.submit}</div>
              )}

              <button
                type="submit"
                className={`btn btn-primary btn-large login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrors({});
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      gender: 'female'
                    });
                  }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
              
              <div className="guest-access">
                <p>Or continue as guest</p>
                <Link to="/" className="btn btn-outline">
                  Browse Quizzes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
