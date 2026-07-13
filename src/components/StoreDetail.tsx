import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, Check, Copy, Tag, Percent, Calendar, Heart, Share2, HelpCircle } from 'lucide-react';
import { Store, Coupon } from '../types';

interface StoreDetailProps {
  store: Store;
  coupons: Coupon[];
  onBackToStores: () => void;
  onUseCoupon: (couponId: string) => Promise<void>;
}

export default function StoreDetail({ store, coupons, onBackToStores, onUseCoupon }: StoreDetailProps) {
  const [copiedCoupon, setCopiedCoupon] = useState<Coupon | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Filter coupons for this specific store
  const storeCoupons = coupons.filter(c => c.storeId === store.id);

  const handleGetDealOrCode = async (coupon: Coupon) => {
    // 1. Open store link in a new tab
    const url = coupon.targetUrl || store.targetUrl;
    window.open(url, '_blank', 'noopener,noreferrer');

    // 2. Increment used counter via API
    await onUseCoupon(coupon.id);

    // 3. Trigger Copy if it's a code
    if (coupon.type === 'code' && coupon.code) {
      try {
        await navigator.clipboard.writeText(coupon.code);
      } catch (err) {
        console.error('Failed to copy code to clipboard:', err);
      }
    }

    // 4. Reveal the coupon code inside a premium top notification bar
    setCopiedCoupon(coupon);
    setShowNotification(true);

    // Auto dismiss notification after 15 seconds so they have plenty of time
    setTimeout(() => {
      // Keep it until closed manually or replaced
    }, 15000);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Brief visual indicator on copy icon if needed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-20">
      {/* 1. Top Bar Notification (Persistent overlay when code is activated) */}
      <AnimatePresence>
        {showNotification && copiedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#7c3aed] text-white shadow-xl px-6 py-4 border-b border-purple-700"
          >
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-sans font-bold text-sm tracking-wide">
                    {copiedCoupon.type === 'code' ? 'COUPON CODE COPIED!' : 'DEAL ACTIVATED!'}
                  </h4>
                  <p className="text-white/80 text-[11px] font-mono mt-0.5">
                    We've opened {store.name} in a new tab. Paste the code at checkout!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                {copiedCoupon.type === 'code' && copiedCoupon.code ? (
                  <div className="flex items-center border border-white/30 bg-white/10 px-3 py-1.5 font-mono text-sm uppercase select-all tracking-wider font-semibold">
                    <span className="mr-3">{copiedCoupon.code}</span>
                    <button
                      onClick={() => handleCopyCode(copiedCoupon.code!)}
                      className="text-white hover:text-white/80 transition-colors border-l border-white/20 pl-2 ml-1"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4 inline" />
                    </button>
                  </div>
                ) : (
                  <span className="text-white bg-white/20 px-3 py-1.5 font-mono text-xs uppercase tracking-widest font-semibold">
                    Deal Applied Automatically
                  </span>
                )}
                
                <button
                  onClick={() => setShowNotification(false)}
                  className="bg-white text-[#7c3aed] hover:bg-white/95 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider font-bold transition-all rounded-none cursor-pointer"
                >
                  Got It, Thanks
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        {/* 2. Understated Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-sans text-[#7a7875] mb-8 uppercase tracking-wider">
          <button onClick={onBackToStores} className="hover:text-accent transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#bebdb9]" />
          <button onClick={onBackToStores} className="hover:text-accent transition-colors">
            Stores
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#bebdb9]" />
          <span className="text-theme-text font-semibold">{store.name}</span>
        </nav>

        {/* Back Link */}
        <button
          onClick={onBackToStores}
          className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text font-mono text-[9px] uppercase tracking-widest mb-10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Curator Catalog</span>
        </button>

        {/* 3. Header Segment */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12 border-b border-theme-border/50 pb-10">
          {/* Circular Store Brand Logo */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white border border-[#e0dfdb] rounded-full flex items-center justify-center p-6 shadow-xs relative overflow-hidden shrink-0">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-contain filter grayscale"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-serif text-3xl font-bold tracking-widest text-theme-text">
                {store.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Title & Metadata Block */}
          <div className="text-center sm:text-left pt-2">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#121110] font-normal tracking-wide mb-3">
              {store.name} Coupon Codes
            </h1>
            <p className="text-sm text-[#5a5855] max-w-2xl leading-relaxed font-sans mb-4">
              {store.description}
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-5 gap-y-2 text-[#7a7875] font-mono text-[10px] tracking-wide uppercase">
              <span className="font-semibold text-[#1a1918]">
                {storeCoupons.length} Active {storeCoupons.length === 1 ? 'Coupon' : 'Coupons'}
              </span>
              <span className="hidden sm:inline text-[#cccbc8]">•</span>
              <span>$100 Average Savings</span>
              <span className="hidden sm:inline text-[#cccbc8]">•</span>
              <span className="text-accent font-semibold">July 2026 Promo List</span>
            </div>
          </div>
        </div>

        {/* 4. Main Body: Coupons list & sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Coupon Cards (3/4 layout) */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="font-serif text-lg tracking-wide text-theme-text uppercase font-semibold mb-6 border-b border-theme-border pb-3">
              Active Vouchers & Exclusive Codes
            </h2>

            {storeCoupons.length > 0 ? (
              storeCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white border border-[#eae9e5] hover:border-[#bebdb9] transition-all duration-300 shadow-xs flex flex-col sm:flex-row items-stretch rounded-xs"
                >
                  {/* Left Block - Discount Badge */}
                  <div className="w-full sm:w-44 bg-[#fcfbf9] border-b sm:border-b-0 sm:border-r border-[#eae9e5] p-6 flex flex-col justify-center items-center shrink-0 relative min-h-[140px]">
                    <div className="text-center">
                      <span className="font-sans font-bold text-2xl sm:text-3xl text-[#121110] block tracking-tight">
                        {coupon.discount}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7a7875] mt-1 block">
                        SAVINGS
                      </span>
                    </div>

                    {/* Left Footer Solid Strip (Vibrant purple for codes, grey or soft accent for deals) */}
                    <div className={`absolute bottom-0 left-0 right-0 text-center py-1 text-[8.5px] font-mono tracking-widest text-white uppercase ${
                      coupon.type === 'code' ? 'bg-[#7c3aed]' : 'bg-theme-text'
                    }`}>
                      {coupon.type === 'code' ? 'CODE' : 'SALE'}
                    </div>
                  </div>

                  {/* Middle Block - Content */}
                  <div className="grow p-6 flex flex-col justify-between">
                    <div>
                      {/* Verified Badge */}
                      <div className="flex items-center gap-2 mb-3.5">
                        {coupon.verified && (
                          <span className="bg-[#fef9c3] text-[#713f12] text-[8.5px] font-mono uppercase tracking-widest font-semibold px-2.5 py-0.5 border border-[#fef08a]">
                            Verified
                          </span>
                        )}
                        <span className="text-[#a1a09c] text-[9.5px] font-mono tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#15803d]" />
                          Tested July 2026
                        </span>
                      </div>

                      {/* Coupon Title */}
                      <h3 className="font-serif text-base sm:text-lg text-[#1a1918] font-semibold leading-snug hover:text-accent transition-colors mb-2">
                        {coupon.title}
                      </h3>

                      {/* Coupon Description */}
                      <p className="text-[#5a5855] text-xs leading-relaxed max-w-xl font-sans">
                        {coupon.description}
                      </p>
                    </div>

                    {/* Expiry / Small detail */}
                    <div className="mt-5 pt-3 border-t border-dashed border-[#e5e4e0] flex items-center gap-2 text-[#9a9994] font-mono text-[9px] uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>EXPIRY: 31st July 2026</span>
                    </div>
                  </div>

                  {/* Right Block - Action & Counter */}
                  <div className="p-6 sm:w-56 shrink-0 border-t sm:border-t-0 sm:border-l border-dashed border-[#eae9e5] flex flex-col justify-center items-center bg-[#fdfdfc] text-center gap-3">
                    <button
                      onClick={() => handleGetDealOrCode(coupon)}
                      className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3.5 px-6 font-mono text-[10.5px] font-bold uppercase tracking-widest transition-all shadow-sm active:translate-y-px rounded-none cursor-pointer"
                    >
                      {coupon.type === 'code' ? 'Get Code' : 'Get Deal'}
                    </button>

                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#a1a09c] font-semibold">
                      {coupon.usedCount} Used Today
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white border border-[#eae9e5] p-10">
                <p className="font-mono text-xs text-theme-text-muted uppercase tracking-widest">
                  No active coupon listings found for this store
                </p>
              </div>
            )}
          </div>

          {/* Interactive Sidebar (1/4 layout) */}
          <div className="space-y-8">
            {/* Guarantee block */}
            <div className="bg-white border border-[#eae9e5] p-6">
              <h4 className="font-serif text-xs uppercase tracking-wider text-theme-text font-bold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                OUR GUARANTEE
              </h4>
              <p className="text-[11px] text-[#5a5855] leading-relaxed font-sans mb-3">
                Every promotional offer and coupon code featured on Éloquence is meticulously hand-verified 
                by our editorial department before curation.
              </p>
              <span className="font-mono text-[8px] uppercase tracking-widest text-[#9a9994] font-semibold">
                No dead links • No spam
              </span>
            </div>

            {/* Sharing list block */}
            <div className="bg-white border border-[#eae9e5] p-6">
              <h4 className="font-serif text-xs uppercase tracking-wider text-theme-text font-bold mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#7c3aed]" />
                SHARE STORE
              </h4>
              <p className="text-[11px] text-[#5a5855] leading-relaxed font-sans mb-4">
                Share these verified Nordstrom codes with family and friends to help them save on luxury fashion items.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Store link copied to clipboard!');
                }}
                className="w-full bg-transparent border border-theme-border text-theme-text hover:bg-theme-secondary py-2 font-mono text-[9px] uppercase tracking-widest transition-all font-semibold rounded-none cursor-pointer"
              >
                Copy Page Link
              </button>
            </div>

            {/* FAQ Helper */}
            <div className="bg-white border border-[#eae9e5] p-6">
              <h4 className="font-serif text-xs uppercase tracking-wider text-theme-text font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#15803d]" />
                How to Use Code?
              </h4>
              <ol className="text-[11px] text-[#5a5855] leading-relaxed font-sans space-y-3.5 list-decimal pl-4">
                <li>Click <strong>"Get Code"</strong> to trigger copy and launch the store's shopping catalog.</li>
                <li>Add your chosen material items to the shopping basket.</li>
                <li>At checkout, paste the copied promo code into the voucher box and apply.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
