import React, { useRef, useState } from 'react';
import type { MedicineInfo } from '../types';
import { AlertIcon, PdfIcon } from './Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { translateText } from '../services/geminiService';
import LanguageSelector from './LanguageSelector';


interface MedicineCardProps {
    data: MedicineInfo;
}

const InfoSection: React.FC<{ title: string; items: string[] | string; icon?: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light flex items-center gap-2 mb-2">
            {icon}
            {title}
        </h3>
        {Array.isArray(items) ? (
            <ul className="list-disc list-inside pl-2 space-y-1 text-foreground/90 dark:text-dark-foreground/90">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        ) : (
            <p className="pl-2 text-foreground/90 dark:text-dark-foreground/90">{items}</p>
        )}
    </div>
);

const MedicineCard: React.FC<MedicineCardProps> = ({ data }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [displayData, setDisplayData] = useState<MedicineInfo>(data);
    const [isTranslating, setIsTranslating] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        const element = cardRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${displayData.name.replace(/\s+/g, '_')}_Info.pdf`);
    };
    
    const handleSelectLanguage = async (langCode: string) => {
        if (langCode === 'en') {
            setDisplayData(data);
            setCurrentLang('en');
            setError(null);
            return;
        }
        
        setIsTranslating(true);
        setError(null);
        try {
            const translatedData = await translateText(data, langCode);
            setDisplayData(translatedData);
            setCurrentLang(langCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Translation failed');
        } finally {
            setIsTranslating(false);
        }
    };


    return (
        <div className="relative">
            <div ref={cardRef} className="bg-white dark:bg-dark-surface shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-dark-border animate-fade-in-up">
                <h2 className="text-3xl font-bold text-center mb-6 text-primary-dark dark:text-primary-light">{displayData.name}</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoSection title="Common Uses" items={displayData.uses} />
                    <InfoSection title="Recommended Dosage" items={displayData.dosage} />
                    <div className="md:col-span-2 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg">
                         <InfoSection title="Side Effects" items={displayData.side_effects} icon={<AlertIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400"/>} />
                    </div>
                    <div className="md:col-span-2 mt-2 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 rounded-r-lg">
                        <InfoSection title="Important Precautions" items={displayData.precautions} icon={<AlertIcon className="w-5 h-5 text-red-500 dark:text-red-400"/>} />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <LanguageSelector onSelectLanguage={handleSelectLanguage} isTranslating={isTranslating} currentLang={currentLang} />
                <button
                    onClick={handleExport}
                    className="bg-primary-light dark:bg-dark-surface p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    aria-label="Export as PDF"
                >
                    <PdfIcon className="w-6 h-6 text-primary-dark dark:text-primary-light" />
                </button>
            </div>
        </div>
    );
};

export default MedicineCard;