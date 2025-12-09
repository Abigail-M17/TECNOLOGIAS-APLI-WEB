import React, { useRef, useEffect } from 'react';

const GraphArea = ({
  functions,
  scale,
  setScale,
  offsetX,
  setOffsetX,
  offsetY,
  setOffsetY,
  showGridLabels,
  setShowGridLabels,
}) => {
  const canvasRef = useRef(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const step = scale;
    for (let x = -offsetX % step; x < canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = -offsetY % step; y < canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvas.width, offsetY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, canvas.height); ctx.stroke();

    // Labels
    if (showGridLabels) {
      ctx.font = '10px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = -50; i <= 50; i++) if (i !== 0) {
        const x = offsetX + i * step;
        if (x > 20 && x < canvas.width - 20) ctx.fillText(i, x, offsetY + 5);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = -50; i <= 50; i++) if (i !== 0) {
        const y = offsetY - i * step;
        if (y > 20 && y < canvas.height - 20) ctx.fillText(i, offsetX - 8, y);
      }
    }

    // Functions
    const THRESHOLD = 50;
    functions.forEach(f => {
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let first = true;
      let prevPy = null;

      for (let px = 0; px < canvas.width; px++) {
        const x = (px - offsetX) / scale;
        let y;
        try {
          y = evaluate(f.expr, x);
          if (!isFinite(y)) { first = true; continue; }
        } catch { first = true; continue; }

        const py = offsetY - y * scale;
        if (prevPy !== null && Math.abs(py - prevPy) > THRESHOLD) first = true;
        if (py < 0 || py > canvas.height) { first = true; prevPy = py; continue; }

        if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
        prevPy = py;
      }
      ctx.stroke();
    });
  };

  const evaluate = (expr, x) => {
    const safe = expr
      .replace(/pi/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/\^/g, '**')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log(');
    return new Function('x', `return ${safe};`)(x);
  };

  // Resize + inicialización
  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      if (offsetX === 0 && offsetY === 0) {
        setOffsetX(canvas.width / 2);
        setOffsetY(canvas.height / 2);
      }
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Redibujar cuando cambie algo
  useEffect(() => { draw(); }, [functions, scale, offsetX, offsetY, showGridLabels]);

  // Drag
  useEffect(() => {
    const canvas = canvasRef.current;
    let dragging = false;
    let startX, startY;

    const down = (e) => { dragging = true; startX = e.clientX - offsetX; startY = e.clientY - offsetY; };
    const move = (e) => { if (dragging) { setOffsetX(e.clientX - startX); setOffsetY(e.clientY - startY); } };
    const up = () => dragging = false;

    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);
    canvas.addEventListener('mouseleave', up);
    return () => {
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mouseleave', up);
    };
  }, [offsetX, offsetY]);

  // Zoom con rueda
  useEffect(() => {
    const canvas = canvasRef.current;
    const wheel = (e) => {
      e.preventDefault();
      const zoom = e.deltaY > 0 ? 0.8 : 1.25;
      const mx = e.offsetX;
      const my = e.offsetY;
      const wx = (mx - offsetX) / scale;
      const wy = (offsetY - my) / scale;
      setScale(s => s * zoom);
      setOffsetX(mx - wx * scale * zoom);
      setOffsetY(my + wy * scale * zoom);
    };
    canvas.addEventListener('wheel', wheel);
    return () => canvas.removeEventListener('wheel', wheel);
  }, [scale, offsetX, offsetY]);

  const zoomIn = () => setScale(s => s * 1.3);
  const zoomOut = () => setScale(s => s / 1.3);
  const reset = () => {
    setScale(40);
    setOffsetX(canvasRef.current.width / 2);
    setOffsetY(canvasRef.current.height / 2);
  };

  return (
    <div className="graph-area">
      <div className="toolbar">
        <button onClick={zoomIn}>Zoom +</button>
        <button onClick={zoomOut}>Zoom −</button>
        <button onClick={reset}>Reset</button>
        <button onClick={() => setShowGridLabels(v => !v)} className={showGridLabels ? 'toggle-btn active' : 'toggle-btn'}>
          Números
        </button>
      </div>
      <canvas ref={canvasRef} id="graph-canvas" />
    </div>
  );
};

export default GraphArea;