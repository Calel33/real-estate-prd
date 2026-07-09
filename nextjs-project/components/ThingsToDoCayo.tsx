"use client";

import { useState } from "react";

// ── Activity Data ───────────────────────────────────────────────────────────

interface Activity {
  ref: string;
  name: string;
  category: string;
  description: string;
  metadata: string;
  meta2: string;
}

const CATEGORIES = [
  "All",
  "Maya_Heritage",
  "Subterranean_Caves",
  "Waterfalls_Reserves",
  "Adventure_Experiences",
  "Nature_Wildlife",
  "Culture_Lifestyle",
] as const;

const ACTIVITIES: Activity[] = [
  { ref: "CYO_01", name: "Xunantunich", category: "Maya_Heritage", description: "Classic-period ceremonial site atop a limestone ridge overlooking the Mopan River.", metadata: "Hand-cranked ferry", meta2: "~15 min from San Ignacio" },
  { ref: "CYO_02", name: "Caracol", category: "Maya_Heritage", description: "The largest Maya site in Belize, deep in the Chiquibul Rainforest. Caana pyramid remains one of the tallest man-made structures in Belize.", metadata: "Day trip", meta2: "Chiquibul jungle" },
  { ref: "CYO_03", name: "Cahal Pech", category: "Maya_Heritage", description: "Compact Maya site located right inside San Ignacio town. Convenient for a short visit with sunset views.", metadata: "Walking distance", meta2: "In-town ruins" },
  { ref: "CYO_04", name: "ATM Cave", category: "Subterranean_Caves", description: "Actun Tunichil Muknal, a Maya ceremonial cave containing skeletal remains and crystallized calcified skeletons. Guided only.", metadata: "Guided only", meta2: "Swimming required" },
  { ref: "CYO_05", name: "Barton Creek Cave", category: "Subterranean_Caves", description: "Explored by canoe through a long water-filled passage with Maya artifacts and stalactites. A gentler, scenic alternative to ATM.", metadata: "Canoe tour", meta2: "Mountain Pine Ridge" },
  { ref: "CYO_06", name: "Rio Frio Cave", category: "Subterranean_Caves", description: "Massive cave 65 feet tall inside Mountain Pine Ridge, with stalactites, freshwater pools, and a stream running through.", metadata: "Short walk", meta2: "Swimming hole" },
  { ref: "CYO_07", name: "Thousand Foot Falls", category: "Waterfalls_Reserves", description: "The highest waterfall in Central America, plunging approximately 1,600 feet into a deep gorge.", metadata: "Scenic overlook", meta2: "Mountain Pine Ridge" },
  { ref: "CYO_08", name: "Big Rock Falls", category: "Waterfalls_Reserves", description: "Tucked-away waterfall with a swimming pool and cliff-jumping, reached via a steep descent.", metadata: "45 min hike", meta2: "Swimming pools" },
  { ref: "CYO_09", name: "Rio On Pools", category: "Waterfalls_Reserves", description: "A series of cascading natural pools and small waterfalls along the Rio On river, popular for swimming and lounging.", metadata: "Natural pools", meta2: "Mountain Pine Ridge" },
  { ref: "CYO_10", name: "Cave Tubing", category: "Adventure_Experiences", description: "Floating on inflated tubes through jungle-fringed cave river systems. A quintessential Belize adventure.", metadata: "Family friendly", meta2: "Jungle river float" },
  { ref: "CYO_11", name: "Zip-lining", category: "Adventure_Experiences", description: "Canopy tour with multiple lines through the Mountain Pine Ridge forest.", metadata: "Multi-line", meta2: "Canopy tour" },
  { ref: "CYO_12", name: "Horseback Riding", category: "Adventure_Experiences", description: "Guided jungle and riverside rides connecting to nearby Maya sites.", metadata: "Half day", meta2: "Jungle trails" },
  { ref: "CYO_13", name: "Chiquibul Rainforest", category: "Nature_Wildlife", description: "Vast protected tropical broadleaf forest surrounding Caracol. A biodiversity stronghold.", metadata: "Guided tours", meta2: "Wildlife" },
  { ref: "CYO_14", name: "Inland Blue Hole", category: "Nature_Wildlife", description: "St. Herman's Blue Hole National Park. A 300-foot-deep sapphire cenote for swimming, plus cave trails.", metadata: "Freshwater cenote", meta2: "St. Herman's" },
  { ref: "CYO_15", name: "Butterfly Farms", category: "Nature_Wildlife", description: "Walk-through exhibits showing the butterfly life cycle, featuring Belize's iconic Blue Morpho.", metadata: "Educational", meta2: "Blue Morpho" },
  { ref: "CYO_16", name: "San Ignacio Market", category: "Culture_Lifestyle", description: "Saturday market on the banks of the Macal River. Local produce, crafts, and street food.", metadata: "Saturday bustle", meta2: "Local produce" },
  { ref: "CYO_17", name: "Chocolate Making", category: "Culture_Lifestyle", description: "Traditional Mayan-method chocolate-making classes, bean to bar. A hands-on cultural immersion.", metadata: "Hands-on", meta2: "Maya tradition" },
  { ref: "CYO_18", name: "San Antonio Cooperative", category: "Culture_Lifestyle", description: "Indigenous Maya cooking classes and ancient pottery-making workshops supporting local artisans.", metadata: "Cultural immersion", meta2: "Pottery and cooking" },
];

// ── Practical Access Data ────────────────────────────────────────────────────

const PRACTICAL_ACCESS = [
  { label: "Airport_Access", content: "BZE to San Ignacio ~110 km / ~2 hr via George Price Highway" },
  { label: "Best_Season", content: "December to May (dry season). Dec to Jan peak pleasantness" },
  { label: "Hub_Status", content: "San Ignacio is walkable and widely regarded as safe" },
];

export function ThingsToDoCayo() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <section aria-label="Things to do in Cayo" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-20">
        {/* Header */}
        <div className="mb-12">
          <div className="font-sans text-[10px] tracking-[0.5em] text-primary/50 mb-6 uppercase flex items-center gap-4">
            <div className="w-12 h-px bg-primary/50" /> Cayo_District_Guide
          </div>
          <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.8] tracking-[-0.05em] font-black uppercase text-primary">
            THINGS
            <br />
            TO DO.
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-white/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 font-sans text-[10px] uppercase tracking-widest transition-all duration-500 ${
                activeCategory === cat
                  ? "bg-primary text-background"
                  : "border border-white/10 text-secondary/50 hover:border-primary/30 hover:text-primary/70"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 py-6 border-b border-white/10 font-sans text-[9px] uppercase tracking-[0.3em] text-secondary/30">
          <div className="col-span-1">Ref</div>
          <div className="col-span-4">Activity</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2">Access</div>
          <div className="col-span-2 text-right">Location</div>
        </div>

        {/* Rows */}
        {filtered.map((activity) => (
          <div
            key={activity.ref}
            className="grid grid-cols-12 py-8 items-center border-b border-primary/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-primary/[0.03] hover:pl-4 hover:border-primary/40 group"
          >
            <div className="col-span-1 font-sans text-xs text-primary/50 font-black">
              {activity.ref}
            </div>
            <div className="col-span-4">
              <h2 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter text-primary">
                {activity.name}
              </h2>
              <p className="font-sans text-[9px] text-secondary/40 uppercase tracking-widest mt-1">
                {activity.description}
              </p>
            </div>
            <div className="col-span-3">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary/60">
                {activity.category}
              </span>
            </div>
            <div className="col-span-2">
              <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/40">
                {activity.metadata}
              </p>
            </div>
            <div className="col-span-2 text-right">
              <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/40">
                {activity.meta2}
              </p>
            </div>
          </div>
        ))}

        {/* Practical Access */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-12">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-8 block font-black italic">
              Practical_Access
            </span>
          </div>
          {PRACTICAL_ACCESS.map((item, i) => (
            <div key={item.label} className="lg:col-span-4">
              <div className="flex items-start gap-4">
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
