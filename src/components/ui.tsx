import { useState } from 'react';
import type { EPDMetrics, BreakoutMetrics } from '../types';

// EPD Tier Badge - minimal style
export function TierBadge({ tier }: { tier: EPDMetrics['tier'] }) {
  const styles: Record<EPDMetrics['tier'], string> = {
    'Elite': 'text-[#00d26a]',
    'Great': 'text-[#00d26a]',
    'Good': 'text-[#888]',
    'Average': 'text-[#666]',
    'Below Average': 'text-[#ff3b3b]',
    'Poor': 'text-[#ff3b3b]',
  };

  return (
    <span className={`text-[12px] font-mono font-medium ${styles[tier]}`}>
      {tier.toUpperCase()}
    </span>
  );
}

// Breakout Tier Badge
export function BreakoutBadge({ tier }: { tier: BreakoutMetrics['breakoutTier'] }) {
  const styles: Record<BreakoutMetrics['breakoutTier'], string> = {
    'Imminent': 'text-[#00d26a]',
    'High Potential': 'text-[#ffcc00]',
    'Developing': 'text-[#888]',
    'Long-term': 'text-[#888]',
    'Established': 'text-[#666]',
  };

  return (
    <span className={`text-[12px] font-mono font-medium ${styles[tier]}`}>
      {tier.toUpperCase()}
    </span>
  );
}

// Player Avatar with NBA headshot
export function PlayerAvatar({ name, teamCode: _teamCode, size = 'md', nbaId }: { 
  name: string; 
  teamCode: string;
  size?: 'sm' | 'md' | 'lg';
  nbaId?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-[11px]',
    lg: 'w-14 h-14 text-sm',
  };

  const headshotUrl = nbaId 
    ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`
    : null;

  if (headshotUrl && !imgError) {
    return (
      <img 
        src={headshotUrl}
        alt={name}
        className={`rounded object-cover bg-[#1a1a1a] ${sizeStyles[size]}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`rounded bg-[#1a1a1a] flex items-center justify-center font-mono text-[#666] ${sizeStyles[size]}`}>
      {initials}
    </div>
  );
}

// Card component
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0a0a0a] border border-[#1a1a1a] ${className}`}>
      {children}
    </div>
  );
}

// Stat Card for dashboard
export function StatCard({ label, value, subValue, trend }: { 
  label: string; 
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'text-[#00d26a]' : trend === 'down' ? 'text-[#ff3b3b]' : 'text-[#666]';
  
  return (
    <div className="p-4 border-r border-[#1a1a1a] last:border-r-0">
      <div className="text-[11px] text-[#666] uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-mono font-semibold text-white`}>{value}</div>
      {subValue && <div className={`text-[12px] font-mono ${trendColor}`}>{subValue}</div>}
    </div>
  );
}

// Progress Bar - minimal
export function ProgressBar({ value, max = 100, color = 'default' }: { 
  value: number; 
  max?: number;
  color?: 'default' | 'green' | 'yellow' | 'red';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    default: 'bg-[#333]',
    green: 'bg-[#00d26a]',
    yellow: 'bg-[#ffcc00]',
    red: 'bg-[#ff3b3b]',
  };
  
  return (
    <div className="h-1 bg-[#1a1a1a] w-full">
      <div 
        className={`h-full ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Confidence Indicator
export function ConfidenceIndicator({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bars: 3, color: 'bg-[#00d26a]' },
    medium: { bars: 2, color: 'bg-[#ffcc00]' },
    low: { bars: 1, color: 'bg-[#ff3b3b]' },
  };
  
  const { bars, color } = config[level];
  
  return (
    <div className="flex gap-0.5 items-end h-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1 ${i <= bars ? color : 'bg-[#1a1a1a]'}`}
          style={{ height: `${i * 4}px` }}
        />
      ))}
    </div>
  );
}
