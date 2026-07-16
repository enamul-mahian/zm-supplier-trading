import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { TeamMember } from '../../shared/types';
import { Sparkles, Linkedin, Award, ShieldAlert, Cpu, HeartHandshake } from 'lucide-react';
import { Button } from '../atoms/Button';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
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

// কম্পোনেন্ট রেন্ডারিং স্কেলেটন
const SkeletonCard: React.FC = () => (
  <div className="bg-brand-surface p-5 rounded-card border border-brand-neutral-border shadow-soft animate-pulse h-[340px]">
    <div className="w-full h-44 bg-brand-neutral-gray rounded-xl mb-4" />
    <div className="h-5 bg-brand-neutral-gray rounded w-2/3 mb-2" />
    <div className="h-4 bg-brand-neutral-gray rounded w-1/3 mb-4" />
    <div className="h-4 bg-brand-neutral-gray rounded w-full mb-1" />
    <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
  </div>
);

export const TeamSection: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে ডায়নামিক টিম ডেটা কোয়েরি
  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        const teamRef = collection(db, 'teamMembers');
        const q = query(
          teamRef,
          where('isEnabled', '==', true),
          orderBy('sortOrder', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as TeamMember[];
        setTeam(list);
      } catch (error) {
        console.error('[Firestore Service Error - TeamSection]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ডে কাস্টম পান্না সবুজ ফ্লেয়ার */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none" />

      <div className="premium-container">
        
        {/* সেকশন হেডার প্যানেল (ম্যানেজমেন্ট ও প্রফেশনাল এক্সপার্টাইজ হেডিং - Part 03, Section 14) */}
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Our Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            ZM Supplier & Trading Team
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            Empowering your trade with structured coordination, professional documentation support, and strict quality checking guidelines.
          </p>
        </div>

        {/* কন্টেন্ট লোডিং স্টেট */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : team.length > 0 ? (
          
          // কন্ডিশন ১: ফায়ারস্টোরে ডাটা থাকলে রিয়েল টিম গ্রিড রেন্ডার হবে (Part 03, Section 14)
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {team.map((member) => (
              <motion.div
                key={member.id}
                className="bg-brand-surface p-5 rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
                variants={fadeUpVariants}
              >
                <div>
                  {/* টিম মেম্বার ইমেজ */}
                  <div className="w-full h-52 rounded-xl overflow-hidden mb-4 border border-brand-neutral-border relative bg-brand-neutral-gray">
                    <img 
                      src={member.photo?.secureUrl || 'https://placehold.co/400x300/1c1c1c/ffffff?text=ZM+Team'} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* নাম ও পদবী */}
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">
                    {member.name}
                  </h3>
                  <span className="text-xs font-bold text-brand-primary tracking-wider uppercase mb-3 inline-block">
                    {member.role}
                  </span>

                  {/* সংক্ষিপ্ত পরিচিতি বায়ো */}
                  <p className="text-sm text-brand-neutral-muted leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* এক্সটার্নাল লিঙ্ক বা লিংকডইন কানেকশন */}
                {member.linkedinUrl && (
                  <div className="mt-5 pt-4 border-t border-brand-neutral-border/50 flex justify-end">
                    <a 
                      href={member.linkedinUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-brand-accent transition-colors duration-300"
                      aria-label={`${member.name}'s LinkedIn profile`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          
          // কন্ডিশন ২: ফায়ারস্টোরে ডেটা না থাকলে আইনি ঝুঁকি এড়াতে "টিম এক্সপার্টাইজ" সেকশন রেন্ডার হবে (Part 03, Section 14)
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {/* এক্সপার্টাইজ কার্ড ১: বিটুবি সোর্সিং */}
            <motion.div 
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between text-left hover:-translate-y-1 transition-transform duration-300 group"
              variants={fadeUpVariants}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  <Cpu className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2.5">
                  B2B Sourcing Operations
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  Our specialists focus on product specification matching and coordinate directly with vetted international manufacturers to ensure hygienic presentation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-neutral-border/50">
                <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Expert Sourcing Desk</span>
              </div>
            </motion.div>

            {/* এক্সপার্টাইজ কার্ড ২: কমপ্লায়েন্স ও ডকুমেন্টেশন */}
            <motion.div 
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between text-left hover:-translate-y-1 transition-transform duration-300 group"
              variants={fadeUpVariants}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  <Award className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2.5">
                  Trade & Documentation Support
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  Dedicated assistance in compiling and organizing export compliance paperwork, trade checklists, and custom transaction communication details.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-neutral-border/50">
                <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Trade Compliance Support</span>
              </div>
            </motion.div>

            {/* এক্সপার্টাইজ কার্ড ৩: সরবরাহ ও লজিস্টিকস পরিকল্পনা */}
            <motion.div 
              className="bg-brand-surface p-6 rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between text-left hover:-translate-y-1 transition-transform duration-300 group"
              variants={fadeUpVariants}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-brand-primary/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                  <HeartHandshake className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2.5">
                  Supply Chain Logistics Support
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  Coordination of wholesale cargo container schedules, shipping manifests, packaging integrity checks, and predictable transit planning.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-neutral-border/50">
                <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">Supply Coordination Desk</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* সেকশনের নিচে গ্লোবাল ইনকোয়ারি সিটিএ অ্যাকশন */}
        <div className="mt-12 text-center">
          <Button to="/contact" variant="outline" size="md">
            Discuss Your Sourcing Needs
          </Button>
        </div>

      </div>
    </section>
  );
};