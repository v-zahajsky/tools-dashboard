import { notFound } from "next/navigation";
import { getToolById } from "@/lib/registry";
import { ToolHeader } from "@/components/tool-detail/tool-header";
import { ToolAdapter } from "@/components/adapters/adapter-registry";

interface Props {
  params: Promise<{ toolId: string }>;
}

export default async function ToolDetailPage({ params }: Props) {
  const { toolId } = await params;
  const tool = getToolById(toolId);

  if (!tool) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <ToolHeader tool={tool} />
      <ToolAdapter tool={tool} />
    </div>
  );
}
