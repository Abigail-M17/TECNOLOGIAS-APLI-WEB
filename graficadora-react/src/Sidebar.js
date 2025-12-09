import React from 'react';

const Sidebar = ({ functions, removeFunction, inputRef, inputValue, setInputValue, addFunction, toggleKeyboard }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addFunction();
  };

  return (
    <div className="sidebar">
      <h2>Funciones</h2>
      <div id="function-list">
        {functions.map((f, i) => (
          <div key={i} className="function-item">
            <span style={{ color: f.color }}>f(x) = {f.expr}</span>
            <button onClick={() => removeFunction(i)}>×</button>
          </div>
        ))}
      </div>

      <div className="input-group">
        <input
          ref={inputRef}
          type="text"
          id="function-input"
          placeholder="Ej: sin(x), x^2, 2*x + 1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>

      <button onClick={toggleKeyboard} className="keyboard-btn">
        Teclado
      </button>
    </div>
  );
};

export default Sidebar;