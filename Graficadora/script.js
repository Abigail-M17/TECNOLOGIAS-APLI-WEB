// script.js - Graficadora estilo GeoGebra (LÓGICA ESTABLE Y BOTÓN GRAFICAR EN TECLADO)
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
const functionInput = document.getElementById('function-input');
// const addBtn = document.getElementById('add-function'); <-- ELIMINADO
const functionList = document.getElementById('function-list');
const toggleKeyboardBtn = document.getElementById('toggle-keyboard');
const keyboard = document.getElementById('virtual-keyboard');
const hideKeyboardBtn = document.getElementById('hide-keyboard');
const toggleLabelsBtn = document.getElementById('toggle-grid-labels');

let functions = [];
let scale = 40;
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStartX, dragStartY;
let showGridLabels = true;
let initialized = false; 

// === REDIMENSIONAR CANVAS ===
function resizeCanvas() {
  const prevOffsetX = offsetX;
  const prevOffsetY = offsetY;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  if (!initialized) {
    offsetX = canvas.width / 2;
    offsetY = canvas.height / 2;
    initialized = true;
  } else {
    offsetX = canvas.width / 2 + (prevOffsetX - canvas.width / 2);
    offsetY = canvas.height / 2 + (prevOffsetY - canvas.height / 2);
  }

  draw();
}

window.addEventListener('resize', resizeCanvas);

// === DIBUJAR TODO ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawAxes();
  if (showGridLabels) drawGridLabels();
  drawFunctions();
}

function drawGrid() {
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  const step = scale;

  for (let x = -offsetX % step; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = -offsetY % step; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawAxes() {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, offsetY);
  ctx.lineTo(canvas.width, offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(offsetX, 0);
  ctx.lineTo(offsetX, canvas.height);
  ctx.stroke();
}

function drawGridLabels() {
  ctx.font = '10px Arial';
  ctx.fillStyle = '#000';

  const step = scale;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = -50; i <= 50; i++) {
    if (i === 0) continue;
    const x = offsetX + i * step;
    if (x > 20 && x < canvas.width - 20) {
      ctx.fillText(i, x, offsetY + 5);
    }
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = -50; i <= 50; i++) {
    if (i === 0) continue;
    const y = offsetY - i * step;
    if (y > 20 && y < canvas.height - 20) {
      ctx.fillText(i, offsetX - 8, y);
    }
  }
}

// === LÓGICA DE DIBUJO CON MANEJO DE DISCONTINUIDADES ===
function drawFunctions() {
  const DISCONTINUITY_THRESHOLD = 50; 

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
        y = evaluateFunction(f.expr, x);
        if (isNaN(y) || !isFinite(y)) {
          first = true; 
          continue;
        }
      } catch (e) {
        first = true; 
        continue;
      }
      
      const py = offsetY - y * scale;

      // Detectar grandes saltos
      if (prevPy !== null && Math.abs(py - prevPy) > DISCONTINUITY_THRESHOLD) {
        first = true; 
      }

      if (py < 0 || py > canvas.height) {
        first = true; 
        prevPy = py;
        continue; 
      }

      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
      
      prevPy = py;
    }
    ctx.stroke();
  });
}

// === EVALUADOR DE FUNCIONES (LIMPIO) ===
function evaluateFunction(expr, x) {
  let safeExpr = expr
    .replace(/pi/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/\^/g, '**')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log('); 
    
  return new Function('x', `return ${safeExpr};`)(x);
}

// === AÑADIR FUNCIÓN ===
function addFunction() {
  const expr = functionInput.value.trim();
  if (!expr) return;

  const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6'];
  const color = colors[functions.length % colors.length];

  functions.push({ expr, color });
  renderFunctionList();
  functionInput.value = '';
  draw();
}

// === RENDERIZADO DE LISTA (CORRECCIÓN DE EVENTOS MANTENIDA) ===
function renderFunctionList() {
  functionList.innerHTML = '';
  functions.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'function-item';
    div.innerHTML = `
      <span style="color:${f.color}">f(x) = ${f.expr}</span>
      <button data-index="${i}">×</button>
    `;
    
    const removeBtn = div.querySelector('button');
    removeBtn.addEventListener('click', () => removeFunction(i));

    functionList.appendChild(div);
  });
}

function removeFunction(index) {
  functions.splice(index, 1);
  renderFunctionList();
  draw();
}

// === CONTROLES ===
document.getElementById('zoom-in').addEventListener('click', () => {
  scale *= 1.3;
  draw();
});

document.getElementById('zoom-out').addEventListener('click', () => {
  scale /= 1.3;
  draw();
});

document.getElementById('reset-view').addEventListener('click', () => {
  scale = 40;
  offsetX = canvas.width / 2;
  offsetY = canvas.height / 2;
  draw();
});

toggleLabelsBtn.addEventListener('click', () => {
  showGridLabels = !showGridLabels;
  toggleLabelsBtn.classList.toggle('active');
  toggleLabelsBtn.textContent = showGridLabels ? 'Números' : 'Números';
  draw();
});

// Listener para la tecla 'Enter' en el input (mantenido)
functionInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addFunction();
});

// === TECLADO VIRTUAL (ACTUALIZADO para manejar el botón "GRAFICAR") ===
toggleKeyboardBtn.addEventListener('click', () => {
  keyboard.classList.toggle('hidden');
});

hideKeyboardBtn.addEventListener('click', () => {
  keyboard.classList.add('hidden');
});

document.querySelectorAll('#virtual-keyboard button[data-value]').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.getAttribute('data-value');
    
    if (value === 'Enter') {
      addFunction(); // LLAMA A LA FUNCIÓN DE GRAFICAR
    } else if (value === 'Backspace') {
      functionInput.value = functionInput.value.slice(0, -1);
    } else {
      insertAtCursor(functionInput, value);
    }
    functionInput.focus();
  });
});

function insertAtCursor(input, text) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = input.value.substring(0, start) + text + input.value.substring(end);
  input.selectionStart = input.selectionEnd = start + text.length;
}

// === ARRASTRE DEL PLANO ===
canvas.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX - offsetX;
  dragStartY = e.clientY - offsetY;
});

canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    offsetX = e.clientX - dragStartX;
    offsetY = e.clientY - dragStartY;
    draw();
  }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

// === ZOOM CON RUEDA ===
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoom = e.deltaY > 0 ? 0.8 : 1.25;
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const worldXBefore = (mouseX - offsetX) / scale;
  const worldYBefore = (offsetY - mouseY) / scale;

  scale *= zoom;

  const worldXAfter = (mouseX - offsetX) / scale;
  const worldYAfter = (offsetY - mouseY) / scale;

  offsetX += (worldXBefore - worldXAfter) * scale;
  offsetY += (worldYBefore - worldYAfter) * scale;

  draw();
});

// === INICIALIZAR UNA SOLA VEZ ===
if (!initialized) {
  resizeCanvas();
  initialized = true;
}