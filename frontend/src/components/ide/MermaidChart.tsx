import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MermaidChartProps {
  chart: string;
}

/**
 * Sanitizes Mermaid chart syntax to fix unquoted Arabic text and special characters.
 * Mermaid requires node labels with special characters or Arabic text to be wrapped in double quotes.
 */
function sanitizeMermaidChart(chart: string): string {
  if (!chart) return chart;

  let sanitized = chart;

  // Helper function to check if text contains Arabic or special characters
  const needsQuoting = (text: string): boolean => {
    // Check for Arabic characters (Unicode ranges)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    // Check for special characters that need quoting
    const specialCharsRegex = /[+\-*/()=<>،.]/;
    return arabicRegex.test(text) || specialCharsRegex.test(text);
  };

  // Fix curly brace decision nodes first: NodeID{unquoted text} -> NodeID{"quoted text"}
  // This pattern matches: nodeId{text} where text is not already quoted
  // Using a more permissive pattern that handles any content between braces
  sanitized = sanitized.replace(
    /([A-Za-z0-9_-]+)\{([^}]+)\}/g,
    (match, nodeId, text) => {
      // Skip if already quoted (check the raw text, not trimmed, to catch edge cases)
      const rawText = text;
      const trimmed = text.trim();
      
      // Check if already quoted (with or without whitespace)
      if ((rawText.match(/^\s*["']/) && rawText.match(/["']\s*$/)) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return match;
      }
      
      // Only quote if it contains Arabic or special characters
      if (needsQuoting(trimmed)) {
        const escapedText = trimmed.replace(/"/g, '\\"');
        return `${nodeId}{"${escapedText}"}`;
      }
      return match;
    }
  );

  // Fix square bracket nodes: NodeID[unquoted text] -> NodeID["quoted text"]
  sanitized = sanitized.replace(
    /([A-Za-z0-9_-]+)\[([^\]]+)\]/g,
    (match, nodeId, text) => {
      // Skip if already quoted
      const rawText = text;
      const trimmed = text.trim();
      
      // Check if already quoted (with or without whitespace)
      if ((rawText.match(/^\s*["']/) && rawText.match(/["']\s*$/)) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return match;
      }
      
      // Only quote if it contains Arabic or special characters
      if (needsQuoting(trimmed)) {
        const escapedText = trimmed.replace(/"/g, '\\"');
        return `${nodeId}["${escapedText}"]`;
      }
      return match;
    }
  );

  return sanitized;
}

const MermaidChart = ({ chart }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPan, setInitialPan] = useState({ x: 0, y: 0 });

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
        // Sanitize the chart to fix unquoted Arabic text and special characters
        const sanitizedChart = sanitizeMermaidChart(chart);
        
        // Log for debugging (remove in production if needed)
        if (sanitizedChart !== chart) {
          console.log("🔧 Mermaid chart sanitized:", {
            original: chart.substring(0, 100),
            sanitized: sanitizedChart.substring(0, 100)
          });
        }
        
        const id = `mermaid-${Date.now()}`;
        mermaid.render(id, sanitizedChart).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            // Find the SVG element after rendering
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
              svgRef.current = svgElement as SVGSVGElement;
              
              // Increase SVG size for better readability
              const currentWidth = svgElement.getAttribute('width');
              const currentHeight = svgElement.getAttribute('height');
              
              // If SVG has fixed dimensions, scale them up
              if (currentWidth && currentHeight) {
                const widthNum = parseFloat(currentWidth);
                const heightNum = parseFloat(currentHeight);
                
                // Scale up by 2x for better readability
                svgElement.setAttribute('width', (widthNum * 2).toString());
                svgElement.setAttribute('height', (heightNum * 2).toString());
                svgElement.style.width = 'auto';
                svgElement.style.height = 'auto';
                svgElement.style.maxWidth = 'none';
                svgElement.style.maxHeight = 'none';
              } else {
                // If no fixed dimensions, set a minimum size
                svgElement.style.minWidth = '800px';
                svgElement.style.minHeight = '600px';
              }
              
              // Make text more readable
              const textElements = svgElement.querySelectorAll('text');
              textElements.forEach((text) => {
                const currentFontSize = text.getAttribute('font-size');
                if (currentFontSize) {
                  const fontSize = parseFloat(currentFontSize);
                  if (fontSize < 16) {
                    text.setAttribute('font-size', Math.max(16, fontSize * 1.5).toString());
                  }
                } else {
                  text.setAttribute('font-size', '16');
                }
              });
              
              // Reset zoom and pan when chart changes
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }
          }
        }).catch((error) => {
          console.error("❌ Failed to render mermaid chart:", error);
          console.error("Chart content:", sanitizedChart);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-destructive text-sm p-4">Failed to render chart. Please check the syntax.</div>`;
          }
        });
      } catch (error) {
        console.error("❌ Failed to process mermaid chart:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-destructive text-sm p-4">Failed to render chart. Please check the syntax.</div>`;
        }
      }
    }
  }, [chart]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta)); // Increased max zoom to 500%
    setZoom(newZoom);
  }, [zoom]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPan(pan);
    }
  }, [pan]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPan({
        x: initialPan.x + deltaX,
        y: initialPan.y + deltaY,
      });
    }
  }, [isDragging, dragStart, initialPan]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Zoom in/out buttons
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(5, prev + 0.2)); // Increased max zoom to 500%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className="w-full h-full relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="h-8 w-8"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MermaidChart;
