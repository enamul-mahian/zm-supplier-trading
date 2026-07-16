import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

// HTML ডকের 'root' ডিভ এলিমেন্টকে টার্গেট করে রিয়্যাক্ট অ্যাপ মাউন্ট করা হচ্ছে
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* গ্লোবাল এসইও (Dynamic SEO) নিয়ন্ত্রণের জন্য HelmetProvider র‍্যাপার */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);