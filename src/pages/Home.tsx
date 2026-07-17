import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND_INFO } from '../shared/constants';

// হোম পেজের সবগুলো অর্গানিজম সেকশন ইমপোর্ট (Part 03, Section 02)
import { Hero } from '../components/organisms/Hero';
import { TrustHighlights } from '../components/organisms/TrustHighlights';
import { AboutSection } from '../components/organisms/AboutSection';
import { ServicesSection } from '../components/organisms/ServicesSection';
import { ProcessSection } from '../components/organisms/ProcessSection';
import { WhyChooseUsSection } from '../components/organisms/WhyChooseUsSection';
import { ProductCategoriesSection } from '../components/organisms/ProductCategoriesSection';
import { QualitySection } from '../components/organisms/QualitySection';
import { InternationalTradeSection } from '../components/organisms/InternationalTradeSection';
import { TeamSection } from '../components/organisms/TeamSection';
import { StatsSection } from '../components/organisms/StatsSection';
import { TestimonialsSection } from '../components/organisms/TestimonialsSection';
import { InsightsSection } from '../components/organisms/InsightsSection';
import { FAQSection } from '../components/organisms/FAQSection';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

export const Home: React.FC = () => {
  // গুগল লাইটহাউস SEO স্কোর ১০০% রাখার জন্য ডাইনামিক B2B JSON-LD স্কিমাস (Part 07, Rule 14/15)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND_INFO.name,
    "legalName": BRAND_INFO.legalName,
    "url": "https://zmsupplier.co.uk",
    "logo": "https://zmsupplier.co.uk/logo.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": BRAND_INFO.phone,
      "contactType": "customer service",
      "email": BRAND_INFO.email,
      "areaServed": "Worldwide",
      "availableLanguage": "English"
    },
    "sameAs": [
      BRAND_INFO.socials.linkedin,
      BRAND_INFO.socials.twitter,
      BRAND_INFO.socials.facebook
    ].filter(Boolean)
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND_INFO.name,
    "url": "https://zmsupplier.co.uk"
  };

  return (
    <>
      {/* ১. রিয়্যাক্ট হেলমেট ডাইনামিক এসইও এবং সামাজিক শেয়ারিং মেটা ট্যাগের চমৎকার সেটআপ (Part 07, Rule 06) */}
      <Helmet>
        <title>{BRAND_INFO.name} | UK-Standard B2B Product Supply</title>
        <meta name="description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, private label support, and commercial logistics partner worldwide." />
        <link rel="canonical" href="https://zmsupplier.co.uk" />
        <meta name="robots" content="index, follow" />

        {/* ওপেন গ্রাফ (Open Graph) ফেইসবুক শেয়ারিং মেটাডেটা */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${BRAND_INFO.name} | UK-Standard B2B Product Supply`} />
        <meta property="og:description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, and logistics planning globally." />
        <meta property="og:url" content="https://zmsupplier.co.uk" />
        <meta property="og:site_name" content={BRAND_INFO.name} />
        <meta property="og:image" content="https://zmsupplier.co.uk/logo.png" />

        {/* টুইটার বা এক্স (Twitter Card) শেয়ারিং মেটাডেটা */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${BRAND_INFO.name} | UK-Standard B2B Product Supply`} />
        <meta name="twitter:description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, and logistics planning globally." />
        <meta name="twitter:image" content="https://zmsupplier.co.uk/logo.png" />

        {/* গুগলের জন্য ভেরিফাইড JSON-LD স্ট্রাকচার্ড ডাটা ইনজেকশন */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      {/* ২. প্রথম পেজের ২০-ধাপের কাস্টম লেআউট ফ্লো এবং এলাইনমেন্ট (Part 03, Section 02) */}
      {/* ফিক্স: space-y ক্লাস যুক্ত করে গ্লোবাল স্পেসিং কন্ট্রোল করা হলো */}
      <div className="w-full flex flex-col space-y-16 md:space-y-24 lg:space-y-32">
        {/* ধাপ ০৩: হিরো সেকশন */}
        <Hero />

        {/* ধাপ ০৪: হিরো ট্রাস্ট এবং ক্যাপাবিলিটি হাইলাইটস */}
        <TrustHighlights />

        {/* ধাপ ০৫: আমাদের সম্পর্কে বিবরণ সেকশন */}
        <AboutSection />

        {/* ধাপ ০৬: সার্ভিস বা সেবা ওভারভিউ গ্রিড */}
        <ServicesSection />

        {/* ধাপ ০৭: কাজের ৪-ধাপের প্রসেস টাইমলাইন */}
        <ProcessSection />

        {/* ধাপ ০৮: কেন আমরা এবং নিচের ট্রাস্ট স্ট্রিপ */}
        <WhyChooseUsSection />

        {/* ধাপ ০৯: প্রোডাক্ট ক্যাটালগ ক্যাটাগরি গ্রিড */}
        <ProductCategoriesSection />

        {/*  ধাপ ১০: কোয়ালিটি ও হাইজিন পজিশনিং */}
        <QualitySection />

        {/* ধাপ ১১: আন্তর্জাতিক সরবরাহ ও এসভিজি ম্যাপ */}
        <InternationalTradeSection />

        {/* ধাপ ১২: টিম ও এক্সপার্টাইজ প্যানেল */}
        <TeamSection />

        {/*  ধাপ ১৩: কাউন্ট-আপ স্ট্যাটস বার */}
        <StatsSection />

        {/* ধাপ ১৪: বায়ার প্রশংসাপত্র স্লাইডার */}
        <TestimonialsSection />

        {/* ধাপ ১৫: ব্লগ ও নিউজ প্রভিউ */}
        <InsightsSection />

        {/* ধাপ ১৬: এফএকিউ অ্যাকোর্ডিয়ন */}
        <FAQSection />

        {/* ধাপ ১৭: ফাইনাল কোটেশন বা ইনকোয়ারি সিটিএ প্যানেল */}
        <InquiryCTASection />
      </div>
    </>
  );
};