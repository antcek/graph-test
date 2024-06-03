import React, { useState } from "react";
import Head from "next/head";
import Graph from "react-graph-vis";
import jsonData1 from "../pages/json1.json";
import jsonData2 from "../pages/json2.json";
import jsonData3 from "../pages/json3.json";

interface Node {
  address: string;
  address_name: string;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  balance_delta: number;
}

interface GraphDataType {
  nodes: Node[];
  edges: Edge[];
}

const GraphViewer = () => {
  const [graphData, setGraphData] = useState<GraphDataType>(jsonData1);

  const handleNodeClick = (nodeId) => {
    const clickedNodeId = nodeId.nodes[0];
    if (jsonData2.nodes.some((node: Node) => node.address === clickedNodeId)) {
      console.log(clickedNodeId);
      const newNodes = jsonData2.nodes.filter(
        (node) => !graphData.nodes.find((n) => n.address === node.address)
      );
      const newEdges = jsonData2.edges.filter(
        (edge) =>
          !graphData.edges.find((e) => e.from === edge.from && e.to === edge.to)
      );
      setGraphData({
        nodes: [...graphData.nodes, ...newNodes],
        edges: [...graphData.edges, ...newEdges],
      });
    } else if (jsonData3.nodes.some((node) => node.address === clickedNodeId)) {
      console.log("third");
      const newNodes = jsonData3.nodes.filter(
        (node: Node) => !graphData.nodes.find((n) => n.address === node.address)
      );
      const newEdges = jsonData3.edges.filter(
        (edge) =>
          !graphData.edges.find((e) => e.from === edge.from && e.to === edge.to)
      );
      setGraphData({
        nodes: [...graphData?.nodes, ...newNodes],
        edges: [...graphData?.edges, ...newEdges],
      });
    }
  };

  const graph = {
    nodes: graphData.nodes.map((node) => ({
      id: node.address,
      label: node.address_name,
    })),
    edges: graphData.edges.map((link) => ({
      id: link.id,
      from: link.from,
      to: link.to,
      label: `${link.balance_delta}`,
    })),
  };

  const options = {
    layout: {
      hierarchical: false,
    },
    edges: {
      smooth: true,
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        nodeDistance: 150,
      },
    },
    interaction: {
      dragNodes: true,
    },
  };

  return (
    <div>
      <Head>
        <title>Graph Viewer</title>
      </Head>
      <h1>Graph Viewer</h1>
      {graphData && (
        <Graph
          key={JSON.stringify(graphData)}
          graph={graph}
          options={options}
          events={{ selectNode: handleNodeClick }}
          style={{ height: "600px" }}
        />
      )}
    </div>
  );
};

export default GraphViewer;
