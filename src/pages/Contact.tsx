import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle,
  Building,
  User,
  HelpCircle
} from 'lucide-react';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

// গ্লোবাল ইউনিক বিটুবি কন্টাক্ট রেফারেন্স নম্বর জেনারেটর
const generateMessageReference = (): string => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MSG-${dateStr}-${randomNum}`;
};

export const Contact: React.FC = () => {
  // ডাটাবেস সেটিংস স্টেট
  const [contactSettings, setContactSettings] = useState({
    email: BRAND_INFO.email,
    phone: BRAND_INFO.phone,
    address: BRAND_INFO.address,
    workingHours: BRAND_INFO.workingHours,
  });

  // ফায়ারস্টোর থেকে সেটিংস লোড করা
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setContactSettings({
            email: data.contactInfo?.email || BRAND_INFO.email,
            phone: data.contactInfo?.phone || BRAND_INFO.phone,
            address: data.contactInfo?.address || BRAND_INFO.address,
            workingHours: data.contactInfo?.workingHours || BRAND_INFO.workingHours,
          });
        }
      } catch (error) {
        console.error('Error fetching contact settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const hasVerifiedMapLocation = false;
  const mapIframeUrl = '';

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) {
      toast.error('Please accept the Privacy Policy to submit your message.');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Please enter a valid business email address.');
      return;
    }

    try {
      setLoading(true);
      const contactMessagesRef = collection(db, 'contactMessages');
      const referenceNumber = generateMessageReference();

      const newMessageDoc = {
        referenceNumber,
        name,
        company,
        email,
        phone: phone || null,
        subject,
        message: message.trim(),
        inquiryType: 'general_contact',
        consentAccepted,
        status: 'new',
        assignedTo: null,
        sourcePage: window.location.href,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(contactMessagesRef, newMessageDoc);
      setSubmittedRef(referenceNumber);
      toast.success('Your message has been sent successfully.');
    } catch (error) {
      console.error('[Contact Form Submit Error]:', error);
      toast.error('We could not send your message. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | {BRAND_INFO.name} | B2B Trade Desk</title>
        <meta name="description" content="Get in touch with ZM Supplier & Trading. Contact our UK-standard trade coordination desk for commercial enquiries, product sourcing, or wholesale supply quotes." />
        <link rel="canonical" href="https://zmsupplier.co.uk/contact" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        <section className="bg-brand-secondary text-white py-12 text-left relative overflow-hidden border-b border-brand-secondary-dark">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
          <div className="premium-container relative z-10">
            <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
              <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-accent">Contact</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-3">
              Contact Us
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Get in touch with our commercial trade coordination desk. We are here to support your bulk sourcing and supply requirements.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white text-left relative min-h-[400px]">
          <div className="premium-container px-4 max-w-content mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <motion.div 
                className="lg:col-span-5 flex flex-col space-y-6 text-left"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <div className="mb-4">
                  <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">B2B Trade Desk</span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight">
                    Let's Work Together
                  </h2>
                  <p className="text-sm text-brand-neutral-muted mt-2">
                    Our trade managers are ready to assist you. Sourcing guidance, wholesale pricing estimates, and export manifests are managed traceably.
                  </p>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-start bg-brand-bg-alt/60 p-5 rounded-xl border border-brand-neutral-border shadow-soft group hover:border-brand-primary/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                      <Phone className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-neutral-muted uppercase tracking-wider mb-1">Call Our Desk</h4>
                      <a href={`tel:${contactSettings.phone}`} className="text-sm sm:text-base font-bold text-brand-neutral-charcoal hover:text-brand-primary transition-colors">{contactSettings.phone}</a>
                    </div>
                  </div>

                  <div className="flex items-start bg-brand-bg-alt/60 p-5 rounded-xl border border-brand-neutral-border shadow-soft group hover:border-brand-primary/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                      <Mail className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-neutral-muted uppercase tracking-wider mb-1">Email Enquiries</h4>
                      <a href={`mailto:${contactSettings.email}`} className="text-sm sm:text-base font-bold text-brand-neutral-charcoal hover:text-brand-primary transition-colors">{contactSettings.email}</a>
                    </div>
                  </div>

                  <div className="flex items-start bg-brand-bg-alt/60 p-5 rounded-xl border border-brand-neutral-border shadow-soft group hover:border-brand-primary/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                      <MapPin className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-neutral-muted uppercase tracking-wider mb-1">Address</h4>
                      <span className="text-sm sm:text-base font-bold text-brand-neutral-charcoal leading-tight">{contactSettings.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start bg-brand-bg-alt/60 p-5 rounded-xl border border-brand-neutral-border shadow-soft group hover:border-brand-primary/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mr-4 shrink-0 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                      <Clock className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs text-brand-neutral-muted uppercase tracking-wider mb-1">Operating Hours</h4>
                      <span className="text-sm sm:text-base font-bold text-brand-neutral-charcoal leading-tight">{contactSettings.workingHours}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {submittedRef ? (
                    <motion.div 
                      className="bg-brand-bg-alt border border-brand-neutral-border p-8 rounded-card text-center flex flex-col items-center shadow-soft"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-7 h-7 text-brand-primary" />
                      </div>
                      <h2 className="font-heading font-extrabold text-2xl text-brand-neutral-charcoal mb-3">Message Sent Successfully</h2>
                      <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                        Thank you for contacting us. Your message has been saved securely and our commercial trading desk will follow up with you.
                      </p>
                      <div className="bg-brand-secondary text-brand-accent text-xs font-extrabold px-6 py-3 rounded-lg border border-brand-primary-light uppercase tracking-widest mb-6 select-all">
                        Reference: {submittedRef}
                      </div>
                      <Button to="/products" variant="primary">Explore Product Catalogue</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Your Name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. John Doe"
                          leftIcon={<User className="w-4 h-4 text-brand-neutral-muted" />}
                        />
                        <Input
                          label="Company Name"
                          required
                          value={company}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. ZM Wholesale Ltd"
                          leftIcon={<Building className="w-4 h-4 text-brand-neutral-muted" />}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Business Email"
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. john@company.com"
                          leftIcon={<Mail className="w-4 h-4 text-brand-neutral-muted" />}
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +44 7123 456789"
                          leftIcon={<Phone className="w-4 h-4 text-brand-neutral-muted" />}
                        />
                      </div>

                      <Input
                        label="Subject"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Bulk Basmati Rice Sourcing Enquiry"
                        leftIcon={<MessageSquare className="w-4 h-4 text-brand-neutral-muted" />}
                      />

                      <Input
                        label="Message"
                        required
                        multiline
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please write your detailed sourcing requirements, packaging format preference, timeline, or destination specifications here."
                      />

                      <div className="flex items-start gap-3 bg-brand-bg-alt/40 p-4 rounded-xl border border-brand-neutral-border text-left">
                        <input
                          id="contact-consent-chk"
                          type="checkbox"
                          checked={consentAccepted}
                          onChange={(e) => setConsentAccepted(e.target.checked)}
                          required
                          className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer mt-0.5"
                        />
                        <label htmlFor="contact-consent-chk" className="text-xs text-brand-neutral-muted leading-relaxed cursor-pointer select-none">
                          I agree to ZM Supplier & Trading's <Link to="/privacy-policy" className="text-brand-primary hover:underline font-bold">Privacy Policy</Link> and consent to storing this data for contact and review.
                        </label>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={loading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {hasVerifiedMapLocation && mapIframeUrl && (
          <section className="w-full h-80 sm:h-96 relative border-b border-brand-neutral-border overflow-hidden">
            <iframe 
              src={mapIframeUrl}
              className="w-full h-full border-0" 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={`${BRAND_INFO.name} Verified Office Map Location`}
            />
          </section>
        )}

        <InquiryCTASection />
      </div>
    </>
  );
};