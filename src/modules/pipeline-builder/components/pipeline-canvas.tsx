"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { usePipelineActions, usePipelineBuilderStore } from "../store/pipeline-store";
import { PipelineNodeView, type PipelineNodeData } from "./pipeline-node";

const nodeTypes = { pipelineNode: PipelineNodeView };

const NODE_GAP_X = 260;

export default function PipelineCanvas() {
  const pipeline = usePipelineBuilderStore((s) => s.pipeline);
  const nodeRuntime = usePipelineBuilderStore((s) => s.nodeRuntime);
  const selectedNodeId = usePipelineBuilderStore((s) => s.selectedNodeId);
  const { selectNode } = usePipelineActions();

  const nodes = useMemo<Node<PipelineNodeData>[]>(() => {
    if (!pipeline) return [];
    return pipeline.nodes.map((node, index) => ({
      id: node.id,
      type: "pipelineNode",
      position: { x: index * NODE_GAP_X, y: (index % 2) * 40 },
      data: {
        node,
        runtime: nodeRuntime[node.id] ?? { status: "idle" },
        selected: node.id === selectedNodeId,
      },
    }));
  }, [pipeline, nodeRuntime, selectedNodeId]);

  const edges = useMemo<Edge[]>(() => {
    if (!pipeline) return [];
    return pipeline.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: nodeRuntime[edge.target]?.status === "running",
      style: { stroke: "#38bdf8", strokeWidth: 1.5 },
    }));
  }, [pipeline, nodeRuntime]);

  return (
    <div className="border-border h-full min-h-96 overflow-hidden rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        nodesConnectable={false}
        deleteKeyCode={null}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1f2937" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
