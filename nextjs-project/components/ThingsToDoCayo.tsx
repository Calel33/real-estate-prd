"use client";

import { useState, useRef, useEffect } from "react";

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
  url?: string;
}

const ACTIVITIES: Activity[] = [
  { ref: "CYO_01", name: "Xunantunich", category: "Maya_Heritage", description: "Classic-period ceremonial centre atop a limestone ridge overlooking the Mopan River. Cross via hand-cranked ferry, then climb El Castillo for views into Guatemala.", metadata: "Hand-cranked ferry", locationContext: "~15 min from San Ignacio", url: "https://www.travelbelize.org/attraction/xunantunich/" },
  { ref: "CYO_02", name: "Caracol", category: "Maya_Heritage", description: "The largest Maya site in Belize, spread across 25,000 acres deep in the Chiquibul Forest Reserve. Caana (\u201CSky Place\u201D) is the tallest man-made structure in Belize at 143 ft.", metadata: "Day trip", locationContext: "Chiquibul Forest Reserve", url: "https://www.travelbelize.org/attraction/caracol/" },
  { ref: "CYO_03", name: "Cahal Pech", category: "Maya_Heritage", description: "One of Belize\u2019s oldest Maya settlements, perched on a hilltop on the outskirts of San Ignacio. A compact, crowd-free site with plazas, temples, and a ball court.", metadata: "Walking distance", locationContext: "~1 mile from town centre", url: "https://nichbelize.org/ia-sites/cahal-pech/" },
  { ref: "CYO_04", name: "ATM Cave", category: "Subterranean_Caves", description: "Actun Tunichil Muknal \u2014 the \u201CCave of the Crystal Sepulchre.\u201D A Maya ceremonial site deep underground, home to the calcified skeleton known as the Crystal Maiden. Guided only.", metadata: "Guided only", locationContext: "Swimming required", url: "https://en.wikipedia.org/wiki/Actun_Tunichil_Muknal" },
  { ref: "CYO_05", name: "Barton Creek Cave", category: "Subterranean_Caves", description: "Explored by canoe through a navigable river passage over 4.5 miles long. Maya pottery, artifacts, and skeletal remains sit on ledges above the water.", metadata: "Canoe tour", locationContext: "Mountain Pine Ridge", url: "https://www.travelbelize.org/attraction/barton-creek-cave/" },
  { ref: "CYO_06", name: "Rio Frio Cave", category: "Subterranean_Caves", description: "A walk-through cave with a dramatic 65-foot entrance arch, open at both ends. Stalactites, freshwater pools, and the Rio Frio River flowing through.", metadata: "Self-guided", locationContext: "Walk-through cave", url: "https://www.travelbelize.org/attraction/rio-frio-caves/" },
  { ref: "CYO_07", name: "Thousand Foot Falls", category: "Waterfalls_Reserves", description: "Central America\u2019s tallest waterfall, plunging 1,600 ft from the Maya Mountains despite the name. A 1,290-acre natural monument within Mountain Pine Ridge.", metadata: "Scenic overlook", locationContext: "Mountain Pine Ridge", url: "https://www.travelbelize.org/attraction/thousand-foot-falls/" },
  { ref: "CYO_08", name: "Big Rock Falls", category: "Waterfalls_Reserves", description: "A 150-foot waterfall on Privassion Creek with an emerald swimming pool and boulders for cliff-jumping. Reached via a steep 10\u201315 minute descent.", metadata: "Steep 10\u201315 min descent", locationContext: "Cliff jumping & swimming", url: "https://www.travelbelize.org/attraction/big-rock-falls-big-rock-falls/" },
  { ref: "CYO_09", name: "Rio On Pools", category: "Waterfalls_Reserves", description: "Thousands of natural granite pools and small cascades along the Rio On, formed over millennia. A favourite spot for swimming, sunbathing, and picnicking.", metadata: "Natural pools", locationContext: "Mountain Pine Ridge", url: "https://www.travelbelize.org/attraction/rio-pools/" },
  { ref: "CYO_10", name: "Cave Tubing", category: "Adventure_Experiences", description: "Float through the Caves Branch River cave system at Nohoch Che\u2019en Archaeological Reserve. Ancient limestone formations and Maya history, lit by headlamp.", metadata: "Family friendly", locationContext: "Nohoch Che\u2019en, ~1 hr from San Ignacio", url: "https://www.travelbelize.org/attraction/nohock-cheen-caves-branch-archeological-reserve/" },
  { ref: "CYO_11", name: "Zip-lining", category: "Adventure_Experiences", description: "Soar through the jungle canopy at Jaguar Paw, zipping between treetop platforms above the Caves Branch River. Lines range up to 700 feet across.", metadata: "Multi-line", locationContext: "Jaguar Paw, ~1 hr from San Ignacio", url: "https://jaguarpawbelize.com/" },
  { ref: "CYO_12", name: "Horseback Riding", category: "Adventure_Experiences", description: "Half-day ride through farmland and riverside trails to Xunantunich, crossing the Mopan River by hand-cranked ferry. Explore the temples on foot before riding back.", metadata: "Half day", locationContext: "Xunantunich trail ride", url: "https://www.travelbelize.org/partner/mountain-equestrian-trails-ltd/" },
  { ref: "CYO_13", name: "Chiquibul Rainforest", category: "Nature_Wildlife", description: "Belize\u2019s largest protected area at over 400,000 acres. Home to jaguars, scarlet macaws, tapirs, and Central America\u2019s longest cave system.", metadata: "Guided tours", locationContext: "437,000 acres of protected forest", url: "https://www.travelbelize.org/attraction/chiquibul-national-park/" },
  { ref: "CYO_14", name: "Inland Blue Hole", category: "Nature_Wildlife", description: "St. Herman\u2019s National Park \u2014 not the ocean sinkhole. A 25-foot-deep sapphire cenote fed by an underground river, with a swim-in cave trail nearby.", metadata: "Freshwater cenote", locationContext: "St. Herman\u2019s, Hummingbird Hwy", url: "https://www.travelbelize.org/attraction/st-hermans-blue-hole-national-park/" },
  { ref: "CYO_15", name: "Butterfly Farms", category: "Nature_Wildlife", description: "Belize\u2019s largest butterfly ranch, home to over 30 native species in a walk-through flight area. The iridescent Blue Morpho is the star attraction.", metadata: "Family friendly", locationContext: "Green Hills, ~40 min from San Ignacio", url: "https://www.greenhillsbelize.com/" },
  { ref: "CYO_16", name: "San Ignacio Market", category: "Culture_Lifestyle", description: "A bustling daily market on the banks of the Macal River, peaking on Saturdays. Mennonite farmers, Maya artisans, and food vendors converge with produce, crafts, and local dishes.", metadata: "Saturday peak", locationContext: "Macal River, downtown", url: "https://www.travelbelize.org/attraction/san-ignacio-market/" },
  { ref: "CYO_17", name: "Chocolate Making", category: "Culture_Lifestyle", description: "Hands-on classes using traditional Maya stone-grinding techniques. Roast cacao beans, grind on a metate, and prepare spiced chocolate drinks as the Maya did.", metadata: "Hands-on", locationContext: "San Ignacio town", url: "http://www.ajawchocolate.com/" },
  { ref: "CYO_18", name: "San Antonio Cooperative", category: "Culture_Lifestyle", description: "Led by Maya women in San Antonio Village. Hands-on tortilla-making, fire-hearth cooking, and ancient pottery workshops. Proceeds support local artisans and girls\u2019 education.", metadata: "Cultural immersion", locationContext: "San Antonio Village", url: "https://planeterra.org/san-antonio-womens-co-op/" },
];

const ACCESS_CARD_DELAYS = ["animation-delay-200", "animation-delay-400", "animation-delay-600"] as const;

const PRACTICAL_ACCESS = [
  { label: "Airport_Access", content: "Philip Goldson International (BZE) to San Ignacio: ~110 km / 2–2.5 hr via the George Price Highway. Private shuttles, rental cars, and domestic flights to Maya Flats (CYD) available." },
  { label: "Best_Season", content: "November through April: the dry season. Clear skies, lower humidity, and optimal access to Maya ruins, cave systems, and jungle terrain." },
  { label: "Hub_Status", content: "San Ignacio is the cultural and economic hub of the Cayo District. The compact downtown is walkable and widely regarded as one of Belize\u2019s safest inland towns." },
];

export function ThingsToDoCayo() {
  const [activeCategory, setActiveCategory] = useState<Category>("Maya_Heritage");
  const [visitVisible, setVisitVisible] = useState(false);
  const visitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = visitRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisitVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
                  <h2 className="text-xl md:text-3xl font-display font-black uppercase tracking-tighter text-primary group-hover:text-primary/80 transition-colors">
                    {activity.url ? (
                      <a href={activity.url} target="_blank" rel="noopener noreferrer">
                        {activity.name}
                      </a>
                    ) : (
                      activity.name
                    )}
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

        <div ref={visitRef} className="mt-16">
          <div className={`mb-8 ${visitVisible ? "animate-slide-up animation-delay-100" : "opacity-0"}`}>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 block font-black italic">
              Plan_Your_Visit
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PRACTICAL_ACCESS.map((item, i) => (
              <div key={item.label} className={`rounded-glass-shell bg-gradient-to-r from-primary/20 via-white/5 to-transparent p-[1px] ${visitVisible ? `animate-slide-up ${ACCESS_CARD_DELAYS[i]}` : "opacity-0"}`}>
                <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-8 flex items-start gap-5 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-white/10 shadow-glass shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-black uppercase tracking-[0.2em] text-primary mb-2">
                      {item.label}
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-[0.05em] leading-loose text-secondary/40">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
