import React, { useState } from 'react';
import type { MedicineInfo } from '../types';
import { AlertIcon } from './Icons';
import LanguageSelector from './LanguageSelector';
import { translateText } from '../services/geminiService';

interface ComparisonCardProps {
    medicine1: MedicineInfo;
    medicine2: MedicineInfo;
}

const ComparisonSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-dark-surface shadow-lg rounded-xl p-4 md:p-6 border border-gray-200 dark:border-dark-border">
        <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-4 text-center">{title}</h3>
        {children}
    </div>
);

const ComparisonCard: React.FC<ComparisonCardProps> = ({ medicine1, medicine2 }) => {
    const [displayData1, setDisplayData1] = useState<MedicineInfo>(medicine1);
    const [displayData2, setDisplayData2] = useState<MedicineInfo>(medicine2);
    const [isTranslating, setIsTranslating] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [error, setError] = useState<string | null>(null);

    const handleSelectLanguage = async (langCode: string) => {
        if (langCode === currentLang) return;
        if (langCode === 'en') {
            setDisplayData1(medicine1);
            setDisplayData2(medicine2);
            setCurrentLang('en');
            setError(null);
            return;
        }

        setIsTranslating(true);
        setError(null);
        try {
            const [translatedData1, translatedData2] = await Promise.all([
                translateText(medicine1, langCode),
                translateText(medicine2, langCode)
            ]);
            setDisplayData1(translatedData1);
            setDisplayData2(translatedData2);
            setCurrentLang(langCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed. Please try again.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsTranslating(false);
        }
    };

    const renderList = (items: string[]) => (
        <ul className="list-disc list-inside space-y-1 text-foreground/90 dark:text-dark-foreground/90">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    );

    return (
        <div className="relative space-y-6 animate-fade-in-up">
             <div className="absolute top-0 right-0 z-10 p-4">
                <LanguageSelector onSelectLanguage={handleSelectLanguage} isTranslating={isTranslating} currentLang={currentLang} />
            </div>

            <div className="text-center pt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light">
                    {displayData1.name}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">vs.</p>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light">
                    {displayData2.name}
                </h2>
            </div>
            
            {error && <p className="text-center text-red-500">{error}</p>}
            
            <ComparisonSection title="Common Uses">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <h4 className="font-bold mb-2 text-foreground dark:text-dark-foreground">{displayData1.name}</h4>
                        {renderList(displayData1.uses)}
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-foreground dark:text-dark-foreground">{displayData2.name}</h4>
                        {renderList(displayData2.uses)}
                    </div>
                </div>
            </ComparisonSection>
            
            <ComparisonSection title="Recommended Dosage">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <h4 className="font-bold mb-2 text-foreground dark:text-dark-foreground">{displayData1.name}</h4>
                        <p className="text-foreground/90 dark:text-dark-foreground/90">{displayData1.dosage}</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-foreground dark:text-dark-foreground">{displayData2.name}</h4>
                        <p className="text-foreground/90 dark:text-dark-foreground/90">{displayData2.dosage}</p>
                    </div>
                </div>
            </ComparisonSection>

            <ComparisonSection title="Side Effects">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200"><AlertIcon className="w-5 h-5"/>{displayData1.name}</h4>
                        {renderList(displayData1.side_effects)}
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200"><AlertIcon className="w-5 h-5"/>{displayData2.name}</h4>
                        {renderList(displayData2.side_effects)}
                    </div>
                </div>
            </ComparisonSection>
            
            <ComparisonSection title="Important Precautions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-800 dark:text-red-200"><AlertIcon className="w-5 h-5"/>{displayData1.name}</h4>
                        {renderList(displayData1.precautions)}
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-800 dark:text-red-200"><AlertIcon className="w-5 h-5"/>{displayData2.name}</h4>
                        {renderList(displayData2.precautions)}
                    </div>
                </div>
            </ComparisonSection>
        </div>
    );
};

export default ComparisonCard;
