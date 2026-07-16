import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BRAND_INFO } from '../shared/constants';
import { Sparkles, FileText, Lock, Scale, RefreshCw, Cookie, ShieldAlert } from 'lucide-react';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

// ফায়ারস্টোর ডেটাবেস অফলাইন বা কানেকশন পেন্ডিং থাকলে ৪টি লিগ্যাল পেজের জন্য ইউকে স্ট্যান্ডার্ড ড্রাফট পলিসি
const FALLBACK_LEGAL_PAGES: Record<string, { title: string; content: string; iconName: string }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    iconName: 'Lock',
    content: `
      <h2>1. Information We Collect</h2>
      <p>We value your business privacy. ZM Supplier & Trading Ltd collects and processes commercial data necessary to coordinate product sourcing, wholesale supply orders, and international shipping logistics. This includes company names, registration details, business contact names, email addresses, phone numbers, and destination delivery ports.</p>
      
      <h2>2. How We Use Your Data</h2>
      <p>Collected information is used strictly to prepare proforma invoices, coordinate specifications with audited manufacturer networks, and plan cargo freight. We do not sell, rent, or distribute business or personal data to unauthorised third parties.</p>
      
      <h2>3. Data Security & Storage</h2>
      <p>All data is processed securely through compliant cloud databases and is kept confidential. We maintain structured information practices to protect commercial files and attached sourcing specifications from unauthorised access.</p>
    `
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    iconName: 'Scale',
    content: `
      <h2>1. Scope of B2B Commercial Trade</h2>
      <p>These terms govern all B2B sourcing inquiries, trade manifests, proforma invoicing, and commercial quotations managed by ZM Supplier & Trading Ltd. By submitting a quotation request, you confirm you are acting as an authorised representative of a registered commercial entity.</p>
      
      <h2>2. Minimum Order Quantities (MOQ) & Sourcing</h2>
      <p>All product supplies are subject to negotiated Minimum Order Quantities, specific packaging formats, and logistical transits. Wholesale pricing and shipping timelines depend on volume specifications and applicable cross-border regulations.</p>
      
      <h2>3. Quotations & Market Pricing</h2>
      <p>All business quotations provided are subject to change based on freight cost fluctuations, raw material specs, and global market parameters. Pricing is formally locked only upon signing the definitive commercial B2B contract.</p>
    `
  },
  'refund-policy': {
    title: 'Refund & Return Policy',
    iconName: 'RefreshCw',
    content: `
      <h2>1. B2B Contractual Commitments</h2>
      <p>ZM Supplier & Trading Ltd operates strictly on a B2B (business-to-business) contractual basis. Unlike retail consumer stores, our wholesale supplies, tailored packaging, and custom private-label cargos are manufactured and sourced based on bespoke agreements.</p>
      
      <h2>2. Return & Adjustment Framework</h2>
      <p>Standard retail return, cancellation, or refund policies do not apply to our commercial shipments. In the event of a specification discrepancy, quality concern, or shipment delay, all adjustments, claims, and resolutions are governed strictly by the specific terms defined in the signed B2B contract.</p>
    `
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    iconName: 'Cookie',
    content: `
      <h2>1. Essential Session Cookies</h2>
      <p>We use essential technical cookies to manage active sessions, preserve items inside your B2B quotation basket, and secure our contact forms from spam. These cookies do not store personal details.</p>
      
      <h2>2. Analytics & Sourcing Performance</h2>
      <p>With your browser consent, we may use basic analytics cookies to measure traffic and evaluate sourcing page performance, helping us optimise our digital catalogue experience. No sensitive business data is ever shared.</p>
    `
  }
};

export const LegalPage: React.FC = () => {
  const location = useLocation();
  // ইউআরএল পাথ থেকে স্লাগ আলাদা করা (যেমন: "/privacy-policy" -> "privacy-policy")
  const slug = location.pathname.substring(1);

  // স্টেট ম্যানেজমেন্ট
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // আইকন ডিটেক্টর হেল্পার (Lucide icons only)
  const getLegalIcon = (name: string) => {
    const style = "w-6 h-6 text-brand-primary";
    switch (name) {
      case 'Lock': return <Lock className={style} />;
      case 'Scale': return <Scale className={style} />;
      case 'RefreshCw': return <RefreshCw className={style} />;
      case 'Cookie': return <Cookie className={style} />;
      default: return <FileText className={style} />;
    }
  };

  // ফায়ারস্টোর থেকে ডায়নামিক লিগ্যাল পেজ লোড লাইফ সাইকেল
  useEffect(() => {
    const loadLegalPage = async () => {
      try {
        setLoading(true);
        // ফায়ারস্টোরের 'legalPages' কালেকশন থেকে স্লাগ আইডি অনুযায়ী ডকুমেন্ট ফেচ করা
        const docRef = doc(db, 'legalPages', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().status === 'published') {
          const data = docSnap.data();
          setTitle(data.title || '');
          setContent(data.content || '');
        } else {
          // ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ডাইনামিক ফলব্যাক ডেটা লোড
          const fallback = FALLBACK_LEGAL_PAGES[slug] || FALLBACK_LEGAL_PAGES['privacy-policy'];
          setTitle(fallback.title);
          setContent(fallback.content);
        }
      } catch (error) {
        console.error('[Legal Page Load Error]:', error);
        const fallback = FALLBACK_LEGAL_PAGES[slug] || FALLBACK_LEGAL_PAGES['privacy-policy'];
        setTitle(fallback.title);
        setContent(fallback.content);
      } finally {
        setLoading(false);
      }
    };

    loadLegalPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="premium-container px-4 py-24 animate-pulse">
        <div className="h-[200px] bg-brand-neutral-gray rounded-card mb-8" />
        <div className="space-y-4">
          <div className="h-6 bg-brand-neutral-gray rounded w-full" />
          <div className="h-6 bg-brand-neutral-gray rounded w-5/6" />
        </div>
      </div>
    );
  }

  const activeIconName = FALLBACK_LEGAL_PAGES[slug]?.iconName || 'FileText';

  return (
    <>
      {/* ডায়নামিক লিগ্যাল এসইও সেটআপ */}
      <Helmet>
        <title>{title} | {BRAND_INFO.name}</title>
        <meta name="description" content={`Read the official ${title} of ZM Supplier & Trading Ltd, registered and structured under United Kingdom trade regulations.`} />
        <link rel="canonical" href={`https://zmsupplier.co.uk/${slug}`} />
        <meta name="robots" content="noindex, follow" /> {/* সার্চ ইঞ্জিনে ক্রল হলেও লিগ্যাল পেজ ডিরেক্টরি ইনডেক্সিং কনট্রোল */}
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ইনার-পেজ হিরো ব্যানার */}
        <section className="bg-brand-secondary text-white py-12 text-left relative overflow-hidden border-b border-brand-secondary-dark">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
          
          <div className="premium-container relative z-10">
            <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
              <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-accent">Legal</span>
              <span>/</span>
              <span className="text-brand-accent-pale">{title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-3">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Official corporate and trade compliance policy for {BRAND_INFO.legalName}.
            </p>
          </div>
        </section>

        {/* মেইন পলিসি কন্টেন্ট এরিয়া (React Quill / Rich Text HTML রেন্ডারিং) */}
        <section className="py-16 bg-white text-left relative overflow-hidden">
          <div className="premium-container px-4 max-w-content mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* বাম পাশে মেইন টেক্সট বডি */}
              <div className="lg:col-span-8 flex flex-col">
                
                {/* আইনি সতর্কতা নোটিশ (UK Legal Review Disclaimer - Part 04, Section 19) */}
                <div className="flex items-start gap-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10 mb-8">
                  <ShieldAlert className="w-5.5 h-5.5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-red-700 leading-relaxed">
                    Disclaimer: This document is a draft prepared for {BRAND_INFO.legalName} and is for informational purposes only. It does not constitute formal legal advice. Businesses should have their policies reviewed by an authorised solicitor.
                  </span>
                </div>

                {/* রিচ টেক্সট এইচটিএমএল আউটপুট রেন্ডারার */}
                <div 
                  className="prose prose-sm sm:prose max-w-none text-brand-neutral-muted leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>

              {/* ডান পাশে পলিসি টাইটেল ইন্ডিকেটর উইন্ডো */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-4 border border-brand-primary/5">
                    {getLegalIcon(activeIconName)}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-2">
                    Document Integrity
                  </h3>
                  <p className="text-xs text-brand-neutral-muted leading-relaxed">
                    This compliance document is systematically structured to satisfy UK corporate trade, wholesale order coordination, and safe data handling guidelines.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};