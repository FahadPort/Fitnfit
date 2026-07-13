import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingBag, ArrowRight, Tag, Percent } from 'lucide-react';
import { Store, Coupon } from '../types';

interface StoresListProps {
  stores: Store[];
  coupons: Coupon[];
  onStoreClick: (slug: string) => void;
}

export default function StoresList({ stores, coupons, onStoreClick }: StoresListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list from stores
  const categories = ['All', ...Array.from(new Set(stores.map(s => s.category).filter(Boolean)))];

  // Helper to count coupons for a store
  const getCouponCount = (storeId: string) => {
    return coupons.filter(c => c.storeId === storeId).length;
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          store.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Editorial Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent font-semibold block mb-3">
          Curated Partnerships
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl uppercase tracking-wider text-theme-text font-normal mb-5">
          PREMIUM REGISTRIES
        </h2>
        <div className="h-[1px] w-16 bg-accent/30 mx-auto mb-6" />
        <p className="text-theme-text-sub text-xs sm:text-sm leading-relaxed font-sans">
          A selection of understated luxury labels and trusted retail archives. Browse exclusive, 
          fully verified promotional deals and offline-compatible codes curated by our design team.
        </p>
      </div>

      {/* Control Bar: Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 border-b border-theme-border/60 pb-8">
        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer border rounded-none ${
                selectedCategory === cat
                  ? 'bg-theme-text border-theme-text text-theme-bg font-semibold shadow-xs'
                  : 'bg-transparent border-theme-border text-theme-text-muted hover:text-theme-text hover:border-theme-text/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex items-center">
          <span className="absolute left-3.5 text-theme-text-muted">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-tertiary/40 border border-theme-border focus:border-accent focus:bg-theme-secondary text-theme-text pl-10 pr-4 py-2.5 text-xs focus:outline-none rounded-none transition-all placeholder-theme-text-muted/45"
          />
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStores.map((store) => {
            const count = getCouponCount(store.id);
            return (
              <motion.div
                key={store.id}
                whileHover={{ y: -5 }}
                className="bg-theme-secondary border border-theme-border/75 p-6 flex flex-col justify-between relative group shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                {/* Store Visual Link */}
                <div className="flex items-center gap-4 mb-5 border-b border-theme-border/30 pb-4">
                  {/* Store Logo Placeholder / Actual Image */}
                  <div className="w-14 h-14 bg-theme-tertiary border border-theme-border/40 flex items-center justify-center p-2 overflow-hidden shrink-0">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={`${store.name} Logo`}
                        className="w-full h-full object-contain filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-theme-text-muted" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg tracking-wide text-theme-text font-semibold group-hover:text-accent transition-colors">
                      {store.name}
                    </h3>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-accent px-2 py-0.5 border border-accent/20 bg-accent/5 inline-block mt-1">
                      {store.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-theme-text-sub text-[11px] leading-relaxed mb-6 flex-grow">
                  {store.description}
                </p>

                {/* Footer Section: Coupon count & CTA */}
                <div className="flex items-center justify-between border-t border-theme-border/30 pt-4 mt-auto">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-theme-text-muted flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3 h-3 text-accent" />
                    {count} {count === 1 ? 'Active Offer' : 'Active Offers'}
                  </span>
                  
                  <button
                    onClick={() => onStoreClick(store.slug)}
                    className="text-theme-text hover:text-accent font-mono text-[9.5px] uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Codes</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-theme-tertiary/20 border border-theme-border border-dashed p-10">
          <p className="font-mono text-xs text-theme-text-muted uppercase tracking-widest">
            No registries match your query
          </p>
        </div>
      )}
    </div>
  );
}
