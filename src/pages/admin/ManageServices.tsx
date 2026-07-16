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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Service } from '../../shared/types';
import { BRAND_INFO } from '../../shared/constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  UploadCloud, 
  X, 
  CheckCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Globe // গ্লোবাল এসইও প্যানেলের আইকন ইমপোর্ট
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে বিটুবি সার্ভিস ম্যানেজার ফলব্যাক ডেটা
const FALLBACK_SERVICES = [
  { id: 's1', name: 'Product Sourcing', slug: 'product-sourcing', eyebrow: 'B2B Sourcing Operations', shortDescription: 'We specialise in coordinating strict product specification matching with manufacturers across the UK and globally.', status: 'published', sortOrder: 1 },
  { id: 's2', name: 'Wholesale Supply', slug: 'wholesale-supply', eyebrow: 'Bulk Consignment Planning', shortDescription: 'Bulk supply solutions for retailers, distributors, importers and businesses.', status: 'published', sortOrder: 2 },
  { id: 's3', name: 'Private Label Support', slug: 'private-label-support', eyebrow: 'Custom Brand Design', shortDescription: 'Custom private label solutions to build and grow your own brand.', status: 'published', sortOrder: 3 },
  { id: 's4', name: 'Logistics Planning', slug: 'logistics-planning', eyebrow: 'Freight Coordination', shortDescription: 'Reliable logistics and on-time delivery across the UK and worldwide.', status: 'draft', sortOrder: 4 }
];

export const ManageServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ফর্ম ও এডিটিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // সার্ভিস ফর্ম ফিল্ডস স্টেট (Part 05C, Rule 43)
  const [name, setName] = useState('');
  const [eyebrow, setEyebrow] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // সার্ভিস নির্দিষ্ট এসইও প্যানেল স্টেট (Service SEO State - Part 07, Rule 79)
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // ডেটা লোড করার লাইফ সাইকেল
  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      if (list.length > 0) {
        setServices(list);
      } else {
        setServices(FALLBACK_SERVICES);
      }
    } catch (error) {
      console.error('[ManageServices load error]:', error);
      setServices(FALLBACK_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // ক্লাউডিনারি ইমেজ আপলোডার (Vite টাইপ-সেফ - Part 07, Rule 61)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, and JPEG images are allowed.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // সর্বোচ্চ ৩ এমবি
      toast.error('Maximum image size is 3MB.');
      return;
    }

    setUploadingImage(true);
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      // স্যান্ডবক্স মোড অটো-ফিট
      setTimeout(() => {
        setImageUrl('https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg');
        setUploadingImage(false);
        toast.success('Image uploaded successfully (Sandbox Mode).');
      }, 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success('Image uploaded successfully to Cloudinary.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ফর্ম সাবমিট হ্যান্ডলার (তৈরি ও সম্পাদনা - Part 05C, Rule 44)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !shortDescription.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const servicesRef = collection(db, 'services');

      const serviceDoc: any = {
        name: name.trim(),
        slug,
        eyebrow: eyebrow.trim() || 'ZM Sourcing Solutions',
        shortDescription: shortDescription.trim(),
        fullDescription: shortDescription.trim(), // সামঞ্জস্যতা বজায় রাখতে
        cardImage: imageUrl ? { secureUrl: imageUrl } : null,
        heroImage: imageUrl ? { secureUrl: imageUrl } : null,
        status,
        isEnabled: true,
        isFeatured: false,
        sortOrder: services.length + 1,
        updatedAt: serverTimestamp(),

        // সার্ভিস নির্দিষ্ট এসইও মেটাডাটা সাবমিট লজিক (Service SEO Object - Part 07, Rule 79)
        seo: {
          metaTitle: metaTitle.trim() || `${name.trim()} | Sourcing & Sourcing Solutions | ${BRAND_INFO.name}`,
          metaDescription: metaDescription.trim() || shortDescription.trim().substring(0, 155),
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          canonicalUrl: null,
          ogTitle: metaTitle.trim() || `${name.trim()} | Sourcing & Sourcing Solutions | ${BRAND_INFO.name}`,
          ogDescription: metaDescription.trim() || shortDescription.trim().substring(0, 155),
          ogImage: imageUrl ? { secureUrl: imageUrl } : null,
          twitterCard: 'summary_large_image',
          robotsIndex: true,
          robotsFollow: true,
          schemaEnabled: true,
          faqSchemaEnabled: false,
          breadcrumbSchemaEnabled: true
        }
      };

      if (editingId) {
        // এডিট বা মডিফিকেশন প্রসেস
        const docRef = doc(db, 'services', editingId);
        await updateDoc(docRef, serviceDoc);
        toast.success(`${name} updated successfully.`);
      } else {
        // নতুন সার্ভিস তৈরি
        serviceDoc.createdAt = serverTimestamp();
        await addDoc(servicesRef, serviceDoc);
        toast.success(`${name} created successfully.`);
      }

      closeForm();
      loadServices();
    } catch (error) {
      console.error('[Service Submit Error]:', error);
      toast.error('Database write operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // সার্ভিস ডুপ্লিকেশন লজিক (কপি ফাইলের নাম সংলগ্ন 'Copy' এবং স্ট্যাটাস 'draft' সেট করবে - Part 05C, Rule 62)
  const handleDuplicate = async (service: any) => {
    try {
      setLoading(true);
      const servicesRef = collection(db, 'services');
      const duplicatedDoc = {
        ...service,
        name: `${service.name} (Copy)`,
        slug: `${service.slug}-copy-${Math.floor(10 + Math.random() * 90)}`,
        status: 'draft', // সুরক্ষার জন্য ড্রাফট থাকবে
        sortOrder: services.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      delete duplicatedDoc.id; // পুরানো আইডি মুছে দেওয়া হলো

      await addDoc(servicesRef, duplicatedDoc);
      toast.success(`Duplicated "${service.name}" as Draft.`);
      loadServices();
    } catch (error) {
      console.error('[Duplicate Error]:', error);
      toast.error('Failed to duplicate service.');
    } finally {
      setLoading(false);
    }
  };

  // স্ট্যাটাস টগল (Published / Draft)
  const handleToggleStatus = async (service: any) => {
    try {
      const docRef = doc(db, 'services', service.id);
      const newStatus = service.status === 'published' ? 'draft' : 'published';
      await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Service status updated to ${newStatus}.`);
      loadServices();
    } catch (error) {
      toast.error('Failed to update service status.');
    }
  };

  // সার্ভিস ডিলিট মেকানিজম (নিরাপত্তা ও নিশ্চিতকরণ ডায়ালগ সহ - Part 05C, Rule 64)
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${name}" from B2B services directory? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'services', id);
      await deleteDoc(docRef);
      toast.success(`"${name}" deleted successfully.`);
      loadServices();
    } catch (error) {
      toast.error('Failed to delete service.');
    } finally {
      setLoading(false);
    }
  };

  // এডিটিং মোড ট্রিগার
  const startEdit = (service: any) => {
    setEditingId(service.id);
    setName(service.name);
    setEyebrow(service.eyebrow || '');
    setShortDescription(service.shortDescription || '');
    setImageUrl(service.cardImage?.secureUrl || '');
    setStatus(service.status || 'draft');

    // সার্ভিস নির্দিষ্ট এসইও ডেটা রিস্টোরেশন লজিক
    setMetaTitle(service.seo?.metaTitle || '');
    setMetaDescription(service.seo?.metaDescription || '');
    setKeywords(service.seo?.keywords ? service.seo.keywords.join(', ') : '');

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setName('');
    setEyebrow('');
    setShortDescription('');
    setImageUrl('');
    setStatus('draft');

    // এসইও স্টেট ক্লিয়ার করা হচ্ছে
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('');
    setIsFormOpen(false);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.eyebrow?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Services | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
              Manage B2B Services
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Add, edit, duplicate, and publish commercial supply services inside the public directory.
            </p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            
            // ৩. সার্ভিস ক্রিয়েশন এবং এডিটিং ফর্ম প্যানেল
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white border border-brand-neutral-border p-6 sm:p-8 rounded-card shadow-soft space-y-6 max-w-3xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-neutral-border">
                <h2 className="font-heading font-bold text-base text-brand-neutral-charcoal flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-primary" />
                  {editingId ? 'Edit Service Specifications' : 'Create New B2B Service'}
                </h2>
                <button type="button" onClick={closeForm} className="p-1.5 rounded-full hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* গ্রাউন্ড ১: বেসিক তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Service Name *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wholesale Supply"
                />
                <Input
                  label="Service Eyebrow (Category/Desk)"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="e.g. Bulk Consignment Planning"
                />
              </div>

              <Input
                label="Service Short Description *"
                required
                multiline
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Write a concise commercial overview for service cards..."
              />

              {/* গ্রাউন্ড ২: ক্লাউডিনারি ইমেজ আপলোডার */}
              <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-left">
                <h3 className="font-heading font-bold text-xs text-brand-neutral-charcoal mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <UploadCloud className="w-4 h-4 text-brand-primary" />
                  Service Primary Image
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-8 border-2 border-dashed border-brand-neutral-border rounded-xl p-4 text-center bg-white hover:border-brand-primary/40 transition-colors relative group cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      accept="image/png, image/jpeg, image/jpg"
                      aria-label="Upload service image"
                    />
                    <UploadCloud className="w-8 h-8 text-brand-neutral-muted mx-auto mb-2 group-hover:scale-105 transition-transform" />
                    <span className="block text-xs font-bold text-brand-neutral-charcoal mb-1">
                      {uploadingImage ? 'Uploading Image...' : 'Upload Image'}
                    </span>
                    <span className="block text-[10px] text-brand-neutral-muted">
                      Allowed: PNG, JPEG (Max 3MB)
                    </span>
                  </div>

                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-28 h-24 rounded-lg overflow-hidden border border-brand-neutral-border bg-brand-neutral-gray relative">
                      <img 
                        src={imageUrl || 'https://placehold.co/150x120/1c1c1c/ffffff?text=No+Image'} 
                        alt="Service preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* গ্রাউন্ড ৩: সার্চ ইঞ্জিন অপ্টিমাইজেশন মেটা প্যানেল (B2B Service SEO - Part 07, Rule 79) */}
              <div className="bg-brand-secondary/5 border border-brand-primary/10 p-5 rounded-xl text-left space-y-4">
                <h3 className="font-heading font-bold text-xs text-brand-primary flex items-center gap-2 uppercase tracking-wide border-b border-brand-primary/5 pb-2">
                  <Globe className="w-4.5 h-4.5 text-brand-accent-dark" />
                  Service Search Engine Optimisation (SEO Configuration)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Custom Meta Title (Auto-generated if empty)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="e.g. Sourcing & wholesale Supply | Sourcing Solutions | ZM Supplier & Trading"
                  />
                  <Input
                    label="Custom Meta Description (Auto-generated if empty)"
                    multiline
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="e.g. We coordinate secure wholesale product supplies and B2B sessional contracts cleanly."
                  />
                  <Input
                    label="Keywords (Comma-separated list)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Wholesale Supply, Bulk Trade, Contract Coordination"
                  />
                </div>
              </div>

              {/* পাবলিশিং স্ট্যাটাস কন্ট্রোল */}
              <div className="flex justify-between items-center bg-brand-bg-alt/30 p-4 rounded-xl border border-brand-neutral-border">
                <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wide">Publish State</span>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="bg-white border border-brand-neutral-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-neutral-charcoal focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* ফর্ম অ্যাকশন বাটনস */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-neutral-border">
                <Button onClick={closeForm} variant="outline" size="sm" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Service' : 'Save Service'}
                </Button>
              </div>

            </motion.form>
          ) : (
            
            // ৪. মেইন সার্ভিসেস ম্যানেজার টেবিল ভিউ (ডাটা টেবিল - Part 05C, Rule 42)
            <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
              
              {/* সার্চ ও ফিল্টার বার */}
              <div className="p-4 border-b border-brand-neutral-border flex items-center justify-between bg-brand-bg-alt/40">
                <div className="w-full md:w-80">
                  <Input
                    placeholder="Search directory by name or desk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                  />
                </div>
                <div className="text-xs font-bold text-brand-neutral-muted select-none uppercase tracking-wide hidden sm:block">
                  {filteredServices.length} B2B Services Listed
                </div>
              </div>

              {/* সার্ভিস ডেটা টেবিল */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Services Directory...</span>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm select-none">
                    <thead>
                      <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                        <th className="px-6 py-3.5">Service</th>
                        <th className="px-6 py-3.5">Slug</th>
                        <th className="px-6 py-3.5">Desk</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                      {filteredServices.map((service) => (
                        <tr key={service.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                          {/* ইমেজ ও নাম */}
                          <td className="px-6 py-4 flex items-center space-x-4">
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-brand-neutral-border shrink-0 bg-brand-neutral-gray">
                              <img src={service.cardImage?.secureUrl || 'https://placehold.co/100x80/024e33/ffffff?text=ZST'} alt={service.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-brand-neutral-charcoal line-clamp-1">{service.name}</span>
                          </td>
                          
                          {/* স্লাগ */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-primary">{service.slug}</td>
                          
                          {/* ডেস্ক */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{service.eyebrow}</td>
                          
                          {/* পাবলিশিং স্ট্যাটাস */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(service)}
                              className={`inline-flex items-center space-x-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border transition-all duration-300 ${
                                service.status === 'published'
                                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10'
                                  : 'bg-brand-accent/5 text-brand-accent-dark border-brand-accent/30 hover:bg-brand-accent/15'
                              }`}
                              aria-label={`Toggle status from ${service.status}`}
                            >
                              {service.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{service.status}</span>
                            </button>
                          </td>

                          {/* বাটন অ্যাকশনস (Edit, Duplicate, Delete) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(service)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Edit service"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(service)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Duplicate service"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(service.id, service.name)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                                aria-label="Delete service"
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
                // খালি স্টেট
                <div className="py-20 flex flex-col items-center max-w-sm mx-auto text-center">
                  <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                    <AlertCircle className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No Services Listed</h3>
                  <p className="text-xs text-brand-neutral-muted leading-relaxed">
                    There are no services listed in your directory. Click "Add New Service" to populate.
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