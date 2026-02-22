"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [userType, setUserType] = useState<"user" | "enterprise" | "seller">("user");
  
  // New state for field-specific errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: ""
  });

  // Carousel images
  const carouselImages = [
    { id: 1, url: "/images/mysore-palace.jpeg", title: "Mysore Palace", location: "Mysuru", description: "A testament to royal grandeur" },
    { id: 2, url: "/images/hampi.jpeg", title: "Hampi Ruins", location: "Hampi", description: "Where stones tell ancient stories" },
    { id: 3, url: "/images/coorg.jpeg", title: "Coorg Valley", location: "Madikeri", description: "Scotland of India" },
    { id: 4, url: "/images/gokarna.jpeg", title: "Gokarna Beach", location: "Gokarna", description: "Where serenity meets the sea" },
    { id: 5, url: "/images/kabini.jpeg", title: "Kabini Wildlife", location: "Kabini", description: "Wilderness at its finest" },
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: ""
    };
    let isValid = true;

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!isLogin && !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one letter and one number";
      isValid = false;
    }

    // Sign-up specific validations
    if (!isLogin) {
      if (!name) {
        newErrors.name = "Full name is required";
        isValid = false;
      } else if (name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
        isValid = false;
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }

      if (!agreedToTerms) {
        newErrors.terms = "You must agree to the Terms & Conditions";
        isValid = false;
      }
    }

    setErrors(newErrors);
    
    if (!isValid) {
      const firstError = Object.values(newErrors).find(err => err !== "");
      if (firstError) {
        showToastMessage(firstError, "error");
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const API_URL = 'http://localhost:5000';
      
      if (isLogin) {
        // Login API call
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            rememberMe
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store token
        localStorage.setItem('token', data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        setSuccessMessage(`Welcome back! You've successfully signed in.`);
        showToastMessage("Login successful! Redirecting...", "success");
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Signup API call based on user type
        let profileData: any = {
          email,
          password,
          user_type: userType
        };

        if (userType === 'user') {
          profileData = {
            ...profileData,
            full_name: name
          };
        } else if (userType === 'enterprise') {
          // For enterprise, you might want to add more fields
          profileData = {
            ...profileData,
            company_name: name,
            registration_number: `REG${Date.now()}`, // This should come from form
            // Add other enterprise fields as needed
          };
        } else if (userType === 'seller') {
          // For seller
          profileData = {
            ...profileData,
            shop_name: name,
            owner_name: name,
            phone: '', // Add phone field to form
            shop_address: '', // Add address field to form
            // Add other seller fields as needed
          };
        }

        const response = await fetch(`${API_URL}/api/auth/register/${userType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        setSuccessMessage(`Welcome to Samskruthi Sahaachari, ${name}! Your account has been created.`);
        showToastMessage("Account created successfully!", "success");
        
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreedToTerms(false);
        
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      }
      
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Auth error:', error);
      showToastMessage(error.message || "An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    } overflow-hidden`}>
      
      {/* Toast Notification */}
      <div
        className={`fixed top-24 right-6 z-50 transform transition-all duration-500 ${
          showToast ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
          toastType === "success" 
            ? isDarkMode 
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
            : toastType === "error"
            ? isDarkMode 
              ? "bg-red-500/20 border-red-500/30 text-red-400" 
              : "bg-red-50 border-red-200 text-red-700"
            : isDarkMode 
              ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
              : "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          {toastType === "success" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toastType === "error" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toastType === "info" && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

      {/* Theme Toggle & Home Button */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <Link href="/">
          <button className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10" 
              : "bg-black/5 text-gray-700 hover:bg-black/10 border border-gray-200"
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </Link>
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10" 
              : "bg-black/5 text-gray-700 hover:bg-black/10 border border-gray-200"
          }`}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex h-screen w-full">
        {/* Left Side - Carousel Section (50%) */}
        <div className="relative w-1/2 h-full overflow-hidden">
          {carouselImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              
              {/* Caption */}
              <div className="absolute bottom-16 left-12 z-20 text-white max-w-lg">
                <p className="text-sm tracking-[0.3em] uppercase mb-3 text-emerald-400 animate-slide-up">
                  ✦ DISCOVER KARNATAKA
                </p>
                <h2 className="text-5xl font-light mb-2 animate-slide-up-delay">
                  {image.title}
                </h2>
                <p className="text-white/80 text-lg mb-2 animate-slide-up-delay-2">
                  {image.location}
                </p>
                <p className="text-white/60 text-base max-w-md animate-slide-up-delay-3">
                  {image.description}
                </p>
                
                {/* Progress Indicators */}
                <div className="flex gap-2 mt-8">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        idx === currentSlide 
                          ? "w-12 bg-emerald-400" 
                          : "w-4 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Floating Brand */}
          <Link href="/">
            <div className="absolute top-8 left-8 z-20 cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl rotate-12 group-hover:rotate-45 transition-all duration-500"></div>
                <div>
                  <h3 className="text-white text-xl font-light tracking-wider">Samskruthi</h3>
                  <p className="text-white/40 text-[8px] tracking-[0.3em] uppercase">Sahaachari</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Right Side - Auth Forms (50%) */}
        <div className={`w-1/2 h-full flex items-center justify-center overflow-y-auto ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}>
          <div className="w-full max-w-md py-12 px-8">
            {/* Welcome Text */}
            <div className="mb-8">
              <h2 className={`text-3xl font-light mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                {isLogin ? "Welcome back" : "Begin your journey"}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {isLogin 
                  ? "Sign in to continue exploring Karnataka's wonders" 
                  : "Create an account to start your cultural adventure"}
              </p>
            </div>

            {/* User Type Selection - Only for Sign Up */}
            {!isLogin && (
              <div className="mb-6">
                <label className={`block text-xs mb-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "user", label: "Traveler", icon: "🧳" },
                    { type: "enterprise", label: "Enterprise", icon: "🏢" },
                    { type: "seller", label: "Seller", icon: "🏪" },
                  ].map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setUserType(option.type as any)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 border ${
                        userType === option.type
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : isDarkMode
                            ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="block text-lg mb-1">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className={`mb-6 p-4 rounded-lg border ${
                isDarkMode 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className={`flex p-1 rounded-xl mb-8 ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}>
              <button
                onClick={() => {
                  setIsLogin(true);
                  setShowSuccess(false);
                  setErrors({ name: "", email: "", password: "", confirmPassword: "", terms: "" });
                }}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isLogin
                    ? "bg-emerald-500 text-white shadow-lg"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setShowSuccess(false);
                  setErrors({ name: "", email: "", password: "", confirmPassword: "", terms: "" });
                }}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isLogin
                    ? "bg-emerald-500 text-white shadow-lg"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field - Only for Sign Up */}
              {!isLogin && (
                <div className="group">
                  <label className={`block text-xs mb-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {userType === 'enterprise' ? 'Company Name' : 
                     userType === 'seller' ? 'Shop Name' : 'Full Name'} <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    onBlur={() => {
                      if (!name) {
                        setErrors(prev => ({ ...prev, name: "This field is required" }));
                      }
                    }}
                    placeholder={`Enter your ${userType === 'enterprise' ? 'company name' : 
                      userType === 'seller' ? 'shop name' : 'full name'}`}
                    className={`w-full px-4 py-3 rounded-lg text-sm transition-all duration-300 border ${
                      errors.name
                        ? isDarkMode
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-red-300 bg-red-50"
                        : isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    } outline-none`}
                  />
                  {errors.name && (
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`}>
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="group">
                <label className={`block text-xs mb-1.5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Email Address <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  onBlur={() => {
                    if (!email) {
                      setErrors(prev => ({ ...prev, email: "Email is required" }));
                    } else if (!/\S+@\S+\.\S+/.test(email)) {
                      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
                    }
                  }}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg text-sm transition-all duration-300 border ${
                    errors.email
                      ? isDarkMode
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-red-300 bg-red-50"
                      : isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  } outline-none`}
                />
                {errors.email && (
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label className={`block text-xs mb-1.5 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Password <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                    }}
                    onBlur={() => {
                      if (!password) {
                        setErrors(prev => ({ ...prev, password: "Password is required" }));
                      } else if (password.length < 8) {
                        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 rounded-lg text-sm transition-all duration-300 border ${
                      errors.password
                        ? isDarkMode
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-red-300 bg-red-50"
                        : isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    } outline-none pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDarkMode ? "text-gray-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-500"
                    }`}
                  >
                    {passwordVisible ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}>
                    {errors.password}
                  </p>
                )}
                {!isLogin && !errors.password && (
                  <p className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Minimum 8 characters with at least one letter and number
                  </p>
                )}
              </div>

              {/* Confirm Password - Only for Sign Up */}
              {!isLogin && (
                <div className="group">
                  <label className={`block text-xs mb-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Confirm Password <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError("confirmPassword");
                      }}
                      onBlur={() => {
                        if (!confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }));
                        } else if (password !== confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
                        }
                      }}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-3 rounded-lg text-sm transition-all duration-300 border ${
                        errors.confirmPassword
                          ? isDarkMode
                            ? "border-red-500/50 bg-red-500/5"
                            : "border-red-300 bg-red-50"
                          : isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      } outline-none pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        isDarkMode ? "text-gray-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-500"
                      }`}
                    >
                      {confirmPasswordVisible ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password & Remember Me - Only for Login */}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={`text-xs transition-colors ${
                      isDarkMode ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-700"
                    }`}>
                      Remember me
                    </span>
                  </label>
                  <button className={`text-xs hover:text-emerald-400 transition-colors relative group ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Forgot password?
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </div>
              )}

              {/* Terms & Conditions - Only for Sign Up */}
              {!isLogin && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked) {
                          clearFieldError("terms");
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="terms" className={`text-xs transition-colors ${
                      isDarkMode ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-700"
                    }`}>
                      I agree to the{" "}
                      <button className="text-emerald-400 hover:text-emerald-500 font-medium">
                        Terms & Conditions
                      </button>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className={`text-xs ${
                      isDarkMode ? "text-red-400" : "text-red-500"
                    }`}>
                      {errors.terms}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all duration-300 mt-6 relative overflow-hidden group ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
              >
                <span className={`relative z-10 flex items-center justify-center gap-2 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}>
                  {isLogin ? "Sign In" : `Create ${userType === 'enterprise' ? 'Enterprise' : 
                    userType === 'seller' ? 'Seller' : ''} Account`}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className={`absolute inset-0 flex items-center ${
                  isDarkMode ? "border-gray-800" : "border-gray-200"
                }`}>
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className={`px-4 ${
                    isDarkMode ? "bg-gray-900 text-gray-400" : "bg-white text-gray-500"
                  }`}>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Google", icon: "G", color: "from-red-500 to-pink-500" },
                  { name: "Facebook", icon: "f", color: "from-blue-600 to-blue-700" },
                  { name: "Apple", icon: "🍎", color: "from-gray-700 to-gray-900" },
                ].map((provider) => (
                  <button
                    key={provider.name}
                    type="button"
                    className={`group relative py-3 rounded-lg border overflow-hidden transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`absolute inset-0 bg-gradient-to-r ${provider.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></span>
                    <span className="relative z-10 text-base font-medium">
                      {provider.icon}
                    </span>
                  </button>
                ))}
              </div>
            </form>

            {/* Switch between login/signup */}
            <p className={`text-center text-xs mt-6 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowSuccess(false);
                  setErrors({ name: "", email: "", password: "", confirmPassword: "", terms: "" });
                }}
                className="text-emerald-400 hover:text-emerald-500 font-medium relative group"
              >
                {isLogin ? "Sign up" : "Sign in"}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}