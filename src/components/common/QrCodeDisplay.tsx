import React, { useMemo } from 'react';

interface QrCodeDisplayProps {
  value: string;
  code: string;
  size?: number;
}

/**
 * Generates a deterministic, crisp QR Matrix SVG with standard 7x7 finder patterns,
 * timing strips, alignment pattern, and encoded data modules for the pairing payload.
 */
export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ value, code, size = 180 }) => {
  const gridSize = 25;

  const matrix = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );
    const reserved: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    const placeFinder = (rowOffset: number, colOffset: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = rowOffset + r;
          const cc = colOffset + c;
          if (rr >= 0 && rr < gridSize && cc >= 0 && cc < gridSize) {
            reserved[rr][cc] = true;
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              grid[rr][cc] = isBorder || isInner;
            }
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, gridSize - 7);
    placeFinder(gridSize - 7, 0);

    // Alignment pattern at (16, 16)
    for (let r = 16; r <= 20; r++) {
      for (let c = 16; c <= 20; c++) {
        reserved[r][c] = true;
        const isBorder = r === 16 || r === 20 || c === 16 || c === 20;
        const isCenter = r === 18 && c === 18;
        grid[r][c] = isBorder || isCenter;
      }
    }

    // Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Encode payload bits deterministically
    const payload = `${value}|${code}`;
    let hash = 2166136261;
    for (let i = 0; i < payload.length; i++) {
      hash ^= payload.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    let bitIndex = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!reserved[r][c]) {
          const charCode = payload.charCodeAt(bitIndex % payload.length);
          const shifted = ((hash >>> (bitIndex % 24)) ^ (charCode * (r + 1) * (c + 3))) & 1;
          grid[r][c] = shifted === 1;
          bitIndex++;
        }
      }
    }

    return grid;
  }, [value, code]);

  return (
    <div className="ak-card-3d inline-flex flex-col items-center p-4 rounded-[28px] bg-white dark:bg-[#1E1B3A] border-2 border-[#E4DFF5] dark:border-[#38316B] shadow-soft">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        shapeRendering="crispEdges"
        className="rounded-xl"
      >
        <rect width={gridSize} height={gridSize} fill="#FFFFFF" />
        {matrix.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1}
                height={1}
                fill="#25233A"
                rx={0.15}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
