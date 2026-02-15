'use client';

import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// ============================================================================
// 1. RIPPLE BUTTON - Material Design ripple effect on click
// ============================================================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  rippleColor?: string;
  disabled?: boolean;
  [key: string]: any;
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      children,
      onClick,
      className = '',
      rippleColor = 'rgba(255, 255, 255, 0.6)',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const rippleCountRef = useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const id = rippleCountRef.current++;
      setRipples((prev) => [...prev, { id, x, y }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={`relative overflow-hidden ${className}`}
        {...props}
      >
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 20,
                height: 20,
                marginLeft: -10,
                marginTop: -10,
                backgroundColor: rippleColor,
              }}
            />
          ))}
        </AnimatePresence>
        {children}
      </button>
    );
  }
);

RippleButton.displayName = 'RippleButton';

// ============================================================================
// 2. GLOW ON HOVER - Subtle glow effect on hover
// ============================================================================

interface GlowOnHoverProps {
  children: ReactNode;
  glowColor?: string;
  glowIntensity?: 'subtle' | 'medium' | 'intense';
  duration?: number;
  className?: string;
}

export const GlowOnHover: React.FC<GlowOnHoverProps> = ({
  children,
  glowColor = 'rgba(16, 185, 129, 0.6)',
  glowIntensity = 'medium',
  duration = 0.3,
  className = '',
}) => {
  const intensityMap = {
    subtle: '0 0 8px',
    medium: '0 0 16px',
    intense: '0 0 32px',
  };

  const shadowVariants: Variants = {
    rest: {
      boxShadow: `${intensityMap.subtle} transparent`,
    },
    hover: {
      boxShadow: `${intensityMap[glowIntensity]} ${glowColor}`,
    },
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={shadowVariants}
      transition={{ duration }}
      className={`transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 3. PULSE EFFECT - Pulsing animation for attention
// ============================================================================

interface PulseEffectProps {
  children: ReactNode;
  intensity?: number;
  duration?: number;
  color?: string;
  includeColorPulse?: boolean;
  className?: string;
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  children,
  intensity = 0.1,
  duration = 2,
  color = 'rgba(16, 185, 129, 0.4)',
  includeColorPulse = false,
  className = '',
}) => {
  const pulseVariants: Variants = {
    pulse: {
      scale: [1, 1 + intensity, 1],
      ...(includeColorPulse && {
        boxShadow: [
          `0 0 0 0 ${color}`,
          `0 0 0 10px transparent`,
        ],
      }),
    },
  };

  return (
    <motion.div
      animate="pulse"
      variants={pulseVariants}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 4. SHIMMER EFFECT - Loading shimmer animation
// ============================================================================

interface ShimmerEffectProps {
  width?: string | number;
  height?: string | number;
  duration?: number;
  className?: string;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = '100%',
  height = 16,
  duration = 2,
  className = '',
}) => {
  const shimmerVariants: Variants = {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
  };

  return (
    <motion.div
      variants={shimmerVariants}
      animate="shimmer"
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
      style={{
        width,
        height,
        backgroundSize: '200% 100%',
      }}
    />
  );
};

// ============================================================================
// 5. FLOATING ELEMENT - Subtle up/down motion
// ============================================================================

interface FloatingElementProps {
  children: ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  distance = 8,
  duration = 3,
  delay = 0,
  className = '',
}) => {
  const floatingVariants: Variants = {
    floating: {
      y: [0, -distance, 0],
    },
  };

  return (
    <motion.div
      variants={floatingVariants}
      animate="floating"
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 6. SCALE ON SCROLL - Element scales when it comes into view
// ============================================================================

interface ScaleOnScrollProps {
  children: ReactNode;
  threshold?: number;
  duration?: number;
  scaleAmount?: number;
  className?: string;
}

export const ScaleOnScroll: React.FC<ScaleOnScrollProps> = ({
  children,
  threshold = 0.2,
  duration = 0.6,
  scaleAmount = 0.9,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Keep it in view, don't unobserve for continuous animations
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const scaleVariants: Variants = {
    hidden: {
      scale: scaleAmount,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={scaleVariants}
      transition={{ duration, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// BONUS: FADE IN ON SCROLL - Smooth fade in as element enters view
// ============================================================================

interface FadeInOnScrollProps {
  children: ReactNode;
  threshold?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}

export const FadeInOnScroll: React.FC<FadeInOnScrollProps> = ({
  children,
  threshold = 0.1,
  duration = 0.8,
  direction = 'up',
  distance = 24,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 };
      case 'down':
        return { y: -distance, opacity: 0 };
      case 'left':
        return { x: distance, opacity: 0 };
      case 'right':
        return { x: -distance, opacity: 0 };
      case 'none':
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  const fadeVariants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeVariants}
      transition={{ duration, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// BONUS: STAGGER CONTAINER - Container for staggered children animations
// ============================================================================

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className = '',
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

// ============================================================================
// BONUS: FLIP CARD - Card that flips on hover (3D effect)
// ============================================================================

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  duration?: number;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  duration = 0.6,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipVariants: Variants = {
    front: {
      rotateY: 0,
      opacity: 1,
      zIndex: 10,
    },
    back: {
      rotateY: 180,
      opacity: 0,
      zIndex: 0,
    },
  };

  return (
    <div
      className={`relative w-full h-full cursor-pointer perspective ${className}`}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        variants={flipVariants}
        animate={isFlipped ? 'back' : 'front'}
        transition={{ duration, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {front}
      </motion.div>
      <motion.div
        variants={flipVariants}
        animate={isFlipped ? 'front' : 'back'}
        transition={{ duration, ease: 'easeInOut' }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          rotateY: 180,
        }}
      >
        {back}
      </motion.div>
    </div>
  );
};

// ============================================================================
// BONUS: BOUNCE ANIMATION - Bouncy entrance animation
// ============================================================================

interface BounceProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  intensity?: number;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  intensity = 20,
  className = '',
}) => {
  const bounceVariants: Variants = {
    hidden: {
      y: intensity,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10,
        delay,
        duration,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bounceVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
