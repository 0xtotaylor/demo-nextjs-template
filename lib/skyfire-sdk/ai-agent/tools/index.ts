import ComposeEmailTool from "./compose-email/compose-email"
import SendEmailTool from "./send-email/send-email"
import ShowImagesTool from "./show-images/show-images"
import VetricHTTPTool from "./vetric/vetric-http"

export const createTools = (SKYFIRE_ENDPOINT_URL: string, apiKey: string) => {
  const toolInstances = {
    show_images: new ShowImagesTool(),
    compose_email: new ComposeEmailTool(),
    send_email: new SendEmailTool({ SKYFIRE_ENDPOINT_URL, apiKey }),
    vertic_http: new VetricHTTPTool({ SKYFIRE_ENDPOINT_URL, apiKey }),
  }

  return Object.fromEntries(
    Object.entries(toolInstances).map(([name, instance]) => [
      name,
      instance.createTool(),
    ])
  )
}

export const tools = {
  ShowImagesTool,
  ComposeEmailTool,
  SendEmailTool,
  VetricHTTPTool,
}

export type ToolName = keyof typeof tools

export const toolsInstruction = Object.values(tools)
  .map((Tool) => Tool.instruction)
  .join("\n\n")

export { ShowImagesTool, ComposeEmailTool, SendEmailTool, VetricHTTPTool }
