'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@easy-shadcn/utils';

interface RippleItem {
  x: number;
  y: number;
  id: number;
  size: number;
}

export type RippleAction = {
  showRipple: (event: React.MouseEvent) => void;
};

export const Ripple = ({
  color = 'rgb(255 255 255 / 0.5)',
  rippleRef,
}: {
  color?: string;
  rippleRef: React.RefObject<RippleAction>;
}) => {
  const [ripples, setRipples] = React.useState<RippleItem[]>([]);
  const showRipple = React.useCallback((event: React.MouseEvent) => {
    const container = event.currentTarget as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 简化涟漪大小计算，使用容器对角线长度的2倍
    const size = Math.max(rect.width, rect.height) * 2;
    // 创建新的涟漪
    setRipples((prev) => [
      ...prev,
      {
        x,
        y,
        size,
        id: Date.now(),
      },
    ]);
  }, []);

  React.useImperativeHandle(rippleRef, () => ({
    showRipple,
  }));

  // 清理完成的涟漪
  React.useEffect(() => {
    const timeouts = ripples.map((ripple) => {
      return setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 1000);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [ripples]);

  return (
    <div className={cn('absolute inset-0 pointer-events-none z-10')} role="presentation">
      <AnimatePresence mode="sync">
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: `${ripple.size}px`,
              height: `${ripple.size}px`,
              backgroundColor: color,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 0.75,
              ease: [0.4, 0, 0.2, 1],
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

Ripple.displayName = 'Ripple';
