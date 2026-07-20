"use client";

import { useState } from "react";

const CATEGORIES = [
  "All",
  "Maya_Heritage",
  "Subterranean_Caves",
  "Waterfalls_Reserves",
  "Adventure_Experiences",
  "Nature_Wildlife",
  "Culture_Lifestyle",
] as const;

type Category = (typeof CATEGORIES)[number];
type ActivityCategory = Exclude<Category, "All">;

interface Activity {
  ref: string;
  name: string;
  category: ActivityCategory;
  description: string;
  metadata: string;
  locationContext: string;
}

const ACTIVITIES: Activity[] = [
  { ref: "CYO_01", name: "Xunantunich", category: "Maya_Heritage", description: "Classic-period ceremonial site atop a limestone ridge overlooking the Mopan River.", metadata: "Hand-cranked ferry", locationContext: "~15 min from San Ignacio" },
  { ref: "CYO_02", name: "Caracol", category: "Maya_Heritage", description: "The largest Maya site in Belize, deep in the Chiquibul Rainforest. Caana pyramid remains one of the tallest man-made structures in Belize.", metadata: "Day trip", locationContext: "Chiquibul jungle" },
  { ref: "CYO_03", name: "Cahal Pech", category: "Maya_Heritage", description: "Compact Maya site located right inside San Ignacio town. Convenient for a short visit with sunset views.", metadata: "Walking distance", locationContext: "In-town ruins" },
  { ref: "CYO_04", name: "ATM Cave", category: "Subterranean_Caves", description: "Actun Tunichil Muknal, a Maya ceremonial cave containing skeletal remains and crystallized calcified skeletons. Guided only.", metadata: "Guided only", locationContext: "Swimming required" },
  { ref: "CYO_05", name: "Barton Creek Cave", category: "Subterranean_Caves", description: "Explored by canoe through a long water-filled passage with Maya artifacts and stalactites. A gentler, scenic alternative to ATM.", metadata: "Canoe tour", locationContext: "Mountain Pine Ridge" },
  { ref: "CYO_06", name: "Rio Frio Cave", category: "Subterranean_Caves", description: "Massive cave 65 feet tall inside Mountain Pine Ridge, with stalactites, freshwater pools, and a stream running through.", metadata: "Short walk", locationContext: "Swimming hole" },
  { ref: "CYO_07", name: "Thousand Foot Falls", category: "Waterfalls_Reserves", description: "The highest waterfall in Central America, plunging approximately 1,600 feet into a deep gorge.", metadata: "Scenic overlook", locationContext: "Mountain Pine Ridge" },
  { ref: "CYO_08", name: "Big Rock Falls", category: "Waterfalls_Reserves", description: "Tucked-away waterfall with a swimming pool and cliff-jumping, reached via a steep descent.", metadata: "45 min hike", locationContext: "Swimming pools" },
  { ref: "CYO_09", name: "Rio On Pools", category: "Waterfalls_Reserves", description: "A series of cascading natural pools and small waterfalls along the Rio On river, popular for swimming and lounging.", metadata: "Natural pools", locationContext: "Mountain Pine Ridge" },
  { ref: "CYO_10", name: "Cave Tubing", category: "Adventure_Experiences", description: "Floating on inflated tubes through jungle-fringed cave river systems. A quintessential Belize adventure.", metadata: "Family friendly", locationContext: "Jungle river float" },
  { ref: "CYO_11", name: "Zip-lining", category: "Adventure_Experiences", description: "Canopy tour with multiple lines through the Mountain Pine Ridge forest.", metadata: "Multi-line", locationContext: "Canopy tour" },
  { ref: "CYO_12", name: "Horseback Riding", category: "Adventure_Experiences", description: "Guided jungle and riverside rides connecting to nearby Maya sites.", metadata: "Half day", locationContext: "Jungle trails" },
  { ref: "CYO_13", name: "Chiquibul Rainforest", category: "Nature_Wildlife", description: "Vast protected tropical broadleaf forest surrounding Caracol. A biodiversity stronghold.", metadata: "Guided tours", locationContext: "Wildlife" },
  { ref: "CYO_14", name: "Inland Blue Hole", category: "Nature_Wildlife", description: "St. Herman's Blue Hole National Park. A 300-foot-deep sapphire cenote for swimming, plus cave trails.", metadata: "Freshwater cenote", locationContext: "St. Herman's" },
  { ref: "CYO_15", name: "Butterfly Farms", category: "Nature_Wildlife", description: "Walk-through exhibits showing the butterfly life cycle, featuring Belize's iconic Blue Morpho.", metadata: "Educational", locationContext: "Blue Morpho" },
  { ref: "CYO_16", name: "San Ignacio Market", category: "Culture_Lifestyle", description: "Saturday market on the banks of the Macal River. Local produce, crafts, and street food.", metadata: "Saturday bustle", locationContext: "Local produce" },
  { ref: "CYO_17", name: "Chocolate Making", category: "Culture_Lifestyle", description: "Traditional Mayan-method chocolate-making classes, bean to bar. A hands-on cultural immersion.", metadata: "Hands-on", locationContext: "Maya tradition" },
  { ref: "CYO_18", name: "San Antonio Cooperative", category: "Culture_Lifestyle", description: "Indigenous Maya cooking classes and ancient pottery-making workshops supporting local artisans.", metadata: "Cultural immersion", locationContext: "Pottery and cooking" },
];

const PRACTICAL_ACCESS = [
  { label: "Airport_Access", content: "Philip Goldson International (BZE) to San Ignacio: ~110 km / 2–2.5 hr via the George Price Highway. Private shuttles, rental cars, and domestic flights to Maya Flats (CYD) available." },
  { label: "Best_Season", content: "November through April: the dry season. Clear skies, lower humidity, and optimal access to Maya ruins, cave systems, and jungle terrain." },
  { label: "Hub_Status", content: "San Ignacio is the cultural and economic hub of the Cayo District. The compact downtown is walkable and widely regarded as one of Belize\u2019s safest inland towns." },
];

export function ThingsToDoCayo() {
  const [activeCategory, setActiveCategory] = useState<Category>("Maya_Heritage");

  const filtered =
    activeCategory === "All"
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <section aria-label="Things to do in Cayo" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-20">
        <div className="mb-12">
          <div className="font-sans text-[10px] font-black tracking-[0.5em] text-primary/50 mb-6 uppercase flex items-center gap-4">
            <div className="w-12 h-px bg-primary/50" /> Cayo_District_Guide
          </div>
          <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.8] tracking-[-0.05em] font-black uppercase text-primary">
            THINGS
            <br />
            TO DO.
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-white/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`rounded-full px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-widest transition-all duration-500 ${
                activeCategory === cat
                  ? "bg-primary text-background"
                  : "border border-white/10 text-secondary/50 hover:border-primary/30 hover:text-primary/70"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
          <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass overflow-hidden">
            <div className="hidden md:grid grid-cols-12 px-6 py-6 border-b border-white/10 font-sans text-[9px] uppercase tracking-[0.3em] text-secondary/30">
              <div className="col-span-1 font-black">Ref</div>
              <div className="col-span-4 font-black">Activity</div>
              <div className="col-span-3 font-black">Category</div>
              <div className="col-span-2 font-black">Access</div>
              <div className="col-span-2 text-right font-black">Location</div>
            </div>

            {filtered.map((activity) => (
              <div
                key={activity.ref}
                className="grid grid-cols-1 gap-5 px-6 py-8 border-b border-primary/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] last:border-b-0 hover:bg-primary/[0.03] md:grid-cols-12 md:items-center md:gap-0 md:hover:pl-10 hover:border-primary/40 group"
              >
                <div className="font-sans text-xs text-primary/50 font-black md:col-span-1">
                  {activity.ref}
                </div>
                <div className="md:col-span-4">
                  <h2 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter text-primary">
                    {activity.name}
                  </h2>
                  <p className="font-sans text-[10px] text-secondary/40 uppercase tracking-[0.05em] leading-loose mt-2">
                    {activity.description}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <span className="mb-2 block font-sans text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 md:hidden">
                    Category
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary/60">
                    {activity.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="mb-2 block font-sans text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 md:hidden">
                    Access
                  </span>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/40">
                    {activity.metadata}
                  </p>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <span className="mb-2 block font-sans text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 md:hidden">
                    Location
                  </span>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/40">
                    {activity.locationContext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-12">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-8 block font-black italic">
              Practical_Access
            </span>
          </div>
          {PRACTICAL_ACCESS.map((item, i) => (
            <div key={item.label} className="lg:col-span-3 rounded-glass-shell bg-gradient-to-br from-white/20 via-white/5 to-transparent p-[1px]">
              <div className="h-full rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass p-6 flex items-start gap-4">
                <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-sans text-xs font-black uppercase tracking-widest text-secondary/90 mb-1">
                    {item.label}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
