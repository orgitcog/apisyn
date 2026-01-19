import React from "react";
import { Page } from "@shopify/polaris";
import { AIChat } from "../../components/OpenAI/AIChat";

export function AIAssistant() {
  return (
    <Page
      title="Analytics Assistant"
      subtitle="Get insights and analysis using natural language"
    >
      <AIChat
        systemPrompt="You are an analytics expert for a Shopify enterprise dashboard. Help users understand their store data, trends, and provide actionable insights. Use data from their connected stores to provide specific, data-driven recommendations."
        title="Analytics Assistant"
        model="gpt-4-turbo-preview"
        placeholder="Ask about your store performance, trends, or specific metrics..."
      />
    </Page>
  );
}
