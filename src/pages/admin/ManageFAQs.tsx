import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc // ইমপোর্ট করা হলো
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FAQ } from '../../shared/types';
import { BRAND_INFO, FALLBACK_FAQS } from '../../shared/constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  X, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস (Part 06, Rule 32)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 80,
    },
  },
};

export const ManageFAQs: React.FC = () => {
  const [faqs, setFAQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ফর্ম ও এডিটিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // এফএকিউ ফর্ম ফিল্ডস স্টেট (Part 04, Section 16 & Part 05D, Section 17)
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [categoryId, setCategoryId] = useState('General');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [includeInSchema, setIncludeInSchema] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  // পেজ অ্যাসোসিয়েশন মাল্টি-চেকবক্স স্টেট (FAQ-কে নির্দিষ্ট পৃষ্ঠার সাথে লিঙ্ক করতে)
  const [pageAssociations, setPageAssociations] = useState<Record<string, boolean>>({
    home: true,
    about: false,
    services: false,
    products: false,
    faq: true,
  });

  const availablePages = [
    { id: 'home', label: 'Home Page' },
    { id: 'about', label: 'About Page' },
    { id: 'services', label: 'Services Page' },
    { id: 'products', label: 'Products Catalogue' },
    { id: 'faq', label: 'FAQ Page' },
  ];

  // ফায়ারস্টোর থেকে অল এফএকিউ কোয়েরি
  const loadFAQs = async () => {
    try {
      setLoading(true);
      const faqsRef = collection(db, 'faqs');
      const q = query(faqsRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      if (list.length > 0) {
        setFAQs(list);
      } else {
        // ফায়ারস্টোর ফাঁকা থাকলে constants থেকে ৫টি গোল্ডেন B2B FAQ লোড হবে (Compile-safety)
        setFAQs(FALLBACK_FAQS);
      }
    } catch (error) {
      console.error('[ManageFAQs load error]:', error);
      setFAQs(FALLBACK_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  // ফর্ম সাবমিট হ্যান্ডলার (তৈরি ও সম্পাদনা - Part 05D, Section 17)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      toast.error('Please enter both the question and the answer.');
      return;
    }

    try {
      setSubmitting(true);
      const faqsRef = collection(db, 'faqs');

      // ট্রু বা সিলেক্টেড পেজ আইডিগুলোর অ্যারে মডিউল প্রস্তুতকরণ
      const selectedPageIds = Object.keys(pageAssociations).filter(
        key => pageAssociations[key]
      );

      const faqDoc: any = {
        question: question.trim(),
        answer: answer.trim(),
        categoryId,
        pageIds: selectedPageIds,
        includeInSchema,
        isEnabled,
        status: isEnabled ? 'published' : 'draft',
        sortOrder: Number(sortOrder) || faqs.length + 1,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // এডিট বা মডিফিকেশন প্রসেস - FIX: setDoc with merge applied
        const docRef = doc(db, 'faqs', editingId);
        await setDoc(docRef, faqDoc, { merge: true });
        toast.success('FAQ updated successfully.');
      } else {
        // নতুন এফএকিউ তৈরি
        faqDoc.createdAt = serverTimestamp();
        await addDoc(faqsRef, faqDoc);
        toast.success('FAQ created successfully.');
      }

      closeForm();
      loadFAQs();
    } catch (error) {
      console.error('[FAQ Submit Error]:', error);
      toast.error('Database write operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // একটিভ/নিষ্ক্রিয় স্ট্যাটাস টগল মেকানিজম
  const handleToggleStatus = async (faq: any) => {
    try {
      const docRef = doc(db, 'faqs', faq.id);
      const newEnabledState = !faq.isEnabled;
      // FIX: setDoc with merge applied
      await setDoc(docRef, { 
        isEnabled: newEnabledState, 
        status: newEnabledState ? 'published' : 'draft',
        updatedAt: serverTimestamp() 
      }, { merge: true });
      toast.success(`FAQ status updated to ${newEnabledState ? 'enabled' : 'disabled'}.`);
      loadFAQs();
    } catch (error) {
      toast.error('Failed to update FAQ status.');
    }
  };

  // এফএকিউ স্থায়ী বা সফট ডিলিট মেকানিজম (নিরাপত্তা ও নিশ্চিতকরণ ডায়ালগ সহ)
  const handleDelete = async (id: string, questionText: string) => {
    const truncatedQuestion = questionText.substring(0, 45) + '...';
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete FAQ: "${truncatedQuestion}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'faqs', id);
      await deleteDoc(docRef);
      toast.success('FAQ deleted successfully.');
      loadFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ.');
    } finally {
      setLoading(false);
    }
  };

  // এডিটিং মোড ট্রিগার
  const startEdit = (faq: any) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategoryId(faq.categoryId || 'General');
    setSortOrder(faq.sortOrder || 1);
    setIncludeInSchema(faq.includeInSchema !== false);
    setIsEnabled(faq.isEnabled !== false);

    // পেজ অ্যাসোসিয়েশন রিস্টোরেশন
    const restoredAssociations: Record<string, boolean> = {
      home: false,
      about: false,
      services: false,
      products: false,
      faq: false,
    };
    if (faq.pageIds && Array.isArray(faq.pageIds)) {
      faq.pageIds.forEach((pageId: string) => {
        if (restoredAssociations[pageId] !== undefined) {
          restoredAssociations[pageId] = true;
        }
      });
    }
    setPageAssociations(restoredAssociations);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setCategoryId('General');
    setSortOrder(1);
    setIncludeInSchema(true);
    setIsEnabled(true);
    setPageAssociations({
      home: true,
      about: false,
      services: false,
      products: false,
      faq: true,
    });
    setIsFormOpen(false);
  };

  const handlePageAssocChange = (pageId: string, checked: boolean) => {
    setPageAssociations(prev => ({ ...prev, [pageId]: checked }));
  };

  const filteredFAQs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.categoryId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage FAQs | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
              Manage B2B FAQs
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Add, edit, categorize, and associate frequently asked questions with specific public pages.
            </p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2" />
              Create New FAQ
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            
            // ৩. এফএকিউ ক্রিয়েশন এবং এডিটিং ফর্ম প্যানেল
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white border border-brand-neutral-border p-6 sm:p-8 rounded-card shadow-soft space-y-6 max-w-3xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-neutral-border">
                <h2 className="font-heading font-bold text-base text-brand-neutral-charcoal flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-primary" />
                  {editingId ? 'Edit FAQ Specifications' : 'Create New B2B FAQ'}
                </h2>
                <button type="button" onClick={closeForm} className="p-1.5 rounded-full hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* গ্রাউন্ড ১: প্রশ্ন ও উত্তর বিবরণ */}
              <Input
                label="FAQ Question *"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is your standard Minimum Order Quantity (MOQ)?"
              />

              <Input
                label="FAQ Answer *"
                required
                multiline
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write a clear, factual B2B answer in British English..."
              />

              {/* গ্রাউন্ড ২: ক্যাটাগরি ও অর্ডারিং */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left">
                  <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">FAQ Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                  >
                    <option value="General">General Support</option>
                    <option value="Wholesale">Wholesale Orders</option>
                    <option value="Sourcing">Product Sourcing</option>
                    <option value="Logistics">Logistics & Trade</option>
                    <option value="Private Label">Private Label</option>
                  </select>
                </div>
                <Input
                  label="Sort Order (Numerical Priority)"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="e.g. 1 (First Priority)"
                />
              </div>

              {/* গ্রাউন্ড ৩: পেজ অ্যাসোসিয়েশন ডাইনামিক চেকবক্স প্যানেল */}
              <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-left">
                <h3 className="font-heading font-bold text-xs text-brand-neutral-charcoal mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-brand-accent-dark" />
                  Associate FAQ with Pages
                </h3>
                <p className="text-[10px] text-brand-neutral-muted mb-4 leading-relaxed">
                  Select which public pages should display this FAQ accordion. You can select multiple page entries.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availablePages.map((page) => (
                    <div key={page.id} className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-lg border border-brand-neutral-border shadow-soft">
                      <input
                        id={`page-chk-${page.id}`}
                        type="checkbox"
                        checked={pageAssociations[page.id] || false}
                        onChange={(e) => handlePageAssocChange(page.id, e.target.checked)}
                        className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor={`page-chk-${page.id}`} className="text-xs font-semibold text-brand-neutral-charcoal cursor-pointer select-none">
                        {page.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* টেকনিক্যাল এসইও ও এনভায়রনমেন্ট স্ট্যাটাস */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-brand-bg-alt/30 p-4 rounded-xl border border-brand-neutral-border text-left">
                <div className="flex items-center space-x-2">
                  <input
                    id="seo-schema-chk"
                    type="checkbox"
                    checked={includeInSchema}
                    onChange={(e) => setIncludeInSchema(e.target.checked)}
                    className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="seo-schema-chk" className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal cursor-pointer select-none">
                    Include in JSON-LD FAQ Schema on associated pages? (Recommended for SEO)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="faq-enabled-chk"
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="faq-enabled-chk" className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal cursor-pointer select-none">
                    Enable FAQ (Published)
                  </label>
                </div>
              </div>

              {/* ফর্ম অ্যাকশন বাটনস */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-neutral-border">
                <Button onClick={closeForm} variant="outline" size="sm" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingId ? 'Update FAQ' : 'Save FAQ'}
                </Button>
              </div>

            </motion.form>
          ) : (
            
            // ৪. মেইন এফএকিউ ম্যানেজার টেবিল ভিউ (ডাটা টেবিল)
            <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
              
              {/* সার্চ ও ফিল্টার বার */}
              <div className="p-4 border-b border-brand-neutral-border flex items-center justify-between bg-brand-bg-alt/40">
                <div className="w-full md:w-80">
                  <Input
                    placeholder="Search FAQs by question or answer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                  />
                </div>
                <div className="text-xs font-bold text-brand-neutral-muted select-none uppercase tracking-wide hidden sm:block">
                  {filteredFAQs.length} FAQs Listed
                </div>
              </div>

              {/* এফএকিউ ডেটা টেবিল */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading FAQs Database...</span>
                </div>
              ) : filteredFAQs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm select-none">
                    <thead>
                      <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Question</th>
                        <th className="px-6 py-3.5">Pages Associated</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Sort Order</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                      {filteredFAQs.map((faq) => (
                        <tr key={faq.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2.5 py-1 rounded-md uppercase shrink-0">
                              {faq.categoryId || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-brand-neutral-charcoal line-clamp-1 max-w-[240px]">
                            {faq.question}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {faq.pageIds && Array.isArray(faq.pageIds) && faq.pageIds.length > 0 ? (
                                faq.pageIds.map((pageId: string) => (
                                  <span key={pageId} className="text-[8px] font-extrabold text-brand-neutral-muted bg-brand-neutral-gray border border-brand-neutral-border px-1.5 py-0.5 rounded uppercase">
                                    {pageId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[8px] font-extrabold text-red-500 bg-red-500/5 border border-red-500/10 px-1.5 py-0.5 rounded uppercase">No Page Link</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(faq)}
                              className={`inline-flex items-center space-x-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border transition-all duration-300 ${
                                faq.isEnabled
                                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10'
                                  : 'bg-brand-accent/5 text-brand-accent-dark border-brand-accent/30 hover:bg-brand-accent/15'
                              }`}
                              aria-label={`Toggle status from ${faq.isEnabled ? 'enabled' : 'disabled'}`}
                            >
                              {faq.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{faq.isEnabled ? 'enabled' : 'disabled'}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted pl-12">{faq.sortOrder}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => startEdit(faq)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Edit FAQ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(faq.id, faq.question)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                                aria-label="Delete FAQ"
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
                    <AlertCircle className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No FAQs Configured</h3>
                  <p className="text-xs text-brand-neutral-muted leading-relaxed">
                    There are no frequently asked questions listed in your database. Click "Create New FAQ" to populate.
                  </p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};