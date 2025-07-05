import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add emergency contact
export const addEmergencyContact = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    relationship: v.string(),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this is set as primary, remove primary flag from others
    if (args.isPrimary) {
      const existingContacts = await ctx.db
        .query("emergencyContacts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      for (const contact of existingContacts) {
        if (contact.isPrimary) {
          await ctx.db.patch(contact._id, { isPrimary: false });
        }
      }
    }

    const contactId = await ctx.db.insert("emergencyContacts", {
      userId: args.userId,
      name: args.name,
      phone: args.phone,
      relationship: args.relationship,
      isPrimary: args.isPrimary,
    });

    return contactId;
  },
});

// Get user's emergency contacts
export const getUserEmergencyContacts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update emergency contact
export const updateEmergencyContact = mutation({
  args: {
    contactId: v.id("emergencyContacts"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    relationship: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }

    // If this is being set as primary, remove primary flag from others
    if (args.isPrimary) {
      const existingContacts = await ctx.db
        .query("emergencyContacts")
        .withIndex("by_user", (q) => q.eq("userId", contact.userId))
        .collect();

      for (const existingContact of existingContacts) {
        if (existingContact.isPrimary && existingContact._id !== args.contactId) {
          await ctx.db.patch(existingContact._id, { isPrimary: false });
        }
      }
    }

    await ctx.db.patch(args.contactId, {
      name: args.name,
      phone: args.phone,
      relationship: args.relationship,
      isPrimary: args.isPrimary,
    });
  },
});

// Delete emergency contact
export const deleteEmergencyContact = mutation({
  args: { contactId: v.id("emergencyContacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contactId);
  },
});

// Get primary emergency contact
export const getPrimaryEmergencyContact = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencyContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isPrimary"), true))
      .first();
  },
});