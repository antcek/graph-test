import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import jsonData1 from "../pages/json1.json";
import jsonData2 from "../pages/json2.json";
import jsonData3 from "../pages/json3.json";

interface Node {
  address: string;
  address_name: string;
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

    const nodes = graphData.nodes.map((node) => ({
      id: node.address,
      label: node.address_name,
    }));

    const links = graphData.edges.map((link) => ({
      source: link.from,
      target: link.to,
      label: `${link.balance_delta}`,
    }));

    // Custom layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(parseFloat(d.label)))
      .attr("x1", (d) => (nodes.find((n) => n.id === d.source) as any).x)
      .attr("y1", (d) => (nodes.find((n) => n.id === d.source) as any).y)
      .attr("x2", (d) => (nodes.find((n) => n.id === d.target) as any).x)
      .attr("y2", (d) => (nodes.find((n) => n.id === d.target) as any).y);

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
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .call(
        d3
          .drag<SVGCircleElement, any>()
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
      .attr("x", (d) => d.x + 6)
      .attr("y", (d) => d.y + 3)
      .text((d) => d.label);

    function dragstarted(
      event: d3.D3DragEvent<SVGCircleElement, any, any>,
      d: any
    ) {
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(
      event: d3.D3DragEvent<SVGCircleElement, any, any>,
      d: any
    ) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: d3.D3DragEvent<SVGCircleElement, any, any>,
      d: any
    ) {
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div>
      <h1>Graph Viewer</h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GraphViewer;
