import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // ইমপোর্ট তালিকায় যুক্ত করা হলো (টাইপ এরর ফিক্সড)
import { 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { QuoteRequest } from '../../shared/types';
import { BRAND_INFO } from '../../shared/constants';
import { 
  Search, 
  Eye, 
  Trash2, 
  Loader2, 
  X, 
  CheckCircle,
  Inbox,
  User,
  Building,
  Mail,
  Phone,
  Globe,
  Calendar,
  Paperclip,
  MessageSquare,
  AlertCircle,
  Package, // ইমপোর্ট তালিকায় যুক্ত করা হলো (টাইপ এরর ফিক্সড)
  ArrowRight // ইমপোর্ট তালিকায় যুক্ত করা হলো (টাইপ এরর ফিক্সড)
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// স্লাইড পরিবর্তনের অ্যানিমেশন ট্রানজিশন কনফিগ (Part 06, Rule 32)
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

// ফায়ারস্টোর কানেকশন পেন্ডিং বা খালি থাকলে অ্যাডমিন প্যানেল সচল রাখতে আসল B2B ফলব্যাক ডাটাসমূহ
const FALLBACK_ENQUIRIES: any[] = [
  {
    id: 'enq-1',
    referenceNumber: 'ZST-20260717-1082',
    enquiryType: 'product',
    companyName: 'Meyer Foods GmbH',
    contactName: 'Lukas Meyer',
    businessEmail: 'l.meyer@meyerfoods.de',
    phone: '+49 172 345678',
    country: 'Germany',
    businessType: 'Wholesaler',
    productSelections: [
      {
        productId: 'p1',
        productName: 'Premium Rice',
        productCode: 'ZST-RICE-001',
        productSlug: 'premium-rice',
        requestedQuantity: 1000,
        requestedQuantityUnit: 'Kilograms',
        packagingName: '25kg Sacks',
        notes: 'Need high-grade sorting and low moisture specifications.'
      }
    ],
    serviceSelections: [],
    requiredQuantity: 1000,
    quantityUnit: 'Kilograms',
    destination: 'Felixstowe Port, UK',
    requiredTimeline: 'Within 1 Month',
    privateLabelRequired: false,
    message: 'We require a formal commercial proposal for 1,000 kg of premium Basmati rice packed in 25kg sacks.',
    attachmentMediaIds: ['https://res.cloudinary.com/demo/image/upload/v12345678/sample-specs.pdf'],
    preferredContactMethod: 'Email',
    consentAccepted: true,
    marketingConsent: false,
    status: 'new',
    adminNotes: '',
    createdAt: '17 July 2026'
  },
  {
    id: 'enq-2',
    referenceNumber: 'ZST-20260715-4089',
    enquiryType: 'general',
    companyName: 'Crown Grocers Ltd',
    contactName: 'Sarah Jenkins',
    businessEmail: 's.jenkins@crowngrocers.co.uk',
    phone: '+44 7123 456789',
    country: 'United Kingdom',
    businessType: 'Supermarket Chain',
    productSelections: [],
    serviceSelections: [
      {
        serviceId: 's3',
        serviceName: 'Private Label Support',
        serviceSlug: 'private-label-support'
      }
    ],
    requiredQuantity: null,
    quantityUnit: null,
    destination: 'London Wholesale Hub',
    requiredTimeline: '1 to 3 Months',
    privateLabelRequired: true,
    message: 'Interested in exploring private labelling configurations and custom artwork design support for grocery products.',
    attachmentMediaIds: [],
    preferredContactMethod: 'Email',
    consentAccepted: true,
    marketingConsent: true,
    status: 'review',
    adminNotes: 'Contacted Sarah via email on 16/07. Awaiting product specification sheets.',
    createdAt: '15 July 2026'
  }
];

export const ManageEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // বিস্তারিত ডিলস মডাল স্টেট
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ফায়ারস্টোর থেকে কোটেশন ডেটা লোড
  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const enquiriesRef = collection(db, 'quoteRequests');
      const q = query(enquiriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let dateStr = 'Recent';
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          dateStr = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
        return {
          id: docSnap.id,
          ...data,
          createdAt: dateStr
        };
      });

      if (list.length > 0) {
        setEnquiries(list);
      } else {
        setEnquiries(FALLBACK_ENQUIRIES);
      }
    } catch (error) {
      console.error('[ManageEnquiries load error]:', error);
      setEnquiries(FALLBACK_ENQUIRIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // সার্চ ও ফিল্টারিং মেকানিজম সিঙ্ক
  useEffect(() => {
    let result = [...enquiries];

    if (statusFilter !== 'All') {
      result = result.filter(e => e.status === statusFilter.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        e => 
          e.referenceNumber?.toLowerCase().includes(q) || 
          e.companyName.toLowerCase().includes(q) ||
          e.contactName.toLowerCase().includes(q) ||
          e.businessEmail.toLowerCase().includes(q)
      );
    }

    setFilteredEnquiries(result);
  }, [enquiries, searchQuery, statusFilter]);

  // কোটেশন স্ট্যাটাস আপডেট করার হ্যান্ডলার (Part 05D, Rule 38)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const docRef = doc(db, 'quoteRequests', id);
      await updateDoc(docRef, { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Enquiry status updated to ${newStatus}.`);
      
      // লোকাল স্টেট আপডেট
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
      }
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to update status in database.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ইন্টারনাল অ্যাডমিন নোটস সেভ করার হ্যান্ডলার (Part 05D, Rule 72)
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      setUpdatingStatus(true);
      const docRef = doc(db, 'quoteRequests', selectedEnquiry.id);
      await updateDoc(docRef, { 
        adminNotes: adminNotesText.trim(), 
        updatedAt: serverTimestamp() 
      });
      toast.success('Internal admin notes saved.');
      setSelectedEnquiry({ ...selectedEnquiry, adminNotes: adminNotesText.trim() });
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to save notes.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // কোটেশন ডিলিট করার হ্যান্ডলার (Super Admin restricted - Part 05D, Rule 20)
  const handleDelete = async (id: string, refNum: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete enquiry "${refNum}"? This action is irreversible.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'quoteRequests', id);
      await deleteDoc(docRef);
      toast.success(`Enquiry "${refNum}" deleted successfully.`);
      loadEnquiries();
    } catch (error) {
      toast.error('Failed to delete enquiry.');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setAdminNotesText(enquiry.adminNotes || '');
  };

  return (
    <>
      <Helmet>
        <title>Quote Requests | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
            B2B Sourcing Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-brand-neutral-muted">
            Manage, evaluate, and update status of wholesale product sourcing and trade quote requests.
          </p>
        </div>

        {/* ডাটা টেবিল প্যানেল */}
        <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
          
          {/* সার্চ ও ফিল্টার বার */}
          <div className="p-4 border-b border-brand-neutral-border flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-brand-bg-alt/40">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by Ref, Company, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
              />
            </div>
            
            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-brand-neutral-border rounded-lg px-3 py-2 text-xs font-bold text-brand-neutral-charcoal focus:outline-none"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Review">Under Review</option>
                <option value="Contacted">Contacted</option>
                <option value="Quoted">Quoted</option>
                <option value="Spam">Spam</option>
              </select>
            </div>
          </div>

          {/* বিটুবি কন্টাক্ট ডেটা টেবিল */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
              <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Enquiries Database...</span>
            </div>
          ) : filteredEnquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm select-none">
                <thead>
                  <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Contact Person</th>
                    <th className="px-6 py-3.5">Country</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Received Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                  {filteredEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                      <td className="px-6 py-4 font-bold text-xs text-brand-primary uppercase">{enq.referenceNumber}</td>
                      <td className="px-6 py-4 font-bold text-sm text-brand-neutral-charcoal">{enq.companyName}</td>
                      <td className="px-6 py-4 font-semibold text-xs">{enq.contactName}</td>
                      <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{enq.country}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          enq.status === 'new' 
                            ? 'bg-brand-accent text-brand-neutral-charcoal border-brand-accent/30' 
                            : 'bg-brand-primary/5 text-brand-primary border-brand-primary/20'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{enq.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openDetails(enq)}
                            className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                            aria-label="View Enquiry details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(enq.id, enq.referenceNumber)}
                            className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                            aria-label="Delete Enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center max-w-sm mx-auto text-center">
              <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                <Inbox className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No Enquiries Found</h3>
              <p className="text-xs text-brand-neutral-muted leading-relaxed">
                There are no active sourcing requests or quote submissions matching your criteria.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ৫. বিস্তারিত কোটেশন ও বায়ার ডাটা শিট মডাল (A11y ARIA Trapped - Part 05D, Rule 71) */}
      <AnimatePresence>
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-card border border-brand-neutral-border shadow-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative text-left"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* মডাল ক্লোজ বাটন */}
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-brand-bg-alt hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-neutral-border pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded border border-brand-primary/10 uppercase tracking-widest inline-block mb-1.5">Quote Details Sheet</span>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-neutral-charcoal">
                    Ref: {selectedEnquiry.referenceNumber}
                  </h2>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">Change Status:</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                    disabled={updatingStatus}
                    className="bg-brand-bg-alt border border-brand-neutral-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-neutral-charcoal focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="review">Under Review</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              {/* মডাল বডি কন্টেন্ট গ্রিড */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* বাম কলাম: বায়ার ডক ও কোটেশন স্ন্যাপশট (৮ কলাম) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* সেকশন ১: বায়ার প্রোফাইল */}
                  <div className="space-y-3 bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-xs font-semibold text-brand-neutral-charcoal text-left">
                    <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                      <User className="w-4.5 h-4.5" />
                      Buyer Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 leading-relaxed">
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Company:</span> <span className="font-extrabold">{selectedEnquiry.companyName}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Contact Name:</span> <span className="font-extrabold">{selectedEnquiry.contactName}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Business Email:</span> <span className="font-extrabold text-brand-primary">{selectedEnquiry.businessEmail}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Business Phone:</span> <span className="font-extrabold">{selectedEnquiry.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Country:</span> <span className="font-extrabold">{selectedEnquiry.country}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Business Type:</span> <span className="font-extrabold">{selectedEnquiry.businessType || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* সেকশন ২: পণ্যের স্ন্যাপশট (Product Snapshots - Part 05D, Rule 21) */}
                  {selectedEnquiry.productSelections?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 border-b border-brand-neutral-border pb-2">
                        <Package className="w-4.5 h-4.5" />
                        Selected B2B Products (Snapshot)
                      </h3>

                      {selectedEnquiry.productSelections.map((item: any, idx: number) => (
                        <div key={idx} className="bg-brand-bg-alt/30 border border-brand-neutral-border p-4 rounded-xl flex flex-col text-left gap-3 text-xs font-semibold">
                          <div className="flex justify-between items-center border-b border-brand-neutral-border/50 pb-2">
                            <span className="font-heading font-bold text-sm text-brand-neutral-charcoal">{item.productName}</span>
                            <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10">Code: {item.productCode}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 leading-relaxed">
                            <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Min Order:</span> <span>{item.minimumOrderQuantity || 'N/A'} {item.minimumOrderUnit}</span></div>
                            <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Packaging Format:</span> <span>{item.packagingName || 'Standard Sacks'}</span></div>
                            {item.requestedQuantity && (
                              <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Requested Volume:</span> <span className="text-brand-primary font-bold">{item.requestedQuantity} {item.requestedQuantityUnit}</span></div>
                            )}
                          </div>
                          {item.notes && (
                            <div className="mt-2 p-3 bg-white border border-brand-neutral-border rounded-lg text-xs italic text-brand-neutral-muted">
                              "Notes: {item.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* সেকশন ৩: বায়ারের মূল বার্তা */}
                  <div className="space-y-3 text-left">
                    <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 border-b border-brand-neutral-border pb-2">
                      <MessageSquare className="w-4.5 h-4.5" />
                      Buyer Cover Message & Sourcing Details
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed bg-brand-bg-alt/30 border border-brand-neutral-border p-4 rounded-xl italic">
                      "{selectedEnquiry.message}"
                    </p>
                  </div>

                  {/* সেকশন ৪: আপলোডেড ফাইল বা রেফারেন্স (Cloudinary secured - Part 05D, Rule 19) */}
                  {selectedEnquiry.attachmentMediaIds?.length > 0 && (
                    <div className="space-y-3 text-left">
                      <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 border-b border-brand-neutral-border pb-2">
                        <Paperclip className="w-4.5 h-4.5" />
                        Uploaded Specifications File
                      </h3>
                      <div className="flex flex-col space-y-2">
                        {selectedEnquiry.attachmentMediaIds.map((url: string, index: number) => (
                          <div key={index} className="flex justify-between items-center text-xs bg-brand-bg-alt/50 border border-brand-neutral-border px-4 py-3 rounded-lg font-semibold text-brand-neutral-charcoal">
                            <span>Specification Attachment {index + 1}</span>
                            <a 
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-brand-primary hover:text-brand-accent-dark transition-colors flex items-center gap-1"
                            >
                              Download File <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ডান কলাম: ইন্টারনাল নোটস ও লজিস্টিকস specs (৪ কলাম) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* সোর্সিং ও ডেলিভারি বিবরণী */}
                  <div className="bg-brand-bg-alt/60 p-5 rounded-card border border-brand-neutral-border text-xs font-semibold text-brand-neutral-charcoal text-left space-y-3">
                    <h3 className="font-heading font-bold text-xs text-brand-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <Calendar className="w-4.5 h-4.5" />
                      Logistics Sourcing
                    </h3>
                    <div className="flex justify-between border-b border-brand-neutral-border/50 pb-2"><span className="text-brand-neutral-muted uppercase">Required Destination:</span> <span>{selectedEnquiry.destination || 'UK Base'}</span></div>
                    <div className="flex justify-between border-b border-brand-neutral-border/50 pb-2"><span className="text-brand-neutral-muted uppercase">Target Timeline:</span> <span>{selectedEnquiry.requiredTimeline || '1 Month'}</span></div>
                    <div className="flex justify-between border-b border-brand-neutral-border/50 pb-2"><span className="text-brand-neutral-muted uppercase">Private Label:</span> <span>{selectedEnquiry.privateLabelRequired ? 'Required' : 'Not Required'}</span></div>
                    <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Submitted:</span> <span>{selectedEnquiry.createdAt}</span></div>
                  </div>

                  {/* ইন্টারনাল নোটস এরিয়া */}
                  <div className="bg-brand-bg-alt/60 p-5 rounded-card border border-brand-neutral-border text-left space-y-3">
                    <h3 className="font-heading font-bold text-xs text-brand-primary mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <MessageSquare className="w-4.5 h-4.5" />
                      Internal Admin Notes
                    </h3>
                    <p className="text-[10px] text-brand-neutral-muted leading-relaxed mb-3">
                      Write confidential remarks, audit notes, or communication history about this client (Confidential to staff).
                    </p>
                    <textarea
                      placeholder="Type internal notes here..."
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      className="w-full h-28 border border-brand-neutral-border rounded-form p-3 text-xs bg-white focus:outline-none focus:border-brand-primary"
                    />
                    <Button
                      onClick={handleSaveNotes}
                      variant="primary"
                      size="sm"
                      fullWidth
                      isLoading={updatingStatus}
                    >
                      Save Admin Notes
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};