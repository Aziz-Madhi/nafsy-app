// convex/auth.config.js
export default {
  providers: [
    {
      domain: "https://" + process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};