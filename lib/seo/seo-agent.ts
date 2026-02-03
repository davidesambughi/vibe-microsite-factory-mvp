
import {
    UIContentVariant,
    SEOOptimizedVariant,
    SEOMetadata,
    Locale
} from '../contracts/contracts';

/**
 * Module: SEO Semantic Agent
 * Purpose: Inject localized metadata, optimize for keywords, and generate valid SEO tags.
 * 
 * Friction Points Managed:
 * 1. Hreflang Complexity: Uses deterministic URL pattern generation to avoid expensive/complex cross-referencing.
 * 2. Metadata Limits: Enforces strict Hard Truncation (60/160 chars) to ensure SERP display validity.
 * 3. Keyword Cannibalization: Localized keyword stubs ensure unique targeting per language.
 */
export class SeoSemanticAgent {

    private readonly MAX_TITLE_LENGTH = 60;
    private readonly MAX_DESC_LENGTH = 160;

    /**
     * Entry Point: Transform generic UI content into SEO-ready content.
     */
    public async optimizeSEO(variant: UIContentVariant): Promise<SEOOptimizedVariant> {
        // 1. Validation
        if (!variant.locale || !variant.heroTitle) {
            throw new Error(`[SeoSemanticAgent] Invariant Violation: Invalid input variant for locale ${variant.locale}`);
        }

        // 2. Fetch Context (Stubbed)
        const keywords = await this.stubKeywordDatabase(variant.locale);
        const primaryKeyword = keywords[0] || 'Brand';

        // 3. Metadata Generation & Optimization
        const seoMetadata = this.generateMetadata(variant, primaryKeyword);

        // 4. Construct Output
        const optimizedVariant: SEOOptimizedVariant = {
            ...variant, // Spread original UI content
            seo: seoMetadata,
            keywordsApplied: keywords
        };

        return optimizedVariant;
    }

    /**
     * Core Logic: Generates metadata with strict truncation and pattern-based URLs.
     */
    private generateMetadata(variant: UIContentVariant, keyword: string): SEOMetadata {
        // Title Construction: "Hero Title | Keyword"
        const rawTitle = `${variant.heroTitle} | ${keyword}`;
        const title = this.truncate(rawTitle, this.MAX_TITLE_LENGTH);

        // Description Construction: Body summary + Call to Action
        const rawDesc = `${variant.bodyCopy.substring(0, 100)}... ${variant.ctaText}`;
        const description = this.truncate(rawDesc, this.MAX_DESC_LENGTH);

        // URL Logic (Deterministic Pattern)
        const canonicalUrl = this.stubUrlBuilder(variant.locale);
        const hreflangMap = this.generateHreflangMap(); // In MVP, we generate a standard set

        // Structured Data (JSON-LD)
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "inLanguage": variant.locale
        };

        return {
            title,
            description,
            ogTags: {
                'og:title': title,
                'og:description': description,
                'og:locale': variant.locale,
                'og:url': canonicalUrl
            },
            canonicalUrl,
            hreflang: hreflangMap,
            structuredData
        };
    }

    /**
     * Helper: Hard Truncation Logic (Friction Point Resolution)
     * Ensures strings stay within SERP limits without exception.
     */
    private truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Helper: Generates Hreflang map using deterministic patterns.
     * Friction Point: Avoids database lookups for sibling pages.
     */
    private generateHreflangMap(): Record<Locale, string> {
        // MVP: Assuming a fixed set of supported locales for specific campaign
        // In real app, this might come from config usually passed in context
        const supportedLocales: Locale[] = ['en-US', 'it-IT', 'fr-FR', 'es-ES', 'de-DE'];

        const map: Record<Locale, string> = {};
        for (const loc of supportedLocales) {
            map[loc] = this.stubUrlBuilder(loc);
        }
        return map;
    }

    /**
     * STUB: Keyword Database
     * Returns localized keywords.
     */
    private async stubKeywordDatabase(locale: Locale): Promise<string[]> {
        // Simulate async DB fetch
        await new Promise(resolve => setTimeout(resolve, 20));

        const keywordMap: Record<string, string[]> = {
            'en-US': ['Best Villas', 'Luxury Living', 'Investment'],
            'it-IT': ['Migliori Ville', 'Vita di Lusso', 'Investimenti'],
            'fr-FR': ['Meilleures Villas', 'Vie de Luxe', 'Investissement'],
            'es-ES': ['Mejores Villas', 'Vida de Lujo', 'Inversión'],
            'de-DE': ['Besten Villen', 'Luxusleben', 'Investition']
        };

        return keywordMap[locale] || ['Luxury Real Estate'];
    }

    /**
     * STUB: URL Builder
     * Deterministic URL generation.
     */
    private stubUrlBuilder(locale: Locale): string {
        // Pattern: https://microsite.com/{locale}/campaign
        // Removing region code for cleaner URLs if needed, but keeping full locale for MVP strictness
        return `https://microsite-factory.com/${locale}/campaign-mvc`;
    }
}
