import React, { useState } from 'react';
import { X, Upload, Camera, MapPin, Star, Calendar, User, Mail, Phone, CreditCard, Award, Briefcase } from 'lucide-react';

const TermsAndConditionsModal = ({ open, onClose }) => (
  open ? (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Terms and Conditions for Tour Guide Registration</h2>
        <div className="prose max-w-none text-gray-800 text-base flex-1">
          <h3>1. Eligibility Criteria</h3>
          <ul>
            <li>You must be at least <strong>18 years old</strong>.</li>
            <li>You must possess a <strong>valid government-issued identification</strong> (e.g., CNIC or passport).</li>
            <li>You should have <strong>basic knowledge of tourism and regional history/culture</strong>.</li>
            <li>Prior experience in tour guiding is preferred but not mandatory.</li>
            <li>You must provide <strong>accurate and truthful information</strong> during the application process.</li>
          </ul>
          <h3>2. Application and Approval</h3>
          <ul>
            <li>Tour guide applications will be reviewed by the platform admin team.</li>
            <li>Approval is based on completeness, professionalism, and credibility of your profile.</li>
            <li>The platform reserves the right to <strong>accept, reject, or suspend</strong> any application without prior notice.</li>
          </ul>
          <h3>3. Roles and Responsibilities</h3>
          <ul>
            <li>Provide <strong>accurate, respectful, and engaging tours</strong> to tourists.</li>
            <li>Always maintain <strong>professional behavior</strong>, punctuality, and clear communication.</li>
            <li><strong>Update your availability calendar</strong> regularly.</li>
            <li>Notify the platform or tourists in case of emergencies or unavoidable absences.</li>
            <li>Never share tourist personal data or misuse the platform.</li>
          </ul>
          <h3>4. Account and Data Security</h3>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree not to impersonate another person or create false profiles.</li>
            <li>All personal data will be stored securely and used in compliance with the platform's privacy policy.</li>
          </ul>
          <h3>5. Payments and Fees</h3>
          <ul>
            <li>Payments for completed tours will be processed via <strong>Stripe</strong>.</li>
            <li>You must have a valid bank account or Stripe-compatible method to receive payments.</li>
            <li>The platform may deduct a <strong>service fee or commission</strong> from each booking. The percentage will be communicated during onboarding.</li>
            <li>Cancellations without valid reasons may result in <strong>payment hold or account suspension</strong>.</li>
          </ul>
          <h3>6. Review and Rating System</h3>
          <ul>
            <li>Tourists can submit reviews after completing tours.</li>
            <li>Reviews will be <strong>moderated by admin</strong> before being published.</li>
            <li>You accept that your <strong>rating may affect your visibility</strong> and future bookings on the platform.</li>
          </ul>
          <h3>7. Prohibited Conduct</h3>
          <ul>
            <li>Harassment, discrimination, or abusive behavior towards tourists or staff.</li>
            <li>Soliciting direct bookings outside the platform (platform circumvention).</li>
            <li>Misrepresentation of services or making false claims.</li>
            <li>Use of drugs, alcohol, or illegal substances during tours.</li>
            <li>Repeated complaints or violations may result in permanent <strong>account deactivation</strong>.</li>
          </ul>
          <h3>8. Platform Rights</h3>
          <ul>
            <li>The platform reserves the right to:
              <ul>
                <li>Modify or update these terms at any time.</li>
                <li>Suspend or terminate guide accounts violating policies.</li>
                <li>Monitor communication for quality and safety assurance.</li>
                <li>Remove tours, reviews, or accounts deemed harmful or misleading.</li>
              </ul>
            </li>
          </ul>
          <h3>9. Intellectual Property</h3>
          <ul>
            <li>You may not use the platform’s name, logo, or content for promotional purposes without written permission.</li>
            <li>All uploaded tour-related content (photos, descriptions) may be used by the platform for marketing with credit to you.</li>
          </ul>
          <h3>10. Communication</h3>
          <ul>
            <li>All official communication (bookings, reviews, alerts) will be sent via email or through the dashboard.</li>
            <li>It is your responsibility to check and respond to messages promptly.</li>
          </ul>
          <h3>11. Acceptance</h3>
          <ul>
            <li>By submitting the “Join Us” form, you:
              <ul>
                <li>Confirm that you have read and agree to these Terms and Conditions.</li>
                <li>Acknowledge that violating these terms may result in suspension or removal from the platform.</li>
                <li>Grant Tour Guide Pakistan the right to verify your information and evaluate your performance as a guide.</li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="btn btn-primary w-full max-w-xs text-base"
            style={{ margin: '0 auto' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null
);

const TourGuideRegistrationModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    dateOfBirth: '',
    address: '',
    city: '',
    
    // Professional Information
    experience: '',
    languages: [],
    specializations: [],
    preferredRegions: [],
    tourTypes: [],
    certifications: '',
    previousWork: '',
    
    // Availability & Pricing
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    hourlyRate: '',
    fullDayRate: '',
    multiDayRate: '',
    
    // Documents & Media
    profilePhoto: null,
    cnicPhoto: null,
    certificationDocs: null,
    portfolio: [],
    
    // Social & References
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: ''
    },
    references: [
      { name: '', contact: '', relationship: '' },
      { name: '', contact: '', relationship: '' }
    ],
    
    // Agreement
    termsAccepted: false,
    // dataProcessingConsent: false (removed)
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = ['English', 'Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki', 'Hindko', 'Brahui', 'Shina', 'Balti'];
  const specializations = ['Cultural Tours', 'Adventure Tourism', 'Religious Tours', 'Historical Sites', 'Nature & Wildlife', 'Educational Tours'];
  const regions = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'Islamabad'];
  const tourTypes = ['Walking Tours', 'Vehicle Tours', 'Trekking', 'Mountaineering', 'City Tours', 'Rural Tourism', 'Spiritual Tours', 'Archaeological Tours'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (birthDate > today) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
          } else if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            newErrors.dateOfBirth = 'You must be at least 18 years old to apply as a tour guide';
          }
        }
        break;
      
      case 2: // Experience
        if (formData.languages.length === 0) newErrors.languages = 'Select at least one language';
        if (formData.specializations.length === 0) newErrors.specializations = 'Select at least one specialization';
        if (formData.preferredRegions.length === 0) newErrors.preferredRegions = 'Select at least one region';
        if (!formData.experience.trim()) newErrors.experience = 'Experience details are required';
        break;
      
      case 3: // Availability & Pricing
        if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
        if (!formData.fullDayRate) newErrors.fullDayRate = 'Full day rate is required';
        break;
      
      case 4: // Documents
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        if (!formData.cnicPhoto) newErrors.cnicPhoto = 'CNIC photo is required';
        break;
      
      case 5: // Final Review
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        // if (!formData.dataProcessingConsent) newErrors.dataProcessingConsent = 'Data processing consent is required'; (removed)
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && !Array.isArray(formData[key]) && formData[key] !== null) {
          if (key === 'availability' || key === 'socialMedia') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else if (key === 'references') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          }
        } else if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/guide/register', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Application submitted successfully! You will receive an email confirmation within 3 working days.');
        onClose();
      } else {
        alert('Error submitting application: ' + result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Professional', icon: Briefcase },
    { number: 3, title: 'Availability', icon: Calendar },
    { number: 4, title: 'Documents', icon: Upload },
    { number: 5, title: 'Review', icon: Star }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '20px',
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[95vh] sm:max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 relative flex-shrink-0 z-[120] rounded-2xl">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          {/* Hero Text Section */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>Join Our Tour Guide Network</h2>
            <p className="text-white text-sm sm:text-base font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>Share your passion for Pakistan's beauty with travelers worldwide</p>
          </div>
          
          {/* Progress Steps - Improved design like BookingForm */}
          <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'bg-blue-400 text-blue-100'
                  }`}>
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span className="text-xs mt-1 text-blue-100 hidden sm:block text-center">{step.title}</span>
                  <span className="text-xs mt-1 text-blue-100 sm:hidden text-center">{step.title.split(' ')[0]}</span>
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-white' : 'bg-blue-400'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl">
          {/* Content remains the same but remove the extra div wrapper */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Personal Information
                </h3>
                <p className="text-gray-600">Tell us about yourself to get started</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+92 300 1234567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`form-input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split('T')[0]}
                    />
                    <p className="text-sm text-gray-500 mt-1">You must be at least 18 years old</p>
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">CNIC Number *</label>
                    <input
                      type="text"
                      value={formData.cnic}
                      onChange={(e) => handleInputChange('cnic', e.target.value)}
                      className={`form-input ${errors.cnic ? 'border-red-500' : ''}`}
                      placeholder="42101-1234567-8"
                    />
                    {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="form-label">Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`form-textarea ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Enter your complete address"
                      rows="3"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                  Experience
                </h3>
                <p className="text-gray-600">Share your expertise and specializations</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                <div>
                  <label className="form-label">Languages Spoken *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languages.map(lang => (
                      <label key={lang} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => handleArrayFieldChange('languages', lang)}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">{lang}</span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && <p className="text-red-500 text-sm mt-2">{errors.languages}</p>}
                </div>
                
                <div>
                  <label className="form-label">Tour Specializations *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {specializations.map(spec => (
                      <label key={spec} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => handleArrayFieldChange('specializations', spec)}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">{spec}</span>
                      </label>
                    ))}
                  </div>
                  {errors.specializations && <p className="text-red-500 text-sm mt-2">{errors.specializations}</p>}
                </div>
                
                <div>
                  <label className="form-label">Preferred Regions *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {regions.map(region => (
                      <label key={region} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.preferredRegions.includes(region)}
                          onChange={() => handleArrayFieldChange('preferredRegions', region)}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">{region}</span>
                      </label>
                    ))}
                  </div>
                  {errors.preferredRegions && <p className="text-red-500 text-sm mt-2">{errors.preferredRegions}</p>}
                </div>
                
                <div>
                  <label className="form-label">Experience & Background *</label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className={`form-textarea ${errors.experience ? 'border-red-500' : ''}`}
                    rows="4"
                    placeholder="Describe your experience in tourism, guiding, or related fields. Include any certifications, previous work, or relevant education..."
                  />
                  {errors.experience && <p className="text-red-500 text-sm mt-2">{errors.experience}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Availability & Pricing
                </h3>
                <p className="text-gray-600">Set your schedule and rates</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                <div>
                  <label className="form-label">Weekly Availability *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.keys(formData.availability).map(day => (
                      <label key={day} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.availability[day]}
                          onChange={(e) => handleInputChange('availability', {
                            ...formData.availability,
                            [day]: e.target.checked
                          })}
                          className="mr-3 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Hourly Rate (USD) *</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className={`form-input ${errors.hourlyRate ? 'border-red-500' : ''}`}
                      placeholder="e.g., 1500"
                    />
                    {errors.hourlyRate && <p className="text-red-500 text-sm mt-2">{errors.hourlyRate}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Full Day Rate (USD) *</label>
                    <input
                      type="number"
                      value={formData.fullDayRate}
                      onChange={(e) => handleInputChange('fullDayRate', e.target.value)}
                      className={`form-input ${errors.fullDayRate ? 'border-red-500' : ''}`}
                      placeholder="e.g., 8000"
                    />
                    {errors.fullDayRate && <p className="text-red-500 text-sm mt-2">{errors.fullDayRate}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">Multi-Day Rate (USD/day)</label>
                    <input
                      type="number"
                      value={formData.multiDayRate}
                      onChange={(e) => handleInputChange('multiDayRate', e.target.value)}
                      className="form-input"
                      placeholder="e.g., 7000"
                    />
                  </div>
                </div>
              </div>
              
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <Upload className="w-6 h-6 mr-3 text-blue-600" />
                  Documents & Portfolio
                </h3>
                <p className="text-gray-600">Upload required documents and photos</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Profile Photo *</label>
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                      <Camera className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-sm text-gray-700 mb-2 font-medium">Upload a professional picture</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                        className="text-sm text-blue-600"
                      />
                    </div>
                    {errors.profilePhoto && <p className="text-red-500 text-sm mt-2">{errors.profilePhoto}</p>}
                  </div>
                  
                  <div>
                    <label className="form-label">CNIC Photo *</label>
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
                      <CreditCard className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-sm text-gray-700 mb-2 font-medium">Upload clear CNIC image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('cnicPhoto', e.target.files[0])}
                        className="text-sm text-blue-600"
                      />
                    </div>
                    {errors.cnicPhoto && <p className="text-red-500 text-sm mt-2">{errors.cnicPhoto}</p>}
                  </div>
                </div>
                
              </div>
              
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <Star className="w-6 h-6 mr-3 text-blue-600" />
                  Review & Submit
                </h3>
                <p className="text-gray-600">Review your information before submitting</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="font-bold text-lg mb-4 text-blue-800">Application Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Name:</strong> <span className="text-gray-900">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Email:</strong> <span className="text-gray-900">{formData.email}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Languages:</strong> <span className="text-gray-900">{formData.languages.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Specializations:</strong> <span className="text-gray-900">{formData.specializations.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Regions:</strong> <span className="text-gray-900">{formData.preferredRegions.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <strong className="text-gray-700">Hourly Rate:</strong> <span className="text-blue-600 font-semibold">$ {formData.hourlyRate}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-2 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-sm">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-semibold focus:outline-none"
                      style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                      onClick={() => setShowTermsModal(true)}
                    >
                      Terms and Conditions
                    </button>{' '}
                    and understand that my application will be reviewed by the admin team.
                  </span>
                </label>
                <TermsAndConditionsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
                {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}
                
                {/* Data processing consent checkbox removed as requested */}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h5 className="font-bold text-blue-800 mb-3 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-2">✓</div>
                  What happens next?
                </h5>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                    Your application will be reviewed within 2-3 business days
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                    You'll receive an email confirmation with next steps
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                    Approved guides will receive login credentials and training materials
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                    Start receiving tour bookings after profile activation
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="text-sm text-gray-600">
              Step {currentStep} of 5
            </span>
            
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`btn ${isSubmitting ? 'btn-secondary' : 'btn-primary'}`}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideRegistrationModal;
