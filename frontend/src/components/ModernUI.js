import React from 'react';
import { motion } from 'framer-motion';

// Modern Glass Card Component
export const GlassCard = ({ children, className = "", hover = true, ...props }) => {
  return (
    <motion.div
      className={`
        backdrop-blur-md bg-glass-200 border border-white/20 rounded-2xl shadow-glass
        ${hover ? 'hover:bg-glass-300 hover:shadow-glow transition-all duration-300' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Modern Button Component
export const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  icon: Icon,
  className = "",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-glow focus:ring-primary-500",
    secondary: "bg-glass-200 backdrop-blur-md border border-white/20 text-dark-700 hover:bg-glass-300 shadow-glass",
    ghost: "text-dark-600 hover:bg-glass-200 hover:text-dark-800",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-300",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileTap={{ scale: 0.95 }}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </motion.button>
  );
};

// Modern Input Component
export const ModernInput = ({ 
  label, 
  type = "text", 
  placeholder,
  error,
  icon: Icon,
  className = "",
  ...props 
}) => {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-dark-400" />
          </div>
        )}
        <motion.input
          type={type}
          placeholder={placeholder}
          className={`
            block w-full rounded-xl border-0 bg-glass-200 backdrop-blur-md py-3 text-dark-900 shadow-glass placeholder:text-dark-400
            focus:ring-2 focus:ring-primary-500 focus:bg-glass-300 transition-all duration-300
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            ${error ? 'ring-2 ring-red-500' : ''}
          `}
          whileFocus={{ scale: 1.02 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Modern Card Component
export const ModernCard = ({ 
  children, 
  className = "", 
  gradient = false,
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl
        ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'}
        ${glow ? 'hover:shadow-glow' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Stats Card
export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary",
  trend,
  className = ""
}) => {
  const colors = {
    primary: "from-primary-500 to-primary-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <ModernCard className={`p-6 overflow-hidden relative ${className}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-600 mb-1">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-dark-900"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {value}
            </motion.p>
            {trend && (
              <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </p>
            )}
          </div>
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-r ${colors[color]} text-white`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-r ${colors[color]}`} />
      </div>
    </ModernCard>
  );
};

// Modern Badge Component
export const ModernBadge = ({ 
  children, 
  variant = "default",
  size = "md",
  className = ""
}) => {
  const variants = {
    default: "bg-dark-100 text-dark-800",
    primary: "bg-primary-100 text-primary-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    glass: "bg-glass-200 backdrop-blur-md border border-white/20 text-dark-700",
  };
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <motion.span
      className={`
        inline-flex items-center font-medium rounded-full transition-all duration-200
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.span>
  );
};

// Loading Skeleton with modern animation
export const ModernSkeleton = ({ className = "", lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gradient-to-r from-dark-200 via-dark-300 to-dark-200 rounded-lg mb-2 last:mb-0"
          style={{
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Modern Floating Action Button
export const FloatingActionButton = ({ 
  icon: Icon, 
  onClick,
  className = "",
  ...props 
}) => {
  return (
    <motion.button
      className={`
        fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 
        text-white rounded-full shadow-lg hover:shadow-glow z-50
        flex items-center justify-center transition-all duration-300
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      {...props}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
};

// Modern Toggle Switch
export const ModernToggle = ({ enabled, onChange, className = "" }) => {
  return (
    <motion.button
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-primary-600' : 'bg-dark-300'}
        ${className}
      `}
      onClick={() => onChange(!enabled)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        animate={{
          x: enabled ? 24 : 4,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
};

// Gradient Text Component
export const GradientText = ({ 
  children, 
  gradient = "from-primary-600 to-purple-600",
  className = ""
}) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

// Modern Progress Bar
export const ModernProgressBar = ({ 
  progress, 
  color = "primary",
  className = ""
}) => {
  const colors = {
    primary: "from-primary-500 to-primary-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className={`w-full bg-dark-200 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};
