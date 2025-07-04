import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add an emergency contact
export const addEmergencyContact = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    relationship: v.optional(v.string()),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If setting as primary, unset other primary contacts
    if (args.isPrimary) {
      const existingContacts = await ctx.db
        .query("emergencyContacts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isPrimary"), true))
        .collect();

      for (const contact of existingContacts) {
        await ctx.db.patch(contact._id, { isPrimary: false });
      }
    }

    const contactId = await ctx.db.insert("emergencyContacts", {
      userId: args.userId,
      name: args.name,
      phone: args.phone,
      relationship: args.relationship,
      isPrimary: args.isPrimary,
      createdAt: Date.now(),
    });

    return contactId;
  },
});

// Get user's emergency contacts
export const getUserEmergencyContacts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("emergencyContacts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by primary first, then by creation date
    return contacts.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return b.createdAt - a.createdAt;
    });
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

    // If setting as primary, unset other primary contacts
    if (args.isPrimary === true) {
      const otherContacts = await ctx.db
        .query("emergencyContacts")
        .withIndex("by_user", (q) => q.eq("userId", contact.userId))
        .filter((q) => 
          q.and(
            q.eq(q.field("isPrimary"), true),
            q.neq(q.field("_id"), args.contactId)
          )
        )
        .collect();

      for (const otherContact of otherContacts) {
        await ctx.db.patch(otherContact._id, { isPrimary: false });
      }
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.relationship !== undefined) updates.relationship = args.relationship;
    if (args.isPrimary !== undefined) updates.isPrimary = args.isPrimary;

    await ctx.db.patch(args.contactId, updates);
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