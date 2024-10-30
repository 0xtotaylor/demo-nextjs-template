import { z } from "zod";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { SKYFIRE_ENDPOINT_URL } from "@/lib/skyfire-sdk/env";

interface APIResponse {
  success: boolean;
  urls: string[];
  error?: string;
}

const urlExtractionSchema = z.object({
  urls: z.array(
    z.object({
      url: z.string().url(),
      context: z.string().optional(),
    })
  ),
});

const requestSchema = z.object({
  text: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = requestSchema.parse(body);
    const apiKey = req.headers.get("skyfire-api-key");

    if (!apiKey) {
      return NextResponse.json<APIResponse>(
        { success: false, urls: [], error: "Missing API Key" },
        { status: 401 }
      );
    }

    if (!SKYFIRE_ENDPOINT_URL) {
      return NextResponse.json<APIResponse>(
        { success: false, urls: [], error: "Missing Skyfire Endpoint URL" },
        { status: 500 }
      );
    }

    const skyfireWithOpenAI = createOpenAI({
      baseURL: `${SKYFIRE_ENDPOINT_URL}/proxy/openai/v1`,
      headers: {
        "skyfire-api-key": apiKey,
      },
    });

    const { object } = await generateObject({
      model: skyfireWithOpenAI("gpt-4o"),
      schema: urlExtractionSchema,
      prompt: `Extract all URLs from the following text. Include both regular URLs and URLs from markdown links. For each URL, provide some brief context about what it links to based on the surrounding text: ${text}`,
    });

    return NextResponse.json<APIResponse>({
      success: true,
      urls: object.urls.map((item) => item.url),
    });
  } catch (error) {
    console.error("URL extraction error:", error);

    try {
      const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
      const urlRegex = /(https?:\/\/[^\s\)]+)/g;
      const extractedUrls = new Set<string>();
      let match;
      const { text } = requestSchema.parse(await req.json());

      while ((match = markdownLinkRegex.exec(text)) !== null) {
        const url = match[2];
        extractedUrls.add(url);
      }

      const textWithoutMarkdownLinks = text.replace(markdownLinkRegex, "");
      while ((match = urlRegex.exec(textWithoutMarkdownLinks)) !== null) {
        extractedUrls.add(match[1]);
      }

      return NextResponse.json<APIResponse>({
        success: true,
        urls: Array.from(extractedUrls),
      });
    } catch (error) {
      console.error("Regex fallback error:", error);
      return NextResponse.json<APIResponse>(
        {
          success: false,
          urls: [],
          error: "Failed to extract URLs",
        },
        { status: 500 }
      );
    }
  }
}
