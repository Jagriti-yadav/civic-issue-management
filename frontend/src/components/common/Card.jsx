import { motion } from 'framer-motion';

export function Card({ children, className = '', padding = 'md', hover = false, onClick }) {
  const padMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const CardMotion = motion.div;

  return (
    <CardMotion
      onClick={onClick}
      className={`card-base ${padMap[padding]} ${
        hover ? 'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-slate-300' : ''
      } ${className}`}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </CardMotion>
  );
}
