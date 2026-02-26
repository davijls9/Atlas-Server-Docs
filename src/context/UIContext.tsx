import React, { createContext, useContext, useState } from 'react';
import type { AppTab } from '../types/app.types';

export type AppTheme = 'dark' | 'light' | 'sepia';

interface UIContextType {
    activeTab: AppTab;
    setActiveTab: (tab: AppTab) => void;
    isSyncing: boolean;
    setIsSyncing: (val: boolean) => void;
    sidebarWidth: number;
    setSidebarWidth: (val: number) => void;
    isNavCollapsed: boolean;
    setIsNavCollapsed: (val: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (val: boolean) => void;
    theme: AppTheme;
    setTheme: (theme: AppTheme) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<AppTab>('editor');
    const [isSyncing, setIsSyncing] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Theme State with Persistence
    const [theme, setThemeState] = useState<AppTheme>(() => {
        const saved = localStorage.getItem('atlas_theme') as AppTheme;
        return (saved === 'dark' || saved === 'light' || saved === 'sepia') ? saved : 'dark';
    });

    const setTheme = (newTheme: AppTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('atlas_theme', newTheme);
    };

    return (
        <UIContext.Provider value={{
            activeTab, setActiveTab,
            isSyncing, setIsSyncing,
            sidebarWidth, setSidebarWidth,
            isNavCollapsed, setIsNavCollapsed,
            isMobileMenuOpen, setIsMobileMenuOpen,
            theme, setTheme
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within an AppProvider');
    return context;
};
