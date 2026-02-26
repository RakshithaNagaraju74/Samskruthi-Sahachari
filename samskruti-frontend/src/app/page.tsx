"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// Define TypeScript interfaces
interface ImageType {
  id: number;
  url: string;
  title: string;
  location: string;
  category: string;
  description?: string;
}

interface DestinationType {
  id: number;
  name: string;
  kannada: string;
  image: string;
  desc: string;
  time: string;
  rating: number;
  price: string;
  category: string;
}

interface ExperienceType {
  icon: string;
  title: string;
  desc: string;
  duration: string;
  gradient: string;
  image: string;
}

interface TestimonialType {
  name: string;
  location: string;
  image: string;
  quote: string;
  rating: number;
}

interface CategoryType {
  id: string;
  name: string;
  icon: string;
}

interface StatType {
  value: string;
  label: string;
  suffix?: string;
}

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isHoveringTitle, setIsHoveringTitle] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("places");
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExploring, setIsExploring] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleImages, setVisibleImages] = useState<number>(8);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Track scroll progress for effects
  useEffect(() => {
    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / maxScroll) * 100;
      setScrollProgress(progress);
      setScrolled(scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse move effect for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Hero Stack Images (using local paths)
  const heroImages: ImageType[] = [
    { id: 1, url: "/images/mysore-palace.jpeg", title: "Mysore Palace", location: "Mysuru", category: "heritage" },
    { id: 2, url: "/images/hampi.jpeg", title: "Hampi Ruins", location: "Hampi", category: "heritage" },
    { id: 3, url: "/images/jog-falls.jpeg", title: "Jog Falls", location: "Shimoga", category: "nature" },
    { id: 4, url: "/images/coorg.jpeg", title: "Coorg Valley", location: "Madikeri", category: "nature" },
    { id: 5, url: "/images/gokarna.jpeg", title: "Gokarna Beach", location: "Gokarna", category: "beach" },
    { id: 6, url: "/images/badami.jpeg", title: "Badami Caves", location: "Badami", category: "heritage" },
  ];

  // Auto-slide effect for hero stack
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Complete Gallery Images (all your local images)
  const galleryImages: ImageType[] = [
    // Heritage Sites
    { id: 1, url: "/images/mysore-palace.jpeg", title: "Mysore Palace", location: "Mysuru", category: "heritage", description: "The grand palace illuminated at night" },
    { id: 2, url: "/images/hampi.jpeg", title: "Hampi Ruins", location: "Hampi", category: "heritage", description: "Ancient Vijayanagara Empire ruins" },
    { id: 3, url: "/images/badami.jpeg", title: "Badami Caves", location: "Badami", category: "heritage", description: "Rock-cut cave temples from 6th century" },
    { id: 4, url: "/images/belur.jpeg", title: "Belur Temple", location: "Belur", category: "heritage", description: "Hoysala architecture masterpiece" },
    { id: 5, url: "/images/shravanabelagola.jpeg", title: "Gommateshwara", location: "Shravanabelagola", category: "heritage", description: "57-foot monolithic statue" },
    { id: 6, url: "/images/murdeshwar.jpeg", title: "Murudeshwar Temple", location: "Murudeshwar", category: "heritage", description: "Second tallest Shiva statue" },
    { id: 7, url: "/images/pattadakal.jpeg", title: "Pattadakal", location: "Pattadakal", category: "heritage", description: "UNESCO World Heritage site" },
    { id: 8, url: "/images/aihole.jpg", title: "Aihole Temples", location: "Aihole", category: "heritage", description: "Cradle of temple architecture" },
    
    // Nature & Hills
    { id: 9, url: "/images/coorg.jpeg", title: "Coorg Valley", location: "Madikeri", category: "nature", description: "Scotland of India - misty hills" },
    { id: 10, url: "/images/chikmagalur.jpeg", title: "Chikmagalur", location: "Chikmagalur", category: "nature", description: "Coffee estate hills" },
    { id: 11, url: "/images/jog-falls.jpeg", title: "Jog Falls", location: "Shimoga", category: "nature", description: "India's second highest waterfall" },
    { id: 12, url: "/images/kudremukh.jpeg", title: "Kudremukh Peak", location: "Kudremukh", category: "nature", description: "Horse-faced mountain range" },
    { id: 13, url: "/images/agumbe .jpeg", title: "Agumbe Rainforest", location: "Agumbe", category: "nature", description: "Sunset point & rainforest" },
    { id: 14, url: "/images/mullayanagiri.jpeg", title: "Mullayanagiri", location: "Chikmagalur", category:"nature" , description:"Highest peak in Karnataka" },
    { id: 15, url: "/images/nandi-hills.jpeg", title: "Nandi Hills", location: "Nandi Hills", category: "nature", description: "Sunrise viewpoint" },
    { id: 16, url: "/images/Kemmanagundi .jpeg", title: "Kemmangundi", location: "Kemmangundi", category: "nature", description: "Hill station with gardens" },
    
    // Beaches
    { id: 17, url: "/images/gokarna.jpeg", title: "Gokarna Beach", location: "Gokarna", category: "beach", description: "Serene beach town" },
    { id: 18, url: "/images/om-beach.jpeg", title: "Om Beach", location: "Gokarna", category: "beach", description: "Om-shaped shoreline" },
    { id: 19, url: "/images/kudle-beach.jpeg", title: "Kudle Beach", location: "Gokarna", category: "beach", description: "Perfect sunset views" },
    { id: 20, url: "/images/half-moon-beach.jpeg", title: "Half Moon Beach", location: "Gokarna", category:"beach" , description:"Secluded paradise" },
    { id: 21, url: "/images/paradise-beach.jpeg", title:"Paradise Beach" , location:"Gokarna" , category:"beach" , description:"Trekker's favorite" },
    { id: 22, url:"/images/maravanthe.jpeg" , title:"Maravanthe Beach" , location:"Maravanthe" , category:"beach" , description:"River on one side, sea on other"},
    { id: 23, url: "/images/karwar.jpeg", title: "Karwar Beach", location: "Karwar", category: "beach", description: "Pristine coastal town" },
    
    // Wildlife & National Parks
    { id: 24, url: "/images/kabini.jpeg", title: "Kabini Wildlife", location: "Kabini", category: "wildlife", description: "Leopard & elephant sightings" },
    { id: 25, url: "/images/bandipur.jpeg", title: "Bandipur National Park", location: "Bandipur", category: "wildlife", description: "Tiger reserve" },
    { id: 26, url: "/images/nagarhole.jpeg", title: "Nagarhole National Park", location: "Nagarhole", category: "wildlife", description: "Rich biodiversity" },
    { id: 27, url: "/images/dandeli.jpeg", title: "Dandeli Wildlife", location: "Dandeli", category: "wildlife", description: "River rafting & wildlife" },
    
    // Cultural & Festivals
    { id: 28, url: "/images/yakshagana.jpeg", title: "Yakshagana", location: "Coastal Karnataka", category: "culture", description: "Traditional dance-drama" },
    { id: 29, url: "/images/dollu-kunitha.jpeg", title: "Dollu Kunitha", location: "North Karnataka", category:"culture" , description:"Drum dance" },
    { id: 30, url: "/images/mysore-dasara.jpeg", title: "Mysore Dasara", location: "Mysuru", category: "culture", description: "Festival of royalty" },
    
    // Cuisine
    { id: 31, url: "/images/mysore-pak.jpeg", title: "Mysore Pak", location: "Mysuru", category: "food", description: "Famous sweet delicacy" },
    { id: 32, url: "/images/bisi-bele-bath.jpeg", title: "Bisi Bele Bath", location: "Karnataka", category: "food", description: "Traditional rice dish" },
    { id: 33, url: "/images/coffee-estate.jpeg", title: "Coffee Estate", location: "Chikmagalur", category: "food", description: "Arabica coffee plantations" },
    { id: 34, url: "/images/masala-dosa.jpg", title: "Masala Dosa", location: "Udupi", category: "food", description: "Crispy dosa with potato filling" },
  ];

  const destinations: DestinationType[] = [
    { 
      id: 1,
      name: "Mysore", 
      kannada: "ಮೈಸೂರು", 
      image: "/images/mysore-palace.jpeg", 
      desc: "Palace city",
      time: "3-4 days",
      rating: 4.8,
      price: "₹8,999",
      category: "heritage"
    },
    { 
      id: 2,
      name: "Hampi", 
      kannada: "ಹಂಪಿ", 
      image: "/images/hampi.jpeg", 
      desc: "Ancient ruins",
      time: "2-3 days",
      rating: 4.9,
      price: "₹7,499",
      category: "heritage"
    },
    { 
      id: 3,
      name: "Coorg", 
      kannada: "ಕೊಡಗು", 
      image: "/images/coorg.jpeg", 
      desc: "Misty hills",
      time: "3-4 days",
      rating: 4.7,
      price: "₹9,999",
      category: "nature"
    },
    { 
      id: 4,
      name: "Gokarna", 
      kannada: "ಗೋಕರ್ಣ", 
      image: "/images/gokarna.jpeg", 
      desc: "Coastal escape",
      time: "2-3 days",
      rating: 4.6,
      price: "₹6,999",
      category: "beach"
    },
    { 
      id: 5,
      name: "Badami", 
      kannada: "ಬದಾಮಿ", 
      image: "/images/badami.jpeg", 
      desc: "Cave temples",
      time: "2-3 days",
      rating: 4.5,
      price: "₹6,499",
      category: "heritage"
    },
    { 
      id: 6,
      name: "Chikmagalur", 
      kannada: "ಚಿಕ್ಕಮಗಳೂರು", 
      image: "/images/chikmagalur.jpeg", 
      desc: "Coffee estates",
      time: "3-4 days",
      rating: 4.7,
      price: "₹8,499",
      category: "nature"
    },
    { 
      id: 7,
      name: "Kabini", 
      kannada: "ಕಬಿನಿ", 
      image: "/images/kabini.jpeg", 
      desc: "Wildlife safari",
      time: "2-3 days",
      rating: 4.8,
      price: "₹12,999",
      category: "wildlife"
    },
    { 
      id: 8,
      name: "Udupi", 
      kannada: "ಉಡುಪಿ", 
      image: "/images/udupi.jpeg", 
      desc: "Temple town",
      time: "2-3 days",
      rating: 4.4,
      price: "₹5,999",
      category: "heritage"
    },
  ];

  const experiences: ExperienceType[] = [
    {
      icon: "🏛️",
      title: "Heritage walks",
      desc: "Guided tours through ancient temples and palaces",
      duration: "3-7 days",
      gradient: "from-amber-500 to-orange-500",
      image: "/images/heritage-walk.jpeg"
    },
    {
      icon: "🌄",
      title: "Nature retreats",
      desc: "Stay in coffee estates and wildlife resorts",
      duration: "2-5 days",
      gradient: "from-emerald-500 to-teal-500",
      image: "/images/nature-retreat.jpeg"
    },
    {
      icon: "🏖️",
      title: "Beach hopping",
      desc: "Explore pristine beaches and coastal towns",
      duration: "3-4 days",
      gradient: "from-blue-500 to-cyan-500",
      image: "/images/beach-hopping.jpeg"
    },
    {
      icon: "🍛",
      title: "Food trails",
      desc: "Savor authentic Karnataka cuisine",
      duration: "2-3 days",
      gradient: "from-red-500 to-pink-500",
      image: "/images/food-trail.jpg"
    },
    {
      icon: "🐘",
      title: "Wildlife safaris",
      desc: "Spot tigers, elephants, and rare birds",
      duration: "3-4 days",
      gradient: "from-green-500 to-lime-500",
      image: "/images/wildlife.jpg"
    },
    {
      icon: "🎭",
      title: "Cultural festivals",
      desc: "Experience traditional dance and music",
      duration: "2-4 days",
      gradient: "from-purple-500 to-pink-500",
      image: "/images/festival.jpg"
    },
  ];

  const testimonials: TestimonialType[] = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      image: "",
      quote: "The heritage walk in Hampi was unforgettable. Felt like stepping back in time.",
      rating: 5,
    },
    {
      name: "Rahul Menon",
      location: "Bangalore",
      image: "",
      quote: "Coorg's coffee estates are a slice of paradise. The misty mornings are magical.",
      rating: 5,
    },
    {
      name: "Anjali Desai",
      location: "Delhi",
      image: "",
      quote: "Gokarna's beaches are so peaceful. Much better than the crowded Goa beaches.",
      rating: 5,
    },
    {
      name: "Vikram Patel",
      location: "Ahmedabad",
      image: "",
      quote: "Kabini wildlife safari was incredible. Saw a leopard and elephants!",
      rating: 5,
    },
  ];

  const categories: CategoryType[] = [
    { id: "all", name: "All", icon: "🌍" },
    { id: "heritage", name: "Heritage", icon: "🏛️" },
    { id: "nature", name: "Nature", icon: "🌄" },
    { id: "beach", name: "Beach", icon: "🏖️" },
    { id: "wildlife", name: "Wildlife", icon: "🐘" },
    { id: "culture", name: "Culture", icon: "🎭" },
    { id: "food", name: "Food", icon: "🍛" },
  ];

  const filteredImages: ImageType[] = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const visibleGalleryImages: ImageType[] = filteredImages.slice(0, visibleImages);

  const loadMoreImages = (): void => {
    setVisibleImages(prev => Math.min(prev + 8, filteredImages.length));
  };

  const openLightbox = (image: ImageType): void => {
    setSelectedImage(image);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = (): void => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const handleExploreClick = (): void => {
    setIsExploring(true);
    setTimeout(() => setIsExploring(false), 2000);
  };

  // Scroll progress indicator style
  const progressStyle: React.CSSProperties = {
    width: `${scrollProgress}%`,
    height: '3px',
    background: 'linear-gradient(90deg, #10b981, #34d399, #6ee7b7)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    transition: 'width 0.1s ease-out'
  };

  const stats: StatType[] = [
    { value: "30+", label: "Destinations", suffix: "" },
    { value: "50+", label: "Experiences", suffix: "+" },
    { value: "4.9", label: "Rating", suffix: "" },
    { value: "10k+", label: "Travelers", suffix: "" },
  ];

  const footerStats: StatType[] = [
    { value: "30+", label: "Destinations" },
    { value: "50+", label: "Experiences" },
    { value: "34+", label: "Gallery Images" },
    { value: "10k+", label: "Happy Travelers" },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      isDarkMode 
        ? "bg-[#0a0a0a] text-white" 
        : "bg-gray-50 text-gray-900"
    } overflow-x-hidden`} ref={mainRef}>
      {/* Scroll Progress Bar */}
      <div style={progressStyle}></div>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode 
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" 
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent"
        }`}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: isDarkMode 
            ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`
            : `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        } as React.CSSProperties}></div>
        
        {/* Animated Orbs that follow scroll */}
        <div 
          className={`absolute w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? "bg-emerald-500/10" : "bg-emerald-500/5"
          }`}
          style={{
            top: `${20 + scrollProgress * 0.5}%`,
            left: `${10 + scrollProgress * 0.3}%`,
            transition: 'top 0.5s ease-out, left 0.5s ease-out'
          } as React.CSSProperties}
        ></div>
        <div 
          className={`absolute w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? "bg-blue-500/10" : "bg-blue-500/5"
          }`}
          style={{
            bottom: `${20 + scrollProgress * 0.5}%`,
            right: `${10 + scrollProgress * 0.3}%`,
            transition: 'bottom 0.5s ease-out, right 0.5s ease-out'
          } as React.CSSProperties}
        ></div>
      </div>

      {/* ================= PREMIUM NAVBAR ================= */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled 
          ? isDarkMode 
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10" 
            : "bg-white/80 backdrop-blur-xl border-b border-gray-200"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          {/* 3D Logo Effect */}
          <div 
            className="relative cursor-pointer group perspective-1000"
            onMouseEnter={() => setIsHoveringTitle(true)}
            onMouseLeave={() => setIsHoveringTitle(false)}
          >
            <div className={`transition-all duration-700 transform-gpu preserve-3d ${
              isHoveringTitle ? "rotate-y-180" : ""
            }`}>
              {/* Front (English) */}
              <div className="backface-hidden">
                <h1 className="text-3xl md:text-4xl font-light tracking-wide bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent drop-shadow-md">
                  Samskruthi<span className="text-emerald-400">.</span>
                </h1>
                <p className="text-[10px] tracking-[0.3em] uppercase mt-1 text-emerald-400/70 font-extralight">
                  Sahaachari
                </p>
              </div>
              
              {/* Back (Kannada) - More Stylish */}
              <div className="absolute inset-0 rotate-y-180 backface-hidden">
                <h1 className="text-3xl md:text-4xl font-['Noto_Serif_Kannada'] font-medium tracking-wider text-emerald-400 drop-shadow-md" style={{ fontFamily: "'Noto Serif Kannada', 'Mallanna', 'Nudi', serif" }}>
                  ಸಂಸ್ಕೃತಿ<span className={isDarkMode ? "text-white/30" : "text-gray-400"}>.</span>
                </h1>
                <p className={`text-[10px] tracking-[0.25em] uppercase mt-1 font-light ${
                  isDarkMode ? "text-white/30" : "text-gray-400"
                }`} style={{ fontFamily: "'Noto Serif Kannada', 'Mallanna', 'Nudi', serif" }}>
                  ಸಹಚಾರಿ
                </p>
              </div>
            </div>
          </div>

          {/* Animated Navigation */}
          <nav className="hidden md:flex gap-8">
            {["Home", "Destinations", "Experiences", "Gallery", "Journal", "Contact"].map((item, index) => (
              <a
                key={index}
                href={`#${item.toLowerCase()}`}
                className={`relative text-sm transition-all duration-300 group ${
                  isDarkMode 
                    ? "text-white/70 hover:text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-400 group-hover:w-full transition-all duration-500"></span>
              </a>
            ))}
          </nav>

          {/* Theme Toggle & Buttons */}
          <div className="flex gap-3 items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? "bg-white/5 text-white/70 hover:bg-white/10" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <Link href="/auth">
              <button className={`px-5 py-2 transition-colors text-sm relative group overflow-hidden ${
                isDarkMode 
                  ? "text-white/70 hover:text-white" 
                  : "text-gray-600 hover:text-gray-900"
              }`}>
                <span className="relative z-10">Log in</span>
                <span className={`absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left ${
                  isDarkMode ? "bg-white/5" : "bg-gray-100"
                }`}></span>
              </button>
            </Link>
            <Link href="/auth">
              <button className={`px-5 py-2 rounded-full text-sm border transition-all duration-300 ${
                isDarkMode 
                  ? "bg-white/5 text-white border-white/10 hover:bg-emerald-500/20 hover:border-emerald-400/50" 
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              }`}>
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= CINEMATIC HERO ================= */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Parallax Background */}
        <div 
          ref={parallaxRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.2s ease-out'
          } as React.CSSProperties}
        >
          <div className={`absolute inset-0 z-10 ${
            isDarkMode 
              ? "bg-gradient-to-r from-black via-black/50 to-transparent" 
              : "bg-gradient-to-r from-white via-white/70 to-transparent"
          }`}></div>
          <Image
            src="/images/mysore-palace.jpg"
            alt="Karnataka"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        {/* Floating Orbs */}
        <div className={`absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse ${
          isDarkMode ? "bg-emerald-500/20" : "bg-emerald-500/10"
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse animation-delay-2000 ${
          isDarkMode ? "bg-blue-500/20" : "bg-blue-500/10"
        }`}></div>

        <div className="relative w-full max-w-7xl mx-auto px-6 z-20">
          {/* Content positioned absolutely to the left */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 max-w-xl">
            {/* Animated Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 group hover:bg-opacity-20 transition-all duration-500 ${
              isDarkMode 
                ? "bg-white/5 border-white/10 hover:bg-white/10" 
                : "bg-white/50 border-gray-200 hover:bg-white"
            }`}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className={`text-xs tracking-wider ${
                isDarkMode ? "text-white/60" : "text-gray-600"
              }`}>✦ KARNATAKA, INDIA</span>
            </div>

            {/* Main Title - Left Aligned */}
            <h1 className="text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              <span className={`block ${isDarkMode ? "text-white/90" : "text-gray-900"}`}>
                Discover the
              </span>
              <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 mt-3 relative group">
                Soul of South
                <span className={`absolute -inset-1 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${
                  isDarkMode ? "bg-white/10" : "bg-emerald-500/20"
                }`}></span>
              </span>
            </h1>

            {/* Description */}
            <p className={`mt-6 text-base max-w-md leading-relaxed animate-fade-in ${
              isDarkMode ? "text-white/60" : "text-gray-600"
            }`}>
              Where ancient temples touch the clouds, misty hills hide coffee estates, 
              and timeless traditions dance in the moonlight.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex gap-4">
              <button 
                onClick={handleExploreClick}
                className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 text-sm font-medium"
              >
                <span className={`relative z-10 transition-all duration-500 ${
                  isExploring ? "opacity-0" : "opacity-100"
                }`}>
                  Explore destinations
                </span>
                <span className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ${
                  isExploring ? "opacity-100" : "opacity-0"
                }`}>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
              </button>
              
              <button className={`group px-8 py-3 rounded-full border transition-all duration-500 overflow-hidden relative text-sm font-medium ${
                isDarkMode 
                  ? "bg-white/5 text-white border-white/10 hover:bg-white/10" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover:scale-150 transition-transform"></span>
                  <span>Watch film</span>
                </span>
              </button>
            </div>

            {/* Live Stats */}
            <div className="mt-12 flex gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className={`text-2xl font-light ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {stat.value}<span className="text-emerald-400">{stat.suffix}</span>
                  </div>
                  <div className={`text-xs tracking-wide mt-1 transition-colors ${
                    isDarkMode 
                      ? "text-white/40 group-hover:text-white/60" 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Stack Slider - Positioned on right */}
        <div className="absolute right-28 top-1/2 transform -translate-y-1/2 w-[450px] h-[550px] hidden xl:block perspective-1000" ref={sliderRef}>
          {heroImages.map((image, index) => {
            const position = (index - currentSlide + heroImages.length) % heroImages.length;
            
            let translateX = 0;
            let translateY = 0;
            let rotate = 0;
            let scale = 1;
            let opacity = 1;
            let zIndex = heroImages.length - position;

            if (position === 0) {
              translateX = 0;
              translateY = 0;
              rotate = 0;
              scale = 1;
              zIndex = heroImages.length;
            } else if (position === 1) {
              translateX = -40;
              translateY = 20;
              rotate = -5;
              scale = 0.9;
              zIndex = heroImages.length - 1;
            } else if (position === 2) {
              translateX = -70;
              translateY = 35;
              rotate = -8;
              scale = 0.8;
              zIndex = heroImages.length - 2;
            } else if (position === 3) {
              translateX = -95;
              translateY = 45;
              rotate = -11;
              scale = 0.7;
              zIndex = heroImages.length - 3;
            } else {
              opacity = 0;
            }

            return (
              <div
                key={image.id}
                className="absolute inset-0 transition-all duration-1000 ease-out cursor-pointer"
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                } as React.CSSProperties}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-light">{image.title}</h3>
                    <p className="text-xs text-white/70">{image.location}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <span className={`text-xs tracking-widest ${
            isDarkMode ? "text-white/40" : "text-gray-400"
          }`}>SCROLL</span>
          <div className={`w-px h-16 bg-gradient-to-b ${
            isDarkMode ? "from-white/20" : "from-gray-400/20"
          } to-transparent`}></div>
        </div>
      </section>

      {/* ================= FEATURED DESTINATIONS ================= */}
      <section id="destinations" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase">Curated places</span>
          <h2 className={`text-4xl font-light mt-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Featured destinations
          </h2>
          <p className={`mt-3 max-w-2xl mx-auto ${
            isDarkMode ? "text-white/40" : "text-gray-500"
          }`}>
            Hand-picked experiences from the heart of Karnataka, each with its own story
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-500 flex items-center gap-1 ${
                  selectedFilter === category.id
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                      : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 perspective-1000">
          {destinations
            .filter(dest => selectedFilter === "all" || dest.category === selectedFilter)
            .slice(0, 4)
            .map((dest, index) => (
            <div
              key={dest.id}
              className="group relative h-[450px] rounded-2xl overflow-hidden cursor-pointer transform-gpu hover:scale-105 hover:rotate-y-2 transition-all duration-700"
              style={{
                transitionDelay: `${index * 100}ms`,
              } as React.CSSProperties}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  <span className="text-xs text-white/90">★ {dest.rating}</span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-xl font-light text-white">{dest.price}</span>
                  <span className="text-white/40 text-xs ml-1">/person</span>
                </div>

                {/* Title with Animation */}
                <div className="overflow-hidden">
                  <h3 className="text-2xl font-light translate-y-0 group-hover:-translate-y-8 transition-transform duration-500">
                    {dest.name}
                  </h3>
                  <p className="text-emerald-400 text-xs translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {dest.kannada}
                  </p>
                </div>

                <p className="text-white/60 text-xs mt-1">{dest.desc}</p>
                
                <div className="flex items-center gap-3 mt-3 text-[10px] text-white/40">
                  <span>✦ {dest.time}</span>
                  <span>•</span>
                  <span className="capitalize">{dest.category}</span>
                </div>

                {/* Book Now Button */}
                <button className="mt-4 px-4 py-2 bg-emerald-500 rounded-full text-xs font-medium opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button className={`px-6 py-2 rounded-full border text-xs transition-all duration-300 ${
            isDarkMode 
              ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10" 
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}>
            View all destinations →
          </button>
        </div>
      </section>

      {/* ================= EXPERIENCES SECTION ================= */}
      <section id="experiences" className="relative py-24 overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent" 
            : "bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent"
        }`}></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase">Experiences</span>
            <h2 className={`text-4xl font-light mt-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Ways to explore
            </h2>
          </div>

          {/* Experiences Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 hover:bg-white/10" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${exp.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon with Animation */}
                <div className="relative z-10">
                  <div className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {exp.icon}
                  </div>
                  
                  <h3 className={`text-lg font-medium mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{exp.title}</h3>
                  <p className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-white/40" : "text-gray-500"
                  }`}>{exp.desc}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-emerald-400">{exp.duration}</span>
                    <span className={`transition-colors ${
                      isDarkMode ? "text-white/20 group-hover:text-emerald-400/50" : "text-gray-300 group-hover:text-emerald-400"
                    }`}>→</span>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/20 rounded-2xl transition-all duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MASSIVE GALLERY SECTION ================= */}
      <section id="gallery" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase">Visual journey</span>
          <h2 className={`text-4xl font-light mt-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Karnataka through the lens
          </h2>
          <p className={`mt-3 max-w-2xl mx-auto ${
            isDarkMode ? "text-white/40" : "text-gray-500"
          }`}>
            Explore our collection of {galleryImages.length}+ stunning images capturing the essence of Karnataka
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setVisibleImages(8);
                }}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-500 flex items-center gap-1 ${
                  activeCategory === category.id
                    ? "bg-emerald-500 text-white"
                    : isDarkMode
                      ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                      : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-[10px] opacity-60">
                  ({galleryImages.filter(img => category.id === "all" ? true : img.category === category.id).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" ref={galleryRef}>
          {visibleGalleryImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transform-gpu hover:scale-105 transition-all duration-500"
              onClick={() => openLightbox(image)}
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              } as React.CSSProperties}
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-medium text-xs">{image.title}</h3>
                <p className="text-white/60 text-[10px] mt-0.5">{image.location}</p>
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[8px] text-white/80 border border-white/10">
                {image.category}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleImages < filteredImages.length && (
          <div className="text-center mt-10">
            <button
              onClick={loadMoreImages}
              className={`group px-6 py-2 rounded-full border text-xs relative overflow-hidden transition-all duration-300 ${
                isDarkMode 
                  ? "bg-white/5 text-white/70 border-white/10 hover:bg-white/10" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="relative z-10">Load more images</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
            </button>
            <p className={`text-[10px] mt-3 ${
              isDarkMode ? "text-white/40" : "text-gray-400"
            }`}>
              Showing {visibleImages} of {filteredImages.length} images
            </p>
          </div>
        )}

        {/* Gallery Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(1).map((category) => {
            const count = galleryImages.filter(img => img.category === category.id).length;
            return (
              <div key={category.id} className={`text-center p-4 rounded-xl border ${
                isDarkMode 
                  ? "bg-white/5 border-white/10" 
                  : "bg-white border-gray-200"
              }`}>
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-lg font-light text-emerald-400">{count}</div>
                <div className={`text-[10px] mt-1 ${
                  isDarkMode ? "text-white/40" : "text-gray-500"
                }`}>{category.name} photos</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= LIGHTBOX MODAL ================= */}
      {isLightboxOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-6xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
              <h3 className="text-2xl font-light text-white">{selectedImage.title}</h3>
              <p className="text-emerald-400 text-sm mt-0.5">{selectedImage.location}</p>
              <p className="text-white/60 text-xs mt-1">{selectedImage.description}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/80">
                  {selectedImage.category}
                </span>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all">
              ←
            </button>
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all">
              →
            </button>
          </div>
        </div>
      )}

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase">Stories</span>
          <h2 className={`text-4xl font-light mt-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Traveler experiences
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group p-5 rounded-xl border transition-all duration-500 ${
                isDarkMode 
                  ? "bg-white/5 border-white/10 hover:bg-white/10" 
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className={`font-medium text-xs ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>{testimonial.name}</h4>
                  <p className={`text-[10px] ${
                    isDarkMode ? "text-white/40" : "text-gray-400"
                  }`}>{testimonial.location}</p>
                </div>
              </div>
              
              <p className={`text-xs italic leading-relaxed ${
                isDarkMode ? "text-white/60" : "text-gray-600"
              }`}>"{testimonial.quote}"</p>
              
              <div className="mt-3 flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-emerald-400 text-xs">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CULTURAL SPOTLIGHT ================= */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 3D Image Card */}
          <div className="relative perspective-1000">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl transform-gpu rotate-y-2 hover:rotate-y-0 transition-transform duration-1000">
              <Image
                src="/images/yakshagana.jpeg"
                alt="Yakshagana"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -bottom-4 -right-4 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 animate-float">
              <div className="text-3xl mb-1">🎭</div>
              <div className="font-medium text-white text-sm">Yakshagana</div>
              <p className="text-[10px] text-white/40 mt-0.5">Traditional dance-drama</p>
            </div>

            <div className="absolute -top-4 -left-4 bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/10 animate-float animation-delay-2000">
              <div className="text-xl">🪘</div>
              <div className="text-[10px] text-white/60 mt-0.5">Dollu Kunitha</div>
            </div>
          </div>

          <div>
            <span className="text-emerald-400 text-sm tracking-[0.3em] uppercase">Culture</span>
            <h2 className={`text-4xl font-light mt-4 leading-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Living traditions of<br/>Karnataka
            </h2>
            <p className={`mt-4 leading-relaxed text-sm ${
              isDarkMode ? "text-white/60" : "text-gray-600"
            }`}>
              From the elaborate puppetry of Togalu Gombeyata to the rhythmic 
              beats of Dollu Kunitha, Karnataka's cultural heritage is as diverse 
              as its landscapes, preserved through centuries of devotion.
            </p>
            
            {/* Stats with Animation */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: "50+", label: "Art forms" },
                { value: "100+", label: "Festivals" },
                { value: "2000+", label: "Years old" },
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-2xl text-emerald-400 font-light">{stat.value}</div>
                  <div className={`text-[10px] mt-1 transition-colors ${
                    isDarkMode 
                      ? "text-white/40 group-hover:text-white/60" 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Cultural Highlights */}
            <div className="mt-8 flex flex-wrap gap-1.5">
              {["Yakshagana", "Dollu Kunitha", "Bhoota Kola", "Kathakali", "Gamaka"].map((item, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-[10px] transition-all duration-300 cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/5 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400" 
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED ARTICLE ================= */}
      <section id="journal" className="max-w-7xl mx-auto px-6 pb-24">
        <div className={`relative rounded-2xl border overflow-hidden group transition-colors duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-br from-white/5 to-transparent border-white/10" 
            : "bg-white border-gray-200"
        }`}>
          {/* Animated Background */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${
            isDarkMode 
              ? "bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100" 
              : "bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100"
          }`}></div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center p-8 relative z-10">
            <div>
              <span className="text-emerald-400 text-xs tracking-[0.3em] uppercase">Journal</span>
              <h3 className={`text-2xl font-light mt-2 leading-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                The coffee estates of Chikmagalur
              </h3>
              <p className={`mt-3 text-sm leading-relaxed ${
                isDarkMode ? "text-white/60" : "text-gray-600"
              }`}>
                Wake up to the aroma of freshly brewed coffee in the misty hills 
                of Chikmagalur, where every plantation tells a story of legacy, 
                passion, and the perfect cup.
              </p>
              
              <div className="mt-6 flex items-center gap-4">
                <button className="px-5 py-2 bg-emerald-500 rounded-full text-xs font-medium hover:bg-emerald-600 transition-all duration-300">
                  Read the story
                </button>
                <span className={`text-[10px] ${
                  isDarkMode ? "text-white/40" : "text-gray-400"
                }`}>5 min read</span>
              </div>
            </div>
            
            <div className="relative h-48 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/images/coffee-estate.jpeg"
                alt="Coffee Estate"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      {/* ================= PREMIUM FOOTER ================= */}
<footer className={`border-t transition-colors duration-500 ${
  isDarkMode ? "border-white/10 bg-black/50" : "border-gray-200 bg-white"
} backdrop-blur-sm`}>
  <div className="max-w-7xl mx-auto px-6 py-12">
    {/* ... existing footer content ... */}

    {/* Social Links */}
    <div className={`mt-6 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
      isDarkMode ? "border-white/10" : "border-gray-200"
    }`}>
      <p className={`text-[10px] ${
        isDarkMode ? "text-white/40" : "text-gray-400"
      }`}>
        © 2025 Samskruthi Sahaachari — Cultural travel experiences
      </p>
      <div className="flex gap-4 items-center">
        {["Twitter", "Instagram", "Facebook", "YouTube"].map((social, index) => (
          <a
            key={index}
            href="#"
            className={`text-[10px] transition-colors ${
              isDarkMode ? "text-white/40 hover:text-emerald-400" : "text-gray-400 hover:text-emerald-500"
            }`}
          >
            {social}
          </a>
        ))}
        {/* Add Admin Login Link */}
        <Link 
          href="/admin/login"
          className={`text-[8px] px-2 py-1 rounded-full border transition-colors ${
            isDarkMode 
              ? "border-white/10 text-white/30 hover:text-white/60 hover:border-white/20" 
              : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          Admin
        </Link>
      </div>
    </div>
  </div>
</footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .rotate-y-2 {
          transform: rotateY(2deg);
        }
        
        .group:hover .rotate-y-2 {
          transform: rotateY(0deg);
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}