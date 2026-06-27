#!/usr/bin/env python3
"""
SEO Competitor Scraper - Scrapes TCG competitor websites using Firecrawl API
Extracts meta tags, headings, structured data, OG tags, and SEO techniques.
"""

import json
import re
import time
import subprocess
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse

API_KEY = "fc-0e2cc12b5a8a4c1ba0b91c5d17f104f4"
API_ENDPOINT = "https://api.firecrawl.dev/v1/scrape"
OUTPUT_FILE = "/home/z/my-project/seo-research.json"

SITES = [
    {"name": "TCGplayer", "url": "https://www.tcgplayer.com"},
    {"name": "Cardmarket", "url": "https://www.cardmarket.com"},
    {"name": "eBay TCG", "url": "https://www.ebay.com/b/Trading-Card-Games"},
    {"name": "CoolStuffInc", "url": "https://www.coolstuffinc.com"},
    {"name": "CardKingdom", "url": "https://www.cardkingdom.com"},
    {"name": "TrollAndToad", "url": "https://www.trollandtoad.com"},
    {"name": "DACardWorld", "url": "https://www.dacardworld.com"},
    {"name": "Safari-Zone", "url": "https://www.safari-zone.com"},
    {"name": "PlazaJapan", "url": "https://plazajapan.com"},
    {"name": "Hobby-Genki", "url": "https://hobby-genki.com"},
]


class SEOHTMLParser(HTMLParser):
    """Custom HTML parser to extract SEO-relevant data."""
    
    def __init__(self):
        super().__init__()
        self.meta_tags = []
        self.title = None
        self.headings = {"h1": [], "h2": [], "h3": []}
        self.og_tags = {}
        self.twitter_tags = {}
        self.canonical = None
        self.robots_meta = None
        self.structured_data = []
        self.alt_texts = []
        self.links = []
        self.current_tag = None
        self.current_attrs = {}
        self.in_script_ld = False
        self.ld_json_buffer = ""
        self.in_title = False
        self.title_buffer = ""
        self.in_heading = False
        self.heading_level = ""
        self.heading_buffer = ""
    
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        tag_lower = tag.lower()
        
        if tag_lower == "title":
            self.in_title = True
            self.title_buffer = ""
        
        if tag_lower in ("h1", "h2", "h3"):
            self.in_heading = True
            self.heading_level = tag_lower
            self.heading_buffer = ""
        
        if tag_lower == "meta":
            self.meta_tags.append(attrs_dict)
            
            # OG tags
            prop = attrs_dict.get("property", attrs_dict.get("name", ""))
            content = attrs_dict.get("content", "")
            if prop.startswith("og:"):
                self.og_tags[prop] = content
            if prop.startswith("twitter:"):
                self.twitter_tags[prop] = content
            if prop == "description":
                self.meta_tags.append({"name": "description", "content": content})
            if prop == "keywords":
                self.meta_tags.append({"name": "keywords", "content": content})
            if prop == "robots":
                self.robots_meta = content
        
        if tag_lower == "link":
            rel = attrs_dict.get("rel", "")
            if "canonical" in rel:
                self.canonical = attrs_dict.get("href", "")
        
        if tag_lower == "script":
            script_type = attrs_dict.get("type", "")
            if "application/ld+json" in script_type:
                self.in_script_ld = True
                self.ld_json_buffer = ""
        
        if tag_lower == "img":
            alt = attrs_dict.get("alt", "")
            if alt:
                self.alt_texts.append(alt)
        
        if tag_lower == "a":
            href = attrs_dict.get("href", "")
            if href and not href.startswith("#") and not href.startswith("javascript"):
                self.links.append(href)
    
    def handle_data(self, data):
        if self.in_title:
            self.title_buffer += data
        if self.in_heading:
            self.heading_buffer += data
        if self.in_script_ld:
            self.ld_json_buffer += data
    
    def handle_endtag(self, tag):
        tag_lower = tag.lower()
        
        if tag_lower == "title" and self.in_title:
            self.title = self.title_buffer.strip()
            self.in_title = False
        
        if tag_lower in ("h1", "h2", "h3") and self.in_heading:
            text = self.heading_buffer.strip()
            if text:
                self.headings[tag_lower].append(text)
            self.in_heading = False
            self.heading_level = ""
        
        if tag_lower == "script" and self.in_script_ld:
            try:
                ld_data = json.loads(self.ld_json_buffer.strip())
                self.structured_data.append(ld_data)
            except json.JSONDecodeError:
                pass
            self.in_script_ld = False
            self.ld_json_buffer = ""


def extract_meta_description(meta_tags):
    for m in meta_tags:
        if isinstance(m, dict):
            name = m.get("name", "").lower()
            prop = m.get("property", "").lower()
            if name == "description" or prop == "og:description":
                return m.get("content", "")
    return ""


def extract_meta_keywords(meta_tags):
    for m in meta_tags:
        if isinstance(m, dict) and m.get("name", "").lower() == "keywords":
            content = m.get("content", "")
            if content:
                return [k.strip() for k in content.split(",")]
    return []


def extract_seo_keywords(headings, meta_description, title, alt_texts, markdown_content):
    """Extract likely SEO keywords from content."""
    all_text = " ".join([
        title or "",
        meta_description or "",
        " ".join(headings.get("h1", [])),
        " ".join(headings.get("h2", [])),
        " ".join(headings.get("h3", [])),
        " ".join(alt_texts[:20]),  # limit
        (markdown_content or "")[:3000]
    ]).lower()
    
    # TCG-specific keywords to look for
    tcg_keywords = [
        "trading card game", "tcg", "pokemon", "pokémon", "yu-gi-oh", "magic the gathering",
        "mtg", "one piece", "dragon ball", "gundam", "weiss schwarz", "lorcana",
        "booster box", "booster pack", "elite trainer box", "etb", "sealed",
        "japanese", "english", "rare", "holo", "full art", "secret rare",
        "booster bundle", "booster case", "prerelease", "preorder",
        "card shop", "card store", "buy cards", "sell cards", "card singles",
        "deck", "card game", "collectible", "ccg", "tcg cards",
        "pokemon cards", "yugioh cards", "magic cards", "one piece cards",
        "pokemon tcg", "yugioh tcg", "card prices", "card values",
        "freshness packs", "promo cards", "booster draft",
        "pokemon center", "nintendo", "bandai", "konnami",
        "chrome rare", "illustration rare", "special illustration",
        "booster box japanese", "japanese pokemon cards", "japanese tcg",
        "akihabara", "hobby shop", "hobby store", "anime cards",
        "card marketplace", "card trading", "tcg marketplace",
        "pokemon booster", "yugioh booster", "mtg booster",
        "sealed product", "graded cards", "psa", "cgc", "bgs",
    ]
    
    found = []
    for kw in tcg_keywords:
        if kw in all_text:
            found.append(kw)
    
    # Also extract any multi-word phrases that appear frequently
    words = re.findall(r'\b[a-z]{4,}\b', all_text)
    word_freq = {}
    for w in words:
        word_freq[w] = word_freq.get(w, 0) + 1
    frequent_words = [w for w, c in sorted(word_freq.items(), key=lambda x: -x[1]) if c >= 2][:20]
    
    return found + [w for w in frequent_words if w not in found][:10]


def analyze_url_structure(url, links):
    """Analyze URL patterns from links."""
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    
    patterns = set()
    internal_links = []
    for link in links[:50]:
        if link.startswith("/"):
            internal_links.append(base + link)
            patterns.add("relative_paths")
        elif link.startswith(base):
            internal_links.append(link)
            patterns.add("absolute_paths")
        elif link.startswith("http"):
            patterns.add("external_links")
    
    # Extract URL path patterns
    path_patterns = set()
    for link in internal_links[:30]:
        path = urlparse(link).path
        segments = [s for s in path.split("/") if s]
        if len(segments) >= 2:
            path_patterns.add(f"/{segments[0]}/...")
        if len(segments) >= 3:
            path_patterns.add(f"/{segments[0]}/{segments[1]}/...")
    
    return {
        "base_url": base,
        "url_patterns": list(patterns),
        "category_url_patterns": list(path_patterns)[:10],
        "sample_internal_links": internal_links[:15]
    }


def identify_seo_techniques(data, parser, markdown_content):
    """Identify SEO techniques used by the site."""
    techniques = []
    
    if parser.title:
        techniques.append("custom_meta_title")
        title_len = len(parser.title)
        if 30 <= title_len <= 60:
            techniques.append("optimal_title_length")
        elif title_len > 60:
            techniques.append("long_title_over_60_chars")
    
    meta_desc = extract_meta_description(parser.meta_tags)
    if meta_desc:
        techniques.append("meta_description_present")
        if 120 <= len(meta_desc) <= 160:
            techniques.append("optimal_meta_description_length")
    
    if parser.og_tags:
        techniques.append("open_graph_tags")
        if "og:image" in parser.og_tags:
            techniques.append("og_image_specified")
    
    if parser.twitter_tags:
        techniques.append("twitter_card_tags")
    
    if parser.structured_data:
        techniques.append("json_ld_structured_data")
        for sd in parser.structured_data:
            schema_type = sd.get("@type", "")
            if schema_type == "Organization":
                techniques.append("organization_schema")
            elif schema_type == "WebSite":
                techniques.append("website_schema")
            elif schema_type == "Product":
                techniques.append("product_schema")
            elif schema_type == "BreadcrumbList":
                techniques.append("breadcrumb_schema")
            elif schema_type == "ItemList":
                techniques.append("itemlist_schema")
            elif schema_type == "SearchAction":
                techniques.append("search_action_schema")
    
    if parser.canonical:
        techniques.append("canonical_tag")
    
    if parser.alt_texts:
        techniques.append("image_alt_texts")
        if len(parser.alt_texts) > 10:
            techniques.append("comprehensive_alt_texts")
    
    if parser.headings.get("h1") and len(parser.headings["h1"]) == 1:
        techniques.append("single_h1_tag")
    elif parser.headings.get("h1") and len(parser.headings["h1"]) > 1:
        techniques.append("multiple_h1_tags")
    
    if parser.headings.get("h2") and len(parser.headings["h2"]) > 3:
        techniques.append("rich_heading_hierarchy")
    
    # Check for hreflang
    html_lower = (markdown_content or "").lower()
    if "hreflang" in html_lower:
        techniques.append("hreflang_internationalization")
    
    # Check mobile viewport
    for m in parser.meta_tags:
        if isinstance(m, dict) and m.get("name", "") == "viewport":
            techniques.append("mobile_viewport_meta")
    
    if parser.robots_meta:
        techniques.append(f"robots_meta_{parser.robots_meta}")
    
    # Content length indicators
    if markdown_content and len(markdown_content) > 5000:
        techniques.append("substantial_content")
    
    # Internal linking
    if len(parser.links) > 20:
        techniques.append("strong_internal_linking")
    
    return techniques


def scrape_site(site_info):
    """Scrape a single site using Firecrawl API."""
    url = site_info["url"]
    name = site_info["name"]
    
    print(f"\n{'='*60}")
    print(f"Scraping: {name} ({url})")
    print(f"{'='*60}")
    
    # Build curl command
    payload = json.dumps({
        "url": url,
        "formats": ["markdown", "html"]
    })
    
    cmd = [
        "curl", "-s", "-X", "POST", API_ENDPOINT,
        "-H", f"Authorization: Bearer {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", payload,
        "--max-time", "30"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        
        if result.returncode != 0:
            print(f"  ERROR: curl failed with return code {result.returncode}")
            return None
        
        response_text = result.stdout
        if not response_text:
            print(f"  ERROR: Empty response from API")
            return None
        
        response = json.loads(response_text)
        
        if not response.get("success", False):
            error_msg = response.get("error", "Unknown error")
            print(f"  ERROR: API returned error: {error_msg}")
            return None
        
        data = response.get("data", {})
        html_content = data.get("html", "")
        markdown_content = data.get("markdown", "")
        metadata = data.get("metadata", {})
        
        print(f"  Success! HTML: {len(html_content)} chars, Markdown: {len(markdown_content)} chars")
        
        # Parse HTML for SEO data
        parser = SEOHTMLParser()
        try:
            parser.feed(html_content)
        except Exception as e:
            print(f"  WARNING: HTML parsing error: {e}")
        
        # Extract metadata from Firecrawl response too
        fc_title = metadata.get("title", "")
        fc_description = metadata.get("description", "")
        fc_og_image = metadata.get("ogImage", metadata.get("og:image", ""))
        
        # Build comprehensive result
        meta_description = extract_meta_description(parser.meta_tags) or fc_description
        meta_keywords = extract_meta_keywords(parser.meta_tags)
        seo_keywords = extract_seo_keywords(
            parser.headings, meta_description, parser.title, parser.alt_texts, markdown_content
        )
        url_analysis = analyze_url_structure(url, parser.links)
        seo_techniques = identify_seo_techniques({}, parser, html_content)
        
        # Content strategy analysis
        content_strategy = analyze_content_strategy(parser, markdown_content, url)
        
        # Build OG tags with Firecrawl fallbacks
        og_tags = dict(parser.og_tags)
        if not og_tags.get("og:title") and fc_title:
            og_tags["og:title"] = fc_title
        if not og_tags.get("og:description") and fc_description:
            og_tags["og:description"] = fc_description
        if not og_tags.get("og:image") and fc_og_image:
            og_tags["og:image"] = fc_og_image
        
        result = {
            "name": name,
            "url": url,
            "scrape_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "meta_title": parser.title or fc_title or "",
            "meta_description": meta_description,
            "meta_keywords": meta_keywords,
            "headings": {
                "h1": parser.headings.get("h1", []),
                "h2": parser.headings.get("h2", [])[:20],  # Limit
                "h3": parser.headings.get("h3", [])[:20]
            },
            "og_tags": og_tags,
            "twitter_tags": parser.twitter_tags,
            "structured_data": parser.structured_data,
            "canonical_url": parser.canonical,
            "robots_meta": parser.robots_meta,
            "alt_text_patterns": parser.alt_texts[:20],
            "url_structure": url_analysis,
            "internal_link_count": len(parser.links),
            "key_seo_keywords": seo_keywords,
            "content_strategy": content_strategy,
            "seo_techniques": seo_techniques,
            "firecrawl_metadata": metadata
        }
        
        print(f"  Title: {result['meta_title'][:80]}...")
        print(f"  Description: {result['meta_description'][:80]}...")
        print(f"  H1 count: {len(result['headings']['h1'])}")
        print(f"  H2 count: {len(result['headings']['h2'])}")
        print(f"  OG tags: {list(og_tags.keys())}")
        print(f"  Structured data: {len(parser.structured_data)} items")
        print(f"  SEO techniques: {len(seo_techniques)} found")
        
        return result
        
    except subprocess.TimeoutExpired:
        print(f"  ERROR: Request timed out for {name}")
        return None
    except json.JSONDecodeError as e:
        print(f"  ERROR: JSON decode error for {name}: {e}")
        return None
    except Exception as e:
        print(f"  ERROR: Unexpected error for {name}: {e}")
        return None


def analyze_content_strategy(parser, markdown_content, url):
    """Analyze the content strategy of the site."""
    strategy = {}
    
    # Above the fold content
    if markdown_content:
        first_500 = markdown_content[:500]
        strategy["above_fold_preview"] = first_500[:200] + "..." if len(first_500) > 200 else first_500
    
    # Heading analysis
    h1_list = parser.headings.get("h1", [])
    h2_list = parser.headings.get("h2", [])
    
    strategy["primary_h1"] = h1_list[0] if h1_list else ""
    strategy["h1_count"] = len(h1_list)
    strategy["h2_count"] = len(h2_list)
    strategy["h2_topics"] = h2_list[:10]
    
    # Content themes from headings
    all_headings = h1_list + h2_list + parser.headings.get("h3", [])
    strategy["content_themes"] = all_headings[:15]
    
    # Call to action patterns
    cta_patterns = []
    cta_words = ["shop", "buy", "sell", "browse", "search", "find", "explore", "discover", "order", "cart", "add to"]
    content_lower = (markdown_content or "").lower()
    for cta in cta_words:
        if cta in content_lower:
            cta_patterns.append(cta)
    strategy["cta_patterns"] = cta_patterns
    
    # Trust signals
    trust_signals = []
    trust_words = ["trusted", "secure", "guaranteed", "authentic", "verified", "official", "licensed", "since", "established", "years"]
    for tw in trust_words:
        if tw in content_lower:
            trust_signals.append(tw)
    strategy["trust_signals"] = trust_signals
    
    # Category structure hints from URL
    parsed_url = urlparse(url)
    strategy["url_path"] = parsed_url.path
    
    return strategy


def generate_analysis(all_results):
    """Generate cross-site analysis and recommendations."""
    successful = [r for r in all_results if r is not None]
    
    # Common keywords across sites
    keyword_freq = {}
    for r in successful:
        for kw in r.get("key_seo_keywords", []):
            keyword_freq[kw] = keyword_freq.get(kw, 0) + 1
    
    common_keywords = sorted(keyword_freq.items(), key=lambda x: -x[1])
    common_keywords_list = [kw for kw, count in common_keywords if count >= 2]
    
    # Common techniques
    technique_freq = {}
    for r in successful:
        for tech in r.get("seo_techniques", []):
            technique_freq[tech] = technique_freq.get(tech, 0) + 1
    
    common_techniques = sorted(technique_freq.items(), key=lambda x: -x[1])
    common_techniques_list = [{"technique": tech, "count": count, "percentage": f"{count}/{len(successful)} sites"} for tech, count in common_techniques]
    
    # Generate recommendations
    recommendations = generate_recommendations(successful, common_keywords_list, common_techniques_list)
    
    return {
        "common_keywords": common_keywords_list,
        "keyword_frequency": [{"keyword": kw, "count": count} for kw, count in common_keywords[:30]],
        "common_techniques": common_techniques_list,
        "recommendations": recommendations,
        "sites_analyzed": len(successful),
        "sites_total": len(all_results),
        "analysis_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


def generate_recommendations(successful, common_keywords, common_techniques):
    """Generate actionable SEO recommendations based on competitor analysis."""
    recommendations = []
    
    # Check which techniques are most common
    tech_dict = {t["technique"]: t["count"] for t in common_techniques}
    total_sites = len(successful) or 1
    
    # 1. Meta Title
    has_optimal_title = tech_dict.get("optimal_title_length", 0)
    if has_optimal_title >= total_sites * 0.5:
        recommendations.append({
            "priority": "HIGH",
            "category": "Meta Title",
            "recommendation": "Use meta titles between 30-60 characters. Most competitors optimize title length for SERP display.",
            "details": f"{has_optimal_title}/{total_sites} competitors use optimal title length.",
            "example": "Format: 'Brand | Category - Product Type | Akihabara TCG Warehouse'"
        })
    
    # 2. Meta Description
    has_meta_desc = tech_dict.get("meta_description_present", 0)
    if has_meta_desc > 0:
        recommendations.append({
            "priority": "HIGH",
            "category": "Meta Description",
            "recommendation": "Include compelling meta descriptions between 120-160 characters with primary keywords and CTAs.",
            "details": f"{has_meta_desc}/{total_sites} competitors use meta descriptions.",
            "example": "'Shop authentic Japanese & English TCG cards at Akihabara TCG Warehouse. Pokemon, One Piece, Yu-Gi-Oh, Weiss Schwarz & more. Fast shipping worldwide.'"
        })
    
    # 3. Open Graph
    has_og = tech_dict.get("open_graph_tags", 0)
    if has_og > 0:
        recommendations.append({
            "priority": "HIGH",
            "category": "Open Graph Tags",
            "recommendation": "Implement complete Open Graph tags (og:title, og:description, og:image, og:type, og:url) for social media sharing.",
            "details": f"{has_og}/{total_sites} competitors use OG tags.",
            "example": "og:type='website', og:image should be 1200x630px for optimal display"
        })
    
    # 4. Structured Data
    has_jsonld = tech_dict.get("json_ld_structured_data", 0)
    if has_jsonld > 0:
        recommendations.append({
            "priority": "HIGH",
            "category": "Structured Data / JSON-LD",
            "recommendation": "Implement JSON-LD structured data for Organization, WebSite, Product, BreadcrumbList, and ItemList schemas.",
            "details": f"{has_jsonld}/{total_sites} competitors use JSON-LD structured data.",
            "example": "Add Organization schema with name/logo/url, WebSite schema with SearchAction, Product schema for each product page"
        })
    
    # 5. Heading structure
    has_single_h1 = tech_dict.get("single_h1_tag", 0)
    recommendations.append({
        "priority": "HIGH",
        "category": "Heading Structure",
        "recommendation": "Use a single H1 tag per page with the primary keyword. Use H2/H3 tags to create a clear content hierarchy.",
        "details": f"{has_single_h1}/{total_sites} competitors use a single H1 tag.",
        "example": "H1: 'Japanese & English TCG Cards | Akihabara TCG Warehouse', H2: 'Shop by Game', H3: 'Pokemon TCG'"
    })
    
    # 6. Keywords
    if common_keywords:
        top_kw = common_keywords[:10]
        recommendations.append({
            "priority": "HIGH",
            "category": "Target Keywords",
            "recommendation": "Target these high-frequency competitor keywords in titles, headings, and content.",
            "details": f"Top keywords found across competitors: {', '.join(top_kw)}",
            "example": "Include 'trading card game', 'pokemon cards', 'booster box' in key page content"
        })
    
    # 7. Image Alt Text
    has_alt = tech_dict.get("image_alt_texts", 0)
    if has_alt > 0:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Image Alt Text",
            "recommendation": "Add descriptive alt text to all product images. Include game name, product type, and language.",
            "details": f"{has_alt}/{total_sites} competitors use image alt text.",
            "example": "alt='Pokemon TCG Scarlet Violet Booster Box Japanese Sealed' not alt='image1.jpg'"
        })
    
    # 8. Canonical URLs
    has_canonical = tech_dict.get("canonical_tag", 0)
    if has_canonical > 0:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Canonical URLs",
            "recommendation": "Add canonical link tags to all pages to prevent duplicate content issues.",
            "details": f"{has_canonical}/{total_sites} competitors use canonical tags.",
            "example": "<link rel='canonical' href='https://akihabaratcg.com/pokemon/booster-boxes' />"
        })
    
    # 9. Internal linking
    has_linking = tech_dict.get("strong_internal_linking", 0)
    if has_linking > 0:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Internal Linking",
            "recommendation": "Build strong internal linking with descriptive anchor text. Link between categories, products, and related items.",
            "details": f"{has_linking}/{total_sites} competitors have strong internal linking (20+ links).",
            "example": "Link 'Pokemon Booster Boxes' to category page, cross-link 'You may also like' products"
        })
    
    # 10. Content strategy
    recommendations.append({
        "priority": "MEDIUM",
        "category": "Content Strategy",
        "recommendation": "Add category description text below product listings. Include trust signals, brand partnerships, and shipping info.",
        "details": "Competitors use category descriptions, trust badges, and shipping info to build credibility.",
        "example": "Add 'About Our Pokemon Cards' section with authenticity guarantee and Japan-sourced details"
    })
    
    # 11. URL Structure
    recommendations.append({
        "priority": "MEDIUM",
        "category": "URL Structure",
        "recommendation": "Use clean, keyword-rich URL structure: /category/subcategory/product-name format.",
        "details": "Top competitors use hierarchical URL structures (e.g., /pokemon/booster-boxes, /yugioh/structure-decks).",
        "example": "/pokemon/japanese-booster-boxes, /one-piece/english-elite-trainer-boxes"
    })
    
    # 12. Breadcrumbs
    has_breadcrumb = tech_dict.get("breadcrumb_schema", 0)
    if has_breadcrumb > 0:
        recommendations.append({
            "priority": "MEDIUM",
            "category": "Breadcrumbs",
            "recommendation": "Implement breadcrumb navigation with BreadcrumbList schema markup.",
            "details": f"{has_breadcrumb}/{total_sites} competitors use breadcrumb structured data.",
            "example": "Home > Pokemon > Japanese > Booster Boxes with corresponding BreadcrumbList JSON-LD"
        })
    
    # 13. Twitter Cards
    has_twitter = tech_dict.get("twitter_card_tags", 0)
    if has_twitter > 0:
        recommendations.append({
            "priority": "LOW",
            "category": "Twitter Card Tags",
            "recommendation": "Implement Twitter Card meta tags for better social sharing appearance.",
            "details": f"{has_twitter}/{total_sites} competitors use Twitter Card tags.",
            "example": "twitter:card='summary_large_image', twitter:title, twitter:description"
        })
    
    # 14. Japan/Akihabara-specific
    recommendations.append({
        "priority": "HIGH",
        "category": "Niche Differentiation",
        "recommendation": "Leverage 'Akihabara' and 'Japan-sourced' as unique differentiators. Target Japanese TCG-specific keywords that competitors miss.",
        "details": "Few competitors emphasize Japanese origin/sourcing. This is a unique SEO opportunity.",
        "example": "Target: 'japanese pokemon cards', 'akihabara card shop', 'authentic japanese booster box', 'japan imported tcg'"
    })
    
    return recommendations


def main():
    print("=" * 70)
    print("SEO Competitor Scraper - TCG Industry Analysis")
    print("=" * 70)
    
    all_results = []
    
    for i, site in enumerate(SITES):
        if i > 0:
            delay = 2  # Rate limiting
            print(f"\nWaiting {delay}s before next request...")
            time.sleep(delay)
        
        result = scrape_site(site)
        all_results.append(result)
    
    # Generate analysis
    print("\n" + "=" * 70)
    print("Generating Cross-Site Analysis...")
    print("=" * 70)
    
    analysis = generate_analysis(all_results)
    
    # Build final output
    output = {
        "research_title": "TCG Competitor SEO Analysis",
        "project": "Akihabara TCG Warehouse",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sites": [r for r in all_results if r is not None],
        "failed_sites": [
            {"name": site["name"], "url": site["url"]}
            for site, result in zip(SITES, all_results) if result is None
        ],
        "analysis": analysis
    }
    
    # Save to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {OUTPUT_FILE}")
    print(f"Sites successfully scraped: {analysis['sites_analyzed']}/{analysis['sites_total']}")
    print(f"Common keywords found: {len(analysis['common_keywords'])}")
    print(f"Common techniques found: {len(analysis['common_techniques'])}")
    print(f"Recommendations generated: {len(analysis['recommendations'])}")
    
    return output


if __name__ == "__main__":
    main()
