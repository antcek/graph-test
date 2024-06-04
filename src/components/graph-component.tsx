import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import jsonData1 from "../pages/json1.json";
import jsonData2 from "../pages/json2.json";
import jsonData3 from "../pages/json3.json";

interface Node {
  address: string;
  address_name: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Edge {
  from: string;
  to: string;
  balance_delta: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

const GraphViewer: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>(jsonData1);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleNodeClick = (nodeId: string) => {
    const clickedNodeId = nodeId;
    const jsonData =
      clickedNodeId === jsonData2.nodes[0].address ? jsonData2 : jsonData3;

    const newNodes = jsonData.nodes.filter(
      (node) => !graphData.nodes.find((n) => n.address === node.address)
    );
    const newEdges = jsonData.edges.filter(
      (edge) =>
        !graphData.edges.find((e) => e.from === edge.from && e.to === edge.to)
    );

    setGraphData({
      nodes: [...graphData.nodes, ...newNodes],
      edges: [...graphData.edges, ...newEdges],
    });
  };

  useEffect(() => {
    renderGraph();
  }, [graphData]);

  const renderGraph = () => {
    const width = 800;
    const height = 600;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const nodes = graphData.nodes.map((node, i) => ({
      ...node,
      id: node.address,
      label: node.address_name,
      x:
        node.x ??
        width / 2 + 200 * Math.cos((2 * Math.PI * i) / graphData.nodes.length),
      y:
        node.y ??
        height / 2 + 200 * Math.sin((2 * Math.PI * i) / graphData.nodes.length),
      fx: node.fx ?? null,
      fy: node.fy ?? null,
    }));

    const links = graphData.edges.map((link) => ({
      source: link.from,
      target: link.to,
      label: `${link.balance_delta}`,
    }));

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(parseFloat(d.label)));

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#69b3a2")
      .attr("cx", (d) => d.x!)
      .attr("cy", (d) => d.y!)
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event, d) => handleNodeClick(d.id));

    const text = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d) => d.x! + 6)
      .attr("y", (d) => d.y! + 3)
      .text((d) => d.label);

    function ticked() {
      link
        .attr(
          "x1",
          (d: any) =>
            (nodes.find((n) => n.id === (d.source.id || d.source)) as any)?.x ??
            0
        )
        .attr(
          "y1",
          (d: any) =>
            (nodes.find((n) => n.id === (d.source.id || d.source)) as any)?.y ??
            0
        )
        .attr(
          "x2",
          (d: any) =>
            (nodes.find((n) => n.id === (d.target.id || d.target)) as any)?.x ??
            0
        )
        .attr(
          "y2",
          (d: any) =>
            (nodes.find((n) => n.id === (d.target.id || d.target)) as any)?.y ??
            0
        );

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      text.attr("x", (d: any) => d.x + 6).attr("y", (d: any) => d.y + 3);
    }

    function dragstarted(
      event: d3.D3DragEvent<SVGCircleElement, Node, any>,
      d: Node
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGCircleElement, Node, any>,
      d: Node
    ) {
      d.fx = event.x;
      d.fy = event.y;
      ticked(); 
    }

    function dragended(
      event: d3.D3DragEvent<SVGCircleElement, Node, any>,
      d: Node
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    ticked(); 
  };

  return (
    <div>
      <h1>Graph Viewer</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GraphViewer;
