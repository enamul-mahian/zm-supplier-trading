import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Facebook, MapPin, Phone, Mail, Clock, ArrowUp } from 'lucide-react';
import { BRAND_INFO } from '../../shared/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const Footer: React.FC = () => {
  const [footerSettings, setFooterSettings] = useState({
    email: BRAND_INFO.email,
    phone: BRAND_INFO.phone,
    address: BRAND_INFO.address,
    workingHours: BRAND_INFO.workingHours,
    logoUrl: null as string | null,
    socials: BRAND_INFO.socials
  });

  // ফায়ারস্টোর থেকে ফুটার সেটিংস লোড করা
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFooterSettings({
            email: data.contactInfo?.email || BRAND_INFO.email,
            phone: data.contactInfo?.phone || BRAND_INFO.phone,
            address: data.contactInfo?.address || BRAND_INFO.address,
            workingHours: data.contactInfo?.workingHours || BRAND_INFO.workingHours,
            logoUrl: data.brandAssets?.logo?.secureUrl || null,
            socials: data.socialLinks || BRAND_INFO.socials
          });
        }
      } catch (error) {
        console.error('[Footer Fetch Settings Error]:', error);
      }
    };
    fetchFooterSettings();
  }, []);

  // ব্যাক-টু-টপ (Back to Top) স্মুথ স্ক্রলিং হেল্পার
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-white border-t border-brand-secondary-dark pt-16 pb-6 relative">
      
      {/* ১. ফুটার মেইন গ্রিড কন্টেইনার */}
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-brand-primary-dark">
        
        {/* কলাম ১: ব্র্যান্ড ওভারভিউ */}
        <div className="lg:col-span-4 flex flex-col text-left">
          <Link to="/" className="flex items-center space-x-2.5 mb-5 rounded-md focus-visible:ring-2 focus-visible:ring-brand-accent">
            {footerSettings.logoUrl ? (
              <img src={footerSettings.logoUrl} alt="Footer Logo" className="h-12 w-auto object-contain brightness-0 invert" />
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary text-brand-accent font-heading font-extrabold text-xl border border-brand-primary-light">
                  ZS
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-base tracking-tight leading-none text-brand-accent uppercase">ZM</span>
                  <span className="font-heading text-[10px] font-bold tracking-widest text-brand-accent-pale leading-none mt-1 uppercase">Supplier & Trading</span>
                </div>
              </>
            )}
          </Link>
          <p className="text-sm text-brand-accent-pale leading-relaxed mb-6">
            ZM Supplier & Trading is a premium UK-standard B2B partner specialised in sourcing, wholesale product supply, packaging customisation, and global trade coordination.
          </p>
          
          {/* সোশ্যাল প্রোফাইল লিঙ্কসমূহ */}
          <div className="flex space-x-4">
            {footerSettings.socials.linkedin && (
              <a href={footerSettings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {footerSettings.socials.twitter && (
              <a href={footerSettings.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {footerSettings.socials.facebook && (
              <a href={footerSettings.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* কলাম ২: কুইক কোম্পানি লিঙ্কসমূহ */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">Company</h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/" className="text-brand-accent-pale hover:text-brand-accent">Home</Link>
            <Link to="/about" className="text-brand-accent-pale hover:text-brand-accent">About Us</Link>
            <Link to="/why-choose-us" className="text-brand-accent-pale hover:text-brand-accent">Why Choose Us</Link>
            <Link to="/team" className="text-brand-accent-pale hover:text-brand-accent">Management</Link>
            <Link to="/insights" className="text-brand-accent-pale hover:text-brand-accent">Insights</Link>
          </nav>
        </div>

        {/* কলাম ৩: কর্পোরেট সার্ভিসেস */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">Services</h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/services" className="text-brand-accent-pale hover:text-brand-accent">All Services</Link>
            <Link to="/services/product-sourcing" className="text-brand-accent-pale hover:text-brand-accent">Product Sourcing</Link>
            <Link to="/services/wholesale-supply" className="text-brand-accent-pale hover:text-brand-accent">Wholesale Supply</Link>
            <Link to="/services/private-label-support" className="text-brand-accent-pale hover:text-brand-accent">Private Label</Link>
            <Link to="/services/logistics-planning" className="text-brand-accent-pale hover:text-brand-accent">Logistics Planning</Link>
          </nav>
        </div>

        {/* কলাম ৪: প্রোডাক্ট ক্যাটালগ */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">Products</h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/products" className="text-brand-accent-pale hover:text-brand-accent">All Products</Link>
            <Link to="/categories/packaged-foods" className="text-brand-accent-pale hover:text-brand-accent">Packaged Foods</Link>
            <Link to="/categories/beverages" className="text-brand-accent-pale hover:text-brand-accent">Beverages</Link>
            <Link to="/categories/dry-goods" className="text-brand-accent-pale hover:text-brand-accent">Dry Goods</Link>
            <Link to="/categories/hospitality-supplies" className="text-brand-accent-pale hover:text-brand-accent">Hospitality</Link>
          </nav>
        </div>

        {/* কলাম ৫: অফিসিয়াল যোগাযোগের তথ্য */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">Contact</h3>
          <div className="flex flex-col space-y-4 text-xs font-medium text-brand-accent-pale">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2.5 text-brand-accent shrink-0 mt-0.5" />
              <span>{footerSettings.address}</span>
            </div>
            <a href={`tel:${footerSettings.phone}`} className="flex items-center hover:text-brand-accent transition-colors">
              <Phone className="w-4 h-4 mr-2.5 text-brand-accent shrink-0" />
              <span>{footerSettings.phone}</span>
            </a>
            <a href={`mailto:${footerSettings.email}`} className="flex items-center hover:text-brand-accent transition-colors">
              <Mail className="w-4 h-4 mr-2.5 text-brand-accent shrink-0" />
              <span>{footerSettings.email}</span>
            </a>
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2.5 text-brand-accent shrink-0 mt-0.5" />
              <span>{footerSettings.workingHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ২. ফুটার সাব-বার */}
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-brand-accent-pale gap-4">
        <div>&copy; {currentYear} {BRAND_INFO.legalName}. All rights reserved. Registered in the United Kingdom.</div>
        <nav className="flex flex-wrap justify-center gap-6">
          <Link to="/privacy-policy" className="hover:text-brand-accent">Privacy Policy</Link>
          <Link to="/terms-and-conditions" className="hover:text-brand-accent">Terms & Conditions</Link>
          <Link to="/refund-policy" className="hover:text-brand-accent">Refund Policy</Link>
          <Link to="/cookie-policy" className="hover:text-brand-accent">Cookie Policy</Link>
        </nav>
      </div>

      <button onClick={scrollToTop} className="absolute right-6 bottom-6 lg:right-10 lg:bottom-10 w-10 h-10 bg-brand-primary text-brand-accent rounded-lg border border-brand-primary-light flex items-center justify-center shadow-premium hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300 group">
        <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
      </button>
    </footer>
  );
};