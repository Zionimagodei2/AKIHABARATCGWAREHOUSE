/* ────────────────────────────────────────────────────────────
   Blog — article data. Every article follows AKIHABARA_BLOG_LAWS.md
   (adapted from the Ibravra constitution + HUMANIZATION_PLAYBOOK.md):
   the AI-can't-answer test, exposed math, decision tables, Warehouse
   Notes, who-should-NOT boundaries, end checklists, verified facts only.
   Attribution: "the Warehouse" — no personal names, ever.
   ──────────────────────────────────────────────────────────── */

export interface BlogSection {
  h: string;
  paragraphs: string[];
  /** Decision/comparison table (laws: every comparative guide needs one) */
  table?: { head: string[]; rows: string[][] };
  /** Exposed math lines — arithmetic shown, never asserted (Rule 62) */
  math?: string[];
  /** Warehouse Note — first-person observation from running the store */
  note?: string;
  /** Action-layer checklist */
  checklist?: string[];
}

export interface BlogPost {
  slug: string;
  metaTitle: string; // ≤ 60 chars
  metaDescription: string; // ≤ 155 chars
  h1: string;
  datePublished: string;
  readMinutes: number;
  intro: string[]; // hand-written, opens on a real problem
  sections: BlogSection[];
  takeaway: string[]; // hand-written conclusion with our actual take
  faqs: { q: string; a: string }[];
}

export const POSTS: Record<string, BlogPost> = {
  "are-japanese-pokemon-cards-a-good-investment": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Some do. Anniversary sets and genuinely popular chase cards have held demand well, but 'Japanese Pokémon' as a blanket category includes plenty of product that sits flat or retraces after restocks — and flat is a slow loss once inflation and exit fees are counted. Value holding is set-by-set, not language-by-language.",
        "q": "Do Japanese Pokémon cards hold their value?"
      },
      {
        "a": "Neither qualifies as an investment in the strict sense; they are different speculations. Sealed product is simpler to value and sell whole but bulkier and slower to exit. Singles — especially popular characters — exit faster but carry condition and grading risk. The comparison table in this article is the honest version of the answer.",
        "q": "Is it better to invest in sealed boxes or singles?"
      },
      {
        "a": "Because a case is priced as its own product, not as twelve singles minus a bulk discount. Unopened cases carry their own collector demand, and case pricing follows case supply. OP-17's Japanese case works out to $101.25 a box against $101.07 for single boxes, as of October 21, 2026 — which is why the only safe habit is to divide every time.",
        "q": "Why does a sealed case sometimes cost more per box than single boxes?"
      }
    ],
    "h1": "Are Japanese Pokémon Cards a Good Investment? The Honest Answer",
    "intro": [
      "The short answer is two answers. As a hobby, Japanese Pokémon cards are easy to justify: the print quality is better, the cost per card undercuts English equivalents, and sets like M6a are built to be opened. As an investment — money you expect to grow and be able to take back out — most Japanese sealed product fails the honest tests: liquidity, storage, reprint risk, and the simple arithmetic of what else that money could be doing. This article runs those tests with real prices instead of vibes.",
      "Who this is for: collectors who keep hearing that the closet is a portfolio, and anyone about to spend case money on a thesis they read in a comment thread. Who it is not for: anyone who needs the money back on a date. Rent, tuition, and emergency funds have deadlines; cardboard does not respect them.",
      "Every price below is a price on our own shelf, as of October 21, 2026, and most of them come from the set at the center of the current argument: [M6a 30th Celebration](/sets/m6a-30th-celebration/). If the numbers move, the method still holds — divide before you believe."
    ],
    "metaDescription": "Japanese Pokémon cards as an investment: per-pack math, the case paradox, liquidity and reprint risk, and the narrow cases where sealed can make sense.",
    "metaTitle": "Are Japanese Pokémon Cards a Good Investment?",
    "readMinutes": 10,
    "sections": [
      {
        "h": "First, the only honest unit: what a card actually costs you",
        "math": [
          "M6a booster box: $207.50 ÷ 20 packs = $10.38 per pack",
          "M6a per card: $207.50 ÷ 120 cards = $1.73 per card — every one of them holo",
          "SV11B Black Bolt box: $152.65 ÷ 20 packs = $7.63 per pack",
          "SV11B per card: $152.65 ÷ 140 cards = $1.09 per card"
        ],
        "paragraphs": [
          "Box prices are marketing. Cost per pack and cost per card are arithmetic, and arithmetic is where most 'investments' in this hobby quietly fall apart. Take the [M6a 30th Celebration booster box](/product/m6a-30th-celebration-booster-box-japanese-poke-mon-tcg/) at $207.50. That is the most expensive standard box on our Pokémon shelf, and per card it is also one of the most defensible: 120 cards, every single one holo, works out to $1.73 a card.",
          "Compare the [SV11B Black Bolt booster box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) at $152.65 for 140 cards — $1.09 a card. Neither number tells you what the box will be worth in three years. What they tell you is what you are paying for the floor: the guaranteed contents. An investment case built on guaranteed contents can at least be argued. One built on hoped-for chase cards is a lottery ticket with extra steps.",
          "That is the first test any sealed 'investment' has to pass: if the price only makes sense assuming the best possible outcome, it is not an investment case. It is a hope with a receipt. The collectors who come out ahead in this hobby are, almost without exception, the ones who bought the floor cheaply and let any appreciation arrive as a surprise."
        ]
      },
      {
        "h": "The case paradox: bulk is not a discount until you divide",
        "math": [
          "OP-17 Japanese single box: $101.07 ($4.21 per pack)",
          "OP-17 Japanese case: $1,215 ÷ 12 boxes = $101.25 per box — $0.18 MORE per box than singles",
          "OP-17 English single box: $153.69 ($6.40 per pack)",
          "OP-17 English case: $1,553.36 ÷ 12 = $129.45 per box — here the case does save $24.24 per box"
        ],
        "note": "From the Warehouse: the most common start to a case conversation in our chat is a buyer assuming the bulk discount exists and asking how big it is. Sometimes the honest answer is that it is negative. The buyers who do well here are the ones who ask for the per-box number first and the story second.",
        "paragraphs": [
          "Serious buyers graduate from boxes to cases, assuming wholesale logic applies. Sometimes it does. Sometimes the case is its own collectible with its own price, and the per-box number comes out worse than buying single boxes. Our [sealed case vs booster box breakdown](/blog/sealed-case-vs-booster-box-the-math/) works through the full comparison; the headline example is OP-17, the same set in both languages.",
          "Same set, same shelf, opposite answers depending on language. Anyone who tells you cases are always the smart money has not divided recently — and the difference is not small change at the English end, where the case genuinely saves real money per box."
        ]
      },
      {
        "h": "Four places people park card money, compared honestly",
        "paragraphs": [
          "If cards are where your spare money goes, there are really four vehicles, and they fail in different ways. Sealed Japanese boxes lean on collector demand and thinner specialist attention outside Japan. Sealed English boxes lean on the biggest resale pool in the hobby. Graded singles lean on character popularity and slab populations. Raw chase singles are pure timing.",
          "Notice what the table does not contain: a winner. Each option trades a different risk. The closest thing to a free lunch is liquidity — the ability to leave — and on that measure, popular singles and English sealed beat Japanese sealed, because the buyer pool for Japanese product outside Japan is smaller and more specialist.",
          "Graded singles deserve one extra warning: the grade is doing the work, not the card. Understanding what the letters on a Japanese card actually mean — AR, SAR, UR and the rest — is covered in our [rarity symbols guide](/blog/japanese-pokemon-rarity-symbols-explained/), and it matters here because a raw SAR and a graded SAR are different assets with different buyers, different fees, and different exit speeds.",
          "One more line the table cannot show: your own behavior. The best-performing vehicle on paper loses to the one you will actually hold through a 30% dip without panic-selling at the bottom of it. Match the vehicle to the temperament, not just to the spreadsheet — a position you abandon mid-fall performs worse than a mediocre one you keep."
        ],
        "table": {
          "head": [
            "Option",
            "Liquidity",
            "Storage burden",
            "Main risk",
            "Realistic horizon"
          ],
          "rows": [
            [
              "Sealed Japanese boxes",
              "Medium — real collector demand, smaller buyer pool than English",
              "High — bulky, condition-sensitive",
              "Reprints and hype retrace",
              "3–5+ years"
            ],
            [
              "Sealed English boxes",
              "Highest — the largest resale pool in the hobby",
              "High — the same bulk problem",
              "Large print runs; a very public, efficient market",
              "3–5+ years"
            ],
            [
              "Graded singles",
              "High for popular characters, slow for everything else",
              "Low — slabs stack flat",
              "Grading fees, grade risk, population growth",
              "1–3 years"
            ],
            [
              "Raw chase singles",
              "Fast when hyped, thin when not",
              "Low",
              "Spike-and-retrace after restocks; condition disputes",
              "Weeks to months"
            ]
          ]
        }
      },
      {
        "h": "The five ways this goes wrong — and what recovery looks like",
        "math": [
          "Worked example (hypothetical): $1,000 of sealed product sits untouched for 3 years and its price does not move",
          "At a hypothetical 3% annual inflation, break-even is $1,000 × 1.03 × 1.03 × 1.03 = $1,092.73",
          "The flat box is still 'worth $1,000' — about $915 in today's purchasing power. Flat is a slow loss, not a hold."
        ],
        "note": "The recovery for all five failure modes is the same discipline: size positions as money that can sit for five years, spread across the four vehicles instead of doubling down on one set, and buy product you would genuinely enjoy opening if the price fell. Enjoyment is the floor that no reprint can take away.",
        "paragraphs": [
          "Reprints. Japanese sets get restocks, and a box bought at a scarcity price during a sellout can retrace the moment fresh supply lands. The recovery is boring: never pay scarcity prices for a set whose print window is still open. Our [pre-order timing guide](/blog/preorder-japanese-booster-box-or-wait/) exists precisely because the first price is rarely the final price.",
          "Hype retrace. Chase singles spike at release and bleed as supply surfaces and attention rotates to the next set. If your thesis requires selling inside the first fortnight, you are a trader, not an investor, and you should size positions like one — small, and with an exit decided before you buy.",
          "Liquidity and storage. A case is twelve boxes of bulky, condition-sensitive cardboard. It needs dry, flat, boring storage for years, and when you sell, you sell into a smaller pool than English product — one buyer at a time, with shipping risk on every transaction. Buying secondhand adds another layer: know how to spot a fake before money moves. Start with our [guide to spotting fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/).",
          "Exit costs. Every resale pays a toll — marketplace fees, payment processing, shipping, and the occasional dispute. None of these appear in the screenshots people post of what their box 'is worth.' A price on a screen is not a price in your account, and the gap between them widens exactly when everyone tries to leave at once.",
          "Opportunity cost. This is the one nobody posts about. Money asleep in a closet is money not compounding anywhere else, and a box that merely keeps its price can still be a loss:"
        ]
      },
      {
        "h": "The Japan part of the equation",
        "paragraphs": [
          "Japanese product carries two structural facts that change the math. First, Japanese cards are not tournament-legal in English-language events, so the entire player demand that supports English singles prices does not exist for Japanese cards — the buyer is a collector, full stop. Second, Japanese sets release first: OP-17 landed in Japan on August 22, 2026, six days ahead of the English release on August 28, which makes Japanese prices the early signal and English the deeper market that follows.",
          "Against that, Japanese print quality and centering are generally better, which is why Japanese chase cards grade well and why the collector niche pays attention in the first place. It is a real edge. It is just a narrower one than the internet version, in which every Japanese box is a vault. The full language-by-language split — price, quality, legality, resale — is in our [Japanese vs English buying guide](/guides/japanese-vs-english-pokemon-cards/).",
          "There is a timing asymmetry buried in that six-day gap. Japanese prices form first, on thinner information, which means early Japanese buyers are partly paying for discovery. English prices form later, in a deeper market, and tend to be harder to move afterward. Neither is an advantage by itself — but it explains why the same set can look volatile in Japanese and merely expensive in English during the same week."
        ]
      },
      {
        "h": "The narrow exceptions where the math can work",
        "paragraphs": [
          "Exceptions exist, and they share a shape: the value sits in the guaranteed structure, not in a hoped-for spike. M6a guarantees a Pikachu in every pack and a holo in every slot, so the box delivers its promise even if the resale price never moves — the floor is the product itself. Entry price matters the same way: a set bought near its per-card floor has far less room to disappoint than one bought at a celebration premium after the crowd has already arrived.",
          "The second exception is patience with genuinely loved sets bought after the hype has left — not during it. Both exceptions are speculation with a hobby floor, and calling them that is not an insult. It is how you size them: money whose worst case is 'I own cards I like,' never money whose worst case is a missed payment. Browse what is actually available on our [Pokémon shelf](/pokemon-cards/) and run the per-card division on anything that tempts you before the story gets a vote.",
          "What does not qualify as an exception, no matter how often it gets dressed up as one: a set being hot this week. Launch heat is the crowd's signal, not yours, and it is the most expensive signal in the hobby to follow. Every exception above was bought against the crowd's attention, not with it. That is not a coincidence — it is the whole mechanism."
        ]
      },
      {
        "checklist": [
          "Divide the price: cost per pack and cost per card written down, not vibes",
          "Check the case math separately — bulk is not automatically cheaper",
          "Name your exit: who buys this, in which language market, after what fees",
          "Set the horizon in years and the size as money that can sit untouched",
          "Confirm you would enjoy opening it if the resale price fell 30% — if not, do not buy it",
          "Store it like inventory: cool, dry, flat — and insured if the pile grows"
        ],
        "h": "Before a box goes in the 'investment' pile",
        "paragraphs": [
          "Run every candidate purchase through this list. If it fails one line, it is a hobby purchase — which is fine, as long as it is priced and sized as one. Our full head-to-head on the language question, with the per-pack numbers for both sides, is [the Japanese vs English comparison](/blog/japanese-vs-english-pokemon-cards-which-to-buy/)."
        ]
      }
    ],
    "slug": "are-japanese-pokemon-cards-a-good-investment",
    "takeaway": [
      "Verdict: buy Japanese Pokémon cards because they are the best version of the hobby — better print, honest per-card prices, sets built to be opened. If some of them appreciate, treat it as a bonus on a collection, not a return on a portfolio. The moment the purchase needs the price to cooperate, it has stopped being collecting and started being an unpriced bet.",
      "And if you do park money in sealed product, do it the way the numbers above demand: divided, diversified, and sized to be forgotten for years. More of this shop-floor math lives on [the Warehouse blog](/blog/).",
      "Two operational reads before any money moves: [how to store sealed booster boxes](/blog/how-to-store-sealed-booster-boxes/) — because condition is where sealed value leaks — and [should you open or keep it sealed?](/blog/should-you-open-or-keep-sealed-booster-box/), the decision every buyer eventually faces.",
      "The price context behind this article now has a full ladder: [best-value Japanese Pokémon booster boxes](/blog/best-value-japanese-pokemon-booster-boxes/) ranks every Japanese box the Warehouse sells by price, and runs per-card math only where the structure is verified."
    ]
  },
  "best-one-piece-booster-box-to-buy": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "OP-18 Japanese, at Warehouse prices as of October 24, 2026: $70 for a 24-pack box is $2.92 per pack, and inside the $755 case the rate falls to $2.62 per pack. The next cheapest is OP-17 Japanese at $4.21 per pack.",
        "q": "What is the cheapest One Piece booster box per pack?"
      },
      {
        "a": "No. OP-18's case undercuts its box by $7.08 per box and OP-17 English's case saves $24.24 per box, but the OP-17 Japanese case works out to $101.25 per box — $0.18 more than the $101.07 single-box price. Divide the case price by 12 before assuming anything.",
        "q": "Is a One Piece case always cheaper than buying boxes?"
      },
      {
        "a": "For a first deck pool, the OP-18 Japanese box at $70 builds the most cards per dollar at $2.92 per pack. Choose OP-17 English at $153.69 if you need to read every card or play where English text is required, and accept $6.40 per pack as the price of that requirement.",
        "q": "Japanese or English One Piece boxes — which should a new player buy?"
      }
    ],
    "h1": "The Best One Piece Booster Box to Buy, Settled with Numbers",
    "intro": [
      "There is no single best One Piece booster box, and any answer that skips your use case is selling something. There is, however, a best box for each job, and the Warehouse stocks few enough One Piece lines that the whole field fits on one page: OP-18, OP-17 Japanese, and OP-17 English, each as a box and as a case. Every box here holds 24 packs and every case holds 12 boxes, so the comparison is clean arithmetic. All prices are Warehouse prices as of October 24, 2026, and the full set pages are the [OP-17 World's Strongest Warriors hub](/sets/op-17-worlds-strongest-warriors/) and the [OP-18 The Dominance of God hub](/sets/op-18-the-dominance-of-god/).",
      "This guide is not for anyone who wants one answer with no questions asked. The right box depends entirely on the job: building a first deck pool, chasing the current set, feeding a playgroup, or reading every card in English. State the job and the numbers below settle the rest, because the three case structures on this page point in three different directions, and two of them punish buyers who assume instead of dividing."
    ],
    "metaDescription": "OP-18 at $2.92 a pack or OP-17 English at $6.40? Every One Piece box the Warehouse stocks, compared per pack and per case, with a verdict per buyer.",
    "metaTitle": "Best One Piece Booster Box to Buy: The Numbers",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The whole field, priced",
        "paragraphs": [
          "Start with the shelf as it stands. OP-18 The Dominance of God releases November 20, 2026, and is on pre-order: the [OP-18 Japanese booster box](/product/one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game/) is $70 and its case is $755, as of October 24, 2026. OP-17 World's Strongest Warriors is the fourth-anniversary set, built around the Elbaf arc, released in Japan on August 22, 2026 and in English on August 28, 2026. The [OP-17 Japanese box](/product/op-17-the-world-s-strongest-warriors-booster-box-japanese-one-piece-card/) is $101.07 with a case at $1,215, and the [OP-17 English box](/product/op-17-the-world-s-strongest-warriors-booster-box-english-one-piece-card/) is $153.69 with a case at $1,553.36, all as of October 24, 2026.",
          "Six listings, three sets, two languages. The box prices alone suggest a simple ladder — OP-18 cheapest, OP-17 English dearest — but box price is the wrong unit for two of the three buying decisions on this page. Players think in packs, playgroups think in cases, and both units reverse conclusions the box price suggests. So the next step is to convert everything twice: once per pack, once per box inside a case."
        ],
        "table": {
          "head": [
            "Product",
            "Box price",
            "Case price",
            "Per pack (box)",
            "Per box (in case)"
          ],
          "rows": [
            [
              "OP-18 Japanese",
              "$70",
              "$755",
              "$2.92",
              "$62.92"
            ],
            [
              "OP-17 Japanese",
              "$101.07",
              "$1,215",
              "$4.21",
              "$101.25"
            ],
            [
              "OP-17 English",
              "$153.69",
              "$1,553.36",
              "$6.40",
              "$129.45"
            ]
          ]
        }
      },
      {
        "h": "The math, every line shown",
        "math": [
          "OP-18 box: $70.00 ÷ 24 packs = $2.92 per pack",
          "OP-18 case: $755 ÷ 12 = $62.92 per box → $2.62 per pack (saves $7.08 per box)",
          "OP-17 JP box: $101.07 ÷ 24 = $4.21 per pack",
          "OP-17 JP case: $1,215 ÷ 12 = $101.25 per box — $0.18 MORE per box than the single",
          "OP-17 EN box: $153.69 ÷ 24 = $6.40 per pack",
          "OP-17 EN case: $1,553.36 ÷ 12 = $129.45 per box → $5.39 per pack (saves $24.24 per box)"
        ],
        "paragraphs": [
          "Nothing in the table above is a claim. Each figure is one division away from a listed price, and here is every division. A box holds 24 packs and a case holds 12 boxes, the standard One Piece structure confirmed in [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/). Per-pack cost decides what a player's pool really costs. Per-box-in-case decides whether bulk buying helps or quietly hurts."
        ]
      },
      {
        "h": "Three cases, three different answers",
        "note": "Warehouse Note: the three cases on this page were priced by three different logics and it shows. One discounts honestly, one quietly charges a bulk premium, one discounts hardest because its single price starts highest. None of that is visible until the case price is divided by 12, which is why the division is step one of every case purchase, not a refinement.",
        "paragraphs": [
          "The OP-18 case is a genuine bulk discount: $62.92 per box against $70 bought singly, a saving of $7.08 on every box and the cheapest per-pack rate on the page at $2.62. For a playgroup or a sealed holder, the case is simply the correct format, and the reasoning is laid out in full in the [OP-18 pre-order guide](/blog/op-18-the-dominance-of-god-preorder-guide/). There is no catch in the arithmetic.",
          "The OP-17 Japanese case is the trap. At $1,215 it sounds like the committed buyer's move, but divided by 12 it is $101.25 per box, which is $0.18 more per box than the $101.07 single. The case penalizes the buyer it appears to reward. Unless a group needs exactly twelve boxes in one shipment for reasons of logistics, the Japanese OP-17 case is the wrong format at this store, full stop. This is the exact failure [the sealed case versus booster box math](/blog/sealed-case-vs-booster-box-the-math/) exists to catch: identical structure, opposite verdict, decided only by doing the division.",
          "The OP-17 English case is the biggest saver of the three in absolute dollars: $129.45 per box against $153.69 singly, $24.24 saved on every box, pulling the per-pack cost down from $6.40 to $5.39. English product starts expensive and its case claws back the most. A playgroup committed to English text should never buy that set box by box."
        ]
      },
      {
        "h": "The verdict by buyer type",
        "paragraphs": [
          "With the arithmetic done, the decision table is short. Find your row, and note that two of the four rows are decided by the case analysis rather than by the sets themselves."
        ],
        "table": {
          "head": [
            "Buyer",
            "Buy",
            "Why"
          ],
          "rows": [
            [
              "New player building a first deck pool",
              "OP-18 Japanese box at $70",
              "Lowest entry at $2.92 per pack; a fresh, current pool to build from, with singles finishing the list"
            ],
            [
              "Collector chasing the current set",
              "OP-18 box, or the case if holding sealed",
              "The newest set with Yoshitaka Amano art on Loki and Saint Shamrock; the case undercuts the box by $7.08"
            ],
            [
              "Playgroup splitting a case",
              "OP-18 case at $755, or OP-17 English case at $1,553.36",
              "Both cases genuinely discount — $7.08 and $24.24 per box. The OP-17 Japanese case does not and is excluded"
            ],
            [
              "English-only reader",
              "OP-17 English box at $153.69, case at $1,553.36 for groups",
              "The only fully English option on the shelf today; the case drops the per-pack cost from $6.40 to $5.39"
            ]
          ]
        }
      },
      {
        "h": "How the deck builders should read this",
        "paragraphs": [
          "A booster box is a pool, not a deck, and that fact shapes which box serves a player. The skeleton in [how to build your first One Piece deck](/blog/one-piece-how-to-build-your-first-deck/) is a Leader, a 50-card main deck, and a 10-card DON!! deck, with at most four copies of any card number and every card's color matching the Leader. A box of 24 packs feeds that structure with bodies and staples; it does not finish a list, and the finishing is done with singles. For that job, per-pack cost is the only price that matters, and OP-18's $2.92 — or $2.62 inside a shared case — is the cheapest pool-building rate the Warehouse offers in this game as of October 24, 2026.",
          "OP-17 Japanese at $4.21 per pack earns its place for a narrower reason: the player who specifically wants the anniversary set's Elbaf card pool and accepts paying roughly 44 percent more per pack than OP-18 for that particular pool. That is a legitimate want. It is just not a value play, and it should never be bought as one."
        ]
      },
      {
        "h": "Failure modes and recoveries",
        "paragraphs": [
          "The expensive failure on this page is buying the OP-17 Japanese case on the assumption that bulk always discounts. It does not: the buyer pays $0.18 more per box, $2.16 across the case, for the privilege of buying twelve at once. The recovery, if a case already landed, is simply to note that the damage is small and the lesson permanent — divide before paying, on every set, forever. The second failure is paying the English premium without needing English. At $6.40 per pack, OP-17 English costs more than double OP-18's per-pack rate; that premium buys readable card text and local event legality, and it buys nothing else. A collector who reads Japanese or collects sealed is paying for a feature that never gets used.",
          "The third failure is softer: chasing the newest set because it is newest. OP-18's price makes that mistake cheap this cycle, but the habit is the problem. A box bought for a job — pool, chase, split, or shelf — performs. A box bought because a release date arrived is inventory in search of a reason, and the recovery is to assign it a job before opening it, or hold it sealed until it has one."
        ]
      },
      {
        "h": "Context: anniversary set versus Amano set",
        "paragraphs": [
          "OP-17 is the fourth-anniversary set, the kind of release built to be remembered: Elbaf arc material, Four Emperors Leaders, the debut of Rocks D. Xebec. Its Japanese box still commands $101.07 two months after release, which says the anniversary premium is holding. OP-18 counters with a different kind of headline — Yoshitaka Amano art, revealed at One Piece Day 2026 — and a lower entry price. Neither set is the other's substitute. One is a milestone set mid-run; the other is an art-led set at the start of its window. Collectors with room for both are not duplicating anything, and buyers choosing between them are choosing a theme, with the prices above deciding what the theme costs. The wider [One Piece card range](/one-piece-cards/) covers the rest of the shelf if neither set fits the job."
        ]
      },
      {
        "checklist": [
          "Name the job in one sentence: deck pool, current-set chase, playgroup split, or English reading",
          "Use the right unit: per pack for players, per box inside the case for groups",
          "Divide every case price by 12 yourself before paying it — the OP-17 Japanese case fails this test",
          "If the job is a deck pool, price OP-18 first: $2.92 per pack is the cheapest entry as of October 24, 2026",
          "Pay the English premium only if English text is actually required",
          "Plan the singles step: the box builds the pool, singles finish the list",
          "If splitting a case, fix shares and payment before the case ships"
        ],
        "h": "The buying checklist",
        "paragraphs": [
          "Before paying for any One Piece box on this page, walk the list.",
          "For links, return to the set pages: the OP-17 hub and the OP-18 hub settle contents and release details, and this article settles price."
        ]
      }
    ],
    "slug": "best-one-piece-booster-box-to-buy",
    "takeaway": [
      "The best One Piece booster box is the one whose arithmetic matches your job. OP-18 wins on price at every unit — $2.92 per pack, $62.92 per box in a case that honestly discounts. OP-17 English wins for readers and its case saves the most per box. OP-17 Japanese is a theme purchase at $4.21 per pack, and its case is the one format on this page to avoid, charging $0.18 more per box for buying in bulk. Three sets, three case structures, three answers — all of them visible the moment the division gets done."
    ]
  },
  "best-value-japanese-pokemon-booster-boxes": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "M3, at $58.85 as of October 24, 2026 — the smallest cheque in the store for a full Japanese box. Cheapest box and cheapest per card are different titles, though: per card, the verified floor is SV11W White Flare at $1.00.",
        "q": "What is the cheapest Japanese Pokémon booster box?"
      },
      {
        "a": "Because their pack and card structures are not part of the verified set this guide runs on. A per-card figure needs both a price and a card count; with only the price verified, printing a per-card number would mean inventing the other half. The price ladder itself is verified and complete.",
        "q": "Why is there no cost-per-card figure for M2a, M3, M4, and M5?"
      },
      {
        "a": "Start inside your band and buy one box. Under $60, M3 at $58.85 (as of October 24, 2026) is the low-risk introduction. If verified per-card efficiency matters more than the smallest cheque, White Flare at $139.77 and $1.00 a card is the strongest documented value in the store. Open it, judge the keep-rate, then decide on box two.",
        "q": "Which box should a first-time buyer of Japanese Pokémon start with?"
      }
    ],
    "h1": "Best Value Japanese Pokémon Booster Boxes: The Honest Price Ladder",
    "intro": [
      "Short answer: the cheapest Japanese Pokémon booster box in the store is M3 at $58.85, and the cheapest verified cost per card belongs to SV11W White Flare at $1.00 a card — both as of October 24, 2026. Those are two different answers because 'value' is two different questions: the smallest cheque, and the most cards for the money. This guide lays out the full seven-box price ladder, runs per-card math only where a set's structure is verified, and says plainly where the data runs out.",
      "Everything below works from [the store's Japanese Pokémon range](/pokemon-cards/) and its verified prices. Where a box's pack and card counts are confirmed, the per-card number is shown with its arithmetic. Where they are not confirmed, no per-card number appears — a value ranking built on unverified structure is marketing, not analysis, and the Warehouse does not publish it."
    ],
    "metaDescription": "Every Japanese Pokémon box in the store, priced as of October 24, 2026 — per-card math where structure is verified, honest limits where it is not.",
    "metaTitle": "Best Value Japanese Pokémon Booster Boxes, Ranked by Price",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The price ladder: all seven boxes",
        "paragraphs": [
          "Here is the complete ladder, cheapest to most expensive, every price a Warehouse shelf price as of October 24, 2026. Two of these sets — the SV11 pair — share a verified structure of 20 packs × 7 cards = 140 cards. M6a is verified at 20 packs × 6 cards = 120 cards. For M2a, M3, M4, and M5, the Warehouse publishes the price and only the price in this guide, because their pack structures are not part of the verified set used here.",
          "Read the dashes in the last column as honesty, not missing effort. A per-card figure for the M-series boxes would require pack counts this guide has not verified, and printing one anyway is exactly how bad buying decisions get dressed up as research. The ladder itself — what each box costs against the others — is fully verified and fully usable."
        ],
        "table": {
          "head": [
            "Box",
            "Shelf price (Oct 24, 2026)",
            "Verified structure",
            "Cost per card"
          ],
          "rows": [
            [
              "M3",
              "$58.85",
              "Price verified; structure not in this guide's verified set",
              "—"
            ],
            [
              "M4",
              "$73.56",
              "Price verified; structure not in this guide's verified set",
              "—"
            ],
            [
              "M5",
              "$76.34",
              "Price verified; structure not in this guide's verified set",
              "—"
            ],
            [
              "M2a",
              "$95.64",
              "Price verified; structure not in this guide's verified set",
              "—"
            ],
            [
              "SV11W White Flare",
              "$139.77",
              "20 packs × 7 cards = 140 cards",
              "$1.00"
            ],
            [
              "SV11B Black Bolt",
              "$152.65",
              "20 packs × 7 cards = 140 cards",
              "$1.09"
            ],
            [
              "M6a 30th Celebration",
              "$207.50",
              "20 packs × 6 cards = 120 cards, all holographic",
              "$1.73"
            ]
          ]
        }
      },
      {
        "h": "The math that can be run, run in the open",
        "math": [
          "SV11W White Flare: $139.77 ÷ 140 cards = $1.00 per card",
          "SV11B Black Bolt: $152.65 ÷ 140 cards = $1.09 per card",
          "M6a 30th Celebration: $207.50 ÷ 120 cards = $1.73 per card",
          "M-series boxes (M2a, M3, M4, M5): price known, structure unverified here — no per-card figure published"
        ],
        "paragraphs": [
          "Among the structure-verified boxes, White Flare is the per-card floor of the store at $1.00 a card, with Black Bolt nine cents behind it. The head-to-head between those two — same skeleton, different legendary, $12.88 apart — is worked through in [Black Bolt vs White Flare](/blog/black-bolt-vs-white-flare-which-to-buy/), and the pair's home is [the SV11 set hub](/sets/sv11-black-bolt-white-flare/). M6a sits at the top of both ladders, price and per-card, for structural reasons: every card holographic, a Pikachu guaranteed per pack, an anniversary identity — the full case is made on [the M6a set hub](/sets/m6a-30th-celebration/).",
          "What per-card math cannot tell you is what the cards are. A dollar a card for 140 cards you do not want is worse value than $1.73 a card for 120 cards you collect seriously. Per-card cost ranks efficiency; it says nothing about fit. That is why the decision table below is organized by budget and purpose together, and why [the pack-count guide](/blog/how-many-packs-in-a-booster-box/) is worth reading before treating any per-card figure as a verdict."
        ]
      },
      {
        "h": "What actually moves a Japanese box's price",
        "paragraphs": [
          "Three forces do most of the work, offered as reasoning about how this market behaves, not as measured data. Print age: a set's box price tends to firm up as its print run recedes and shelf stock thins, because no new supply is being made at the original price. Chase demand: a set with one or two cards everyone wants concentrates demand into its sealed box, since the box is the only way to pull them fresh. Reprint risk: the opposite force — the credible possibility of more supply caps how far a box price can run, because buyers discount what might be printed again.",
          "Anniversary and event sets add a fourth force: identity. M6a's price is not only about 120 cards; it is about being the 30th anniversary box, a dated artifact. Identity-driven prices behave differently from play-driven ones — they depend on collectors continuing to care about the milestone. None of these forces comes with a dial the Warehouse can read for you. They are the questions to hold in mind while looking at the ladder, not a forecast."
        ]
      },
      {
        "h": "The decision table: value by budget band",
        "paragraphs": [
          "Match the band to the money actually available, then argue about purpose inside the band — not before it. A buyer with $80 arguing about M6a is having the wrong conversation."
        ],
        "table": {
          "head": [
            "Budget band",
            "Boxes in band (Oct 24, 2026)",
            "Best fit",
            "Ask first"
          ],
          "rows": [
            [
              "Under $60",
              "M3 — $58.85",
              "The entry point: a full Japanese box for the smallest cheque in the store",
              "Am I buying to open, collect, or hold? At this price the answer matters more than the set"
            ],
            [
              "$60–$100",
              "M4 — $73.56 · M5 — $76.34 · M2a — $95.64",
              "The comparison band: three boxes close enough in price that purpose, not price, should decide",
              "Which set's cards do I actually want in hand?"
            ],
            [
              "$140–$155",
              "SV11W White Flare — $139.77 · SV11B Black Bolt — $152.65",
              "The verified-structure band: full per-card math available, $1.00–$1.09 a card",
              "Zekrom or Reshiram? The sets share a skeleton — pick the legendary"
            ],
            [
              "$200+",
              "M6a 30th Celebration — $207.50",
              "The anniversary band: all-holo, guaranteed Pikachu per pack, $1.73 a card",
              "Am I paying for the celebration itself — because that, not card volume, is what the premium buys"
            ]
          ]
        }
      },
      {
        "h": "The questions that decide value for you",
        "note": "Warehouse Note: when a buyer asks which box is 'best value', the Warehouse answers with a question — what are you collecting? The ladder in this guide exists because the honest answer changes with the reply: M3 for the smallest cheque, White Flare for verified per-card efficiency, M6a for the anniversary. A store that gives one answer to every buyer is selling stock, not advice.",
        "paragraphs": [
          "Value is personal in exactly four ways. What are you collecting — a set, a species, a legendary, a shelf of sealed boxes? How much of the box's contents will you actually keep or play, versus sell or store? Does the chase structure suit you — many mid-level hits, or one grail and a long tail? And is this box competing with a specific single you could simply buy? Answer those four and the ladder mostly reads itself: the right box is the one whose contents match the answers, at a price inside your band.",
          "One more practical step: before buying up a band, read how the sealed-investment framing actually behaves over time in [are Japanese Pokémon cards a good investment?](/blog/are-japanese-pokemon-cards-a-good-investment/). Several boxes on this ladder get bought as 'investments' by default. Some of them should be bought as enjoyment instead — which is a better reason, stated plainly. And whichever band you land in, the sealed-versus-open decision comes before the which-box decision: [should you open or keep it sealed?](/blog/should-you-open-or-keep-sealed-booster-box/) is the framework, and scaling from a box to a case changes the math again — [the sealed case vs booster box math](/blog/sealed-case-vs-booster-box-the-math/) runs those numbers properly."
        ]
      },
      {
        "h": "Risk, failure modes, and recovery",
        "paragraphs": [
          "The classic failure is buying the cheapest box and discovering the contents were never the point: $58.85 spent on cards you do not collect is worse value than $139.77 spent on a set you love. The recovery is cheap — buy one box in a band, open it, and let the keep-rate of that box, how much of it you actually keep, judge the next purchase. A second failure is band creep: starting at M3 money and drifting to M6a money because the premium felt justified mid-shop. The ladder is the recovery: total the year's box spending against the band you chose, and buy the difference in singles if the drift already happened.",
          "Reprint risk, flagged in the price section, is the sealed holder's specific exposure: a box held for its price can be repriced by supply news that has nothing to do with the cards. Holders protect themselves the boring way — buy boxes they would be content to open, and store them the way [the sealed storage guide](/blog/how-to-store-sealed-booster-boxes/) describes, so the worst case is a rip they enjoy at a fair per-card cost rather than a stranded asset."
        ]
      },
      {
        "h": "Who this guide is NOT for",
        "paragraphs": [
          "Not for anyone hunting a guaranteed-return pick. No box on this ladder is one, no honest guide can name one, and a store that claims otherwise is selling the claim, not the box. Not for buyers who need a per-card ranking of all seven boxes: three of the seven can be ranked that way on verified structure, and the other four cannot — yet. And not for resellers working on margin timelines shorter than shipping; this ladder is shelf prices for collectors, not a wholesale sheet."
        ]
      },
      {
        "checklist": [
          "Budget band chosen first — under $60, $60–$100, $140–$155, or $200+",
          "Purpose stated in one sentence: open, complete, play, or hold sealed",
          "Per-card math used only where structure is verified — the SV11 pair and M6a",
          "For M-series boxes, the decision made on price and purpose, not invented per-card figures",
          "Chase card priced as a single, as the standing alternative to any box",
          "Reprint and supply risk accepted in writing — at least in your own notes",
          "One box bought and judged before a second is ordered"
        ],
        "h": "Before you buy: the value checklist",
        "paragraphs": [
          "Seven checks, in order. The ladder does the rest."
        ]
      }
    ],
    "slug": "best-value-japanese-pokemon-booster-boxes",
    "takeaway": [
      "The ladder, one last time, all prices as of October 24, 2026: M3 $58.85, M4 $73.56, M5 $76.34, M2a $95.64, White Flare $139.77, Black Bolt $152.65, M6a $207.50. Verified per-card: White Flare $1.00, Black Bolt $1.09, M6a $1.73. Everything else in this guide is framework — the questions that turn a price into a value judgment for one specific buyer.",
      "That is the most honest form a 'best value' guide can take. The Warehouse publishes its prices, shows its arithmetic where arithmetic is possible, and refuses the fake precision of ranking what it has not verified. Pick your band, answer the four questions, and the right box is usually the one still standing."
    ]
  },
  "black-bolt-vs-white-flare-which-to-buy": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Demand for the pair tracks which legendary more collectors want, and that balance shifts over time — the $12.88 shelf gap as of October 21, 2026 is the current footprint of that preference. What doesn't shift is the structure underneath: identical boxes. Buy the demand you personally have, not the demand you're guessing strangers will have later.",
        "q": "Is Black Bolt more popular than White Flare?"
      },
      {
        "a": "Only if you genuinely want both legendaries. Together they're $292.42 at October 21, 2026 prices, and because both boxes share the same structure and release, buying both concentrates your money in one paired set rather than spreading risk. As a collector's choice, it's fine. As diversification, it isn't any.",
        "q": "Should I buy both Black Bolt and White Flare?"
      },
      {
        "a": "It depends on what you measure. Both formats contain exactly 140 cards; the Deluxe costs $24.84 more on either set, and that premium buys the AR-or-better guaranteed pack structure — not more cards. If guaranteed hits and zero bulk matter to you, it's a fair price. If you measure purely by cost per card, the standard box wins on both sets.",
        "q": "Is the Deluxe box worth it over the standard box?"
      }
    ],
    "h1": "Black Bolt vs White Flare: Which One Should You Buy?",
    "intro": [
      "Two boxes sit on the shelf. Same card count, same pack structure, same release day, same gimmick — one headlined by Zekrom, the other by Reshiram, and $12.88 between them. If you're stuck choosing between SV11B Black Bolt and SV11W White Flare, here is the short answer first: structurally, they are the same bet. Pick by which legendary you actually want to pull, and run the Deluxe math carefully if you're buying Deluxe. Everything below is the working.",
      "This article is for collectors deciding between the two standard boxes or the two Deluxe boxes. It is not for anyone hunting for the objectively 'better investment' of the pair — we'll say it plainly now and prove it with the numbers later: the data doesn't support that claim, for either side."
    ],
    "metaDescription": "SV11B Black Bolt vs SV11W White Flare: same structure, $12.88 apart. Per-pack math, Deluxe math, and how to choose — by legendary, not by hype.",
    "metaTitle": "Black Bolt vs White Flare: Which Box to Buy?",
    "readMinutes": 9,
    "sections": [
      {
        "h": "One release, two boxes: what you're actually choosing between",
        "note": "The question we hear most about this pair is 'which one is better value?' — asked as if one box secretly contains more. It doesn't. When we walk a customer through the pack counts and the secret counts side by side, the choice almost always resolves in about ten seconds: they wanted one of the two legendaries all along. The value question was really a permission question.",
        "paragraphs": [
          "Black Bolt and White Flare released together in Japan on June 6, 2025, as a paired set — the SV11B / SV11W split. Each standard box holds [20 packs of 7 cards](/blog/how-many-packs-in-a-booster-box/), 140 cards per box. Each set carries 86 or more secret cards above the base set, and across the pair, all 156 Unova Pokémon appear as AR (Art Rare) or better. The full breakdown of both sets lives on our [SV11 set hub](/sets/sv11-black-bolt-white-flare/).",
          "The headline difference is the new BWR rarity: Black Bolt's face is Zekrom ex, White Flare's is Reshiram ex. That is the real fork in the road. Not pack counts, not secret counts, not structure — those are twins. The legendary on the chase card, and the price."
        ]
      },
      {
        "h": "The money layer: a $12.88 gap, and what it buys you (nothing structural)",
        "math": [
          "Black Bolt standard: $152.65 ÷ 20 packs = $7.63 per pack",
          "White Flare standard: $139.77 ÷ 20 packs = $6.99 per pack",
          "Per card (140 per box): Black Bolt $1.09 — White Flare $1.00",
          "The gap: $152.65 − $139.77 = $12.88, for an identical 140-card structure",
          "Deluxe: 4 packs × 35 cards = 140 cards — the same total as a standard box",
          "Black Bolt Deluxe: $177.49 ÷ 140 = $1.27 per card (vs $1.09 standard)",
          "White Flare Deluxe: $164.61 ÷ 140 = $1.18 per card (vs $1.00 standard)",
          "Deluxe premium over standard: $24.84 on both sets — it buys the AR-or-better guarantee, not more cards"
        ],
        "paragraphs": [
          "Prices below are our shelf prices as of October 21, 2026. The [Black Bolt standard box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) is $152.65. The [White Flare standard box](/product/sv11w-white-flare-booster-box-japanese-pokemon-card/) is $139.77. Here is that gap with the arithmetic exposed:",
          "So the $12.88 buys exactly one thing: a different legendary at the top of the chase, and whatever demand follows that legendary. It does not buy more packs, more secrets, or better odds at anything. Anyone telling you Black Bolt is 'worth the premium' on structure is selling you a story the arithmetic doesn't back.",
          "Now the Deluxe boxes, because this is where buyers actually overpay by accident. A Deluxe box is 4 packs of 35 cards — the same 140 cards as a standard box — with AR or better guaranteed in the pack structure. The [Black Bolt Deluxe](/product/sv11b-expansion-pack-deluxe-black-bolt-booster-box-japanese-pokemon-card/) is $177.49 and the [White Flare Deluxe](/product/sv11w-expansion-pack-deluxe-white-flare-booster-box-japanese-pokemon-card/) is $164.61. Notice something: the gap between the two Deluxe boxes is also exactly $12.88. The legendary premium is a flat charge applied across the whole product line, not a quirk of one box."
        ]
      },
      {
        "h": "The head-to-head, in one table",
        "paragraphs": [
          "Everything above, compressed. Read down the rows and watch which ones actually differ.",
          "The pattern is the whole story: the only rows that differ are the price rows and the legendary row. That is the entire decision, and no amount of extra research changes it."
        ],
        "table": {
          "head": [
            "",
            "Black Bolt (SV11B)",
            "White Flare (SV11W)"
          ],
          "rows": [
            [
              "Release",
              "June 6, 2025 (Japan)",
              "June 6, 2025 (Japan)"
            ],
            [
              "Standard box",
              "20 packs × 7 cards = 140 cards",
              "20 packs × 7 cards = 140 cards"
            ],
            [
              "Box price (as of Oct 21, 2026)",
              "$152.65",
              "$139.77"
            ],
            [
              "Cost per pack",
              "$7.63",
              "$6.99"
            ],
            [
              "Cost per card",
              "$1.09",
              "$1.00"
            ],
            [
              "Headline BWR card",
              "Zekrom ex",
              "Reshiram ex"
            ],
            [
              "Secret cards",
              "86+",
              "86+"
            ],
            [
              "Deluxe box",
              "4 packs × 35 cards, AR or better guaranteed",
              "4 packs × 35 cards, AR or better guaranteed"
            ],
            [
              "Deluxe price",
              "$177.49 ($1.27/card)",
              "$164.61 ($1.18/card)"
            ]
          ]
        }
      },
      {
        "h": "So how do you actually choose?",
        "paragraphs": [
          "By the legendary. If Zekrom is your Pokémon — if that's the card you'd keep, grade, or build a shelf around — Black Bolt is your box and the $12.88 is simply the price of wanting the right thing. If it's Reshiram, White Flare gives you the identical pull structure for less money. There is no third answer hiding in the spreadsheets.",
          "By format, second. If you were going Deluxe anyway, the per-card premium over standard — $1.27 vs $1.09 on Black Bolt, $1.18 vs $1.00 on White Flare — buys the guaranteed AR-or-better structure. For collectors who hate bulk, that guarantee is a real feature. For anyone opening on a budget, the standard boxes deliver the same 140 cards for $24.84 less, and the guarantee is the only thing you give up.",
          "And if you're building toward completion of either set, read [what a master set actually commits you to](/blog/what-is-a-master-set-pokemon/) before buying either box. Eighty-six-plus secrets per set is a long road, and which box you start with is the smallest decision on it."
        ]
      },
      {
        "h": "The practical layer: buying the pair well, step by step",
        "paragraphs": [
          "Step one: settle the legendary before you look at prices. Prices will argue with you; the legendary won't. Decide which card you would actually keep if you pulled it — that is your set. Buyers who skip this step end up comparison-shopping between two boxes when only one of them contains the card they want, and 'saving' $12.88 toward the wrong chase is the most expensive saving in this hobby.",
          "Step two: choose the format with the per-card numbers in front of you, not the pack theater. A Deluxe box looks small — 4 packs against the standard box's 20 — until you run the division: 4 × 35 is the same 140 cards, rearranged so the strong cards are guaranteed by the pack structure rather than hoped for. If you judge a box by its worst pack, Deluxe is built for you. If you judge it by its best pack, standard is — and it costs $24.84 less for the privilege of the gamble.",
          "Step three: before ordering a second box of either set, price the headline single. This is the step that separates collectors from repeat customers of variance. The BWR you want trades as a single at some price, and that price is either less than another box or it isn't. If it is, buy the card and let someone else pay for the other 139.",
          "Step four: check what else is coming before this pair takes the whole month's budget. SV11 is one stop on a Japanese release schedule that doesn't pause, and the [release calendar](/release-calendar/) shows what's confirmed next. More than one collector has emptied the budget on a paired set a week before a set they wanted more was announced — the boxes keep, but the regret is immediate."
        ]
      },
      {
        "h": "Where this decision goes wrong",
        "paragraphs": [
          "The most common failure mode is buying both boxes 'to be safe.' That doesn't diversify anything. You've doubled your exposure to the same structure, the same release day, the same design philosophy — $152.65 + $139.77 = $292.42 riding on one paired set. If the pair cools in the market, both boxes cool together. Buying both is a perfectly good choice if you love both legendaries. It is not a hedge, and it shouldn't be justified as one.",
          "The second failure mode is chase disappointment. The BWR card is a headline, not a promise. Most boxes of either set will not contain the headline card, and a box bought only for that one card is a box bought to be disappointed. The recovery is real, though: every card in both sets trades as a single. If the legendary is the actual goal, price the single directly before buying a second box hunting it. That's the move almost nobody makes and almost everybody should.",
          "Third: assuming today's $12.88 gap is a law of nature. It's a shelf price as of October 21, 2026. Gaps between paired sets move as stock and demand move. If you're reading this later, re-run the division on current prices — the method survives even when the numbers change. Our [pack-count reference](/blog/how-many-packs-in-a-booster-box/) keeps the underlying structures straight."
        ]
      },
      {
        "h": "The Japan context: what buying the Japanese pair means",
        "paragraphs": [
          "Both sets are Japanese-language releases, printed for the Japanese market. Japanese-language cards are not legal in English-language official tournaments, so for competitive players the language question settles itself before the legendary question even starts. For collectors, the calculus runs the other way: Japanese print quality, and an AR-or-better treatment spanning all 156 Unova Pokémon, are exactly why this pair drew a global audience.",
          "It also means the pair lives on a Japanese release schedule, not an English one. If you plan purchases around what's coming next, the [release calendar](/release-calendar/) is where the Warehouse posts confirmed dates."
        ]
      },
      {
        "h": "Who should buy neither",
        "paragraphs": [
          "Anyone expecting one of these boxes to be the objectively better investment should buy neither, because the premise is false and a false premise makes both choices wrong. The numbers show two identical structures at two prices separated by one legendary's popularity. Popularity is a real thing, but it is not an edge you can arithmetic your way into from a product page.",
          "And whichever box you do buy, the next decision arrives shrink-wrapped: [open it or keep it sealed](/blog/should-you-open-or-keep-sealed-booster-box/) is a separate question with its own math. Decide it on purpose, not on impulse, and not in the same breath as this one."
        ]
      },
      {
        "checklist": [
          "Decide the legendary first: Zekrom (Black Bolt) or Reshiram (White Flare) — this is the actual decision",
          "Choose format second: standard for the lowest cost per card, Deluxe only if the AR-or-better guarantee is worth $24.84 to you",
          "Re-run the per-pack division on today's prices before ordering — the $12.88 gap can move",
          "Set the box's job before it ships: open it, hold it sealed, or build toward a master set — each job changes which box is 'right'",
          "If the headline card is the goal, price the single before buying a second box chasing it",
          "If you're buying both, say out loud that it's for love of both legendaries — not diversification"
        ],
        "h": "The decision, as a checklist",
        "paragraphs": [
          "Run through this before you check out, in this order. The order is the point: legendary first, format second, arithmetic third."
        ]
      }
    ],
    "slug": "black-bolt-vs-white-flare-which-to-buy",
    "takeaway": [
      "Black Bolt and White Flare are the same machine wearing two different legendaries. The $12.88 gap is a preference fee, not a value signal. Pay it gladly if Zekrom is your card; pocket it if Reshiram is. Just don't let anyone — including us — convince you the arithmetic prefers one of them. It doesn't, and now you've seen the arithmetic.",
      "Decided? The [Black Bolt box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) and the [White Flare box](/product/sv11w-white-flare-booster-box-japanese-pokemon-card/) are both on the shelf. If you want a read on current stock of either before you order, ask us in chat."
    ]
  },
  "buying-tcg-from-japan-shipping-customs-proxy": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Possibly. It depends on your country, the parcel's declared value, and rules and thresholds that governments change over time — which is why no article, including this one, can responsibly hand you a current number for your situation. Your own customs authority's published guidance is the only source to trust, and it should be checked before you order, not when the parcel is already at the border. On proxy and marketplace routes, an unexpected customs bill lands on you alone.",
        "q": "Will I pay customs on cards shipped from Japan?"
      },
      {
        "a": "Safe is the wrong frame. A proxy is a chain of custody — a Japanese seller, a domestic parcel, a warehouse, an international parcel — and at almost every link, the risk sits with you rather than the service. For goods you can verify in photographs and afford to lose, that trade can be reasonable. For sealed product you cannot inspect before it is forwarded to you, the risk is structural, not incidental. Keep proxy orders small enough to lose, and never let a fee stack that saves a little money talk you into a parcel you cannot afford to write off.",
        "q": "Is using a proxy service safe?"
      },
      {
        "a": "Because the specialist shelf price has the stack inside it: Japan-side sourcing, domestic handling, international shipping, inspection of the stock, and a seller who answers for the product if something is wrong. The Japanese domestic price excludes all of that, which is why it looks cheaper from a distance. The proxy route does not make those costs disappear either — it itemizes them and hands them to you one by one. The honest comparison is never price against price; it is landed cost against landed cost.",
        "q": "Why does a specialist store charge more than the Japanese shelf price?"
      }
    ],
    "h1": "Buying TCG From Japan: Shipping, Customs, and the Proxy Question",
    "intro": [
      "There are three real routes to Japanese TCG product from outside Japan: a proxy service that buys domestically on your behalf, marketplaces where sellers ship internationally, and a specialist store that stocks Japanese product and ships it to your door. Every route works. They differ in what the product truly costs by the time it reaches you, in who carries the risk when something is wrong, and in how much of your own time the route consumes.",
      "This guide prices all three honestly, including the fee stack nobody itemizes for you up front. It is written for buyers importing Japanese boxes, cases, and singles from outside Japan. One boundary before anything else, because it decides who should stop reading now: if you cannot absorb the total loss of a parcel going wrong, the proxy route is not for you. Its savings are real — but so is the fact that when a proxy purchase goes bad, the loss is usually yours, in full."
    ],
    "metaDescription": "Proxy, marketplace, or specialist store: the three real routes to Japanese TCG, with the full fee stack, customs reality, and fake risks priced in.",
    "metaTitle": "Buying TCG From Japan: Shipping, Customs & Proxies",
    "readMinutes": 10,
    "sections": [
      {
        "h": "Route by route: the exact sequence",
        "paragraphs": [
          "Proxy service. You find a listing on a Japanese marketplace or shop that does not ship abroad, submit the link to the proxy, and the proxy buys it domestically, receives it at their Japanese warehouse, and forwards it internationally — usually after you choose between shipping one parcel now or consolidating several purchases into a single shipment. Our own [Japanese TCG range](/japanese-tcg/) exists because a store performs this chain invisibly on your behalf; done yourself, every link in the chain is a fee, a wait, and a decision.",
          "Marketplace direct. You buy from an international marketplace seller who ships to your country. Fewer middlemen and a platform standing between you and the seller — and prices that often look like bargains, partly because the seller's risk controls are thinner than a store's, and sometimes because the product deserves suspicion. Our guide on [where to buy One Piece cards online](/guides/where-to-buy-one-piece-cards-online/) walks through reading those listings with the suspicion built in.",
          "Specialist store. You order, the store ships from its own stock, and the price on the product page is the price of the product — sourcing, inspection, and the Japan-side leg are already inside it. You pay more per box than a domestic Japanese listing shows, and frequently less than people expect once the proxy stack is honestly totaled. That total is the subject of the next section.",
          "One practical difference hides inside all three sequences: who handles the customs paperwork, and who answers when it is wrong. On the proxy and marketplace routes, that person is you — a misdeclared value or an incomplete form is your problem, at your border, on your parcel. A specialist store ships as an exporter with its own paperwork in order, and that quiet competence is part of what its margin buys."
        ]
      },
      {
        "h": "The money layer: a proxy stack, itemized",
        "math": [
          "Hypothetical worked example (every figure invented for illustration — your numbers will differ, the structure will not):",
          "Item price $70 (hypothetical) + domestic shipping inside Japan $8 (hypothetical) = $78",
          "$78 + proxy service fee $10 (hypothetical) = $88",
          "$88 + international shipping $28 (hypothetical) = $116 landed, before any customs",
          "Against a hypothetical $110 specialist-store shelf price, the headline saving was $40. After the stack, the proxy parcel costs $6 more — and still carries risks the store price already absorbed."
        ],
        "paragraphs": [
          "A proxy listing advertises an item price. Nobody's landed cost is the item price. Here is the stack on a single box, with every figure a clearly labeled hypothetical:",
          "Then customs. Duties and import taxes vary by country, by product value, and by thresholds that governments change — sometimes yearly. We will not state any country's current threshold here, because a number printed in an article goes wrong quietly and costs you money at the border. Before ordering on any route, check your own customs authority's current rules for your country and your order value; on the proxy and marketplace routes, an unexpected customs bill lands on you alone, with no seller to argue with.",
          "Consolidation deserves its own warning, because it feels like saving money. Holding purchases at a proxy warehouse to ship together can cut per-item shipping — and it also means your first box sits in someone else's warehouse while you shop for a second, inside storage windows and weight-step pricing that punish a parcel at exactly the size a couple of booster boxes reach. If you consolidate, consolidate with a deadline, not an intention. International shipping itself is stepped rather than smooth: carriers price by weight bands and volumetric size, so a parcel just over a band boundary can cost startlingly more than one just under it, and a booster case ships nothing like the same boxes loose. Buyers who consolidate blindly discover this at the payment screen, after the storage clock has already been running. The same discipline applies at case scale: our breakdown of [sealed case vs booster box math](/blog/sealed-case-vs-booster-box-the-math/) shows how to run those numbers before a case is involved."
        ]
      },
      {
        "h": "The decision table",
        "paragraphs": [
          "Read this as a price on your own time and risk tolerance, not as a ranking. All three routes deliver genuine product every day; they just send the bill to different places."
        ],
        "table": {
          "head": [
            "",
            "Proxy service",
            "Marketplace direct",
            "Specialist store"
          ],
          "rows": [
            [
              "True cost",
              "Item price plus a four-layer fee stack; customs on you",
              "List price plus shipping; customs usually on you",
              "Shelf price plus checkout shipping; sourcing already inside"
            ],
            [
              "Fake and reseal risk",
              "Highest — you are buying listings you cannot inspect",
              "Moderate to high — depends entirely on the seller",
              "Lowest — the store inspects its own stock and answers for it"
            ],
            [
              "Returns",
              "Effectively none once the parcel is forwarded",
              "Platform-dependent, and slow across borders",
              "A real returns conversation with an accountable seller"
            ],
            [
              "Speed",
              "Slowest — domestic leg, warehouse wait, then the international leg",
              "Variable — days to weeks depending on the seller",
              "Fastest predictable — it ships from stock"
            ],
            [
              "Your effort",
              "High — sourcing, translating, consolidating, tracking",
              "Moderate — you vet every seller yourself",
              "Low — order, then track"
            ]
          ]
        }
      },
      {
        "h": "The risk layer: what actually goes wrong",
        "note": "From the Warehouse counter: plenty of first-time customers arrive here after a parcel from Japan went wrong — a resealed box, a customs surprise, a proxy shipment that cost more than our shelf price by the time it landed. The detail that repeats is that the saving they were chasing was small, usually smaller than the cost of one bad outcome. Cheap routes are fine. Unpriced risk is what turns out to be expensive.",
        "paragraphs": [
          "The expensive failures are product failures. Open marketplaces and proxy listings are where resealed boxes and counterfeits circulate, because the seller's accountability ends at the listing photograph. Before any sealed box from a non-store route gets opened, run it through [how to tell if a booster box is resealed](/blog/how-to-tell-if-a-booster-box-is-resealed/) and keep the tells from our guide on [how to spot fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/) beside it while you work. If the wrap, the seams, or the weight feel wrong, photograph everything before breaking a seal — that sequence is your only leverage.",
          "Seller vetting on marketplaces is a skill with a short checklist of its own: an account age measured in years, feedback that mentions sealed product specifically rather than generic praise, listing photographs of the actual box instead of stock images, and a price within sight of the wider market. A listing that fails two of those four is not a bargain. It is a warning with a price attached, and the discipline is walking away while walking away is still free.",
          "The quiet failures are administrative. A customs bill you did not budget converts a saving into a loss. A parcel consolidated past a storage window accrues fees while you are not looking. A marketplace return across a border can cost more than the item it returns. The recovery protocol is unglamorous and complete: the first order on any new route stays small enough to lose entirely; arrivals are photographed before opening, and expensive boxes are opened on video; and every route's total-loss scenario gets priced before the order is placed, not after the parcel is missing."
        ]
      },
      {
        "h": "Context: the one real advantage of Japan-side stock",
        "paragraphs": [
          "Japanese product releases in Japan first, and stock positioned in Japan moves on the Japanese date. OP-17 is the clean recent example: the Japanese release landed August 22, 2026, and the English release followed on August 28 — six days apart — and for Japanese-language sets there is no later local edition to wait for at all. That gap is why release-week buyers care about route at all: the calendar rewards whoever is closest to Japan. Our [release calendar](/release-calendar/) tracks the confirmed dates, and our guide to [pre-ordering Japanese booster boxes or waiting](/blog/preorder-japanese-booster-box-or-wait/) covers when paying early beats patience.",
          "Concretely, the [OP-17 booster box, Japanese](/product/op-17-the-world-s-strongest-warriors-booster-box-japanese-one-piece-card/) sits in our stock because the Warehouse buys on the Japanese side of that calendar; the [OP-17 set hub](/sets/op-17-worlds-strongest-warriors/) lays out the set itself. Whichever route you choose, choose it before release week rather than during it — routes picked under hype are how the fee stack and the fake risk both get ignored at the same time.",
          "The release-window effect cuts both ways, and honest route planning admits it: Japan-side access gets product earlier, and earlier product is also the least price-stable. Buying on the Japanese date means buying before the market has decided what the set is worth. Some buyers want exactly that exposure. Others are paying a premium for speed they never use. Know which one you are before the calendar chooses for you."
        ]
      },
      {
        "h": "Who each route is not for",
        "paragraphs": [
          "Proxy services are not for first-time importers buying a sealed case, anyone buying against a deadline, or — repeating the boundary from the top of this page, because it is the one that matters — anyone who cannot absorb a total loss on the parcel. Marketplace-direct buying is not for sealed investors who cannot verify a box in hand before the return window closes. A specialist store is not for bargain hunters chasing far-below-market listings: when a listing sits far under every other price for the same box, the discount is usually risk wearing a costume, and a store declining to match it is information, not stubbornness.",
          "None of this argues you out of importing. It argues for importing with the costs and the loss scenarios written down first — which is, not coincidentally, how the stock behind our [One Piece cards](/one-piece-cards/) shelves got there: sourced on the Japan side, priced with the stack already inside.",
          "There is a softer boundary worth stating as well. If researching routes, translating listings, and tracking parcels across two carriers sounds like a chore rather than a hobby, that feeling is data. Your time has a price, and a route that consumes your evenings is not cheaper than the store shelf, whatever the item price claims."
        ]
      },
      {
        "checklist": [
          "Write the landed cost for your route — every fee layer, not the headline price",
          "Check your own customs authority's current rules for your country and order value",
          "Confirm the release date on the calendar and choose the route before release week",
          "Keep the first order on any new route small enough to lose entirely",
          "Photograph the parcel and the box before opening; open expensive boxes on video",
          "Run sealed boxes through the reseal checks before breaking the wrap",
          "If consolidating proxy purchases, set a ship-by date the day the first item arrives"
        ],
        "h": "The before-you-order checklist",
        "paragraphs": [
          "Five minutes with this list is cheaper than any lesson a parcel can teach you."
        ]
      }
    ],
    "slug": "buying-tcg-from-japan-shipping-customs-proxy",
    "takeaway": [
      "Buying TCG from Japan is not a shortcut around cost; it is a choice about where cost and risk sit. Proxies move both onto you and call the difference savings. Marketplaces split them unpredictably. A specialist store prices them into the shelf and answers for them. Any of the three can be the right answer — for a buyer who has written the stack down, priced the total-loss case, and checked their own customs rules first.",
      "If you would rather skip the stack entirely, that is precisely the shelf we run: browse [Japanese TCG](/japanese-tcg/) and let the Warehouse carry the chain, the inspection, and the risk — while you just open the box.",
      "Whichever route you choose, verify what lands: [how to spot fake One Piece cards](/blog/how-to-spot-fake-one-piece-cards/) is the card-level check to run the day a parcel arrives, before the dispute window closes."
    ]
  },
  "dragon-ball-fusion-world-beginners-guide": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Fusion World is the current, streamlined generation of Bandai's Dragon Ball card game, with its own card pool and the Awaken and Combo structure described above. Rules and cards are not interchangeable with the older game, so buy product carrying Fusion World branding and set codes such as FB12.",
        "q": "Is Dragon Ball Fusion World the same game as the older Dragon Ball Super Card Game?"
      },
      {
        "a": "One starter deck: a Leader plus a ready 50-card deck. That is a complete, legal setup out of the box. Booster boxes expand a collection and a card pool, but on their own they do not give you a playable deck.",
        "q": "How many cards do I need to start playing?"
      },
      {
        "a": "No. At $1,265, as of October 21, 2026, the case is a collector format bought for sealed bulk. A beginner cannot use that volume of cards from one set, does not yet know which Leader they play, and gets far more playing and learning value from a starter deck and a single box.",
        "q": "Should a beginner buy the FB12 case for its value?"
      }
    ],
    "h1": "Dragon Ball Fusion World: A Beginner's Guide to Your First Game and First Purchase",
    "intro": [
      "Fusion World is Dragon Ball's current card game, built by Bandai, and the fastest way to understand it is this: your Leader starts on the table, you defend 8 Life cards, and when your Life drops to 4 or fewer, your Leader Awakens — flips to a stronger side — for the comeback half of the game. Everything else is learning how battles and Combos move those 8 Life.",
      "This guide is for new players, and for Pokémon and One Piece collectors curious about the third game on our shelves. It covers how a game actually flows, what the products are, and — the part that saves money — what to buy first and in what order. It is not a competitive deck-building guide, and it will not invent prices: the only hard price below is the one product whose price we can stand behind today."
    ],
    "metaDescription": "How Fusion World actually plays — 8 Life, Awaken, Combo — and what to buy first, from starter decks to the FB12 case, in the right order.",
    "metaTitle": "Dragon Ball Fusion World Beginner Guide: Start Right",
    "readMinutes": 10,
    "sections": [
      {
        "h": "How a game of Fusion World actually flows",
        "paragraphs": [
          "Setup is quick. Your Leader card starts in play, on its starting side. You build a 50-card deck to go with it, set out 8 Life cards face down, and draw your opening hand. Those 8 Life cards are your health. When you take damage, Life cards move into your hand — which means getting hit literally gives you more options, one of the neatest ideas in the game.",
          "On your turn you build up energy, play Battle Cards, and attack — at your opponent's Leader, or at their Battle Cards that are in play and open to attack. Battles are where the game's signature mechanic lives: Combo. During a battle, both players can add cards from hand purely for their Combo power, stacking +10,000 power per card onto the fighter they support. A battle is rarely decided by the two cards that started it; it is decided by how much each player is willing to spend from hand to win it.",
          "The hinge of every game is the Awaken. The moment your Life drops to 4 or fewer, your Leader flips to its Awakened side — stronger, with better abilities. Taking early damage is therefore not pure loss: it moves cards into your hand and pushes you toward the stronger version of your Leader. The game ends when a player with no Life left takes a final attack they cannot stop. That is the whole shape: 8 Life, an Awaken at 4, and battles priced in Combo power.",
          "The Combo arithmetic is worth seeing once with the rule's own numbers. Every card committed to a Combo adds +10,000 power: two cards committed is +20,000, three is +30,000. Because those cards leave your hand, every battle asks the same question — is winning this one fight worth shrinking the hand that has to survive the rest of the game? Beginners answer yes too often. Strong players answer it per battle, not per habit."
        ]
      },
      {
        "h": "The products: starter decks, booster boxes, cases",
        "paragraphs": [
          "Three product types matter to a beginner. Starter decks are pre-built, playable decks — a Leader and a ready 50-card deck — designed to teach the game out of the box. Booster boxes are for expanding: packs of randomized cards from a set, which is where new Leaders, Battle Cards, and chase rarities come from. Sealed cases are booster boxes in bulk, and they are a collector and reseller format, not a learning format.",
          "The current set, as we write, is [FB12 Reach the God](/sets/fb12-reach-the-god/), releasing December 18, 2026 on Bandai's official schedule. It carries 123 card types and is the first Fusion World set built around Dragon Ball Super: Beerus — new ground for the game, which is part of why it holds collector attention as well as player attention. An FB12 booster box holds 24 packs of 6 cards, and the [FB12 sealed case](/product/dragon-ball-super-fusion-world-fb12-reach-the-god-booster-box-sealed-case-english/) sits at $1,265 as of October 21, 2026. That is real money, and it is priced that way because of what a case is for.",
          "Coming right behind it, the [release calendar](/release-calendar/) lists the FS13 and FS14 starter decks for January 22, 2027. For a brand-new player that timing matters: a fresh starter deck wave is the cleanest entry point the game offers, and it lands about a month after FB12.",
          "One more product note for collectors crossing over from Pokémon or One Piece: Fusion World sets are compact. FB12's 123 types is a small set by the standards of the other games on our shelves, and that cuts both ways — a single box makes a visible dent in a set, and a patient collector can see the whole shape of the set without case money. Compact sets reward the one-box-at-a-time buyer."
        ]
      },
      {
        "h": "What to buy first, in order",
        "paragraphs": [
          "First: a starter deck, and learn the game on it. It is the only product that teaches you anything — every card in it was chosen to work together, and you will only learn what your deck is missing after it loses a few games. Second: a second starter deck, or a single booster box, once you know which part of the game you enjoy. Third, and only then: more boxes, aimed at the set whose cards fit the deck you are actually building.",
          "Notice where the case sits in that order: nowhere near the top. A case is a full run of boxes from one set, bought before you know whether you like the game, which Leader you play, or which cards your deck wants. At $1,265 it is also the only purchase on this page that can be a genuine financial mistake rather than a hobby expense. The table puts the four routes side by side."
        ],
        "table": {
          "head": [
            "Option",
            "Cost posture",
            "Playable out of the box",
            "Collecting value",
            "Best for"
          ],
          "rows": [
            [
              "Starter deck",
              "Lowest — one small purchase",
              "Yes — a complete, legal deck immediately",
              "Low — fixed contents, no chase pulls",
              "Learning the game and your first dozen matches"
            ],
            [
              "One booster box",
              "Moderate — 24 packs of one set",
              "No — random cards, not a legal deck on their own",
              "Moderate — full access to the set's chase cards",
              "Expanding once you know what your deck needs"
            ],
            [
              "Two booster boxes",
              "Higher — double the packs, deeper into the set",
              "Still no — more pieces, not a finished deck",
              "Higher — more of the set, more trade stock",
              "Committed players building toward a specific deck"
            ],
            [
              "Sealed case",
              "$1,265 as of October 21, 2026 — the serious end",
              "No — far more cards than a beginner can use",
              "Highest — sealed bulk holds collector and resale value",
              "Collectors and stores, not first purchases"
            ]
          ]
        }
      },
      {
        "h": "Three mistakes beginners make",
        "paragraphs": [
          "Mistake one: buying big first. The case is the extreme version, but the same error happens at box scale — buying several boxes of a set before playing a single game, then discovering you would rather play a different Leader whose cards live in a different set. Product keeps; curiosity is perishable. Buy in the order that protects both.",
          "Mistake two: ignoring the Awaken. New players defend every Life card like it is sacred, spending Combo cards to protect Life seven and six — then reach the late game with an empty hand, facing an opponent whose Leader Awakened turns ago. Your first 4 Life are a resource that buys hand cards and your stronger Leader side. Spend them like it.",
          "Mistake three: importing habits from other games. Fusion World's Combo step means a Battle Card's printed power is a starting bid, not a result. Pokémon players used to fixed math and One Piece players used to counter steps both have to recalibrate; if you already play One Piece, our [colors explainer](/blog/one-piece-card-game-colors-explained/) covers that game's different logic. The transferable skill is reading what a battle will cost — not the numbers themselves."
        ]
      },
      {
        "h": "Your first month, sequenced",
        "paragraphs": [
          "Week one is starter deck only. Play the deck as it comes, even when a card looks weak — you are learning what the deck is trying to do, and a pre-built deck's lessons live in its choices. By the end of the week you should be able to say, in plain words, how your Leader plans to win and around which Life count your games usually turn.",
          "Weeks two to four are where the single booster box earns its place. Open it against your written list of gaps: cards that answer the problems you actually lost to go into the deck, and everything else becomes trade stock or collection — not regrets. If FS13 and FS14 land on January 22, 2027 during your first month, a second, different starter deck is a legitimate alternative to that box: it teaches a second Leader's shape of game for the same step in the sequence."
        ]
      },
      {
        "h": "The context: a Japanese-first game",
        "note": "The question Dragon Ball-curious buyers ask us most is some version of: I collect Pokémon or One Piece — is this the same game with different art? It is not. The Awaken flip and the Combo step make Fusion World play its own way, and the honest answer is that one starter deck teaches you more about whether it is for you than any comparison chart we could write.",
        "paragraphs": [
          "Fusion World follows the pattern of the other [Japanese TCGs](/japanese-tcg/) we stock: sets release in Japan first, and Japanese product is what the market trades earliest. FB12's December 18, 2026 date is the Japanese release on Bandai's schedule. For a beginner this mostly means one practical thing — the freshest cards, the earliest deck ideas, and the first wave of singles all appear in Japanese product first.",
          "It also makes starter waves matter. FS13 and FS14 arriving on January 22, 2027 give new players a designed on-ramp a month after FB12: learn on a starter, then expand into the current set. If you are counting packs and boxes while you plan, [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) keeps the verified counts for the sets on our shelves in one place.",
          "One practical consequence for beginners: Japanese cards carry Japanese text. If you cannot read it, your first games run slower, because every Battle Card's effect has to be looked up, memorized, or asked about. That is not a reason to avoid Japanese product — it is the earliest and deepest stock there is — but it is a real learning cost, and it is why many new players learn on whichever printing they can read fluently, then buy Japanese for collecting and for sets they already know."
        ]
      },
      {
        "checklist": [
          "Buy one starter deck — any Leader that appeals to you; there is no wrong first Leader",
          "Play at least five games on the unmodified deck before buying anything else",
          "In one early game, let your Life fall to 4 on purpose and feel what the Awaken changes",
          "Write down what your deck cannot do — that gap, not a rarity, decides your next purchase",
          "Add one booster box from the current set once you know the gap you are filling",
          "Check the release calendar before pre-ordering; FS13 and FS14 starters land January 22, 2027",
          "Keep any sealed box sealed until you have a deliberate reason to open it"
        ],
        "h": "Your first purchase and first game: the checklist",
        "paragraphs": [
          "In order. Do not skip ahead — each step makes the next one cheaper, in money or in mistakes."
        ]
      }
    ],
    "slug": "dragon-ball-fusion-world-beginners-guide",
    "takeaway": [
      "Fusion World earns its place next to Pokémon and One Piece by being genuinely different: 8 Life that turns into hand cards, an Awaken that rewards taking damage, and battles settled by how much of your hand you are willing to spend. Learn it on a starter deck, expand into FB12 once you know your deck's gaps, and leave the $1,265 case to the collectors it is made for.",
      "And when a box does land in your hands and the seal starts calling, run it through [should you open it or keep it sealed](/blog/should-you-open-or-keep-sealed-booster-box/) before you break it — that framework was written for exactly that moment. More first-timer guides live on [the blog](/blog/).",
      "Choosing between the three games? [Which TCG should you start?](/blog/which-tcg-should-you-start/) compares Fusion World with One Piece and Pokémon on rules, structure, and the real cost of the first box."
    ]
  },
  "how-many-packs-in-a-booster-box": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "20 packs for the current sets we stock — M6a 30th Celebration at 6 cards per pack (120 cards) and SV11 Black Bolt / White Flare at 7 cards per pack (140 cards). Older and special-edition boxes can differ, which is exactly why the count belongs on every product page, including ours.",
        "q": "How many packs are in a Japanese Pokémon booster box?"
      },
      {
        "a": "24 packs, verified for both OP-17 World's Strongest Warriors and OP-18 The Dominance of God. It is one reason One Piece undercuts Pokémon per pack at our prices — the OP-18 pre-order works out to $2.92 a pack, as of October 21, 2026.",
        "q": "How many packs are in a Japanese One Piece booster box?"
      },
      {
        "a": "Different release models. The English market consolidates sets into larger 36-pack boxes; Japan releases more frequently in 20-pack boxes. More packs is not more value by itself — cost per pack, and what each pack guarantees, is the comparison that matters.",
        "q": "Why do English Pokémon boxes have 36 packs but Japanese boxes only 20?"
      }
    ],
    "h1": "How Many Packs Are in a Booster Box? The Verified Counts",
    "intro": [
      "There is no universal number, and anyone who gives you one without naming a set is guessing. The verified counts for the Japanese product we stock: Pokémon boxes hold 20 packs, One Piece boxes hold 24, and the trap is that English Pokémon boxes hold 36 — a number that quietly wrecks price comparisons when it gets carried across the Pacific.",
      "This page lists only counts we can stand behind, set by set, with our box prices attached so the count turns into the number that actually matters: cost per pack. Where a count is not verified — and a few cells below are deliberately blank — we say so rather than filling the gap with a plausible-sounding number.",
      "It is written for buyers comparing boxes across stores, languages, or sets. If a listing hides the pack count, treat the omission as part of the price."
    ],
    "metaDescription": "Japanese booster boxes hold 20 or 24 packs — not 36. Verified pack and card counts for M6a, SV11, One Piece and Fusion World, with cost-per-pack math.",
    "metaTitle": "How Many Packs in a Booster Box? Verified Counts",
    "readMinutes": 8,
    "sections": [
      {
        "h": "The verified counts, set by set",
        "paragraphs": [
          "[M6a 30th Celebration](/sets/m6a-30th-celebration/) is a 20-pack box with 6 cards per pack — 120 cards, every one holo, built for the 30th anniversary. [SV11 Black Bolt and White Flare](/sets/sv11-black-bolt-white-flare/) run 20 packs of 7 cards, 140 per box. One Piece plays bigger: [OP-17 World's Strongest Warriors](/sets/op-17-worlds-strongest-warriors/) and the upcoming OP-18 both ship 24 packs per box. Dragon Ball's [FB12 Reach the God](/sets/fb12-reach-the-god/) is 24 packs of 6 — 144 cards, the fullest standard box on this page.",
          "Two cells in that table deserve honesty. For the One Piece rows we sell and verify by pack count, and we have left cards-per-pack blank rather than print a number this page has not verified — the product pages carry the full specifications. And the Deluxe row is a different animal entirely: 4 packs, but each pack holds 35 cards. Pack counts only compare cleanly inside the same structure.",
          "Counts also vary inside a single game more than most buyers expect. Pokémon's standard Japanese box has been 20 packs across the current sets we stock, but special editions, Deluxe boxes, and older releases follow their own configurations. The set is the unit of truth, never the game, and never the language.",
          "A note on what is missing from the table, deliberately: many other sets exist — older Pokémon eras, other games entirely — and their counts are not listed here because this page has not verified them. Some follow the patterns above; some do not. A reference page that prints verified counts and admits the rest are unchecked is worth more than one that fills every cell from memory."
        ],
        "table": {
          "head": [
            "Set",
            "Packs per box",
            "Cards per pack",
            "Cards per box",
            "Store box price",
            "Cost per pack"
          ],
          "rows": [
            [
              "M6a 30th Celebration (Pokémon JP)",
              "20",
              "6",
              "120",
              "$207.50",
              "$10.38"
            ],
            [
              "SV11B Black Bolt (Pokémon JP)",
              "20",
              "7",
              "140",
              "$152.65",
              "$7.63"
            ],
            [
              "SV11W White Flare (Pokémon JP)",
              "20",
              "7",
              "140",
              "$139.77",
              "$6.99"
            ],
            [
              "SV11B Deluxe (Pokémon JP)",
              "4",
              "35",
              "140",
              "$177.49",
              "$44.37 per 35-card pack"
            ],
            [
              "OP-17 World's Strongest Warriors (One Piece JP)",
              "24",
              "—",
              "—",
              "$101.07",
              "$4.21"
            ],
            [
              "OP-18 The Dominance of God (One Piece JP, pre-order)",
              "24",
              "—",
              "—",
              "$70.00",
              "$2.92"
            ],
            [
              "FB12 Reach the God (Fusion World JP)",
              "24",
              "6",
              "144",
              "See product page",
              "—"
            ]
          ]
        }
      },
      {
        "h": "Why the count matters more than the sticker price",
        "math": [
          "M6a: $207.50 ÷ 20 packs = $10.38 per pack",
          "SV11W White Flare: $139.77 ÷ 20 packs = $6.99 per pack",
          "OP-18 pre-order: $70.00 ÷ 24 packs = $2.92 per pack",
          "OP-17: $101.07 ÷ 24 packs = $4.21 per pack"
        ],
        "note": "From the Warehouse: the single most common pricing misunderstanding in our chat is a 20-pack Japanese box compared against a 36-pack English box elsewhere and read as expensive. Per pack, the Japanese box is usually the cheaper opening. The count is the missing half of every price.",
        "paragraphs": [
          "A $207.50 box and a $139.77 box are not comparable until both are divided by their pack counts. After division, the shelf rearranges itself: M6a is a $10.38 pack, SV11W is a $6.99 pack, and the OP-18 pre-order at $70 is a $2.92 pack — the cheapest opening on the shelf, hiding inside one of the smallest stickers. Prices here are as of October 21, 2026; the method does not expire when they move.",
          "The same division, run on cases instead of boxes, is how you catch a bulk deal that is not one. That worked example — including a Japanese case that costs more per box than buying the boxes singly — lives in our [sealed case vs booster box math](/blog/sealed-case-vs-booster-box-the-math/). Per-pack first, opinions second.",
          "Run the same division per card when structures differ, as the Deluxe example below shows: packs are the denominator for standard boxes, but when the packs themselves change size, cards become the only honest denominator left."
        ]
      },
      {
        "h": "How to verify a pack count before you pay",
        "paragraphs": [
          "Three checks, in order. First, the product page: any accountable seller prints the count in the listing — here is the [OP-18 Japanese booster box pre-order](/product/one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game/) page showing 24 packs before you spend anything. Second, the set hub: our [OP-18 set hub](/sets/op-18-the-dominance-of-god/) and the [OP-17 set hub](/sets/op-17-worlds-strongest-warriors/) carry the box configuration for each set in one place, next to release dates and box contents.",
          "Third, the box itself. Japanese boxes print their pack and card counts on the packaging — check the flap printing on any box a reseller offers you, and treat a seller who cannot confirm the count as a seller who has not handled the product. Counts change between sets, and even between the standard and Deluxe editions of the same set, so verify the exact product in front of you, not the game it belongs to.",
          "The same arithmetic scales up. A case count is just boxes times packs: an OP-18 case is 12 boxes at 24 packs, which is 288 packs — and dividing the case price by 288 is how you find out whether the case is a deal per pack or merely a bigger receipt. Run that division before any case purchase, every time."
        ]
      },
      {
        "h": "The exceptions: Deluxe packs and all-holo boxes",
        "paragraphs": [
          "Structure sets break the pattern on purpose. The [SV11B Deluxe box](/product/sv11b-expansion-pack-deluxe-black-bolt-booster-box-japanese-pokemon-card/) holds only 4 packs — but they are 35-card packs with a guaranteed Art Rare or better in each, so the box carries the same 140 cards as a standard [SV11B Black Bolt box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) or a [SV11W White Flare box](/product/sv11w-white-flare-booster-box-japanese-pokemon-card/). Per card, the Deluxe runs $1.27 against $1.09 for the standard box: you pay the difference for the guaranteed structure, not for more cardboard.",
          "Judged by pack count alone, the Deluxe looks absurd — four packs for $177.49. Judged by cards and guarantees, it is a premium structure with a clear asking price. Both readings are available to anyone who counts; only one of them is right for a buyer deciding whether the guarantee is worth $0.18 more per card.",
          "M6a bends the count the other way — fewer cards per pack at 6, but every card holo, with one of the set's 30 Pikachu cards guaranteed in every pack. That structure is also what makes its famous pack type possible; the full story is in our explainer on [what a god pack is](/blog/what-is-a-god-pack-japanese-pokemon/)."
        ]
      },
      {
        "h": "The 36-pack trap, and other ways counts burn buyers",
        "paragraphs": [
          "The standard English Pokémon booster box holds 36 packs. Buyers raised on English product import that number unconsciously, then judge a 20-pack Japanese box as short value — or worse, a reseller quotes a Japanese box price to an English-trained buyer who never asks the count and never learns he paid a 36-pack expectation for a 20-pack product. Both errors are the same error: comparing stickers instead of packs.",
          "A quieter version of the trap runs in reverse. A Japanese box advertised next to an English box at a similar sticker price can look like parity while delivering nearly half the packs — or, just as often, the Japanese box is genuinely cheaper per pack and the buyer walks away from the better deal because the pack counts were never put side by side. Either direction, the missing count is where the money leaks.",
          "The recovery is procedural, not clever. Ask for the count in writing before paying anyone. Divide the price by it. If the seller cannot or will not state the count, the discount they are offering is not worth the ambiguity — walk to a seller who prints it.",
          "Marketplaces make the trap easy to fall into, because listings sort by sticker price. A results page will happily rank a 20-pack Japanese box beside a 36-pack English box and let the cheaper-looking number win the click. Until a platform sorts by cost per pack — and none of them do — the division is the buyer's job, done by hand, every single time."
        ]
      },
      {
        "h": "Why Japan counts smaller",
        "paragraphs": [
          "Japanese sets release more frequently in smaller boxes — 20 packs for Pokémon, 24 for One Piece — while the English market consolidates into 36-pack boxes and special collections. Neither system is the real one; they are different release philosophies, and the pack count is simply where the difference becomes visible, and billable.",
          "Counts also move with the calendar. New sets are announced with their box configurations confirmed ahead of release, which is why our [release calendar](/release-calendar/) exists: when OP-18 lands on November 20, 2026, its 24-pack count was public before the first box shipped. Check the configuration of the next set before you look at its price — in that order, every time.",
          "It also explains a confusion that surfaces whenever a Japanese box is listed on an English-language marketplace without the count in the title: two listings for the same set can look wildly different in value while being the same 20 packs, simply because one seller printed the count and the other assumed you knew it. You did not — nobody does, for every set — which is why the verification habit in the previous section is not pedantry. It is the price of admission."
        ]
      },
      {
        "checklist": [
          "Name the exact set and edition — standard, Deluxe, and special boxes of the same set count differently",
          "Confirm packs per box for that product, from the listing or the set hub",
          "Divide: box price ÷ packs = cost per pack, written down next to the listing",
          "For structure sets, divide by total cards as well",
          "Never carry the English 36-pack assumption into a Japanese listing",
          "If the count is not stated, ask — and treat silence as a no"
        ],
        "h": "Before you buy any booster box",
        "paragraphs": [
          "Six habits, none of them optional if the box costs real money. Counts verified, division done, and the structure understood — that is the whole discipline, and it transfers to every set released after this page. For the wider shelf these counts come from, browse [Japanese TCG](/japanese-tcg/) with the numbers in hand."
        ]
      }
    ],
    "slug": "how-many-packs-in-a-booster-box",
    "takeaway": [
      "The count is not trivia. It is the denominator of every price in this hobby, and the difference between a $2.92 pack and a $10.38 pack is invisible until you divide. A booster box is not a unit — a pack is, and a card is.",
      "So the habit to take from this page is a sequence: name the set, confirm the count, divide the price, then — and only then — have an opinion about whether the box is cheap or expensive.",
      "New to Dragon Ball's game entirely? [Our Fusion World beginner's guide](/blog/dragon-ball-fusion-world-beginners-guide/) explains how a game flows and where FB12's 24-pack boxes fit your first purchase.",
      "Counts become decisions here: [the best One Piece booster box to buy](/blog/best-one-piece-booster-box-to-buy/) divides every current box and case price down to the pack, and the three cases give three different answers."
    ]
  },
  "how-to-read-japanese-pokemon-cards": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "No. Collecting runs on the set code and card number in the bottom corner plus the artwork — binders, master sets, and gap-finding are all organized by number. The only language-bound zone on a card is its written effect text, and the set's card list supplies that for any card you need to check.",
        "q": "Do I need to speak Japanese to collect Japanese Pokémon cards?"
      },
      {
        "a": "Take the card's number from the bottom corner to the set's card list, where the card's full text is published. For cards in your own deck, keep that text saved or printed as a reference. A phone translation app works as a quick aid for casual play, but confirm anything a game hinges on against the list entry.",
        "q": "How do I find out what a Japanese card's attack does?"
      },
      {
        "a": "It depends on the event — language rules are set by the event and region, and some require local-language cards. Check your event's rules before buying Japanese cards for tournament play. This is advice, not a ruling: the event's own documentation decides it.",
        "q": "Can I use Japanese cards at official tournaments?"
      }
    ],
    "h1": "How to Read Japanese Pokémon Cards Without Reading Japanese",
    "intro": [
      "Short answer: you do not need to read Japanese to use Japanese Pokémon cards. A Pokémon card is not a paragraph of text with a picture attached. It is a fixed layout system — name and HP at the top, symbols where the costs live, numerals where the damage lives, and a set code with a card number in the bottom corner. Once you know which zone carries which information, the language printed on the card stops being the thing you depend on. The number in the corner does the work that translation would.",
      "This guide walks the card zone by zone, then gives the working method collectors and players actually use: identify by number and artwork, confirm against the set's card list, and keep a reference for the cards in your own deck. It also covers the honest friction — because there is some — and the cases where English is simply the right purchase instead."
    ],
    "metaDescription": "You do not need to read Japanese to use Japanese Pokémon cards. Identify any card by number, symbols and artwork — zone by zone, with a working method.",
    "metaTitle": "How to Read Japanese Pokémon Cards (No Japanese Needed)",
    "readMinutes": 9,
    "sections": [
      {
        "h": "A card is a system, not a sentence",
        "paragraphs": [
          "Start at the top. The top band carries the card's name and its HP, and the HP is a numeral — it reads identically in every language on earth. Beside the name sits the type symbol, an icon for the card's energy type. Neither of these asks you to read a word of Japanese.",
          "The middle of the card is artwork and the attack block. Attack names are printed in Japanese text, but look at what sits beside each attack: its cost, shown as energy symbols. Those symbols are language-independent — a cost of two fire symbols and one colorless symbol is the same instruction in Tokyo, Toronto, or Douala. And the damage each attack deals is printed as a numeral. Cost and damage, the two numbers that decide most of what a card does in a game, are both symbol-and-number work.",
          "Along the bottom runs the weakness, resistance, and retreat row — again icons and numbers, showing what hits the card harder, what it shrugs off, and what it costs to pull it back. The illustrator credit sits along the bottom edge. None of this row requires reading.",
          "The most important zone is the smallest: the bottom corner, which carries the set code and the card's number within the set. That pair is the card's identity in a form no language can obscure. The rarity mark near it is part of the same corner system — [Japanese rarity symbols explained](/blog/japanese-pokemon-rarity-symbols-explained/) decodes those marks in full."
        ]
      },
      {
        "h": "The number in the corner does the translating",
        "math": [
          "Corner reads: 045 / 103, plus a set code",
          "045 = this card's position in the set",
          "103 = the set's base card count",
          "Number + artwork = the card's identity, in any language"
        ],
        "paragraphs": [
          "Here is the habit to build: never start by trying to translate a card's name. Start with the number and the artwork. A corner that reads 045/103 tells you this is card 45 in a set whose base list runs to 103, and the set code beside it tells you which set that is. Take that number to the set's official card list — every set's cards are published as an ordered list — and position 45 is your card, with its full text available there.",
          "Confirm with the artwork as the second key. Number plus artwork is a lock: if both match the list entry, the identification is certain, whatever the name says. If the number matches but the artwork differs, you are holding a different print of the card — a parallel or alternate-art version — and the set code and the list will separate the two. Artwork alone can mislead when two prints look similar; the number never does.",
          "This is also why experienced collectors handle unfamiliar Japanese cards without hesitation. They are not reading faster than you. They are reading a different part of the card — the corner instead of the title."
        ]
      },
      {
        "h": "Zone by zone: what each part of the card tells you",
        "paragraphs": [
          "Exactly one zone on the whole card is language-bound: the written effect text. Everything else is symbols, numerals, and layout. The table below is the honest map of that — including the one row where you will need help."
        ],
        "table": {
          "head": [
            "Zone",
            "What it shows",
            "Japanese needed?"
          ],
          "rows": [
            [
              "Name and HP (top)",
              "Which Pokémon it is, and its hit points as a numeral",
              "No — HP is a number"
            ],
            [
              "Type symbol",
              "The card's energy type, shown as an icon",
              "No"
            ],
            [
              "Attack costs",
              "Energy symbols printed beside each attack",
              "No — symbols are universal"
            ],
            [
              "Damage figures",
              "How hard each attack hits, printed as numerals",
              "No"
            ],
            [
              "Weakness / resistance / retreat row",
              "Icon-based modifiers and retreat cost along the bottom",
              "No"
            ],
            [
              "Attack and ability effect text",
              "What an attack or ability does beyond its damage number",
              "Yes — this is the one zone that needs a reference"
            ],
            [
              "Set code and card number (corner)",
              "The card's identity and its position in its set",
              "No"
            ],
            [
              "Illustrator credit",
              "Who drew the artwork",
              "No"
            ]
          ]
        }
      },
      {
        "h": "Playing with Japanese cards: the reference method",
        "note": "Warehouse Note: Incoming Japanese stock at the Warehouse gets sorted by set code and card number before anything else — binders, listings, and set completion all key off that corner. Fluency in Japanese is not what makes the sorting accurate. The numbering system is.",
        "paragraphs": [
          "For that one text zone, players use two tools. The first is a phone translation app: point the camera at the attack text and read the rendering. Treat it as a working aid for casual play — a fast way to get the sense of an effect — and confirm anything a game hinges on against the card's entry in the set list. The second tool matters more: a reference for your own deck. Before a game, have the text of every card in your deck saved or printed in a form you can check in seconds. A deck is a small, fixed set of cards; its reference fits on a single page or phone screen.",
          "Expect your first games with a Japanese deck to run slower. That is the real cost, and it is temporary — the cards you play every week become familiar through their costs, damage numbers, and artwork long before their text does. What does not work is playing from memory alone: half-remembering an effect is how casual games go wrong. The reference at the table is not a crutch; it is the method.",
          "The same zones do one more job. The corner number, set code, print quality, and symbol alignment are the first things checked when a card's authenticity is in question — [how to spot fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/) works through exactly these zones."
        ]
      },
      {
        "h": "Collecting: why language barely matters",
        "paragraphs": [
          "Collecting runs on the corner number almost entirely. Binders are organized by set and number, gaps are found by number, and a master set — every card of a set, completed in numerical order — is by definition a numbers exercise; [what is a master set](/blog/what-is-a-master-set-pokemon/) lays out that pursuit in full. Identifying, ordering, gap-finding, and displaying a collection never once requires reading the card's name.",
          "The Warehouse's set coverage is organized the same way. The [Black Bolt and White Flare set hub](/sets/sv11-black-bolt-white-flare/) and the [M6a 30th Celebration hub](/sets/m6a-30th-celebration/) both work from numbered set lists, and the wider range is browsable under [Japanese TCG](/japanese-tcg/) — every route into a set starts from its list, not its language.",
          "Which means the real Japanese-versus-English collecting question was never about legibility. It is about print character, availability, and price — the comparison run properly in [Japanese vs English Pokémon cards: which to buy](/blog/japanese-vs-english-pokemon-cards-which-to-buy/). Readability should not be the factor that scares anyone off the Japanese side of that decision."
        ]
      },
      {
        "h": "The honest friction — and when English is the right buy",
        "paragraphs": [
          "The failure modes are worth naming plainly. Misidentifying a card by artwork alone, when two prints of it look alike — recovery: set code plus number, every time, no exceptions. Misremembering an effect mid-game because the reference stayed in a bag — recovery: the deck reference comes to the table, not to the venue. And the slow first month with a new Japanese deck — recovery: repetitions; it fades on its own as the deck becomes familiar.",
          "Some buyers should simply buy English, and the Warehouse will say so. If you will not keep a deck reference and know the friction will irritate you every game, English removes a cost you have honestly assessed. And if you play organized events, language rules are set event by event: some events require local-language cards, some allow foreign printings with a reference at hand. Check your event's rules before buying Japanese cards for tournament play — that check takes minutes and decides the question completely.",
          "This guide is not for tournament players whose local events require local-language cards and who have already confirmed that rule — for them the method above is a collecting skill only, and their play purchases should be English."
        ]
      },
      {
        "checklist": [
          "Find the set code and card number in the bottom corner before anything else",
          "Match number plus artwork against the set's card list to confirm the card's identity",
          "Read HP, attack costs, and damage straight off the symbols and numerals",
          "Save or print the full text of every card in your own deck",
          "Use a translation app as an aid, and confirm close calls against the list entry",
          "Organize binders and want-lists by number, not by name",
          "Check your event's language rules before buying Japanese cards for tournament play"
        ],
        "h": "Before you buy, sleeve, or play: the checklist",
        "paragraphs": [
          "Run this order on any Japanese card and the language barrier reduces to one manageable errand — the effect text of cards you actually play."
        ]
      }
    ],
    "slug": "how-to-read-japanese-pokemon-cards",
    "takeaway": [
      "A Japanese Pokémon card withholds exactly one thing from a non-reader: the wording of its effects. Everything else — identity, type, cost, damage, rarity, place in the set — is printed in symbols and numbers that never needed translating. Learn the zones, trust the corner number, keep a reference for your own deck, and the language barrier shrinks to a single errand.",
      "Still deciding which game to enter at all? [Which TCG should you start with](/blog/which-tcg-should-you-start/) compares Pokémon against One Piece and Dragon Ball Fusion World on play, collecting, and verified starting cost — and the full Japanese range lives under [Japanese TCG](/japanese-tcg/)."
    ]
  },
  "how-to-spot-fake-one-piece-cards": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Sometimes you can spot a bad fake from a photo — fuzzy text, wrong colors, mismatched codes. But a competent fake survives photos easily. Treat photos as a screening step, not a verdict, and never pay photo-only prices for high-value singles you cannot inspect or return.",
        "q": "Can I tell if a One Piece card is fake from a photo alone?"
      },
      {
        "a": "Both printings are counterfeited, and the checks are the same for each. What differs is the reference you compare against: Japanese and English printings have legitimate production differences, so always compare a suspect card against a known-real card from the same printing.",
        "q": "Are Japanese One Piece cards faked as often as English ones?"
      },
      {
        "a": "Stop opening further product from that purchase, photograph everything including the packaging and any remaining sealed packs, and contact the seller with the evidence before leaving feedback or filing anything. Documentation made early is what makes refunds and platform claims succeed.",
        "q": "What if I already opened a box and the cards look wrong?"
      }
    ],
    "h1": "How to Spot Fake One Piece Cards: Checks That Actually Work",
    "intro": [
      "The short answer: no single test proves a One Piece card is real. Anyone selling you a one-step verdict — bend it, shine a light, done — is overselling. What actually works is a stack of small checks that each catch different fakes, finished with the one method we trust completely: putting the suspect card directly beside a card you know is authentic and comparing everything at once.",
      "This guide is for anyone buying One Piece singles or sealed product — Japanese or English — from marketplaces, social sellers, or shops they do not know yet. It is not a certification service, and it cannot bless a specific card from a photograph. What it can do is tell you exactly what to look at, in what order, and what to do when something fails."
    ],
    "metaDescription": "Hands-on checks for fake One Piece cards — print, stock, fonts, codes — and the one comparison method that actually settles it.",
    "metaTitle": "How to Tell If One Piece Cards Are Fake",
    "readMinutes": 9,
    "sections": [
      {
        "h": "Start here: indicators, not proof",
        "paragraphs": [
          "Every check below produces evidence, not a verdict. A card can fail one check because of a printing quirk and pass the rest. A good fake can pass several checks and fail only one. That is why the combination matters more than the order: print, stock, text, and codes are four different manufacturing steps, and a counterfeiter has to fake all four convincingly. Most cannot.",
          "It is also why provenance — who sold the card and whether they stand behind it — beats inspection in the end. Checks tell you whether to buy. Provenance tells you what happens if the checks were wrong. Keep both in mind as you read, because the second half of this guide covers the part most checklists skip: what to do when a card fails."
        ]
      },
      {
        "h": "The print check: sharpness, rosettes, and color",
        "paragraphs": [
          "Real One Piece cards come off clean offset printing. Under a phone flashlight or a cheap loupe, text edges stay crisp, fine lines in the artwork stay separate, and color fields sit flat and even. Counterfeits are usually printed from scans or lower-grade digital files, and it shows: text looks slightly soft at the edges, thin lines blur together, and busy artwork turns muddy.",
          "Zoom in further and look for the rosette pattern — the tiny dot structure offset printing leaves behind. On a real card the dots form a regular, even pattern. On many fakes the pattern is irregular, blotchy, or missing entirely, because the copying process could not reproduce it. Color is the third tell in this family: fakes frequently run over-saturated, with reds and blues pushed too hard, or washed out, because the counterfeiter is matching a screen image instead of the original ink values.",
          "None of this needs equipment beyond your phone camera's zoom. Photograph the card straight-on in daylight, zoom into the text and the artwork's fine detail, and compare what you see against the table below. The same print tells apply across TCGs — our [guide to spotting fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/) walks through the identical print logic on Pokémon stock."
        ],
        "table": {
          "head": [
            "Check",
            "What real looks like",
            "What fakes often show"
          ],
          "rows": [
            [
              "Print sharpness",
              "Crisp text edges; fine artwork lines stay separate",
              "Soft or fuzzy text; lines blur together"
            ],
            [
              "Rosette pattern",
              "Regular, even dot structure under magnification",
              "Irregular, blotchy, or absent dots"
            ],
            [
              "Color saturation",
              "Flat, even color matched to the set's printing",
              "Over-saturated, washed out, or shifted hues"
            ],
            [
              "Card stock",
              "Firm, consistent thickness with a smooth finish",
              "Too glossy, too flimsy, or noticeably thicker"
            ],
            [
              "Font and spacing",
              "Clean type, even letter spacing, correct line breaks",
              "Slightly wrong letterforms; cramped or uneven spacing"
            ],
            [
              "Rarity and set codes",
              "Codes match the card's set, rarity, and language printing",
              "Codes mismatched to the card, the set, or the rarity"
            ],
            [
              "Light behavior",
              "Consistent, muted response with light behind the card",
              "Noticeably different brightness or color versus a real card"
            ]
          ]
        }
      },
      {
        "h": "Stock and feel: the check your hands do",
        "note": "The photos buyers send us are almost always of the front of the card, perfectly lit, showing the artwork. The photos that actually help are the boring ones: the card's edges, the back, the text block zoomed in, and the suspect card beside any card from the same set. If you are asking any seller to verify a card, ask for those.",
        "paragraphs": [
          "Pick the card up. Real One Piece cards use a specific, consistent stock: firm without being stiff, smooth without being slippery, and the same thickness across every card in a set. Fakes most often get this wrong in one of two directions — a glossy, almost plastic feel, or a flimsy stock that flexes too easily. If you have handled real cards from the same set, your fingers will flag the difference before your eyes do.",
          "The light test belongs to this family. Hold the card in front of a bright light and note how much light comes through and what color it takes. Real cards respond consistently because the stock is consistent. The catch — and it matters — is that this only works as a comparison. A light test on its own proves nothing, because you need a known-real card of the same printing beside it to know what normal looks like for that set."
        ]
      },
      {
        "h": "Text, fonts, and codes: where cheap fakes get lazy",
        "paragraphs": [
          "Counterfeiters copy artwork from scans, but text has to be re-typeset or scanned at quality, and both routes leave marks. Read the card's text block slowly. Look for letterforms that are almost right — a slightly different curve on a letter, spacing that breathes unevenly, a line break landing in a different place than the real printing. Real cards are typeset once and printed identically millions of times; any inconsistency in the typography is a red flag that costs nothing to check.",
          "Then check the codes. Every card carries a set code and a rarity marking, and they have to agree with each other, with the card's number, and with the language printing in your hand. A card whose code belongs to a different set, or whose rarity marking does not match the version that set actually printed, has failed a check the counterfeiter did not even know existed. The discipline is the same one we teach for Pokémon in [our rarity symbols breakdown](/blog/japanese-pokemon-rarity-symbols-explained/): codes are printed facts, and printed facts can be cross-checked."
        ]
      },
      {
        "h": "The comparison method: the only check we fully endorse",
        "paragraphs": [
          "Here is the method that settles it. Take a card you are certain is authentic — ideally from the same set and the same language printing — and lay it directly beside the suspect card. Same light, same angle. Now run every check above on both at once: print sharpness, rosette, color, stock, thickness, text, codes. Fakes survive isolated inspection because your memory of what real looks like is fuzzy. They do not survive a side-by-side, because every small wrongness becomes a visible difference.",
          "This is also why the first cards you buy in a new set matter. Sealed product from a source you trust — a current set like [OP-17 The World's Strongest Warriors](/sets/op-17-worlds-strongest-warriors/) — gives you a reference library of known-real cards from that exact printing. Every single you buy afterwards can be checked against them. Build the reference set first, and every later purchase gets safer.",
          "Do the comparison under neutral light — daylight or a plain lamp beats a colored room light, because saturation differences are half the evidence. And be honest about what a clean pass means. If the two cards look identical after the full stack, the conclusion is not 'proven real.' It is 'no evidence of fake' — which, combined with a seller who stands behind the card, is the strongest position a buyer can actually reach."
        ]
      },
      {
        "h": "Sealed product is a different problem",
        "paragraphs": [
          "Everything above assumes you can see and handle the card. A sealed box hides the cards entirely, so the checks shift from the cards to the packaging: shrink wrap, seals, box print quality, and what you know about the seller. A resealed box can hold real cards with the hits removed, or swapped packs — the cards being genuine does not mean the box was honest.",
          "That is a separate inspection with its own protocol, and we have written it up in full: [how to tell if a booster box is resealed](/blog/how-to-tell-if-a-booster-box-is-resealed/). Read it before buying sealed from any source you have not used before, especially marketplace listings priced below what the box normally sells for. With sealed product, a price that looks like a gift is usually a cost someone else already took out of the box."
        ]
      },
      {
        "h": "When a card fails: what to do next",
        "paragraphs": [
          "Stop, document, and do not pass it on. Photograph the card and the specific failures you found while you still have the seller's listing and messages. Contact the seller first — honest sellers exist, and some genuinely do not know — and give them the chance to refund. If they refuse or vanish, move to the platform's claim process or your payment provider with your photos and the comparison evidence ready. Claims are won with documentation, not opinions.",
          "One rule has no exceptions: never resell a card you believe is fake, and never trade it onward quietly. Every fake that stays in circulation gets sold to someone with fewer checks than you. Mark it, keep it as a reference copy for comparisons if it is useful, or destroy it — but its journey through the hobby ends with you. And if the purchase came through a route with no recourse at all, treat the loss as tuition and change routes: [buying TCG from Japan](/blog/buying-tcg-from-japan-shipping-customs-proxy/) breaks down which routes leave you protected and which leave you holding the risk.",
          "The same discipline applies in person — at events, local meetups, and card-show tables — where there is no platform claim to fall back on. Run the stack before money moves, bring your own reference card from the same set, and treat any pressure to skip the checks — a queue forming behind you, a price that supposedly expires in five minutes — as information about the seller, not about the card."
        ]
      },
      {
        "h": "The context that changes the checks: Japanese vs English printings",
        "paragraphs": [
          "One Piece cards are printed for the Japanese market first — [OP-18](/sets/op-18-the-dominance-of-god/) continues that pattern — and the English printing follows. The two printings are both authentic, but they are not identical objects: finish, texture, and small production details can differ between print origins. That means a Japanese card compared against an English reference can show differences that are printing differences, not fake tells.",
          "So compare like with like: Japanese suspect, Japanese reference; English suspect, English reference. If you are buying Japanese singles, your reference cards should come from Japanese product — a [Japanese OP-17 booster box](/product/op-17-the-world-s-strongest-warriors-booster-box-japanese-one-piece-card/) is a box of known-real references from the current printing. Most of the [One Piece cards](/one-piece-cards/) we handle are Japanese for exactly this reason: the chain from a sealed Japanese box to your hands is short, documented, and checkable."
        ]
      },
      {
        "checklist": [
          "Photograph the card front, back, and edges before you handle it further",
          "Zoom into the text block: check sharpness, letterforms, and spacing",
          "Check the rosette pattern under magnification against your reference card",
          "Compare color saturation side by side — same light, same angle",
          "Feel the stock and compare thickness against the reference card",
          "Cross-check the set code, card number, and rarity marking for agreement",
          "Run the light test comparatively, never on its own",
          "If two or more checks fail, start the seller conversation before opening, grading, or trading anything"
        ],
        "h": "The 60-second check, in order",
        "paragraphs": [
          "Run it the same way every time and it becomes habit. Sixty seconds per card is enough for the full stack once the reference card is beside it."
        ]
      }
    ],
    "slug": "how-to-spot-fake-one-piece-cards",
    "takeaway": [
      "Fake detection is not a trick, it is a stack: print, stock, text, codes, and above all comparison against a card you know is real. No single layer is proof, and any guide that promises one is selling you confidence instead of safety.",
      "Buy your reference cards from sources that stand behind them, run the checks in order, and when you are ready to play the cards that passed, [building your first One Piece deck](/blog/one-piece-how-to-build-your-first-deck/) is the natural next step. The cheapest fake is the one you never bought — and provenance, not eyesight, is what makes that true most of the time."
    ]
  },
  "how-to-store-sealed-booster-boxes": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "A sealed bin helps with dust and pests but does almost nothing about temperature, and garage temperature swings are the core problem — plus a humidity cycle every time the door opens. For a few weeks, fine. For stock you are holding for years, no: the bin belongs in a climate-stable room, or the stock does.",
        "q": "Can I store booster boxes in a garage if they're in a plastic bin?"
      },
      {
        "a": "No. Intact factory shrink is part of the product's value and its first line of authenticity evidence. Inspect the shrink itself — seams, tears, scuffs — and photograph it. The moment you remove it, the box is an opened box for resale purposes, whatever is inside.",
        "q": "Should I take the factory shrink off to inspect the box?"
      },
      {
        "a": "Once a year, thoroughly: handle each box, compare it against your inventory photos, check for damp smell, soft corners, and shrink damage, and refresh silica gel. Slow damage caught at year one is a storage fix. Caught at year five, it is a price cut.",
        "q": "How often should I check stored sealed product?"
      }
    ],
    "h1": "How to Store Sealed Booster Boxes So They Stay Worth Storing",
    "intro": [
      "Store sealed product like the Warehouse does: in a climate-stable room, off the floor, out of direct sun, factory shrink untouched, nothing heavy stacked on top, and an inventory record with the purchase price and date. That is the whole system. Everything below is why each part matters and what it costs you when it is skipped — because sealed value is condition, and condition is lost slowly, invisibly, and permanently.",
      "This guide is for collectors holding boxes and cases for months or years. It is not for short-horizon flippers: if a box will be sold within a few weeks, storage discipline will not change its price, and your time is better spent on the sale. Storage pays over years, not weeks — hold that boundary before you build shelves around it."
    ],
    "metaDescription": "Heat, humidity, sun, and stacking quietly destroy sealed box value. The room-by-room storage verdict, the exact setup, and the yearly check.",
    "metaTitle": "How to Store Sealed Booster Boxes Without Killing Value",
    "readMinutes": 9,
    "sections": [
      {
        "h": "What actually damages a sealed box, ranked",
        "paragraphs": [
          "Ranked by how much value they destroy and how quietly they do it — this is an experience ranking from handling sealed stock every week, not laboratory data. First: water and humidity. Damp air swells cardboard, feeds mold, and makes the foil cards inside packs curl as humidity swings back and forth. One wet incident can end a box's sealed premium in an afternoon; slow damp does the same work over a season.",
          "Second: heat, which accelerates everything humidity starts, dries out adhesives, and in extremes warps contents. Third: direct sunlight, which fades box art and shrink unevenly — a sun-bleached box reads as damaged stock to any buyer before they check anything else. Fourth: crushing weight. Stacked cases bend box corners and can crease the packs inside, and corner condition is the first thing a serious buyer inspects. Fifth: damaged shrink — tears and scuffs invite the reseal question even when the box is completely honest. Sixth: pests, the garage special, because mice and insects treat stored cardboard as housing."
        ]
      },
      {
        "h": "The room-by-room verdict",
        "paragraphs": [
          "Most storage failures are room failures. The same box survives a decade in one room and is ruined in one summer in another, and no bin or bag fixes a wrong room. Judge your options by temperature stability first, humidity second, and everything else after that."
        ],
        "table": {
          "head": [
            "Room",
            "Temperature stability",
            "Humidity risk",
            "Verdict"
          ],
          "rows": [
            [
              "Climate-controlled living space",
              "High — follows the home's heating and cooling",
              "Low",
              "Best option. This is where valuable sealed stock belongs"
            ],
            [
              "Bedroom closet (interior wall)",
              "Good — buffered from outside walls",
              "Low to moderate",
              "Good. The realistic choice for most collectors"
            ],
            [
              "Attic",
              "Poor — the biggest swings in the house",
              "Moderate to high",
              "Never. Summer heat and winter cold cycle your stock twice a year"
            ],
            [
              "Garage",
              "Poor — barely better than outdoors",
              "High, plus pests and fumes",
              "Never for anything you care about. Fine for empty packaging"
            ],
            [
              "Rented storage unit",
              "Varies — climate-controlled units only",
              "Varies",
              "Acceptable only if genuinely climate-controlled; a standard unit is a rented garage"
            ]
          ]
        }
      },
      {
        "h": "The exact setup",
        "note": "When cases arrive at the Warehouse, they are checked — shrink, seams, corners — then shelved flat on low racks, off the floor, in the same room conditions we would keep our own collection in. Single boxes never go under cases, and nothing sealed sits where sun through a door can reach it. It is not a complicated system. It is just a consistent one.",
        "paragraphs": [
          "Shelving first: boxes live on a shelf or in a closed bin, off the floor. Floors are where water arrives first — spills, leaks, mopping — and a box sitting on concrete wicks moisture straight up through the cardboard. Inside a closed storage bin, a silica gel pack is a common, cheap precaution against damp air; replace or recharge it when you do your yearly check.",
          "Stacking discipline: never stack cases on top of single boxes. Cases are heavy, and a single box under one is being slowly crushed into a condition problem. Cases sit flat on the lowest shelf — for scale, one case is twelve boxes in a single unit, which is exactly the arithmetic broken down in [sealed case vs booster box: the math](/blog/sealed-case-vs-booster-box-the-math/) — while single boxes stand upright on their own shelf, snug enough not to lean, loose enough to slide out without tearing shrink.",
          "Leave the factory shrink alone. Shrink condition is part of what a buyer pays for, and intact factory shrink is also your first authenticity evidence — the checks in [our resealed box guide](/blog/how-to-tell-if-a-booster-box-is-resealed/) start with shrink and seams for a reason. If a box's shrink tears in handling, note it in your inventory rather than rewrapping it: a rewrapped box invites questions that an honestly noted tear never will."
        ]
      },
      {
        "h": "Inventory like you mean it",
        "math": [
          "Units to photograph and log = single boxes + (cases × 12)",
          "Recorded cost per unit = what you actually paid landed, with the date",
          "Review cycle: one full condition pass per year, same month every year"
        ],
        "paragraphs": [
          "Storage protects condition; records protect value. For every box or case you hold, keep a photo of its condition the day it goes on the shelf, plus one line in a simple spreadsheet: product, purchase price, purchase date, where it is stored. It takes two minutes per item and pays off three ways — you can prove what you own, you can see what your shelf is actually worth, and you will never discover a forgotten box after its moment has passed. When a single OP-18 case on the shelf is $755 of stock (as of October 21, 2026), 'roughly what I paid' stops being good enough bookkeeping.",
          "The records habit is the same one we argue for in [whether Japanese cards are a good investment](/blog/are-japanese-pokemon-cards-a-good-investment/): a shelf you cannot list from records is a portfolio without books. And the bookkeeping starts at the door — the landed-cost math in [buying TCG from Japan](/blog/buying-tcg-from-japan-shipping-customs-proxy/) is what your purchase-price column should hold, not the first shelf price you happened to see."
        ]
      },
      {
        "h": "Insurance, honestly",
        "paragraphs": [
          "We will not tell you your home insurance covers your collection, because policies vary enormously and collectibles are exactly the category insurers treat specially — some cap them, some exclude them, some require a rider or an appraisal above a set value. The honest directive: read your policy's collectibles wording, and if your shelf's total value surprises you, ask your insurer directly what it would take to cover it. That is a ten-minute question that should not be improvised after a leak.",
          "What you control is the evidence. The dated photos and purchase records from your inventory are what any claim, from any insurer, asks for first. A collector with photos and receipts is in a different conversation than a collector working from a number they remember."
        ]
      },
      {
        "h": "The risk layer: damage you only discover at resale",
        "paragraphs": [
          "Here is the failure mode that makes storage different from every other collecting skill: the damage is invisible while it happens. Humidity does not announce itself. A corner softens a fraction at a time. You find out at the worst possible moment — when a buyer inspects the box in person, or when you open a case you held for five years and find the top boxes scuffed and soft-cornered. By the time you can see storage damage, the premium it cost you is already gone.",
          "The recovery protocol is the yearly condition pass. Once a year, handle every item: check shrink, corners, and any smell of damp; compare against your inventory photos; re-shelve anything that drifted into a wrong room or a wrong stack. Condition is the whole game with sealed product — the same reason [grading rewards the cleanest copies](/blog/psa-grading-japanese-cards-worth-it/) is why a yearly pass protects real money. If you do find damage, grade it honestly and price the box as what it now is: a box with a disclosed flaw keeps most of its value and all of your reputation, while a damaged box discovered by your buyer keeps neither. A box whose sealed premium is already gone to damage also changes the math in [should you open it or keep it sealed](/blog/should-you-open-or-keep-sealed-booster-box/) — sometimes the honest answer becomes 'open it and enjoy it.'"
        ]
      },
      {
        "h": "Climate context: where you live changes the enemy",
        "paragraphs": [
          "Storage advice is local even when the product is global. In humid climates — including much of Japan, where most of the stock on our [Japanese TCG shelves](/japanese-tcg/) originates — moisture is the standing enemy and the closed bin with silica gel matters most. In hot, dry climates, heat and sun do the damage and the attic ban matters most. A box shipped from Japan has already survived one climate and an international journey; give it a day to reach room temperature before shelving it somewhere very different, and never shelve a parcel that arrived damp — dry the room, inspect the box, and log its condition that day.",
          "One more context difference: Japanese and English boxes age the same way, but buyers scrutinize Japanese sealed product's shrink especially hard, because factory shrink style is part of how authenticity is judged in the first place. That makes your shrink discipline and our [guide to spotting fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/) the same habit seen from two sides. Browse [our Pokémon range](/pokemon-cards/) and notice how much of a listing's trust comes from the box simply looking right — that look is storage, preserved."
        ]
      },
      {
        "checklist": [
          "Climate-stable room chosen — no attics, no garages",
          "Everything off the floor, on shelving or in a closed bin",
          "No direct sunlight reaching stock at any hour",
          "Silica gel in closed bins, refreshed at the yearly check",
          "Cases flat and low; single boxes upright, never under cases",
          "Factory shrink untouched; any tear noted in the inventory",
          "Photo, purchase price, and date logged for every box and case",
          "Yearly condition pass against the photos, same month every year"
        ],
        "h": "The storage checklist",
        "paragraphs": [
          "Run this once when you set the shelf up, and again at every yearly pass. Eight lines between your collection and every failure mode above."
        ]
      }
    ],
    "slug": "how-to-store-sealed-booster-boxes",
    "takeaway": [
      "Sealed value is not made by the market alone — it is kept, or lost, on your shelf. The collectors whose five-year-old boxes still command a premium are not luckier than everyone else. They stored boringly, recorded everything, and checked once a year.",
      "Deciding what earns shelf space starts with the math in [sealed case vs booster box](/blog/sealed-case-vs-booster-box-the-math/) and the honest verdict in [should you open or keep it sealed](/blog/should-you-open-or-keep-sealed-booster-box/). Store what survives that scrutiny — and store it like it matters, because to the buyer in five years, it will."
    ]
  },
  "how-to-tell-if-a-booster-box-is-resealed": {
    "datePublished": "2026-10-20",
    "faqs": [
      {
        "a": "Not reliably. Boxes of the same set vary slightly from the factory, and a resealer who removed hits can add bulk cards to bring the weight back. A scale catches a grossly wrong box — packs missing entirely — but a normal reading cannot prove a box is untouched. Treat weight as a supporting signal, never as a verdict.",
        "q": "Can you tell if a booster box is resealed by weighing it?"
      },
      {
        "a": "Inconsistency: one detail that does not match factory norms or does not match the other boxes from the same source. A doubled seam on one box, cloudy shrink on one box, a mismatched pack crimp among uniform ones. Reseals rarely fail everywhere; they fail in one place. Beyond physical signs, the strongest signal overall is provenance — an anonymous seller, no returns, and a price far below market is a red flag before the box even arrives.",
        "q": "What is the single most reliable sign of a reseal?"
      },
      {
        "a": "Document everything you found — photographs of the shrink, seams, and pack crimps, and notes on what was wrong. Contact the seller with the evidence and ask for a resolution; accountable sellers would rather fix it than fight it. Then change the routine going forward: photograph every future box before opening, and open anything suspicious on video. The evidence habit is what turns a suspicion into a refund.",
        "q": "I already opened a box I now think was resealed. What can I do?"
      }
    ],
    "h1": "How to Tell If a Booster Box Is Resealed: A Hands-On Inspection Guide",
    "intro": [
      "The honest answer first: no home inspection can certify a booster box as factory sealed, and anyone who tells you otherwise is selling confidence they do not have. What inspection can do is catch sloppy reseals — and most reseals in the wild are sloppy, done fast, with hardware-store film and a heat gun. This guide walks through the checks in the order we would run them, states plainly what each one can and cannot prove, and finishes with the check that matters more than every physical test combined: who sold you the box.",
      "This is for buyers who pick up sealed boxes from marketplaces, social media sellers, or shops they do not know yet, and who want a repeatable routine instead of a gut feeling. It is not a certification method, and it cannot settle a dispute by itself — a seller's return policy is what settles disputes. If you need certainty rather than odds, skip to the provenance section: the real defense is buying from an accountable seller, and inspection is the backup, not the plan."
    ],
    "metaDescription": "Resealed booster box signs you can check yourself: shrink, seams, tear strip, pack crimps — and why who you bought from matters most.",
    "metaTitle": "Resealed Booster Box Signs: How to Inspect a Box",
    "readMinutes": 9,
    "sections": [
      {
        "h": "Start with the shrink wrap",
        "paragraphs": [
          "Japanese booster boxes ship in factory shrink wrap, and factory shrink has a character: it is thin, tight, and consistent, pulled evenly over the box with clean, regular seams. Run your palm over the faces of the box. Factory film sits flat and smooth, hugs the corners, and feels the same on every face. It does not billow, it does not crackle loosely in one spot and pull tight in another, and the box underneath shows crisp cardboard edges rather than softened ones.",
          "A reseal usually announces itself in the film before anywhere else. Replacement shrink from a craft store or a shipping supplier is typically thicker and stiffer than factory film, and a heat gun applied by hand leaves evidence: wavy, uneven tension, cloudy or milky patches where the film got too hot, and small wrinkles radiating from the corners where the excess film had nowhere to go. Loose, baggy wrap on a box that should be drum-tight is a red flag. So is wrap that is suspiciously perfect on five faces and disturbed on the sixth — resealing disturbs the face that was opened, and the disturbance rarely blends in.",
          "Do this check under a bright light, and turn the box slowly. Shrink flaws hide in flat light and show up at an angle. If you own a box you are confident about — bought from a source you trust — keep it unopened-side in mind as your reference: factory film from the same product line feels alike, and the resealed box is the one that feels different from its siblings. Comparison is the whole game in this section. You are not memorizing a specification; you are spotting the box that does not match."
        ]
      },
      {
        "h": "Seams, the tear strip, and anything stuck to the box",
        "paragraphs": [
          "Factory seams are formed by machine, and machines repeat themselves: a seam sits where the product line always puts it, runs straight, and shows a single uniform line of fused film. Examine every seam on the box with a fingertip as much as with your eyes. A resealed box often carries a second seam alongside the first, a seam on an edge where the factory does not put one, or a seam that changes character halfway along its length — neat where the resealer was careful, wavy where their attention lapsed. Glue is the other tell: a faint shine along a seam, a slightly tacky feel, or film edges that lift a fraction where adhesive replaced fusion.",
          "Many Japanese boxes carry a tear strip in the shrink — a thin band meant to be pulled to open the wrap cleanly. Check that it runs continuously around the box and that it has not been cut and re-joined: a re-joined strip shows a step, a thickness change, or a break in its line that you can feel with a fingernail. Then look at anything adhered to the box itself — labels, stickers, price seals. Edges that do not sit flat, adhesive shine around a sticker that should be flush, or a sticker positioned slightly off the product line's usual placement all suggest the surface has been disturbed. None of these alone convicts a box. Two together should stop your hands."
        ]
      },
      {
        "h": "Weight and feel: the honest section",
        "paragraphs": [
          "Almost every reseal guide leans on weight, so let us be straight about its limits. A booster box's weight varies a little from the factory — card stock, humidity, and packing tolerances see to that — and a resealer who removed the hits can add bulk cards to bring the total back to normal. Weighing a box can catch a gross error: packs missing outright, a box filled with the wrong product entirely. It cannot prove a box is untouched, and a normal reading should never talk you out of doubts raised by the shrink and seams.",
          "Feel is the same kind of evidence: supporting, never decisive. A factory box feels uniformly packed, with the contents sitting evenly. A box whose packs shift loosely, or that feels oddly heavy at one end, deserves a closer look — but shipping knocks contents around too, and a hard journey can loosen a honest box. Use weight and feel the way a mechanic uses a rattle: as a reason to inspect the specific thing, never as the inspection. If your inspection ends at the scale, it did not really begin."
        ]
      },
      {
        "h": "The inspection table",
        "paragraphs": [
          "Keep this table open while you work through a box. Read it row by row rather than hunting for a single damning detail: reseals are caught by accumulation, one soft signal stacked on another, until the pile says what no single check could. A box that passes every row is not certified — it is simply a box with no visible reason for suspicion, which is the strongest statement physical inspection can honestly make.",
          "One row sits below the physical checks deliberately. Price is evidence too. A box offered far below the going market price is a question asking to be answered: why is this seller able, or willing, to sell at that number? Sometimes there is an innocent answer. Often enough, there is not, and the time to ask is before the money moves."
        ],
        "table": {
          "head": [
            "Check",
            "What good looks like",
            "Red flag"
          ],
          "rows": [
            [
              "Shrink tension",
              "Tight, even, smooth on every face",
              "Loose or baggy areas, wrinkles at corners, cloudy heat patches"
            ],
            [
              "Seams",
              "Single, straight, uniform fused line",
              "Double seams, glue shine, wavy or lifted edges"
            ],
            [
              "Tear strip",
              "Continuous band, unbroken line",
              "Cut and re-joined, step or gap in the strip"
            ],
            [
              "Box under the wrap",
              "Crisp cardboard edges and clean faces",
              "Softened edges, scuffs or dust sealed under the film"
            ],
            [
              "Pack crimps (where visible)",
              "One consistent crimp pattern across packs",
              "Mixed crimp styles between packs in the same box"
            ],
            [
              "Pack orientation (where visible)",
              "Broadly consistent facing",
              "Packs alternating direction in a pattern that looks hand-packed"
            ],
            [
              "Provenance",
              "Named, accountable seller with returns",
              "Anonymous seller, no returns, price far below market"
            ]
          ]
        }
      },
      {
        "h": "Pack-level signs: crimps and orientation",
        "paragraphs": [
          "Where packs are visible — a display window, a partially open display, or the moment you have legitimately opened a box and want to assess what you are looking at — the packs themselves carry evidence. Packs from one production run are crimped by the same machinery: the sealed ends show a consistent pattern, spacing, and bite. A box that was opened, searched, and repacked often betrays itself here, because the replacement packs came from somewhere else: a different crimp style mixed in among uniform ones is the classic tell, and it stands out precisely because everything else matches.",
          "Pack orientation is the softer version of the same signal. Factory packing is not ceremonial — packs are not all placed with a monk's care — but broadly consistent facing is normal, while packs alternating direction in a tidy alternating pattern can suggest hands arranged them. Treat orientation as a flag to raise your attention, never as proof: it is the weakest check in this guide, and it convicts nothing on its own. The rule for both pack-level signs is the rule for the whole inspection: one mismatch is a question; a pattern of mismatches is an answer."
        ]
      },
      {
        "h": "Provenance: the strongest check is not physical",
        "note": "When sealed cases arrive at the Warehouse, inspection starts before a single box is touched: case tape undisturbed, shrink tight and consistent from box to box, seams uniform across the whole case. One odd box among twelve stands out immediately, because inconsistency is the tell. The home version of the same principle: you are not looking for perfection in a box, you are looking for the one detail that refuses to match the others.",
        "paragraphs": [
          "Every physical test in this guide has a counter. Film can be matched, seams can be practiced, weight can be padded. The check a resealer cannot fake cheaply is provenance: a seller with a name, a track record, stock sourced through traceable channels, and a return policy they actually honor. An accountable seller gives you something no inspection can — recourse. If a box turns out wrong, you are not holding evidence and a grievance; you are holding a purchase that gets fixed.",
          "This is why provenance outranks technique. Buy from a marketplace stranger and your entire protection is your own inspection skill against someone who may do this every week. Buy from an accountable seller and their reputation does the inspecting for you, at scale, on every box they stock — because one resealed box reaching a customer costs them more than the box was ever worth. Provenance does not make physical checks useless; it decides how much weight they have to carry. With a strong seller, inspection is a formality. With a weak one, no amount of seam-checking makes the purchase safe."
        ]
      },
      {
        "h": "If you suspect a reseal: stop, document, then decide",
        "paragraphs": [
          "The moment suspicion lands, stop opening. Photograph the box from every face before anything else happens — the shrink, the seams, the tear strip, the suspect detail close up. Your evidence is strongest while the box is exactly as it arrived, and every second of handling blurs it. Then contact the seller before breaking any seal, explain what you found, and attach the photographs. An accountable seller wants to know and will usually resolve it on the spot; a seller who pressures you to just open it has told you something important about themselves.",
          "If you decide to proceed anyway — sometimes the price made the gamble deliberate — open the box on video, in one continuous shot, starting with a slow turn of the sealed box so the shrink and seams are on record before the first tear. Narrate what you find as you go: crimps, orientation, the pack order. If the box is clean, you have a video and a good box. If it is not, you have the only kind of evidence that moves marketplaces and payment disputes: contemporaneous, unedited, and taken before you could have altered anything. Without that discipline, a reseal claim becomes your word against a stranger's, and that argument is rarely won."
        ]
      },
      {
        "h": "Honest limitations: what this guide cannot do",
        "paragraphs": [
          "A determined resealer — patient, with the right film, the right heat control, and practice — beats casual inspection. This guide raises your odds against the common case, which is the fast, sloppy reseal; it does not and cannot promise detection of the best work. It also cannot certify a box for anyone else: if you resell a box you inspected, describe it honestly as a box you bought and checked, not as verified sealed, because your inspection is a judgment, not a guarantee, and passing it on as one would make you part of the problem this guide exists to fight.",
          "That honesty is the point of the whole exercise. The physical checks are real and worth doing — they catch real reseals every week somewhere in this hobby. But the hierarchy in this guide is deliberate: provenance first, documentation second, physical inspection third. Collectors who invert that order end up expert at examining boxes they should never have bought. Spend most of your effort on who you buy from, some on documenting what arrives, and the rest on the seams — in that order, the problem mostly takes care of itself."
        ]
      },
      {
        "checklist": [
          "Photograph the box from all six faces before touching the wrap",
          "Check shrink tension by hand: tight and even everywhere, no cloudy patches or corner wrinkles",
          "Trace every seam with a fingertip: single, straight, no glue shine, no doubled lines",
          "Run a fingernail along the tear strip end to end: continuous, no cuts or re-joins",
          "Compare against a box you trust, if you have one — hunt for the detail that does not match",
          "Weigh the box and note it as a supporting signal only",
          "Where packs are visible, check crimp consistency and broad orientation",
          "Write down the seller, the date, the price, and the return terms",
          "If anything mismatches: stop, photograph again, contact the seller before opening anything",
          "If you proceed anyway, open on one continuous video starting with the sealed box"
        ],
        "h": "Action layer: the inspection checklist",
        "paragraphs": [
          "Run this checklist in order, on every marketplace box, before the wrap comes off. It takes five minutes. The order matters: documentation comes first and opening comes last, because everything you might need later depends on the box being provably untouched when you found the problem."
        ]
      }
    ],
    "slug": "how-to-tell-if-a-booster-box-is-resealed",
    "takeaway": [
      "Inspection is a filter, not a certificate. Run the checks, hunt for the detail that refuses to match, and let inconsistencies — not any single test — make the call. But build your buying around provenance, because the seller is the only check that comes with recourse attached.",
      "And keep the evidence habit even when a box looks perfect: photographs before opening, seller details written down, video for anything suspect. Five minutes of routine is what separates a buyer who catches reseals from a buyer who argues about them.",
      "Provenance is the strongest check in this guide, which is why the buying route matters: [buying TCG from Japan — shipping, customs, and proxies](/blog/buying-tcg-from-japan-shipping-customs-proxy/) compares the routes by fake and reseal risk, and our [guide to spotting fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/) covers the cards themselves once a box is open. If a box passes inspection and the pulls are real, [our investment breakdown](/blog/are-japanese-pokemon-cards-a-good-investment/) helps you decide what to hold and what to move.",
      "One Piece buyers face the same problem one level down: [how to spot fake One Piece cards](/blog/how-to-spot-fake-one-piece-cards/) runs the card-level checks with the same honesty about what inspection can and cannot prove."
    ]
  },
  "japanese-pokemon-rarity-symbols-explained": {
    "datePublished": "2026-10-20",
    "faqs": [
      {
        "a": "At the bottom corner of the card, in small type beside the collector number. The collector number gives the card's position in its set; the letter code beside it — C, U, R, RR, AR, SAR and so on — gives its rarity tier. Read it letter by letter: AR and SAR are different tiers.",
        "q": "Where exactly is the rarity printed on a Japanese Pokémon card?"
      },
      {
        "a": "It depends on the era, because the ladder gains new top tiers over time. In current SV and M era sets, SAR — Special Art Rare — is the modern chase tier. Era specials can sit at the very top of their own sets: BWR headlines SV11 Black Bolt and White Flare, and FUR was introduced brand-new with M6a in 2026. Rarest tier still does not automatically mean highest price — character and print volume decide that.",
        "q": "What is the rarest Japanese Pokémon rarity?"
      },
      {
        "a": "No. UR and SAR are print tiers, not price ranks. A gold UR of a little-loved card can sell for less than a chase SAR of a popular character, because the market prices character demand and scarcity on top of tier — and condition matters as well. Use the code to identify the card; use character, set, condition, and sold prices to value it.",
        "q": "Is a UR always worth more than a SAR?"
      }
    ],
    "h1": "Japanese Pokémon Rarity Symbols, Explained: The Full Ladder",
    "intro": [
      "Every Japanese Pokémon card tells you its own rarity. It is printed as a small letter code at the bottom of the card — C, U, R, RR, AR, SAR and a handful of others — and once you can read the ladder, any Japanese card you pick up identifies itself in about two seconds. No app. No guesswork from how shiny it looks. This page is the complete ladder: every code, what it looks like in hand, which era it belongs to, and what it does and does not say about value.",
      "That last clause is the one that saves money. Rarity is a print category, not a price tag, and confusing the two is the most common beginner error we see with Japanese cards. So we will do this properly: the code first, the ladder second, and then the honest part — how rarity actually maps to price, where it misleads, and how to use it when you are buying from a photograph."
    ],
    "metaDescription": "Every Japanese Pokémon rarity code explained — C, U, R, RR, AR, SR, SAR, UR, BWR, FUR: where to find it on the card, and what it really means for value.",
    "metaTitle": "Japanese Pokémon Rarity Symbols Explained: Full Ladder",
    "readMinutes": 10,
    "sections": [
      {
        "h": "Where the code lives on the card",
        "paragraphs": [
          "Turn a Japanese card face-up and look along the bottom edge, to the bottom corner. There you will find the collector number — the card's position in its set, printed as a fraction — and beside it, the rarity code in small type. On modern cards the two sit together: collector number, then the letters. That little cluster is the card's identity card. The set symbol nearby tells you which set it came from; the code tells you its tier within that set.",
          "Three habits make the code useful. First, read it letter by letter — AR and SAR are different tiers, and a skimmed glance merges them. Second, read it before you admire the artwork, because full-art cards are designed to look like the top of the ladder even when they sit in the middle of it. Third, if you are checking a card from a photo, zoom into that bottom corner before you look at anything else. A listing whose photos never show the bottom of the card is a listing to price cautiously."
        ]
      },
      {
        "h": "The full Japanese rarity ladder",
        "paragraphs": [
          "Here is the ladder in print order, from the bulk at the bottom to the chase tiers at the top, with era labels kept honest — some codes are current, some belong to older eras and only appear on older cards. Finding an older-era code on an older-era card is correct. Finding one where it does not belong is a warning, and we will come back to that."
        ],
        "table": {
          "head": [
            "Code",
            "Name",
            "What it looks like",
            "Era"
          ],
          "rows": [
            [
              "C",
              "Common",
              "Plain card, no foil treatment",
              "Every era"
            ],
            [
              "U",
              "Uncommon",
              "Plain card, no foil treatment",
              "Every era"
            ],
            [
              "R",
              "Rare",
              "Holofoil sheen across the artwork",
              "Every era"
            ],
            [
              "RR",
              "Double Rare",
              "A Pokémon ex card with a holo finish — the workhorse hit of a modern box",
              "Current era (SV / M)"
            ],
            [
              "RRR",
              "Triple Rare",
              "The top ex tier of its era, home of the VMAX and VSTAR cards",
              "Older era (S)"
            ],
            [
              "AR",
              "Art Rare",
              "Full-art illustration with no border text box — the card reads as one continuous picture",
              "Current era (SV / M)"
            ],
            [
              "SR",
              "Super Rare",
              "Full-art card, typically a full-art Pokémon or supporter",
              "Long-running"
            ],
            [
              "SAR",
              "Special Art Rare",
              "Full-art with a textured, illustrated scene — the modern chase tier",
              "Current era (SV / M)"
            ],
            [
              "UR",
              "Ultra Rare",
              "Gold card",
              "Long-running"
            ],
            [
              "CHR",
              "Character Rare",
              "A Pokémon pictured together with its trainer, in full illustration style",
              "Older era (S, VMAX)"
            ],
            [
              "CSR",
              "Character Super Rare",
              "The textured, full-art evolution of the Character Rare",
              "Older era (S, VMAX)"
            ],
            [
              "K",
              "Kagayaku (Radiant)",
              "A Radiant Pokémon with a distinctive etched shine",
              "Older era (S)"
            ],
            [
              "BWR",
              "Black White Rare",
              "The headline rarity of Black Bolt and White Flare, fronted by Zekrom ex and Reshiram ex",
              "SV11 era (2025)"
            ],
            [
              "FUR",
              "Futuristic Rare",
              "A brand-new tier introduced with M6a 30th Celebration",
              "M6a (2026)"
            ]
          ]
        }
      },
      {
        "h": "Reading the ladder",
        "paragraphs": [
          "Two things to notice. The ladder is longer than the English one — Japanese printing separates tiers that English lumps together, which is exactly why the code is worth learning. And the era specials matter: BWR exists only because SV11 Black Bolt and White Flare created it, and FUR exists only because M6a created it in 2026. Rarity codes are a living system. New eras add new letters, and a complete reference has to say which letters are current and which are history."
        ]
      },
      {
        "h": "How the ladder fills a box",
        "paragraphs": [
          "Open a modern Japanese box and the ladder becomes a census. The overwhelming majority of what you pull is C and U — the working bulk of the game. R and RR are the regular hits, the cards a box is expected to produce. AR, SR, SAR and whichever era special the set carries are the cards the set will be remembered by, and they arrive at a pace measured in boxes, not packs.",
          "This is also why guaranteed structures feel so different from the outside. In SV11's Deluxe boxes — four packs of 35 cards — every pack guarantees AR or better, which takes a tier that normally appears occasionally and makes it the floor. In M6a, every card is holo, so the bottom of the ladder's shine is lifted across the whole set. The code tells you what a card is. The set's structure tells you how often to expect it. You need both numbers before a pull means anything."
        ]
      },
      {
        "h": "Rarity is not price: the honest map from code to value",
        "paragraphs": [
          "Now the part that protects your wallet. The ladder ranks print tiers within a set. It does not rank prices, and it never has. SAR is the modern chase tier — the full-art, textured scene cards that headline SV-era sets — and chase SARs do drive their sets. But the price of any individual card is decided by forces the code cannot see: how many were printed, and how much the hobby loves the character on the card.",
          "This is the Pikachu and Charizard effect, and it bends the ladder hard. A mid-tier card of a beloved character can outsell a top-tier card of a forgettable one, because demand follows characters, not codes. Print volume bends it the other way: a high-tier card from a heavily printed set can be easier to find — and cheaper — than a lower-tier card from a scarce one. Condition bends it a third way. The code is the start of valuing a card. Anyone who treats it as the end will overpay for impressive letters and walk straight past beloved characters in plain tiers.",
          "Use the code for what it is genuinely good at: identifying what you hold, confirming a listing is what it claims to be, and understanding where a card sat in its set's structure. Then price the card itself — character, set, condition, and what copies have actually sold for — with the code as one input among several."
        ]
      },
      {
        "h": "Using the code when you buy from photos",
        "paragraphs": [
          "Most Japanese singles change hands through photographs, and the code is your best forensic tool in a photo. Zoom the bottom corner. Read the code. Then ask three questions. Does the code match the rarity the seller claims? A card described as SAR whose code reads AR is not a bargain; it is a mislabeled listing, whether by error or intent. Does the code belong to the right era? A K or CHR code belongs on an S-era card; the same code on a card claiming to be current does not add up. Does the printing of the code itself look right — crisp, in the correct position, in the same print quality as the rest of the card? Fakes frequently get the big things plausible and the small type wrong, because the small type is what copiers examine least.",
          "For textured tiers like SAR, add a light test: tilt the card — or ask for a photo taken at an angle — and look for the etched texture catching light unevenly across the illustration. Genuine texture is physical. Flat, uniform gloss on a card claiming a textured tier is a stop sign. None of this requires expertise. It requires reading the bottom corner before reading the price."
        ]
      },
      {
        "h": "Context: English symbols are a blunter instrument",
        "paragraphs": [
          "If you learned Pokémon in English, recalibrate. English rarity is shapes: a circle for common, a diamond for uncommon, a star for rare — and past that star, the symbol largely stops helping. English secret rares are identified mainly by a collector number that runs past the set's printed total, which tells you a card is secret without telling you much about what kind of secret.",
          "Japanese letters carry more information. They separate AR from SR from SAR — tiers that English intuition folds toward a single 'ultra rare' — and they keep era specials distinct instead of blurring them together. That precision is why Japanese collectors talk in codes, and why a code quoted in a listing is a real piece of data rather than decoration. Two cards can both be 'the rare one' in English terms and sit three tiers apart in Japanese terms, with values to match."
        ]
      },
      {
        "h": "Where rarity reading goes wrong",
        "note": "The rarity question we hear most runs like this: a customer holds up a card that looks extraordinary — full art, rich texture, clearly something special — and asks why the code only says AR. Because that is what AR is for. The Art Rare tier is drawn to look like a masterpiece; the artwork is the entire point of the tier. The artwork flatters. The code does not. When the two seem to disagree, believe the code — then confirm the tier by texture and set number before paying a SAR price for an AR card.",
        "paragraphs": [
          "The classic error is ladder literalism: assuming a higher tier always means a higher price, so UR must beat SAR. It is wrong in both directions. A gold UR of a little-loved card can sit below a chase SAR of a popular one, because the market prices characters and scarcity, not letters. The second error is ignoring condition: rarity says nothing about centering, edge whitening, or surface scratches, and a rough top-tier card can be worth less than a pristine card a tier below. The third is era confusion — meeting a CHR, CSR or K code for the first time and assuming a misprint or a fake, when it is simply an older era's letter doing its job.",
          "The recovery for all three is the same discipline: the code identifies the card; it does not appraise it. Identify with the code, then appraise with character, set, print volume, condition, and real sold prices. Keep those two steps separate and the ladder will never mislead you. It only misleads when it is asked to do a job it was never printed to do."
        ]
      },
      {
        "h": "Who this is for — and who it is not for",
        "paragraphs": [
          "This is for anyone who holds Japanese cards: box openers sorting a fresh pull, buyers checking singles in listing photographs, collectors cataloguing what they own. If Japanese cards pass through your hands, the ladder is basic literacy, and this page is the reference to keep open while you sort.",
          "It is not a price guide, and using it as one will cost you money — rarity is one input to value, not the value. It is also not a grading guide: the code certifies a card's tier, never its condition. A mint common and a battered SAR are both exactly what their codes say, and worth amounts their codes alone would never suggest."
        ]
      },
      {
        "checklist": [
          "Find the bottom corner and locate the collector number; the rarity code is printed beside it.",
          "Read the code letter by letter — AR and SAR are different tiers, and skimming merges them.",
          "Match the code to the ladder and note the era: CHR, CSR and K are older-era codes, not errors.",
          "If the tier should be textured, tilt the card under light and confirm the etch catches light unevenly.",
          "Cross-check the set: the same character can carry different codes in different sets and printings.",
          "Verify before you pay: code, era, and texture must all agree with what the seller claims.",
          "Price the card, not the code — character, set, condition, and sold prices decide value."
        ],
        "h": "Checklist: identify any Japanese card in hand",
        "paragraphs": [
          "Work through these seven steps with the card in hand and you will not misread one."
        ]
      }
    ],
    "slug": "japanese-pokemon-rarity-symbols-explained",
    "takeaway": [
      "The rarity code is the fastest honest fact on a Japanese card: two seconds, bottom corner, no equipment. Learn the ladder once — C up through UR, with AR and SAR as the modern art tiers and BWR and FUR as the newest era specials — and every Japanese card you ever hold introduces itself properly.",
      "Just keep the discipline that makes the ladder useful instead of misleading. Believe the code over the artwork. Identify with the code, then appraise with everything else. Do that, and you will never pay a SAR price for an AR card, never dismiss an older-era code as a fake, and never mistake a letter for a price tag again.",
      "Knowing the codes is step one; using them is step two. If you're building toward completion, [what a master set is — and what building one actually involves](/blog/what-is-a-master-set-pokemon/) puts the rarity ladder to work. If a high-code card has you wondering about grading, [whether PSA grading Japanese cards is worth it](/blog/psa-grading-japanese-cards-worth-it/) runs the break-even before you ship anything. And when a listing quotes a box price, [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) is how you check what you're really paying per pack.",
      "Knowing the rarities is step one; using a card you cannot read is step two. [How to read Japanese Pokémon cards](/blog/how-to-read-japanese-pokemon-cards/) walks the card zone by zone — and shows why the corner number matters more than the language."
    ]
  },
  "japanese-vs-english-pokemon-cards-which-to-buy": {
    "datePublished": "2026-10-19",
    "faqs": [
      {
        "a": "They are the same official sets, printed for different markets. M6a even released worldwide on the same day — September 16, 2026. The differences are the language printed on the card, the pack structure in special sets, print quality (generally better in Japanese), and tournament legality: Japanese cards are not legal in English-language events.",
        "q": "Are Japanese Pokémon cards the same product as English ones?"
      },
      {
        "a": "We can show you the shelf math — $153.69 against $101.07 for the same 24 packs, as of October 20, 2026 — but the reasons behind publisher and distribution pricing are not ours to invent, and we will not dress a guess up as an explanation. What we can tell you is that the gap is specific to a set and a date, so re-run the division before you buy rather than assuming it holds.",
        "q": "Why does the English OP-17 box cost 52% more per pack than the Japanese one?"
      },
      {
        "a": "For sealed product, English has the larger resale buyer pool, which makes selling easier when the time comes. Japanese special sets are bought mainly to open and to collect. Beyond that, we do not quote appreciation figures we cannot back up — anyone promising you what a box will be worth in three years is selling you the promise, not the box.",
        "q": "Do Japanese cards hold their value?"
      }
    ],
    "h1": "Japanese vs English Pokémon Cards: Which Should You Actually Buy?",
    "intro": [
      "Short answer: if you are opening the box, buy Japanese. If you might resell it sealed, or you play in tournaments, buy English. That is the whole decision for most people. Everything below is the math and the exceptions, because the exceptions are exactly where the money gets wasted.",
      "This is the most common question we get in chat, almost word for word, and most of the answers floating around are pure opinion dressed up as fact. Ours is arithmetic. One honesty note before the numbers: our Pokémon shelves are Japanese-only, so for a clean same-set, same-day price comparison we use OP-17 from One Piece, which we stock in both languages. The division works identically in Pokémon — only the prices change. Every price in this article is our shelf price as of October 20, 2026.",
      "Who this is for: anyone about to spend real money on a Japanese or English box and genuinely torn between the two. Who it is NOT for: players who need tournament-legal cards for an English-language event. Your answer is English, full stop, and no math below changes that."
    ],
    "metaDescription": "Japanese or English cards? Cost per pack with exposed math, print quality, resale pool and legality compared — plus who should NOT buy each side.",
    "metaTitle": "Japanese vs English Pokémon Cards: Which to Buy?",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The money layer: what one pack actually costs",
        "math": [
          "OP-17 Japanese box: $101.07 ÷ 24 packs = $4.21 per pack",
          "OP-17 English box: $153.69 ÷ 24 packs = $6.40 per pack",
          "Gap: $6.40 − $4.21 = $2.19 per pack → English costs 52% more per pack",
          "M6a 30th Celebration box: $207.50 ÷ 20 packs = $10.38 per pack; $207.50 ÷ 120 cards = $1.73 per card, every card holo",
          "SV11B Black Bolt box: $152.65 ÷ 20 packs = $7.63 per pack; $152.65 ÷ 140 cards = $1.09 per card",
          "SV11W White Flare box: $139.77 ÷ 20 packs = $6.99 per pack",
          "SV11B Deluxe box: $177.49 ÷ 140 cards = $1.27 per card — same 140 cards as the standard box; the premium buys the guaranteed AR-or-better pack structure"
        ],
        "paragraphs": [
          "A box price on its own means nothing. Japanese and English boxes are priced as different products, so the only honest comparison is cost per pack — box price divided by packs in the box. Run it on OP-17, the same One Piece set, sitting on our shelf in both languages on the same day. The Japanese box is $101.07 for 24 packs. The English box is $153.69 for the same 24 packs. Divided out, a Japanese pack costs $4.21 and an English pack costs $6.40. Same set, same pack count, and English costs 52% more per pack before a single card is pulled.",
          "Pokémon shows the same pattern with a twist: the set matters as much as the language. M6a, the 30th Celebration set, is $207.50 for 20 packs — $10.38 a pack, the premium end of the shelf, and we will explain below what that premium buys. SV11B Black Bolt is $152.65 for 20 packs, $7.63 a pack, and because a standard box holds 140 cards, that works out to $1.09 per card. SV11W White Flare is $139.77 for 20 packs, $6.99 a pack. Japanese Pokémon is not automatically cheap — a celebration set outprices almost everything — but within any comparison you can actually run, you should be comparing cost per pack and cost per card, never the sticker on the box.",
          "One more division worth learning, because it teaches you to read a premium. The SV11B Deluxe box is $177.49 against $152.65 for the standard box — $24.84 more. Divide both by the same 140 cards and the Deluxe costs $1.27 per card against $1.09. You are not buying more cards; both boxes hold exactly 140. The premium buys the structure inside the Deluxe packs — 35 cards per pack with a guaranteed AR or better in each. Sometimes a higher price is a worse deal. Sometimes it is a different product wearing a similar box. The division cannot tell you which you prefer, but it can stop you from paying a structure premium while believing you paid for volume."
        ]
      },
      {
        "h": "Print quality and the pull experience",
        "note": "Warehouse Note: the buyers who regret a Japanese purchase almost never regret the cards. They regret finding out afterward that the cards cannot be played at their local English-language event. The product was right. The job they bought it for was wrong — and that mistake is made before checkout, not after.",
        "paragraphs": [
          "Handle both languages side by side and the second difference is physical. Japanese print quality and centering are generally better — cleaner registration, fewer off-center copies. That matters most if you grade cards, because a card has to start life clean to come back with a top grade. A slightly cheaper box full of off-center chase cards is not cheaper in any way that matters to a grader.",
          "The pull experience is where Japanese special sets stop being a translation and become a different product. M6a was built as a celebration, and it shows in the structure: every single card in the set is holo, there are 30 different Pikachu cards with one guaranteed in every pack, and a new FUR (Futuristic Rare) tier sits on top of 103 base cards plus secret rares. SV11B and SV11W do something similar at set level — all 156 Unova Pokémon appear as AR or better, with a new BWR rarity for Zekrom ex and Reshiram ex, and the Deluxe boxes restructure the pack entirely at 35 cards per pack with a guaranteed AR or better. None of that is luck. It is pack architecture, printed on the box, and it is the real reason openers drift Japanese."
        ]
      },
      {
        "h": "The decision table",
        "paragraphs": [
          "Here is the whole argument on one screen. Where we can measure it with our own prices, we show the number. Where it is a property of the product rather than a price, we label it plainly instead of dressing it up as data."
        ],
        "table": {
          "head": [
            "",
            "Japanese",
            "English"
          ],
          "rows": [
            [
              "Cost per pack (OP-17, same set, prices as of Oct 20, 2026)",
              "$4.21",
              "$6.40"
            ],
            [
              "Print quality and centering",
              "Generally better",
              "Standard print-run quality"
            ],
            [
              "Pull experience",
              "Special sets restructure the pack — M6a: every card holo, a Pikachu guaranteed in every pack",
              "Standard pack structure"
            ],
            [
              "Resale buyer pool (sealed)",
              "Smaller",
              "Larger"
            ],
            [
              "Tournament legality",
              "Not legal in English-language events",
              "Legal"
            ],
            [
              "Release timing (OP-17)",
              "First — Aug 22, 2026",
              "Later — Aug 28, 2026"
            ]
          ]
        }
      },
      {
        "h": "Who should NOT buy each side",
        "paragraphs": [
          "Do not buy Japanese if you play, or might ever play, in English-language tournaments — the cards are not legal there, and no discount repairs that. Do not buy Japanese if your exit plan is a fast resale; the sealed buyer pool is smaller, which means a slower sale when you need one. And do not buy Japanese expecting English card text — it sounds obvious, but the card text is Japanese, and for collectors who read their cards, that is a real and legitimate reason to walk away.",
          "Do not buy English if you are a pure opener on a budget. In the one same-set comparison we can run on our own shelves, you pay 52% more per pack, and across a single OP-17 box that is $52.62 more ($153.69 − $101.07) for the same 24 packs — money an opener never gets back in any form. Do not buy English if grading is the plan and centering is your bottleneck; Japanese copies generally start cleaner. And do not buy English out of the belief that it is the 'real' version. It is the same official product printed for a different market, not a more authentic one."
        ]
      },
      {
        "h": "The risk layer: what goes wrong, and the recovery",
        "paragraphs": [
          "The most expensive mistake is buying Japanese to play. There is no recovery at the table — the cards cannot be registered for an English-language event, end of discussion. The recovery is financial only: the cards still hold their place in a collection and can be sold into the Japanese-card collector pool, and you buy English for the deck. What the mistake costs you is the spread between the two and the weeks lost, which is why the legality check belongs before payment, not after the box is open.",
          "The quieter mistake runs the other way: buying English to open, on a budget, out of habit. Nothing goes visibly wrong — the box opens fine — but you paid $2.19 more per pack for the privilege, and the habit compounds across every box in a year. The recovery is simply to move the opening habit to Japanese and reserve English purchases for play and sealed holding, where its advantages are real. The third risk is shared by both sides: prices move. Every number in this article is stamped October 20, 2026, and Japanese special sets in particular do not sit still. The protection is the method, not the numbers — re-run the per-pack division with the prices in front of you on the day you buy, and the conclusion updates itself."
        ]
      },
      {
        "h": "Context: Japan first — and what 'first' is actually worth",
        "paragraphs": [
          "The release gap between Japan and the rest of the world is real but shrinking, and it is worth being precise about it. OP-17 released in Japan on August 22, 2026, and in English on August 28, 2026 — six days, not six months. M6a broke the pattern entirely, releasing worldwide on the same day, September 16, 2026. So the old assumption that buying Japanese means playing with the set months before everyone else is mostly nostalgia now. What Japanese still buys you is the Japanese product itself: the print quality, the pack structure, and the lower per-pack cost where it exists.",
          "Legality deserves the same precision. Japanese cards are legal in Japanese events. They are not legal in English-language events. That is a rule about the language printed on the card, not a judgment about the card — the same cardboard, welcomed at one tournament desk and turned away at another. Know which desk you play at before you choose a language, because it is the one factor in this entire comparison that no price can negotiate with."
        ]
      },
      {
        "checklist": [
          "Write down the job: opening, playing, grading, or holding sealed. If the job is playing in English-language events, stop here and buy English.",
          "Find the same set in both languages and divide each box price by its pack count. Compare cost per pack — never box sticker against box sticker.",
          "If grading matters, weight print quality: Japanese copies generally start cleaner and better centered.",
          "If a sealed resale is even a possibility, weight the buyer pool: English has the larger one.",
          "Check the date on any price you were quoted — ours above are as of October 20, 2026 — and re-run the division with today's prices before you commit."
        ],
        "h": "The action layer: decide in five checks",
        "paragraphs": [
          "Run these in order before you pay for either language. Most buyers only need the first one."
        ]
      }
    ],
    "slug": "japanese-vs-english-pokemon-cards-which-to-buy",
    "takeaway": [
      "Open Japanese, play English, resell English. That is the short version, and it survives the math: in the one same-set comparison we can run on our own shelves, English costs 52% more per pack — money an opener never recovers and a player has no choice but to spend. Neither language is the better product in the abstract. Each is better at a job.",
      "So the real mistake was never picking the wrong language. It is buying one language to do the other language's job — Japanese cards carried hopefully toward a tournament desk, or English boxes ripped open at a 52% per-pack premium for cards that were never going to be played. Name the job first. The language chooses itself.",
      "Two follow-ups worth your time before you buy: if the cards you open might one day be graded, read [whether PSA grading Japanese cards is worth it](/blog/psa-grading-japanese-cards-worth-it/) — condition is where Japanese copies earn their keep. And if resale value is doing any work in your decision, [our honest take on Japanese cards as an investment](/blog/are-japanese-pokemon-cards-a-good-investment/) separates the hobby math from the investment math. Not sure how the boxes you're comparing are even built? [How many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) has every count that matters.",
      "Whichever language you choose, the next decision arrives with the box: [should you open it or keep it sealed?](/blog/should-you-open-or-keep-sealed-booster-box/) — the framework there applies to Japanese and English product alike.",
      "If Japanese wins your decision, two reads follow naturally: [how to read Japanese Pokémon cards](/blog/how-to-read-japanese-pokemon-cards/) — the skill is smaller than it looks — and [the best-value Japanese booster boxes](/blog/best-value-japanese-pokemon-booster-boxes/), the full price ladder from $58.85 up."
    ]
  },
  "m6a-30th-celebration-buyers-guide": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "20 packs of 6 cards — 120 cards per box. Every card is holographic, the base set is 103 cards with secret rares above it, and one of the set's 30 Pikachu cards is guaranteed in every pack.",
        "q": "How many packs and cards come in an M6a 30th Celebration box?"
      },
      {
        "a": "Structure. At $207.50 as of October 24, 2026, the math is $207.50 ÷ 120 cards = $1.73 per card. The all-holo build, the guaranteed Pikachu per pack, the new FUR rarity, and the set's one-time 30th anniversary identity all sit inside that number. It explains the premium; it does not guarantee the contents resell for more.",
        "q": "Why is M6a the most expensive Japanese box per card?"
      },
      {
        "a": "Both are defensible; drifting between them is not. Open it if the 120 holographic cards and the chase are the point. Keep it sealed if the dated anniversary artifact is the point — and store it properly from day one. Decide before purchase, because opening is the one decision that cannot be reversed.",
        "q": "Should I open M6a or keep it sealed?"
      }
    ],
    "h1": "M6a 30th Celebration: The Complete Buyer's Guide",
    "intro": [
      "Short answer first. M6a 30th Celebration is the Pokémon TCG's 30th anniversary set, released worldwide on September 16, 2026, and it breaks the normal set template on purpose: 20 packs per box, 6 cards per pack, and every one of the 120 cards is holographic. At the Warehouse the box is $207.50 as of October 24, 2026 — $10.38 a pack, $1.73 a card, the highest per-card price of any Japanese box in the store. This guide covers what is actually in the set, runs the money math in the open, and gives a straight verdict on who the premium is worth paying for.",
      "The set is built around three hooks. There are 30 different Pikachu cards in it, with one Pikachu guaranteed in every pack. The headline cards are Mew ex and Mewtwo ex, drawn in an art collaboration with YOSHIROTTEN. And a Classic Collection subset reprints iconic cards from across the game's history. If that sounds like a celebration product rather than a workhorse set, that is exactly what it is — and it is priced like one."
    ],
    "metaDescription": "M6a 30th Celebration buyer's guide: 20 packs, 120 all-holo cards, 30 Pikachu, Mew ex by YOSHIROTTEN — and the $207.50 box math, exposed.",
    "metaTitle": "M6a 30th Celebration Buyer's Guide: Price & Full Math",
    "readMinutes": 9,
    "sections": [
      {
        "h": "What is in the set: the verified structure",
        "paragraphs": [
          "Start with the skeleton. An M6a booster box holds 20 packs of 6 cards, 120 cards in total — the pack-count context for how that compares with other Japanese boxes is in [the booster box pack-count guide](/blog/how-many-packs-in-a-booster-box/). The base set runs to 103 cards, with secret rares sitting above that number. The structural break from a normal set is the finish: there are no plain cards in M6a. Every card in every pack is holographic, which changes both the opening experience and the economics of completing the set.",
          "M6a also debuts a new rarity: FUR, short for Futuristic Rare. Where it sits in the pull hierarchy and how to read the symbols on Japanese cards generally is covered in [the Japanese rarity symbols guide](/blog/japanese-pokemon-rarity-symbols-explained/). The full set overview lives on [the M6a 30th Celebration set hub](/sets/m6a-30th-celebration/), and the box itself is [the M6a 30th Celebration booster box](/product/m6a-30th-celebration-booster-box-japanese-poke-mon-tcg/).",
          "The Classic Collection subset deserves its own sentence: it reprints iconic cards from earlier eras of the game inside a modern anniversary frame. For long-time collectors that subset is the emotional core of the set. For everyone else it is a reminder that M6a was designed as a milestone product first and a standard expansion second."
        ]
      },
      {
        "h": "The money layer: what $207.50 actually buys",
        "math": [
          "Warehouse box price, as of October 24, 2026: $207.50",
          "Per pack: $207.50 ÷ 20 packs = $10.38",
          "Per card: $207.50 ÷ 120 cards = $1.73",
          "Japanese domestic MSRP: ¥7,200 per box (Japan list price, before import costs)"
        ],
        "paragraphs": [
          "The math is simple and worth staring at. At $1.73 per card, M6a is the most expensive Japanese box in the store on a per-card basis — and that is before a single card is pulled. The Japanese MSRP of ¥7,200 is the domestic list price in Japan; an imported box on a shelf outside Japan carries shipping, distribution, and handling on top of it, which is why shelf prices and MSRP never match. Neither number is a promise about what the contents are worth after opening.",
          "What the premium buys is structure, not certainty: an all-holo box with a guaranteed Pikachu in every pack and an anniversary identity that a normal set cannot copy. Whether sealed product at a premium behaves like an asset is a separate question, and [the Japanese cards investment guide](/blog/are-japanese-pokemon-cards-a-good-investment/) works through it without the hype. The other decision the price forces — rip it or keep it sealed — has its own framework in [should you open or keep it sealed?](/blog/should-you-open-or-keep-sealed-booster-box/)"
        ]
      },
      {
        "h": "Why the structure argues for a premium — and where the argument stops",
        "paragraphs": [
          "Three structural facts support a premium conversation. First, the all-holo build removes the bulk problem: a normal box is mostly plain commons whose individual value rounds to nothing, while every M6a card at least carries a holographic finish. Second, the Pikachu guarantee is real arithmetic — one per pack means a floor of 20 Pikachu cards in every box, spread across 30 different designs. Third, anniversary sets are one-time identities: there will never be another 30th anniversary set, and the September 16, 2026 release date is fixed history.",
          "Here is where the argument stops. A higher floor is not a higher ceiling. The guaranteed Pikachu are not the chase Pikachu, the all-holo finish does not make the secret rares any easier to pull, and a premium paid at retail is a premium the contents have to earn back before the box is 'worth it' in resale terms. The Warehouse sells M6a as a celebration product with a defensible structure — not as a value lock, because no sealed box is one."
        ],
        "table": {
          "head": [
            "Buyer",
            "What M6a gives",
            "The honest catch"
          ],
          "rows": [
            [
              "Pikachu collector",
              "30 different Pikachu cards; one guaranteed in every pack",
              "Guaranteed does not mean equal — the chase Pikachu still sits in the rare slots"
            ],
            [
              "Set builder",
              "103 base cards, all holographic, plus secret rares above the base set",
              "All-holo means there is no cheap bulk route to finishing the set"
            ],
            [
              "Rip-for-fun buyer",
              "Every pack is a hit reel — no dead packs of plain commons",
              "$10.38 a pack is the most expensive rip in the store"
            ],
            [
              "Sealed holder",
              "An anniversary identity with a fixed release date: September 16, 2026",
              "The premium is paid in full on day one — see the risk section below"
            ]
          ]
        }
      },
      {
        "h": "How to buy M6a well",
        "paragraphs": [
          "Decide the box's job before paying for it. If it is for opening, set the rip budget at the box price and treat anything pulled above it as a bonus, not an expectation. If it is for holding sealed, read [the open-or-sealed framework](/blog/should-you-open-or-keep-sealed-booster-box/) first and store it properly from day one — the sealed premium only survives if the box does.",
          "Check the physical box on arrival: shrink intact, corners square, no reseal signs. The checks take two minutes and are laid out in [how to tell if a booster box is resealed](/blog/how-to-tell-if-a-booster-box-is-resealed/). Finally, place M6a in the calendar: it landed September 16, 2026, and [the release calendar](/release-calendar/) shows what is coming next — anniversary money spent here is money not spent on the next set, so sequence the purchases on purpose."
        ]
      },
      {
        "h": "Risk, failure modes, and recovery",
        "note": "Warehouse Note: anniversary stock gets the shelf treatment at the Warehouse — boxes are checked for shrink integrity when they arrive, stored flat and out of direct light, and never stacked under cases. A premium box that arrives crushed is a premium nobody should pay, so condition checks happen before a box is listed, not after a complaint. The full storage method is in [how to store sealed booster boxes](/blog/how-to-store-sealed-booster-boxes/).",
        "paragraphs": [
          "The most common failure is variance disappointment: a buyer opens a $207.50 box expecting the chase Mew ex or the rarest Pikachu, pulls neither, and feels the box 'failed'. The box did not fail — the expectation did. With 103 base cards plus secret rares above them, no single box can deliver the set's headline cards on demand. The recovery is arithmetic, not another box: price the specific single you wanted, compare it with another $207.50 of variance, and buy the single when it costs less than the gamble.",
          "The second failure mode is premium compression on sealed boxes: if supply stays plentiful or buying attention moves to the next release, the sealed premium can narrow. Recovery depends on which buyer you were. Holders who bought the anniversary identity can simply keep holding — the identity does not expire. Buyers who wanted the cards should open the box and enjoy the 120 holographic cards they actually paid for, rather than watching a price chart."
        ]
      },
      {
        "h": "Context: where M6a sits in the hobby",
        "paragraphs": [
          "Thirty years in, the Pokémon TCG marks its anniversaries with product that doubles as a museum. The Classic Collection reprints are the clearest signal: iconic cards from the game's history, reissued so a new collector can hold the lineage in one set. The all-holo build pushes the same idea further — a set where even the 'ordinary' cards are presentation pieces. Readers who know [what a god pack is](/blog/what-is-a-god-pack-japanese-pokemon/) will recognize the impulse: M6a applies a mild version of that all-hit logic to an entire set rather than a single rare pack.",
          "The FUR rarity is the forward-looking piece. New rarities exist to give future sets a new ceiling, and learning to read this one now — its look, its placement above the base 103 — is part of the set's value to collectors who stay in the hobby. M6a is a snapshot of where the game has been and a first look at where its rarity ladder is going."
        ]
      },
      {
        "h": "Who M6a is NOT for",
        "paragraphs": [
          "Not for buyers expecting normal pull economics: at $10.38 a pack there is no cheap rip here, and the all-holo floor does not convert into resale guarantees. Not for players who need playsets of specific cards — singles are the rational route, always. And not for anyone whose plan requires the box to be worth more later; that is a hope, not a plan, and [the investment guide](/blog/are-japanese-pokemon-cards-a-good-investment/) explains the difference in full."
        ]
      },
      {
        "checklist": [
          "Budget set at the full box price — $207.50 as of October 24, 2026 — with the rip-or-hold decision made first",
          "Per-card math understood: $1.73 a card, the store's highest, paid for structure not certainty",
          "Target identified: a specific chase card, the Pikachu run, the Classic Collection, or a sealed hold",
          "Physical box verified on arrival: shrink intact, corners square, no reseal signs",
          "Singles priced for your chase card, so the box is a choice rather than a default",
          "Storage ready if holding sealed: flat, dark, dry, off the floor",
          "Next releases checked on the calendar, so this purchase fits the year's sequence"
        ],
        "h": "Before you buy: the M6a checklist",
        "paragraphs": [
          "Run these checks before the money moves. If a box fails the physical checks, everything else on this list is irrelevant."
        ]
      }
    ],
    "slug": "m6a-30th-celebration-buyers-guide",
    "takeaway": [
      "M6a 30th Celebration earns its premium conversation honestly: 120 holographic cards, a Pikachu in every pack, Mew ex and Mewtwo ex in YOSHIROTTEN art, a new rarity, and thirty years of history in the Classic Collection. At $207.50 a box — $1.73 a card, as of October 24, 2026 — it is the most expensive Japanese box in the store per card, and this guide has not hidden that number once.",
      "Buy it as the celebration it is: to open and enjoy, to chase Pikachu with a floor under every pack, or to hold as a dated anniversary artifact. Do not buy it as a promise. The Warehouse stocks it proudly and describes it plainly — both, in this hobby, are the point."
    ]
  },
  "one-piece-card-game-colors-explained": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "No. Your deck may only contain cards that match your Leader's colors. A single-color Leader gives you a one-color pool; a Leader printed with two colors opens exactly those two. That restriction is the whole reason color choice is also a budget choice — every purchase either belongs to your pool or it does not.",
        "q": "Can I put cards of any color in my One Piece deck?"
      },
      {
        "a": "The honest answer is the one whose plan you understand fastest. Red is the usual recommendation because attacking early teaches the game's timing quickly, and green's rest-and-attack plan is similarly readable. Purple's DON!! accounting and yellow's life management are the two identities beginners most often misjudge in their first games — not because they are weak, but because the plan is harder to see.",
        "q": "Which One Piece color is best for a complete beginner?"
      },
      {
        "a": "Yes — the six colors and their identities are identical in both languages. What differs is timing and price: OP-17 released in Japan on August 22, 2026 and in English on August 28, 2026, and as of October 21, 2026 the Japanese OP-17 box is $101.07 at the Warehouse against $153.69 for the English box. Your local scene's language matters more than the color system, which never changes.",
        "q": "Are the colors the same in Japanese and English One Piece cards?"
      }
    ],
    "h1": "One Piece Card Game Colors Explained: What Each Color Does and How to Pick Yours",
    "intro": [
      "Short answer first: the One Piece Card Game has six colors — red, green, blue, purple, black, and yellow — and color is not decoration. Your Leader's colors decide which cards you are allowed to build with, and each color wins games in a different way. Red rushes. Green controls the board by resting characters. Blue removes threats and draws cards. Purple bends the DON!! economy. Black deletes characters by cost. Yellow plays with life cards and Trigger effects. Pick the color whose way of winning matches how you like to play, and the game gets cheaper and more enjoyable at the same time.",
      "This guide is for new and returning players choosing a first color or a first Leader, and for collectors opening [Japanese One Piece boxes](/one-piece-cards/) who want to understand what they are pulling and why some pulls only fit certain decks. It is not a tier list. It will not tell you which color is strongest this month, because that answer changes with every set and anyone selling you a permanent one is selling you something. What does not change is what each color is built to do. That identity has stayed stable across the game's life, and it is what this page explains."
    ],
    "metaDescription": "All six One Piece Card Game colors explained: what each color does, how it wins, what it struggles against, and how to pick your first color on a budget.",
    "metaTitle": "One Piece Card Game Colors Explained: All Six Colors",
    "readMinutes": 10,
    "sections": [
      {
        "h": "The six colors at a glance",
        "paragraphs": [
          "Here is the whole system on one screen. Read the 'wins by' column as a tendency, not a promise: new printings, awkward matchups, and the current card pool bend these lines every set. But a red deck that wins slowly is the exception, and a yellow deck that wins without ever touching its life cards is rarer still. When you sit down across from a Leader, this table is your first read on what kind of game you are about to play."
        ],
        "table": {
          "head": [
            "Color",
            "Identity in one line",
            "Wins by",
            "Tends to struggle against"
          ],
          "rows": [
            [
              "Red",
              "Aggressive pressure with Rush attackers",
              "Attacking early and often, before defenses are set up",
              "Removal-heavy decks that survive the first waves"
            ],
            [
              "Green",
              "Rest mechanics and board control",
              "Resting opposing characters, then attacking or removing them while they are vulnerable",
              "Fast decks that go under its setup, and bounce effects"
            ],
            [
              "Blue",
              "Bounce, removal, and card draw",
              "Returning characters to hand or deck while outdrawing the opponent",
              "Aggro that rebuilds cheaply after every bounce"
            ],
            [
              "Purple",
              "DON!! ramp and DON!!-powered effects",
              "Gaining extra DON!! early, then spending the surplus on oversized plays",
              "Early pressure that lands before the ramp comes online"
            ],
            [
              "Black",
              "Cost-based removal and discard pressure",
              "KO-ing characters by cost thresholds and shrinking the opponent's options",
              "Decks whose key characters sit above its cost thresholds"
            ],
            [
              "Yellow",
              "Life manipulation and Trigger effects",
              "Turning life cards into a resource and punishing attacks with Triggers",
              "Decks that finish fast, before the life engine starts to matter"
            ]
          ]
        }
      },
      {
        "h": "How each color actually plays",
        "paragraphs": [
          "Red is the color of the first punch. Its signature mechanic is Rush — characters that can attack the turn they are played — backed by cheap attackers and power boosts that turn every turn into a question the opponent has to answer right now. Red decks run out of cards before they run out of aggression, and good red players win on the turns where the opponent is still setting up. If your instinct in any card game is to attack first and read the board later, red is home.",
          "Green plays the board like a chess problem. Its effects rest opposing characters — turning them sideways so they cannot block or attack — and then punish them while they are exposed, either by attacking into them or removing them with follow-up effects. Green also rests and re-stands its own cards for advantage. It rewards players who plan two turns ahead and loses to opponents who simply go underneath it before the machinery starts turning.",
          "Blue is the color of answers and information. It bounces characters back to the hand or the bottom of the deck — removal that ignores how big the character is — and it draws more cards than any other color while doing it, often with Navy-themed effects. A blue game plan is attrition: answer everything, keep the hand full, and let the opponent run out of threats first. Blue struggles when the bounced cards are cheap enough to just come back next turn.",
          "Purple is built around DON!!, the resource cards you attach to characters and Leaders for power. Purple ramps — putting extra DON!! into play ahead of schedule — and then pays that surplus back out for effects that ask you to return DON!! to the DON!! deck. The result is a deck that plays bigger cards earlier than anyone else at the table. The weakness is the mirror image of blue's: purple needs a few turns to build its economy, and fast decks try to end the game before the big turns arrive.",
          "Black removes characters by cost. Its effects KO anything at or below a cost threshold, and black decks work to lower opposing characters' costs until they fall inside the kill zone, while discard effects shrink the opponent's hand at the same time. It is a grinding, unglamorous color that asks one question all game: how much does your best character cost? Characters printed above the thresholds are black's honest problem, and black players build around that ceiling rather than pretending it is not there.",
          "Yellow treats your life cards as a second hand. Its characters and events gain power from manipulating life — taking it, adding to it, looking at it — and its Trigger effects fire when a life card is flipped by an attack, turning the opponent's aggression into your card advantage. Yellow games swing late: a yellow player at two life is not losing the way other colors are losing at two life. If you enjoy comebacks and defensive traps more than clean aggression, yellow is your color."
        ]
      },
      {
        "h": "Choosing your first color: match the plan, not the hype",
        "paragraphs": [
          "The most common beginner mistake is choosing a color because it won a recent event. Tournament results describe what the best players in the room did with a full card pool and weeks of practice; they say very little about what your first fifty games will feel like. Choose instead by plan. Read the left column below honestly — pick the row that sounds like the games you already enjoy in other hobbies — and start there. A color you understand beats a stronger color you are imitating, because you will see your own mistakes clearly and fix them faster.",
          "One structural fact matters before you buy anything: your Leader's colors lock your card pool. A red Leader builds only from red cards (a dual-color Leader opens exactly its two colors). That means your first Leader choice is also a purchasing decision — every box you open and every single you buy either feeds that pool or does not. It is also why the [where-to-buy guide for One Piece cards](/guides/where-to-buy-one-piece-cards-online/) matters more for this game than for most: buying into the wrong pool is the expensive version of this lesson."
        ],
        "table": {
          "head": [
            "If you like...",
            "Start with",
            "Because"
          ],
          "rows": [
            [
              "Winning fast and learning by attacking",
              "Red",
              "The plan is honest: attack early, ask questions, end games before they get complicated"
            ],
            [
              "Controlling the board and solving puzzles",
              "Green or Blue",
              "Both reward planned turns — green by resting threats, blue by bouncing and outdrawing them"
            ],
            [
              "Big turns and resource engines",
              "Purple",
              "Ramping extra DON!! and cashing it in for oversized plays is the whole identity"
            ],
            [
              "Removing threats and grinding games out",
              "Black",
              "Cost-based KO effects and discard pressure win long games of attrition"
            ],
            [
              "Comebacks and defensive tricks",
              "Yellow",
              "Life manipulation and Triggers turn the opponent's attacks into your resources"
            ]
          ]
        }
      },
      {
        "h": "The money layer: color is a budget decision",
        "note": "The first question new players ask at the Warehouse is rarely 'which color is strongest?' It is 'which color does my favorite character play?' The honest answer takes a minute: popular characters appear as Leaders in more than one color across different sets, so the character does not pick your color for you. Your preferred way of winning does. Players who accept that in week one spend noticeably less in month two.",
        "paragraphs": [
          "A single-color deck is cheaper to build than a two-color deck, for a simple reason: every card you buy is competing for slots in one pool instead of two, and you are not paying the premium that popular cross-color staples carry. Whatever color you choose, learn the shape of the product before you open it — a standard One Piece booster box holds 24 packs, and [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) is worth reading before you compare box prices anywhere, because a cheap box with fewer packs is not cheap.",
          "At the Warehouse, current Japanese prices as of October 21, 2026 make the point concretely. The [OP-18 The Dominance of God Japanese booster box](/product/one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game/) is on pre-order at $70 — OP-18 releases November 20, 2026, with Yoshitaka Amano art as its headline — while the OP-17 Japanese box sits at $101.07 and the English OP-17 box at $153.69. Same hobby, same 24-pack shape, very different cost of feeding your pool. Whether a case beats single boxes is its own question, and we ran those numbers in [sealed case vs booster box: the math](/blog/sealed-case-vs-booster-box-the-math/)."
        ]
      },
      {
        "h": "Japan gets the cards first: the context layer",
        "paragraphs": [
          "One Piece releases in Japanese first and in English shortly after, and the gap changes what each card pool looks like at any given moment. [OP-17 The World's Strongest Warriors](/sets/op-17-worlds-strongest-warriors/) — the Elbaf arc set, with the Four Emperors appearing as Leaders and the debut of Rocks D. Xebec — released in Japan on August 22, 2026 and in English on August 28, 2026. Six days is short, but it means Japanese singles, Japanese prices, and Japanese tournament results exist before the English pool plays a single game. English players effectively get to preview their format; Japanese players pay early-adopter prices for the privilege of going first.",
          "That rhythm continues into the next set: [OP-18 The Dominance of God](/sets/op-18-the-dominance-of-god/) arrives November 20, 2026. If you play in English, the practical move is to watch what the Japanese pool does with a new set during the gap, then buy with information instead of guesses — the [OP-17 English booster box](/product/op-17-the-world-s-strongest-warriors-booster-box-english-one-piece-card/) and its Japanese counterpart are the same set at $153.69 versus $101.07 as of October 21, 2026, and knowing what the colors actually want from the set is how you decide which side of that gap your money belongs on. The [release calendar](/release-calendar/) tracks every confirmed date so you can plan purchases around the gaps instead of being surprised by them."
        ]
      },
      {
        "h": "Where color-picking goes wrong, and how to recover",
        "paragraphs": [
          "The failure mode we see most: a player buys into whichever color just topped an event, discovers they hate how it plays — the ramp player who cannot stand slow starts, the control player bored by red's directness — and now owns a pool they do not want to play. The cards are fine. The match between player and plan is broken, and no new purchase fixes that, because the next color will be chosen the same way.",
          "Recovery is cheap if you do it before the expensive version of the mistake. Test before you buy: proxy the deck, borrow a friend's build, or play casual games with stand-ins until the plan either clicks or clearly does not. Give a color twenty games, not two. If it still fights you, trade out of the pool while the cards are current and somebody else wants them — a pool sold early funds most of the next one, while a pool that sits in a binder for a year funds a fraction of it. And if you are pre-ordering into a new set to feed a color, read [pre-order or wait](/blog/preorder-japanese-booster-box-or-wait/) first: the gap between Japanese and English releases means the wait option is real in this game, and patience is sometimes the entire discount."
        ]
      },
      {
        "checklist": [
          "Name the way you like to win (fast attacks, control, big turns, removal, comebacks) before naming any color",
          "Match that plan to one color from the table above — not to a tournament result",
          "Check your chosen Leader's colors: that is your entire legal card pool",
          "Confirm the box shape before comparing prices (24 packs is the One Piece standard)",
          "Decide Japanese or English pool using the release gap and your local scene, not habit",
          "Proxy or borrow the deck for at least a few casual games before buying singles",
          "Set a first-month budget for one pool only — do not split it across two colors"
        ],
        "h": "Your first-color checklist",
        "paragraphs": [
          "Run through this before your first serious purchase. It takes ten minutes and it is the difference between a pool you grow and a pool you abandon."
        ]
      }
    ],
    "slug": "one-piece-card-game-colors-explained",
    "takeaway": [
      "Color in the One Piece Card Game is a plan, a card pool, and a budget, all chosen at once. Red attacks, green rests, blue bounces and draws, purple ramps DON!!, black removes by cost, and yellow weaponizes its own life total. None of those identities is going anywhere, which is why they — and not this month's results — are the right basis for your first purchase.",
      "Start with the color whose plan you already enjoy, feed it from one pool, and let the Japanese-first release rhythm work for you instead of against you. Browse the current [One Piece range](/one-piece-cards/) when you are ready, and bring us your playstyle, not a decklist you copied — the Warehouse would rather sell you the right color once than the wrong color twice.",
      "Picked your color? [How to build your first One Piece deck](/blog/one-piece-how-to-build-your-first-deck/) turns it into a legal 50-card list — skeleton, budget table, and the testing loop that saves you from buying the wrong singles.",
      "Still deciding which game gets your first box? [Which TCG should you start?](/blog/which-tcg-should-you-start/) puts One Piece beside Pokémon and Dragon Ball Fusion World with the real entry prices on the table."
    ]
  },
  "one-piece-how-to-build-your-first-deck": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Only if your Leader carries both colors. The Leader's color identity is the whole rule: a single-color Leader locks you to that one color, while a two-color Leader opens both pools. Either way, a card whose color does not appear on your Leader cannot go in the 50.",
        "q": "Can my deck use cards from two colors?"
      },
      {
        "a": "No. A box is an upgrade pool — 24 packs of random cards spread across the set's colors and rarities. It will strengthen a starter deck and hand you trade stock, but the specific playsets your Leader needs come from singles, bought after testing. Budget for starter, then box, then a short singles list, in that order.",
        "q": "Is one booster box enough to build a complete deck?"
      },
      {
        "a": "Exactly 10, always — the DON!! deck is fixed at 10 and sits separate from your 50. Starter decks include them, and they are the one part of the build you never tune: same ten slots, every deck, every color.",
        "q": "How many DON!! cards do I need, and where do I get them?"
      }
    ],
    "h1": "How to Build Your First One Piece Deck (Without Buying the Wrong Cards First)",
    "intro": [
      "Build in this order and you will not waste money: choose a Leader, let its color lock your card pool, fill exactly 50 main-deck slots inside a proven allocation, add exactly 10 DON!! cards, and only then chase the expensive pieces. Every One Piece deck follows the same skeleton — 1 Leader, a 50-card main deck, a 10-card DON!! deck, no more than 4 copies of any single card number, and colors that match the Leader. The players who overspend are almost never bad at the game. They bought cards before they had a skeleton to put them in.",
      "This guide is for new players holding a starter deck, a booster box, or a pile of pulls and wondering how it becomes a deck. It is not for experienced players tuning for a regional — you already know your ratios, and the framework below is a starting point, not a ceiling. It is also not a shopping list. If a guide tells you the exact 50 cards to buy before you have played a single game, it is selling you someone else's deck."
    ],
    "metaDescription": "Your first One Piece deck, built in order: pick a Leader, respect the 50 + 10 structure, allocate the 50, and test before you spend.",
    "metaTitle": "Build Your First One Piece Deck: A Beginner's Framework",
    "readMinutes": 10,
    "sections": [
      {
        "checklist": [
          "1 Leader card, chosen first",
          "Main deck: exactly 50 cards",
          "DON!! deck: exactly 10 cards, kept separate from the 50",
          "Max 4 copies of any card number",
          "Every card's color matches the Leader's color(s)"
        ],
        "h": "The skeleton: five numbers that never change",
        "paragraphs": [
          "Leader first. Your Leader card sits outside the 50 and defines everything: its color (or colors) is the only color pool you may build from, and its life total and effect set the tempo of your whole game plan.",
          "Main deck: exactly 50 cards. Not 49 for luck, not 51 because you could not make the last cut. Exactly 50 — the game will not let you register anything else. The DON!! deck is exactly 10 DON!! cards, separate from the 50: they power every play you make, one fresh DON!! arriving per turn, and [the six-color guide](/blog/one-piece-card-game-colors-explained/) explains how each color spends them differently.",
          "The last rule is the 4-copy limit: no more than 4 copies of the same card number anywhere in the 50. Different printings of the same card number still count as the same card — check the number printed on the card, not the artwork. Sleeve those five numbers into your head before you buy a single card and half of all beginner mistakes never happen."
        ]
      },
      {
        "h": "Pick your Leader by color, not by hype",
        "note": "The first-deck question we hear most is 'which Leader is the strongest?' The honest answer from the Warehouse: the strongest Leader is the one whose color you enjoy, because a first deck you stop playing after a week teaches you nothing. Pick the color first. The Leader follows.",
        "paragraphs": [
          "The six colors play genuinely different games. Red attacks early and often, built around Rush. Green rests opposing characters and controls the board. Blue bounces threats back to hand or deck and draws cards. Purple manipulates DON!!, ramping ahead of the normal curve. Black removes characters by cost thresholds. Yellow works with your life cards and Trigger effects to survive and swing back. The full breakdown is in [our One Piece colors guide](/blog/one-piece-card-game-colors-explained/) — read it before you choose, because the Leader locks the pool: a red Leader cannot run a single green card.",
          "Choose the color whose plan sounds like a game you want to play fifty times, not the Leader topping this month's tournament reports. Tournament results reflect practiced pilots with complete collections playing a field they prepared for. Your first deck's job is different: teach you the game while staying fun enough that you keep playing it long enough to get good."
        ]
      },
      {
        "h": "Allocating the 50: a starting framework, not a law",
        "paragraphs": [
          "Once the skeleton is fixed, the 50 slots divide by job. The bands below are a starting framework — the allocation most functional beginner decks land near — not a meta law and not a tournament recipe. Counts overlap on purpose: most blockers are also early-game bodies, and most mid-game threats double as attackers, so the bands describe roles your cards cover rather than separate piles that must sum perfectly.",
          "If your counts land far outside a band, treat it as a question to answer, not automatically a mistake. Zero blockers means your Leader eats every attack. Ten finishers means opening hands full of cards you cannot play until your DON!! count climbs. The bands exist to make those problems visible on paper before they cost you games at the table."
        ],
        "table": {
          "head": [
            "Slot",
            "Starting band",
            "Its job"
          ],
          "rows": [
            [
              "Early-game bodies (cost 1–2)",
              "10–14",
              "Play something every early turn; trade up or chip damage"
            ],
            [
              "Mid-game threats (cost 3–5)",
              "14–18",
              "The working core — pressure, board presence, removal targets"
            ],
            [
              "Blockers",
              "8–12",
              "Protect the Leader and key characters (usually also bodies)"
            ],
            [
              "Events & counters",
              "4–8",
              "Answers and combat tricks characters cannot provide"
            ],
            [
              "Top-end finishers (cost 7+)",
              "4–6",
              "Close the game once your DON!! count is high"
            ]
          ]
        }
      },
      {
        "h": "Where the cards come from: starter first, box second, singles last",
        "math": [
          "OP-18 box: $70 ÷ 24 packs = $2.92 per pack (as of October 21, 2026)",
          "OP-18 case: $755 ÷ 12 boxes = $62.92 per box = $2.62 per pack",
          "Singles come last: only the slots your test games proved are weak"
        ],
        "paragraphs": [
          "The cheapest functional base is a starter deck: it arrives as a legal, color-coherent deck with its DON!! cards included, built to be played out of the box. Your first upgrade pool should widen that base, not replace it — which is what a booster box is for. A box of [OP-18 The Dominance of God](/sets/op-18-the-dominance-of-god/) is on pre-order at the Warehouse now, and its 24 packs give you a spread of the newest set to test against your starter's frame. If you are unsure what 24 packs actually means in cards, [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) lays out the counts for every box we stock.",
          "Run the money honestly. As of October 21, 2026, the [OP-18 Japanese booster box](/product/one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game/) is $70 for 24 packs — $2.92 a pack. That is a fair price for an upgrade pool. It is not a deck in a box: pulls are random across the set's colors and rarities, and no single box guarantees the specific cards your Leader needs. Anyone who tells you one box completes a deck is selling you the box.",
          "So the order is: starter deck for the legal base, one box for the upgrade pool and the fun of opening, then singles for the exact missing pieces — bought only after testing shows you which pieces are actually missing. [Where to buy One Piece cards online](/guides/where-to-buy-one-piece-cards-online/) covers the singles route, and if you are timing a box purchase around a release, the [pre-order timing guide](/blog/preorder-japanese-booster-box-or-wait/) explains when waiting saves money and when it quietly costs you the set."
        ]
      },
      {
        "h": "Three ways to fund the build",
        "paragraphs": [
          "Same skeleton, three budgets. All three produce a legal deck; they differ in what your first month of games feels like and how much a wrong guess costs you. Pick by the experience you want, not by the ceiling you imagine."
        ],
        "table": {
          "head": [
            "Route",
            "Cost posture",
            "Competitiveness out of the gate",
            "Best for"
          ],
          "rows": [
            [
              "Starter deck only",
              "Lowest — one purchase, fully legal deck",
              "Casual-ready; will lose to tuned decks",
              "Learning the game and your color"
            ],
            [
              "Starter + one booster box",
              "Moderate — $70 for OP-18 at current pre-order pricing",
              "Noticeably stronger; real upgrades plus trade stock",
              "Most new players — the route we recommend"
            ],
            [
              "Singles-only build",
              "Variable — cheapest per exact card, easiest to overspend",
              "Highest ceiling, if the list is proven",
              "Players who already know their Leader and list"
            ]
          ]
        }
      },
      {
        "h": "Test before you spend: the proxy loop",
        "paragraphs": [
          "Before buying any card that costs real money, proxy it: a printed slip over a bulk card, in a friendly game, with your opponent's agreement. Play the deck ten times. Keep a note of what actually loses you games — the finisher that never leaves your hand, the answer you keep wishing you had drawn, the matchup where your board folds. That notebook, not a tournament report, is your shopping list.",
          "This loop is the recovery path for every deckbuilding mistake. A wrong cheap card is a lesson. A wrong expensive card bought four times is an expensive lesson — unless the proxy loop caught it first, in which case it was free. Buy playsets only of cards that survived testing.",
          "Two mistakes drain more new-player budgets than any others. The first is copying a tournament list card-for-card: those lists assume the pilot's experience, the local field they were tuned against, and full playsets you do not own yet. Borrow the list's ideas — its ratios, its curve — not its exact 50. The second is ignoring your DON!! curve: DON!! grows by roughly one per turn, so a deck stacked with high-cost cards sits idle while a leaner deck is already attacking. If your hand is regularly unplayable before turn four, the curve is the bug, not your luck."
        ]
      },
      {
        "h": "Japanese or English pool? Timing and price differ",
        "paragraphs": [
          "You can build from Japanese or English cards, and the choice follows the same logic as our [Japanese vs English breakdown](/blog/japanese-vs-english-pokemon-cards-which-to-buy/): Japanese sets release first and typically cost less per pack. OP-17 is the clean example — Japan released August 22, 2026 and English August 28, a six-day gap — and as of October 21, 2026 the [Japanese OP-17 box](/product/op-17-the-world-s-strongest-warriors-booster-box-japanese-one-piece-card/) is $101.07 against $153.69 for the English box. The current pool is all laid out in the [OP-17 set hub](/sets/op-17-worlds-strongest-warriors/). New cards exist in Japanese before they exist in English, every set.",
          "Two cautions before building Japanese-only. First, availability cuts both ways: the newest cards reach you first, but so does the sell-out. Second, event rules: many official events outside Japan are played in the local language, so check your store's event rules before committing a competition deck to Japanese cards. For casual play with friends, none of this matters — agree it with your group and play.",
          "However you source, learn to check what you are buying: singles bought card-by-card are where fakes circulate, so read [how to spot fake One Piece cards](/blog/how-to-spot-fake-one-piece-cards/) before your first singles order, and browse [our One Piece range](/one-piece-cards/) to see what is actually in print and in stock before you build around a card nobody can sell you."
        ]
      },
      {
        "checklist": [
          "Leader chosen by color identity, not tournament hype",
          "50 main-deck cards, 10 DON!! cards, max 4 copies per card number",
          "Every card's color matches the Leader's color(s)",
          "Allocation checked against the framework bands",
          "Starter deck as the base; box as the upgrade pool; singles last",
          "Expensive pieces proxied and tested across at least ten games",
          "DON!! curve checked — playable cards in hand before turn four",
          "A written list of what loses you games, kept from your test matches"
        ],
        "h": "The first-deck checklist",
        "paragraphs": [
          "Build against this list and your first deck will be legal, coherent, and upgradeable — which is all a first deck has to be."
        ]
      }
    ],
    "slug": "one-piece-how-to-build-your-first-deck",
    "takeaway": [
      "A first deck is a teaching tool that happens to be legal. Skeleton first, color second, allocation third, spending last — in that order, every time. The players still enjoying this game in a year are the ones whose first deck taught them cheaply.",
      "Ready to start? Browse [the One Piece range](/one-piece-cards/) for starter decks and boxes, and keep an eye on the [release calendar](/release-calendar/) for what your color gets next. And if you end up holding sealed product you are saving rather than opening, store it the way we describe in [how to store sealed booster boxes](/blog/how-to-store-sealed-booster-boxes/) — a box kept right is money kept."
    ]
  },
  "op-18-the-dominance-of-god-preorder-guide": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "November 20, 2026. The set was previewed at One Piece Day 2026, where Yoshitaka Amano art for Loki and Saint Shamrock was revealed.",
        "q": "When does OP-18 The Dominance of God release?"
      },
      {
        "a": "Yes, at Warehouse prices as of October 24, 2026. The case is $755 for 12 boxes, which is $62.92 per box against $70 for a single box — a saving of $7.08 per box. That is not true of every set: the OP-17 Japanese case works out to $101.25 per box, slightly more than its $101.07 single-box price, so always run the division.",
        "q": "Is the OP-18 case actually cheaper than buying boxes one at a time?"
      },
      {
        "a": "A Japanese OP-18 booster box holds 24 packs. A case holds 12 boxes, so a full case is 288 packs. At the case price of $755 as of October 24, 2026, that is $62.92 per box or about $2.62 per pack.",
        "q": "How many packs are in an OP-18 box and case?"
      }
    ],
    "h1": "OP-18 The Dominance of God: The Pre-Order Guide",
    "intro": [
      "OP-18 The Dominance of God releases on November 20, 2026, and the pre-order question is not whether the set looks strong. It does. The question is whether the numbers justify locking money down weeks before release, and the honest answer is: run the division first. At the Warehouse, OP-18 turns out to be one of the rare releases where the case genuinely beats the single box, and this guide proves it with arithmetic instead of adjectives. Full set details live on the [OP-18 The Dominance of God hub](/sets/op-18-the-dominance-of-god/), and every price below is a Warehouse price as of October 24, 2026.",
      "This guide is not for anyone pre-ordering on hype without a plan for the cards. If there is no deck these packs feed, no shelf the sealed box belongs on, and no point at which you would sell or split the case, a pre-order is just a lottery ticket bought early. It is written for buyers who decide with a calculator: players building a card pool, playgroups splitting cases, and sealed holders who want the per-box price working for them instead of against them."
    ],
    "metaDescription": "OP-18 releases Nov 20, 2026. Amano art, $70 a box, and a case that actually undercuts singles. The Warehouse runs the pre-order math before you commit.",
    "metaTitle": "OP-18 The Dominance of God Pre-Order Guide",
    "readMinutes": 9,
    "sections": [
      {
        "h": "What OP-18 actually is",
        "paragraphs": [
          "The Dominance of God is the next main One Piece Card Game booster release, landing November 20, 2026. A Japanese booster box holds 24 packs, and a sealed case holds 12 boxes, the standard One Piece structure. The set was previewed at One Piece Day 2026, where the headline reveal was card art by Yoshitaka Amano, including Loki and Saint Shamrock. Amano is a defining illustrator of the Final Fantasy series, and his involvement makes OP-18 a crossover object: a playable set that also sits in front of an art audience that does not normally buy card game product.",
          "Warehouse pricing as of October 24, 2026: the [OP-18 Japanese booster box](/product/one-piece-op-18-japanese-booster-box-pre-order-one-piece-card-game/) is $70, and the [OP-18 Japanese booster box case](/product/one-piece-op-18-japanese-booster-box-case-pre-order-one-piece-card-game/) is $755. Those two numbers are the entire decision. Everything else in this guide is what follows from dividing them honestly, and the [release calendar](/release-calendar/) is where OP-18 sits against the rest of the year's sets if you are choosing where a limited budget goes."
        ]
      },
      {
        "h": "The Amano factor, stated as reasoning",
        "note": "Warehouse Note: artist reveals move pre-orders faster than card text does. When a set's preview is an illustrator announcement rather than a mechanics announcement, the early allocation tends to be claimed by people buying the art first and the game second. Planning a purchase around that crowd is different from planning around players alone.",
        "paragraphs": [
          "Artist-driven demand is a real force in this hobby, but it needs to be stated as reasoning, not dressed up as data. The reasoning runs like this: when a famous illustrator's work appears in a set, the buyer pool widens beyond players. Art collectors and fans of the artist compete for the same sealed product and the same chase singles, and that wider pool supports prices at release instead of letting them sag. Loki and Saint Shamrock carry Amano's name into OP-18, and Saint Shamrock in particular is the kind of character whose first major cards attract attention well outside the playing community.",
          "Treat that as a reason to take the pre-order window seriously, not as a promise. No pull rates, print numbers, or secondary prices for OP-18 exist in this guide because none are verified yet, and any guide quoting them before release is inventing them. What the Amano factor changes is the risk balance: a set with an audience beyond players is less likely to be the set still sitting discounted months later, which is exactly the outcome pre-ordering is supposed to protect you from. The comparison against the set it follows is in [the best One Piece booster box breakdown](/blog/best-one-piece-booster-box-to-buy/), where OP-18's numbers are set against OP-17's."
        ]
      },
      {
        "h": "The pre-order math, exposed",
        "math": [
          "OP-18 box: $70.00 ÷ 24 packs = $2.92 per pack",
          "OP-18 case: $755.00 ÷ 12 boxes = $62.92 per box",
          "Case saving: $70.00 − $62.92 = $7.08 per box",
          "OP-17 JP case (contrast): $1,215 ÷ 12 = $101.25 per box vs $101.07 single — the case costs MORE"
        ],
        "paragraphs": [
          "Here is the division most buyers skip. A single OP-18 box at $70 with 24 packs works out to $2.92 per pack, the cheapest per-pack entry the Warehouse currently offers in One Piece. The case is where it gets interesting: $755 across 12 boxes is $62.92 per box, which undercuts the single-box price by $7.08 on every box in the case. The case buyer is not paying a bulk premium or splitting the difference. The case buyer is simply paying less for the identical product.",
          "Do not generalize that result, because the set OP-18 follows proves the opposite. With OP-17, the Warehouse's Japanese case works out to $101.25 per box against a $101.07 single-box price: that case costs more per box than buying the boxes one at a time. Same store, same game, same case structure, opposite answer. The lesson is the spine of this guide and of [the sealed case versus booster box math](/blog/sealed-case-vs-booster-box-the-math/): a case is never automatically the deal. It is a deal only after the division says so, and for OP-18 the division says so clearly."
        ]
      },
      {
        "h": "Who should lock what",
        "paragraphs": [
          "The right pre-order depends on the job the cards have to do, so decide by buyer type rather than by excitement level."
        ],
        "table": {
          "head": [
            "Buyer",
            "Move",
            "Why"
          ],
          "rows": [
            [
              "Playgroup or league splitting product",
              "Lock the case at $755",
              "$62.92 per box is the lowest per-box price available, and 12 boxes divide cleanly across a group"
            ],
            [
              "Player building a deck pool",
              "Lock one or two boxes at $70",
              "$2.92 per pack builds a pool cheaply; singles finish the list afterward"
            ],
            [
              "Sealed holder",
              "Lock the case, keep it sealed",
              "You capture the $7.08 per-box discount and the Amano-audience demand without opening anything"
            ],
            [
              "Singles hunter after one or two cards",
              "Wait for release-day singles",
              "A box is 24 packs of variance; buying the exact card after release skips the gamble entirely"
            ]
          ]
        }
      },
      {
        "h": "Pre-order or wait: the working framework",
        "paragraphs": [
          "Start from the job, not the set. If the cards feed a deck, the framework in [how to build your first One Piece deck](/blog/one-piece-how-to-build-your-first-deck/) applies: sealed product builds the pool, singles finish the list, and the pre-order question is really about the pool's price per pack. At $2.92 a pack, OP-18's pool is cheap by current standards. If the cards feed a collection or a sealed shelf, the question is whether release-week demand from the Amano audience makes waiting more expensive, and the honest answer is that nobody can price that in advance, which is itself an argument for the discounted case over the full-price box.",
          "The general discipline is the one laid out in [pre-order a Japanese booster box or wait](/blog/preorder-japanese-booster-box-or-wait/): pre-order when the price is verified, the per-unit math favors the format you are buying, and you know what the product is for. Wait when any of those three is missing. OP-18 passes all three checks for case buyers and box buyers alike, which is not something this guide gets to say about every release. One practical step before paying: confirm which format you are ordering. The box and the case are separate listings, and the $7.08 per-box difference only exists if the case is what actually lands in the cart."
        ]
      },
      {
        "h": "Failure modes and how to recover",
        "paragraphs": [
          "The first failure mode is assuming the case discount is a law of nature and extending the habit to sets where it reverses. OP-17's case, at $0.18 more per box than singles, is the standing counterexample: the recovery is boring and permanent, which is to divide every case price by 12 before paying it, every time, including the next set after this one. The second failure mode is pre-ordering against a plan that does not exist. A case bought on excitement becomes twelve boxes of obligation, and the recovery is to make the plan after the fact honestly: split it with the playgroup it should have been bought with, or hold it sealed rather than cracking packs in frustration, because opened product cannot be un-opened.",
          "The third failure mode is softer: buying the box when the actual want was two specific cards. Variance does not care about your list. If release day passes and the pulls miss, the recovery is the singles market, and the discipline is to price the singles against what the next box would cost rather than chasing the miss pack by pack. Pre-ordering is a pricing tool. Used on the wrong want, it becomes the most expensive way to buy two cards."
        ]
      },
      {
        "h": "Where OP-18 sits in the year",
        "paragraphs": [
          "Context matters for timing. OP-17, the fourth-anniversary Elbaf set, released in Japan on August 22, 2026 and in English on August 28, and its Warehouse prices still stand at $101.07 for a Japanese box as of October 24, 2026. OP-18 arrives November 20 at $70 a box: a newer set entering cheaper per pack than its predecessor's current price. That gap is the practical story of this pre-order window. Buyers choosing between chasing the anniversary set and locking the new one are not choosing between equal prices, and the full side-by-side is in [the best One Piece booster box to buy](/blog/best-one-piece-booster-box-to-buy/). Browse the wider [One Piece range](/one-piece-cards/) if your pool needs older product alongside the new set."
        ]
      },
      {
        "checklist": [
          "Divide the case price by 12 yourself: $755 ÷ 12 = $62.92 per box, below the $70 single-box price",
          "Name the job: deck pool, playgroup split, or sealed hold — one of the three, in words",
          "Confirm the listing format in the cart: box ($70) or case ($755), not the one you assumed",
          "Check the release date against your calendar: November 20, 2026",
          "Set the singles rule in advance: which cards you will buy directly after release instead of chasing in packs",
          "If splitting a case, agree the split and payment before the case ships, not after it lands"
        ],
        "h": "The pre-order checklist",
        "paragraphs": [
          "Before any money moves on OP-18, walk the list. If an item fails, the pre-order waits."
        ]
      }
    ],
    "slug": "op-18-the-dominance-of-god-preorder-guide",
    "takeaway": [
      "OP-18's pre-order case is unusually clean: a verified November 20, 2026 release, a famous-artist factor that widens the buyer pool, a $70 box at $2.92 per pack, and a $755 case that undercuts the box by $7.08 per unit instead of quietly charging more the way OP-17's does. Lock the case if you have a group or a shelf for it, lock a box if you are building a pool, and wait for singles if your want list is two cards long. The set will reward buyers who divided first."
    ]
  },
  "preorder-japanese-booster-box-or-wait": {
    "datePublished": "2026-10-19",
    "faqs": [
      {
        "a": "It depends on the set, which is the point of the framework. On routine sets, prices often settle below the pre-order price two to four weeks after release, so waiting wins. On special sets — anniversaries, new rarity tiers, marquee art — the pre-order price can be the cheapest the box ever is. Run the signals checklist to decide which kind you are looking at.",
        "q": "Is pre-ordering a Japanese booster box cheaper than waiting?"
      },
      {
        "a": "You are locked at the pre-order price; that is the cost side of removing availability risk. The practical recoveries are to hold the box sealed (dips after a launch flood often partially recover) or to open a set you genuinely like and take the value as cards. Panic-selling into the dip to fund the next release converts a paper loss into a real one.",
        "q": "What happens if a set I pre-ordered drops in price after release?"
      },
      {
        "a": "Using OP-18 pre-order prices as of October 20, 2026: a single Japanese box is $70 ($2.92 per pack across 24 packs), while a sealed case of twelve is $755, which is $62.92 per box or $2.62 per pack. That is $85 less than twelve single boxes at $840 — worth knowing if you split cases with friends, because the case price is the fair baseline for the split.",
        "q": "How much cheaper is a case than buying boxes one at a time?"
      }
    ],
    "h1": "Pre-Order a Japanese Booster Box or Wait? The Framework We Use",
    "intro": [
      "Short answer first, because everything else on this page exists to support it. Pre-order the sets you would genuinely regret missing. Wait on the routine ones. And never buy during release week unless you need the box in hand that week, because the release-week price is a hype spike, not a value signal. That is the whole framework. The rest of this article shows you how to tell which set is which before you commit money, using real pre-order prices from our own store and the arithmetic laid out where you can check it.",
      "This guide is for collectors deciding whether to lock in a Japanese booster box before release day. It is not for sealed-product investors managing a portfolio, whose math runs on different time horizons. And it is not for anyone who would have to stretch a tight budget to pre-order: if locking in a box means skipping something essential, wait. Boxes restock. Rent does not forgive. Honest about that boundary up front, because a framework that ignores it is not advice, it is a sales pitch."
    ],
    "metaDescription": "Should you pre-order a Japanese booster box or wait? Real OP-18 store prices, per-pack math, and the framework we use to decide.",
    "metaTitle": "Pre-Order or Wait? Japanese Booster Box Guide",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The framework: three questions, in order",
        "paragraphs": [
          "Question one: if this set sells out at the pre-order price and never restocks below it, how annoyed will you be? Not mildly disappointed — genuinely annoyed, the kind you remember at the next release. If the answer is very, you are looking at a pre-order candidate. If the answer is a shrug, wait. This question does most of the work, because regret is the real cost in this hobby, and it is asymmetric: overpaying by ten dollars on a routine set stings for a day, while missing a set you loved at retail price stings for years.",
          "Question two: is this a routine set or a special one? Routine sets are the steady drumbeat of a game — a standard expansion, standard rarities, standard demand. Special sets carry something extra: an anniversary, a first appearance, a new rarity tier, art from a name people outside the hobby recognize. Special sets are the ones whose prices can spike at release and never meaningfully come back down. Routine sets are the ones that settle. Sorting a set into the right bucket matters more than any price prediction.",
          "Question three: can you wait two to four weeks after release without it bothering you? For routine sets, that window is where prices usually land after the spike fades and supply catches up. If you can wait, waiting is free money on routine product. If waiting means watching everyone else open the set while your box sits in a cart, be honest about that too — the hobby is supposed to be fun, and a framework you hate following is a framework you will abandon at the worst moment."
        ]
      },
      {
        "h": "The money layer: run the per-pack math before anything else",
        "math": [
          "Single box: $70 ÷ 24 packs = $2.92 per pack",
          "Sealed case: $755 ÷ 12 boxes = $62.92 per box",
          "Case per pack: $62.92 ÷ 24 packs = $2.62 per pack",
          "Case saving: ($70 × 12) − $755 = $840 − $755 = $85 across the case",
          "Release-week comparison: an $84 box = $84 ÷ 24 = $3.50 per pack, i.e. $0.58 more per pack than the $2.92 pre-order"
        ],
        "paragraphs": [
          "Pre-order prices are set while demand is still uncertain, which makes them the most honest prices a set ever has — nobody yet knows if it is a hit. But a headline box price tells you little until you divide it down. Take OP-18 The Dominance of God, releasing November 20, 2026: 24 packs per box, 12 boxes per case. Our pre-order prices, as of October 20, 2026, are $70 for a single Japanese box and $755 for a sealed case of twelve. Those two numbers contain a decision most buyers never notice.",
          "Run the division and the case quietly wins: a single box works out to $2.92 per pack, while the case price breaks down to $62.92 per box, or $2.62 per pack. That is a 30-cent difference on every pack, and across a full case it adds up to $85 saved versus buying the same twelve boxes one at a time. If you split cases with friends — a common arrangement — the case price is the correct baseline for the split, not the single-box price. Whoever organizes the split and pays single-box prices is donating the difference.",
          "The same math disciplines the wait decision. When a set releases and the secondary price jumps, divide before you panic: say a box lists at $84 after release — a worked example, not a quote — that is $3.50 per pack against a $2.92 pre-order pack. You are not deciding whether $84 is a lot of money in the abstract. You are deciding whether the set, pack by pack, is worth 58 cents more per pack than it was last month — and whether it will still be there when the price settles. Numbers first, feelings second. The feelings get their say in question one of the framework, not here."
        ]
      },
      {
        "h": "The decision layer: three strategies side by side",
        "paragraphs": [
          "Every buyer ends up in one of three lanes, whether they choose deliberately or drift. Laying them side by side makes the trade-offs impossible to unsee. None of the three is correct in general; each is correct for a particular kind of set and a particular kind of buyer. The framework from the first section exists to route you into the right lane before the hype routes you into the wrong one.",
          "Notice what the table does not contain: a price prediction. Nobody honest can tell you what OP-18 will cost in December. What can be stated in advance is the shape of the risk each lane carries — which risks you are exposed to, and which you have paid to avoid. Pre-ordering buys down availability risk and regret risk at the price of overpaying if the set cools. Waiting buys the best expected price on routine sets at the price of being exposed if the set turns hot. Release-week buying avoids nothing; it is the lane you end up in when the first two decisions were never made."
        ],
        "table": {
          "head": [
            "Strategy",
            "Price risk",
            "Availability risk",
            "Regret risk"
          ],
          "rows": [
            [
              "Pre-order",
              "Locked at today's price; you overpay if the set cools and settles below it",
              "Lowest — your allocation is reserved before release day",
              "Low on hot sets; real on duds you talked yourself into"
            ],
            [
              "Wait 2–4 weeks",
              "Best odds of a lower price on routine sets once supply catches up",
              "Higher — a hot set may sell through and never restock below the spike",
              "High if the set turns out to be the special one"
            ],
            [
              "Buy release week",
              "Worst — you pay the hype spike at or near its peak",
              "Good while launch stock lasts, then suddenly not",
              "Highest — peak price for a set that usually settles within the month"
            ]
          ]
        }
      },
      {
        "checklist": [
          "Pre-order allocations selling through early, or per-customer limits appearing",
          "Distributor restock timelines stretching — later dates, vaguer commitments",
          "Chase-card hype dominating discussion before release, including from outside the game's usual audience",
          "A new rarity tier, anniversary status, or a marquee artist reveal (OP-18: Yoshitaka Amano art, revealed at One Piece Day 2026)",
          "The set is a special or side set rather than a routine main expansion"
        ],
        "h": "Signals of a hot set: the dated checklist",
        "paragraphs": [
          "You cannot know in advance which sets will spike and stay up. You can watch for the signals that preceded the last several that did. None of them is proof on its own; two or more together should move a set from the wait lane into the pre-order lane. OP-18 is a live example as this is written: it carries Yoshitaka Amano art, including Loki and Saint Shamrock cards, revealed at One Piece Day 2026 — exactly the kind of reveal that pulls attention from outside the usual buyer pool, which is where sustained demand comes from.",
          "Work through the checklist against any set you are considering. Fast allocation sell-through is the loudest signal: when stores close pre-orders early or introduce per-customer limits weeks before release, the supply side is telling you demand has already beaten it. Restock timelines stretching is the second: when distributors quote later and vaguer dates for wave two, the settle-you-are-waiting-for may not arrive on schedule. Chase-card hype is the third, and the easiest to misread — loud discussion before release is normal, but discussion dominated by one or two specific cards, from people who do not usually buy the game, is not."
        ]
      },
      {
        "h": "The risk layer: both directions can burn you",
        "note": "From this side of the counter, we see allocation pressure before it shows up in public prices. When a distributor trims a confirmed quantity or asks for per-customer caps, that is the earliest reliable sign that a set is hotter than its pre-order price suggests — it happens days to weeks before listings move. We cannot publish distributor numbers, but when order limits tighten on a set in our store, that is us showing you what we are seeing.",
        "paragraphs": [
          "Waiting on a hot set fails in a specific, miserable way: the price does not settle, allocation does not reopen, and you end up choosing between secondary-market prices and not owning the set. There is no recovery move that restores the pre-order price; the recovery is to decide, in advance, the most you will pay, and to walk away cleanly if the market passes it. Chasing a rising price week after week is how a $70 box becomes a $140 lesson.",
          "Pre-ordering a dud fails more quietly. The set releases, reception is lukewarm, and within a month the box trades below what you paid. The recovery here is patience and honesty: a sealed box is not a wasting asset, and sets routinely recover some ground once the initial flood is absorbed. What does not work is panic-selling into the dip to fund the next pre-order — that converts a paper loss into a real one and restarts the cycle. If you pre-ordered a set you actually like, the simplest recovery is to open it and enjoy the thing you bought.",
          "Underneath both failures sits the same cause: the decision was made by the crowd's temperature instead of by the framework. Hot-set regret and dud regret feel different, but they are the same error wearing two coats — buying, or not buying, because of what this week's noise suggested instead of what your own answers to the three questions said."
        ]
      },
      {
        "h": "Context: Japanese first, and what that does to timing",
        "paragraphs": [
          "Japanese releases land before their English counterparts, which compresses the Japanese pre-order decision into a window where English-language information is thinnest. OP-17 The World's Strongest Warriors is the recent pattern: Japanese release August 22, 2026, English release August 28, 2026 — close together, but the Japanese decision still had to be made first, on Japanese information. Our store prices for OP-17, as of October 20, 2026, also show the usual language gap: the Japanese box at $101.07 against the English box at $153.69. Waiting for English buys the larger resale pool and cards you can read at the table; it does not buy a lower price.",
          "The calendar ahead makes the same point at larger scale. EB-05 Heroines Edition vol.2 arrives October 30, 2026; FB11 Brightness of Hope on October 16, 2026; OP-18 on November 20, 2026; FB12 Reach the God — 123 types, official Bandai date — on December 18, 2026, with sealed cases at $1,265 in our store as of October 20, 2026; and the FS13 and FS14 Dragon Ball starter decks on January 22, 2027. (OP-19 is expected in early 2027 but remains unconfirmed.) A release calendar this dense is itself an argument for the framework: you cannot pre-order everything, so the three questions are how you choose."
        ]
      },
      {
        "h": "Who should NOT pre-order",
        "paragraphs": [
          "Three groups should stay out of pre-orders entirely. First, anyone stretching a budget to do it — covered in the intro, and worth repeating because hype is loudest exactly when money is tightest. Second, anyone who is not sure they want the set: pre-ordering converts a maybe into a commitment at the moment of maximum uncertainty, and uncertainty is the seller's friend, not yours. Third, anyone planning to flip the box in release week: you are competing against every store's launch stock with a single box and no edge, and the framework above exists precisely because that lane has the worst risk shape of the three.",
          "Who pre-ordering is for: collectors who know the set and their own taste, players who need cards at launch for events, and anyone who ran the signals checklist and watched a set they love tick two or more boxes. For those buyers, the pre-order price is not a gamble. It is the cost of removing availability risk and regret risk from a purchase they had already decided to make."
        ]
      },
      {
        "checklist": [
          "Answer the regret question honestly: miss this set at retail price — how annoyed, really?",
          "Sort the set: routine or special? Check for anniversary status, new rarity tiers, marquee reveals",
          "Run the per-pack math on the pre-order price (box price ÷ packs per box; compare case price if splitting)",
          "Work the hot-set signals checklist; two or more signals moves the set to the pre-order lane",
          "If pre-ordering: confirm the seller's cancellation and allocation policy before paying",
          "If waiting: set a calendar reminder for 2–3 weeks after release and a maximum price you will pay",
          "Whatever you decided: do not buy in release week outside that plan"
        ],
        "h": "Action layer: the pre-order decision, as a checklist",
        "paragraphs": [
          "Run this in order, before the next release you care about. It takes ten minutes and it replaces a month of watching prices with a decision you made while calm."
        ]
      }
    ],
    "slug": "preorder-japanese-booster-box-or-wait",
    "takeaway": [
      "Pre-order the sets you would regret missing, wait on the routine ones, and never pay the release-week spike. The per-pack math tells you what a price actually is; the signals checklist tells you which lane a set belongs in; the regret question tells you who you are as a buyer. Everything else is noise with a price tag attached.",
      "Prices change and allocations move, so treat every number here as stamped: store prices as of October 20, 2026. When the next set you care about opens for pre-order, run the checklist first and the checkout second — in that order, every time.",
      "Deciding where to place the order matters as much as when: [buying TCG from Japan — shipping, customs, and the proxy fee stack](/blog/buying-tcg-from-japan-shipping-customs-proxy/) shows what each route really costs landed. If you're pre-ordering with one eye on future value, read [whether Japanese cards are a good investment](/blog/are-japanese-pokemon-cards-a-good-investment/) before the hype sets your budget. And when comparing two sets' pre-order prices, divide first — [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) is the table to divide with.",
      "Applying this framework to a live release? The [OP-18 pre-order guide](/blog/op-18-the-dominance-of-god-preorder-guide/) runs it against a real set with real case math — including when the case is the deal and when it quietly is not."
    ]
  },
  "psa-grading-japanese-cards-worth-it": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Compare what that grade actually sells for — real sold prices, not listings — against the break-even number you ran before submitting. If the sold prices sit below your break-even, yes, the submission lost money, and the loss was locked in the day you shipped it, not the day the grade posted. This is exactly why the checklist asks the one-grade-down question before you submit: if a lower grade loses, the honest options were sell raw or do not submit.",
        "q": "My card came back one grade below the top grade. Did I lose money?"
      },
      {
        "a": "Probably not — and it is not an insult to the card. M6a guarantees one of its 30 Pikachu cards in every pack, so supply is real and most of those cards will never clear the break-even formula after fees and insured shipping. The exception is the specific Pikachu art the market treats as the set's chase, in genuinely flawless condition. Read the rarity code, inspect under a lamp, run the formula with the grader's current fees — and let the arithmetic overrule the pull-day excitement.",
        "q": "Should I grade the Pikachu I pulled from an M6a pack?"
      },
      {
        "a": "We deliberately do not print fees or turnaround times, here or anywhere on this site. Both change constantly, graders revise service levels without asking bloggers, and a stale number copied from an article produces bad submissions. Check the grading company's own current published schedule, take the fee for the service level you would actually use, price your time into the break-even formula — and remember that however long the queue is, the market keeps moving while your card is in it.",
        "q": "What does grading cost right now, and how long does it take?"
      }
    ],
    "h1": "Is Grading Japanese Pokémon Cards Worth It? Run This Test First",
    "intro": [
      "Short answer: grading Japanese Pokémon cards pays for a narrow band of cards — high-demand chase cards in genuinely clean condition — and quietly loses money on almost everything else. The slab does not create value. It certifies condition, and certification only matters when buyers are already competing for the card itself.",
      "This page is the test we would run before paying any grader: the break-even formula, the inspection steps, the decision table, and the failure modes. It is written for collectors holding a real candidate — a top-rarity chase card they are tempted to submit. It is not for anyone hoping a slab rescues a played card, inflates bulk, or turns a mid-tier pull into a payday. Grading cannot do any of those things, and the fees do not care how hopeful the submission was."
    ],
    "metaDescription": "Grading pays for clean, high-demand Japanese chase cards and burns money on the rest. The break-even math, inspection steps, and honest risks.",
    "metaTitle": "Is PSA Grading Japanese Pokémon Cards Worth It?",
    "readMinutes": 10,
    "sections": [
      {
        "h": "The break-even formula (check the grader's current fees first)",
        "math": [
          "Graded price needed = raw price + grading fee + insured shipping (out) + insured shipping (back) + selling fees + your time",
          "Hypothetical worked example (every figure invented for illustration — check the grader's current schedule before using real money):",
          "Raw value $120 (hypothetical) + grading fee $30 (hypothetical) + insured shipping both ways $24 (hypothetical) + selling fees $26 (hypothetical) = $200 break-even",
          "So in this example the graded copy must realistically sell above $200 before grading earns a single dollar."
        ],
        "paragraphs": [
          "Every grading decision reduces to one inequality. The graded card must sell for more than the raw card would have — by enough to cover every cost of getting it into the slab and back out to a buyer. Graders change their fees, service levels, and turnaround estimates constantly, so we will not print a fee table here: it would be stale within months, and wrong numbers make wrong decisions. Open the grading company's current published schedule, take the real fee for the service level you would actually use, and run this:",
          "Read the example the right way. A top grade might clear that bar on a genuinely wanted card. A grade one step down often will not — on many cards, the second-highest grade trades close to, or below, the optimistic raw price, because raw buyers pay for the dream of the top grade while buyers of the lower grade pay only for the card. If the realistic outcome range straddles your break-even line, the correct move is to sell raw and let someone else fund the gamble.",
          "A second trap hides in how submissions get priced: service levels are usually tied to the card's declared value, so the card you hope becomes valuable costs more to grade than the card that does not — the fee scales with your optimism. That is another reason the formula must be run against the current schedule rather than a remembered one. The fee you paid on a cheap bulk submission two years ago tells you nothing about what a high-value chase card costs to submit today, and collectors who budget from memory underbudget on exactly the submissions where the stakes are highest.",
          "One line in the formula gets skipped constantly: your time. Weeks in a queue, photographing and listing the slab, shipping it to a buyer — if the margin only works when your hours are valued at zero, the margin does not exist. Price your time in, honestly, before the card leaves your desk."
        ]
      },
      {
        "h": "Before you pay: the inspection that decides everything",
        "paragraphs": [
          "Grading is a condition game, and the submission is won or lost at your desk, before anything is mailed. First, confirm what you actually hold: the rarity code printed at the bottom of every Japanese card states its tier — our [Japanese Pokémon rarity symbols guide](/blog/japanese-pokemon-rarity-symbols-explained/) decodes AR, SAR, UR, BWR, FUR and the rest. Submitting a card whose tier you have misread is the most expensive beginner error in this hobby, because every downstream number in the formula is built on the wrong card.",
          "Then inspect in a fixed order, under a bright desk lamp. Centering: compare the borders left to right and top to bottom; a visibly lopsided card is capped before it travels anywhere. Surface: tilt the card slowly under the light and look for print lines, scratches, and faint roller lines in the foil. Edges: hold the card against a dark background and look for silvering and nicks. Corners: any whitening or softness counts against you. Photograph the front and back, in the sleeve, before it leaves — those photos are your evidence if anything comes back wrong.",
          "This is where Japanese cards hold a structural edge. Japanese print quality and centering are generally better than English, as we break down in [Japanese vs English Pokémon cards](/blog/japanese-vs-english-pokemon-cards-which-to-buy/) — and because a top grade requires a clean starting copy, a pack-fresh Japanese chase card begins the race a step ahead. That guarantees nothing. It means the inspection pass rate is genuinely higher, which is exactly the kind of small, real advantage worth building a decision on."
        ]
      },
      {
        "h": "The decision table: grade it, sell it raw, or hold it",
        "paragraphs": [
          "Apply the formula by card type and the answer is rarely mysterious:",
          "Notice what the table assumes: you inspected honestly. The most common way collectors lose money on grading is grading the card they wish they had instead of the card on the desk — the one whose corner they decided not to look at twice.",
          "There is also a middle move the table leaves out: grading only the single best card from a box and selling the rest raw, immediately, while the set is still warm. Mixed strategies are where most sensible collectors land. A box produces one or two genuine candidates at most; treating every holo in it as a submission candidate is how a profitable box becomes a break-even box with extra steps."
        ],
        "table": {
          "head": [
            "Card in hand",
            "Grade it",
            "Sell it raw",
            "Hold it raw"
          ],
          "rows": [
            [
              "Top-tier SAR or BWR chase, pack-fresh, centered, clean under the lamp",
              "Yes — this is the narrow band where the graded premium actually lives",
              "Only if you need the cash now; you leave the premium behind",
              "Reasonable if you believe demand for the card is still rising"
            ],
            [
              "Mid-tier AR, clean, but modest demand",
              "Usually no — the fee stack eats a premium this thin",
              "Yes — raw buyers pay full price for these today",
              "Fine for a collection; do not call it an investment"
            ],
            [
              "Bulk holo, played card, or anything with visible wear",
              "Never — the fee exceeds the card's value at almost any grade",
              "Sell as bulk and move on",
              "Only for sentimental reasons"
            ]
          ]
        }
      },
      {
        "h": "The risk layer: how grading goes wrong, and the recovery",
        "note": "From the Warehouse counter: the grading question we hear most is asked within the first hour of a big pull, about a card still warm from the pack. Excitement is not a grading criterion. The submissions that make sense are almost boring — the card was checked under a lamp, the math was run cold, and the owner could state their break-even number out loud before anyone mentioned a slab.",
        "paragraphs": [
          "Grade disappointment is the headline risk. You pay for the round trip, you wait, and the card comes back one grade below the dream, selling for less than an optimistic raw listing would have fetched the month you pulled it. Second is time: while your card sits in a queue, the market does not wait with it — a set's hype window can close before the slab comes home, and a card that was hot at submission can be ordinary at return. Third is transit: cards are lost and damaged in the mail rarely, but rarely is not never, and the value at stake is exactly why the shipping line in the formula says insured, both ways.",
          "The recovery protocol is boring and complete. Insure both legs for the card's realistic graded value, not its raw price. Photograph everything before it leaves. Submit in a batch only when each card in the batch passes the break-even test on its own — batching losers with winners does not average anything out; it just adds fees. And decide your disappointment price in advance: the grade at which you sell immediately rather than holding the slab and hoping."
        ]
      },
      {
        "h": "Context: graded Japanese cards are a smaller, more serious market",
        "paragraphs": [
          "A raw card is liquid immediately — list it today, sell it this week. A graded card waits for the right buyer, and a graded Japanese card waits in a smaller pool: fewer casual buyers, but the buyers who are there know exactly what a Japanese SAR in a top grade is and pay accordingly. That trade — speed for premium — is the real decision, and it is why grading belongs inside a wider plan rather than as a reflex after every good pull; we lay out that wider frame in [are Japanese Pokémon cards a good investment](/blog/are-japanese-pokemon-cards-a-good-investment/).",
          "One more honest boundary: a slab authenticates, but it is an expensive way to learn that a card is fake. Learn the tells first — texture, print patterns, rarity-code mismatches — with our guide on [how to spot fake Japanese Pokémon cards](/guides/how-to-spot-fake-japanese-pokemon-cards/), and never submit a card you have doubts about hoping the grader settles the question. Settle it yourself, for free, before the fee.",
          "Finally, condition honesty compounds. A collector known for accurately described raw cards sells raw faster, and often at better prices, over time — the ungraded market runs on trust nearly as much as the graded one does. Grading everything is sometimes less a strategy than an admission that your descriptions are not believed. Build the reputation, and half the break-even tests in this article become unnecessary, because your raw cards start fetching what they are actually worth."
        ]
      },
      {
        "h": "The realistic candidates, from sets on our shelves",
        "paragraphs": [
          "M6a 30th Celebration is the current example of a set with genuine candidates. The Mew ex and Mewtwo ex with art by YOSHIROTTEN are the kind of cards demand concentrates on — we profile them on the [M6a 30th Celebration set hub](/sets/m6a-30th-celebration/), and the box itself is on our shelf as the [M6a 30th Celebration booster box](/product/m6a-30th-celebration-booster-box-japanese-poke-mon-tcg/), $207.50 as of October 21, 2026. The set's 30 Pikachu cards, one guaranteed in every pack, cut the other way: a guaranteed-per-pack card has real supply behind it, so most of those Pikachu fail the break-even test unless the specific art is the set's chase and your copy is flawless under the lamp.",
          "SV11B Black Bolt makes the same point from the other direction. Its headline rares — the BWR Zekrom ex and Reshiram ex we cover on the [SV11 Black Bolt & White Flare hub](/sets/sv11-black-bolt-white-flare/) — are exactly the profile worth inspecting closely, while the set's ordinary holos are not, however good they look in a binder. The [SV11B Black Bolt booster box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) is $152.65 as of October 21, 2026; a box buys you the chance to inspect candidates, not a promise that any single card inside clears the grading bar. And if you enjoy the hunt itself, our explainer on [what a god pack is](/blog/what-is-a-god-pack-japanese-pokemon/) covers the other way a Japanese box can over-deliver."
        ]
      },
      {
        "checklist": [
          "Read the rarity code off the card itself and confirm the tier before valuing it",
          "Inspect under a bright lamp: centering, surface, edges, corners — in that order",
          "Find real raw sold prices for the card, not asking prices",
          "Pull the grader's current published fee from their own schedule — never from an article, including this one",
          "Run the break-even formula; submit only if a realistic top-grade price clears it with room to spare",
          "Ask the one-grade-down question: if it comes back a grade lower, do you still make money? If not, sell raw",
          "Photograph front and back in the sleeve, and insure both shipping legs"
        ],
        "h": "The pre-submission checklist",
        "paragraphs": [
          "Run every candidate through this, in order. One failure ends the submission."
        ]
      }
    ],
    "slug": "psa-grading-japanese-cards-worth-it",
    "takeaway": [
      "Grading Japanese Pokémon cards is a filter, not a lottery ticket. For the narrow band — a high-demand SAR, BWR, or FUR chase card, pack-fresh, centered, flawless under the lamp — the premium is real, and Japanese print quality gives you a genuine head start. For everything else, the formula returns the same answer every time: the fees win and you lose. Run the arithmetic cold, with the grader's current schedule open in another tab, and let the number decide instead of the excitement.",
      "If you are still hunting for the right candidate, browse the sets where candidates actually live — our [Japanese Pokémon cards](/pokemon-cards/) shelves are where we pull from — and inspect what you open before you dream about slabs."
    ]
  },
  "sealed-case-vs-booster-box-the-math": {
    "datePublished": "2026-10-20",
    "faqs": [
      {
        "a": "No. At our prices as of October 20, 2026, the OP-17 Japanese case works out to $101.25 per box ($1,215 ÷ 12) against a $101.07 single box — the case costs $0.18 more per box. A case sometimes buys you guaranteed quantity and a single shipment rather than a discount. The only way to know which you are getting is to divide before you buy.",
        "q": "Is a sealed case always cheaper per box than buying singles?"
      },
      {
        "a": "For both sets, 12 boxes per case and 24 packs per box — 288 packs in a full case. Confirm the count on any listing before you run the math, though: boxes per case is the one number the entire comparison stands on, and it is a listing detail, not a law of nature.",
        "q": "How many boxes are in a case of OP-17 or OP-18?"
      },
      {
        "a": "When two things are both true: the division shows a real per-box saving — $24.24 per box on the OP-17 English case, $7.08 per box on the OP-18 Japanese pre-order case, at October 20, 2026 prices — and you have a genuine plan for all twelve boxes: opening them, splitting them with named people, or holding them with proper storage. If either half fails, buy the boxes one at a time.",
        "q": "When does buying a case clearly make sense?"
      }
    ],
    "h1": "Sealed Case vs Booster Box: Run the Math Before You Buy Either",
    "intro": [
      "Short answer: a sealed case is not a bulk discount by definition. At our prices as of October 20, 2026, one of the three cases below costs more per box than buying the boxes one at a time, one saves about 10% per box, and one saves about 16%. The word 'case' tells you nothing. The division tells you everything — and it takes about two minutes.",
      "So this article runs the actual numbers on three products on our own shelves: OP-17 in Japanese, OP-17 in English, and OP-18 on pre-order. Then it covers what the arithmetic cannot — the capital a case ties up, the storage it demands, and how slowly twelve boxes leave your hands when you want out. The math decides whether a case is a discount. The risk section decides whether the discount is worth having.",
      "Who this is for: anyone weighing a case against single boxes right now. Who it is NOT for: anyone whose budget only works if the case goes up in value afterward. That is not buying, that is a bet — and no table in this article can protect a bet."
    ],
    "metaDescription": "A sealed case is not always cheaper per box. Real OP-17 and OP-18 prices divided live: when a case saves 16%, when 10%, and when it costs more.",
    "metaTitle": "Sealed Case vs Booster Box: Run the Math First",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The money layer: three cases, three different answers",
        "math": [
          "OP-17 Japanese case: $1,215 ÷ 12 boxes = $101.25 per box — against a $101.07 single box. The case costs $0.18 MORE per box.",
          "OP-17 English case: $1,553.36 ÷ 12 boxes = $129.45 per box — against a $153.69 single box. The case saves $24.24 per box.",
          "OP-18 Japanese case (pre-order): $755 ÷ 12 boxes = $62.92 per box — against a $70.00 single box. The case saves $7.08 per box.",
          "Per pack (24 packs per box): OP-17 JP single $4.21, case $4.22 · OP-17 EN single $6.40, case $5.39 · OP-18 JP single $2.92, case $2.62",
          "Totals across 12 boxes: OP-17 EN case saves $24.24 × 12 = $290.88 · OP-18 case saves $7.08 × 12 = $84.96 · OP-17 JP case costs $0.18 × 12 = $2.16 extra"
        ],
        "paragraphs": [
          "The method is one division: case price divided by boxes in the case gives the true per-box cost, which you then hold up against the single-box price. OP-17 and OP-18 both ship 12 boxes to a case, so the divisor is 12 in all three examples. Start with the uncomfortable one. Our OP-17 Japanese case is $1,215. Divided by 12, that is $101.25 per box. Our single OP-17 Japanese box is $101.07. Read that again: at current prices, the case costs eighteen cents more per box than buying the boxes individually. There is no discount. There is a quantity, sold under a label that makes most buyers assume a discount exists.",
          "Now the other two, because the point is not that cases are bad — the point is that they are inconsistent. The OP-17 English case is $1,553.36, which divides to $129.45 per box against a $153.69 single: a genuine saving of $24.24 per box, roughly 16%. The OP-18 Japanese case, at pre-order prices ahead of its November 20, 2026 release, is $755, dividing to $62.92 per box against a $70.00 single: a saving of $7.08 per box, roughly 10%. Same store, same week, three cases, three completely different answers — one small premium, one modest saving, one large one. Anyone who tells you 'cases are always the smart buy' has not divided lately."
        ]
      },
      {
        "h": "The practical layer: run this on any case, in two minutes",
        "note": "Warehouse Note: the case question we hear is 'how much do I save?' — asked as if the saving is automatic and only its size is in doubt. The honest first question is 'do I save at all?' On OP-17 Japanese right now the answer is no, and we would rather walk a buyer through that arithmetic at the counter than move a $1,215 case under a discount that does not exist.",
        "paragraphs": [
          "Step one: confirm the boxes per case from the listing itself — 12 for OP-17 and OP-18 — because the whole comparison stands on that number, and it is a listing detail, not a universal rule. Step two: divide the case price by that number. Step three: divide both results by packs per box — 24 for both sets here — to get cost per pack, the number that matters if you are opening. Step four: multiply the per-box difference by the number of boxes. A $24.24 saving sounds modest until it is $290.88 across a case; an $0.18 premium sounds trivial until you realize you paid $2.16 extra for the privilege of buying in bulk.",
          "Step five is the one nobody runs: ask what the committed capital costs you elsewhere. A case is $755 to $1,553.36 leaving your account in a single transaction. And a warning from our own shelves: we list the FB12 Reach the God sealed case at $1,265 ahead of its December 18, 2026 release, without a single-box price beside it to divide against — so for that product, the comparison in this article cannot be run at all. A comparison you cannot run is a discount you cannot claim. If a seller cannot show you both numbers, the case pitch is marketing, not math."
        ]
      },
      {
        "h": "The decision table",
        "paragraphs": [
          "All three examples, one view. Prices are ours, as of October 20, 2026; OP-18 is a pre-order releasing November 20, 2026."
        ],
        "table": {
          "head": [
            "",
            "OP-17 Japanese",
            "OP-17 English",
            "OP-18 Japanese (pre-order)"
          ],
          "rows": [
            [
              "Single box",
              "$101.07",
              "$153.69",
              "$70.00"
            ],
            [
              "Case (12 boxes)",
              "$1,215",
              "$1,553.36",
              "$755"
            ],
            [
              "Case price ÷ 12, per box",
              "$101.25",
              "$129.45",
              "$62.92"
            ],
            [
              "Difference per box",
              "+$0.18 — case costs more",
              "−$24.24 — case saves",
              "−$7.08 — case saves"
            ],
            [
              "Cost per pack, single box",
              "$4.21",
              "$6.40",
              "$2.92"
            ],
            [
              "Cost per pack, from case",
              "$4.22",
              "$5.39",
              "$2.62"
            ],
            [
              "Up-front capital",
              "$1,215",
              "$1,553.36",
              "$755"
            ]
          ]
        }
      },
      {
        "h": "The risk layer: what twelve boxes do to you",
        "paragraphs": [
          "First, capital. A case parks $755 to $1,553.36 in sealed cardboard, in one move. If that money was also your budget for singles, sleeves, or the next set, the case just spent it for you. Second, condition: twelve boxes stored as one case are one accident away from a shared problem. A leak, a drop, a crushed corner on a single $101 box is a bad day; the same event touching a sealed case writes the story across all twelve boxes at once, and case condition is part of what a future buyer is paying for. Dry, stable, unstacked storage is not a nicety at this quantity — it is the difference between an asset and a damp problem.",
          "Third, exit liquidity, the risk buyers consistently underestimate. Selling one box is a listing. Selling twelve is a campaign. The pool of buyers for a full sealed case is smaller than the pool for single boxes — it is mostly resellers and group buyers, not casual collectors — so a case leaves your hands more slowly, and if you need out quickly, the discount you captured at purchase gets handed to the buyer as the price of speed. Fourth, set risk is multiplied by twelve: if a set cools after release, a single-box buyer owns one box of disappointment and a case buyer owns twelve. OP-18 carries a version of this built in — its numbers in this article are pre-order numbers, and pre-order prices can look very different once release-day supply actually exists.",
          "The recovery, because there is one: a case is not a trap. It is twelve boxes, and boxes can be sold individually, opened gradually, or split with other collectors. The exit is slower, not closed. The recovery only fails in one scenario — needing every dollar back, fast. If that scenario is even plausible for you, the case was the wrong size from the start."
        ]
      },
      {
        "h": "Who should NOT buy a case — and who should",
        "paragraphs": [
          "Do not buy a case if you are a first-time buyer of the set. You do not yet know whether this set is for you, and the correct experiment costs one box: buy it, open it, then decide whether eleven more boxes of the same thing sounds like joy or like storage. Do not buy a case if the purchase has to be justified by future resale — if $1,215 or $1,553.36 needs the market's cooperation to make sense, the risk layer above owns you, whatever the table says. And do not buy a case if you need a fast exit. Case buyers are fewer, case sales are slower, and 'I can always sell it' is a sentence that deserves a date attached to it.",
          "Buy a case if you are a committed opener who will rip several boxes of this set regardless — for you, cost per pack is your real price, and the case math above is money in its purest form. Buy one if you are splitting with other collectors, with the split agreed in writing before the case arrives, not negotiated over an open box. Buy one if you are a long-horizon sealed holder with proper storage, buying where the discount genuinely exists — the OP-17 English pattern, not the OP-17 Japanese one. The boundary test is one sentence: if you cannot say, in a single sentence, what happens to all twelve boxes, you do not have a case plan. You have a case hope."
        ]
      },
      {
        "h": "Context: why the same store prices three cases three ways",
        "paragraphs": [
          "The OP-17 pair is the lesson in miniature. The same set, in the same shop, in the same week: the Japanese case carries no discount at current prices while the English case saves roughly 16% per box. Case pricing follows each market's own supply and demand — Japanese and English product move through different channels to different buyer pools — so a rule learned in one language is worthless in the other. Never import one market's case logic into another market's checkout.",
          "Timing bends the numbers too. OP-18's case figures are pre-order figures, set before the set's November 20, 2026 release, when committed early buyers are being rewarded for ordering ahead of existing supply. After release day, both the single-box and case prices reset against the real market, and a decision made on pre-order math deserves to be re-run on release prices. One last boundary, for openers splitting a Japanese case: Japanese cards are not tournament-legal in English-language events. Irrelevant while the case stays sealed — decisive the moment the packs are opened with a tournament in mind."
        ]
      },
      {
        "checklist": [
          "Confirm boxes per case on the listing — 12 for OP-17 and OP-18. Never assume the count.",
          "Divide the case price by the boxes and write the per-box figure down next to the single-box price.",
          "Divide both per-box figures by packs per box (24 for OP-17 and OP-18) and compare cost per pack.",
          "Multiply the per-box difference by the number of boxes — that is the true saving, or the true premium.",
          "Check the date on the prices. The ones in this article are as of October 20, 2026, and OP-18's are pre-order prices that will reset after its November 20, 2026 release.",
          "Name the exit before you buy: who takes twelve boxes off your hands, and how fast? If you cannot answer, size down to single boxes.",
          "Confirm storage first — dry, stable, and room for twelve boxes before the case arrives, not after."
        ],
        "h": "The action layer: the case checklist",
        "paragraphs": [
          "Run these in order before any case purchase, ours or anyone else's."
        ]
      }
    ],
    "slug": "sealed-case-vs-booster-box-the-math",
    "takeaway": [
      "'Case' is a quantity, not a discount. At our October 20, 2026 prices, the OP-17 English case saves $290.88 across twelve boxes against buying singles — real money, worth having if the twelve boxes have a plan. The OP-17 Japanese case costs $2.16 more across twelve than the same boxes bought one at a time. Same store, same week, same label on the outer carton. The label did none of that. The division did all of it.",
      "So the habit to take from this article is smaller than a case: two divisions, run every time, before the money moves. Case price by boxes. Box price by packs. Two minutes of arithmetic is the cheapest due diligence in this hobby — and the only version of 'bulk discount' that has ever been guaranteed.",
      "The case question usually hides an investment question, so read [whether Japanese cards are a good investment](/blog/are-japanese-pokemon-cards-a-good-investment/) before committing case money. Every figure in this article came from dividing by pack counts — [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) is the reference table behind the math. And if you're importing a case from Japan yourself, [the shipping, customs, and proxy breakdown](/blog/buying-tcg-from-japan-shipping-customs-proxy/) shows what the case really costs landed.",
      "A case only holds its value if it survives storage: [how to store sealed booster boxes](/blog/how-to-store-sealed-booster-boxes/) covers the conditions that quietly destroy the premium the math above depends on."
    ]
  },
  "should-you-open-or-keep-sealed-booster-box": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "No. Sealed preserves the premium and keeps every option open, but it doesn't promise appreciation — sets cool, demand moves, and tastes change. Sealed is the reversible choice, not the risk-free one. If a box must gain value for the purchase to make sense, the purchase doesn't make sense.",
        "q": "Does keeping a box sealed guarantee it gains value?"
      },
      {
        "a": "No — and this is the most common misunderstanding of the 'open half' strategy. The sealed premium belongs to the intact, unopened box. Once the wrap is broken, the remaining packs are loose packs and price as loose packs, even if you never open them. Open-half works at the box level — open one box, keep a second box sealed — not inside a single box.",
        "q": "If I open half the packs, does the box keep its sealed value?"
      },
      {
        "a": "As long as your stated horizon says — which means the honest answer is: until the date or exit condition you set when you bought it. If you never set one, set it now. Indefinite holds by default are how both the enjoyment and the premium quietly expire.",
        "q": "How long should I keep a box sealed?"
      }
    ],
    "h1": "Should You Open Your Booster Box or Keep It Sealed?",
    "intro": [
      "Direct answer: open what you bought to enjoy. Keep a box sealed only when you can name the reason and the horizon — 'I'll hold this for three years because sealed special sets are my thing' is a reason; 'it might go up' is a hope wearing a strategy's clothes. The shrink wrap makes the decision feel permanent. It isn't quite. But it is one-directional, and that asymmetry is what this article prices.",
      "This is for anyone with a sealed box on the shelf and an itch. It is not for anyone who needs a box to be an ATM: if the money in that box has a job to do on a deadline, no cardboard rectangle should be holding it."
    ],
    "metaDescription": "Open your booster box or keep it sealed? The sealed premium explained with real prices, plus a decision framework — before the wrap decides for you.",
    "metaTitle": "Open It or Keep It Sealed? The Booster Box Decision",
    "readMinutes": 9,
    "sections": [
      {
        "h": "The sealed premium: what the plastic is actually worth",
        "math": [
          "SV11B Black Bolt sealed: $152.65 ÷ 140 cards = $1.09 per card, with a guaranteed structure",
          "SV11B opened: value = the sum of the singles you actually pulled — unknown until you open",
          "The sealed premium = sealed price − expected singles sum. Direction: usually positive. Exact size: unknowable before you open",
          "M6a 30th Celebration sealed: $207.50 ÷ 120 cards = $1.73 per card, every card holo"
        ],
        "paragraphs": [
          "A sealed box carries a premium over the cards inside it, and that premium is real money. Take SV11B Black Bolt at our shelf price as of October 21, 2026: [the box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) is $152.65 for 140 cards. The moment you open it, the box stops being a box. Its value becomes the sum of whatever singles you pulled — and for most boxes of most sets, that sum lands below the sealed price. The gap between the two numbers is the sealed premium, and opening is how you spend it.",
          "Buyers sometimes talk about the premium as if it were a markup trick. It isn't. It's the price of two concrete things: certainty (a sealed box's structure is guaranteed; an opened box's contents are whatever variance dealt you) and optionality (a sealed box can still become anything — a gift, a hold, a draft night, a sale — while an opened box can only be the cards it turned out to be). Certainty and options cost money in every market. This one is no different.",
          "Why can't we give you the exact premium for your box? Because the singles sum depends on your specific pulls, and anyone quoting you a precise expected return on a specific sealed box is inventing numbers. The honest version: the premium exists, it is usually positive, and opening spends it whether your pulls are glorious or grim.",
          "One refinement matters: the premium is not the same size on every box, because the floor under the singles sum isn't the same. A standard box can, in principle, whiff almost completely. A set built like M6a cannot fall as far — every one of its 120 cards is holo, and every pack guarantees one of its 30 Pikachu cards, so the singles sum starts from a higher floor. That doesn't make opening M6a safe. It makes its premium smaller relative to its price, which is exactly what the per-card division shows you before the wrap comes off: $1.73 per guaranteed-holo card, set against Black Bolt's $1.09 per card of unknown finish."
        ]
      },
      {
        "h": "Three ways to play it",
        "paragraphs": [
          "Every sealed box on every shelf is in one of these three states, whether its owner chose the state or drifted into it.",
          "Note the asymmetry the table exposes: keeping sealed is the only fully reversible choice. That is worth something. It is just not worth everything — a box kept sealed for a decade by someone who wanted to open it represents a decade of deferred enjoyment, and enjoyment was the product.",
          "Notice what the third column quietly admits: the split strategy only works across two boxes, never inside one. Break the wrap on a single box and the sealed premium on its still-unopened packs dies with it — loose packs price as loose packs, as the FAQ below spells out. Splitting therefore costs two boxes, which is why it suits deliberate collectors, and not anyone who stretched to afford the first one."
        ],
        "table": {
          "head": [
            "",
            "Open it now",
            "Keep it sealed",
            "Open one, keep one"
          ],
          "rows": [
            [
              "Enjoyment",
              "Full — the box does its job today",
              "Deferred — enjoyment becomes watching a price",
              "Both — one box for joy, one for the shelf"
            ],
            [
              "Expected value",
              "The singles sum, usually below the sealed price",
              "The sealed price, preserved while unopened",
              "Half the premium spent, half preserved"
            ],
            [
              "Liquidity",
              "Singles sell one by one; slow, effortful",
              "One item, one buyer; the fastest exit",
              "Mixed — a sealed box to sell, singles to trade"
            ],
            [
              "Regret profile",
              "Whiff regret: 'I should have sold it sealed'",
              "Opportunity regret: 'I never even enjoyed it'",
              "Hedged — smaller regrets in both directions"
            ],
            [
              "Reversibility",
              "None — a box cannot be un-opened",
              "Total — you can always open it later",
              "Partial — the opened box is spent, the sealed one isn't"
            ]
          ]
        }
      },
      {
        "h": "The framework: four questions before the wrap comes off (or doesn't)",
        "note": "From the Warehouse side of the counter, the pattern we see is buyers asking us in chat whether they should open the box they just bought. What they're really asking for is permission. Our answer is always some version of: we can price the box for you, but we can't want it for you. The boxes people regret are rarely the opened ones or the sealed ones — they're the ones decided by drift.",
        "paragraphs": [
          "One: why did you buy it? If you bought [M6a](/product/m6a-30th-celebration-booster-box-japanese-poke-mon-tcg/) because 30 Pikachu cards with one guaranteed in every pack made you grin, the box already told you its job. Shelving it converts a joy purchase into a speculation you never signed up for. If you bought it as a deliberate hold, the reverse applies — opening it on a whim spends a position you built on purpose.",
          "Two: what is your horizon, in actual time? 'Long term' is not a horizon. A date is. If you can't attach a rough date and a rough exit condition, you don't have a hold strategy — you have a box and a mood. This is the same discipline we apply to [pre-orders](/blog/preorder-japanese-booster-box-or-wait/): name the condition under which the decision changes, before the moment arrives and decides for you.",
          "Three: would you buy it again at today's price? The classic test, and it cuts both ways. If your sealed box has risen and you wouldn't rebuy it at the current shelf price, you're no longer holding a thesis — you're holding inertia. And if you would rebuy it happily, opening it 'because it's worth more now' makes even less sense than it did on day one.",
          "Four: where will it live? A sealed box is a physical object with enemies — heat, humidity, sunlight, shelf wear, the slow crush of other boxes stacked on it. Our [guide to storing sealed boxes](/blog/how-to-store-sealed-booster-boxes/) covers the specifics. The short version: a hold strategy without a storage plan quietly converts premium into damage."
        ]
      },
      {
        "h": "Regret runs in both directions",
        "paragraphs": [
          "Open-and-whiff: you tear a box, the pulls land below the premium, and the loss feels like a verdict on the decision. It isn't one. You bought variance and received variance; the decision and the outcome are different things. The recovery is boring and real — the singles are still cards: gradeable, tradeable, sellable one by one. And the experience itself was the thing the premium had been renting you all along. Judge the decision by the framework you used, not by the pull you got.",
          "Sealed-forever: the quieter failure. The box appreciates or it doesn't, but either way, it sat. Storage risk compounds, tastes move on, the set's moment passes, and the 'someday' exit keeps moving one more season into the future. The recovery: put the exit condition in writing at the moment you buy — a date, a price, an occasion — and let the written version overrule the mood of the month. And if the box's job was always joy, schedule the opening like the event it is instead of waiting to feel ready.",
          "Then there's the meta-risk that covers both directions: treating this as an investment decision at all when the sums involved are hobby-sized. We wrote the longer version of that warning in [our breakdown of Japanese cards as an investment](/blog/are-japanese-pokemon-cards-a-good-investment/). The short version: the sealed premium is a fee for fun and optionality. Fees are fine. Mistaking them for yield is how collectors become reluctant, unhappy speculators."
        ]
      },
      {
        "h": "The Japanese-box wrinkle",
        "paragraphs": [
          "The boxes on our shelves are Japanese-language product, and that changes the texture of this decision without changing its logic. A sealed Japanese box is a standardized, globally understood object — the [case and box math](/blog/sealed-case-vs-booster-box-the-math/) works the same way in any country. Opened Japanese singles, meanwhile, enter a collector market that prizes exactly what Japanese sets do best: print quality, and structures like M6a's all-holo run or SV11's AR-or-better Unova treatment. The premium exists on both sides of the decision; the framework — reason, horizon, rebuy test, storage — doesn't care which language is printed on the box.",
          "One more wrinkle, named honestly: the [god pack](/blog/what-is-a-god-pack-japanese-pokemon/). The small chance of a monster pack is part of what the sealed premium prices in, and opening to chase it is the purest form of spending the premium on variance. That's a legitimate purchase — entertainment is a legitimate purchase — as long as you know it's the transaction you're making."
        ]
      },
      {
        "checklist": [
          "Name the box's job in one sentence: open for joy, hold with a horizon, or split across two boxes",
          "Write the hold conditions down — a date or a price at which you will re-decide, not 'someday'",
          "Run the rebuy test: would you buy this exact box again at today's shelf price?",
          "Check the storage: cool, dry, dark, uncrushed — or the premium is quietly leaking",
          "Price the premium honestly: box price minus a realistic singles sum is what opening costs",
          "If opening: do it on purpose, not on impulse — make it the event you paid for",
          "If keeping sealed: put the review date in the calendar now, while the decision is fresh"
        ],
        "h": "Before you decide: the checklist",
        "paragraphs": [
          "Work through these in order. Most boxes fail at question one — nobody ever actually said what the box was for."
        ]
      }
    ],
    "slug": "should-you-open-or-keep-sealed-booster-box",
    "takeaway": [
      "A sealed box is an option; an opened box is an experience. Options are worth money and experiences are worth money, and the sealed premium is simply the exchange rate between them. Neither choice is the smart one in the abstract. The smart one is the choice you made on purpose, with a reason and a date attached to it.",
      "Still torn on a specific box? Tell us which one in chat and we'll walk through its numbers with you. The [Black Bolt box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/) and the [M6a box](/product/m6a-30th-celebration-booster-box-japanese-poke-mon-tcg/) come up most often, and the framework above is exactly the one we'll use."
    ]
  },
  "what-is-a-god-pack-japanese-pokemon": {
    "datePublished": "2026-10-19",
    "faqs": [
      {
        "a": "Nobody knows, and that is the honest answer. The printer has never published god pack odds for any set, so every precise figure in circulation is a guess. What you can know exactly is a set's guaranteed structure — packs, cards, holo rates, per-pack floors — which is why boxes should be priced on the guarantee, never the jackpot.",
        "q": "What are the odds of pulling a god pack?"
      },
      {
        "a": "Exceptionally loaded packs surface in English product from time to time, but the god pack as a documented, named phenomenon is overwhelmingly a Japanese-set story. The reason is print structure: smaller sets and guaranteed-holo special sets make a fully loaded pack a real print event in Japanese product.",
        "q": "Do English Pokémon sets have god packs?"
      },
      {
        "a": "The printer does not document god packs set by set, so there is no official list to check. What is documented about M6a is stronger in a way: every card in the set is holo, and one of 30 Pikachu cards is guaranteed in every pack, so the floor of an M6a pack is already higher than the bulk ceiling of a normal pack. You do not need a jackpot for an M6a pack to feel loaded.",
        "q": "Does M6a 30th Celebration have god packs?"
      }
    ],
    "h1": "What Is a God Pack? (And Why Japanese Boxes Feel Rigged in Your Favor)",
    "intro": [
      "A god pack is a Japanese Pokémon pack where every card inside — or very nearly every card — is a high-rarity hit. No commons padding the middle. No bulk at the back. You tear the wrapper and the whole pack is art rares, ultra rares, and textured chase cards. God packs are a documented feature of Japanese print runs, not a rumor, and they are the biggest single reason opening Japanese product feels different from opening English.",
      "Now the part most explainers skip. The printer publishes no odds for god packs. None. Every precise figure you have ever seen — one in so many packs, one in so many boxes — is a guess wearing a statistic's clothes. This page will not hand you a fake number. It will hand you the things you can actually verify: the guaranteed pack structures written into real sets, the true per-card cost of the most generous box we sell, and a checklist for judging any set that sells itself on jackpot pulls."
    ],
    "metaDescription": "What is a god pack in Japanese Pokémon? The definition, what M6a's all-holo structure costs per card, and why the guarantee beats the jackpot.",
    "metaTitle": "What Is a God Pack? Japanese Pokémon's Best Pull Explained",
    "readMinutes": 8,
    "sections": [
      {
        "h": "What a god pack actually is",
        "paragraphs": [
          "In a normal pack, rarity is a pyramid: a wide base of commons and uncommons, with one or two cards of genuine interest near the back. A god pack inverts the pyramid. Every slot that would normally hold bulk holds a hit instead. Collectors named it well — it feels less like opening a pack and more like being handed a prize.",
          "God packs are seeded into Japanese print runs at very low rates. Nobody outside the printer knows the seeding rate, and the rate almost certainly varies from set to set. They surface often enough that the community documents them constantly, and rarely enough that opening one is still an event years into a set's life. Both halves of that sentence matter. Anyone who collapses them into a single odds figure is inventing it.",
          "Why Japan? Print structure. Japanese sets are smaller than their English counterparts, and special Japanese sets carry guarantees English sets do not — entire sets where every card is holo, packs built with a guaranteed floor — and that structure is exactly where god packs live. The phenomenon is not magic. It is manufacturing."
        ]
      },
      {
        "h": "The money layer: what generosity actually costs (M6a, by the numbers)",
        "math": [
          "Store price, as of October 20, 2026: $207.50 per box",
          "Cards per box: 20 packs × 6 cards = 120 cards",
          "Cost per pack: $207.50 ÷ 20 packs = $10.38 per pack",
          "Cost per card: $207.50 ÷ 120 cards = $1.73 per card",
          "Holo rate: 120 of 120 cards — 100%, guaranteed by the set's design, not left to chance"
        ],
        "paragraphs": [
          "Forget the jackpot for a moment and price the guarantee. The most generous structure we currently sell is M6a 30th Celebration, released September 16, 2026. Every one of its 120 cards is holo. It prints 30 different Pikachu cards and guarantees one in every pack. It introduces a brand-new rarity tier, FUR (Futuristic Rare), puts Mew ex and Mewtwo ex in art by YOSHIROTTEN, and folds in Classic Collection reprints of iconic cards, across 103 base cards plus secret rares. That is the baseline — before any luck is involved."
        ]
      },
      {
        "h": "Reading the math against a standard box",
        "paragraphs": [
          "That $1.73 figure is the whole argument. You are not paying for a chance at generosity with M6a — you already bought the generosity. Compare a standard structure: SV11B Black Bolt is $152.65 a box as of October 20, 2026, which works out to $7.63 a pack and $1.09 a card across 140 cards — cheaper per card, but the rarity is distributed the normal way, with 86 or more secret cards spread across the set rather than a holo waiting in every slot.",
          "Neither structure is a rip-off. They are different products wearing similar boxes. M6a charges more per card and hands you certainty; a standard box charges less per card and hands you distribution. The per-card math is how you tell them apart before the money moves, instead of after the wrappers are on the floor."
        ]
      },
      {
        "h": "Pack structures, side by side",
        "paragraphs": [
          "When a set markets itself as generous, this is the table to build before you buy. Guarantees are written down by the manufacturer. Jackpots are not."
        ],
        "table": {
          "head": [
            "Format",
            "Packs per box",
            "Cards per pack",
            "Total cards",
            "What is actually guaranteed"
          ],
          "rows": [
            [
              "Standard Japanese box (SV11B Black Bolt / SV11W White Flare)",
              "20",
              "7",
              "140",
              "Standard rarity distribution; the set holds 86+ secret cards, and all 156 Unova Pokémon appear at AR or better across the set"
            ],
            [
              "M6a 30th Celebration box",
              "20",
              "6",
              "120",
              "Every card holo; one of 30 Pikachu cards in every pack; brand-new FUR rarity tier"
            ],
            [
              "SV11 Deluxe box",
              "4",
              "35",
              "140",
              "AR or better in every pack — fewer, much fatter packs"
            ]
          ]
        }
      },
      {
        "h": "What the table is telling you",
        "paragraphs": [
          "Three honest structures, three different bets. The standard box spreads its value across 140 cards and a deep secret-rare pool. M6a trades total cards for a 100 percent holo rate. The Deluxe box compresses the same 140 cards into four packs with an AR floor in each one. A god pack, where one exists in a print run, sits on top of any of these as pure variance. It is not a fourth structure, and it should never be priced as one."
        ]
      },
      {
        "h": "The honest math: a god pack does not change expected value",
        "paragraphs": [
          "Here is the sentence this page exists to say. A lottery ticket does not become a strategy because the prize is beautiful. A god pack is a low-probability event seeded into a print run, and low-probability events are already accounted for in what a box is worth. The expected value of a box is its baseline contents — the guaranteed structure, the ordinary distribution — not its best-case outcome.",
          "So what generosity can you actually bank? The guaranteed kind. A 100 percent holo rate pays out on every pack, every box, every time. A guaranteed Pikachu per pack pays out twenty times per M6a box. A guaranteed AR floor pays out in every Deluxe pack. Those are certainties you can price with the arithmetic above. The god pack is the story you tell afterward, if variance smiles at you. Buy the certainties. Let the story be a bonus."
        ]
      },
      {
        "h": "The failure mode: buying boxes to hunt god packs",
        "note": "The question we get most about god packs is some version of: which box gives me the best chance? Our answer never changes, because it can't — nobody can quote you a chance. The printer has never published one. What we can do is walk you through what each box guarantees in writing: the packs, the cards, the holo structure, the floor per pack. If any seller answers the chance question with a percentage, they are inventing it on the spot.",
        "paragraphs": [
          "The failure mode is easy to recognize because it feels like enthusiasm. A collector buys a box hunting a god pack, misses, and buys another. But the boxes were never priced for that hunt — each one was priced for its baseline — so the hunter pays baseline money, repeatedly, for a jackpot the printer never promised and never priced. Variance does not keep accounts. Box nine owes you nothing because boxes one through eight were ordinary.",
          "The recovery is a single question, asked before purchase and answered honestly: would I buy this box at this price if god packs did not exist? If yes, buy it and enjoy whatever variance adds. If no, the purchase was never about the box — it was a wager, and wagers should be sized like wagers, not like collecting. And if what you truly want is one specific chase card, the non-gambling route exists: buy the card. It feels less romantic. It is considerably cheaper than romance, repeated nine boxes deep."
        ]
      },
      {
        "h": "Context: why god packs are a Japanese story",
        "paragraphs": [
          "Open English product long enough and you will occasionally hit a suspiciously loaded pack. But the god pack as a recognized, named phenomenon belongs to Japanese sets, and the reason is structural rather than cultural. Smaller sets mean rarity is less diluted. Special sets with guaranteed holos and guaranteed floors raise the baseline so high that a fully loaded pack becomes a plausible print event instead of a fantasy. Japanese manufacturers engineer the per-pack experience; the god pack is what that engineering looks like at its extreme.",
          "It also means the concept does not transfer cleanly. Chasing the same thrill in English product means chasing a structure that was never built to produce it. If the god pack dream is what you are buying, buy the product whose print structure actually contains it."
        ]
      },
      {
        "h": "Who this is for — and who it is not for",
        "paragraphs": [
          "This is for openers: collectors who buy Japanese boxes to tear into them, and who want to know what they are actually paying for before the wrapper comes off. It is for anyone who has watched a god pack video and felt their wallet lean forward.",
          "It is not for investors looking for an edge, because there is no edge here to find. The odds are unpublished, the expected value is the baseline, and a phenomenon the whole market knows about is priced in by definition. If your plan requires pulling a god pack, you do not have a plan. You have a hope with a receipt."
        ]
      },
      {
        "checklist": [
          "Read the guaranteed structure first: packs per box, cards per pack, and what is promised per pack or per box.",
          "Run the per-card math — box price divided by total cards — and compare it against a standard box before paying any premium.",
          "Separate the guarantee from the jackpot. If the pitch leans on god packs, price that part at zero and judge what remains.",
          "Ask anyone quoting god pack odds for their source. There is no published source; that ends the conversation.",
          "Apply the test: would I buy this box if god packs did not exist? Buy only when the answer is yes.",
          "Decide in advance whether you are paying for a baseline or gambling on variance. Only one of those is a plan."
        ],
        "h": "The checklist: judge any 'generous' set in two minutes",
        "paragraphs": [
          "Run any set through these six checks before you pay a premium for its reputation."
        ]
      }
    ],
    "slug": "what-is-a-god-pack-japanese-pokemon",
    "takeaway": [
      "God packs are real, they are thrilling, and they are not a strategy. The generosity you can take to the bank in Japanese Pokémon is structural — a 100 percent holo rate in M6a at $1.73 a card as of October 20, 2026, an AR floor in every Deluxe pack, a Pikachu guaranteed in every M6a pack. Price the structure. Enjoy the jackpot if it comes. Never confuse the two.",
      "If you are weighing a Japanese box right now, build the little table from this page for it — packs, cards, guarantee, cost per card — and the decision usually makes itself. And if you ever tear open a pack and find hit after hit after hit, you will know exactly what you are holding: not a system working. Just variance, smiling.",
      "Chasing structure instead of jackpots starts with knowing what each box actually contains: [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/) lays out the verified counts side by side. Collectors who pull a genuine chase card face the next question — [what a master set is and what it costs to build one](/blog/what-is-a-master-set-pokemon/) — and anyone tempted to treat a lucky pull as an investment should read [our honest investment breakdown](/blog/are-japanese-pokemon-cards-a-good-investment/) first.",
      "If the all-holo structure of special sets appeals to you, the current head-to-head is [Black Bolt vs White Flare](/blog/black-bolt-vs-white-flare-which-to-buy/) — two sets built on the same skeleton, priced $12.88 apart, with the full comparison run.",
      "For the set that applied god-pack logic to an entire release, read the [M6a 30th Celebration buyer's guide](/blog/m6a-30th-celebration-buyers-guide/) — every card holographic, a Pikachu in every pack, and the per-card math that comes with that structure."
    ]
  },
  "what-is-a-master-set-pokemon": {
    "datePublished": "2026-10-21",
    "faqs": [
      {
        "a": "Usually not by much, and often not at all. A completed master set can attract a completion premium from a buyer who values the work being done, but most sets change hands near the sum of their card values — and selling 200 cards one by one frequently nets more, slowly. Build a master set because you want to own it. Treating it as an investment vehicle is a separate question, which we take apart in our investment guide.",
        "q": "Is a finished master set worth more than the sum of its cards?"
      },
      {
        "a": "That depends on which definition you chose — which is exactly why you choose before buying. In the strict definition, yes: every parallel and variant printing counts, including reverse holos in English sets. In the common definition most collectors use, the set is complete with the numbered cards and all secret rares, and parallels are optional. Neither is wrong. Switching definitions halfway through a build is what gets expensive.",
        "q": "Do reverse holos and variants count toward a master set?"
      },
      {
        "a": "Plan in months, not weekends. The bulk of a modern set can be assembled quickly through boxes and bulk singles; the tail — the top secret rares — decides the real timeline, because those cards move at their own prices and availability. Collectors who finish are the ones who picked a pace their budget could sustain for the whole list, not the ones who sprinted through the cheap ninety percent.",
        "q": "How long does it take to complete a master set?"
      }
    ],
    "h1": "What Is a Master Set in Pokémon? The Complete Collector's Definition",
    "intro": [
      "A master set is one copy of every card in a set — not just the numbered base set, but the cards hiding above the number line too. The strict definition counts everything: the base set, every secret rare, and every variant printing the set contains, including reverse holos where they exist. The common definition — the one most collectors actually build — counts the full numbered set plus all of its secret rares, and treats variant printings as optional. Both definitions are legitimate. They are not the same size, the same price, or the same amount of work, and deciding which one you mean before you buy a single card is the entire game.",
      "This guide is for collectors considering a master set of a Japanese Pokémon set — what the commitment actually contains, what it costs in binder space and in money, and how the alternatives compare. It is not for anyone looking for a fast project or a quiet flip: a master set is the slowest, most expensive way to own a set, and this page shows the arithmetic instead of hiding it. If the definitions of AR, SAR, and the rest are new to you, start with [Japanese Pokémon rarity symbols explained](/blog/japanese-pokemon-rarity-symbols-explained/) — a master set is built out of exactly those letters."
    ],
    "metaDescription": "What a Pokémon master set actually contains, what it costs in binder slots and money, and how to choose between a master set, a base set, or sealed.",
    "metaTitle": "What Is a Master Set? Pokémon Master Set Guide",
    "readMinutes": 10,
    "sections": [
      {
        "h": "What a master set actually contains",
        "paragraphs": [
          "Work from the inside out. The base set is every card with a set number — the commons, uncommons, and regular rares that form the numbered list. Above the number line sit the secret rares: full-art cards, special art rares, and gold cards whose numbers run past the base set's total. In modern Japanese sets this secret layer is not a garnish. It is where most of the set's art, and most of its cost, lives.",
          "Take SV11B Black Bolt as the worked example, because its scale is honest about what 'modern' means. SV11B places all 156 Unova Pokémon as Art Rare or better, and the set carries 86 or more secret rares above its base list. Read that slowly: one hundred and fifty-six Pokémon at illustration-rare level or above. A master set of SV11B is not a base set with a few chase cards taped on — the chase layer is the majority of the project, and you can browse the shape of it on the [SV11B set hub](/sets/sv11-black-bolt-white-flare/) before committing to anything.",
          "Variants are the third layer, and the one the two definitions argue about. English sets print a reverse-holo parallel of nearly every base card, so a strict English master set roughly doubles the base chase. Japanese sets structure their variants differently — the variant weight sits in the secret slots rather than in a full parallel mirror of the base set — which is one reason Japanese master sets are the more attainable version of this project. Whichever language you build in, write your definition down. Strict or common. Everything after that is just shopping.",
          "Every card in the set carries the same set mark and a collector number, and a master set is tracked against that numbering: base cards at or below the set's printed total, secret rares above it. That numbering is the project's skeleton. A binder page with a gap in the sequence is the whole hobby in miniature — you can see exactly what is missing, what it will take to fill the hole, and whether the remaining gaps are commons or the expensive kind of empty."
        ]
      },
      {
        "h": "The binder math nobody does first",
        "math": [
          "A modern Japanese base set, at real shelf scale: 103 cards",
          "Secret rares above the number line, at SV11B scale: 86+ cards",
          "103 + 86 = 189 cards — before a single variant",
          "189 ÷ 12 cards per binder page = 15.75 → 16 pages minimum",
          "Add variant slots and the set's own bulk, and plan on a dedicated binder, not spare pages"
        ],
        "paragraphs": [
          "Here are two real numbers from sets on our shelf. The base set of [M6a 30th Celebration](/sets/m6a-30th-celebration/) runs 103 cards before its secret rares. SV11B hides 86 or more secret rares above its number line. A set that combined both scales — and modern Japanese sets live at roughly this size — needs 189 slots before you count one variant, one duplicate you keep for trading, or one card you simply like enough to double-slot.",
          "Sixteen pages of a twelve-pocket binder, minimum, for one set. Collectors consistently plan binder space for the base set they can see and then discover the secret layer needs a second home. Do this arithmetic for your target set before the first purchase, and buy the binder for the finished number, not the starting one. The same discipline applies to product: a [booster box's pack count](/blog/how-many-packs-in-a-booster-box/) tells you how much of the base set a box can even show you, which is the next calculation."
        ]
      },
      {
        "h": "The money layer: where the cost actually sits",
        "note": "The sentence the Warehouse hears most from master set builders is 'I am only missing a few cards.' Those few cards are almost always the same few — the top secret rares — and they regularly cost more than everything already sitting in the binder. Nobody regrets finishing a master set of a set they loved. Plenty regret starting one just because a set was new.",
        "paragraphs": [
          "A master set's cost is not spread across its cards; it is stacked at the top. The pattern is well known to anyone who has finished one: the last ten percent of the list costs more than the first ninety percent combined. The base set assembles almost by accident — a few boxes, some bulk singles, some trades. The secret rares thin out as you climb, until the final handful of Special Art Rares are effectively the price of the entire project wearing a trench coat.",
          "This is also why opening boxes is the romantic route and rarely the completing one. A box shows you a small number of secret-rare slots against a list of 86 or more in a set like the [SV11B Black Bolt booster box](/product/sv11b-black-bolt-booster-box-japanese-pokemon-card/)'s home set — the arithmetic does not close, no matter how good the box feels. Boxes are for the base set, the mid-tier secrets, and the joy of pulling something yourself; phenomena like [god packs](/blog/what-is-a-god-pack-japanese-pokemon/) are real, but they are seasoning, not a completion strategy. The tail of a master set is bought as singles, one deliberate purchase at a time. Price the top ten cards on your list before you start, because that number — not the box price — is your real budget.",
          "Duplicates deserve a line in the budget too. Boxes and bulk lots leave every builder holding spares — extra base cards, repeated mid-tier secrets — and those spares are not waste. Current-set duplicates are trade stock: they convert, at local meetups and in shop trades, into list cards you have not pulled. Builders who move duplicates as they go quietly fund a real share of the tail. Builders who let four copies of everything pile up in a box are storing money at zero interest and calling it a collection byproduct. Set your duplicate rule at the start — keep one, move the rest — and the build gets cheaper without getting slower."
        ]
      },
      {
        "h": "Decision layer: master set vs the alternatives",
        "paragraphs": [
          "Most collectors standing where you are standing are actually choosing between four different projects that all get called 'collecting the set.' They end with different shelves, different costs, and different regrets. Pick by the right-hand column, not by habit."
        ],
        "table": {
          "head": [
            "Approach",
            "What you end up owning",
            "Cost shape",
            "Best for"
          ],
          "rows": [
            [
              "Master set (strict)",
              "Every card, every secret rare, every variant",
              "Highest — the tail dominates everything",
              "Completists who genuinely love this specific set"
            ],
            [
              "Master set (common)",
              "Full numbered set plus all secret rares",
              "High — secrets still dominate, variants skipped",
              "Most collectors who say 'master set' and mean it"
            ],
            [
              "Base set only",
              "The numbered set, nothing above the line",
              "Lowest of the completion routes",
              "Display collectors and binders on a budget"
            ],
            [
              "Singles highlights only",
              "Just the chase cards you actually love",
              "Pay only for the top end, nothing else",
              "Character collectors who never wanted the commons"
            ]
          ]
        }
      },
      {
        "h": "Risk layer: how master set builds go wrong",
        "paragraphs": [
          "The first failure mode is starting a master set of a set you do not love. At card fifty, enthusiasm carries you. At card one hundred and sixty, with the expensive tail still ahead, only actual affection for the set finishes the job — and an unfinished master set is the worst object in the hobby: too complete to abandon comfortably, too incomplete to display proudly, and worth less than its parts because the parts were bought at retail one at a time. If you would not enjoy the binder at ninety percent, do not start it at zero.",
          "The second failure mode is price movement mid-build. Cards spike when a set is new and loud, and drift when the next set takes the attention. That leaves two honest schools for the expensive tail. Buy the costly cards first: you lock the pain in early, while the set is liquid and every card is findable, and the rest of the build gets cheaper as you go. Or buy them last: you spend months learning the set's real prices instead of its launch prices, and some builders watch the tail cool considerably. Both schools have finished many sets. The losing move is the third one nobody admits to — buying the tail impulsively, mid-build, at spike prices, because a listing felt urgent.",
          "Recovery, if a build stalls: pause purchases rather than forcing them, sell or trade your duplicates while the set is current, and consider formally downgrading your target from the strict definition to the common one. A finished common-definition set you are proud of beats a strict build abandoned at eighty percent — and protecting the expensive centerpieces you do own matters more than the count, which is where [PSA grading Japanese cards](/blog/psa-grading-japanese-cards-worth-it/) becomes a real question rather than a default."
        ]
      },
      {
        "h": "Context layer: Japanese vs English master sets",
        "paragraphs": [
          "The same set is a different project in each language. Japanese sets release first, their variant weight sits in the secret slots rather than in a parallel mirror of the base set, and Japanese print quality gives the centerpiece cards a cleaner starting point if grading enters the plan later. English sets add the reverse-holo layer across nearly the whole base set, which makes the strict definition substantially larger — a fact that surprises collectors who priced the project using Japanese numbers. The full comparison is in [Japanese vs English Pokémon cards](/blog/japanese-vs-english-pokemon-cards-which-to-buy/) and the shorter [Japanese vs English guide](/guides/japanese-vs-english-pokemon-cards/).",
          "One more practical difference: because Japanese sets arrive first, their singles market sets the early prices for everything. Building the Japanese master set means shopping in the market that moves first — better availability of the tail early, launch-window prices to match. Whether that trade suits you is a budget question, and it connects directly to [whether Japanese Pokémon cards are a good investment](/blog/are-japanese-pokemon-cards-a-good-investment/): a master set is a collection first, and the collectors who finish them treat any value question as secondary."
        ]
      },
      {
        "checklist": [
          "Write your definition down: strict (every variant) or common (numbered set + all secret rares)",
          "Count the slots: base + secrets, then buy a binder for the finished number",
          "Price the ten most expensive cards on the list before buying anything else",
          "Choose your school: expensive tail first, or expensive tail last — on purpose",
          "Set a monthly pace your budget can hold for the whole list, not just the cheap start",
          "Buy boxes for the base and mid-tier secrets; plan to buy the tail as singles",
          "Re-check your definition at the halfway point, before the tail purchases begin"
        ],
        "h": "Before you start: the master set checklist",
        "paragraphs": [
          "Six decisions, made once, in order. Every stalled build we have ever heard about skipped at least one of them."
        ]
      }
    ],
    "slug": "what-is-a-master-set-pokemon",
    "takeaway": [
      "A master set is a definition before it is a purchase: one of every card, with the argument about variants settled in advance. At modern Japanese scale — a base list around a hundred cards and 86 or more secret rares above it — the project is roughly 189 cards, sixteen binder pages, and a budget that lives almost entirely in its final ten percent.",
      "Build one only of a set you love, price the tail before the first box, and buy the bulk cheap and the chase cards deliberately. When you are ready to start, the [Pokémon range](/pokemon-cards/) is where the boxes live — and if you tell the Warehouse which set you are chasing, we will tell you honestly whether its tail is kind or cruel.",
      "Chasing an SV11 master set starts with a box decision: [Black Bolt vs White Flare](/blog/black-bolt-vs-white-flare-which-to-buy/) runs both sets' structure and prices side by side before you commit to either legendary."
    ]
  },
  "which-tcg-should-you-start": {
    "datePublished": "2026-10-24",
    "faqs": [
      {
        "a": "The One Piece OP-18 Japanese booster box at $70, as of October 24, 2026 — the cheapest verified entry box of the three games at the Warehouse. OP-17 runs $101.07 in Japanese and $153.69 in English, and Pokémon's M6a 30th Celebration box is $207.50. Dragon Ball's only verified price here is the FB12 sealed case at $1,265, which is a commitment buy, not a starter.",
        "q": "Which TCG is the cheapest to start?"
      },
      {
        "a": "Pokémon, on the evidence of the catalog: it carries the deepest Japanese import range at the Warehouse, with sets like the SV11 pair — every Unova Pokémon at illustration-rare or better — and M6a, where every card is holographic. One Piece and Dragon Ball are play-first doors; Pokémon is the collector-first one.",
        "q": "Which of the three is best for collecting?"
      },
      {
        "a": "Not for a first buy. A case is a group or commitment purchase — FB12's is $1,265 as of October 24, 2026. Start one box deep in whichever game you choose, live with it for a month, and let that experience — not the discount arithmetic — decide whether a case ever makes sense for you.",
        "q": "Should I start with a sealed case to save money?"
      }
    ],
    "h1": "Which TCG Should You Start? Pokémon vs One Piece vs Dragon Ball Fusion World",
    "intro": [
      "There is no best first trading card game — there is a best first game for a specific person. The three games at the Warehouse are three different doors. Pokémon is the collector-first door, backed by the deepest Japanese import catalog. One Piece is the structured player's game, built around a Leader and a six-color identity system. Dragon Ball Fusion World is the most direct fight of the three: a Leader in play, 8 Life in front of you, and a win that takes one attack more than zeroing your opponent out. The right choice depends on what you will actually do with your Saturdays — hunt cards, play games, or follow one anime.",
      "One boundary before anything else: this comparison is not for anyone choosing a game purely as an investment vehicle. A game you neither collect with love nor play with anyone is a box in a cupboard, whatever it cost. Choose by use first; the cards that hold attention are the ones that get opened, played, displayed, and finished."
    ],
    "metaDescription": "Pokémon, One Piece or Dragon Ball Fusion World first? Compare the three games on collecting, play structure and verified starting prices at the Warehouse.",
    "metaTitle": "Pokémon vs One Piece vs Dragon Ball: Which TCG to Start?",
    "readMinutes": 10,
    "sections": [
      {
        "h": "Pokémon: the collector-first door",
        "paragraphs": [
          "Honesty first about how this comparison treats Pokémon: it runs on catalog depth, set structure, and the Japanese-import experience — because that is what the Pokémon door at the Warehouse actually is. Pokémon carries the deepest Japanese catalog here by a wide margin, and of the three games, this is the one most people enter through collecting: completing sets, chasing specific illustration cards, building binders in numerical order.",
          "The current anchors show the shape of it. The SV11 pair — Black Bolt and White Flare — put every Unova Pokémon at illustration-rare or better across the two sets, which makes the pair a structured collecting project rather than a lottery. M6a 30th Celebration is the anniversary statement: every card in the set holographic, a Pikachu guaranteed in every pack, at $207.50 a box as of October 24, 2026. These are sets designed to be completed and displayed as much as opened.",
          "Notice what kind of project the SV11 pair is: two sets, one Pokédex between them, completed in numerical order. A collector picks a side, works its numbered list, and treats the second set as the sequel rather than a restart. That structure — a finite list, visible gaps, a finish line — is the deep appeal of this door. Nobody 'finishes' a game they play weekly; a master set, by contrast, can actually be completed, and the completion is the trophy.",
          "If Japanese text is the thing holding you back from this door, it should not be: [how to read Japanese Pokémon cards](/blog/how-to-read-japanese-pokemon-cards/) shows how identification runs on set codes, card numbers, symbols, and artwork. And the language-versus-language buying question itself is covered head-on in [Japanese vs English Pokémon cards: which to buy](/blog/japanese-vs-english-pokemon-cards-which-to-buy/)."
        ]
      },
      {
        "h": "One Piece: the structured player's game",
        "paragraphs": [
          "One Piece is a constructed game with a skeleton you can state in one breath: a Leader card, a main deck of exactly 50 cards, and a separate 10-card DON!! deck. No card number may appear more than 4 times, and every card in the deck must match the colors of your Leader. That color lock is the game's whole personality, because the six colors are six genuinely different ways to play."
        ],
        "table": {
          "head": [
            "Color",
            "Identity"
          ],
          "rows": [
            [
              "Red",
              "Aggressive, Rush"
            ],
            [
              "Green",
              "Rest and control"
            ],
            [
              "Blue",
              "Bounce and draw"
            ],
            [
              "Purple",
              "DON!! ramp"
            ],
            [
              "Black",
              "Cost-based KO"
            ],
            [
              "Yellow",
              "Life manipulation and Triggers"
            ]
          ]
        }
      },
      {
        "h": "One Piece, continued: sets and prices",
        "paragraphs": [
          "Your Leader's colors decide which of those games you are playing before the first card is drawn, which is why [One Piece card game colors explained](/blog/one-piece-card-game-colors-explained/) is the natural next read, and [how to build your first One Piece deck](/blog/one-piece-how-to-build-your-first-deck/) turns a chosen color into a legal 50-card list. Box math for planning a pool is in [how many packs are in a booster box](/blog/how-many-packs-in-a-booster-box/).",
          "The current sets frame the entry. OP-17 is the 4th anniversary set, built on the Elbaf arc — the full picture is in the [OP-17 set hub](/sets/op-17-worlds-strongest-warriors/) — and OP-18 follows on November 20, 2026, with Yoshitaka Amano artwork. Verified prices, as of October 24, 2026: the OP-18 Japanese box is $70, the OP-17 Japanese box is $101.07, and the OP-17 English box is $153.69. One Piece is the only one of the three doors with a two-figure entry box."
        ]
      },
      {
        "h": "Dragon Ball Fusion World: the life race",
        "paragraphs": [
          "Fusion World's structure is the most direct of the three. Your Leader starts in play — there is no building toward it. Each player defends 8 Life. When your Life falls to 4 or fewer, your Leader Awakens, and the game you are playing changes character mid-match. Battles carry the signature mechanic: during a fight you may play cards from your hand as Combo, each adding +10,000 power. And the win condition has a sting — reduce the opponent's Life to 0, and then land one more attack. Zero is not the finish; the finish is the hit after zero, which means a player on no Life is never quite dead until that last attack connects. A deck is 50 cards plus the Leader.",
          "The current set is FB12, Reach the God, releasing December 18, 2026: 123 types, and the first Dragon Ball Super: Beerus set. The full breakdown for new players — how a turn flows, what Awaken timing does to your decisions — is in the [Dragon Ball Fusion World beginner's guide](/blog/dragon-ball-fusion-world-beginners-guide/), and the set itself sits in the [FB12 set hub](/sets/fb12-reach-the-god/). One verified price only: the FB12 sealed case is $1,265 as of October 24, 2026. No box price is stated here because none is verified — and a case, in any case, is never a first purchase."
        ]
      },
      {
        "h": "The money layer: verified doors in, side by side",
        "math": [
          "Cheapest verified entry box: One Piece OP-18 Japanese box — $70",
          "OP-17 Japanese box — $101.07 · OP-17 English box — $153.69",
          "Pokémon M6a 30th Celebration box — $207.50",
          "Dragon Ball FB12 sealed case — $1,265 (commitment buy, not a starter)",
          "All prices as of October 24, 2026"
        ],
        "note": "Warehouse Note: The most common first-buy mistake the Warehouse sees is not picking the wrong game — it is picking the right game at the wrong size. A first box teaches you whether a game fits your life. A first case assumes you already know.",
        "paragraphs": [
          "Read the table the right way. One Piece offers the cheapest verified door in: a $70 box starts a real card pool today. Pokémon's current anchor box is an anniversary product, and its $207.50 reflects that occasion — do not mistake the anchor's price for the cost of entering the hobby, but do respect that the current Pokémon headline set is a premium one. Dragon Ball, on verified numbers, currently presents a case price and nothing smaller — treat its entry as reading-led for now: learn the game from the beginner's guide, and let FB12's arrival on December 18, 2026 set the moment to buy in."
        ]
      },
      {
        "h": "The decision table",
        "paragraphs": [
          "Match the person, not the hype. Four common starting positions, and the door each one points to:"
        ],
        "table": {
          "head": [
            "You are...",
            "Start with",
            "Why"
          ],
          "rows": [
            [
              "A pure collector",
              "Pokémon",
              "The deepest Japanese catalog, and sets built to be completed and displayed"
            ],
            [
              "Wanting to play every week",
              "One Piece or Dragon Ball Fusion World",
              "Both are play-first systems built around a Leader and a structured deck"
            ],
            [
              "On the smallest budget",
              "One Piece — the OP-18 box at $70",
              "The cheapest verified entry box of the three, as of October 24, 2026"
            ],
            [
              "An anime fan of one series",
              "That series' game",
              "You will open more packs and play more games when the characters are already yours"
            ]
          ]
        }
      },
      {
        "h": "How a first buy goes wrong",
        "paragraphs": [
          "The failure modes repeat across all three games. Buying the case first — FB12's $1,265 is the extreme example — before you have played or collected a single month of the game, converts curiosity into inventory. Choosing purely as an investment does the same thing slower. Choosing a game nobody around you plays strands the weekly-play door entirely: a constructed game needs opponents, and a beautiful deck with no one across the table is a collection accident. And buying the premium anniversary box as a 'starter' skews the verdict on a whole hobby — you judged the celebration, not the game.",
          "The recovery is the same in every case: shrink the commitment. Start one box deep — or one set's worth of collecting — live with it for a month of real use, and scale only into the game that survived contact with your actual life. The first purchase is tuition. The entire skill is keeping tuition cheap. When you are ready to browse what is actually in stock across all three, the full range is under [Japanese TCG](/japanese-tcg/)."
        ]
      },
      {
        "h": "The calendar layer: when each door opens",
        "paragraphs": [
          "Timing is a real part of this choice, because two of the three doors are mid-swing between sets. One Piece's OP-17 is the current, in-hand set — the 4th anniversary Elbaf release — with OP-18 arriving November 20, 2026. A One Piece starter today buys into a living game with its next set weeks away, not months. Dragon Ball's FB12 does not release until December 18, 2026, which makes Dragon Ball the planned entry of the three: the beginner's guide can be read now, the decision made calmly, and the first purchase timed to the set's arrival rather than to impulse.",
          "Pokémon's anchors are the present tense — the SV11 pair and M6a are current sets with current stock — so the Pokémon collector starts immediately, while the Dragon Ball player starts deliberately and the One Piece player starts now with a sequel already dated. None of these timings is an argument by itself. But a starter who hates waiting should not pick the December door in October and then blame the game for the wait."
        ]
      },
      {
        "checklist": [
          "Name your primary reason honestly: collecting, weekly play, or one beloved series",
          "If playing: pick the game people around you actually play",
          "Start one box deep in that game — never a case",
          "One Piece starters: the $70 OP-18 box is the cheapest verified door (October 24, 2026)",
          "Pokémon collectors: start with the set whose numbered list you want to complete",
          "Dragon Ball: finish the beginner's guide before FB12 lands on December 18, 2026",
          "Reassess after a month of real use — not after a single opening"
        ],
        "h": "Make the call: the starter checklist",
        "paragraphs": [
          "Work through these in order; the first two answer most of the question by themselves."
        ]
      }
    ],
    "slug": "which-tcg-should-you-start",
    "takeaway": [
      "Three games, three honest shapes: Pokémon collects deepest, One Piece structures play best on a budget, and Dragon Ball runs the most direct fight — 8 Life, an Awakening at 4, and one attack beyond zero. None of those is a ranking. They are descriptions, and the right door is the one that matches the Saturdays you actually have.",
      "If the anime fan in you is doing the choosing, trust that answer and skip the agonizing — fandom is a legitimate strategy, because it is the one that keeps you opening, playing, and finishing sets a year from now."
    ]
  }
};

export const POST_SLUGS = Object.keys(POSTS);
