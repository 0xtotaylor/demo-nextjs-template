import React from "react"
import { vetricSchema } from "@/constants/schema"
import axios from "axios"
import { z } from "zod"

import { BaseTool } from "../basetool.class"
import { Component } from "./component"

type HTTPMethod = "get" | "post"

type Parameter = {
  name: string
  in: string
  required: boolean
  schema: {
    type: string
  }
  description: string
}

type OpenAPIPath = {
  [key in HTTPMethod]?: {
    deprecated: boolean
    parameters: Parameter[]
    description: string
    operationId: string
  }
}

type Operation = {
  path: string
  method: HTTPMethod
  operationId: string
  description: string
  service: string
  endpoint: string
  parameters: Array<{
    name: string
    in: string
    required: boolean
    type: string
    description: string
  }>
}

class VetricHTTPTool extends BaseTool {
  public static override readonly toolName = "vetric_http"
  private baseUrl: string
  private apiKey: string
  private operations: Map<string, Operation>

  constructor(config: { SKYFIRE_ENDPOINT_URL: string; apiKey: string }) {
    super()
    this.baseUrl = this.resolveBaseUrl(vetricSchema)
    this.apiKey = config.apiKey
    this.operations = this.parseSchema(vetricSchema)
  }

  /**
   * Resolves the base URL from the OpenAPI schema.
   * @param schema - The OpenAPI schema object.
   * @returns The resolved base URL as a string.
   */
  private resolveBaseUrl(schema: any): string {
    if (schema.servers && schema.servers.length > 0) {
      const serverUrl = schema.servers[0].url
      if (
        serverUrl.includes("{baseUrl}") &&
        schema.servers[0].variables?.baseUrl
      ) {
        return serverUrl.replace(
          "{baseUrl}",
          schema.servers[0].variables.baseUrl.default
        )
      }
      return serverUrl
    }
    return this.baseUrl
  }

  /**
   * Parses the path to extract service and endpoint information.
   * @param path - The API path to parse.
   * @returns An object containing the service and endpoint.
   */
  private parsePath(path: string): { service: string; endpoint: string } {
    const segments = path.split("/").filter(Boolean)

    let serviceIndex = segments.findIndex(
      (segment) =>
        segment.includes("vetric-") ||
        ["facebook", "twitter", "linkedin"].includes(segment)
    )

    if (serviceIndex === -1) {
      serviceIndex = segments.length - 2
    }

    const service = segments[serviceIndex].replace("vetric-", "")

    const versionIndex = segments.findIndex((segment) =>
      segment.startsWith("v")
    )
    const startIndex = versionIndex !== -1 ? versionIndex + 1 : serviceIndex + 1
    const endpoint = segments.slice(startIndex).join("/")

    return { service, endpoint }
  }

  /**
   * Parses the OpenAPI schema to extract operations.
   * @param schema - The OpenAPI schema object.
   * @returns A Map of operation names to Operation objects.
   */
  private parseSchema(schema: any): Map<string, Operation> {
    const operations = new Map<string, Operation>()

    Object.entries(schema.paths).forEach(([path, pathObj]) => {
      const pathDef = pathObj as OpenAPIPath

      ;["get", "post"].forEach((method) => {
        const methodDef = pathDef[method as HTTPMethod]
        if (methodDef && !methodDef.deprecated) {
          const { service, endpoint } = this.parsePath(path)

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
          }

          const operationName = this.generateOperationName(
            service,
            endpoint,
            method as HTTPMethod
          )
          operations.set(operationName, operation)
        }
      })
    })

    return operations
  }

  /**
   * Generates an operation name based on the service, endpoint, and HTTP method.
   * @param service - The name of the service.
   * @param endpoint - The API endpoint.
   * @param method - The HTTP method (GET or POST).
   * @returns A string representing the generated operation name.
   */
  private generateOperationName(
    service: string,
    endpoint: string,
    method: HTTPMethod
  ): string {
    const cleanService = service.charAt(0).toUpperCase() + service.slice(1)
    const endpointParts = endpoint.split("/").filter(Boolean)
    const cleanEndpoint = endpointParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")

    const methodPrefix = method === "post" ? "post" : "fetch"
    return `${methodPrefix}${cleanService}${cleanEndpoint}`
  }

  /**
   * Formats the request URL for a given operation.
   * @param operationConfig - The Operation object.
   * @returns The formatted request URL as a string.
   */
  private formatRequestURL(operationConfig: Operation): string {
    const url = new URL(operationConfig.path, this.baseUrl)
    return url.toString()
  }

  /**
   * Creates and returns the Vetric HTTP tool.
   * @returns A function that handles Vetric API calls.
   */
  public override createTool() {
    const OperationEnum = z.enum(
      Array.from(this.operations.keys()) as [string, ...string[]]
    )

    return this.createBaseTool(
      "Make Vetric API calls to fetch or post data",
      z.object({
        operation: OperationEnum,
        query: z.string(),
      }),
      async ({ operation, query }) => {
        try {
          const operationConfig = this.operations.get(operation)
          if (!operationConfig) {
            throw new Error(`Invalid operation: ${operation}`)
          }

          const endpoint = this.formatRequestURL(operationConfig)

          const queryParams: Record<string, string> = {}
          const bodyParams: Record<string, string> = {}

          operationConfig.parameters.forEach((param) => {
            if (param.required) {
              if (param.in === "query") {
                queryParams[param.name] = query
              } else {
                bodyParams[param.name] = query
              }
            }
          })

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
          })

          return {
            role: "function",
            name: VetricHTTPTool.toolName,
            content: JSON.stringify({
              success: true,
              operation,
              method: operationConfig.method,
              service: operationConfig.service,
              endpoint: operationConfig.endpoint,
              query,
              result: response.data,
            }),
          }
        } catch (error) {
          return {
            role: "function",
            name: VetricHTTPTool.toolName,
            content: JSON.stringify({
              success: false,
              operation,
              query,
              error: error instanceof Error ? error.message : "Unknown error",
            }),
          }
        }
      }
    )
  }

  public static override readonly instruction = `
    To interact with the Vertic API, you can use the following operations:
    ${Array.from(
      new VetricHTTPTool({
        SKYFIRE_ENDPOINT_URL: "",
        apiKey: "",
      }).operations.keys()
    )
      .map((op) => `- ${op}`)
      .join("\n")}
    
    Each operation requires a query parameter. The operation name indicates whether it's a GET (fetch*) or POST (post*) request.
  `

  public static override ClientComponent: React.FC<{
    result: {
      success: boolean
      operation: string
      method?: string
      service?: string
      endpoint?: string
      query: string
      result?: any
      error?: string
    }
  }> = ({ result }) => {
    return <Component result={result} />
  }
}

export default VetricHTTPTool
