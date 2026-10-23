import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Building2, UsersRound, FileText, BrainCircuit } from 'lucide-react';

const STATS_DATA = [
  { value: 9, label: 'Departments', icon: Building2, color: 'blue' },
  { value: 4, label: 'User Roles', icon: UsersRound, color: 'teal' },
  { value: 10, label: 'Issue Categories', icon: FileText, color: 'purple', suffix: '+' },
  { value: 'AI', label: 'Smart Classification', icon: BrainCircuit, color: 'orange', isAI: true },
];

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-civic-blue', iconBg: 'bg-blue-100', glow: 'rgba(29, 78, 216, 0.15)' },
  teal: { bg: 'bg-teal-50', text: 'text-civic-teal', iconBg: 'bg-teal-100', glow: 'rgba(15, 118, 110, 0.15)' },
  purple: { bg: 'bg-purple-50', text: 'text-status-progress', iconBg: 'bg-purple-100', glow: 'rgba(124, 58, 237, 0.15)' },
  orange: { bg: 'bg-orange-50', text: 'text-status-pending', iconBg: 'bg-orange-100', glow: 'rgba(234, 88, 12, 0.15)' },
};

function AnimatedCounter({ value, suffix = '', duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(easeOut * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

function AIIndicator() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className="inline-flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="font-bold text-civic-text-primary">AI</span>
      <motion.div
        className="w-2 h-2 rounded-full bg-civic-blue"
        animate={{
          scale: pulse ? [1, 1.5, 1] : 1,
          opacity: pulse ? [1, 0.5, 1] : 1,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.span>
  );
}

function StatCard3D({ stat, index }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const c = colorMap[stat.color] || colorMap.blue;
  const controls = useAnimation();
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: index * 0.1 }
      });
    }
  }, [isInView, controls, index]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    setTransform({
      rotateX: Math.max(-8, Math.min(8, rotateX)),
      rotateY: Math.max(-8, Math.min(8, rotateY)),
      scale: 1.02
    });

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        className="relative h-full rounded-2xl bg-white border border-slate-200 p-6 overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          transform: prefersReducedMotion ? 'none' : `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
          boxShadow: isHovered
            ? `0 20px 40px -10px ${c.glow}, 0 8px 16px -4px rgba(0, 0, 0, 0.1)`
            : '0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
          transition: 'transform 0.2s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out',
          borderColor: isHovered ? c.text.replace('text-', '') : 'rgb(226, 232, 240)',
        }}
        onMouseMove={!prefersReducedMotion ? handleMouseMove : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: prefersReducedMotion ? 0.98 : 1 }}
      >
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${c.glow} 0%, transparent 50%)`,
            transition: 'opacity 0.3s ease-out',
          }}
        />

        {/* Icon container */}
        <motion.div
          className={`relative z-10 w-16 h-16 rounded-2xl ${c.iconBg} flex items-center justify-center mb-4`}
          whileHover={{ y: -4, scale: 1.1 }}
          transition={{ duration: 0.3 }}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(20px)',
          }}
        >
          <stat.icon size={32} className={c.text} style={{ transform: 'translateZ(10px)' }} />
        </motion.div>

        {/* Value */}
        <motion.div
          className="relative z-10 mb-2"
          style={{ transform: 'translateZ(15px)' }}
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {stat.isAI ? (
            <AIIndicator />
          ) : (
            <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} duration={1000} />
          )}
        </motion.div>

        {/* Label */}
        <motion.p
          className="relative z-10 text-sm font-medium text-civic-text-secondary"
          style={{ transform: 'translateZ(10px)' }}
        >
          {stat.label}
        </motion.p>

        {/* Subtle border highlight on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 opacity-0 pointer-events-none"
          style={{ borderColor: c.text.replace('text-', '') }}
          animate={{ opacity: isHovered ? 0.3 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50/30 via-white to-white border-y border-civic-border overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-civic-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-civic-teal/5 rounded-full blur-3xl" />
        {/* Subtle dots pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_DATA.map((stat, index) => (
            <StatCard3D key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
