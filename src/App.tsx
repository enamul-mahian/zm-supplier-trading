import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/organisms/Header'; 
import { Footer } from './components/organisms/Footer'; 
import { Home } from './pages/Home'; 
import { About } from './pages/About'; 
import { Services } from './pages/Services'; 
import { Products } from './pages/Products'; 
import { ProductDetails } from './pages/ProductDetails'; 
import { CategoryDetails } from './pages/CategoryDetails'; 
import { WhyChooseUs } from './pages/WhyChooseUs'; 
import { Quality } from './pages/Quality'; 
import { GlobalTrade } from './pages/GlobalTrade'; 
import { Team } from './pages/Team'; 
import { Insights } from './pages/Insights'; 
import { FAQPage } from './pages/FAQ'; 
import { RequestQuote } from './pages/RequestQuote'; 
import { Contact } from './pages/Contact'; 
import { LegalPage } from './pages/Legal'; 
import { BlogDetails } from './pages/BlogDetails'; 
import { ServiceDetails } from './pages/ServiceDetails'; 
import { NotFoundPage } from './pages/NotFound'; 
import { AdminLogin } from './pages/admin/Login'; 
import { AdminLayout } from './components/layouts/AdminLayout'; 
import { Dashboard } from './pages/admin/Dashboard'; 
import { ManageProducts } from './pages/admin/ManageProducts'; 
import { ManageCategories } from './pages/admin/ManageCategories'; // নতুন ইমপোর্ট
import { ManageServices } from './pages/admin/ManageServices'; 
import { ManageEnquiries } from './pages/admin/ManageEnquiries'; 
import { ManageMessages } from './pages/admin/ManageMessages'; 
import { ManageInsights } from './pages/admin/ManageInsights'; 
import { ManageFAQs } from './pages/admin/ManageFAQs'; 
import { ManageSettings } from './pages/admin/ManageSettings';

// স্ক্রল রিস্টোরেশন হেল্পার (পেজ চেঞ্জ হলে স্বয়ংক্রিয়ভাবে স্ক্রল একদম উপরে নিয়ে যাবে)
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// গ্লোবাল লেআউট শেল
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-neutral-charcoal">
      <Header />
      <main className="flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />

      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#1C1C1C',
            border: '1px solid #EAEAEA',
            borderRadius: '12px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          },
        }}
      />

      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} /> 
          
          <Route path="/services/:slug" element={<ServiceDetails />} />
          
          <Route path="/products" element={<Products />} /> 
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/categories/:slug" element={<CategoryDetails />} /> 
          
          <Route path="/why-choose-us" element={<WhyChooseUs />} /> 
          <Route path="/quality" element={<Quality />} /> 
          <Route path="/global-trade" element={<GlobalTrade />} /> 
          <Route path="/team" element={<Team />} /> 
          <Route path="/insights" element={<Insights />} /> 
          
          <Route path="/insights/:slug" element={<BlogDetails />} /> 
          
          <Route path="/faq" element={<FAQPage />} /> 
          <Route path="/request-quote" element={<RequestQuote />} /> 
          <Route path="/contact" element={<Contact />} /> 
          
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/terms-and-conditions" element={<LegalPage />} />
          <Route path="/refund-policy" element={<LegalPage />} />
          <Route path="/cookie-policy" element={<LegalPage />} />

          {/* সুরক্ষিত অ্যাডমিন এরিয়া রাউটসমূহ */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="categories" element={<ManageCategories />} /> {/* নতুন রাউট */}
            <Route path="products" element={<ManageProducts />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="enquiries" element={<ManageEnquiries />} />
            <Route path="messages" element={<ManageMessages />} /> 
            <Route path="insights" element={<ManageInsights />} /> 
            <Route path="faqs" element={<ManageFAQs />} /> 
            <Route path="settings" element={<ManageSettings />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;