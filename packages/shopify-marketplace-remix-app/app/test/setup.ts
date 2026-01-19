/**
 * Vitest setup file for main app tests
 */

// Setup environment variables for tests
process.env.NODE_ENV = "test";
process.env.SHOPIFY_API_KEY = "test-api-key";
process.env.SHOPIFY_API_SECRET = "test-api-secret";
process.env.SCOPES = "read_products,write_products";
