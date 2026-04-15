import { ToolDefinition } from "@/types/tool";
import { ApifyAdapter } from "./apify-adapter";
import { GASAdapter } from "./gas-adapter";
import { ChromeExtAdapter } from "./chrome-ext-adapter";

const adapters: Record<
  string,
  React.ComponentType<{ tool: ToolDefinition }>
> = {
  apify: ApifyAdapter as React.ComponentType<{ tool: ToolDefinition }>,
  "google-apps-script": GASAdapter as React.ComponentType<{
    tool: ToolDefinition;
  }>,
  "chrome-extension": ChromeExtAdapter as React.ComponentType<{
    tool: ToolDefinition;
  }>,
};

export function ToolAdapter({ tool }: { tool: ToolDefinition }) {
  const Adapter = adapters[tool.type];
  if (!Adapter) {
    return (
      <div className="text-muted-foreground text-sm">
        No adapter available for tool type: {tool.type}
      </div>
    );
  }
  return <Adapter tool={tool} />;
}
