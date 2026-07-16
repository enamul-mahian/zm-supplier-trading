import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Package, Home, PhoneCall, Sparkles } from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';

// কাস্টম লাইটওয়েট বিটুবি ভেক্টর ইলাস্ট্রেশন (Vite ও Lighthouse ফ্রেন্ডলি - zero CLS)
const NotFoundIllustration: React.FC = () => (
  <svg 
    className="w-40 h-40 sm:w-48 sm:h-48 mx-auto text-brand-primary mb-8 select-none" 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* বিটুবি শিপিং ক্রেইট / বক্স */}
    <rect x="40" y="60" width="120" height="100" rx="12" stroke="currentColor" strokeWidth="6" />
    <line x1="40" y1="110" x2="160" y2="110" stroke="currentColor" strokeWidth="6" />
    <line x1="100" y1="60" x2="100" y2="160" stroke="currentColor" strokeWidth="6" />
    
    {/* গোল্ডেন টেপ ও সিকিউরিটি মার্ক */}
    <rect x="75" y="45" width="50" height="20" rx="4" fill="#D4AF37" />
    
    {/* অনুসন্ধানকারী ম্যাগনিফাইং গ্লাস (গোল্ডেন কালার থিমে) */}
    <circle cx="140" cy="140" r="18" stroke="#D4AF37" strokeWidth="5" fill="#FFFFFF" />
    <line x1="152.5" y1="152.5" x2="172" y2="172" stroke="#D4AF37" strokeWidth="5" strokeLinecap="round" />
    
    {/* প্রশ্নবোধক চিহ্ন (কোথায় পণ্য বা পেজটি হারিয়ে গিয়েছে) */}
    <path d="M92 92 C92 84, 108 84, 108 92 C108 97, 100 100, 100 106" stroke="#D4AF37" strokeWidth="5" strokeLinecap="round" />
    <circle cx="100" cy="118" r="3" fill="#D4AF37" />
  </svg>
);

// পেজের নাম দেওয়া হলো: NotFoundPage
export const NotFoundPage: React.FC = () => {
  return (
    <>
      {/* গ্লোবাল ৪MD৪ এসইও সেটআপ */}
      <Helmet>
        <title>404 - Page Not Found | {BRAND_INFO.name}</title>
        <meta name="description" content="The requested B2B resource is unavailable. Please return to safety or contact ZM Supplier & Trading trade coordination desk." />
        <meta name="robots" content="noindex, nofollow" /> {/* ৪MD৪ পেজ ইনডেক্সিং কঠোরভাবে বন্ধ থাকবে - Part 07, Rule 11 */}
      </Helmet>

      {/* ৪MD৪ রেসপন্সিভ প্যানেল কন্টেইনার (ডিজাইন টোকেন ও কালার থিম সিঙ্ক সহ) */}
      <section className="py-20 md:py-28 bg-brand-bg text-center flex items-center justify-center min-h-[70vh] relative overflow-hidden text-left">
        {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার শ্যাডো */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand-accent/5 blur-[90px] pointer-events-none" />

        <div className="premium-container px-4 max-w-lg mx-auto flex flex-col items-center relative z-10 text-center">
          
          {/* ১. কাস্টম বিটুবি ইলাস্ট্রেশন */}
          <NotFoundIllustration />

          {/* ২. প্রিমিয়াম আইব্রো লেবেল */}
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-flex items-center gap-1.5 select-none">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            B2B Sourcing Safety
          </span>

          {/* ৩. নট ফাউন্ড হেডিংস ও গাইডলাইন টেক্সট (Part 04, Section 21) */}
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-3">
            404 - Page Not Found
          </h1>
          <p className="text-sm text-brand-neutral-muted leading-relaxed mb-8 max-w-md">
            The requested B2B resource or sourcing directory is currently unavailable, relocated, or has been permanently archived.
          </p>

          {/* ৪. রেসপন্সিভ অ্যাকশন বাটন গ্রুপ (বায়ারকে পুনরায় মূল প্রবাহে ফিরিয়ে আনার জন্য - Part 04, Section 21) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            {/* প্রাইমারি অ্যাকশন: হোম পেজ ফিরতি বাটন */}
            <Button to="/" variant="primary" size="md" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>

            {/* সেকেন্ডারি অ্যাকশন ১: প্রোডাক্ট ক্যাটালগ লিঙ্ক */}
            <Button to="/products" variant="outline" size="md" className="w-full sm:w-auto">
              <Package className="w-4 h-4 mr-2" />
              Browse Products
            </Button>

            {/* সেকেন্ডারি অ্যাকশন ২: যোগাযোগের জন্য কন্টাক্ট লিঙ্ক */}
            <Button to="/contact" variant="ghost" size="md" className="w-full sm:w-auto text-brand-neutral-muted">
              <PhoneCall className="w-4 h-4 mr-2 text-brand-primary" />
              Contact Us
            </Button>
          </div>

        </div>
      </section>
    </>
  );
};