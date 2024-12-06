import { Link, MindMapData, Subtopic, SubtopicSchema } from "@/app/lib/schemas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const convertToMarkdown = (data: MindMapData): string => {
  let markdown = `# ${data.topic}\n\n`;

  const processSubtopic = (subtopic: Subtopic, depth: number): void => {
    const prefix = "#".repeat(depth + 1);
    markdown += `${prefix} ${subtopic.name}\n\n${subtopic.details}\n\n`;

    if (subtopic.links && subtopic.links.length > 0) {
      markdown += "Learn More:\n";
      subtopic.links.forEach((link: Link) => {
        markdown += `- [${link.title}](${link.url}) (${link.type})\n`;
      });
      markdown += "\n";
    }

    if (subtopic.subtopics && subtopic.subtopics.length > 0) {
      subtopic.subtopics.forEach((childSubtopic: Subtopic) =>
        processSubtopic(childSubtopic, depth + 1)
      );
    }
  };

  data.subtopics.forEach((subtopic) => processSubtopic(subtopic, 1));

  return markdown;
};

export function downloadJson(data: MindMapData, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function uploadJson(file: File): Promise<MindMapData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json as MindMapData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateLinks = async (subtopic: Subtopic): Promise<Subtopic> => {
  const validatedLinks = await Promise.all(
    subtopic.links.map(async (link: Link) => {
      if (!isValidUrl(link.url)) {
        return null;
      }
      try {
        const response = await fetch(link.url, { method: "HEAD" });
        return response.ok ? link : null;
      } catch {
        return null;
      }
    })
  );
  subtopic.links = validatedLinks.filter(
    (link): link is NonNullable<typeof link> => link !== null
  );

  if (subtopic.subtopics) {
    subtopic.subtopics = await Promise.all(
      subtopic.subtopics.map(validateLinks)
    );
  }

  return SubtopicSchema.parse(subtopic);
};

export const validateMindMapData = async (
  data: MindMapData
): Promise<MindMapData> => {
  data.subtopics = await Promise.all(data.subtopics.map(validateLinks));
  return data;
};
