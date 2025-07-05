import { mutation } from "../convex/_generated/server";

// ------------------------------
// Archived Convex migrations
// Originally located at convex/migrations.ts
// Kept only for historical reference.  No code should import these.
// ------------------------------

// Migration: Consolidate resources schema
export const migrateResourcesSchema = mutation({
  args: {},
  handler: async (ctx) => {
    const resources = await ctx.db.query("resources").collect();
    let migratedCount = 0;
    let deletedCount = 0;

    for (const resource of resources) {
      const resourceData = resource as any;
      
      // Handle emergency/hotline types by converting to proper resources with isEmergency flag
      if (resourceData.type === "hotline" || resourceData.type === "emergency") {
        // Convert hotline/emergency types to articles with isEmergency flag
        const updatedResource = {
          ...resourceData,
          type: "article",
          isEmergency: true,
          tags: resourceData.category || resourceData.tags || ["emergency", "support"],
        } as any;
        
        // Remove old fields
        delete updatedResource.category;
        
        await ctx.db.patch(resource._id, updatedResource);
        migratedCount++;
      } else {
        // For other types, consolidate category into tags
        if (resourceData.category) {
          const existingTags = resourceData.tags || [];
          const allTags = [...existingTags, ...resourceData.category];
          const uniqueTags = [...new Set(allTags)];
          
          await ctx.db.patch(resource._id, {
            tags: uniqueTags,
          });
          migratedCount++;
        }
      }
    }

    return { 
      totalResources: resources.length,
      migratedResources: migratedCount,
      deletedResources: deletedCount,
    };
  },
});

// Migration: Clean up metadata fields
export const migrateResourcesMetadata = mutation({
  args: {},
  handler: async (ctx) => {
    const resources = await ctx.db.query("resources").collect();
    let migratedCount = 0;

    for (const resource of resources) {
      const resourceData = resource as any;
      
      // Clean up metadata to match new schema
      if (resourceData.metadata) {
        const cleanMetadata = {
          source: resourceData.metadata.source,
          author: resourceData.metadata.author,
          lastUpdated: resourceData.metadata.lastUpdated,
          version: resourceData.metadata.version,
          externalId: resourceData.metadata.externalId,
        } as any;

        // Move specialized metadata fields to dedicated fields
        const updates: any = {
          metadata: cleanMetadata,
        };

        if (resourceData.metadata.availability) {
          updates.country = resourceData.metadata.availability;
        }

        if (resourceData.metadata.textNumber) {
          updates.phone = resourceData.metadata.textNumber;
        }

        await ctx.db.patch(resource._id, updates);
        migratedCount++;
      }
    }

    return { migratedMetadata: migratedCount };
  },
});

// Migration: Consolidate onboarding fields (delegates to users:migrateOnboardingFields)
export const runAllMigrations = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting archived migrations ...");

    // NOTE: These imports are untyped here on purpose because the runtime
    // names no longer exist in the generated API.  They are kept only to
    // show how the script was executed originally.
    const resourcesResult = await ctx.runMutation(
      ctx.functions.migrations.migrateResourcesSchema as any,
      {}
    );
    const metadataResult = await ctx.runMutation(
      ctx.functions.migrations.migrateResourcesMetadata as any,
      {}
    );
    const usersResult = await ctx.runMutation(
      ctx.functions.users.migrateOnboardingFields as any,
      {}
    );

    return {
      resources: resourcesResult,
      metadata: metadataResult,
      users: usersResult,
      message: "Archived migrations completed (historical run)",
    };
  },
}); 