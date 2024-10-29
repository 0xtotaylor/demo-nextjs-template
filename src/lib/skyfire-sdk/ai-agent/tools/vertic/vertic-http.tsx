import React from "react";
import { z } from "zod";
import axios from "axios";

import { Component } from "./component";
import { BaseTool } from "../basetool.class";
import { verticSchema } from "@/constants/schema";

type HTTPMethod = "get" | "post";

type Parameter = {
  name: string;
  in: string;
  required: boolean;
  schema: {
    type: string;
  };
  description: string;
};

type OpenAPIPath = {
  [key in HTTPMethod]?: {
    deprecated: boolean;
    parameters: Parameter[];
    description: string;
    operationId: string;
  };
};

type Operation = {
  path: string;
  method: HTTPMethod;
  operationId: string;
  description: string;
  service: string;
  endpoint: string;
  parameters: Array<{
    name: string;
    in: string;
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

  private resolveBaseUrl(schema: any): string {
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

  private parseSchema(schema: any): Map<string, Operation> {
    const operations = new Map<string, Operation>();

    Object.entries(schema.paths).forEach(([path, pathObj]) => {
      const pathDef = pathObj as OpenAPIPath;

      ["get", "post"].forEach((method) => {
        const methodDef = pathDef[method as HTTPMethod];
        if (methodDef && !methodDef.deprecated) {
          const { service, endpoint } = this.parsePath(path);

          const operation: Operation = {
            path,
            method: method as HTTPMethod,
            operationId: methodDef.operationId,
            description: methodDef.description,
            service,
            endpoint,
            parameters: methodDef.parameters.map((param) => ({
              name: param.name,
              in: param.in,
              required: param.required,
              type: param.schema.type,
              description: param.description,
            })),
          };

          const operationName = this.generateOperationName(
            service,
            endpoint,
            method as HTTPMethod
          );
          operations.set(operationName, operation);
        }
      });
    });

    return operations;
  }

  private generateOperationName(
    service: string,
    endpoint: string,
    method: HTTPMethod
  ): string {
    const cleanService = service.charAt(0).toUpperCase() + service.slice(1);
    const endpointParts = endpoint.split("/").filter(Boolean);
    const cleanEndpoint = endpointParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    const methodPrefix = method === "post" ? "post" : "fetch";
    return `${methodPrefix}${cleanService}${cleanEndpoint}`;
  }

  private formatRequestURL(operationConfig: Operation): string {
    const url = new URL(operationConfig.path, this.baseUrl);
    return url.toString();
  }

  public override createTool() {
    const OperationEnum = z.enum(
      Array.from(this.operations.keys()) as [string, ...string[]]
    );

    return this.createBaseTool(
      "Make Vertic API calls to fetch or post data",
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

          const queryParams: Record<string, string> = {};
          const bodyParams: Record<string, string> = {};

          operationConfig.parameters.forEach((param) => {
            if (param.required) {
              if (param.in === "query") {
                queryParams[param.name] = query;
              } else {
                bodyParams[param.name] = query;
              }
            }
          });

          const response = await axios({
            method: operationConfig.method,
            url: endpoint,
            headers: {
              "Content-Type": "application/json",
              "skyfire-api-key": this.apiKey,
            },
            params:
              Object.keys(queryParams).length > 0 ? queryParams : undefined,
            data: Object.keys(bodyParams).length > 0 ? bodyParams : undefined,
          });

          return {
            role: "function",
            name: VerticHTTPTool.toolName,
            content: JSON.stringify({
              success: true,
              operation,
              method: operationConfig.method,
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

  public static override readonly instruction = `
    To interact with the Vertic API, you can use the following operations:
    ${Array.from(
      new VerticHTTPTool({
        SKYFIRE_ENDPOINT_URL: "",
        apiKey: "",
      }).operations.keys()
    )
      .map((op) => `- ${op}`)
      .join("\n")}
    
    Each operation requires a query parameter. The operation name indicates whether it's a GET (fetch*) or POST (post*) request.
  `;

  public static override ClientComponent: React.FC<{
    result: {
      success: boolean;
      operation: string;
      method?: string;
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
