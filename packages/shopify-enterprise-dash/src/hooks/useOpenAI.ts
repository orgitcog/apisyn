import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as OpenAIAPI from "../lib/openai";
import { useState } from "react";

// Configure the query client
const queryClient = new QueryClient();

// Assistants
export const useAssistants = () => {
  return useQuery({
    queryKey: ["assistants"],
    queryFn: () => {
      // Use mock data during development
      return OpenAIAPI.getMockAssistants();
      // In production: return OpenAIAPI.getAssistants();
    },
  });
};

export const useAssistant = (assistantId: string) => {
  return useQuery({
    queryKey: ["assistant", assistantId],
    queryFn: () => OpenAIAPI.getAssistant(assistantId),
    enabled: !!assistantId,
  });
};

export const useCreateAssistant = () => {
  return useMutation({
    mutationFn: ({
      name,
      instructions,
      model = "gpt-4-turbo-preview",
      tools = [{ type: "retrieval" }],
    }: {
      name: string;
      instructions: string;
      model?: string;
      tools?: any[];
    }) => OpenAIAPI.createAssistant(name, instructions, model, tools),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] });
    },
  });
};

export const useUpdateAssistant = () => {
  return useMutation({
    mutationFn: ({
      assistantId,
      updates,
    }: {
      assistantId: string;
      updates: Partial<{
        name: string;
        instructions: string;
        model: string;
        tools: any[];
      }>;
    }) => OpenAIAPI.updateAssistant(assistantId, updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["assistants"] });
        queryClient.invalidateQueries({ queryKey: ["assistant", data.id] });
      }
    },
  });
};

export const useDeleteAssistant = () => {
  return useMutation({
    mutationFn: (assistantId: string) => OpenAIAPI.deleteAssistant(assistantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] });
    },
  });
};

// Threads & Messages
export const useThreadMessages = (threadId: string) => {
  return useQuery({
    queryKey: ["threadMessages", threadId],
    queryFn: () => {
      if (!threadId) return [];

      // Use mock data during development
      return OpenAIAPI.getMockThreadMessages();
      // In production: return OpenAIAPI.getMessages(threadId);
    },
    enabled: !!threadId,
  });
};

// Custom hook for managing a chat conversation with an assistant
export const useAssistantChat = (assistantId: string) => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [_runId, setRunId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = useThreadMessages(threadId || "");

  // Initialize or reset the chat
  const initializeChat = async () => {
    try {
      setError(null);
      // Create a new thread
      const newThreadId = await OpenAIAPI.createThread();
      if (newThreadId) {
        setThreadId(newThreadId);
        return newThreadId;
      } else {
        throw new Error("Failed to create thread");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred initializing chat",
      );
      return null;
    }
  };

  // Send a message and get a response
  const sendMessage = async (content: string, customInstructions?: string) => {
    try {
      setError(null);
      setIsProcessing(true);

      // Create a thread if one doesn't exist yet
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await initializeChat();
        if (!currentThreadId) throw new Error("Failed to initialize chat");
      }

      // Add the user message to the thread
      await OpenAIAPI.createMessage(currentThreadId, content);

      // Run the assistant
      const newRunId = await OpenAIAPI.runAssistant(
        currentThreadId,
        assistantId,
        customInstructions,
      );
      if (!newRunId) throw new Error("Failed to run assistant");

      setRunId(newRunId);

      // Poll for completion (in real implementation)
      // In development, we'll just use mock data
      // For production, you would poll getRunStatus until it returns 'completed'
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh messages
      queryClient.invalidateQueries({
        queryKey: ["threadMessages", currentThreadId],
      });

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred sending message",
      );
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    threadId,
    messages: messages.data || [],
    isLoadingMessages: messages.isLoading,
    isProcessing,
    error,
    initializeChat,
    sendMessage,
  };
};

// Fine-tuning
export const useFineTuningJobs = () => {
  return useQuery({
    queryKey: ["fineTuningJobs"],
    queryFn: () => {
      // Use mock data during development
      return OpenAIAPI.getMockFineTuningJobs();
      // In production: return OpenAIAPI.getFineTuningJobs();
    },
  });
};

export const useFineTuningJob = (jobId: string) => {
  return useQuery({
    queryKey: ["fineTuningJob", jobId],
    queryFn: () => OpenAIAPI.getFineTuningJob(jobId),
    enabled: !!jobId,
  });
};

// Usage and Monitoring
export const useUsageMetrics = (
  startDate?: string,
  endDate?: string,
  userId?: string,
) => {
  return useQuery({
    queryKey: ["usageMetrics", startDate, endDate, userId],
    queryFn: () => {
      // Use mock data during development
      return OpenAIAPI.getMockUsageMetrics();
      // In production: return OpenAIAPI.calculateUsageMetrics(startDate, endDate, userId);
    },
  });
};

export const useAvailableModels = () => {
  return useQuery({
    queryKey: ["availableModels"],
    queryFn: () => {
      // Use mock data during development
      return OpenAIAPI.getMockModels();
      // In production: return OpenAIAPI.getModels();
    },
  });
};

// Direct Chat Completions
export const useCompletionChat = () => {
  const [messages, setMessages] = useState<OpenAIAPI.ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    content: string,
    model: string = "gpt-4-turbo-preview",
    systemPrompt?: string,
  ) => {
    try {
      setError(null);
      setIsProcessing(true);

      // If a system prompt is provided and it's the first message, add it
      const currentMessages = [...messages];
      if (systemPrompt && currentMessages.length === 0) {
        currentMessages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add the user message
      currentMessages.push({
        role: "user",
        content,
      });

      setMessages(currentMessages);

      // Get the completion
      const response = await OpenAIAPI.generateChatCompletion(
        currentMessages,
        model,
      );

      if (response) {
        // Add the assistant response
        const updatedMessages = [
          ...currentMessages,
          { role: "assistant", content: response },
        ];

        setMessages(updatedMessages);
        return response;
      } else {
        throw new Error("Failed to get response");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred processing your request",
      );
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isProcessing,
    error,
    sendMessage,
    resetChat,
  };
};

// Content Moderation
export const useContentModeration = () => {
  return useMutation({
    mutationFn: (content: string) => OpenAIAPI.moderateContent(content),
  });
};
