import React, { useRef, useState } from 'react';
import type { PrescriptionInfo, DrugInteraction } from '../types';
import { MedicationIcon, VitalsIcon, AlertIcon, PdfIcon, WhatsAppIcon, InteractionsIcon, ClipboardListIcon, LeafIcon } from './Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LanguageSelector from './LanguageSelector';
import { translateText } from '../services/geminiService';

interface PrescriptionResultProps {
    data: PrescriptionInfo;
    showConfirmation: boolean;
    userInfo: { name: string; phone: string } | null;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white dark:bg-dark-surface shadow-lg rounded-xl p-6 border border-gray-200 dark:border-dark-border ${className}`}>
        <h3 className="text-xl font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        {children}
    </div>
);

const InteractionCard: React.FC<{ interaction: DrugInteraction }> = ({ interaction }) => {
    const levelStyles = {
        High: 'border-red-500 bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200',
        Moderate: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200',
        Low: 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
    };

    return (
        <div className={`p-4 rounded-lg border-l-4 ${levelStyles[interaction.interaction_level]}`}>
            <div className="flex justify-between items-start">
                 <h4 className="font-bold text-lg mb-1">{interaction.medicines.join(' + ')}</h4>
                 <span className={`font-bold text-sm px-2 py-1 rounded-full ${levelStyles[interaction.interaction_level]} border-0`}>
                    {interaction.interaction_level}
                </span>
            </div>
            <p className="text-sm text-foreground/80 dark:text-dark-foreground/80">{interaction.description}</p>
        </div>
    );
};


const PrescriptionResult: React.FC<PrescriptionResultProps> = ({ data, showConfirmation, userInfo }) => {
    const resultRef = useRef<HTMLDivElement>(null);
    const [displayData, setDisplayData] = useState<PrescriptionInfo>(data);
    const [isTranslating, setIsTranslating] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        const element = resultRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { 
            scale: 2, 
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f8fafc' 
        });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const fileName = userInfo?.name ? `Prescription_${userInfo.name.replace(/\s+/g, '_')}_${currentLang}.pdf` : `Prescription_Summary_${currentLang}.pdf`;
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(fileName);
    };

    const handleSelectLanguage = async (langCode: string) => {
        if (langCode === currentLang) return;
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
            setError(err instanceof Error ? err.message : 'Translation failed. Please try again.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsTranslating(false);
        }
    };
    
    const { medications, precautions, vitals, drug_interactions, lifestyle_and_diet_recos, potential_conditions_summary } = displayData;

    return (
        <div className="relative animate-fade-in-up">
            <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-4">
                <LanguageSelector onSelectLanguage={handleSelectLanguage} isTranslating={isTranslating} currentLang={currentLang} />
                <button
                    onClick={handleExport}
                    className="bg-primary-light dark:bg-dark-surface p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                    aria-label="Export as PDF"
                >
                    <PdfIcon className="w-6 h-6 text-primary-dark dark:text-primary-light" />
                </button>
            </div>
            <div ref={resultRef} className="p-1 md:p-4 bg-primary-light/50 dark:bg-dark-background rounded-2xl">
                
                <h2 className="text-3xl font-bold text-center pt-12 pb-6 text-primary-dark dark:text-primary-light">Detailed Prescription Analysis</h2>
                
                 {showConfirmation && userInfo && (
                    <div className="mb-6 mx-auto max-w-4xl p-4 bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 rounded-lg text-green-800 dark:text-green-200 flex items-center gap-3">
                        <WhatsAppIcon className="w-8 h-8"/>
                        <div>
                            <p className="font-semibold">Prescription summary ready for {userInfo.name}.</p>
                            <p className="text-sm">This is a preview. No message has been sent to {userInfo.phone}.</p>
                        </div>
                    </div>
                )}
                
                {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                
                <div className="space-y-6 max-w-4xl mx-auto">
                    <SectionCard title="Medications" icon={<MedicationIcon className="w-7 h-7" />} className="col-span-1 lg:col-span-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b dark:border-dark-border">
                                    <tr>
                                        <th className="p-3 font-semibold text-foreground dark:text-dark-foreground">Name</th>
                                        <th className="p-3 font-semibold text-foreground dark:text-dark-foreground">Dosage</th>
                                        <th className="p-3 font-semibold text-foreground dark:text-dark-foreground">Timing</th>
                                        <th className="p-3 font-semibold text-foreground dark:text-dark-foreground">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med, index) => (
                                        <tr key={index} className="border-b dark:border-dark-border last:border-0">
                                            <td className="p-3 text-foreground/90 dark:text-dark-foreground/90 font-medium">{med.name}</td>
                                            <td className="p-3 text-foreground/90 dark:text-dark-foreground/90">{med.dosage}</td>
                                            <td className="p-3 text-foreground/90 dark:text-dark-foreground/90">{med.timing}</td>
                                            <td className="p-3 text-foreground/90 dark:text-dark-foreground/90">{med.purpose}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>

                    <SectionCard title="Drug Interaction Check" icon={<InteractionsIcon className="w-7 h-7 text-red-500" />}>
                        {drug_interactions && drug_interactions.length > 0 ? (
                            <div className="space-y-4">
                                {drug_interactions.map((interaction, index) => (
                                    <InteractionCard key={index} interaction={interaction} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 p-3 rounded-md">No significant drug interactions were found among the prescribed medications. Always consult your doctor for confirmation.</p>
                        )}
                    </SectionCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title="Potential Conditions" icon={<ClipboardListIcon className="w-7 h-7 text-indigo-500" />}>
                             <p className="text-foreground/90 dark:text-dark-foreground/90">{potential_conditions_summary}</p>
                        </SectionCard>

                        {vitals && Object.keys(vitals).length > 0 && (
                            <SectionCard title="Vitals" icon={<VitalsIcon className="w-7 h-7 text-rose-500" />}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.entries(vitals).map(([key, value]) => (
                                        <div key={key} className="bg-primary-light/70 dark:bg-dark-surface p-3 rounded-lg text-center">
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</p>
                                            <p className="text-lg font-bold text-primary-dark dark:text-white">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        <SectionCard title="Lifestyle & Diet" icon={<LeafIcon className="w-7 h-7 text-green-500" />} className="lg:col-span-2">
                             <ul className="list-disc list-inside space-y-2 text-foreground/90 dark:text-dark-foreground/90">
                                {lifestyle_and_diet_recos.map((note, index) => <li key={index}>{note}</li>)}
                            </ul>
                        </SectionCard>

                         <SectionCard title="Precautions & Advice" icon={<AlertIcon className="w-7 h-7 text-yellow-500" />} className="lg:col-span-2">
                            <ul className="list-disc list-inside space-y-2 text-foreground/90 dark:text-dark-foreground/90">
                                {precautions.map((note, index) => <li key={index}>{note}</li>)}
                            </ul>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionResult;