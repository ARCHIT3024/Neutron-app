
"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Eraser, Palette, Trash2, Pencil, RotateCcw, Check } from 'lucide-react'; // Added Pencil, RotateCcw

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;
const PRESET_DRAW_COLORS = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];


interface CanvasEditorProps {
  initialDataURL?: string;
  backgroundColor?: string; // For canvas editor background, not note card background
  onSave?: (dataUrl: string) => void; // If we want to save from within this component (e.g. auto-save)
  // For now, the dialog will handle saving. We might need a way to get dataURL on demand.
  getCanvasDataRef?: React.MutableRefObject<(() => string | undefined) | undefined>;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ initialDataURL, backgroundColor = '#FFFFFF', getCanvasDataRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(PRESET_DRAW_COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);


  const saveHistory = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, historyStep + 1);
    const currentCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([...newHistory, currentCanvasState]);
    setHistoryStep(newHistory.length);
  }, [history, historyStep]);

  const undo = () => {
    if (historyStep <= 0 || !canvasRef.current) return; // Can't undo initial state
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    if (initialDataURL) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        saveHistory(); // Save initial loaded state
      };
      img.src = initialDataURL;
    } else {
       saveHistory(); // Save initial blank state
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundColor, initialDataURL]); // Only on initial load or if background prop changes

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = currentColor;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [currentColor, lineWidth]);

  const getMousePos = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) { // Touch event
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    // Mouse event
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
  
  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getMousePos(event);
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { x, y } = getMousePos(event);
    if (tool === 'pencil') {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    } else if (tool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out';
      // For eraser, use a larger effective line width to make erasing easier
      contextRef.current.lineWidth = lineWidth * 5; // Eraser is thicker
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      contextRef.current.lineWidth = lineWidth; // Reset for pencil
    }
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    saveHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      saveHistory();
    }
  };

  if (getCanvasDataRef) {
    getCanvasDataRef.current = () => canvasRef.current?.toDataURL('image/png');
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 mb-2 p-2 border rounded-md bg-muted items-center">
        <Button 
          variant={tool === 'pencil' ? 'default' : 'outline'} 
          size="icon" 
          onClick={() => setTool('pencil')}
          aria-label="Pencil Tool"
          aria-pressed={tool === 'pencil'}
          title="Pencil"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant={tool === 'eraser' ? 'default' : 'outline'} 
          size="icon" 
          onClick={() => setTool('eraser')}
          aria-label="Eraser Tool"
          aria-pressed={tool === 'eraser'}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Change draw color" title="Color Picker">
              <Palette className="h-4 w-4" style={{color: tool === 'pencil' ? currentColor : undefined}}/>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {PRESET_DRAW_COLORS.map(color => (
                <Button
                  key={color}
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full p-0 border-2"
                  style={{ backgroundColor: color, borderColor: currentColor === color ? 'hsl(var(--ring))' : 'hsl(var(--border))' }}
                  onClick={() => { setCurrentColor(color); setTool('pencil');}}
                  aria-label={`Set color to ${color}`}
                  aria-pressed={currentColor === color}
                >
                 {currentColor === color && <Check className="h-4 w-4" style={{color: getTextColorForBackground(color)}}/>}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <input 
            type="range" 
            min="1" 
            max="10" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
            className="w-20 h-2 bg-muted-foreground rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label={`Line width: ${lineWidth}`}
            title={`Line Width: ${lineWidth}`}
        />

        <Button variant="outline" size="icon" onClick={undo} disabled={historyStep <= 0} aria-label="Undo last action" title="Undo">
            <RotateCcw className="h-4 w-4" />
        </Button>

        <Button variant="destructive" size="icon" onClick={clearCanvas} aria-label="Clear canvas" title="Clear All">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing} // Stop drawing if mouse leaves canvas
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="border border-input rounded-md cursor-crosshair"
        style={{touchAction: 'none'}} // Prevents page scroll on touch devices while drawing
        aria-label="Drawing canvas"
      />
    </div>
  );
};

// Helper to determine if text color should be light or dark based on background
const getTextColorForBackground = (bgColor?: string): string => {
  if (!bgColor || !bgColor.startsWith('#') || bgColor.length < 7) return 'hsl(var(--foreground))'; 
  try {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5 ? '#000000' : '#FFFFFF';
  } catch (e) {
    return 'hsl(var(--foreground))'; 
  }
};


export default CanvasEditor;

