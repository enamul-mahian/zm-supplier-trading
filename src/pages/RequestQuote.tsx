import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  AlertCircle, 
  Building, 
  User, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  Package
} from 'lucide-react';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { useQuoteStore } from '../hooks/useQuoteStore';
import { submitQuoteRequest, fetchProductBySlug } from '../services/firestore';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection'; // ইমপোর্ট যুক্ত করা হলো (এরর ফিক্সড)
import toast from 'react-hot-toast';

export const RequestQuote: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlProductSlug = searchParams.get('product');

  // Zustand স্টোর ইন্টিগ্রেশন
  const productSelections = useQuoteStore((state) => state.productSelections);
  const serviceSelections = useQuoteStore((state) => state.serviceSelections);
  const clearQuoteList = useQuoteStore((state) => state.clearQuoteList);
  const removeProductSelection = useQuoteStore((state) => state.removeProductSelection);

  // স্টেট ম্যানেজমেন্ট
  const [loading, setLoading] = useState(false);
  const [urlProduct, setUrlProduct] = useState<any | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // ফর্ম ফিল্ডস স্টেট (Part 04, Section 17)
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [businessType, setBusinessType] = useState('Wholesaler');

  // প্রোডাক্টস রিকোয়ারমেন্ট স্টেট
  const [requiredQuantity, setRequiredQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('Cartons');
  const [destination, setDestination] = useState('');
  const [timeline, setTimeline] = useState('Within 1 Month');
  const [privateLabel, setPrivateLabel] = useState(false);
  const [message, setMessage] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // ফাইল আপলোড ও ক্লাউডিনারি প্রসেসিং (Part 07, Rule 61)
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // ইউআরএল কোয়েরি প্রোডাক্ট ফিল্টার লাইফ সাইকেল
  useEffect(() => {
    const resolveUrlProduct = async () => {
      if (!urlProductSlug) return;
      try {
        const prod = await fetchProductBySlug(urlProductSlug);
        if (prod) {
          setUrlProduct(prod);
        } else {
          // ডেটাবেস কানেকশন পেন্ডিং থাকলে constants ম্যাপ ফলব্যাক
          setUrlProduct({
            name: urlProductSlug.replace('-', ' ').toUpperCase(),
            code: 'ZST-Sourcing'
          });
        }
      } catch (error) {
        console.error('[RequestQuote UrlProduct Resolve Error]:', error);
      }
    };
    resolveUrlProduct();
  }, [urlProductSlug]);

  // ক্লাউডিনারি ফাইল আপলোড মেকানিজম (সুরক্ষিত স্যান্ডবক্স ও গিট-বান্ধব - Part 07, Rule 61)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // ফাইল ভ্যালিডেশন
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PNG, and JPEG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // সর্বোচ্চ ৫ এমবি ফাইল লিমিট
      toast.error('Maximum file size is 5MB.');
      return;
    }

    setUploadingFile(true);

    // টাইপস্ক্রিপ্ট টাইপ এরর ফিক্স করতে (import.meta as any) কাস্টিং করা হলো
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // যদি লোকাল ক্রেডেনশিয়াল সেটআপ না থাকে তবে রিয়েল-টাইম স্যান্ডবক্স সিমুলেশন রান হবে
    if (!cloudName || !preset) {
      setTimeout(() => {
        setAttachments((prev) => [
          ...prev,
          { name: file.name, url: `https://res.cloudinary.com/demo/image/upload/v12345678/${file.name}` }
        ]);
        setUploadingFile(false);
        toast.success(`File "${file.name}" uploaded successfully (Sandbox Mode).`);
      }, 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.secure_url) {
        setAttachments((prev) => [...prev, { name: file.name, url: data.secure_url }]);
        toast.success(`File "${file.name}" uploaded successfully.`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast.error('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success('Attachment removed.');
  };

  // কোটেশন সাবমিট হ্যান্ডলার (ফায়ারস্টোরে সেভ ও বাস্কেট ক্লিনিং)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentAccepted) {
      toast.error('Please accept the Privacy Policy to proceed.');
      return;
    }

    // বাস্কেটে কোনো প্রোডাক্ট নির্বাচন না থাকলে বা ইউআরএল প্রোডাক্ট মিসিং থাকলে সতর্কবার্তা
    const hasProducts = productSelections.length > 0 || urlProduct;
    if (!hasProducts && serviceSelections.length === 0) {
      toast.error('Your quotation basket is empty. Please select a product or service first.');
      return;
    }

    try {
      setLoading(true);

      // ১. প্রোডাক্ট কোটেশন সিলেকশন স্ন্যাপশট ম্যাপিং (Part 05D, Rule 21)
      const productsSnapshot = [...productSelections];
      if (urlProduct && productsSnapshot.length === 0) {
        productsSnapshot.push({
          productId: urlProduct.id || 'direct-url-id',
          productName: urlProduct.name,
          productCode: urlProduct.code || 'ZST-DIRECT',
          productSlug: urlProductSlug || '',
          productImageUrl: urlProduct.images?.[0] || null,
          variantId: null,
          variantName: null,
          variantSku: null,
          selectedAttributes: {},
          packagingOptionId: null,
          packagingName: null,
          minimumOrderQuantity: null,
          minimumOrderUnit: null,
          requestedQuantity: requiredQuantity ? parseInt(requiredQuantity, 10) : null,
          requestedQuantityUnit: quantityUnit,
          notes: message ? message : null
        });
      }

      // ২. বিটুবি কোটেশন ডেটা রিকোয়েস্ট অবজেক্ট
      const rawQuoteRequest: any = {
        enquiryType: urlProductSlug ? 'product' : 'general',
        companyName,
        contactName,
        businessEmail,
        phone: phone || null,
        country,
        businessType,
        productSelections: productsSnapshot,
        serviceSelections: [...serviceSelections],
        requiredQuantity: requiredQuantity ? parseInt(requiredQuantity, 10) : null,
        quantityUnit,
        packagingRequirement: null,
        destination: destination || null,
        requiredTimeline: timeline || null,
        privateLabelRequired: privateLabel,
        message,
        attachmentMediaIds: attachments.map(a => a.url),
        preferredContactMethod: 'Email',
        consentAccepted,
        marketingConsent: false,
        sourcePage: window.location.href,
        locale: 'en-GB'
      };

      const result = await submitQuoteRequest(rawQuoteRequest);

      if (result.success && result.referenceNumber) {
        setSubmittedRef(result.referenceNumber);
        clearQuoteList(); // বাস্কেট সফলভাবে খালি করা হলো (Zustand state clean)
        toast.success('Your quotation request has been submitted successfully.');
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Request a Quote | B2B Commercial Sourcing | {BRAND_INFO.name}</title>
        <meta name="description" content="Submit a professional B2B quotation or custom product sourcing request to ZM Supplier & Trading. Our trade coordinators will review your parameters." />
        <link rel="canonical" href="https://zmsupplier.co.uk/request-quote" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ইনার-পেজ হিরো ব্যানার */}
        <section className="bg-brand-secondary text-white py-12 text-left relative overflow-hidden border-b border-brand-secondary-dark">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
          <div className="premium-container relative z-10">
            <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
              <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-accent">Request Quote</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-3">
              Request a B2B Quotation
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Submit your required wholesale specs, quantities, and destination routes for a structured commercial proposal.
            </p>
          </div>
        </section>

        {/* মেইন ফর্ম উইন্ডো */}
        <section className="py-16 bg-white text-left relative min-h-[400px]">
          <div className="premium-container px-4 max-w-content mx-auto">
            
            <AnimatePresence mode="wait">
              {submittedRef ? (
                
                // ১. সফল কোটেশন সাবমিশনের পর স্ক্রিন
                <motion.div 
                  className="bg-brand-bg-alt border border-brand-neutral-border p-8 rounded-card text-center flex flex-col items-center max-w-lg mx-auto shadow-soft"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 bg-brand-primary/5 rounded-full border border-brand-primary/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl text-brand-neutral-charcoal mb-3">
                    Quotation Submitted Successfully
                  </h2>
                  <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                    Your request has been received. Our trade coordination desk will review your specifications and contact you shortly with a formal proposal.
                  </p>
                  
                  {/* ইউনিক কোটেশন রেফারেন্স বক্স */}
                  <div className="bg-brand-secondary text-brand-accent text-sm font-extrabold px-6 py-3 rounded-lg border border-brand-primary-light uppercase tracking-widest mb-8 select-all">
                    Reference: {submittedRef}
                  </div>

                  <div className="flex gap-4">
                    <Button to="/products" variant="primary">Browse Products</Button>
                    <Button to="/" variant="outline">Return Home</Button>
                  </div>
                </motion.div>
              ) : (
                
                // ২. মেইন কমার্শিয়াল বিটুবি কোটেশন রিকোয়েস্ট ফর্ম
                <motion.form 
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  
                  {/* বাম কলাম: ফর্ম ইনপুট গ্রিড (৭ কলাম ডেস্কটপে) */}
                  <div className="lg:col-span-8 flex flex-col space-y-6">
                    
                    {/* সেকশন ১: ব্যবসায়িক তথ্য (Business Info) */}
                    <div className="space-y-4">
                      <h3 className="font-heading font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Business & Contact Details
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Company Name"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. ZM Retailers Ltd"
                        />
                        <Input
                          label="Contact Person Name"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Business Email"
                          required
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="e.g. procurement@company.com"
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +44 7123 456789"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Target Destination Country"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. United Kingdom"
                        />
                        <div className="flex flex-col text-left">
                          <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                          >
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Importer">Importer</option>
                            <option value="Supermarket Chain">Supermarket / Retail Chain</option>
                            <option value="Hospitality Brand">Hospitality / Catering</option>
                            <option value="Food Manufacturer">Food Manufacturer</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* সেকশন ২: পণ্যের চাহিদা বিবরণী (Product Specs) */}
                    <div className="space-y-4 pt-6">
                      <h3 className="font-heading font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Product & Supply Requirements
                      </h3>

                      {/* কোয়েরি প্যারাম বা বাস্কেট থেকে পণ্য প্রাক-নির্বাচন প্যানেল */}
                      {urlProduct ? (
                        <div className="bg-brand-bg-alt/75 border border-brand-neutral-border p-4 rounded-xl flex justify-between items-center text-xs font-bold text-brand-neutral-charcoal">
                          <span className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10">Selected product</span>
                            <span>{urlProduct.name}</span>
                          </span>
                          <span className="text-brand-neutral-muted uppercase">Direct Enquiry</span>
                        </div>
                      ) : productSelections.length > 0 ? (
                        <div className="space-y-3 bg-brand-bg-alt/50 border border-brand-neutral-border p-4 rounded-xl">
                          <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 uppercase tracking-wide inline-block mb-2">Quotation Basket Items</span>
                          {productSelections.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-semibold text-brand-neutral-charcoal border-b border-brand-neutral-border/40 pb-2 last:border-b-0 last:pb-0">
                              <span>{item.productName} {item.variantName ? `(${item.variantName})` : ''} - {item.requestedQuantity} {item.requestedQuantityUnit}</span>
                              <button 
                                type="button" 
                                onClick={() => removeProductSelection(item.productId, item.variantId, item.packagingOptionId)}
                                className="text-red-600 hover:text-red-700 font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input
                          label="Requested Product or Category Sourcing Details"
                          required
                          value={requiredQuantity ? '' : 'Generic Custom Sourcing Request'}
                          disabled
                          placeholder="Please select products from our catalogue or describe below."
                        />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Required Quantity (Volume)"
                          type="number"
                          value={requiredQuantity}
                          onChange={(e) => setRequiredQuantity(e.target.value)}
                          placeholder="e.g. 1000"
                        />
                        <div className="flex flex-col text-left">
                          <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Quantity Unit</label>
                          <select
                            value={quantityUnit}
                            onChange={(e) => setQuantityUnit(e.target.value)}
                            className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                          >
                            <option value="Cartons">Cartons / Cases</option>
                            <option value="Pallets">Pallets</option>
                            <option value="Metric Tonnes">Metric Tonnes</option>
                            <option value="Kilograms">Kilograms (kg)</option>
                            <option value="Liters">Litres (L)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Required Delivery Port or Destination"
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="e.g. Felixstowe Port, UK"
                        />
                        <div className="flex flex-col text-left">
                          <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Target Timeline</label>
                          <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                          >
                            <option value="Within 1 Month">Within 1 Month</option>
                            <option value="1 to 3 Months">1 to 3 Months</option>
                            <option value="3 to 6 Months">3 to 6 Months</option>
                            <option value="Long-term Supply Chain Plan">Long-term Supply Contract</option>
                          </select>
                        </div>
                      </div>

                      {/* প্রাইভেট লেবেল ফ্ল্যাগ */}
                      <div className="flex items-center space-x-3 bg-brand-bg-alt/40 p-4 rounded-xl border border-brand-neutral-border">
                        <input
                          id="private-label-chk"
                          type="checkbox"
                          checked={privateLabel}
                          onChange={(e) => setPrivateLabel(e.target.checked)}
                          className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer"
                        />
                        <label htmlFor="private-label-chk" className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal cursor-pointer select-none">
                          Is Custom Private Labelling or Artwork Design Support required?
                        </label>
                      </div>

                      <Input
                        label="Detailed Sourcing Specifications & Notes"
                        required
                        multiline
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe precise product specifications, target cases/weights, cargo manifests or other details."
                      />
                    </div>

                  </div>

                  {/* ডান কলাম: ফাইল আপলোড, কনসেন্ট ও সাবমিট প্যানেল (৪ কলাম) */}
                  <div className="lg:col-span-4 flex flex-col space-y-6">
                    
                    {/* সোর্সিং ফাইল আপলোড উইন্ডো (Part 04, Section 17) */}
                    <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-card text-left">
                      <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-4 flex items-center gap-2">
                        <UploadCloud className="w-4.5 h-4.5 text-brand-primary" />
                        Specification File
                      </h3>
                      
                      <div className="border-2 border-dashed border-brand-neutral-border rounded-xl p-4 text-center bg-white hover:border-brand-primary/40 transition-colors duration-300 relative group cursor-pointer">
                        <input 
                          type="file" 
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          aria-label="Upload reference file"
                        />
                        <UploadCloud className="w-8 h-8 text-brand-neutral-muted mx-auto mb-2 group-hover:scale-105 transition-transform" />
                        <span className="block text-xs font-bold text-brand-neutral-charcoal mb-1">
                          {uploadingFile ? 'Uploading File...' : 'Upload Reference File'}
                        </span>
                        <span className="block text-[10px] text-brand-neutral-muted">
                          Allowed: PDF, PNG, JPG (Max 5MB)
                        </span>
                      </div>

                      {/* আপলোডেড ফাইল তালিকা */}
                      {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs bg-white border border-brand-neutral-border px-3 py-2 rounded-lg font-semibold text-brand-neutral-charcoal shadow-soft animate-scale-in">
                              <span className="truncate max-w-[150px]">{file.name}</span>
                              <button 
                                type="button" 
                                onClick={() => removeAttachment(idx)}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* আইনি নিরাপত্তা ও কনসেন্ট চেকবক্স */}
                    <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-card text-left flex flex-col space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          id="privacy-consent"
                          type="checkbox"
                          checked={consentAccepted}
                          onChange={(e) => setConsentAccepted(e.target.checked)}
                          required
                          className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="privacy-consent" className="text-xs text-brand-neutral-muted leading-relaxed cursor-pointer select-none">
                          I agree to ZM Supplier & Trading's <Link to="/privacy-policy" className="text-brand-primary hover:underline font-bold">Privacy Policy</Link> and consent to storing this data for quotation review.
                        </label>
                      </div>
                    </div>

                    {/* ফাইনাল সাবমিশন বাটন */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={loading}
                    >
                      Submit Sourcing Request
                    </Button>

                  </div>

                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};