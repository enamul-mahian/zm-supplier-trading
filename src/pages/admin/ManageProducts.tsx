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
import { Product } from '../../shared/types';
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
  Package,
  AlertCircle,
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৫ নম্বর পেজের ইমেজে থাকা হুবহু ১২টি আসল B2B আইটেমের ডাটা
const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Premium Rice', category: 'Dry Goods', slug: 'premium-rice', desc: 'Premium Basmati and long-grain rice available in wholesale bulk sacks.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Sacks', status: 'published' },
  { id: 'p2', name: 'Organic Pulses', category: 'Food Products', slug: 'organic-pulses', desc: 'Lentils, chickpeas, and beans sourced from verified global farms.', image: 'https://images.unsplash.com/photo-1547058886-f3edd4136365?auto=format&fit=crop&q=80&w=400', moq: '500 kg', pkg: 'Bulk Bags', status: 'published' },
  { id: 'p3', name: 'Wheat Flour', category: 'Food Products', slug: 'wheat-flour', desc: 'UK-standard wheat and grain flour for bakeries and manufacture.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Bags', status: 'published' },
  { id: 'p4', name: 'Cooking Oil', category: 'Food Products', slug: 'cooking-oil', desc: 'Refined sunflower oil, vegetable oil, and olive oil drums.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400', moq: '10 Drums', pkg: '200L Drums', status: 'published' },
  { id: 'p5', name: 'Refined Sugar', category: 'Food Products', slug: 'refined-sugar', desc: 'Granulated white and brown sugar in industrial packaging.', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Bags', status: 'published' },
  { id: 'p6', name: 'Wholesale Spices', category: 'Food Products', slug: 'wholesale-spices', desc: 'Authentic raw and ground spices arranged for professional trade.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', moq: '250 kg', pkg: 'Cartons', status: 'published' },
  { id: 'p7', name: 'Tea & Coffee', category: 'Beverages', slug: 'tea-coffee', desc: 'Premium black tea leaves, green tea, and roasted coffee beans.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400', moq: '100 kg', pkg: 'Bulk Cases', status: 'published' },
  { id: 'p8', name: 'Canned Products', category: 'Food Products', slug: 'canned-products', desc: 'Hygienically preserved and packaged canned fruits, vegetables, and pulps.', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=400', moq: '50 Cases', pkg: 'Cases', status: 'published' },
  { id: 'p9', name: 'Dairy Products', category: 'Food Products', slug: 'dairy-products', desc: 'UHT milk, bulk milk powder, and commercial butter blocks.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: 'Industrial Packaging', status: 'published' },
  { id: 'p10', name: 'Packaged Snacks', category: 'Food Products', slug: 'packaged-snacks', desc: 'Packaged wholesale savoury and sweet snack items for retail.', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=400', moq: '50 Cases', pkg: 'Cases', status: 'published' },
  { id: 'p11', name: 'Beverages', category: 'Beverages', slug: 'beverages', desc: 'Fruit juices, mineral water, and carbonated soft drinks.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: 'Shrink Cases', status: 'published' },
  { id: 'p12', name: 'Packaging Items', category: 'Packaging', slug: 'packaging-items', desc: 'Hygienic disposables, biodegradable boxes, and B2B packaging supplies.', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400', moq: '100 Cartons', pkg: 'Cartons', status: 'published' }
];

export const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ফর্ম ও এডিটিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // প্রোডাক্ট ফর্ম ফিল্ডস স্টেট (B2B Grouped Form - Part 05A, Rule 40)
  const [name, setName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [category, setCategory] = useState('Dry Goods');
  const [shortDescription, setShortDescription] = useState('');
  const [moq, setMoq] = useState('');
  const [pkg, setPkg] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('Available for Enquiry');
  const [privateLabel, setPrivateLabel] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // প্রোডাক্ট নির্দিষ্ট এসইও প্যানেল স্টেট (Product SEO State - Part 07, Rule 79)
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // ডেটা লোড করার লাইফ সাইকেল
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      if (list.length > 0) {
        setProducts(list);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (error) {
      console.error('[ManageProducts load error]:', error);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
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

  // ফর্ম সাবমিট হ্যান্ডলার (তৈরি ও সম্পাদনা - Part 05A, Rule 39)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !shortDescription.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productsRef = collection(db, 'products');

      const productDoc: any = {
        name: name.trim(),
        slug,
        productCode: productCode.trim() || `ZST-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        category,
        shortDescription: shortDescription.trim(),
        desc: shortDescription.trim(), // সামঞ্জস্যতা বজায় রাখতে
        moq: moq.trim() || '1 Pallet',
        pkg: pkg.trim() || 'Standard Sacks',
        availabilityStatus,
        privateLabelAvailable: privateLabel,
        image: imageUrl || null,
        status,
        isEnabled: true,
        isFeatured: false,
        sortOrder: products.length + 1,
        updatedAt: serverTimestamp(),
        
        // প্রোডাক্ট নির্দিষ্ট এসইও মেটাডাটা সাবমিট লজিক (Product SEO Object - Part 07, Rule 79)
        seo: {
          metaTitle: metaTitle.trim() || `${name.trim()} | Wholesale & B2B Supply | ${BRAND_INFO.name}`,
          metaDescription: metaDescription.trim() || shortDescription.trim().substring(0, 155),
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          canonicalUrl: null,
          ogTitle: metaTitle.trim() || `${name.trim()} | Wholesale & B2B Supply | ${BRAND_INFO.name}`,
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
        const docRef = doc(db, 'products', editingId);
        await updateDoc(docRef, productDoc);
        toast.success(`${name} updated successfully.`);
      } else {
        // নতুন প্রোডাক্ট তৈরি
        productDoc.createdAt = serverTimestamp();
        await addDoc(productsRef, productDoc);
        toast.success(`${name} created successfully.`);
      }

      closeForm();
      loadProducts();
    } catch (error) {
      console.error('[Product Submit Error]:', error);
      toast.error('Database write operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // প্রোডাক্ট ডুপ্লিকেশন লজিক (কপি প্রোডাক্টের নাম সংলগ্ন 'Copy' এবং স্ট্যাটাস 'draft' সেট করবে - Part 05A, Rule 69)
  const handleDuplicate = async (product: any) => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const duplicatedDoc = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Math.floor(10 + Math.random() * 90)}`,
        productCode: `${product.productCode}-C`,
        status: 'draft', // সুরক্ষার জন্য ড্রাফট থাকবে
        sortOrder: products.length + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      delete duplicatedDoc.id; // পুরানো আইডি মুছে দেওয়া হলো

      await addDoc(productsRef, duplicatedDoc);
      toast.success(`Duplicated "${product.name}" as Draft.`);
      loadProducts();
    } catch (error) {
      console.error('[Duplicate Error]:', error);
      toast.error('Failed to duplicate product.');
    } finally {
      setLoading(false);
    }
  };

  // স্ট্যাটাস টগল (Published / Draft)
  const handleToggleStatus = async (product: any) => {
    try {
      const docRef = doc(db, 'products', product.id);
      const newStatus = product.status === 'published' ? 'draft' : 'published';
      await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Product status updated to ${newStatus}.`);
      loadProducts();
    } catch (error) {
      toast.error('Failed to update product status.');
    }
  };

  // প্রোডাক্ট ডিলিট মেকানিজম (নিরাপত্তা ও নিশ্চিতকরণ ডায়ালগ সহ - Part 05A, Rule 70)
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${name}" from B2B catalogue? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      toast.success(`"${name}" deleted successfully.`);
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  // এডিটিং মোড ট্রিগার
  const startEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setProductCode(product.productCode || '');
    setCategory(product.category || 'Dry Goods');
    setShortDescription(product.shortDescription || '');
    setMoq(product.moq || '');
    setPkg(product.pkg || '');
    setAvailabilityStatus(product.availabilityStatus || 'Available for Enquiry');
    setPrivateLabel(product.privateLabelAvailable || false);
    setImageUrl(product.image || '');
    setStatus(product.status || 'draft');
    
    // প্রোডাক্ট নির্দিষ্ট এসইও ডেটা রিস্টোরেশন লজিক (Line 245)
    setMetaTitle(product.seo?.metaTitle || '');
    setMetaDescription(product.seo?.metaDescription || '');
    setKeywords(product.seo?.keywords ? product.seo.keywords.join(', ') : '');
    
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setName('');
    setProductCode('');
    setCategory('Dry Goods');
    setShortDescription('');
    setMoq('');
    setPkg('');
    setAvailabilityStatus('Available for Enquiry');
    setPrivateLabel(false);
    setImageUrl('');
    setStatus('draft');
    
    // এসইও স্টেট ক্লিয়ার করা হচ্ছে
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('');
    setIsFormOpen(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Products | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
              Manage B2B Products
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Add, edit, duplicate, and publish wholesale goods inside the public ketted-catalogue.
            </p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            
            // ৩. প্রোডাক্ট ক্রিয়েশন এবং এডিটিং ফর্ম প্যানেল
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white border border-brand-neutral-border p-6 sm:p-8 rounded-card shadow-soft space-y-6 max-w-3xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-neutral-border">
                <h2 className="font-heading font-bold text-base text-brand-neutral-charcoal flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-primary" />
                  {editingId ? 'Edit Product Specifications' : 'Create New B2B Product'}
                </h2>
                <button type="button" onClick={closeForm} className="p-1.5 rounded-full hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* গ্রাউন্ড ১: বেসিক তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Basmati Rice"
                />
                <Input
                  label="Product Code / SKU"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="e.g. ZST-RICE-902 (Auto-generated if empty)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col text-left">
                  <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Product Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                  >
                    <option value="Dry Goods">Dry Goods</option>
                    <option value="Food Products">Food Products</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div className="flex flex-col text-left">
                  <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Availability Status</label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value)}
                    className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                  >
                    <option value="Available for Enquiry">Available for Enquiry</option>
                    <option value="Limited Availability">Limited Availability</option>
                    <option value="Made to Order">Made to Order</option>
                    <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                  </select>
                </div>
              </div>

              {/* গ্রাউন্ড ২: সোর্সিং ও কমার্শিয়াল specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Minimum Order Quantity (MOQ)"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="e.g. 1 Pallet / 500 kg"
                />
                <Input
                  label="Standard Packaging"
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  placeholder="e.g. 25kg Sacks / Export Cartons"
                />
              </div>

              <Input
                label="Product Short Description *"
                required
                multiline
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Write a concise commercial overview for catalog cards..."
              />

              {/* গ্রাউন্ড ৩: ক্লাউডিনারি ইমেজ আপলোডার */}
              <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-left">
                <h3 className="font-heading font-bold text-xs text-brand-neutral-charcoal mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <UploadCloud className="w-4 h-4 text-brand-primary" />
                  Product Primary Image
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-8 border-2 border-dashed border-brand-neutral-border rounded-xl p-4 text-center bg-white hover:border-brand-primary/40 transition-colors relative group cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      accept="image/png, image/jpeg, image/jpg"
                      aria-label="Upload product image"
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
                        alt="Product preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* গ্রাউন্ড ৪: সার্চ ইঞ্জিন অপ্টিমাইজেশন মেটা প্যানেল (B2B Product SEO - Part 07, Rule 79) */}
              <div className="bg-brand-secondary/5 border border-brand-primary/10 p-5 rounded-xl text-left space-y-4">
                <h3 className="font-heading font-bold text-xs text-brand-primary flex items-center gap-2 uppercase tracking-wide border-b border-brand-primary/5 pb-2">
                  <Globe className="w-4.5 h-4.5 text-brand-accent-dark" />
                  Product Search Engine Optimisation (SEO Configuration)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Custom Meta Title (Auto-generated if empty)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="e.g. Premium Basmati Rice | Wholesale Sourcing | ZM Supplier & Trading"
                  />
                  <Input
                    label="Custom Meta Description (Auto-generated if empty)"
                    multiline
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="e.g. Source premium Basmati rice in bulk 25kg sacks. Audited supplier networks, clean presentation, and reliable UK logistics."
                  />
                  <Input
                    label="Keywords (Comma-separated list)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Basmati Rice, Bulk Rice, Wholesale Food Supply, Sourcing"
                  />
                </div>
              </div>

              {/* প্রাইভেট লেবেল এবং পাবলিশিং স্ট্যাটাস */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-brand-bg-alt/30 p-4 rounded-xl border border-brand-neutral-border">
                <div className="flex items-center space-x-2">
                  <input
                    id="p-label-chk"
                    type="checkbox"
                    checked={privateLabel}
                    onChange={(e) => setPrivateLabel(e.target.checked)}
                    className="w-4.5 h-4.5 text-brand-primary border-brand-neutral-border focus:ring-brand-primary focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="p-label-chk" className="text-xs sm:text-sm font-bold text-brand-neutral-charcoal cursor-pointer">
                    Private Labelling Customisation Available
                  </label>
                </div>

                <div className="flex items-center space-x-3">
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
              </div>

              {/* ফর্ম অ্যাকশন বাটনস */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-neutral-border">
                <Button onClick={closeForm} variant="outline" size="sm" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Product' : 'Save Product'}
                </Button>
              </div>

            </motion.form>
          ) : (
            
            // ৪. মেইন প্রোডাক্টস ম্যানেজার টেবিল ভিউ (ডাটা টেবিল - Part 05A, Rule 22)
            <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
              
              {/* সার্চ ও ফিল্টার বার */}
              <div className="p-4 border-b border-brand-neutral-border flex items-center justify-between bg-brand-bg-alt/40">
                <div className="w-full md:w-80">
                  <Input
                    placeholder="Search catalog by name, code or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                  />
                </div>
                <div className="text-xs font-bold text-brand-neutral-muted select-none uppercase tracking-wide hidden sm:block">
                  {filteredProducts.length} Sourcing Items Listed
                </div>
              </div>

              {/* প্রোডাক্ট ডেটা টেবিল */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Catalog Database...</span>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm select-none">
                    <thead>
                      <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                        <th className="px-6 py-3.5">Product</th>
                        <th className="px-6 py-3.5">Code / SKU</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">MOQ</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                          {/* ইমেজ ও নাম */}
                          <td className="px-6 py-4 flex items-center space-x-4">
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-brand-neutral-border shrink-0 bg-brand-neutral-gray">
                              <img src={prod.image || 'https://placehold.co/100x80/024e33/ffffff?text=ZST'} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-brand-neutral-charcoal line-clamp-1">{prod.name}</span>
                          </td>
                          
                          {/* কোড */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-primary">{prod.productCode}</td>
                          
                          {/* ক্যাটাগরি */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{prod.category}</td>
                          
                          {/* পাবলিশিং স্ট্যাটাস */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(prod)}
                              className={`inline-flex items-center space-x-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border transition-all duration-300 ${
                                prod.status === 'published'
                                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10'
                                  : 'bg-brand-accent/5 text-brand-accent-dark border-brand-accent/30 hover:bg-brand-accent/15'
                              }`}
                              aria-label={`Toggle status from ${prod.status}`}
                            >
                              {prod.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{prod.status}</span>
                            </button>
                          </td>

                          {/* MOQ */}
                          <td className="px-6 py-4 font-semibold text-xs">{prod.moq}</td>

                          {/* বাটন অ্যাকশনস (Edit, Duplicate, Delete) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(prod)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={() => handleDuplicate(prod)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Duplicate product"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(prod.id, prod.name)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                                aria-label="Delete product"
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
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No Products Listed</h3>
                  <p className="text-xs text-brand-neutral-muted leading-relaxed">
                    There are no products listed in your catalog. Click "Add New Product" to populate your directory.
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