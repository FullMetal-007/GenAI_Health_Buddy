import React from 'react';
import { SunIcon, MoonIcon } from './Icons';
import { Logo } from './Logo';

interface HeaderProps {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    goHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, goHome }) => {
    return (
        <header className="bg-white/70 dark:bg-dark-background/70 backdrop-blur-lg p-3 shadow-md sticky top-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <button onClick={goHome} className="flex items-center gap-2" aria-label="Go to homepage">
                     <Logo iconClassName="h-10 w-10" textClassName="text-xl hidden sm:flex" />
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-foreground dark:text-dark-foreground bg-primary-light dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
            </div>
        </header>
    );
};

export default Header;