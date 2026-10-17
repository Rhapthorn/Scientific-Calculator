// src/renderer/src/components/ConversionsPanel.tsx
import {useState} from 'react'

interface ConversionsPanelProps {
  colorMode?: 'dark' | 'light'
}

export default function ConversionsPanel({colorMode: _colorMode}: ConversionsPanelProps) {
  // --- Data Storage State ---
  const [bytes, setBytes] = useState<string>('1073741824') // Default 1 GB

  const handleStorageChange = (val: string, unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB') => {
    const num = Number(val)
    if (isNaN(num)) {
      setBytes('0')
      return
    }

    let byteVal = 0
    switch (unit) {
      case 'B':
        byteVal = num;
        break
      case 'KB':
        byteVal = num * 1024;
        break
      case 'MB':
        byteVal = num * Math.pow(1024, 2);
        break
      case 'GB':
        byteVal = num * Math.pow(1024, 3);
        break
      case 'TB':
        byteVal = num * Math.pow(1024, 4);
        break
    }
    setBytes(byteVal.toString())
  }

  const formatStorage = (unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB') => {
    const num = Number(bytes)
    if (isNaN(num) || num === 0) return ''

    switch (unit) {
      case 'B':
        return num.toString()
      case 'KB':
        return parseFloat((num / 1024).toFixed(4)).toString()
      case 'MB':
        return parseFloat((num / Math.pow(1024, 2)).toFixed(4)).toString()
      case 'GB':
        return parseFloat((num / Math.pow(1024, 3)).toFixed(4)).toString()
      case 'TB':
        return parseFloat((num / Math.pow(1024, 4)).toFixed(4)).toString()
    }
  }

  // --- Web Colors State ---
  const [hex, setHex] = useState<string>('#A6D189')
  const [rgb, setRgb] = useState<string>('166, 209, 137')

  const handleHexChange = (val: string) => {
    setHex(val)
    const cleanHex = val.replace('#', '')
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16)
      const g = parseInt(cleanHex.substring(2, 4), 16)
      const b = parseInt(cleanHex.substring(4, 6), 16)
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        setRgb(`${r}, ${g}, ${b}`)
      }
    }
  }

  const handleRgbChange = (val: string) => {
    setRgb(val)
    const parts = val.split(',').map(p => parseInt(p.trim()))
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      const hexStr = '#' + parts.map(p => p.toString(16).padStart(2, '0')).join('').toUpperCase()
      setHex(hexStr)
    }
  }

  // --- Networking State ---
  const [cidr, setCidr] = useState<string>('24')

  const getSubnetInfo = (cidrVal: string) => {
    const num = parseInt(cidrVal)
    if (isNaN(num) || num < 0 || num > 32) return {mask: 'Invalid', hosts: 0}

    let mask = ''
    let remaining = num
    for (let i = 0; i < 4; i++) {
      if (remaining >= 8) {
        mask += '255'
        remaining -= 8
      } else {
        mask += (256 - Math.pow(2, 8 - remaining)).toString()
        remaining = 0
      }
      if (i < 3) mask += '.'
    }

    // Calculate usable hosts (subtracting network and broadcast addresses)
    const hosts = num === 32 ? 1 : num === 31 ? 2 : Math.pow(2, 32 - num) - 2
    return {mask, hosts: hosts < 0 ? 0 : hosts}
  }

  const subnetInfo = getSubnetInfo(cidr)

  return (
    <div className="conversions-panel">
      <style>{`
        .conversions-panel {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          padding: 1rem;
          box-sizing: border-box;
          color: var(--text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-y: auto;
          gap: 1.5rem;
        }

        .conversions-panel::-webkit-scrollbar { width: 6px; }
        .conversions-panel::-webkit-scrollbar-track { background: transparent; }
        .conversions-panel::-webkit-scrollbar-thumb { background: var(--btn-func); border-radius: 6px; }

        .conv-section {
          background: var(--bg-display);
          padding: 1rem;
          border-radius: 8px;
          border-left: 3px solid var(--btn-primary);
        }

        .conv-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--btn-primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-group {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .input-label {
          width: 45px;
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .conv-input {
          flex: 1;
          background: var(--btn-num);
          border: 1px solid transparent;
          border-radius: 6px;
          color: var(--text-main);
          padding: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .conv-input:focus {
          outline: none;
          border-color: var(--btn-primary);
          background: var(--btn-num-hover);
        }

        .color-preview {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--text-muted);
          flex-shrink: 0;
        }

        .subnet-results {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
        }

        .subnet-row {
          display: flex;
          justify-content: space-between;
        }

        .subnet-value {
          color: var(--result-text);
          font-weight: 600;
        }
      `}</style>

      {/* Networking Block */}
      <div className="conv-section">
        <div className="conv-title">IPv4 Subnet (CIDR)</div>
        <div className="input-group">
          <span className="input-label">CIDR</span>
          <span style={{color: 'var(--text-muted)', marginRight: '-0.5rem'}}>/</span>
          <input type="number" min="0" max="32" className="conv-input" value={cidr}
                 onChange={(e) => setCidr(e.target.value)} placeholder="24"/>
        </div>
        <div className="subnet-results">
          <div className="subnet-row">
            <span className="input-label" style={{width: 'auto'}}>Subnet Mask</span>
            <span className="subnet-value">{subnetInfo.mask}</span>
          </div>
          <div className="subnet-row">
            <span className="input-label" style={{width: 'auto'}}>Usable Hosts</span>
            <span className="subnet-value">{subnetInfo.hosts.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Web Colors Block */}
      <div className="conv-section" style={{borderLeftColor: 'var(--btn-operator)'}}>
        <div className="conv-title" style={{color: 'var(--btn-operator)'}}>Web Colors</div>
        <div className="input-group">
          <span className="input-label">HEX</span>
          <input type="text" className="conv-input" value={hex} onChange={(e) => handleHexChange(e.target.value)}
                 placeholder="#A6D189"/>
          <div className="color-preview" style={{backgroundColor: hex}}></div>
        </div>
        <div className="input-group">
          <span className="input-label">RGB</span>
          <input type="text" className="conv-input" value={rgb} onChange={(e) => handleRgbChange(e.target.value)}
                 placeholder="166, 209, 137"/>
        </div>
      </div>

      {/* Data Storage Block */}
      <div className="conv-section" style={{borderLeftColor: 'var(--btn-danger)'}}>
        <div className="conv-title" style={{color: 'var(--btn-danger)'}}>Data Storage (Base 1024)</div>
        <div className="input-group">
          <span className="input-label">MB</span>
          <input type="text" className="conv-input" value={formatStorage('MB')}
                 onChange={(e) => handleStorageChange(e.target.value, 'MB')} placeholder="0"/>
        </div>
        <div className="input-group">
          <span className="input-label">GB</span>
          <input type="text" className="conv-input" value={formatStorage('GB')}
                 onChange={(e) => handleStorageChange(e.target.value, 'GB')} placeholder="0"/>
        </div>
        <div className="input-group">
          <span className="input-label">TB</span>
          <input type="text" className="conv-input" value={formatStorage('TB')}
                 onChange={(e) => handleStorageChange(e.target.value, 'TB')} placeholder="0"/>
        </div>
      </div>

    </div>
  )
}
