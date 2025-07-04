import { internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

// Initialize the database with essential data
export const initializeApp = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("Initializing Nafsy app data...");

    // Check if resources already exist
    const existingResources = await ctx.db.query("resources").take(1);
    
    if (existingResources.length === 0) {
      console.log("Seeding crisis resources...");
      // Call the seed function to add initial resources
      await ctx.runMutation(api.resources.seedResources, {});
      console.log("Crisis resources seeded successfully!");
    } else {
      console.log("Resources already exist, skipping seed.");
    }

    return { success: true, message: "App initialized successfully" };
  },
});