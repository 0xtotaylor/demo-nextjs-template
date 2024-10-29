import React from "react";
import { z } from "zod";
import axios from "axios";
import { BaseTool } from "../basetool.class";
import { Component } from "./component";
import { verticSchema } from "@/constants/schema";

type OpenAPISchema = {
  openapi: string;
  servers: Array<{
    url: string;
    variables?: {
      baseUrl?: {
        default: string;
      };
    };
  }>;
  paths: {
    [key: string]: OpenAPIPath;
  };
};

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
  service: string;
  endpoint: string;
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
    this.baseUrl = this.resolveBaseUrl(verticSchema);
    this.apiKey = config.apiKey;
    this.operations = this.parseSchema(verticSchema);
  }

  private resolveBaseUrl(schema: OpenAPISchema): string {
    if (schema.servers && schema.servers.length > 0) {
      const serverUrl = schema.servers[0].url;
      if (
        serverUrl.includes("{baseUrl}") &&
        schema.servers[0].variables?.baseUrl
      ) {
        return serverUrl.replace(
          "{baseUrl}",
          schema.servers[0].variables.baseUrl.default
        );
      }
      return serverUrl;
    }
    return this.baseUrl;
  }

  private parsePath(path: string): { service: string; endpoint: string } {
    const segments = path.split("/").filter(Boolean);

    let serviceIndex = segments.findIndex(
      (segment) =>
        segment.includes("vetric-") ||
        ["facebook", "twitter", "linkedin"].includes(segment)
    );

    if (serviceIndex === -1) {
      serviceIndex = segments.length - 2;
    }

    const service = segments[serviceIndex].replace("vetric-", "");

    const versionIndex = segments.findIndex((segment) =>
      segment.startsWith("v")
    );
    const startIndex =
      versionIndex !== -1 ? versionIndex + 1 : serviceIndex + 1;
    const endpoint = segments.slice(startIndex).join("/");

    return { service, endpoint };
  }

  private parseSchema(schema: OpenAPISchema): Map<string, Operation> {
    const operations = new Map<string, Operation>();

    Object.entries(schema.paths).forEach(([path, pathObj]) => {
      const pathDef = pathObj as OpenAPIPath;

      if (pathDef.get && !pathDef.get.deprecated) {
        const { service, endpoint } = this.parsePath(path);

        const operation: Operation = {
          path,
          method: "get",
          operationId: pathDef.get.operationId,
          description: pathDef.get.description,
          service,
          endpoint,
          parameters: pathDef.get.parameters.map((param) => ({
            name: param.name,
            required: param.required,
            type: param.schema.type,
            description: param.description,
          })),
        };

        const operationName = this.generateOperationName(service, endpoint);
        operations.set(operationName, operation);
      }
    });

    return operations;
  }

  private generateOperationName(service: string, endpoint: string): string {
    const cleanService = service.charAt(0).toUpperCase() + service.slice(1);

    const endpointParts = endpoint.split("/").filter(Boolean);
    const cleanEndpoint = endpointParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    return `fetch${cleanService}${cleanEndpoint}`;
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

  private formatRequestURL(operationConfig: Operation): string {
    const url = new URL(operationConfig.path, this.baseUrl);
    return url.toString();
  }

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

          const endpoint = this.formatRequestURL(operationConfig);
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
              service: operationConfig.service,
              endpoint: operationConfig.endpoint,
              query,
              result: response.data,
            }),
          };
        } catch (error) {
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
      service?: string;
      endpoint?: string;
      query: string;
      result?: any;
      error?: string;
    };
  }> = ({ result }) => {
    return <Component result={result} />;
  };
}

export default VerticHTTPTool;
