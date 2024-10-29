import React from "react";
import { z } from "zod";
import axios from "axios";
import { BaseTool } from "../basetool.class";
import { Component } from "./component";

class VerticHTTPTool extends BaseTool {
  public static override readonly toolName = "vertic_http";

  public static override readonly instruction = `
    To fetch tweets or LinkedIn data using the Vertic API:
    1. For top tweets, use operation "fetchTopTweets" with a query parameter
    2. For LinkedIn search, use operation "searchLinkedIn" with a query parameter
    
    Examples:
    - To get top tweets about AI: Use fetchTopTweets with query "artificial intelligence"
    - To search LinkedIn: Use searchLinkedIn with query "software engineers"
  `;

  private baseUrl: string;
  private apiKey: string;

  constructor(config: { SKYFIRE_ENDPOINT_URL: string; apiKey: string }) {
    super();
    this.baseUrl = config.SKYFIRE_ENDPOINT_URL;
    this.apiKey = config.apiKey;
  }

  private getEndpointPath(operation: string): string {
    const operationMap: Record<string, string> = {
      fetchTopTweets: "/twitter/top",
      searchLinkedIn: "/linkedin/people-search",
    };

    return operationMap[operation] || "";
  }

  public override createTool() {
    return this.createBaseTool(
      "Make Vertic API calls to fetch tweets or LinkedIn data",
      z.object({
        operation: z.enum(["fetchTopTweets", "searchLinkedIn"]),
        query: z.string(),
      }),
      async ({ operation, query }) => {
        try {
          const path = this.getEndpointPath(operation);
          if (!path) {
            throw new Error(`Invalid operation: ${operation}`);
          }

          const endpoint = `${this.baseUrl}/v1/receivers/vetric${path}`;

          console.log(`Making request to: ${endpoint}`);

          const response = await axios({
            method: "GET",
            url: endpoint,
            headers: {
              "Content-Type": "application/json",
              "skyfire-api-key": this.apiKey,
            },
            params: { query },
          });

          return {
            role: "function",
            name: VerticHTTPTool.toolName,
            content: JSON.stringify({
              success: true,
              operation,
              query,
              result: response.data,
            }),
          };
        } catch (error) {
          console.error("API Request Error:", error);
          return {
            role: "function",
            name: VerticHTTPTool.toolName,
            content: JSON.stringify({
              success: false,
              operation,
              query,
              error: error instanceof Error ? error.message : "Unknown error",
            }),
          };
        }
      }
    );
  }

  public static override ClientComponent: React.FC<{
    result: {
      success: boolean;
      operation: string;
      query: string;
      result?: any;
      error?: string;
    };
  }> = ({ result }) => {
    return <Component result={result} />;
  };
}

export default VerticHTTPTool;
