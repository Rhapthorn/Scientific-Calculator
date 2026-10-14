// src/renderer/src/App.tsx
import {useState, useCallback, useEffect, useMemo} from 'react'
import * as math from 'mathjs'

declare global {
  interface Window {
    api: {
      minimizeApp: () => void
      closeApp: (action: 'hide' | 'quit') => void
    }
  }
}

interface AppSettings {
  angle: 'deg' | 'rad'
  precision: 'auto' | 2 | 4 | 8
  theme: 'slate' | 'neon' | 'monochrome'
  sound: boolean
  onClose: 'hide' | 'quit'
}

const DEFAULT_SETTINGS: AppSettings = {
  angle: 'deg',
  precision: 'auto',
  theme: 'slate',
  sound: true,
  onClose: 'hide'
}

export default function App() {
  const [expression, setExpression] = useState<string>('')
  const [result, setResult] = useState<string>('0')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('calc-settings')
    return saved ? {...DEFAULT_SETTINGS, ...JSON.parse(saved)} : DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('calc-settings', JSON.stringify(settings))
  }, [settings])

  const playClick = useCallback(() => {
    if (!settings.sound) return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02)

      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.02)
    } catch (e) {
      // AudioContext fails if no user interaction has occurred
    }
  }, [settings.sound])

  const handleInput = useCallback((val: string): void => {
    playClick()
    setExpression((prev) => prev + val)
  }, [playClick])

  const clear = useCallback((): void => {
    playClick()
    setExpression('')
    setResult('0')
  }, [playClick])

  const deleteLast = useCallback((): void => {
    playClick()
    setExpression((prev) => prev.slice(0, -1))
  }, [playClick])

  const mathScope = useMemo(() => {
    const isDeg = settings.angle === 'deg'
    return {
      sin: (x: number) => isDeg ? math.sin(math.unit(x, 'deg')) : math.sin(x),
      cos: (x: number) => isDeg ? math.cos(math.unit(x, 'deg')) : math.cos(x),
      tan: (x: number) => isDeg ? math.tan(math.unit(x, 'deg')) : math.tan(x),
      asin: (x: number) => isDeg ? ((math.asin(x) as number) * 180 / Math.PI) : math.asin(x),
      acos: (x: number) => isDeg ? ((math.acos(x) as number) * 180 / Math.PI) : math.acos(x),
      atan: (x: number) => isDeg ? ((math.atan(x) as number) * 180 / Math.PI) : math.atan(x),
    }
  }, [settings.angle])

  const formatResult = useCallback((value: any) => {
    if (settings.precision === 'auto') {
      return math.format(value, {precision: 12})
    }
    return math.format(value, {notation: 'fixed', precision: settings.precision as number})
  }, [settings.precision])

  const calculate = useCallback((): void => {
    playClick()
    try {
      if (!expression) {
        setResult('0')
        return
      }
      const evaluated = math.evaluate(expression, mathScope)
      setResult(String(formatResult(evaluated)))
    } catch {
      setResult('Error')
    }
  }, [expression, mathScope, formatResult, playClick])

  const handlePercentage = useCallback((): void => {
    playClick()
    if (!expression) return
    try {
      const match = expression.match(/^(.*?)([\+\-\*\/])([0-9.]+)$/)
      let finalValue = 0

      if (match) {
        const baseExpr = match[1] || '0'
        const operator = match[2]
        const operand = parseFloat(match[3])
        const baseVal = math.evaluate(baseExpr, mathScope)
        let evalString = ''

        if (operator === '+' || operator === '-') {
          const percVal = baseVal * (operand / 100)
          evalString = `${baseExpr}${operator}${percVal}`
        } else {
          const percVal = operand / 100
          evalString = `${baseExpr}${operator}${percVal}`
        }
        finalValue = math.evaluate(evalString, mathScope)
      } else {
        finalValue = math.evaluate(expression, mathScope) / 100
      }

      const formatted = String(formatResult(finalValue))
      setExpression(formatted)
      setResult(formatted)
    } catch {
      setResult('Error')
    }
  }, [expression, mathScope, formatResult, playClick])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey || isSettingsOpen) return
      const key = e.key

      if (/^[0-9.]$/.test(key)) handleInput(key)
      else if (['+', '-', '*', '/', '^', '(', ')'].includes(key)) handleInput(key)
      else if (key === '%') {
        e.preventDefault();
        handlePercentage()
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate()
      } else if (key === 'Backspace') deleteLast()
      else if (key === 'Escape') clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleInput, calculate, handlePercentage, deleteLast, clear, isSettingsOpen])

  const handleMinimize = () => window.api.minimizeApp()
  // Phase 2: Send the specific user preference to the OS
  const handleClose = () => window.api.closeApp(settings.onClose)

  const themeClasses = `theme-${settings.theme}`

  return (
    <div className={`app-wrapper ${themeClasses}`}>
      <style>{`
        .theme-slate {
          --bg-display: rgba(48, 52, 70, 0.65);
          --text-main: #ffffff;
          --text-muted: #838ba7;
          --btn-num: rgba(65, 69, 89, 0.7);
          --btn-num-hover: rgba(81, 87, 109, 0.9);
          --btn-func: rgba(81, 87, 109, 0.7);
          --btn-operator: rgba(140, 170, 238, 0.9);
          --btn-danger: rgba(234, 153, 156, 0.9);
          --btn-primary: rgba(166, 209, 137, 0.9);
          --settings-bg: rgba(35, 38, 52, 0.95);
          --result-text: #ffffff;
        }

        .theme-neon {
          --bg-display: rgba(9, 10, 15, 0.8);
          --text-main: #ffffff;
          --text-muted: #00e5e5;
          --btn-num: rgba(20, 22, 30, 0.8);
          --btn-num-hover: rgba(30, 35, 50, 1);
          --btn-func: rgba(30, 20, 40, 0.8);
          --btn-operator: rgba(255, 0, 255, 0.7);
          --btn-danger: rgba(255, 50, 50, 0.8);
          --btn-primary: rgba(0, 255, 255, 0.8);
          --settings-bg: rgba(10, 10, 15, 0.95);
          --result-text: #ffffff;
        }

        .theme-monochrome {
          --bg-display: rgba(230, 230, 230, 0.65);
          --text-main: #111111;
          --text-muted: #555555;
          --btn-num: rgba(200, 200, 200, 0.7);
          --btn-num-hover: rgba(180, 180, 180, 0.9);
          --btn-func: rgba(180, 180, 180, 0.7);
          --btn-operator: rgba(150, 150, 150, 0.9);
          --btn-danger: rgba(100, 100, 100, 0.9);
          --btn-primary: rgba(50, 50, 50, 0.9);
          --settings-bg: rgba(240, 240, 240, 0.95);
          --result-text: #111111;
        }

        body {
          margin: 0;
          background-color: transparent;
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          user-select: none;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box;
        }

        .app-wrapper {
          height: 100vh;
          width: 100vw;
          position: relative;
          color: var(--text-main);
        }

        .titlebar {
          height: 32px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          -webkit-app-region: drag;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
        }

        .gear-btn {
          -webkit-app-region: no-drag;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          margin-left: 10px;
          display: flex;
          align-items: center;
          transition: color 0.2s ease, transform 0.3s ease;
        }
        .gear-btn:hover { color: var(--text-main); transform: rotate(45deg); }
        /* Explicit Red Hover Override for Mono Theme */
        .theme-monochrome .gear-btn:hover { color: #e81123; }

        .window-controls { display: flex; -webkit-app-region: no-drag; }
        .win-btn {
          width: 46px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: var(--text-main); cursor: pointer;
        }
        .win-btn:hover { background-color: rgba(128, 128, 128, 0.2); }
        .win-btn.close:hover { background-color: #e81123; color: white; border-top-right-radius: 11px; }

        .calculator-container {
          display: flex; flex-direction: column; height: 100vh;
          padding: 0.75rem; padding-top: 2.5rem; box-sizing: border-box;
        }

        .display {
          background-color: var(--bg-display); border-radius: 10px; padding: 1rem;
          margin-bottom: 0.75rem; display: flex; flex-direction: column; align-items: flex-end;
          backdrop-filter: blur(8px);
          color: var(--text-main);
        }
        .expression { color: var(--text-muted); font-size: 1rem; min-height: 1.2rem; }

        .result {
          font-size: 2.25rem;
          font-weight: 600;
          width: 100%;
          text-align: right;
          color: var(--result-text);
        }

        .keypad {
          display: grid; gap: 0.35rem; flex-grow: 1; -webkit-app-region: no-drag;
          grid-template-columns: repeat(5, 1fr);
          grid-template-areas:
            "sin  cos  tan  pi     ac"
            "asin acos atan e      del"
            "pow  sqrt log  oparen cparen"
            "n7   n8   n9   div    mod"
            "n4   n5   n6   mul    fact"
            "n1   n2   n3   sub    eq"
            "n0   n0   dot  add    eq";
        }

        .btn {
          border: none; border-radius: 6px; font-size: 1rem; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: var(--text-main); backdrop-filter: blur(4px); transition: transform 0.05s ease;
        }
        .btn:active { transform: scale(0.92); }
        .num { background-color: var(--btn-num); }
        .func { background-color: var(--btn-func); }
        .operator { background-color: var(--btn-operator); color: #111; font-weight: 700; }
        .danger { background-color: var(--btn-danger); color: #111; font-weight: 700; }
        .primary { background-color: var(--btn-primary); color: #111; font-weight: 700; }

        .settings-overlay {
          position: absolute; top: 32px; left: 0; right: 0; bottom: 0;
          background-color: var(--settings-bg); backdrop-filter: blur(12px);
          z-index: 50; display: flex; flex-direction: column; padding: 1.5rem;
          transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
        }
        .settings-overlay.open { transform: translateY(0); }

        .settings-header { font-size: 1.2rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--text-main); }
        .setting-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .setting-label { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .setting-controls { display: flex; gap: 0.5rem; }

        .toggle-btn {
          flex: 1; padding: 0.5rem; background: var(--btn-num); border: 1px solid transparent;
          color: var(--text-main); border-radius: 6px; cursor: pointer; font-size: 0.9rem;
        }
        .toggle-btn.active { background: var(--btn-func); border-color: var(--btn-operator); color: var(--btn-primary); font-weight: 600; }
      `}</style>

      <div className="titlebar">
        <button className="gear-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <div className="window-controls">
          <button className="win-btn" onClick={handleMinimize}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor">
              <path d="M1 5.5H10"/>
            </svg>
          </button>
          <button className="win-btn close" onClick={handleClose}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor">
              <path d="M1 1L10 10M10 1L1 10"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={`settings-overlay ${isSettingsOpen ? 'open' : ''}`}>
        <div className="settings-header">Preferences</div>

        <div className="setting-group">
          <span className="setting-label">Angle Unit</span>
          <div className="setting-controls">
            <button className={`toggle-btn ${settings.angle === 'deg' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, angle: 'deg'})}>Degrees
            </button>
            <button className={`toggle-btn ${settings.angle === 'rad' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, angle: 'rad'})}>Radians
            </button>
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">Decimals</span>
          <div className="setting-controls">
            <button className={`toggle-btn ${settings.precision === 'auto' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, precision: 'auto'})}>Auto
            </button>
            <button className={`toggle-btn ${settings.precision === 2 ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, precision: 2})}>2
            </button>
            <button className={`toggle-btn ${settings.precision === 4 ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, precision: 4})}>4
            </button>
            <button className={`toggle-btn ${settings.precision === 8 ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, precision: 8})}>8
            </button>
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">Theme</span>
          <div className="setting-controls">
            <button className={`toggle-btn ${settings.theme === 'slate' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, theme: 'slate'})}>Slate
            </button>
            <button className={`toggle-btn ${settings.theme === 'neon' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, theme: 'neon'})}>Neon
            </button>
            <button className={`toggle-btn ${settings.theme === 'monochrome' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, theme: 'monochrome'})}>Mono
            </button>
          </div>
        </div>

        <div className="setting-group">
          <span className="setting-label">System</span>
          <div className="setting-controls">
            <button className={`toggle-btn ${settings.sound ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, sound: !settings.sound})}>Key Audio
            </button>
            <button className={`toggle-btn ${settings.onClose === 'quit' ? 'active' : ''}`}
                    onClick={() => setSettings({...settings, onClose: settings.onClose === 'hide' ? 'quit' : 'hide'})}>
              {settings.onClose === 'hide' ? 'Tray Mode' : 'Quit on X'}
            </button>
          </div>
        </div>
      </div>

      <div className="calculator-container" onClick={() => isSettingsOpen && setIsSettingsOpen(false)}>
        <div className="display">
          <div className="expression">{expression || '\u00A0'}</div>
          <div className="result">{result}</div>
        </div>
        <div className="keypad">
          <button onClick={() => handleInput('sin(')} className="btn func" style={{gridArea: 'sin'}}>sin</button>
          <button onClick={() => handleInput('cos(')} className="btn func" style={{gridArea: 'cos'}}>cos</button>
          <button onClick={() => handleInput('tan(')} className="btn func" style={{gridArea: 'tan'}}>tan</button>
          <button onClick={() => handleInput('pi')} className="btn func" style={{gridArea: 'pi'}}>π</button>
          <button onClick={clear} className="btn danger" style={{gridArea: 'ac'}}>AC</button>
          <button onClick={() => handleInput('asin(')} className="btn func" style={{gridArea: 'asin'}}>asin</button>
          <button onClick={() => handleInput('acos(')} className="btn func" style={{gridArea: 'acos'}}>acos</button>
          <button onClick={() => handleInput('atan(')} className="btn func" style={{gridArea: 'atan'}}>atan</button>
          <button onClick={() => handleInput('e')} className="btn func" style={{gridArea: 'e'}}>e</button>
          <button onClick={deleteLast} className="btn danger" style={{gridArea: 'del'}}>DEL</button>
          <button onClick={() => handleInput('^')} className="btn func" style={{gridArea: 'pow'}}>x^y</button>
          <button onClick={() => handleInput('sqrt(')} className="btn func" style={{gridArea: 'sqrt'}}>√</button>
          <button onClick={() => handleInput('log(')} className="btn func" style={{gridArea: 'log'}}>log</button>
          <button onClick={() => handleInput('(')} className="btn operator" style={{gridArea: 'oparen'}}>(</button>
          <button onClick={() => handleInput(')')} className="btn operator" style={{gridArea: 'cparen'}}>)</button>
          <button onClick={() => handleInput('7')} className="btn num" style={{gridArea: 'n7'}}>7</button>
          <button onClick={() => handleInput('8')} className="btn num" style={{gridArea: 'n8'}}>8</button>
          <button onClick={() => handleInput('9')} className="btn num" style={{gridArea: 'n9'}}>9</button>
          <button onClick={() => handleInput('/')} className="btn operator" style={{gridArea: 'div'}}>÷</button>
          <button onClick={handlePercentage} className="btn operator" style={{gridArea: 'mod'}}>%</button>
          <button onClick={() => handleInput('4')} className="btn num" style={{gridArea: 'n4'}}>4</button>
          <button onClick={() => handleInput('5')} className="btn num" style={{gridArea: 'n5'}}>5</button>
          <button onClick={() => handleInput('6')} className="btn num" style={{gridArea: 'n6'}}>6</button>
          <button onClick={() => handleInput('*')} className="btn operator" style={{gridArea: 'mul'}}>×</button>
          <button onClick={() => handleInput('!')} className="btn func" style={{gridArea: 'fact'}}>n!</button>
          <button onClick={() => handleInput('1')} className="btn num" style={{gridArea: 'n1'}}>1</button>
          <button onClick={() => handleInput('2')} className="btn num" style={{gridArea: 'n2'}}>2</button>
          <button onClick={() => handleInput('3')} className="btn num" style={{gridArea: 'n3'}}>3</button>
          <button onClick={() => handleInput('-')} className="btn operator" style={{gridArea: 'sub'}}>−</button>
          <button onClick={calculate} className="btn primary" style={{gridArea: 'eq'}}>=</button>
          <button onClick={() => handleInput('0')} className="btn num" style={{gridArea: 'n0'}}>0</button>
          <button onClick={() => handleInput('.')} className="btn num" style={{gridArea: 'dot'}}>.</button>
          <button onClick={() => handleInput('+')} className="btn operator" style={{gridArea: 'add'}}>+</button>
        </div>
      </div>
    </div>
  )
}
