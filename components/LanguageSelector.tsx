import React, { useState } from 'react';
import { GlobeIcon } from './Icons';

interface LanguageSelectorProps {
    onSelectLanguage: (langCode: string) => void;
    isTranslating: boolean;
    currentLang: string;
}

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage, isTranslating, currentLang }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (code: string) => {
        onSelectLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary-light dark:bg-dark-surface p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors flex items-center gap-1"
                aria-label="Select language"
            >
                <GlobeIcon className="w-6 h-6 text-primary-dark dark:text-primary-light" />
                {isTranslating && <div className="w-4 h-4 border-2 border-primary-dark/50 dark:border-primary-light/50 border-t-transparent rounded-full animate-spin"></div>}
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-surface rounded-lg shadow-xl z-20 overflow-hidden ring-1 ring-black ring-opacity-5"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <ul>
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full text-left px-4 py-2 text-sm text-foreground dark:text-dark-foreground ${currentLang === lang.code ? 'font-bold bg-primary-light dark:bg-dark-border' : ''} hover:bg-gray-100 dark:hover:bg-dark-border`}
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
