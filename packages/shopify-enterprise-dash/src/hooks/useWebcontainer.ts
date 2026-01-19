import React from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import * as WebContainerAPI from "../lib/webcontainer";

// Configure the query client
const queryClient = new QueryClient();

// Container Management
export const useContainer = (containerId: string) => {
  return useQuery({
    queryKey: ["webcontainer", containerId],
    queryFn: () => WebContainerAPI.getContainer(containerId),
    enabled: !!containerId,
  });
};

export const useCreateContainer = () => {
  return useMutation({
    mutationFn: WebContainerAPI.createContainer,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["webcontainer", data.id] });
      }
    },
  });
};

export const useUpdateContainer = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<WebContainerAPI.WebContainerConfig>;
    }) => WebContainerAPI.updateContainer(id, updates),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["webcontainer", data.id] });
      }
    },
  });
};

export const useDeleteContainer = () => {
  return useMutation({
    mutationFn: WebContainerAPI.deleteContainer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["webcontainer", id] });
    },
  });
};

// Nesting
export const useNestedContainers = (parentId: string) => {
  return useQuery({
    queryKey: ["webcontainer-nesting", parentId],
    queryFn: () => WebContainerAPI.getNestedContainers(parentId),
    enabled: !!parentId,
  });
};

export const useCreateNesting = () => {
  return useMutation({
    mutationFn: ({
      parentId,
      childId,
      type,
    }: {
      parentId: string;
      childId: string;
      type: WebContainerAPI.WebContainerNesting["relationship_type"];
    }) => WebContainerAPI.createNesting(parentId, childId, type),
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["webcontainer-nesting", parentId],
      });
    },
  });
};

// Metrics
export const useContainerMetrics = (
  containerId: string,
  timeRange: { start: string; end: string },
) => {
  return useQuery({
    queryKey: ["webcontainer-metrics", containerId, timeRange],
    queryFn: () => WebContainerAPI.getMetrics(containerId, timeRange),
    enabled: !!containerId,
  });
};

export const useRecordMetrics = () => {
  return useMutation({
    mutationFn: WebContainerAPI.recordMetrics,
  });
};

// Communication
export const useSendMessage = () => {
  return useMutation({
    mutationFn: ({
      fromId,
      toId,
      message,
    }: {
      fromId: string;
      toId: string;
      message: any;
    }) => WebContainerAPI.sendMessage(fromId, toId, message),
  });
};

export const useMessageSubscription = (
  containerId: string,
  onMessage: (message: any) => void,
) => {
  React.useEffect(() => {
    if (!containerId) return;

    const subscription = WebContainerAPI.subscribeToMessages(
      containerId,
      onMessage,
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [containerId, onMessage]);
};
