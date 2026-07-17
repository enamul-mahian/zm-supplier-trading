import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND_INFO } from '../shared/constants';

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
      <Helmet>
        <title>{BRAND_INFO.name} | UK-Standard B2B Product Supply</title>
        <meta name="description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, private label support, and commercial logistics partner worldwide." />
        <link rel="canonical" href="https://zmsupplier.co.uk" />
        <meta name="robots" content="index, follow" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${BRAND_INFO.name} | UK-Standard B2B Product Supply`} />
        <meta property="og:description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, and logistics planning globally." />
        <meta property="og:url" content="https://zmsupplier.co.uk" />
        <meta property="og:site_name" content={BRAND_INFO.name} />
        <meta property="og:image" content="https://zmsupplier.co.uk/logo.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${BRAND_INFO.name} | UK-Standard B2B Product Supply`} />
        <meta name="twitter:description" content="Reliable UK-standard B2B product sourcing, wholesale supply, import-export coordination, and logistics planning globally." />
        <meta name="twitter:image" content="https://zmsupplier.co.uk/logo.png" />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      {/* ফিক্স: space-y ক্লাসটি রিমুভ করা হয়েছে, যাতে সেকশনগুলোর মাঝে ডাবল গ্যাপ তৈরি না হয় */}
      <div className="w-full flex flex-col">
        <Hero />
        <TrustHighlights />
        <AboutSection />
        <ServicesSection />
        <ProcessSection />
        <WhyChooseUsSection />
        <ProductCategoriesSection />
        <QualitySection />
        <InternationalTradeSection />
        <TeamSection />
        <StatsSection />
        <TestimonialsSection />
        <InsightsSection />
        <FAQSection />
        <InquiryCTASection />
      </div>
    </>
  );
};