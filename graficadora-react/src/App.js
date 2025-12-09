import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import GraphArea from './GraphArea';
import VirtualKeyboard from './VirtualKeyboard';
import './style.css';

function App() {
  const [functions, setFunctions] = useState([]);
  const [scale, setScale] = useState(40);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showGridLabels, setShowGridLabels] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  const addFunction = () => {
    const expr = inputValue.trim();
    if (!expr) return;
    const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6'];
    const color = colors[functions.length % colors.length];
    setFunctions([...functions, { expr, color }]);
    setInputValue('');
  };

  const removeFunction = (index) => {
    setFunctions(functions.filter((_, i) => i !== index));
  };

  const insertAtCursor = (text) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newValue = inputValue.substring(0, start) + text + inputValue.substring(end);
    setInputValue(newValue);
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + text.length;
    }, 0);
  };

  const handleBackspace = () => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start === 0 && end === 0) return;
    const newValue = inputValue.substring(0, start - 1) + inputValue.substring(end);
    setInputValue(newValue);
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start - 1;
    }, 0);
  };

  return (
    <div className="container">
      <Sidebar
        functions={functions}
        removeFunction={removeFunction}
        inputRef={inputRef}
        inputValue={inputValue}
        setInputValue={setInputValue}
        addFunction={addFunction}
        toggleKeyboard={() => setShowKeyboard(!showKeyboard)}
      />

      <GraphArea
        functions={functions}
        scale={scale}
        setScale={setScale}
        offsetX={offsetX}
        setOffsetX={setOffsetX}
        offsetY={offsetY}
        setOffsetY={setOffsetY}
        showGridLabels={showGridLabels}
        setShowGridLabels={setShowGridLabels}
      />

      {showKeyboard && (
        <VirtualKeyboard
          addFunction={addFunction}
          insertAtCursor={insertAtCursor}
          handleBackspace={handleBackspace}
          hideKeyboard={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}

export default App;