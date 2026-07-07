import type { Metadata } from "next";
import { WorkbenchView } from "@/modules/ai-workbench/components/workbench-view";

export const metadata: Metadata = { title: "AI Workbench" };

export default function AiWorkbenchPage() {
  return <WorkbenchView />;
}
