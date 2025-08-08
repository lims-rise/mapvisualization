"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";

const NetworkGraph = ({ nodes, edges }) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  // State untuk mengontrol mode layout yang aktif
  const [layoutMode, setLayoutMode] = useState("default");

  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;

    // Menambahkan URL gambar ke setiap node
    const updatedNodes = nodes.map((node) => ({
      ...node,
      shape: "image",
      image: node.iconUrl || "/icons/default-icon.png",
      size: 20,
      font: { size: 22, color: "#fff" },
      borderWidth: 2,
    }));

    const updatedEdges = edges.map((edge) => ({
      ...edge,
      length: 300,
    }));

    const data = { nodes: updatedNodes, edges: updatedEdges };

    // Konfigurasi layout berdasarkan mode yang dipilih
    const getLayoutOptions = () => {
      switch (layoutMode) {
        case "hierarchical":
          return {
            layout: {
              hierarchical: {
                enabled: true,
                levelSeparation: 100,
                nodeSpacing: 200,
                direction: "UD", // Arah hierarki: "UD" (top-down) atau "LR" (left-right)
                sortMethod: "directed",
              },
            },
            physics: { enabled: false }, // Matikan physics agar lebih stabil
          };

        case "tree":
          return {
            layout: {
              hierarchical: {
                enabled: true,
                levelSeparation: 120,
                nodeSpacing: 150,
                direction: "DU", // Arah tree dari bawah ke atas
                sortMethod: "hubsize",
              },
            },
            physics: { enabled: false },
          };

        case "force":
          return {
            layout: {},
            physics: { enabled: true, barnesHut: { gravitationalConstant: -3000 } },
          };

        case "circular":
          return {
            layout: { randomSeed: 2 },
            physics: { enabled: false },
          };

          case "grid":
            return {
              layout: {
                hierarchical: false,
                improvedLayout: false, // 🔧 Disable improvedLayout untuk menghindari error
                randomSeed: 42, // 🔥 Tambahkan seed untuk posisi tetap
              },
              physics: { enabled: false },
            };
          

        default:
          return { 
            layout: { 
              improvedLayout: false // 🔧 Disable improvedLayout di default layout juga
            }, 
            physics: { enabled: true } 
          };
      }
    };

    const layoutOptions = getLayoutOptions();

    const options = {
      nodes: {
        size: 20,
        font: { size: 22, color: "#fff" },
        borderWidth: 2,
      },
      edges: {
        width: 1.5,
        color: { color: "#fff", highlight: "#0FB3BA" },
        arrows: "to",
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
      configure: {
        enabled: false, // Disable configuration UI
      },
      ...layoutOptions, // Memasukkan layout & physics dengan benar
      // 🔧 Global setting untuk menghindari improvedLayout error
      layout: {
        ...layoutOptions.layout,
        improvedLayout: false,
      },
    };

    if (!networkRef.current) {
      // Jika networkRef belum ada, buat yang baru
      networkRef.current = new Network(containerRef.current, data, options);
    } else {
      // Jika network sudah ada, update dengan setData & setOptions
      networkRef.current.setData(data);
      networkRef.current.setOptions(options);
    }

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, layoutMode]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Tombol untuk mengganti mode layout */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.7)",
          // padding: "10px",
          borderRadius: "5px",
        }}
      >
        <select
          onChange={(e) => setLayoutMode(e.target.value)}
          value={layoutMode}
          style={{
            background: "#0FB3BA",
            color: "#fff",
            padding: "5px 10px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          <option value="default">Default Mode</option>
          <option value="hierarchical">Hierarchical Mode</option>
          <option value="tree">Tree Mode</option>
          <option value="force">Force-Directed Mode</option>
          <option value="circular">Circular Mode</option>
          <option value="grid">Grid Mode</option>
        </select>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          background: "#212936",
          border: "1px solid #444",
        }}
      />
    </div>
  );
};

export default NetworkGraph;
