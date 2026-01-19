import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { TestModeProvider } from "./context/TestModeContext";
import { AuthProvider } from "./context/AuthContext";
import "./styles/tailwind.css";

const queryClient = new QueryClient();

export function meta() {
  return [
    { title: "Shopify Enterprise Dashboard" },
    { charset: "utf-8" },
    { viewport: "width=device-width,initial-scale=1" },
  ];
}

export function links() {
  return [{ rel: "icon", href: "/favicon.ico" }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TestModeProvider>
              <AppProvider i18n={enTranslations}>
                <Layout>
                  <Outlet />
                </Layout>
              </AppProvider>
            </TestModeProvider>
          </AuthProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
