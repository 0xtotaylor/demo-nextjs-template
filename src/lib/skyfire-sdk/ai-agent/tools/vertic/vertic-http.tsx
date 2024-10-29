import React from "react";
import { z } from "zod";
import axios from "axios";

import { Component } from "./component";
import { BaseTool } from "../basetool.class";
import { verticSchema } from "@/constants/schema";

type OpenAPIPath = {
  get?: {
    deprecated: boolean;
    parameters: Array<{
      name: string;
      in: string;
      required: boolean;
      schema: {
        type: string;
      };
      description: string;
    }>;
    description: string;
    operationId: string;
  };
};

type Operation = {
  path: string;
  method: string;
  operationId: string;
  description: string;
  parameters: Array<{
    name: string;
    required: boolean;
    type: string;
    description: string;
  }>;
};

class VerticHTTPTool extends BaseTool {
  public static override readonly toolName = "vertic_http";
  private baseUrl: string;
  private apiKey: string;
  private operations: Map<string, Operation>;

  constructor(config: { SKYFIRE_ENDPOINT_URL: string; apiKey: string }) {
    super();
    this.baseUrl = config.SKYFIRE_ENDPOINT_URL;
    this.apiKey = config.apiKey;
    this.operations = this.parseSchema();
  }

  private parseSchema(): Map<string, Operation> {
    const operations = new Map<string, Operation>();

    Object.entries(verticSchema.paths).forEach(([path, pathObj]) => {
      const pathDef = pathObj as OpenAPIPath;

      if (pathDef.get && !pathDef.get.deprecated) {
        const operation: Operation = {
          path,
          method: "get",
          operationId: pathDef.get.operationId,
          description: pathDef.get.description,
          parameters: pathDef.get.parameters.map((param) => ({
            name: param.name,
            required: param.required,
            type: param.schema.type,
            description: param.description,
          })),
        };

        const operationName = this.generateOperationName(path);
        operations.set(operationName, operation);
      }
    });

    return operations;
  }

  private generateOperationName(path: string): string {
    const parts = path.split("/").filter(Boolean);
    return `fetch${parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")}`;
  }

  public static override readonly instruction = `
    To fetch data using the Vertic API, you can use the following operations:
    ${Array.from(
      new VerticHTTPTool({
        SKYFIRE_ENDPOINT_URL: "",
        apiKey: "",
      }).operations.keys()
    )
      .map((op) => `- ${op}`)
      .join("\n")}
    
    Each operation requires a query parameter.
  `;

  public override createTool() {
    const OperationEnum = z.enum(
      Array.from(this.operations.keys()) as [string, ...string[]]
    );

    return this.createBaseTool(
      "Make Vertic API calls to fetch data",
      z.object({
        operation: OperationEnum,
        query: z.string(),
      }),
      async ({ operation, query }) => {
        try {
          const operationConfig = this.operations.get(operation);
          if (!operationConfig) {
            throw new Error(`Invalid operation: ${operation}`);
          }

          const endpoint = `${this.baseUrl}/v1/receivers/vetric${operationConfig.path}`;

          console.log(`Making request to: ${endpoint}`);

          const response = await axios({
            method: operationConfig.method,
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
