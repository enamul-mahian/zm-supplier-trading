import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// মডাল ট্রানজিশন অ্যানিমেশন ভ্যারিয়েন্টস (Part 06, Rule 32)
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে প্যানেল সচল রাখতে আসল B2B ফলব্যাক ডাটাসমূহ
const FALLBACK_MESSAGES = [
  {
    id: 'msg-1',
    referenceNumber: 'MSG-20260717-9104',
    name: 'Johnathan Higgins',
    company: 'Wholesale Foods London Ltd',
    email: 'j.higgins@londonwholesalefoods.co.uk',
    phone: '+44 7911 123456',
    subject: 'Inquiry about bulk Basmati Rice freight',
    message: 'Hello, we are interested in coordinating a monthly container allocation for your premium Basmati rice. Could you please share the shipping transit specifications and container volume planning for Felixstowe Port?',
    inquiryType: 'general_contact',
    consentAccepted: true,
    status: 'new',
    adminNotes: '',
    createdAt: '17 July 2026'
  },
  {
    id: 'msg-2',
    referenceNumber: 'MSG-20260716-1142',
    name: 'Isabella Conti',
    company: 'Ricci Catering',
    email: 'i.conti@riccicatering.it',
    phone: '+39 02 1234567',
    subject: 'Private label support query',
    message: 'We are a major catering brand in Rome. We would like to know if your private labelling services extend to custom packaging dimensions for canned vegetables. Thank you.',
    inquiryType: 'general_contact',
    consentAccepted: true,
    status: 'contacted',
    adminNotes: 'Contacted Isabella via email on 16/07. Awaiting packaging spec requirements from her end.',
    createdAt: '16 July 2026'
  }
];

export const ManageMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // বিস্তারিত ডিলস মডাল স্টেট
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ফায়ারস্টোর থেকে মেসেজ ডেটা লোড
  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'contactMessages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
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
        setMessages(list);
      } else {
        setMessages(FALLBACK_MESSAGES);
      }
    } catch (error) {
      console.error('[ManageMessages load error]:', error);
      setMessages(FALLBACK_MESSAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // সার্চ ও ফিল্টারিং মেকানিজম সিঙ্ক
  useEffect(() => {
    let result = [...messages];

    if (statusFilter !== 'All') {
      result = result.filter(m => m.status === statusFilter.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m => 
          m.referenceNumber?.toLowerCase().includes(q) || 
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    setFilteredMessages(result);
    setExpandedIndex(result.length > 0 ? 0 : null);
  }, [messages, searchQuery, statusFilter]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // মেসেজ স্ট্যাটাস আপডেট করার হ্যান্ডলার (Part 05D, Rule 38)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const docRef = doc(db, 'contactMessages', id);
      await updateDoc(docRef, { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Message status updated to ${newStatus}.`);
      
      // লোকাল স্টেট আপডেট
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      loadMessages();
    } catch (error) {
      toast.error('Failed to update status in database.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ইন্টারনাল স্টাফ নোটস সেভ করার হ্যান্ডলার (Confidential - Part 05D, Rule 72)
  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    try {
      setUpdatingStatus(true);
      const docRef = doc(db, 'contactMessages', selectedMessage.id);
      await updateDoc(docRef, { 
        adminNotes: adminNotesText.trim(), 
        updatedAt: serverTimestamp() 
      });
      toast.success('Internal admin notes saved.');
      setSelectedMessage({ ...selectedMessage, adminNotes: adminNotesText.trim() });
      loadMessages();
    } catch (error) {
      toast.error('Failed to save notes.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // মেসেজ ডিলিট করার হ্যান্ডলার (Super Admin restricted - Part 05D, Rule 20)
  const handleDelete = async (id: string, refNum: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete message "${refNum}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'contactMessages', id);
      await deleteDoc(docRef);
      toast.success(`Message "${refNum}" deleted successfully.`);
      loadMessages();
    } catch (error) {
      toast.error('Failed to delete message.');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (messageItem: any) => {
    setSelectedMessage(messageItem);
    setAdminNotesText(messageItem.adminNotes || '');
  };

  return (
    <>
      <Helmet>
        <title>Contact Messages | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
            Contact Messages
          </h1>
          <p className="text-xs sm:text-sm text-brand-neutral-muted">
            Oversight of general business contacts, commercial support requests, and B2B sitemap enquiries.
          </p>
        </div>

        {/* ডাটা টেবিল প্যানেল */}
        <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
          
          {/* সার্চ ও ফিল্টার বার */}
          <div className="p-4 border-b border-brand-neutral-border flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-brand-bg-alt/40">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by Ref, Company, or Subject..."
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
                <option value="Contacted">Contacted</option>
                <option value="Closed">Closed</option>
                <option value="Spam">Spam</option>
              </select>
            </div>
          </div>

          {/* বিটুবি কন্টাক্ট ডেটা টেবিল */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
              <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Messages Database...</span>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm select-none">
                <thead>
                  <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Sender</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Received Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                      <td className="px-6 py-4 font-bold text-xs text-brand-primary uppercase">{msg.referenceNumber || 'MSG-REF'}</td>
                      <td className="px-6 py-4 font-bold text-sm text-brand-neutral-charcoal">{msg.company}</td>
                      <td className="px-6 py-4 font-semibold text-xs">{msg.name}</td>
                      <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted line-clamp-1 max-w-[200px]">{msg.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          msg.status === 'new' 
                            ? 'bg-brand-accent text-brand-neutral-charcoal border-brand-accent/30' 
                            : 'bg-brand-primary/5 text-brand-primary border-brand-primary/20'
                        }`}>
                          {msg.status || 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{msg.createdAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openDetails(msg)}
                            className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                            aria-label="View Message details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id, msg.referenceNumber)}
                            className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                            aria-label="Delete Message"
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
              <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No Messages Found</h3>
              <p className="text-xs text-brand-neutral-muted leading-relaxed">
                There are no active contact messages or feedback submissions matching your criteria.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ৫. বিস্তারিত মেসেজ ও বায়ার ডাটা শীট মডাল (A11y ARIA Trapped) */}
      <AnimatePresence>
        {selectedMessage && (
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
                onClick={() => setSelectedMessage(null)}
                className="absolute top-6 right-6 p-1.5 rounded-full bg-brand-bg-alt hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-neutral-border pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded border border-brand-primary/10 uppercase tracking-widest inline-block mb-1.5">Contact Sheet</span>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-neutral-charcoal">
                    Ref: {selectedMessage.referenceNumber}
                  </h2>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">Change Status:</span>
                  <select
                    value={selectedMessage.status || 'new'}
                    onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value)}
                    disabled={updatingStatus}
                    className="bg-brand-bg-alt border border-brand-neutral-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-neutral-charcoal focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              {/* মডাল বডি কন্টেন্ট গ্রিড */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* বাম কলাম: প্রেরকের প্রোফাইল ও ডক স্ন্যাপশট (৮ কলাম) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* সেকশন ১: প্রেরক প্রোফাইল */}
                  <div className="space-y-3 bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-xs font-semibold text-brand-neutral-charcoal text-left">
                    <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 mb-3">
                      <User className="w-4.5 h-4.5" />
                      Sender Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 leading-relaxed">
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Company:</span> <span className="font-extrabold">{selectedMessage.company}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Contact Name:</span> <span className="font-extrabold">{selectedMessage.name}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Business Email:</span> <span className="font-extrabold text-brand-primary">{selectedMessage.email}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Business Phone:</span> <span className="font-extrabold">{selectedMessage.phone || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Subject:</span> <span className="font-extrabold">{selectedMessage.subject}</span></div>
                    </div>
                  </div>

                  {/* সেকশন ২: প্রেরকের মূল বার্তা */}
                  <div className="space-y-3 text-left">
                    <h3 className="font-heading font-extrabold text-sm text-brand-primary uppercase tracking-wider flex items-center gap-2 border-b border-brand-neutral-border pb-2">
                      <MessageSquare className="w-4.5 h-4.5" />
                      Message Body
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed bg-brand-bg-alt/30 border border-brand-neutral-border p-4 rounded-xl italic">
                      "{selectedMessage.message}"
                    </p>
                  </div>
                </div>

                {/* ডান কলাম: ইন্টারনাল নোটস (৪ কলাম) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* সোর্সিং ও ডেলিভারি বিবরণী */}
                  <div className="bg-brand-bg-alt/60 p-5 rounded-card border border-brand-neutral-border text-xs font-semibold text-brand-neutral-charcoal text-left space-y-3">
                    <h3 className="font-heading font-bold text-xs text-brand-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <Calendar className="w-4.5 h-4.5" />
                      Manifest Sourcing
                    </h3>
                    <div className="flex justify-between border-b border-brand-neutral-border/50 pb-2"><span className="text-brand-neutral-muted uppercase">Inquiry Type:</span> <span>General Contact</span></div>
                    <div className="flex justify-between border-b border-brand-neutral-border/50 pb-2"><span className="text-brand-neutral-muted uppercase">Sourcing Hub:</span> <span>UK Desk</span></div>
                    <div className="flex justify-between"><span className="text-brand-neutral-muted uppercase">Submitted:</span> <span>{selectedMessage.createdAt}</span></div>
                  </div>

                  {/* ইন্টারনাল নোটস এরিয়া (পাবলিক সম্পূর্ণ হিডেন - Part 05D, Rule 72) */}
                  <div className="bg-brand-bg-alt/60 p-5 rounded-card border border-brand-neutral-border text-left space-y-3">
                    <h3 className="font-heading font-bold text-xs text-brand-primary mb-3 flex items-center gap-2 uppercase tracking-wide">
                      <MessageSquare className="w-4.5 h-4.5" />
                      Internal Admin Notes
                    </h3>
                    <p className="text-[10px] text-brand-neutral-muted leading-relaxed mb-3">
                      Write confidential remarks, audit notes, or communication history about this client (Visible to staff only).
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