import React from 'react';
import { Moon, Sun, Coffee } from 'lucide-react';
import { useUI, type AppTheme } from '../context/UIContext';

// ─────────────────────────────────────────────────────────────────────────────
// Theme Configuration — add/remove themes here to update the switcher globally
// ─────────────────────────────────────────────────────────────────────────────
interface ThemeConfig {
    id: AppTheme;
    label: string;
    icon: React.ElementType;
    /** Explicit text color to ensure readability on any background */
    activeTextClass: string;
    /** Glow/shadow for active pill so it feels tactile */
    activeShadow: string;
}

const THEME_CONFIGS: ThemeConfig[] = [
    {
        id: 'dark',
        label: 'Sovereign',
        icon: Moon,
        activeTextClass: 'text-white',
        activeShadow: 'shadow-blue-500/30',
    },
    {
        id: 'light',
        label: 'Tactical',
        icon: Sun,
        activeTextClass: 'text-white',
        activeShadow: 'shadow-blue-600/20',
    },
    {
        id: 'sepia',
        label: 'Strategic',
        icon: Coffee,
        activeTextClass: 'text-white',
        activeShadow: 'shadow-amber-800/20',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// ThemeSwitcher Component
// ─────────────────────────────────────────────────────────────────────────────
export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useUI();

    return (
        <div
            role="group"
            aria-label="Select application theme"
            className="flex items-center gap-0.5 bg-[var(--bg-deep)] p-1 rounded-xl border border-[var(--border-main)] shadow-inner"
        >
            {THEME_CONFIGS.map((cfg) => {
                const Icon = cfg.icon;
                const isActive = theme === cfg.id;

                return (
                    <button
                        key={cfg.id}
                        id={`theme-btn-${cfg.id}`}
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setTheme(cfg.id)}
                        title={`Switch to ${cfg.label} theme`}
                        className={[
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest',
                            'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
                            isActive
                                ? `bg-[var(--primary)] ${cfg.activeTextClass} shadow-lg ${cfg.activeShadow} scale-[1.03]`
                                : 'text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)]',
                        ].join(' ')}
                    >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                        <span className="hidden lg:inline leading-none">{cfg.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
