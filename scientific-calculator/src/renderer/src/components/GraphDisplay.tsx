// src/renderer/src/components/GraphDisplay.tsx
import {useMemo} from 'react'
import {Coordinates, Mafs, Plot, Theme} from 'mafs'
import * as math from 'mathjs'

import 'mafs/core.css'
import 'mafs/font.css'

interface GraphDisplayProps {
  expression: string
  colorMode: 'dark' | 'light'
}

export default function GraphDisplay({expression, colorMode}: GraphDisplayProps) {
  const parsedFunction = useMemo(() => {
    try {
      if (!expression) return null

      const sanitizedExpression = expression.toLowerCase()
      const compiledNode = math.compile(sanitizedExpression)

      return (x: number): number => {
        try {
          return compiledNode.evaluate({x})
        } catch {
          return NaN
        }
      }
    } catch {
      return null
    }
  }, [expression])

  return (
    // Added minHeight: 0 to prevent flexbox from silently overflowing the container
    <div style={{width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', minHeight: 0}}>
      <Mafs
        viewBox={{x: [-6, 6], y: [-6, 6]}}
        pan={true}
        zoom={true}
      >
        <Coordinates.Cartesian
          xAxis={{lines: 1, labels: (n) => (n % 2 === 0 ? n : '')}}
          yAxis={{lines: 1, labels: (n) => (n % 2 === 0 ? n : '')}}
        />
        {parsedFunction && (
          <Plot.OfX
            y={parsedFunction}
            color={colorMode === 'dark' ? Theme.blue : Theme.indigo}
            weight={3}
          />
        )}
      </Mafs>
    </div>
  )
}
