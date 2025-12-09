import React from 'react';

const VirtualKeyboard = ({ addFunction, insertAtCursor, handleBackspace, hideKeyboard }) => {
  const buttons = [
    { v: 'x' }, { v: 'pi' }, { v: 'e' }, { v: '^' },
    { v: '7' }, { v: '8' }, { v: '9' }, { v: 'Backspace', label: 'Backspace', special: true },
    { v: '^2', label: 'x²' }, { v: 'sqrt(', label: 'Root(' }, { v: 'log(', label: 'log(' }, { v: '(' },
    { v: '4' }, { v: '5' }, { v: '6' }, { v: '*', special: true },
    { v: 'sin(', label: 'sin(' }, { v: 'cos(', label: 'cos(' }, { v: 'tan(', label: 'tan(' }, { v: ')' },
    { v: '1' }, { v: '2' }, { v: '3' }, { v: '-', special: true },
    { v: 'Enter', label: 'GRAFICAR', special: true, span: 3 },
    { v: '.', special: true }, { v: '/', special: true },
    { v: '0', span: 2 }, { v: '+', special: true },
  ];

  const click = (v) => {
    if (v === 'Enter') addFunction();
    else if (v === 'Backspace') handleBackspace();
    else insertAtCursor(v);
  };

  return (
    <div id="virtual-keyboard" className="keyboard">
      <div className="keyboard-header">
        <button onClick={hideKeyboard} className="hide-arrow">Minimizar</button>
      </div>
      <div className="keyboard-grid">
        {buttons.map((b, i) => (
          <button
            key={i}
            className={b.special ? 'special' : ''}
            style={b.span ? { gridColumn: `span ${b.span}` } : {}}
            onClick={() => click(b.v)}
          >
            {b.label || b.v}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;