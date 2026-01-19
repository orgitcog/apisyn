import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  TextField,
  Button,
  Text,
  Spinner,
  Avatar,
  TextContainer,
  Modal,
} from "@shopify/polaris";
import { useCompletionChat } from "../../hooks/useOpenAI";
import { Send, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIChatProps {
  systemPrompt?: string;
  title?: string;
  model?: string;
  placeholder?: string;
}

export function AIChat({
  systemPrompt = "You are a helpful AI assistant for a Shopify merchant.",
  title = "AI Assistant",
  model = "gpt-4-turbo-preview",
  placeholder = "Ask a question...",
}: AIChatProps) {
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(systemPrompt);
  const [customModel, setCustomModel] = useState(model);

  const { messages, isProcessing, error, sendMessage, resetChat } =
    useCompletionChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const currentInput = input;
    setInput("");
    await sendMessage(currentInput, customModel, customPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    resetChat();
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    if (messages.length === 0) {
      // If chat is empty, settings will apply to next conversation
    } else {
      // Otherwise, offer to reset chat
      resetChat();
    }
  };

  return (
    <Card sectioned title={title}>
      <div className="flex flex-col h-[600px]">
        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <TextContainer>
                <Text variant="bodySm">
                  Send a message to start the conversation...
                </Text>
              </TextContainer>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                // Skip system messages in the display
                if (message.role === "system") return null;

                return (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className="flex-shrink-0 mr-2">
                        {message.role === "user" ? (
                          <Avatar customer size="small" name="You" />
                        ) : (
                          <Avatar
                            source="https://cdn.shopify.com/s/files/1/0598/6584/5343/files/bot-avatar.png"
                            size="small"
                          />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-indigo-100 text-gray-800"
                            : "bg-white border border-gray-200 shadow-sm"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-[80%]">
                    <div className="flex-shrink-0 mr-2">
                      <Avatar
                        source="https://cdn.shopify.com/s/files/1/0598/6584/5343/files/bot-avatar.png"
                        size="small"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Spinner size="small" />
                        <span className="text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg mt-4">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div>
          <div className="flex">
            <div className="flex-grow">
              <TextField
                label=""
                value={input}
                onChange={setInput}
                placeholder={placeholder}
                autoComplete="off"
                multiline={3}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col ml-2 justify-end space-y-2">
              <Button
                primary
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                icon={<Settings className="w-4 h-4" />}
              >
                Settings
              </Button>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <Button
              plain
              onClick={handleReset}
              disabled={messages.length === 0}
            >
              Reset Conversation
            </Button>
            <Text variant="bodySm" color="subdued">
              {customModel}
            </Text>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="AI Assistant Settings"
        primaryAction={{
          content: "Save Settings",
          onAction: handleSaveSettings,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowSettings(false),
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="System Prompt"
            value={customPrompt}
            onChange={setCustomPrompt}
            multiline={4}
            helpText="Instructions that define how the AI assistant behaves"
          />

          <div className="mt-4">
            <TextField
              label="Model"
              value={customModel}
              onChange={setCustomModel}
              helpText="The OpenAI model to use (e.g., gpt-4-turbo, gpt-3.5-turbo)"
            />
          </div>

          {messages.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <Text variant="bodyMd" as="p">
                Changing settings will reset the current conversation.
              </Text>
            </div>
          )}
        </Modal.Section>
      </Modal>
    </Card>
  );
}
