import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BRAND_INFO } from '../../shared/constants';
import { 
  Package, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';

export const Dashboard: React.FC = () => {
  // ড্যাশবোর্ড পরিসংখ্যান স্টেট
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    newQuotes: 0,
    newMessages: 0
  });

  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে ডাইনামিক ডেটা লোডিং (Part 05D, Rule 69)
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // ১. এককালীন রীডে ফায়ারস্টোরের সাইজ বা কাউন্ট ক্যালকুলেশন ( bounded queries - Part 05D, Rule 51)
        const [productsSnap, servicesSnap, quotesSnap, messagesSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'services')),
          getDocs(collection(db, 'quoteRequests')),
          getDocs(collection(db, 'contactMessages'))
        ]);

        setStats({
          totalProducts: productsSnap.size,
          totalServices: servicesSnap.size,
          newQuotes: quotesSnap.docs.filter(d => d.data().status === 'new').length,
          newMessages: messagesSnap.docs.filter(d => d.data().status === 'new').length
        });

        // ২. ৩টি অতি সাম্প্রতিক বায়ার কোটেশন রিকোয়েস্ট লোড করার লিমিটেড কোয়েরি
        const quotesRef = collection(db, 'quoteRequests');
        const recentQuery = query(quotesRef, orderBy('createdAt', 'desc'), limit(3));
        const recentSnap = await getDocs(recentQuery);
        
        const list = recentSnap.docs.map(docSnap => {
          const data = docSnap.data();
          let dateStr = 'Recent';
          if (data.createdAt) {
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            dateStr = date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
          }
          return {
            id: docSnap.id,
            ...data,
            createdAt: dateStr
          };
        });

        setRecentEnquiries(list);
      } catch (error) {
        console.error('[Dashboard Data Sourcing Error]:', error);
        // লোকাল বা ড্রাফট এনভায়রনমেন্টে ডেটাবেস সম্পূর্ণ ফাঁকা থাকলে ক্র্যাশ এড়াতে ফলব্যাক ডিফল্ট ০ থাকবে
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
        <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">
          Loading Dashboard Stats...
        </span>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats.totalProducts, 
      icon: <Package className="w-5 h-5 text-brand-primary" />,
      color: 'border-brand-primary/10'
    },
    { 
      label: 'Total Services', 
      value: stats.totalServices, 
      icon: <FileText className="w-5 h-5 text-brand-primary" />,
      color: 'border-brand-primary/10'
    },
    { 
      label: 'Pending Quotes', 
      value: stats.newQuotes, 
      icon: <FileText className="w-5 h-5 text-brand-accent-dark" />,
      color: 'border-brand-accent/20 bg-brand-accent/5'
    },
    { 
      label: 'New Messages', 
      value: stats.newMessages, 
      icon: <MessageSquare className="w-5 h-5 text-brand-primary" />,
      color: 'border-brand-primary/10'
    },
  ];

  return (
    <>
      {/* এসইও মেটা কন্ট্রোলস (অ্যাডমিন এরিয়া নো-ইনডেক্স - Part 07, Rule 11) */}
      <Helmet>
        <title>Dashboard | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার টাইটেল */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
              System Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Live oversight of ZM Supplier & Trading portal resources and buyer enquiries.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-brand-primary/5 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-primary/10 select-none">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>Real-time Status Active</span>
          </div>
        </div>

        {/* ৪-কলাম বিশিষ্ট ডেটা পরিসংখ্যান গ্রিড (Part 10, Section 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => (
            <div 
              key={idx}
              className={`bg-white p-6 rounded-card border shadow-soft flex items-center justify-between group hover:-translate-y-1 transition-transform duration-300 ${card.color}`}
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold text-brand-neutral-muted uppercase tracking-wider mb-2">
                  {card.label}
                </span>
                <span className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none select-none">
                  {card.value}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center border border-brand-primary/5">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* বায়ারদের থেকে আসা ৩টি অতি সাম্প্রতিক কোটেশন রিকোয়েস্ট (Recent Enquiries list - Part 05D, Rule 20) */}
        <div className="bg-white rounded-card border border-brand-neutral-border shadow-soft p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 border-b border-brand-neutral-border mb-6">
            <h2 className="font-heading font-bold text-base text-brand-neutral-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              Recent B2B Sourcing Enquiries
            </h2>
            <Link 
              to="/admin/enquiries" 
              className="text-xs font-bold text-brand-primary flex items-center hover:text-brand-accent-dark transition-colors"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentEnquiries.length > 0 ? (
            // কন্ডিশন ১: যদি কোটেশন রিকোয়েস্ট ডেটা থাকে
            <div className="flex flex-col space-y-4">
              {recentEnquiries.map((enquiry) => (
                <div 
                  key={enquiry.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-bg-alt/40 p-4 rounded-xl border border-brand-neutral-border shadow-soft hover:border-brand-primary/20 transition-all duration-300 gap-4"
                >
                  <div className="text-left flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-extrabold text-brand-neutral-muted uppercase tracking-wider">Ref: {enquiry.referenceNumber}</span>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        enquiry.status === 'new' 
                          ? 'bg-brand-accent text-brand-neutral-charcoal border border-brand-accent/30' 
                          : 'bg-brand-primary/5 text-brand-primary'
                      }`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-brand-neutral-charcoal mb-0.5">
                      {enquiry.companyName}
                    </span>
                    <span className="text-xs text-brand-neutral-muted">
                      Contact: {enquiry.contactName} | Route: {enquiry.destination || 'UK Supply'}
                    </span>
                  </div>

                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end justify-between shrink-0">
                    <span className="text-xs font-bold text-brand-primary mb-1">
                      {enquiry.requiredQuantity ? `${enquiry.requiredQuantity} ${enquiry.quantityUnit || 'Cartons'}` : 'Custom Sourcing'}
                    </span>
                    <span className="text-[10px] text-brand-neutral-muted font-bold uppercase tracking-wider">{enquiry.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // কন্ডিশন ২: গ্রিনফিল্ড ডাটাবেসে বায়ারের সাবমিশন পেন্ডিং থাকলে ক্লিন এম্পটি স্টেট
            <div className="py-12 flex flex-col items-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-brand-primary/5 rounded-full flex items-center justify-center border border-brand-primary/10 mb-4 select-none">
                <Inbox className="w-5.5 h-5.5 text-brand-primary" />
              </div>
              <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-1">No Active Enquiries</h3>
              <p className="text-xs text-brand-neutral-muted leading-relaxed">
                Sourcing requests and bulk supply enquiries submitted by commercial buyers will appear here in real-time.
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};