import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

const MermaidChart = ({ chart }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        primaryColor: "#10b981",
        primaryTextColor: "#fff",
        primaryBorderColor: "#059669",
        lineColor: "#6b7280",
        secondaryColor: "#1f2937",
        tertiaryColor: "#111827",
      },
    });
  }, []);

  useEffect(() => {
    if (containerRef.current && chart) {
      try {
        const id = `mermaid-${Date.now()}`;
        mermaid.render(id, chart).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        });
      } catch (error) {
        console.error("Failed to render mermaid chart:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-destructive text-sm p-4">Failed to render chart</div>`;
        }
      }
    }
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-auto flex items-center justify-center p-4"
    />
  );
};

export default MermaidChart;
