
import { MainOrchestrator } from '../lib/main-orchestrator';
import { BriefInput } from '../lib/contracts/contracts';

/**
 * Integration Test Suite (2026 Standard)
 * 
 * Purpose:
 * Verify that the MainOrchestrator successfully connects all 4 modules 
 * and produces a valid DeploymentConfig that respects GEO and SEO constraints.
 */
async function runIntegrationTest() {
    const orchestrator = new MainOrchestrator();

    // 1. Define Test Data (Scenario: Luxury Real Estate Campaign targeting EU + US)
    const testBrief: BriefInput = {
        campaignId: 'integration-test-2026',
        brandName: 'Lusitano Luxury',
        coreMessage: 'Exclusive villas in Comporta with sustainable design.',
        targetLocales: ['en-US', 'it-IT', 'de-DE'], // Mix of non-EU and EU to trigger GDPR logic
        assets: {
            logoUrl: 'https://via.placeholder.com/150',
            keywordsCsvUrl: 'https://example.com/keywords.csv'
        }
    };

    console.log(">>> STARTING INTEGRATION TEST 2026 <<<");
    console.time("PipelineDuration");

    try {
        // 2. Execute Pipeline
        const result = await orchestrator.runPipeline(testBrief);

        console.timeEnd("PipelineDuration");

        // 3. Assertions & Verification
        console.log("\n>>> VERIFICATION <<<");

        // Assertion 1: Compliance (GDPR)
        // Since we targeted IT and DE (EU), middlewareRules.consentRequired MUST be true.
        if (result.middlewareRules.consentRequired === true) {
            console.log("✅ [PASS] GDPR Compliance: Consent Gate Active (EU Access Detected)");
        } else {
            console.error("❌ [FAIL] GDPR Compliance: EU targets found but consent not required!");
            process.exit(1);
        }

        // Assertion 2: Region Selection
        // We have 2 EU (it, de) vs 1 US (en). Majority is EU. Expected Region: 'fra1'.
        if (result.edgeRegion === 'fra1') {
            console.log("✅ [PASS] Data Residency: Correct Edge Region selected (fra1) based on EU majority.");
        } else {
            console.error(`❌ [FAIL] Data Residency: Expected 'fra1', got '${result.edgeRegion}'`);
            process.exit(1);
        }

        // Assertion 3: Deployment Integrity
        if (result.isLive && result.deploymentId.startsWith('dpl_')) {
            console.log("✅ [PASS] Deployment Integrity: Valid Deployment ID returned.");
        } else {
            console.error("❌ [FAIL] Deployment Integrity: Invalid Deployment Config.");
            process.exit(1);
        }

        console.log("\n>>> INTEGRATION SUCCESSFUL <<<");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ [CRITICAL FAILURE] Pipeline Exception:", error);
        process.exit(1);
    }
}

// Run the test
runIntegrationTest();
