/* ────────────────────────────────────────────────────────────
   Editorial content — set hubs, release calendar, buying guides.
   All set facts web-verified Oct 5, 2026 from official announcements
   (Pokemon.com, one-piece-cardgame.com, Bandai). No fabricated facts.
   ──────────────────────────────────────────────────────────── */

export interface ContentSection {
  heading?: string;
  html: string;
}

export interface ContentFaq {
  q: string;
  a: string;
}

export interface SetHub {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  introHtml: string;
  facts: [string, string][];
  sections: ContentSection[];
  ctaTitle: string;
  ctaSub: string;
  productSlugs: string[];
  faqs: ContentFaq[];
  related: { label: string; href: string }[];
  sourceNote: string;
}

export const SET_HUBS: Record<string, SetHub> = {
  "m6a-30th-celebration": {
    slug: "m6a-30th-celebration",
    metaTitle: "M6a 30th Celebration: Release Date, Set Guide & Prices",
    metaDescription:
      "M6a 30th Celebration (Sept 16, 2026): Japan's Pokémon 30th anniversary set — FUR rarity, 30 Pikachu cards, box contents & where to buy sealed.",
    h1: "M6a 30th Celebration: Japan's Pokémon 30th Anniversary Set",
    eyebrow: "Pokémon TCG (Japanese) · Set guide",
    introHtml:
      "Thirty years of Pokémon, in one set. <strong>M6a 30th Celebration</strong> is the flagship anniversary expansion of the Japanese Pokémon Trading Card Game — and unusually, it launched <strong>worldwide on the same day, September 16, 2026</strong>, in Japan, Korea and beyond. For collectors of Japanese product, it is the most significant release of the anniversary year.",
    facts: [
      ["Release date", "September 16, 2026 (worldwide simultaneous launch)"],
      ["Set code", 'M6a — MEGA Expansion Pack "30th Celebration"'],
      ["Box configuration", "20 packs per box · 6 cards per pack · every card holographic"],
      ["Set size", "103 base cards plus secret rares and a Classic Collection of reprints"],
      ["Japanese MSRP", "¥7,200 per booster box"],
    ],
    sections: [
      {
        heading: "The new FUR rarity",
        html: "The headline of M6a is <strong>FUR (Futuristic Rare)</strong>, a brand-new rarity tier debuting with two cards: <strong>Mew ex</strong> and <strong>Mewtwo ex</strong>, both illustrated by renowned Japanese graphic artist YOSHIROTTEN in a bold visual style the game has never used before. New rarity debuts are landmark moments in TCG history, and launching FUR with the twin Psychic icons at the very origin of the franchise makes these the defining chase cards of the anniversary.",
      },
      {
        heading: "30 Pikachu cards — one in every pack",
        html: "Every single M6a booster pack contains <strong>one of 30 unique holographic Pikachu cards</strong>, each illustrated by a different artist. There is no such thing as a dead pack in this set: you are guaranteed a special Pikachu every time, and completing all 30 is a set-within-the-set chase in its own right.",
      },
      {
        heading: "Classic Collection reprints",
        html: "To mark 30 years, M6a also includes a <strong>Classic Collection</strong> of gold-bordered reprints of iconic cards from across TCG history, alongside special RGB Rare prints of Mew. It is a set built as much for nostalgia as for play.",
      },
    ],
    ctaTitle: "Buy authentic M6a 30th Celebration sealed boxes",
    ctaSub: "Factory sealed, sourced directly from authorized Japanese distributors.",
    productSlugs: ["m6a-30th-celebration-booster-box-japanese-poke-mon-tcg"],
    faqs: [
      {
        q: "When was the Pokémon M6a 30th Celebration set released?",
        a: "M6a 30th Celebration launched worldwide on September 16, 2026 — Japan, Korea and the rest of the world on the same day, a first for a Japanese Pokémon set.",
      },
      {
        q: "What is the FUR rarity in M6a 30th Celebration?",
        a: "FUR (Futuristic Rare) is a brand-new rarity debuting in M6a, introduced with Mew ex and Mewtwo ex illustrated by Japanese graphic artist YOSHIROTTEN.",
      },
      {
        q: "How many packs are in an M6a 30th Celebration booster box?",
        a: "A Japanese M6a booster box contains 20 packs of 6 cards. Every card in every pack is holographic, and each pack contains one of 30 special Pikachu cards.",
      },
      {
        q: "Where can I buy an authentic M6a 30th Celebration box?",
        a: "Buy factory-sealed Japanese M6a boxes from reputable Japan-based sellers such as Akihabara TCG Warehouse, which sources directly from authorized Japanese distributors.",
      },
    ],
    related: [
      { label: "OP-18 The Dominance of God", href: "/sets/op-18-the-dominance-of-god/" },
      { label: "Black Bolt & White Flare", href: "/sets/sv11-black-bolt-white-flare/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
    ],
    sourceNote: "Set data compiled from official Pokémon announcements and retailer listings, October 2026.",
  },

  "op-18-the-dominance-of-god": {
    slug: "op-18-the-dominance-of-god",
    metaTitle: "OP-18 The Dominance of God: Release Date & Set Guide",
    metaDescription:
      "One Piece OP-18 The Dominance of God releases Nov 20, 2026. Set details, box configuration & where to pre-order authentic Japanese booster boxes.",
    h1: "OP-18 The Dominance of God: Release Date & Set Guide",
    eyebrow: "One Piece Card Game (Japanese) · Set guide",
    introHtml:
      "The 18th booster of the One Piece Card Game is almost here. <strong>OP-18 The Dominance of God</strong> releases on <strong>November 20, 2026</strong>, continuing the game's 2026 run of near-simultaneous worldwide releases — and it arrives with genuine star power behind the artwork.",
    facts: [
      ["Release date", "November 20, 2026"],
      ["Set", 'OP-18 — Booster Pack "The Dominance of God"'],
      ["Box configuration", "24 packs per box · 12 boxes per sealed case"],
      ["Publisher", "Bandai"],
    ],
    sections: [
      {
        heading: "Yoshitaka Amano illustrates One Piece cards",
        html: "The headline reveal: <strong>Yoshitaka Amano</strong> — the legendary artist behind Final Fantasy's iconic imagery — has illustrated special cards for OP-18, including cards featuring <strong>Loki and Saint Shamrock</strong>. The collaboration was unveiled during One Piece Day 2026, and Amano-chase cards are expected to be among the set's most sought-after pulls for collectors.",
      },
      {
        heading: "Pre-ordering OP-18",
        html: "One Piece booster pre-orders routinely sell through allocation before release, and OP-18 is no exception — several international retailers have already closed or sold out their Japanese pre-order waves. Ordering from a <strong>Japan-based seller with direct distributor allocation</strong> is the most reliable way to secure sealed boxes and cases at pre-order rather than aftermarket prices.",
      },
    ],
    ctaTitle: "Pre-order OP-18 The Dominance of God — Japanese",
    ctaSub: "Factory-sealed booster boxes & cases, sourced directly from Japan.",
    productSlugs: [
      "one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game",
      "one-piece-op-18-japanese-booster-box-case-pre-order-one-piece-card-game",
    ],
    faqs: [
      {
        q: "When does One Piece OP-18 release?",
        a: "OP-18 The Dominance of God releases on November 20, 2026, per Bandai's official announcement.",
      },
      {
        q: "How many packs are in an OP-18 Japanese booster box?",
        a: "A Japanese OP-18 booster box contains 24 packs; a sealed case holds 12 boxes (288 packs).",
      },
      {
        q: "What is special about OP-18?",
        a: "OP-18 features special cards illustrated by Yoshitaka Amano, the legendary Final Fantasy artist, including cards of Loki and Saint Shamrock — revealed at One Piece Day 2026.",
      },
      {
        q: "Where can I pre-order OP-18 in Japanese?",
        a: "Pre-order factory-sealed Japanese OP-18 booster boxes and cases from Japan-based sellers like Akihabara TCG Warehouse, which sources directly from authorized distributors.",
      },
    ],
    related: [
      { label: "OP-17 World's Strongest Warriors", href: "/sets/op-17-worlds-strongest-warriors/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
      { label: "Where to buy One Piece cards online", href: "/guides/where-to-buy-one-piece-cards-online/" },
    ],
    sourceNote: "Set data compiled from Bandai's official announcements, October 2026.",
  },

  "op-17-worlds-strongest-warriors": {
    slug: "op-17-worlds-strongest-warriors",
    metaTitle: "OP-17 World's Strongest Warriors: Release Date & Guide",
    metaDescription:
      "One Piece OP-17 World's Strongest Warriors (Aug 22, 2026): the 4th anniversary set — Elbaf arc, Four Emperors Leaders, box details & where to buy.",
    h1: "OP-17 The World's Strongest Warriors: 4th Anniversary Set",
    eyebrow: "One Piece Card Game (Japanese) · Set guide",
    introHtml:
      "Four years of the One Piece Card Game, celebrated the way it deserves. <strong>OP-17 The World's Strongest Warriors</strong> released in Japan on <strong>August 22, 2026</strong> (English: August 28) as the game's landmark <strong>4th anniversary booster</strong> — and it brought the story to Elbaf.",
    facts: [
      ["Release date", "August 22, 2026 (Japan) · August 28, 2026 (English)"],
      ["Set", 'OP-17 — Booster Pack "The World\'s Strongest Warriors"'],
      ["Box configuration", "24 packs per box · 6 cards per pack"],
      ["Set size", "126+1 card types"],
      ["Japanese MSRP", "¥240 per pack"],
    ],
    sections: [
      {
        heading: "Elbaf arc meets the Four Emperors",
        html: "OP-17 takes the card game into the <strong>Elbaf arc</strong>, featuring the Straw Hat Pirates in their Elbaf outfits. The set's backbone is the <strong>Four Emperors</strong>, who appear as new Leader cards alongside members of their crews — plus the One Piece Card Game debut of the legendary pirate <strong>Rocks D. Xebec</strong>, who once led Whitebeard, Big Mom and Kaido before they became emperors themselves.",
      },
      {
        heading: "Rarity breakdown",
        html: "With 126+1 card types — 6 Leaders, 45 Commons, 30 Uncommons, 26 Rares, 10 Super Rares, 2 Secret Rares, a Treasure Rare and alternate-art parallels — anniversary sets in this game have historically produced some of its most coveted chase cards, and OP-17 follows that pattern.",
      },
    ],
    ctaTitle: "Buy OP-17 World's Strongest Warriors — Japanese",
    ctaSub: "Factory-sealed booster boxes, sourced directly from Japan.",
    productSlugs: ["op-17-the-worlds-strongest-warriors-booster-box-japanese-one-piece-card"],
    faqs: [
      {
        q: "When was One Piece OP-17 released?",
        a: "OP-17 The World's Strongest Warriors released in Japan on August 22, 2026, with the English edition following on August 28.",
      },
      {
        q: "What is the theme of OP-17?",
        a: "OP-17 is the One Piece Card Game's 4th anniversary set, themed around the Elbaf arc, with the Four Emperors as new Leader cards and the card-game debut of Rocks D. Xebec.",
      },
      {
        q: "How many cards are in OP-17?",
        a: "OP-17 contains 126+1 card types: 6 Leaders, 45 Commons, 30 Uncommons, 26 Rares, 10 Super Rares, 2 Secret Rares plus a Treasure Rare and alternate-art parallels.",
      },
      {
        q: "How many packs are in an OP-17 Japanese box?",
        a: "A Japanese OP-17 booster box contains 24 packs of 6 cards.",
      },
    ],
    related: [
      { label: "OP-18 The Dominance of God", href: "/sets/op-18-the-dominance-of-god/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
    ],
    sourceNote: "Set data compiled from Bandai's official announcements, October 2026.",
  },

  "sv11-black-bolt-white-flare": {
    slug: "sv11-black-bolt-white-flare",
    metaTitle: "Black Bolt & White Flare: Release Date, Cards & Guide",
    metaDescription:
      "Pokémon Black Bolt (SV11B) & White Flare (SV11W), Japan June 6, 2025: the Unova tribute sets — BWR rarity, box contents & where to buy sealed.",
    h1: "Black Bolt & White Flare: The Unova Tribute Sets",
    eyebrow: "Pokémon TCG (Japanese) · Set guide",
    introHtml:
      "The Scarlet & Violet era went out with a celebration. <strong>Black Bolt (SV11B)</strong> and <strong>White Flare (SV11W)</strong> released in Japan on <strong>June 6, 2025</strong> as twin sets paying tribute to Generation V — and they remain among the most collector-dense Japanese sets ever printed.",
    facts: [
      ["Release date", "June 6, 2025 (Japan)"],
      ["Set codes", "SV11B Black Bolt · SV11W White Flare"],
      ["Box configuration", "20 packs per box · 7 cards per pack (Deluxe: 4 packs of 35 cards)"],
      ["Set size", "86 base cards per set plus 80+ secret rares"],
      ["Mascots", "Zekrom (Black Bolt) · Reshiram (White Flare)"],
    ],
    sections: [
      {
        heading: "Every Unova Pokémon, Art Rare or better",
        html: "The sets' defining feature: <strong>all 156 Pokémon introduced in the Unova region appear, and every single one has an Art Rare (AR) version or better</strong>. For Generation V fans, that makes these sets a complete illustrated Pokédex of the region — a collecting proposition no other Japanese set offers.",
      },
      {
        heading: "The BWR rarity",
        html: "Black Bolt and White Flare introduced <strong>BWR (Black White Rare)</strong>: cards with stark solid-color backgrounds, monochromatic artwork and elaborate holofoil patterning. The first two BWR cards — <strong>Zekrom ex</strong> and <strong>Reshiram ex</strong> — are the crown jewels of their respective sets.",
      },
      {
        heading: "Standard vs. Deluxe boxes",
        html: "Two box formats exist. Standard boxes hold 20 packs of 7 cards (2 guaranteed holofoil per pack). <strong>Deluxe boxes</strong> hold 4 packs of 35 cards, each guaranteed at least one Art Rare or better — the format of choice for collectors hunting the AR set.",
      },
    ],
    ctaTitle: "Buy Black Bolt & White Flare — Japanese sealed",
    ctaSub: "Factory-sealed booster boxes, sourced directly from Japan.",
    productSlugs: [
      "sv11b-black-bolt-booster-box-japanese-pokemon-card",
      "sv11w-white-flare-booster-box-japanese-pokemon-card",
    ],
    faqs: [
      {
        q: "When did Black Bolt and White Flare release in Japan?",
        a: "Black Bolt (SV11B) and White Flare (SV11W) released in Japan on June 6, 2025, as the final sets of the Scarlet & Violet era.",
      },
      {
        q: "What is the BWR rarity?",
        a: "BWR (Black White Rare) is a new rarity debuting in these sets, featuring Pokémon on stark solid-color backgrounds with monochromatic designs and elaborate holofoil. The first two BWR cards are Zekrom ex (Black Bolt) and Reshiram ex (White Flare).",
      },
      {
        q: "How many packs are in a Black Bolt / White Flare box?",
        a: "A standard Japanese booster box contains 20 packs of 7 cards. Deluxe boxes contain 4 packs of 35 cards, each guaranteed at least one Art Rare or better.",
      },
      {
        q: "Do all Unova Pokémon appear in the sets?",
        a: "Yes — all 156 Pokémon from the Unova region appear, and every one of them has an Art Rare (AR) version or better, making this the ultimate Generation V collection.",
      },
    ],
    related: [
      { label: "M6a 30th Celebration", href: "/sets/m6a-30th-celebration/" },
      { label: "Japanese vs. English Pokémon cards", href: "/guides/japanese-vs-english-pokemon-cards/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
    ],
    sourceNote: "Set data compiled from official Pokémon announcements, October 2026.",
  },

  "fb12-reach-the-god": {
    slug: "fb12-reach-the-god",
    metaTitle: "FB12 Reach the God: Release Date & Set Guide",
    metaDescription:
      "Dragon Ball Fusion World FB12 Reach the God releases Dec 18, 2026: 123 card types, the Beerus set — box details & Japanese pre-orders.",
    h1: "FB12 Reach the God: The Beerus Set",
    eyebrow: "Dragon Ball Super Card Game Fusion World (Japanese) · Set guide",
    introHtml:
      "The God of Destruction arrives in Fusion World. <strong>FB12 Reach the God</strong> releases on <strong>December 18, 2026</strong> as the twelfth main booster of the Dragon Ball Super Card Game Fusion World — and the <strong>first booster based on <em>Dragon Ball Super: Beerus</em></strong>.",
    facts: [
      ["Release date", "December 18, 2026"],
      ["Set", 'FB12 — Booster Pack "Reach the God"'],
      ["Card types", "123 types, plus parallel versions"],
      ["Box configuration", "24 packs per box · 6 cards per pack (Japanese)"],
      ["Publisher", "Bandai"],
    ],
    sections: [
      {
        heading: "Why FB12 matters",
        html: "Fusion World has been building toward divine power levels for a year; FB12 is where Beerus, Whis and the God of Destruction saga finally take center stage. First-of-theme boosters in this game have a strong record of producing format-relevant Leaders, and a Beerus-themed set lands right before the January 2027 starter decks (FS13/FS14) — making FB12 the bridge into the new year's meta.",
      },
      {
        heading: "Pre-ordering FB12",
        html: "Bandai announced FB12 in late September 2026, and Japanese pre-order allocation is already moving through distributors. December releases also compete with holiday demand, so waiting until street date usually means aftermarket prices. Securing a sealed case (12 boxes) at pre-order is the standard move for players and sealed collectors alike.",
      },
    ],
    ctaTitle: "Pre-order FB12 Reach the God — Japanese",
    ctaSub: "Factory-sealed booster boxes & cases, sourced directly from Japan.",
    productSlugs: [
      "dragon-ball-super-fusion-world-fb12-reach-the-god-booster-box-sealed-case-englis",
    ],
    faqs: [
      {
        q: "When does FB12 Reach the God release?",
        a: "FB12 Reach the God releases on December 18, 2026, per Bandai's official Fusion World product page.",
      },
      {
        q: "How many cards are in FB12?",
        a: "FB12 contains 123 card types, plus parallel versions beyond the main lineup.",
      },
      {
        q: "What is the theme of FB12 Reach the God?",
        a: "FB12 is the first Fusion World booster based on Dragon Ball Super: Beerus — the God of Destruction saga.",
      },
      {
        q: "How many packs are in a Japanese FB12 box?",
        a: "A Japanese FB12 booster box contains 24 packs of 6 cards.",
      },
    ],
    related: [
      { label: "TCG release calendar", href: "/release-calendar/" },
      { label: "All set guides", href: "/sets/" },
    ],
    sourceNote: "Set data compiled from Bandai's official Fusion World site, October 2026.",
  },
};

export const SET_SLUGS = Object.keys(SET_HUBS);

/* ── Set hub index ── */

export const SET_INDEX = {
  metaTitle: "TCG Set Guides: Pokémon, One Piece & Dragon Ball | Akihabara TCG",
  metaDescription:
    "In-depth guides to every major Japanese TCG set: release dates, box contents, chase cards & where to buy authentic sealed boxes.",
};

/* ── Release calendar ── */

export interface CalendarEntry {
  date: string;
  set: string;
  game: string;
  notes: string;
  href?: string;
  soon?: boolean;
  unconfirmed?: boolean;
}

export const CALENDAR_UPCOMING: CalendarEntry[] = [
  {
    date: "Oct 16, 2026",
    set: "FB11 Brightness of Hope",
    game: "Dragon Ball Fusion World",
    notes: "First set with Dragon Ball Legends illustrations",
    soon: true,
  },
  {
    date: "Oct 30, 2026",
    set: "EB-05 Heroines Edition vol.2",
    game: "One Piece Card Game",
    notes: "Extra Booster",
    soon: true,
  },
  {
    date: "Nov 20, 2026",
    set: "OP-18 The Dominance of God",
    game: "One Piece Card Game",
    notes: "18th booster · Yoshitaka Amano art",
    href: "/sets/op-18-the-dominance-of-god/",
  },
  {
    date: "Dec 18, 2026",
    set: "FB12 Reach the God",
    game: "Dragon Ball Fusion World",
    notes: "123 types · first Beerus set",
    href: "/sets/fb12-reach-the-god/",
  },
  {
    date: "Jan 22, 2027",
    set: "FS13 The Saiyan Raised on Earth · FS14 The Prince of Saiyan",
    game: "Dragon Ball Fusion World",
    notes: "Starter decks",
  },
  {
    date: "Early 2027",
    set: "OP-19",
    game: "One Piece Card Game",
    notes: "Date unconfirmed — retailer listings point to February",
    unconfirmed: true,
  },
];

export const CALENDAR_RECENT: CalendarEntry[] = [
  {
    date: "Sep 16, 2026",
    set: "M6a 30th Celebration",
    game: "Pokémon (Japanese)",
    notes: "30th anniversary · FUR rarity debut",
    href: "/sets/m6a-30th-celebration/",
  },
  {
    date: "Aug 22, 2026",
    set: "OP-17 World's Strongest Warriors",
    game: "One Piece Card Game",
    notes: "4th anniversary · Elbaf arc",
    href: "/sets/op-17-worlds-strongest-warriors/",
  },
  {
    date: "Jun 6, 2025",
    set: "SV11B Black Bolt / SV11W White Flare",
    game: "Pokémon (Japanese)",
    notes: "Unova tribute · BWR rarity",
    href: "/sets/sv11-black-bolt-white-flare/",
  },
];

/* ── Buying guides ── */

export interface Guide {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  meta: string;
  introHtml: string;
  sections: ContentSection[];
  ctaTitle: string;
  ctaSub: string;
  ctaHref: string;
  ctaLabel: string;
  faqs: ContentFaq[];
  related: { label: string; href: string }[];
}

export const GUIDES: Record<string, Guide> = {
  "how-to-spot-fake-japanese-pokemon-cards": {
    slug: "how-to-spot-fake-japanese-pokemon-cards",
    metaTitle: "How to Spot Fake Japanese Pokémon Cards (2026 Guide)",
    metaDescription:
      "Fake Japanese Pokémon cards are getting better. Learn the 9 checks that expose counterfeits — print, holo, packaging — before you buy.",
    h1: "How to Spot Fake Japanese Pokémon Cards",
    meta: "Buying guide · Updated October 2026",
    introHtml:
      "Counterfeit Japanese Pokémon cards have one big advantage over fakes of English cards: most buyers can't read the text, so they never notice when it's wrong. That makes Japanese product a favorite target. Here are the nine checks that actually work, from fastest to most conclusive.",
    sections: [
      {
        heading: "1. The side-by-side comparison (fastest)",
        html: "Put the suspect card next to a card you <em>know</em> is genuine — a bulk common from a pack you opened yourself. Fakes almost always fail here first: text looks slightly blurry or bold in the wrong places, the font isn't quite right, colors are a shade off. Your eyes are better at spotting “wrong” than describing it.",
      },
      {
        heading: "2. Print sharpness and rosette pattern",
        html: "Genuine Pokémon cards are offset-printed with a fine rosette dot pattern. Under a loupe or phone macro lens, real cards show crisp, uniform dots. Counterfeits — usually inkjet or low-end digital prints — show muddy, irregular dots and soft edges on text. The attack text and HP numbers are where fakes blur first.",
      },
      {
        heading: "3. The light test",
        html: "Hold the card up to a bright light. Genuine Pokémon cards contain a dark inner core layer that blocks most light transmission. If light passes through easily and you can clearly see the back design through the front, it's fake. Note: this is a screening test, not proof — combine it with the others.",
      },
      {
        heading: "4. Holofoil behavior",
        html: "Real Japanese holofoil has a distinctive fine, even pattern and shifts smoothly as you tilt the card. Fake holos tend to look “glittery” or pixelated, with harsh sparkle that doesn't match the smooth refractor lines of genuine stock. If the holo looks like a sticker, it probably is one.",
      },
      {
        heading: "5. Card stock: feel and flex",
        html: "Genuine Japanese cards have a specific snap — firm with a clean flex. Counterfeits are usually too flimsy, too glossy, or oddly thick. After handling real product, fakes feel wrong immediately. The back's blue is also a giveaway: fakes often print it too bright or too dark.",
      },
      {
        heading: "6. The packaging tells",
        html: "For sealed product: genuine Japanese booster boxes have precise shrink wrap — tight, even seams, no wrinkles or re-glued flaps. Japanese packs tear with a distinctive clean strip. Loose packs sold without a box, “repacked” lots, and boxes with sloppy wrap are the classic reseal vectors. <strong>Never buy “searched” or “weighed” packs</strong> — that's an admission the good pulls are gone.",
      },
      {
        heading: "7. Price reality check",
        html: "A sealed Japanese box selling for half the going rate isn't a deal — it's a warning. Check the current market range across two or three established sellers before buying. Counterfeiters compete on price because they can't compete on authenticity.",
      },
      {
        heading: "8. Seller signals",
        html: "Stock photos only, no reviews, a brand-new account, vague sourcing (“from a warehouse”) — each is a yellow flag; two together is a red one. Legitimate Japan-based sellers name their sourcing (authorized distributors), show real product photos, and have a review trail.",
      },
      {
        heading: "9. When in doubt, don't",
        html: "No card is worth the gamble. If a listing fails even one of these checks and the seller can't explain it, walk away. Genuine product from a reputable seller costs the market price — and the market price is the cheapest insurance in the hobby.",
      },
      {
        heading: "The golden rule",
        html: "Buy sealed Japanese product from sellers who source directly from authorized Japanese distributors and can say so plainly. Everything else is trust without evidence.",
      },
    ],
    ctaTitle: "Skip the guesswork.",
    ctaSub: "Every box we sell is factory sealed and sourced directly from authorized Japanese distributors — no counterfeits, ever.",
    ctaHref: "/pokemon-cards/",
    ctaLabel: "Shop authentic Japanese Pokémon →",
    faqs: [
      {
        q: "What is the easiest way to tell a fake Japanese Pokémon card?",
        a: "Compare it side-by-side with a card you know is genuine. Fakes almost always fail on print sharpness — blurry text, wrong fonts, or off-color energy symbols are visible immediately next to a real card.",
      },
      {
        q: "Can fake booster boxes be resealed?",
        a: "Yes — resealing is one of the most common scams. Buy factory-sealed product only from reputable sellers, and be suspicious of boxes priced far below market with no verifiable source.",
      },
      {
        q: "Does the light test work on Japanese Pokémon cards?",
        a: "Genuine Pokémon cards have a dark inner layer that blocks most light. If bright light passes straight through a card, it is almost certainly counterfeit — though some very thin fakes can partially mimic this, so use it with other checks.",
      },
    ],
    related: [
      { label: "Japanese vs. English Pokémon cards", href: "/guides/japanese-vs-english-pokemon-cards/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
    ],
  },

  "japanese-vs-english-pokemon-cards": {
    slug: "japanese-vs-english-pokemon-cards",
    metaTitle: "Japanese vs English Pokémon Cards: What's Actually Different",
    metaDescription:
      "Japanese vs English Pokémon cards: release timing, set sizes, box layouts, print quality and prices — the complete honest comparison.",
    h1: "Japanese vs English Pokémon Cards: What's Actually Different",
    meta: "Buying guide · Updated October 2026",
    introHtml:
      "Every collector eventually asks it: should I buy Japanese or English? The cards play the same game, but nearly everything around them — timing, packaging, quality, price — differs. Here's the honest breakdown.",
    sections: [
      {
        heading: "Release timing: Japan first, usually",
        html: "Japanese sets release first; English sets follow weeks or months later, often combining multiple Japanese sets into one larger English release. Example: Japan's 103-card M6a 30th Celebration became a 128-card English set by folding in additional cards. Buying Japanese means opening the newest cards first — and, for investors, selling into peak hype.",
      },
      {
        heading: "Set structure and box layouts",
        html: "Japanese boxes are smaller and cheaper in absolute terms; per-pack pricing is comparable. The formats simply serve different markets:<br><br>• <strong>Typical box:</strong> 20–30 packs (JP) vs 36 packs (EN)<br>• <strong>Cards per pack:</strong> 5–7 (JP, varies by set) vs 10 (EN)<br>• <strong>Set size:</strong> smaller, focused sets (JP) vs larger, combined sets (EN)<br>• <strong>Special sets:</strong> all-holo packs are common in Japan (e.g. M6a: every card holo); rarer in English, which gets ETBs instead of small boxes",
      },
      {
        heading: "Print quality",
        html: "This is the least controversial claim in the hobby: <strong>Japanese print quality is consistently better</strong> — sharper text, better centering on average, cleaner holofoil. It's the main reason graded-card collectors often prefer Japanese copies of the same artwork.",
      },
      {
        heading: "Card text and collectibility",
        html: "Japanese cards are exactly that — Japanese. For pure collectors, the language is part of the appeal (and Japanese-exclusive promos, like Pokémon Center variants, only exist in Japanese). For players outside Japan, check tournament legality rules in your region before buying to play.",
      },
      {
        heading: "Price dynamics",
        html: "Japanese sealed product is usually cheaper at release thanks to Japan's competitive domestic market — but allocation can be brutal (lotteries, purchase limits), which is why reliable Japan-based sellers matter. English product has the bigger secondary market, so English chase cards often have deeper buyer pools.",
      },
      {
        heading: "So which should you buy?",
        html: "<strong>Buy Japanese if:</strong> you want the newest cards first, prefer better print quality, collect exclusive arts and promos, or want cheaper sealed boxes.<br><strong>Buy English if:</strong> you play in local tournaments, want maximum resale liquidity, or simply prefer reading your cards.<br><br>Most serious collectors eventually buy both — Japanese for the premium binder, English for play.",
      },
    ],
    ctaTitle: "Get the Japanese advantage — direct from Japan.",
    ctaSub: "Factory-sealed Japanese booster boxes at Japanese-market prices, shipped worldwide.",
    ctaHref: "/pokemon-cards/",
    ctaLabel: "Shop Japanese Pokémon →",
    faqs: [
      {
        q: "Are Japanese Pokémon cards worth more than English?",
        a: "It depends on the card. Japanese cards often have better print quality and earlier releases; English cards have a larger buyer pool. High-grade Japanese exclusive arts frequently command premiums.",
      },
      {
        q: "Can I play with Japanese cards in tournaments?",
        a: "In most regions outside Japan, tournament play requires cards in a local language — check your region's official tournament rules, as they change. For collecting, language doesn't matter.",
      },
      {
        q: "Why are Japanese booster boxes cheaper?",
        a: "Japanese boxes typically contain fewer packs (often 20–30 vs 36 for English) and Japan's domestic market is highly competitive, which keeps prices lower — though per-pack prices are comparable.",
      },
    ],
    related: [
      { label: "How to spot fake Japanese Pokémon cards", href: "/guides/how-to-spot-fake-japanese-pokemon-cards/" },
      { label: "M6a 30th Celebration set guide", href: "/sets/m6a-30th-celebration/" },
    ],
  },

  "where-to-buy-one-piece-cards-online": {
    slug: "where-to-buy-one-piece-cards-online",
    metaTitle: "Where to Buy One Piece Cards Online Without Getting Scammed",
    metaDescription:
      "Buying One Piece cards online? The 8 rules for avoiding fakes, resealed boxes and scam sellers — plus where sealed Japanese product is safe.",
    h1: "Where to Buy One Piece Cards Online Without Getting Scammed",
    meta: "Buying guide · Updated October 2026",
    introHtml:
      "The One Piece Card Game's popularity made it a prime target for counterfeiters and shady sellers. Whether you're pre-ordering the newest set or filling gaps in your collection, these eight rules keep your money safe.",
    sections: [
      {
        heading: "1. Buy sealed, from sellers who name their source",
        html: "“Sourced directly from authorized Japanese distributors” is a verifiable claim. “100% authentic trust me” is not. Legitimate sellers state their supply chain plainly.",
      },
      {
        heading: "2. Check for a review trail — off their own site",
        html: "On-site testimonials are curated. Look for the seller on independent platforms (Google reviews, Trustpilot, hobby forums). A seller with no footprint outside their own storefront is a gamble.",
      },
      {
        heading: "3. Beware the too-good price",
        html: "A sealed Japanese OP box at half the market rate isn't a find — it's either counterfeit, resealed, or bait. Check two or three established sellers to learn the real range first.",
      },
      {
        heading: "4. Inspect pre-order terms like a contract",
        html: "Legitimate pre-orders state: release date, what happens if allocation is cut, and refund policy. Vague pre-orders (“ships when available”) from sellers with no allocation history are how pre-order money disappears.",
      },
      {
        heading: "5. Learn the reseal signs",
        html: "Factory shrink wrap is tight with clean, even seams. Wrinkled wrap, re-glued flaps, or boxes sold without wrap (“box only, packs fresh!”) are classic reseal tells. When your box arrives, check before you crack.",
      },
      {
        heading: "6. Singles: demand scans, not stock photos",
        html: "For individual cards, genuine sellers photograph the actual card — front and back. Stock images on a singles listing mean you have no idea what condition you're getting, or whether the card exists at all.",
      },
      {
        heading: "7. Pre-order early from Japan-based sellers",
        html: "Bandai's Japanese allocation for hyped sets (OP-17, OP-18) routinely sells through before street date. Sellers physically in Japan with distributor relationships get allocation that overseas resellers can't — and pre-order pricing beats aftermarket pricing every time.",
      },
      {
        heading: "8. Use protected payment methods",
        html: "Credit cards and PayPal give you recourse if an order never ships. Sellers who only accept irreversible payment methods are telling you something.",
      },
      {
        heading: "The short version",
        html: "Established seller + named sourcing + independent reviews + realistic pricing + protected payment = safe. Anything missing two of those is a risk you don't need to take — the cards will still be there from someone legitimate.",
      },
    ],
    ctaTitle: "Buy with the sourcing stated upfront.",
    ctaSub: "Factory-sealed Japanese One Piece boxes and cases, direct from authorized distributors in Japan.",
    ctaHref: "/one-piece-cards/",
    ctaLabel: "Shop One Piece Card Game →",
    faqs: [
      {
        q: "Is it safe to buy One Piece cards online?",
        a: "Yes, if you buy sealed product from established sellers with verifiable sourcing and reviews. The risks are counterfeits, resealed boxes, and sellers who take pre-order money without allocation.",
      },
      {
        q: "How do I know a One Piece seller is legitimate?",
        a: "Look for real product photos, a review trail on independent platforms, clear sourcing (authorized distributors), and realistic pricing. Be wary of stock photos only, new accounts, and prices far below market.",
      },
      {
        q: "Should I pre-order One Piece sets or wait?",
        a: "Pre-order. Japanese allocation for hyped One Piece sets routinely sells through before release, and post-release prices move to the aftermarket. Pre-order from sellers with direct distributor allocation.",
      },
    ],
    related: [
      { label: "OP-17 set guide", href: "/sets/op-17-worlds-strongest-warriors/" },
      { label: "TCG release calendar", href: "/release-calendar/" },
    ],
  },
};

export const GUIDE_SLUGS = Object.keys(GUIDES);

/* ── Product → set hub cross-linking ── */

/** Return the set-hub slug for a product title, or null if none matches. */
export function setHubForProduct(title: string): string | null {
  const t = title.toLowerCase();
  if (/\bm6a\b/.test(t) || t.includes("30th celebration")) return "m6a-30th-celebration";
  if (/\bop-?18\b/.test(t) || t.includes("dominance of god")) return "op-18-the-dominance-of-god";
  if (/\bop-?17\b/.test(t) || t.includes("strongest warriors")) return "op-17-worlds-strongest-warriors";
  if (/\bsv11b\b/.test(t) || t.includes("black bolt")) return "sv11-black-bolt-white-flare";
  if (/\bsv11w\b/.test(t) || t.includes("white flare")) return "sv11-black-bolt-white-flare";
  if (/\bfb-?12\b/.test(t) || t.includes("reach the god")) return "fb12-reach-the-god";
  return null;
}

/** Human-readable set name for the cross-link label. */
export function setHubLabel(slug: string): string {
  return SET_HUBS[slug]?.h1 ?? "this set";
}
