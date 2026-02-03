
import {
    BriefInput,
    DeploymentConfig,
    IMicrositePipeline,
    ValidatedProject,
    CreativeEngineOutput,
    SEOOptimizedVariant
} from './contracts/contracts';
import { InboundOrchestrator } from './inbound/inbound-orchestrator';
import { CreativeAIEngine } from './creative/creative-engine';
import { SeoSemanticAgent } from './seo/seo-agent';
import { GeoDeploymentHub } from './deployment/geo-hub';

/**
 * Main Orchestrator (Step 8 Integration)
 * 
 * Purpose: 
 * Connects the 4 modules (Inbound -> Creative -> SEO -> GEO) into a physical pipeline.
 * Adheres to "State Persistence Pattern" conceptually, but enables direct memory passing 
 * for the MVP integration test loop via the refactored contract.
 */
export class MainOrchestrator implements IMicrositePipeline {

    // Module Instantiation
    private inbound = new InboundOrchestrator();
    private creative = new CreativeAIEngine();
    private seo = new SeoSemanticAgent();
    private deployment = new GeoDeploymentHub();

    /**
     * Executes the full pipeline from Brief to Deployment.
     * This method acts as the "Systems Integrator" glue.
     */
    public async runPipeline(brief: BriefInput): Promise<DeploymentConfig> {

        // 1. Inbound Validation
        const validatedProjet = await this.validateInput(brief);
        if (validatedProjet.status === 'FAILED') {
            throw new Error(`Pipeline Halted: Input validation failed.`);
        }

        // 2. Creative Generation (Now returns data!)
        const creativeOutput = await this.generateCreatives(validatedProjet);

        // 3. SEO Optimization
        // Map over variants and optimize each one
        const seoPromises = creativeOutput.variants.map(variant => this.optimizeSEO(variant));
        const seoVariants = await Promise.all(seoPromises);

        // 4. GEO Deployment
        // Pass the compliance object from the initial validation (Single Source of Truth)
        const deploymentConfig = await this.executeGeoDeploy(seoVariants, validatedProjet.compliance);

        return deploymentConfig;
    }

    // --- IMicrositePipeline Implementation ---

    public async validateInput(input: BriefInput): Promise<ValidatedProject> {
        return this.inbound.validateInput(input);
    }

    public async generateCreatives(project: ValidatedProject): Promise<CreativeEngineOutput> {
        return this.creative.generateCreatives(project);
    }

    public async optimizeSEO(variant: import("./contracts/contracts").UIContentVariant): Promise<SEOOptimizedVariant> {
        return this.seo.optimizeSEO(variant);
    }

    public async executeGeoDeploy(seoVariants: SEOOptimizedVariant[], compliance: import("./contracts/contracts").GeoCompliance): Promise<DeploymentConfig> {
        return this.deployment.executeGeoDeploy(seoVariants, compliance);
    }
}
