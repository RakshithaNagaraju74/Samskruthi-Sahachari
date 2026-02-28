"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // Registration step for enterprise/seller
  const [regStep, setRegStep] = useState(1);
  
  // Enterprise specific fields
  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyState, setCompanyState] = useState("");
  const [companyPincode, setCompanyPincode] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  
  // Document upload states (enterprise)
  const [registrationCert, setRegistrationCert] = useState<File | null>(null);
  const [gstCert, setGstCert] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  
  // Seller specific fields
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shopType, setShopType] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerAlternatePhone, setSellerAlternatePhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [sellerCity, setSellerCity] = useState("");
  const [sellerState, setSellerState] = useState("");
  const [sellerPincode, setSellerPincode] = useState("");
  const [sellerEstablishedYear, setSellerEstablishedYear] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [sellerGstNumber, setSellerGstNumber] = useState("");
  const [sellerPanNumber, setSellerPanNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  
  // Seller document upload states
  const [sellerGstCert, setSellerGstCert] = useState<File | null>(null);
  const [sellerPanCard, setSellerPanCard] = useState<File | null>(null);
  const [sellerBankProof, setSellerBankProof] = useState<File | null>(null);
  
  // User specific fields
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  // Error states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
    registrationNumber: "",
    contactPerson: "",
    contactPhone: "",
    phone: "",
    shopAddress: "",
    panNumber: "",
    gstNumber: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    sellerPhone: "",
    ownerName: "",
    shopName: ""
  });

  // Carousel images
  const carouselImages = [
    { id: 1, url: "/images/mysore-palace.jpeg", title: "Mysore Palace", location: "Mysuru", description: "A testament to royal grandeur", gradient: "from-amber-500/20 to-orange-600/20" },
    { id: 2, url: "/images/hampi.jpeg", title: "Hampi Ruins", location: "Hampi", description: "Where stones tell ancient stories", gradient: "from-stone-500/20 to-amber-600/20" },
    { id: 3, url: "/images/coorg.jpeg", title: "Coorg Valley", location: "Madikeri", description: "Scotland of India", gradient: "from-emerald-500/20 to-teal-600/20" },
    { id: 4, url: "/images/gokarna.jpeg", title: "Gokarna Beach", location: "Gokarna", description: "Where serenity meets the sea", gradient: "from-blue-500/20 to-cyan-600/20" },
    { id: 5, url: "/images/kabini.jpeg", title: "Kabini Wildlife", location: "Kabini", description: "Wilderness at its finest", gradient: "from-green-500/20 to-emerald-600/20" },
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

  // Validate only the current step (for navigation)
  const validateStep = (step: number): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    if (userType === 'seller') {
      if (step === 1) {
        if (!shopName) {
          newErrors.shopName = "Shop name is required";
          isValid = false;
        }
        if (!ownerName) {
          newErrors.ownerName = "Owner name is required";
          isValid = false;
        }
      } else if (step === 2) {
        if (!sellerPhone) {
          newErrors.sellerPhone = "Phone number is required";
          isValid = false;
        }
        if (!shopAddress) {
          newErrors.shopAddress = "Shop address is required";
          isValid = false;
        }
        if (!email) {
          newErrors.email = "Email is required";
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = "Invalid email format";
          isValid = false;
        }
        if (!password) {
          newErrors.password = "Password is required";
          isValid = false;
        } else if (password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
          isValid = false;
        }
      } else if (step === 3) {
        if (!bankAccountNumber) {
          newErrors.bankAccountNumber = "Bank account number is required";
          isValid = false;
        }
        if (!bankIfscCode) {
          newErrors.bankIfscCode = "IFSC code is required";
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    if (!isValid) {
      const firstError = Object.values(newErrors).find(err => err !== "");
      if (firstError) showToastMessage(firstError, "error");
    }
    return isValid;
  };

  // Full form validation for final submit
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
      registrationNumber: "",
      contactPerson: "",
      contactPhone: "",
      phone: "",
      shopAddress: "",
      panNumber: "",
      gstNumber: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      sellerPhone: "",
      ownerName: "",
      shopName: ""
    };
    let isValid = true;

    // Email validation (always required)
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation - only for login or user registration
    if (isLogin || userType === 'user') {
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
    }

    // Sign-up specific validations
    if (!isLogin) {
      if (userType === 'user') {
        if (!name) {
          newErrors.name = "Full name is required";
          isValid = false;
        }
        if (!confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
          isValid = false;
        } else if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
          isValid = false;
        }
      } else if (userType === 'enterprise') {
        if (!companyName) {
          newErrors.name = "Company name is required";
          isValid = false;
        }
        if (!registrationNumber) {
          newErrors.registrationNumber = "Registration number is required";
          isValid = false;
        }
        if (!panNumber) {
          newErrors.panNumber = "PAN number is required";
          isValid = false;
        }
        if (!contactPerson) {
          newErrors.contactPerson = "Contact person is required";
          isValid = false;
        }
        if (!contactPhone) {
          newErrors.contactPhone = "Contact phone is required";
          isValid = false;
        }
      } else if (userType === 'seller') {
        if (!shopName) {
          newErrors.shopName = "Shop name is required";
          isValid = false;
        }
        if (!ownerName) {
          newErrors.ownerName = "Owner name is required";
          isValid = false;
        }
        if (!sellerPhone) {
          newErrors.sellerPhone = "Phone number is required";
          isValid = false;
        }
        if (!shopAddress) {
          newErrors.shopAddress = "Shop address is required";
          isValid = false;
        }
        if (!bankAccountNumber) {
          newErrors.bankAccountNumber = "Bank account number is required";
          isValid = false;
        }
        if (!bankIfscCode) {
          newErrors.bankIfscCode = "IFSC code is required";
          isValid = false;
        }
      }

      // Terms agreement for all signups
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      if (isLogin) {
        // Login
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        if (data.success && data.data?.token) {
          localStorage.clear();
          localStorage.setItem('token', data.data.token);
          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }

          showToastMessage("Login successful! Redirecting...", "success");

          let redirectPath = '/dashboard';
          if (data.data.user) {
            const role = data.data.user.role;
            if (role === 'influencer') {
              redirectPath = '/dashboard/influencer';
            } else if (role === 'enterprise') {
              redirectPath = '/dashboard/enterprise';
            } else if (role === 'seller') {
              redirectPath = '/dashboard/seller';
            } else if (role === 'admin') {
              redirectPath = '/admin';
            }
          }

          if (data.data.redirectTo && data.data.redirectTo !== '/dashboard') {
            redirectPath = data.data.redirectTo;
          }

          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000);
        }
      } else {
        // Signup with multi-step data
        const formData = new FormData();
        
        // Common fields
        formData.append('email', email);
        formData.append('password', password);
        formData.append('userType', userType);
        
        if (userType === 'user') {
          formData.append('name', name);
          formData.append('phone', phone);
          formData.append('dateOfBirth', dateOfBirth);
          formData.append('gender', gender);
          formData.append('city', city);
          formData.append('state', state);
        } else if (userType === 'enterprise') {
          formData.append('companyName', companyName);
          formData.append('registrationNumber', registrationNumber);
          formData.append('gstNumber', gstNumber);
          formData.append('panNumber', panNumber);
          formData.append('businessType', businessType);
          formData.append('companyDescription', companyDescription);
          formData.append('establishedYear', establishedYear);
          formData.append('employeeCount', employeeCount);
          formData.append('contactPerson', contactPerson);
          formData.append('contactPhone', contactPhone);
          formData.append('companyAddress', companyAddress);
          formData.append('companyCity', companyCity);
          formData.append('companyState', companyState);
          formData.append('companyPincode', companyPincode);
          formData.append('companyWebsite', companyWebsite);
          
          // Documents
          if (registrationCert) formData.append('registrationCert', registrationCert);
          if (gstCert) formData.append('gstCert', gstCert);
          if (panCard) formData.append('panCard', panCard);
          if (addressProof) formData.append('addressProof', addressProof);
          if (bankStatement) formData.append('bankStatement', bankStatement);
        } else if (userType === 'seller') {
          formData.append('shopName', shopName);
          formData.append('ownerName', ownerName);
          formData.append('shopType', shopType);
          formData.append('sellerPhone', sellerPhone);
          formData.append('sellerAlternatePhone', sellerAlternatePhone);
          formData.append('shopAddress', shopAddress);
          formData.append('sellerCity', sellerCity);
          formData.append('sellerState', sellerState);
          formData.append('sellerPincode', sellerPincode);
          formData.append('establishedYear', sellerEstablishedYear);
          formData.append('businessDescription', businessDescription);
          formData.append('productCategories', JSON.stringify(productCategories));
          formData.append('gstNumber', sellerGstNumber);
          formData.append('panNumber', sellerPanNumber);
          
          // ✅ FIX: Combine bank fields into a single JSON object `bank_details`
          const bankDetails = {
            accountNumber: bankAccountNumber,
            ifscCode: bankIfscCode,
            bankName: bankName
          };
          formData.append('bank_details', JSON.stringify(bankDetails));
          
          // ✅ FIX: Use field names that match the backend multer configuration
          if (sellerGstCert) formData.append('gstCertificate', sellerGstCert);
          if (sellerPanCard) formData.append('panCard', sellerPanCard);
          if (sellerBankProof) formData.append('bankProof', sellerBankProof);
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        if (data.success) {
          setSuccessMessage(userType === 'user' 
            ? "Account created successfully! Please check your email."
            : "Registration submitted for approval! You'll receive an email once verified.");
          setShowSuccess(true);
          
          // Reset form
          setTimeout(() => {
            setIsLogin(true);
            setShowSuccess(false);
            setRegStep(1);
          }, 3000);
        }
      }
    } catch (error: any) {
      showToastMessage(error.message || "An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(regStep)) {
      setRegStep(prev => prev + 1);
    }
  };

  const prevStep = () => setRegStep(prev => prev - 1);

  const toggleCategory = (cat: string) => {
    if (productCategories.includes(cat)) {
      setProductCategories(productCategories.filter(c => c !== cat));
    } else {
      setProductCategories([...productCategories, cat]);
    }
  };

  // Dynamic step labels and total steps
  const getStepLabels = () => {
    if (userType === 'enterprise') {
      return ['Basic', 'Contact', 'Business', 'Documents'];
    } else if (userType === 'seller') {
      return ['Shop Info', 'Contact', 'Financial', 'Documents'];
    }
    return [];
  };

  const totalSteps = userType === 'enterprise' ? 4 : userType === 'seller' ? 4 : 0;

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    } overflow-hidden`}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
        />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {toastType === "error" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toastType === "info" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Toggle & Home Button */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link href="/">
            <button className={`p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 border ${
              isDarkMode 
                ? "bg-white/5 border-white/10 hover:bg-white/10" 
                : "bg-black/5 border-gray-200/50 hover:bg-black/10"
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </Link>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: isDarkMode ? 180 : 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 border ${
            isDarkMode 
              ? "bg-white/5 border-white/10 hover:bg-white/10" 
              : "bg-black/5 border-gray-200/50 hover:bg-black/10"
          }`}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Main Container */}
      <div className="flex h-screen w-full">
        {/* Left Side - 3D Carousel */}
        <div className="relative w-1/2 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${carouselImages[currentSlide].gradient} z-10`} />
              <Image
                src={carouselImages[currentSlide].url}
                alt={carouselImages[currentSlide].title}
                fill
                sizes="50vw" // ✅ FIX: Added sizes attribute to eliminate warning
                className="object-cover"
                priority={currentSlide === 0}
              />
              
              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -30, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-20 right-20 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full z-20"
              />
              
              <motion.div
                animate={{ 
                  y: [0, 30, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-20 left-20 w-40 h-40 bg-emerald-500/10 backdrop-blur-xl rounded-full z-20"
              />

              {/* Caption */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-16 left-12 z-30 text-white"
              >
                <motion.p 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm tracking-[0.3em] uppercase mb-3 text-emerald-400"
                >
                  ✦ DISCOVER KARNATAKA
                </motion.p>
                <motion.h2 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-6xl font-bold mb-2"
                >
                  {carouselImages[currentSlide].title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-white/80 text-xl mb-2"
                >
                  {carouselImages[currentSlide].location}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="text-white/60 text-lg max-w-md"
                >
                  {carouselImages[currentSlide].description}
                </motion.p>
                
                {/* Progress Indicators */}
                <div className="flex gap-3 mt-8">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className="group relative h-1 rounded-full overflow-hidden"
                    >
                      <div className={`w-12 h-full bg-white/30 rounded-full transition-all duration-300`}>
                        <motion.div
                          animate={{ width: idx === currentSlide ? "100%" : "0%" }}
                          transition={{ duration: 5 }}
                          className="h-full bg-emerald-400 rounded-full"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Brand Logo */}
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-8 left-8 z-40 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl group-hover:scale-110 transition-transform"
                >
                  KS
                </motion.div>
                <div>
                  <h3 className="text-white text-2xl font-light tracking-wider">Samskruthi</h3>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Cultural Heritage</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Right Side - Auth Forms */}
        <div className={`w-1/2 h-full overflow-y-auto relative ${
          isDarkMode ? "bg-gray-900/80" : "bg-white/80"
        } backdrop-blur-xl`}>
          <div className="min-h-full flex items-center justify-center py-12 px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              {/* Welcome Text */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                >
                  {isLogin ? "Welcome Back" : "Join Our Community"}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {isLogin 
                    ? "Sign in to continue your heritage journey" 
                    : "Choose your path and start your adventure"}
                </motion.p>
              </motion.div>

              {/* User Type Selection - 3D Cards */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <label className={`block text-xs mb-3 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    I want to join as
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: "user", label: "Traveler", icon: "🧳", gradient: "from-emerald-500 to-teal-500", desc: "Explore heritage sites" },
                      { type: "enterprise", label: "Enterprise", icon: "🏢", gradient: "from-blue-500 to-indigo-500", desc: "List & manage sites" },
                      { type: "seller", label: "Seller", icon: "🏪", gradient: "from-purple-500 to-pink-500", desc: "Sell local products" },
                    ].map((option) => (
                      <motion.button
                        key={option.type}
                        whileHover={{ y: -5, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setUserType(option.type as any);
                          setRegStep(1);
                        }}
                        className="group perspective"
                      >
                        <div className={`relative p-4 rounded-2xl transition-all duration-300 transform-gpu preserve-3d ${
                          userType === option.type
                            ? `bg-gradient-to-br ${option.gradient} text-white shadow-xl scale-105`
                            : isDarkMode
                              ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800"
                              : "bg-white/50 border border-gray-200/50 hover:bg-white"
                        }`}>
                          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${option.gradient} blur-xl`} />
                          
                          <div className="relative z-10">
                            <span className="text-3xl mb-2 block">{option.icon}</span>
                            <p className="text-sm font-medium mb-1">{option.label}</p>
                            <p className={`text-[10px] ${userType === option.type ? 'text-white/80' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {option.desc}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-lg border ${
                      isDarkMode 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">{successMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex p-1.5 rounded-2xl mb-8 ${
                  isDarkMode ? "bg-gray-800/50" : "bg-gray-100/50"
                } backdrop-blur-xl border ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
              >
                {["Sign In", "Sign Up"].map((label, idx) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsLogin(idx === 0);
                      setRegStep(1);
                      setErrors({ 
                        name: "", email: "", password: "", confirmPassword: "", terms: "",
                        registrationNumber: "", contactPerson: "", contactPhone: "", phone: "",
                        shopAddress: "", panNumber: "", gstNumber: "", bankAccountNumber: "",
                        bankIfscCode: "", sellerPhone: "", ownerName: "", shopName: ""
                      });
                    }}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      (idx === 0 && isLogin) || (idx === 1 && !isLogin)
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                        : isDarkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </motion.button>
                ))}
              </motion.div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Progress Steps for Enterprise/Seller */}
                {!isLogin && (userType === 'enterprise' || userType === 'seller') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="relative">
                      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
                      <div className="relative flex justify-between">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                          <div key={step} className="flex flex-col items-center">
                            <motion.div
                              animate={{ scale: regStep >= step ? 1.1 : 1 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                regStep >= step
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                  : isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {regStep > step ? '✓' : step}
                            </motion.div>
                            <span className={`text-[10px] mt-1 ${
                              regStep >= step ? 'text-emerald-500' : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {getStepLabels()[step - 1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Login Form */}
                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Email Field */}
                    <div className="group">
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 pl-11 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                          placeholder="Enter your email"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3 pl-11 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                          placeholder="Enter your password"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
                        >
                          {passwordVisible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
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
                      <button type="button" className={`text-xs hover:text-emerald-400 transition-colors relative group ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        Forgot password?
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
                      </button>
                    </div>

                    {/* Login Button */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            Sign In
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </motion.button>
                  </motion.div>
                )}

                {/* User Registration */}
                {!isLogin && userType === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Full Name */}
                    <div className="group">
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Full Name <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.name
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          isDarkMode
                            ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                            : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* City and State */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          State
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    {/* Email and Password for User */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.email
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Password <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.password
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none pr-12`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
                        >
                          {passwordVisible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Confirm Password <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.confirmPassword
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none pr-12`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
                        >
                          {confirmPasswordVisible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enterprise Registration - Step 1: Basic Info */}
                {!isLogin && userType === 'enterprise' && regStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Company Information</h3>
                    
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Company Name <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter company name"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.name
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Registration No. <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="Registration number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.registrationNumber
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          PAN Number <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value)}
                          placeholder="PAN number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.panNumber
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          GST Number
                        </label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="GST number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Business Type
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        >
                          <option value="">Select type</option>
                          <option value="heritage">Heritage Site Management</option>
                          <option value="hospitality">Hospitality & Tourism</option>
                          <option value="travel">Travel Agency</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={establishedYear}
                          onChange={(e) => setEstablishedYear(e.target.value)}
                          placeholder="YYYY"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Employee Count
                        </label>
                        <input
                          type="number"
                          value={employeeCount}
                          onChange={(e) => setEmployeeCount(e.target.value)}
                          placeholder="Number of employees"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Company Description
                      </label>
                      <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        rows={3}
                        placeholder="Brief description of your company"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                      />
                    </div>

                    {/* Email for Enterprise */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.email
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    {/* Password for Enterprise */}
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Password <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.password
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none pr-12`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
                        >
                          {passwordVisible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enterprise Registration - Step 2: Contact Info */}
                {!isLogin && userType === 'enterprise' && regStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    
                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Contact Person <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Full name"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.contactPerson
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Contact Phone <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Phone number"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.contactPhone
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Company Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Company email"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          isDarkMode
                            ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                            : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Address
                      </label>
                      <textarea
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        rows={2}
                        placeholder="Street address"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          isDarkMode
                            ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                            : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          City
                        </label>
                        <input
                          type="text"
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          placeholder="City"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          State
                        </label>
                        <input
                          type="text"
                          value={companyState}
                          onChange={(e) => setCompanyState(e.target.value)}
                          placeholder="State"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={companyPincode}
                          onChange={(e) => setCompanyPincode(e.target.value)}
                          placeholder="Pincode"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enterprise Registration - Step 3: Documents */}
                {!isLogin && userType === 'enterprise' && regStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Upload Documents</h3>
                    
                    <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Please upload clear scanned copies of the following documents
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Registration Certificate */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        registrationCert
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) => setRegistrationCert(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">📜</span>
                            <span className="text-xs font-medium">Registration Certificate</span>
                            {registrationCert ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* GST Certificate */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        gstCert
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) => setGstCert(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">📑</span>
                            <span className="text-xs font-medium">GST Certificate</span>
                            {gstCert ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* PAN Card */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        panCard
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".jpg,.png"
                            className="hidden"
                            onChange={(e) => setPanCard(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">🆔</span>
                            <span className="text-xs font-medium">PAN Card</span>
                            {panCard ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Address Proof */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        addressProof
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) => setAddressProof(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">🏠</span>
                            <span className="text-xs font-medium">Address Proof</span>
                            {addressProof ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Bank Statement */}
                      <div className={`col-span-2 p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        bankStatement
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setBankStatement(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">🏦</span>
                            <span className="text-xs font-medium">Bank Statement (Last 6 months)</span>
                            {bankStatement ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Seller Registration - Step 1: Shop Info */}
                {!isLogin && userType === 'seller' && regStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Shop Information</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Shop Name <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => {
                            setShopName(e.target.value);
                            clearFieldError("shopName");
                          }}
                          placeholder="Shop name"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.shopName
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Owner Name <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => {
                            setOwnerName(e.target.value);
                            clearFieldError("ownerName");
                          }}
                          placeholder="Owner name"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.ownerName
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Shop Type
                      </label>
                      <select
                        value={shopType}
                        onChange={(e) => setShopType(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          isDarkMode
                            ? "bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                            : "bg-white/50 border-gray-200 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      >
                        <option value="">Select shop type</option>
                        <option value="handicraft">Handicraft</option>
                        <option value="silk">Silk & Textiles</option>
                        <option value="coffee">Coffee & Spices</option>
                        <option value="sandalwood">Sandalwood</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={sellerEstablishedYear}
                          onChange={(e) => setSellerEstablishedYear(e.target.value)}
                          placeholder="YYYY"
                          min="1800"
                          max={new Date().getFullYear()}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Business Description
                        </label>
                        <input
                          type="text"
                          value={businessDescription}
                          onChange={(e) => setBusinessDescription(e.target.value)}
                          placeholder="Brief description"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Product Categories
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Handicrafts', 'Textiles', 'Spices', 'Art', 'Souvenirs'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                              productCategories.includes(cat)
                                ? 'bg-emerald-500 text-white'
                                : isDarkMode
                                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Seller Registration - Step 2: Contact Info */}
                {!isLogin && userType === 'seller' && regStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Phone <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={sellerPhone}
                          onChange={(e) => {
                            setSellerPhone(e.target.value);
                            clearFieldError("sellerPhone");
                          }}
                          placeholder="Phone number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.sellerPhone
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Alternate Phone
                        </label>
                        <input
                          type="tel"
                          value={sellerAlternatePhone}
                          onChange={(e) => setSellerAlternatePhone(e.target.value)}
                          placeholder="Alternate phone"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Shop Address <span className="text-emerald-500">*</span>
                      </label>
                      <textarea
                        value={shopAddress}
                        onChange={(e) => {
                          setShopAddress(e.target.value);
                          clearFieldError("shopAddress");
                        }}
                        placeholder="Full shop address"
                        rows={2}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.shopAddress
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          City
                        </label>
                        <input
                          type="text"
                          value={sellerCity}
                          onChange={(e) => setSellerCity(e.target.value)}
                          placeholder="City"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          State
                        </label>
                        <input
                          type="text"
                          value={sellerState}
                          onChange={(e) => setSellerState(e.target.value)}
                          placeholder="State"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={sellerPincode}
                          onChange={(e) => setSellerPincode(e.target.value)}
                          placeholder="Pincode"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Email Address <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          errors.email
                            ? isDarkMode
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Password <span className="text-emerald-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.password
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none pr-12`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500"
                        >
                          {passwordVisible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Seller Registration - Step 3: Financial Info */}
                {!isLogin && userType === 'seller' && regStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Financial Information</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          GST Number
                        </label>
                        <input
                          type="text"
                          value={sellerGstNumber}
                          onChange={(e) => setSellerGstNumber(e.target.value)}
                          placeholder="GST number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={sellerPanNumber}
                          onChange={(e) => setSellerPanNumber(e.target.value)}
                          placeholder="PAN number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            isDarkMode
                              ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                              : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Bank name"
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                          isDarkMode
                            ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                            : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        } outline-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          Account Number <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => {
                            setBankAccountNumber(e.target.value);
                            clearFieldError("bankAccountNumber");
                          }}
                          placeholder="Account number"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.bankAccountNumber
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-2 font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          IFSC Code <span className="text-emerald-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankIfscCode}
                          onChange={(e) => {
                            setBankIfscCode(e.target.value);
                            clearFieldError("bankIfscCode");
                          }}
                          placeholder="IFSC code"
                          className={`w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 border ${
                            errors.bankIfscCode
                              ? isDarkMode
                                ? "border-red-500/50 bg-red-500/10"
                                : "border-red-300 bg-red-50"
                              : isDarkMode
                                ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20"
                                : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          } outline-none`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Seller Registration - Step 4: Documents */}
                {!isLogin && userType === 'seller' && regStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">Upload Documents (Optional)</h3>
                    
                    <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Upload scanned copies for faster verification
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* GST Certificate */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        sellerGstCert
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) => setSellerGstCert(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">📑</span>
                            <span className="text-xs font-medium">GST Certificate</span>
                            {sellerGstCert ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* PAN Card */}
                      <div className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        sellerPanCard
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".jpg,.png"
                            className="hidden"
                            onChange={(e) => setSellerPanCard(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">🆔</span>
                            <span className="text-xs font-medium">PAN Card</span>
                            {sellerPanCard ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Bank Proof */}
                      <div className={`col-span-2 p-4 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                        sellerBankProof
                          ? isDarkMode
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-emerald-500 bg-emerald-50"
                          : isDarkMode
                            ? "border-gray-700 hover:border-emerald-500/50"
                            : "border-gray-200 hover:border-emerald-500"
                      }`}>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="hidden"
                            onChange={(e) => setSellerBankProof(e.target.files?.[0] || null)}
                          />
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span className="text-3xl">🏦</span>
                            <span className="text-xs font-medium">Bank Proof (Cancelled Cheque)</span>
                            {sellerBankProof ? (
                              <span className="text-[10px] text-emerald-500">✓ Uploaded</span>
                            ) : (
                              <span className="text-[10px] text-gray-500">Click to upload</span>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons for Enterprise/Seller */}
                {!isLogin && (userType === 'enterprise' || userType === 'seller') && (
                  <div className="flex gap-3 pt-4">
                    {regStep > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={prevStep}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                          isDarkMode
                            ? "border-gray-700 hover:bg-gray-800"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </motion.button>
                    )}
                    
                    {regStep < totalSteps ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={nextStep}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Next Step
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          "Submit for Approval"
                        )}
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Terms & Conditions */}
                {!isLogin && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <label htmlFor="terms" className={`text-xs transition-colors ${
                        isDarkMode ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-700"
                      }`}>
                        I agree to the{" "}
                        <button type="button" className="text-emerald-400 hover:text-emerald-500 font-medium">
                          Terms & Conditions
                        </button>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className={`text-xs ${isDarkMode ? "text-red-400" : "text-red-500"}`}>
                        {errors.terms}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button for User */}
                {!isLogin && userType === 'user' && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        "Create Traveler Account"
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </motion.button>
                )}

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
                    <motion.button
                      key={provider.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className={`group relative py-3 rounded-lg border overflow-hidden transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`absolute inset-0 bg-gradient-to-r ${provider.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></span>
                      <span className="relative z-10 text-base font-medium">
                        {provider.icon}
                      </span>
                    </motion.button>
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
                    setRegStep(1);
                    setErrors({ 
                      name: "", email: "", password: "", confirmPassword: "", terms: "",
                      registrationNumber: "", contactPerson: "", contactPhone: "", phone: "",
                      shopAddress: "", panNumber: "", gstNumber: "", bankAccountNumber: "",
                      bankIfscCode: "", sellerPhone: "", ownerName: "", shopName: ""
                    });
                  }}
                  className="text-emerald-400 hover:text-emerald-500 font-medium relative group"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300"></span>
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}