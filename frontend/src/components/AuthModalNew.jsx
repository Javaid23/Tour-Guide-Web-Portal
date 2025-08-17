import { useState, useEffect, useCallback, useMemo } from "react"
import Select from 'react-select';
import { useGoogleLogin } from '@react-oauth/google';
import { allCountries } from 'country-telephone-data';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "193682875788-m6hm75tt692g0t5p16391rkue1l4ekkn.apps.googleusercontent.com";

const AuthModal = ({ isOpen, onClose, initialMode = "signin" }) => {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    mobile: "",
    countryCode: allCountries[0].dialCode
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate();

  // Memoize country options for better performance
  const countryOptions = useMemo(() => 
    allCountries.map((c) => ({
      value: c.dialCode,
      label: `${c.dialCode} ${c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name}`,
      key: c.iso2
    })), []
  );

  if (!isOpen) return null

  // Optimized event handlers with useCallback
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('dialog-overlay')) {
      onClose();
    }
  }, [onClose]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
  const API_BASE = import.meta.env.VITE_API_URL;
      const endpoint = mode === 'signup' ? `${API_BASE}/auth/register` : `${API_BASE}/auth/login`;
      const body = mode === 'signup' ? {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.mobile,
        countryCode: formData.countryCode.startsWith('+') ? formData.countryCode : `+${formData.countryCode}`,
        password: formData.password
      } : {
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // If response is not JSON
        setErrors({ general: 'Unexpected server response.' });
        return;
      }

      if (response.ok && data.success) {
        if (mode === 'signup') {
          // Show success message and switch to signin mode
          setErrors({ 
            general: '', 
            success: 'Sign up successful! Please sign in with your credentials.' 
          });
          setMode('signin');
          // Clear form data except email for convenience
          setFormData(prev => ({
            email: prev.email,
            password: "",
            firstName: "",
            lastName: "",
            mobile: "",
            countryCode: allCountries[0].dialCode
          }));
        } else {
          // Login flow - proceed as before
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));

          onClose();
          const userRole = data.data.user.role;
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'guide') {
            navigate('/guide-dashboard');
          } else {
            window.location.reload();
          }
        }
      } else {
        setErrors({ general: data.message || `${mode === 'signup' ? 'Registration' : 'Login'} failed` });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ general: error?.message || 'Server error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [mode, formData, onClose, navigate]);

  // Optimized Google login handlers
  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    setIsLoading(true);
    try {
  const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode: tokenResponse.code })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        onClose();
        const userRole = data.data.user.role;
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'guide') {
          navigate('/guide-dashboard');
        } else {
          window.location.reload();
        }
      } else {
        setErrors({ general: `Google sign-in failed: ${data.message || 'Unknown error'}` });
      }
    } catch (err) {
      console.error('Google login error:', err);
      setErrors({ general: 'Google sign-in error: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  }, [onClose, navigate]);

  const handleGoogleError = useCallback((error) => {
    console.error('Google sign-in error:', error);
    setIsLoading(false);
    setErrors({ general: `Google sign-in error: ${error?.error || 'Unknown error'}` });
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'auth-code',
  });

  const togglePassword = useCallback(() => setShowPassword(v => !v), []);
  const switchMode = useCallback(() => setMode(m => m === 'signup' ? 'signin' : 'signup'), []);

  // Scroll to top when mode changes
  useEffect(() => {
    const modal = document.querySelector('.dialog-box');
    if (modal) modal.scrollTop = 0;
  }, [mode]);

  return (
    <div
      className="dialog-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 2000, // Ensure modal is above navbar
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={handleBackdropClick}
    >
      <div className="dialog-box" style={dialogStyle} onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} style={closeButtonStyle}>
          &times;
        </button>
        
        <div className="dialog-header" style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, color: '#333', marginBottom: 8 }}>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#666', fontSize: 16 }}>
            {mode === 'signup' ? 'Sign up to get started' : 'Please sign in to your account'}
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          style={googleButtonStyle}
          disabled={isLoading}
          onClick={googleLogin}
        >
          <GoogleIcon />
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
          {isLoading && <span style={{ marginLeft: 10, fontSize: 14 }}>Loading...</span>}
        </button>

        <div style={dividerStyle}>
          <span style={dividerTextStyle}>or</span>
          <div style={dividerLineStyle}></div>
        </div>
        
        {/* Error and Success Display */}
        {errors.general && (
          <div style={errorStyle}>
            {errors.general}
          </div>
        )}
        {errors.success && (
          <div style={successStyle}>
            {errors.success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <InputField
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required
              />
              
              <InputField
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required
              />
              
              <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                <div style={{ flex: '0 0 120px', minWidth: 0 }}>
                  <label style={labelStyle}>Code</label>
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(opt => opt.value === formData.countryCode)}
                    onChange={opt => setFormData(prev => ({ ...prev, countryCode: opt.value }))}
                    placeholder="Search..."
                    isSearchable
                    styles={{
                      container: base => ({ ...base, width: '100%' }),
                      menu: base => ({ ...base, zIndex: 9999 }),
                      control: base => ({
                        ...base,
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e1e5e9',
                        borderRadius: 10,
                        fontSize: 16,
                        background: '#f8f9fa',
                        minHeight: 'unset',
                        height: 'unset',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#e1e5e9'
                        }
                      }),
                      valueContainer: base => ({ 
                        ...base, 
                        padding: 0,
                        margin: 0,
                        minHeight: 'unset'
                      }),
                      input: base => ({ ...base, margin: 0, padding: 0 }),
                      singleValue: base => ({ ...base, color: '#333', margin: 0, lineHeight: '20px' }),
                      indicatorsContainer: base => ({ ...base, padding: 0 }),
                      dropdownIndicator: base => ({ ...base, padding: '0 0 0 8px' }),
                      indicatorSeparator: () => ({ display: 'none' })
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <InputField
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>
              </div>
            </>
          )}
          
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
          
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            showPassword={showPassword}
            togglePassword={togglePassword}
            placeholder="Enter your password"
            required
          />
          
          {mode === 'signin' && (
            <div style={{ textAlign: 'left', marginTop: 8, marginBottom: 20 }}>
              <button
                type="button"
                style={forgotPasswordStyle}
                onClick={() => {
                  onClose();
                  navigate('/forgot-password');
                }}
              >
                Forgot your password?
              </button>
            </div>
          )}
          
          <button type="submit" style={submitButtonStyle} disabled={isLoading}>
            {isLoading ? `${mode === 'signup' ? 'Signing up' : 'Signing in'}...` : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={dividerStyle}>
          <span style={dividerTextStyle}>or</span>
          <div style={dividerLineStyle}></div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p>
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" style={switchModeStyle} onClick={switchMode}>
              {mode === 'signup' ? 'Sign in here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Optimized component styles (moved outside component to prevent re-creation)
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', 
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const dialogStyle = {
  background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 480,
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative',
  margin: '40px 0', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto'
};

const closeButtonStyle = {
  position: 'absolute', top: 15, right: 20, background: 'none', border: 'none',
  fontSize: 24, cursor: 'pointer', color: '#666', transition: 'color 0.2s ease'
};

const googleButtonStyle = {
  width: '100%', padding: 12, background: 'white', color: '#333',
  border: '2px solid #e1e5e9', borderRadius: 10, fontSize: 16, fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: 24,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
};

const dividerStyle = { textAlign: 'center', margin: '25px 0', position: 'relative' };
const dividerTextStyle = { background: 'white', padding: '0 15px', color: '#666', fontSize: 14, position: 'relative', zIndex: 2 };
const dividerLineStyle = { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#e1e5e9', zIndex: 1 };

const errorStyle = {
  background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626',
  padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14
};

const successStyle = {
  background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46',
  padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14
};

const labelStyle = { display: 'block', marginBottom: 8, fontWeight: 500, color: '#333', fontSize: 14 };
const inputStyle = { width: '100%', padding: '12px 16px', border: '2px solid #e1e5e9', borderRadius: 10, fontSize: 16, background: '#f8f9fa' };
const selectStyle = { ...inputStyle, padding: '12px 8px', fontSize: 15 };

const forgotPasswordStyle = {
  color: '#2563eb', background: 'none', border: 'none', fontSize: 14,
  cursor: 'pointer', textDecoration: 'underline', padding: 0
};

const submitButtonStyle = {
  width: '100%', padding: 14, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600,
  cursor: 'pointer', marginTop: 20
};

const switchModeStyle = {
  color: '#667eea', background: 'none', border: 'none', fontWeight: 500,
  cursor: 'pointer', textDecoration: 'none'
};

// Optimized reusable components
const InputField = ({ label, name, type, value, onChange, placeholder, required }) => (
  <div style={{ marginBottom: 20 }}>
    <label htmlFor={name} style={labelStyle}>{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      style={inputStyle}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
    />
  </div>
);

const PasswordField = ({ label, name, value, onChange, showPassword, togglePassword, placeholder, required }) => (
  <div style={{ marginBottom: 20 }}>
    <label htmlFor={name} style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? "text" : "password"}
        id={name}
        name={name}
        style={inputStyle}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14
        }}
        onClick={togglePassword}
      >
        {showPassword ? 'Hide' : 'Show'}
      </button>
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg style={{ width: 20, height: 20, marginRight: 8 }} viewBox="0 0 18 18">
    <g fill="none" fillRule="evenodd">
      <path d="M17.64 9.2045c0-.638-.057-1.252-.164-1.836H9v3.481h4.844c-.209 1.125-.844 2.08-1.797 2.72v2.264h2.908c1.708-1.574 2.685-3.89 2.685-6.629z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.806 5.96-2.188l-2.908-2.264c-.806.54-1.84.86-3.052.86-2.348 0-4.337-1.587-5.048-3.724H.99v2.332C2.47 16.432 5.522 18 9 18z" fill="#34A853"/>
      <path d="M3.952 10.684A5.41 5.41 0 0 1 3.64 9c0-.584.1-1.148.28-1.684V4.984H.99A8.996 8.996 0 0 0 0 9c0 1.418.34 2.76.99 3.984l2.962-2.3z" fill="#FBBC05"/>
      <path d="M9 3.579c1.32 0 2.5.454 3.43 1.346l2.572-2.572C13.47.806 11.43 0 9 0 5.522 0 2.47 1.568.99 4.016l2.962 2.3C4.663 5.166 6.652 3.579 9 3.579z" fill="#EA4335"/>
    </g>
  </svg>
);

export default AuthModal;
