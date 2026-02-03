
import { BriefInput, ValidatedProject, GeoCompliance, Locale } from '../contracts/contracts';

/**
 * Module: Inbound Orchestrator
 * Purpose: Validate brief inputs and asset integrity before pipeline processing.
 * 
 * Friction Points Managed:
 * 1. "Fail Fast": Strict input validation prevents processing of invalid campaigns, saving compute resources (Step 1 constraint).
 * 2. GDPR/Compliance: Centralized logic for compliance flags based on target locales avoids distributed compliance checking.
 * 3. Zero Side Effects: Pure validation logic with no external database writes or API calls in this specific class (stubbed if needed).
 */
export class InboundOrchestrator {

    /**
     * Validates the input brief and determines compliance requirements.
     * Adheres to Step 5 Integration Patterns: Sync Request-Response.
     */
    public async validateInput(input: BriefInput): Promise<ValidatedProject> {
        const errors: string[] = [];

        // 1. Structural Validation
        if (!input.campaignId || input.campaignId.trim().length < 3) {
            errors.push("Invariant Violation: campaignId must be at least 3 characters.");
        }
        if (!input.brandName || input.brandName.trim().length === 0) {
            errors.push("Invariant Violation: brandName is required.");
        }
        if (!input.coreMessage || input.coreMessage.trim().length < 10) {
            errors.push("Quality Gate: coreMessage too short for AI generation (<10 chars).");
        }
        if (!input.targetLocales || input.targetLocales.length === 0) {
            errors.push("Invariant Violation: At least one targetLocale is required.");
        }

        // 2. Asset Integrity Checks (Zero Side Effects - validation by format only)
        if (!this.isValidUrl(input.assets.logoUrl)) {
            errors.push(`Asset Error: Invalid logoUrl format: ${input.assets.logoUrl}`);
        }
        if (!this.isValidUrl(input.assets.keywordsCsvUrl)) {
            errors.push(`Asset Error: Invalid keywordsCsvUrl format: ${input.assets.keywordsCsvUrl}`);
        }

        // 3. Status Determination
        const status = errors.length > 0 ? 'FAILED' : 'VALIDATED';

        // 4. Compliance Calculation (Business Logic)
        const compliance = this.computeGeoCompliance(input.targetLocales);

        // 5. Construct Output
        // Note: If FAILED, the payload is still returned for debugging, but downstream should halt.
        // The 'project' object handles the state.
        const validatedProject: ValidatedProject = {
            projectId: input.campaignId, // Mapping campaignId to projectId for 1:1 relationship in MVP
            timestamp: new Date().toISOString(),
            status: status,
            payload: input,
            compliance: compliance,
        };

        if (errors.length > 0) {
            // In a real logger, we would log these. For MVP, we proceed with the FAILED status object.
            // We could also attach errors to a transient property if the Contract allowed, 
            // but strict adherence to Contract means we rely on 'status'.
            // In a real logger, we would log these. For MVP, we proceed with the FAILED status object.
            // We could also attach errors to a transient property if the Contract allowed.
            // invalid inputs are swallowed here as per "Fail Fast" but silent contract.
        }

        return validatedProject;
    }

    /**
     * Helper: Validates URL format without network request (Zero Side Effects)
     */
    private isValidUrl(url: string): boolean {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Helper: Determines GEO compliance flags based on locale list.
     * Friction Point: Automating compliance config to reduce manual error.
     */
    private computeGeoCompliance(locales: Locale[]): GeoCompliance {
        // List of ISO codes or prefixes requiring strict GDPR
        // MVP: Hardcoded common EU locales
        const euLocales = new Set(['it', 'fr', 'de', 'es', 'pt', 'nl', 'be', 'at', 'ie', 'pl', 'se', 'fi', 'dk']);

        let isEuTargeted = false;

        for (const locale of locales) {
            // Handle 'it-IT' or just 'it'
            const langPart = locale.split('-')[0].toLowerCase();
            if (euLocales.has(langPart)) {
                isEuTargeted = true;
                break;
            }
        }

        return {
            requiresGDPR: isEuTargeted,
            cookieConsentActive: isEuTargeted, // Active by default if EU
            dataResidency: isEuTargeted ? 'EU' : 'GLOBAL'
        };
    }
}
