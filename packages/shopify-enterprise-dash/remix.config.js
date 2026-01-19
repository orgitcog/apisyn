/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  tailwind: true,
  postcss: true,
  serverDependenciesToBundle: [
    "@shopify/polaris",
    "@shopify/polaris-icons",
    "lucide-react",
    "recharts",
    /^@shopify\/.*/,
    /^\.\.\/src\/components\/.*/,
    /^\.\.\/src\/context\/.*/,
  ],
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true,
  }
};