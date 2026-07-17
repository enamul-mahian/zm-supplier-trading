import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../atoms/Button';
import { BRAND_INFO } from '../../shared/constants';
import { useQuoteStore } from '../../hooks/useQuoteStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// ১. গ্লোবাল ইউটিলিটি টপ-বার (ডেস্কটপে দৃশ্যমান, মোবাইলে হিডেন থাকবে - Part 03, Section 03)
interface TopBarProps {
  settings: {
    email: string;
    phone: string;
    workingHours: string;
  };
}

const TopBar: React.FC<TopBarProps> = ({ settings }) => {
  return (
    <div className="hidden lg:block bg-brand-secondary text-white border-b border-brand-secondary-dark py-2 text-xs font-medium">
      <div className="max-w-container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-brand-accent-light font-semibold">
            UK Standard Sourcing & Supply
          </span>
          <a href={`mailto:${settings.email}`} className="flex items-center hover:text-brand-accent transition-colors">
            <Mail className="w-3.5 h-3.5 mr-2 text-brand-accent" />
            {settings.email}
          </a>
          <a href={`tel:${settings.phone}`} className="flex items-center hover:text-brand-accent transition-colors">
            <Phone className="w-3.5 h-3.5 mr-2 text-brand-accent" />
            {settings.phone}
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-brand-accent-pale">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {settings.workingHours}
          </span>
          <span className="text-brand-accent font-semibold">B2B Enquiries Welcome</span>
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // ডায়নামিক সেটিংস স্টেট (ফায়ারস্টোর থেকে আসার আগে constants এর ডেটা ফলব্যাক হিসেবে থাকবে)
  const [settings, setSettings] = useState({
    email: BRAND_INFO.email,
    phone: BRAND_INFO.phone,
    workingHours: BRAND_INFO.workingHours,
    logoUrl: '' as string | null | undefined,
  });

  // Zustand স্টোর থেকে কারেন্ট কোটেশন আইটেম সংখ্যা ট্র্যাক করা
  const productCount = useQuoteStore((state) => state.productSelections.length);
  const serviceCount = useQuoteStore((state) => state.serviceSelections.length);
  const totalSelections = productCount + serviceCount;

  // ফায়ারস্টোর থেকে সাইট সেটিংস লোড করা
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            email: data.contactInfo?.email || BRAND_INFO.email,
            phone: data.contactInfo?.phone || BRAND_INFO.phone,
            workingHours: data.contactInfo?.workingHours || BRAND_INFO.workingHours,
            logoUrl: data.brandAssets?.logo?.secureUrl || null,
          });
        }
      } catch (error) {
        console.error('[Header Fetch Settings Error]:', error);
      }
    };
    fetchGlobalSettings();
  }, []);

  // স্ক্রল ডিটেকশন (স্টিকি শ্যাডো ও ব্যাকগ্রাউন্ড ট্রানজিশনের জন্য)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // মোবাইল ড্রয়ার খোলার সময় বডি স্ক্রলিং লক করার মেকানিজম (A11y স্ট্যান্ডার্ড)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // পেজ পরিবর্তনের সাথে সাথে মোবাইল ড্রয়ার স্বয়ংক্রিয়ভাবে বন্ধ করা
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // অ্যাক্টিভ রাউট চেনার হেল্পার
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Products', path: '/products' },
    { label: 'Insights', path: '/insights' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      <TopBar settings={settings} />
      
      {/* প্রধান হেডার কন্টেইনার (স্টিকি ও গ্লাস মরফিজম ট্রানজিশন) */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-header border-b border-brand-neutral-border py-3' 
          : 'bg-white py-4 border-b border-brand-neutral-border'
      }`}>
        <div className="max-w-container mx-auto px-4 md:px-6 flex justify-between items-center">
          
          {/* ১. স্টাইলাইজড ডায়নামিক বিটুবি লোগো সেটআপ */}
          <Link to="/" className="flex items-center p-1 rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary max-h-12">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="ZM Supplier & Trading Logo" 
                className="h-9 sm:h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary text-brand-accent font-heading font-extrabold text-xl shadow-soft border border-brand-primary-light">
                  ZS
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-heading font-extrabold text-base tracking-tight leading-none text-brand-primary uppercase">
                    ZM
                  </span>
                  <span className="font-heading text-[10px] font-bold tracking-widest text-brand-neutral-muted leading-none mt-1 uppercase">
                    Supplier & Trading
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* ২. ডেস্কটপ নেভিগেশন লিঙ্কসমূহ (Medium to Large Screens) */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors relative py-1 ${
                  isActive(link.path)
                    ? 'text-brand-primary'
                    : 'text-brand-neutral-dark hover:text-brand-primary'
                }`}
              >
                {link.label}
                {/* অ্যাক্টিভ লিঙ্কের নিচে গোল্ডেন ডট ইন্ডিকেটর */}
                {isActive(link.path) && (
                  <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* ৩. ডেস্কটপ সিটিএ অ্যাকশন বাটন (বাস্কেট লাইভ কাউন্টার সহ) */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button to="/request-quote" variant="primary" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Request a Quote
              {totalSelections > 0 && (
                <span className="ml-2 bg-brand-accent text-brand-neutral-charcoal text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-soft animate-scale-in">
                  {totalSelections}
                </span>
              )}
            </Button>
          </div>

          {/* ৪. মোবাইল রেসপন্সিভ কন্ট্রোলস (ট্যাবলেট এবং মোবাইল ডিভাইসের জন্য) */}
          <div className="flex lg:hidden items-center space-x-3">
            {/* মোবাইল কোটেশন আইকন ইন্ডিকেটর */}
            <Link 
              to="/request-quote" 
              className="relative p-2 text-brand-neutral-dark hover:text-brand-primary rounded-full transition-colors"
              aria-label="View Quotation Basket"
            >
              <FileText className="w-5.5 h-5.5" />
              {totalSelections > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-accent text-brand-neutral-charcoal text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-soft">
                  {totalSelections}
                </span>
              )}
            </Link>

            {/* mobile drawer control button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-neutral-dark hover:text-brand-primary rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ৫. রেসপন্সিভ মোবাইল নেভিগেশন ড্রয়ার (Backdrop blurring + Body scroll locking) */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* dark backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* drawer panel (slide in from right) */}
        <aside className={`absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-modal flex flex-col p-6 transition-transform duration-300 safe-bottom ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* close and brand info */}
          <div className="flex justify-between items-center pb-6 border-b border-brand-neutral-border">
            <span className="font-heading font-extrabold text-brand-primary text-base">
              Navigation Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-brand-neutral-muted hover:text-brand-primary rounded-full transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* navigation links */}
          <nav className="flex flex-col space-y-4 py-8 flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-semibold tracking-wide py-2 px-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-brand-primary/5 text-brand-primary'
                    : 'text-brand-neutral-dark hover:bg-brand-neutral-gray'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* mobile quota button */}
          <div className="pt-6 border-t border-brand-neutral-border pb-safe">
            <Button to="/request-quote" variant="primary" fullWidth size="md">
              <FileText className="w-5 h-5 mr-2" />
              Request a Quote
              {totalSelections > 0 && (
                <span className="ml-2 bg-brand-accent text-brand-neutral-charcoal text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-soft">
                  {totalSelections}
                </span>
              )}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
};