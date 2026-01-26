import { memo } from 'react';
import { useBR } from '../../hooks/BR/useBR';

type CanvasProps = {
  className?: string;
  style?: React.CSSProperties;
};

const Canvas = ({ className, style }: CanvasProps) => {
  const { canvasRef } = useBR();

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
};

export const BR = memo(Canvas);
