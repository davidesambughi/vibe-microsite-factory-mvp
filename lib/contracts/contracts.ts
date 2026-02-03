// STEP 5: CONTRACT DEFINITION
// Source of Truth for the Multi-Regional Microsite Pipeline
// Version: 1.0.0 (2026/27 SEO-GEO Standard)


// --- Shared Domain Types ---

export type Locale = 'en-US' | 'it-IT' | 'fr-FR' | 'es-ES' | 'de-DE' | string;

export interface GeoCompliance {
    requiresGDPR: boolean;
    cookieConsentActive: boolean;
    dataResidency: 'EU' | 'US' | 'GLOBAL';
}

// --- Module 1: Inbound Orchestrator Contracts ---
// Valida brief e asset 

export interface BriefInput {
    campaignId: string;
    brandName: string;
    coreMessage: string;
    targetLocales: Locale[];
    assets: {
        logoUrl: string;
        keywordsCsvUrl: string;
    };
}

export interface ValidatedProject {
    projectId: string;
    timestamp: string;
    status: 'VALIDATED' | 'FAILED';
    payload: BriefInput;
    compliance: GeoCompliance;
}

// --- Module 2: Creative AI Engine Contracts ---
// Trasforma requisiti in varianti UI multilingua 

export interface UIContentVariant {
    locale: Locale;
    heroTitle: string;
    bodyCopy: string;
    ctaText: string;
    layoutId: string; // Riferimento al template Next.js
}

export interface CreativeEngineOutput {
    projectId: string;
    variants: UIContentVariant[];
    generationModel: string;
    errors?: string[];
}

// --- Module 3: SEO Semantic Agent Contracts ---
// Iniezione metadati e ottimizzazione keyword

export interface SEOMetadata {
    title: string;
    description: string;
    ogTags: Record<string, string>;
    canonicalUrl: string;
    hreflang: Record<Locale, string>;
    structuredData: object; // JSON-LD
}

export interface SEOOptimizedVariant extends UIContentVariant {
    seo: SEOMetadata;
    keywordsApplied: string[];
}

// --- Module 4: GEO Deployment Hub Contracts ---
// Gestione rilascio, GDPR e Telemetria

export interface DeploymentConfig {
    deploymentId: string;
    edgeRegion: string;
    isLive: boolean;
    telemetryEndpoint: string;
    middlewareRules: {
        geoBlocking: boolean;
        consentRequired: boolean;
    };
}

// --- Integration Patterns & State Persistence [cite: 27, 28, 29] ---

export interface WorkflowState {
    id: string; // Supabase Primary Key
    currentStep: 'ORCHESTRATION' | 'CREATIVE' | 'SEO' | 'DEPLOYMENT' | 'COMPLETED';
    lastUpdated: string;
    data: {
        project?: ValidatedProject;
        creatives?: CreativeEngineOutput;
        seoResults?: SEOOptimizedVariant[];
        deployment?: DeploymentConfig;
    };
    errors: Array<{ module: string; message: string; fatal: boolean }>;
}

/**

- SERVICE INTERFACES (The "Boundaries")
*/

export interface IMicrositePipeline {
    // Sync Request-Response [
    validateInput(input: BriefInput): Promise<ValidatedProject>;

    // Async Task Distribution 
    generateCreatives(project: ValidatedProject): Promise<CreativeEngineOutput>;
    optimizeSEO(variant: UIContentVariant): Promise<SEOOptimizedVariant>;

    // Middleware Routing 
    executeGeoDeploy(seoVariants: SEOOptimizedVariant[], compliance: GeoCompliance): Promise<DeploymentConfig>;
}