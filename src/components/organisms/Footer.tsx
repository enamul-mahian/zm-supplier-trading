import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Facebook, MapPin, Phone, Mail, Clock, ArrowUp } from 'lucide-react';
import { BRAND_INFO } from '../../shared/constants';

export const Footer: React.FC = () => {
  // ব্যাক-টু-টপ (Back to Top) স্মুথ স্ক্রলিং হেল্পার
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-white border-t border-brand-secondary-dark pt-16 pb-6 relative">
      
      {/* ১. ফুটার মেইন গ্রিড কন্টেইনার (৫-কলাম বিশিষ্ট B2B লেআউট - Part 06, Rule 08) */}
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-brand-primary-dark">
        
        {/* কলাম ১: ব্র্যান্ড ওভারভিউ (৪ কলাম) */}
        <div className="lg:col-span-4 flex flex-col text-left">
          <Link to="/" className="flex items-center space-x-2.5 mb-5 rounded-md focus-visible:ring-2 focus-visible:ring-brand-accent">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary text-brand-accent font-heading font-extrabold text-xl border border-brand-primary-light">
              ZS
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base tracking-tight leading-none text-brand-accent uppercase">
                ZM
              </span>
              <span className="font-heading text-[10px] font-bold tracking-widest text-brand-accent-pale leading-none mt-1 uppercase">
                Supplier & Trading
              </span>
            </div>
          </Link>
          <p className="text-sm text-brand-accent-pale leading-relaxed mb-6">
            ZM Supplier & Trading is a premium UK-standard B2B partner specialised in sourcing, wholesale product supply, packaging customisation, and global trade coordination.
          </p>
          {/* সোশ্যাল প্রোফাইল লিঙ্কসমূহ (নিরাপদ ও এক্সটার্নাল ওপেনিং) */}
          <div className="flex space-x-4">
            {BRAND_INFO.socials.linkedin && (
              <a 
                href={BRAND_INFO.socials.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {BRAND_INFO.socials.twitter && (
              <a 
                href={BRAND_INFO.socials.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300"
                aria-label="Twitter Profile"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {BRAND_INFO.socials.facebook && (
              <a 
                href={BRAND_INFO.socials.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-accent-pale hover:bg-brand-accent hover:text-brand-neutral-charcoal transition-all duration-300"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* কলাম ২: কুইক কোম্পানি লিঙ্কসমূহ (২ কলাম) */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">
            Company
          </h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Home</Link>
            <Link to="/about" className="text-brand-accent-pale hover:text-brand-accent transition-colors">About Us</Link>
            <Link to="/why-choose-us" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Why Choose Us</Link>
            <Link to="/team" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Management</Link>
            <Link to="/insights" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Insights</Link>
          </nav>
        </div>

        {/* কলাম ৩: কর্পোরেট সার্ভিসেস (২ কলাম) */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">
            Services
          </h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/services" className="text-brand-accent-pale hover:text-brand-accent transition-colors">All Services</Link>
            <Link to="/services/product-sourcing" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Product Sourcing</Link>
            <Link to="/services/wholesale-supply" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Wholesale Supply</Link>
            <Link to="/services/private-label-support" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Private Label</Link>
            <Link to="/services/logistics-planning" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Logistics Planning</Link>
          </nav>
        </div>

        {/* কলাম ৪: প্রোডাক্ট ক্যাটালগ (২ কলাম) */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">
            Products
          </h3>
          <nav className="flex flex-col space-y-3.5 text-sm font-medium">
            <Link to="/products" className="text-brand-accent-pale hover:text-brand-accent transition-colors">All Products</Link>
            <Link to="/categories/packaged-foods" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Packaged Foods</Link>
            <Link to="/categories/beverages" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Beverages</Link>
            <Link to="/categories/dry-goods" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Dry Goods</Link>
            <Link to="/categories/hospitality-supplies" className="text-brand-accent-pale hover:text-brand-accent transition-colors">Hospitality</Link>
          </nav>
        </div>

        {/* কলাম ৫: অফিসিয়াল যোগাযোগের তথ্য (২ কলাম) */}
        <div className="lg:col-span-2 flex flex-col text-left">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-brand-accent mb-5">
            Contact
          </h3>
          <div className="flex flex-col space-y-4 text-xs font-medium text-brand-accent-pale">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2.5 text-brand-accent shrink-0 mt-0.5" />
              <span>{BRAND_INFO.address}</span>
            </div>
            <a href={`tel:${BRAND_INFO.phone}`} className="flex items-center hover:text-brand-accent transition-colors">
              <Phone className="w-4 h-4 mr-2.5 text-brand-accent shrink-0" />
              <span>{BRAND_INFO.phone}</span>
            </a>
            <a href={`mailto:${BRAND_INFO.email}`} className="flex items-center hover:text-brand-accent transition-colors">
              <Mail className="w-4 h-4 mr-2.5 text-brand-accent shrink-0" />
              <span>{BRAND_INFO.email}</span>
            </a>
            <div className="flex items-start">
              <Clock className="w-4 h-4 mr-2.5 text-brand-accent shrink-0 mt-0.5" />
              <span>{BRAND_INFO.workingHours}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ২. ফুটার সাব-বার বা নিচের প্যানেল (কপিরাইট এবং ডায়নামিক লিগ্যাল পেজ লিঙ্কসমূহ) */}
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-brand-accent-pale gap-4">
        <div>
          &copy; {currentYear} {BRAND_INFO.legalName}. All rights reserved. Registered in the United Kingdom.
        </div>
        {/* লিগ্যাল ডায়নামিক পলিসি লিঙ্কসমূহ */}
        <nav className="flex flex-wrap justify-center gap-6">
          <Link to="/privacy-policy" className="hover:text-brand-accent transition-colors">Privacy Policy</Link>
          <Link to="/terms-and-conditions" className="hover:text-brand-accent transition-colors">Terms & Conditions</Link>
          <Link to="/refund-policy" className="hover:text-brand-accent transition-colors">Refund Policy</Link>
          <Link to="/cookie-policy" className="hover:text-brand-accent transition-colors">Cookie Policy</Link>
        </nav>
      </div>

      {/* ৩. ব্যাক-টু-টপ (Back to Top) ফ্লোটিং বাটন কন্ট্রোল */}
      <button
        onClick={scrollToTop}
        className="absolute right-6 bottom-6 lg:right-10 lg:bottom-10 w-10 h-10 bg-brand-primary text-brand-accent rounded-lg border border-brand-primary-light flex items-center justify-center shadow-premium hover:bg-brand-accent hover:text-brand-neutral-charcoal hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
        aria-label="Scroll back to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
      </button>
    </footer>
  );
};