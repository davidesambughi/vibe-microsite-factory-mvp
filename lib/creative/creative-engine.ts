
import {
    ValidatedProject,
    CreativeEngineOutput,
    UIContentVariant,
    Locale
} from '../contracts/contracts';

/**
 * Module: Creative AI Engine
 * Purpose: Transform validated briefs into multi-language UI/content variants.
 * 
 * Friction Points Managed:
 * 1. "Brief to 10 variants" Scalability: Uses Promise.all for parallel generation to meet <30s constraint.
 * 2. Consistency: Deterministic stubbing ensures content aligns with the core message across locales.
 * 3. Zero Side Effects: External dependencies (AI, DB) are stubbed to prevent unwanted IO during MVP.
 */
export class CreativeAIEngine {

    /**
     * Entry Point: Async Task Distribution
     * Generates content for all target locales and persists the result.
     * Returns Promise<void> as per contract (side-effect is DB persistence).
     */
    public async generateCreatives(project: ValidatedProject): Promise<CreativeEngineOutput> {
        // 1. Validation Gate
        if (project.status !== 'VALIDATED') {
            throw new Error(`[CreativeAIEngine] Invariant Violation: Cannot process project with status ${project.status}`);
        }



        // 2. Parallel Generation (Friction Point: Resilience)
        // Switch to Promise.allSettled to prevent single-variant failure from halting the pipeline.
        try {
            const variantPromises = project.payload.targetLocales.map(async (locale) => {
                return this.stubAIGeneration(project.payload.coreMessage, locale);
            });

            const results = await Promise.allSettled(variantPromises);

            const variants: UIContentVariant[] = [];
            const errors: string[] = [];

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    variants.push(result.value);
                } else {
                    console.warn(`[CreativeAIEngine] Variant generation failed: ${result.reason}`);
                    errors.push(String(result.reason));
                }
            });

            // 3. Aggregation
            const output: CreativeEngineOutput = {
                projectId: project.projectId,
                variants: variants,
                generationModel: 'gpt-4o-stub-v1',
                errors: errors.length > 0 ? errors : undefined
            };

            // 4. State Persistence (Stubbed Side Effect)
            await this.stubPersistenceLayer(output);



            return output;

        } catch (error) {
            // In a real system, we would update the project state to FAILED via the DB stub here.
            throw error; // Re-throw to signal failure to the caller (Orchestrator test harness)
        }
    }

    /**
     * STUB: AI Generation Logic
     * Simulates LLM call with deterministic output based on locale.
     * 
     * Friction Point: Consistency across Languages
     * Resolution: We programmatically derive the content to ensure it matches the core message 
     * without hallucinations (for MVP).
     */
    private async stubAIGeneration(coreMessage: string, locale: Locale): Promise<UIContentVariant> {
        // Simulate network latency (random between 50ms and 200ms) to prove concurrency resilience
        const latency = Math.floor(Math.random() * 150) + 50;
        await new Promise(resolve => setTimeout(resolve, latency));

        // Deterministic content generation
        const localizedPrefix = `[${locale.toUpperCase()}]`;

        return {
            locale: locale,
            heroTitle: `${localizedPrefix} Future of Living: ${coreMessage.substring(0, 20)}...`,
            bodyCopy: `${localizedPrefix} Experience the ${coreMessage} in a way that respects your local culture. This is a generated description ensuring semantic consistency.`,
            ctaText: `${localizedPrefix} Discover More`,
            layoutId: this.determineLayout(locale) // Layout-Aware generation
        };
    }

    /**
     * Helper: Selects layout based on locale characteristics.
     * Friction Point: Layout/Design Coupling
     * Resolution: German/Russian often need wider layouts due to text length.
     */
    private determineLayout(locale: Locale): string {
        const textHeavyLocales = new Set(['de-DE', 'ru-RU', 'fi-FI']);
        if (textHeavyLocales.has(locale)) {
            return 'layout-wide-v2'; // Optimized for longer text
        }
        return 'layout-minimal-v1'; // Standard layout
    }

    /**
     * STUB: Persistence Layer
     * Simulates saving the result to Supabase.
     */
    private async stubPersistenceLayer(output: CreativeEngineOutput): Promise<void> {
        // Simulate DB write latency
        await new Promise(resolve => setTimeout(resolve, 100));
        // Simulate DB write latency
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
