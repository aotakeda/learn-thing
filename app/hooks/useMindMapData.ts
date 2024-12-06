"use client";

import { uploadJson } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { MindMapData, Subtopic } from "../lib/schemas";

export function useMindMapData() {
  const [data, setData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMindMap = async (topic: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic }),
      });
      const data = await response.text();
      setData(JSON.parse(data));
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const setMindMapData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadJson(file)
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((_error) => {
        toast.error(
          "There was an error uploading your mind map, please try again."
        );
      });
  };

  const mergeExpandedData = (
    existingData: MindMapData,
    expandedData: MindMapData,
    nodeId: string
  ): MindMapData => {
    const findAndUpdateNode = (subtopics: Subtopic[]): Subtopic[] => {
      return subtopics.map((subtopic) => {
        const currentNodeName = subtopic.name.replace(/\s+/g, "-");

        if (
          nodeId === `${subtopic.name.replace(/\s+/g, "-")}` ||
          nodeId.endsWith(`-${currentNodeName}`)
        ) {
          return {
            ...subtopic,
            subtopics: expandedData.subtopics,
          };
        }

        if (subtopic.subtopics && subtopic.subtopics.length > 0) {
          return {
            ...subtopic,
            subtopics: findAndUpdateNode(subtopic.subtopics),
          };
        }

        return subtopic;
      });
    };

    const result = {
      ...existingData,
      subtopics: findAndUpdateNode(existingData.subtopics),
    };

    return result;
  };

  const expandMap = async (nodeId: string) => {
    if (!data) return;

    try {
      setIsLoading(true);
      const nodeTopic = getNodeTopic(data, nodeId);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: nodeTopic,
          nodeId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to expand map");
      }

      const expandedData = await response.json();
      const mergedData = mergeExpandedData(data, expandedData, nodeId);

      setData(mergedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error in expandMap:", err);
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const getNodeTopic = (data: MindMapData, nodeId: string): string => {
    const findTopic = (subtopics: Subtopic[]): string | null => {
      for (const subtopic of subtopics) {
        const currentNodeName = subtopic.name.replace(/\s+/g, "-");

        if (
          nodeId === currentNodeName ||
          nodeId.endsWith(`-${currentNodeName}`)
        ) {
          return subtopic.name;
        }

        const found = subtopic.subtopics?.length
          ? findTopic(subtopic.subtopics)
          : null;
        if (found) return found;
      }
      return null;
    };

    const topic = findTopic(data.subtopics);
    return topic || data.topic;
  };

  return { data, isLoading, error, fetchMindMap, setMindMapData, expandMap };
}
