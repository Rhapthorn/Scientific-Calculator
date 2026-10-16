// src/renderer/src/components/MatrixPanel.tsx
import {useState} from 'react'
import * as math from 'mathjs'

interface MatrixPanelProps {
  colorMode?: 'dark' | 'light'
}

type MatrixData = number[][]

export default function MatrixPanel({colorMode: _colorMode}: MatrixPanelProps) {
  const [size, setSize] = useState<2 | 3>(2)
  const [matrixA, setMatrixA] = useState<MatrixData>([[0, 0], [0, 0]])
  const [matrixB, setMatrixB] = useState<MatrixData>([[0, 0], [0, 0]])
  const [resultMatrix, setResultMatrix] = useState<MatrixData | null>(null)
  const [resultScalar, setResultScalar] = useState<number | null>(null)
  const [error, setError] = useState<string>('')

  const handleSizeChange = (newSize: 2 | 3) => {
    setSize(newSize)
    setMatrixA(Array(newSize).fill(0).map(() => Array(newSize).fill(0)))
    setMatrixB(Array(newSize).fill(0).map(() => Array(newSize).fill(0)))
    setResultMatrix(null)
    setResultScalar(null)
    setError('')
  }

  const clearMatrices = () => {
    setMatrixA(Array(size).fill(0).map(() => Array(size).fill(0)))
    setMatrixB(Array(size).fill(0).map(() => Array(size).fill(0)))
    setResultMatrix(null)
    setResultScalar(null)
    setError('')
  }

  const updateMatrixCell = (matrix: 'A' | 'B', row: number, col: number, value: string) => {
    const numValue = value === '' ? 0 : Number(value)
    if (isNaN(numValue)) return

    if (matrix === 'A') {
      const newA = matrixA.map((r, i) => r.map((c, j) => (i === row && j === col ? numValue : c)))
      setMatrixA(newA)
    } else {
      const newB = matrixB.map((r, i) => r.map((c, j) => (i === row && j === col ? numValue : c)))
      setMatrixB(newB)
    }
  }

  const performOperation = (operation: 'add' | 'subtract' | 'multiply' | 'detA' | 'detB') => {
    setError('')
    setResultMatrix(null)
    setResultScalar(null)

    try {
      if (operation === 'add') {
        setResultMatrix(math.add(matrixA, matrixB) as MatrixData)
      } else if (operation === 'subtract') {
        setResultMatrix(math.subtract(matrixA, matrixB) as MatrixData)
      } else if (operation === 'multiply') {
        setResultMatrix(math.multiply(matrixA, matrixB) as MatrixData)
      } else if (operation === 'detA') {
        setResultScalar(math.det(matrixA))
      } else if (operation === 'detB') {
        setResultScalar(math.det(matrixB))
      }
    } catch (err) {
      setError('Invalid matrix operation')
    }
  }

  const renderInputGrid = (matrix: MatrixData, name: 'A' | 'B') => (
    <div className="matrix-block">
      <div className="matrix-title">Matrix {name}</div>
      <div className="matrix-grid" style={{gridTemplateColumns: `repeat(${size}, 1fr)`}}>
        {matrix.map((row, i) =>
          row.map((val, j) => (
            <input
              key={`${name}-${i}-${j}`}
              type="text"
              value={val === 0 ? '' : val}
              placeholder="0"
              onChange={(e) => updateMatrixCell(name, i, j, e.target.value)}
              className="matrix-cell"
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="matrix-panel-container">
      <style>{`
        .matrix-panel-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          padding: 1rem;
          box-sizing: border-box;
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-y: auto;
        }

        .matrix-panel-container::-webkit-scrollbar { width: 6px; }
        .matrix-panel-container::-webkit-scrollbar-track { background: transparent; }
        .matrix-panel-container::-webkit-scrollbar-thumb { background: var(--btn-func); border-radius: 6px; }

        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .matrix-title-main {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--btn-primary);
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .size-toggles {
          display: flex;
          gap: 0.5rem;
        }

        .size-btn {
          background: var(--btn-num);
          border: 1px solid transparent;
          color: var(--text-main);
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .size-btn.active {
          background: var(--btn-func);
          border-color: var(--btn-operator);
          color: var(--btn-primary);
        }

        .clear-btn {
          background: rgba(234, 153, 156, 0.15);
          border: 1px solid rgba(234, 153, 156, 0.4);
          color: var(--btn-danger);
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: var(--btn-danger);
          color: #111;
        }

        .matrices-input-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }

        .matrix-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .matrix-title {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .matrix-grid {
          display: grid;
          gap: 0.3rem;
          background: var(--bg-display);
          padding: 0.5rem;
          border-radius: 8px;
          border-left: 2px solid var(--text-muted);
          border-right: 2px solid var(--text-muted);
        }

        .matrix-cell {
          width: 40px;
          height: 40px;
          background: var(--btn-num);
          border: 1px solid transparent;
          border-radius: 4px;
          color: var(--text-main);
          text-align: center;
          font-size: 1rem;
          font-family: 'JetBrains Mono', monospace;
          transition: border-color 0.2s;
        }

        .matrix-cell:focus {
          outline: none;
          border-color: var(--btn-primary);
          background: var(--btn-num-hover);
        }

        .matrix-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .op-btn {
          background: var(--btn-func);
          border: none;
          color: var(--text-main);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.05s ease;
        }

        .op-btn:active { transform: scale(0.95); }
        .op-btn:hover { background: var(--btn-operator); color: #111; }

        .matrix-result-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          min-height: 120px;
        }

        .result-label {
          font-size: 0.9rem;
          color: var(--btn-primary);
          margin-bottom: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .scalar-result {
          font-size: 2rem;
          font-weight: 700;
          color: var(--result-text);
        }

        .error-text {
          color: var(--btn-danger);
          font-weight: 600;
        }
      `}</style>

      <div className="matrix-header">
        <div className="matrix-title-main">Matrix Operations</div>
        <div className="header-controls">
          <div className="size-toggles">
            <button className={`size-btn ${size === 2 ? 'active' : ''}`} onClick={() => handleSizeChange(2)}>2x2
            </button>
            <button className={`size-btn ${size === 3 ? 'active' : ''}`} onClick={() => handleSizeChange(3)}>3x3
            </button>
          </div>
          <button className="clear-btn" onClick={clearMatrices}>Clear</button>
        </div>
      </div>

      <div className="matrices-input-row">
        {renderInputGrid(matrixA, 'A')}
        {renderInputGrid(matrixB, 'B')}
      </div>

      <div className="matrix-controls">
        <button className="op-btn" onClick={() => performOperation('add')}>A + B</button>
        <button className="op-btn" onClick={() => performOperation('subtract')}>A − B</button>
        <button className="op-btn" onClick={() => performOperation('multiply')}>A × B</button>
        <button className="op-btn" onClick={() => performOperation('detA')}>Det(A)</button>
        <button className="op-btn" onClick={() => performOperation('detB')}>Det(B)</button>
      </div>

      <div className="matrix-result-area">
        {error && <div className="error-text">{error}</div>}

        {resultScalar !== null && (
          <>
            <div className="result-label">Determinant</div>
            <div className="scalar-result">{math.round(resultScalar, 6)}</div>
          </>
        )}

        {resultMatrix !== null && (
          <>
            <div className="result-label">Result Matrix</div>
            <div className="matrix-grid" style={{gridTemplateColumns: `repeat(${size}, 1fr)`}}>
              {resultMatrix.map((row, i) =>
                row.map((val, j) => (
                  <div key={`res-${i}-${j}`} className="matrix-cell" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent'
                  }}>
                    {math.round(val, 4)}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
