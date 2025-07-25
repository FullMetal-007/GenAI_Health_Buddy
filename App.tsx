import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Spinner from './components/Spinner';
import MedicineCard from './components/MedicineCard';
import PrescriptionResult from './components/PrescriptionResult';
import { getMedicineInfo, analyzePrescription, startChatSession, analyzeSymptoms } from './services/geminiService';
import type { ViewState, MedicineInfo, PrescriptionInfo, SymptomInfo, ChatMessage } from './types';
import type { Chat } from '@google/genai';
import { SearchIcon, PlusIcon, ChatIcon, StethoscopeIcon, AlertIcon, SendIcon } from './components/Icons';
import { Logo } from './components/Logo';
import PrescriptionUploader from './components/PrescriptionUploader';
import ComparisonCard from './components/ComparisonCard';

// --- Internal Components ---

const Chatbot: React.FC<{
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-[70vh] max-h-[70vh] w-full max-w-3xl mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-2xl animate-fade-in-up">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <Logo iconClassName="w-8 h-8 self-start" />}
                        <div
                            className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${
                                msg.role === 'user'
                                    ? 'bg-primary-DEFAULT text-white rounded-br-none'
                                    : 'bg-gray-200 dark:bg-gray-700 text-foreground dark:text-dark-foreground rounded-bl-none'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <Logo iconClassName="w-8 h-8 self-start" />
                        <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-foreground dark:text-dark-foreground rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Ask about health..."
                        className="flex-grow p-3 border-2 border-gray-200 dark:border-dark-border rounded-full bg-primary-light dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-primary-DEFAULT text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <SendIcon className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    );
};


const SymptomChecker: React.FC<{ onAnalyze: (symptoms: string) => void; isLoading: boolean }> = ({ onAnalyze, isLoading }) => {
    const [symptoms, setSymptoms] = useState('');

    return (
         <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
            <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms... e.g., 'I have a headache, fever, and a sore throat.'"
                className="w-full p-4 text-lg border-2 border-gray-200 dark:border-dark-border rounded-lg bg-primary-light dark:bg-dark-surface text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent outline-none transition-shadow min-h-[150px]"
                disabled={isLoading}
            />
             <button onClick={() => onAnalyze(symptoms)} disabled={isLoading || !symptoms.trim()} className="mt-4 w-full p-4 bg-primary-DEFAULT text-white rounded-lg font-bold text-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
        </div>
    );
};

const SymptomResult: React.FC<{ data: SymptomInfo }> = ({ data }) => {
     const urgencyColorMap = {
        'Emergency': 'border-red-600 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
        'High': 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        'Medium': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
        'Low': 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    };
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30">
                 <h3 className="font-bold text-lg text-red-800 dark:text-red-200 flex items-center gap-2"><AlertIcon/>Disclaimer</h3>
                 <p className="text-red-700 dark:text-red-300">{data.disclaimer}</p>
            </div>

            <div className={`p-4 rounded-lg border-l-4 ${urgencyColorMap[data.urgency]}`}>
                <h3 className="font-bold text-lg">Urgency Level: {data.urgency}</h3>
                <p className="mt-1">{data.summary}</p>
            </div>
            
            <div>
                <h3 className="font-bold text-xl mb-2 text-primary-dark dark:text-primary-light">Possible Conditions</h3>
                <div className="space-y-3">
                {data.possible_conditions.map((item, index) => (
                    <div key={index} className="p-3 bg-primary-light dark:bg-dark-surface rounded-lg">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-foreground/80 dark:text-dark-foreground/80">{item.description}</p>
                    </div>
                ))}
                </div>
            </div>

             <div>
                <h3 className="font-bold text-xl mb-2 text-primary-dark dark:text-primary-light">Advice & Next Steps</h3>
                <ul className="list-disc list-inside space-y-2 p-3 bg-primary-light dark:bg-dark-surface rounded-lg">
                    {data.advice.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        </div>
    );
}

// --- Main App Component ---

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [view, setView] = useState<ViewState>('welcome');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Analyzing...");
    const [error, setError] = useState<string | null>(null);
    const [medicineData, setMedicineData] = useState<MedicineInfo | null>(null);
    const [prescriptionData, setPrescriptionData] = useState<PrescriptionInfo | null>(null);
    const [symptomData, setSymptomData] = useState<SymptomInfo | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [userInfo, setUserInfo] = useState<{ name: string; phone: string } | null>(null);
    const [medicineToCompare, setMedicineToCompare] = useState<MedicineInfo | null>(null);
    const [comparisonData, setComparisonData] = useState<[MedicineInfo, MedicineInfo] | null>(null);
    const chatSession = useRef<Chat | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const reset = useCallback(() => {
        setView('welcome');
        setError(null);
        setMedicineData(null);
        setPrescriptionData(null);
        setSymptomData(null);
        setUserInfo(null);
        setMedicineToCompare(null);
        setComparisonData(null);
    }, []);

    const handleViewChange = (newView: ViewState) => {
        setError(null);
         if (newView !== 'comparison') {
            setMedicineToCompare(null);
            setComparisonData(null);
        }
        
        if (newView === 'prescription') {
            setPrescriptionData(null); // Always show uploader when tab is clicked
            setUserInfo(null);
        }
        
        if (newView === 'interaction' && !chatSession.current) {
            chatSession.current = startChatSession();
            setChatMessages([
                { role: 'model', text: "Hello! I'm your GenAI Health Buddy. You can ask me about medicine interactions, health symptoms, or general wellness. How can I help?\n\n**Disclaimer:** I am an AI assistant, not a medical professional. Please consult a doctor for medical advice." }
            ]);
        }
        
        setView(newView);
    };

    const handleSearch = useCallback(async (query: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage(`Searching for ${query}...`);
        
        try {
            const data = await getMedicineInfo(query);
            if (medicineToCompare) {
                setComparisonData([medicineToCompare, data]);
                setView('comparison');
                setMedicineToCompare(null); 
            } else {
                setMedicineData(data);
                setView('medicine');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setView('welcome');
            setMedicineToCompare(null);
        } finally {
            setIsLoading(false);
        }
    }, [medicineToCompare]);

    const handlePrescriptionAnalysis = useCallback(async (file: File, info: { name: string; phone: string }) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Analyzing your prescription...");
        setUserInfo(info);
    
        try {
            const data = await analyzePrescription(file);
            setPrescriptionData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setPrescriptionData(null);
            setUserInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleSymptomAnalysis = useCallback(async (symptoms: string) => {
        setIsLoading(true);
        setError(null);
        setLoadingMessage("Analyzing symptoms...");
        setView('symptom');
        try {
            const data = await analyzeSymptoms(symptoms);
            setSymptomData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setSymptomData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        if (!chatSession.current) return;
        
        setIsLoading(true);
        setChatMessages(prev => [...prev, { role: 'user', text: message }]);

        try {
            const response = await chatSession.current.sendMessage({ message });
            setChatMessages(prev => [...prev, { role: 'model', text: response.text ?? '' }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred while communicating with the AI.";
            setChatMessages(prev => [...prev, { role: 'model', text: `Sorry, something went wrong. ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleStartCompare = (medicine: MedicineInfo) => {
        setMedicineToCompare(medicine);
        setView('welcome');
    };

    const renderContent = () => {
        if (view !== 'interaction' && isLoading) {
            return <Spinner message={loadingMessage} />;
        }
        if (error) {
            return (
                <div className="text-center p-8 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg animate-fade-in-up">
                    <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
                    <p>{error}</p>
                     <button onClick={reset} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Try Again</button>
                </div>
            );
        }
        
        if (medicineToCompare && view === 'welcome') {
            return (
                <div className="text-center p-8 text-foreground dark:text-dark-foreground animate-fade-in-up flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-2">Comparing with {medicineToCompare.name}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Search for a second medicine to see the comparison.
                    </p>
                    <div className="mt-8 w-full">
                         <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    </div>
                </div>
            );
        }

        switch (view) {
            case 'medicine':
                return medicineData && <MedicineCard data={medicineData} onCompare={handleStartCompare} />;
            case 'comparison':
                return comparisonData && <ComparisonCard medicine1={comparisonData[0]} medicine2={comparisonData[1]} />;
            case 'prescription':
                return prescriptionData 
                    ? <PrescriptionResult data={prescriptionData} userInfo={userInfo} showConfirmation={true} /> 
                    : <PrescriptionUploader onAnalyze={handlePrescriptionAnalysis} isLoading={isLoading} />;
            case 'interaction':
                return <Chatbot messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isLoading} />;
            case 'symptom':
                return symptomData ? <SymptomResult data={symptomData} /> : <SymptomChecker onAnalyze={handleSymptomAnalysis} isLoading={isLoading} />;
            case 'welcome':
            default:
                return (
                    <div className="text-center p-8 text-foreground dark:text-dark-foreground animate-fade-in-up flex flex-col items-center justify-center">
                        <Logo iconClassName="w-24 h-24 md:w-32 md:h-32" textClassName="text-2xl md:text-3xl" className="mb-6"/>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Your AI-powered assistant for prescription analysis and medicine information. Select a tool below to get started.
                        </p>
                        <div className="mt-8 w-full">
                             <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                        </div>
                    </div>
                );
        }
    };
    
    const tabs: { name: ViewState, label: string, icon: React.ReactNode}[] = [
        { name: 'welcome', label: 'Search', icon: <SearchIcon />},
        { name: 'prescription', label: 'Scan', icon: <PlusIcon />},
        { name: 'interaction', label: 'Interact', icon: <ChatIcon />},
        { name: 'symptom', label: 'Symptoms', icon: <StethoscopeIcon />},
    ];

    return (
        <div className="min-h-screen bg-primary-light dark:bg-dark-background text-foreground dark:text-dark-foreground transition-colors duration-300 flex flex-col">
            <Header theme={theme} toggleTheme={toggleTheme} goHome={reset} />
            
            <main className="container mx-auto p-4 md:p-6 flex-grow flex items-center justify-center">
                 <div className="w-full max-w-4xl">
                    {renderContent()}
                </div>
            </main>

            <nav className="sticky bottom-0 bg-white/80 dark:bg-dark-background/80 backdrop-blur-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div className="container mx-auto flex justify-around">
                    {tabs.map(tab => (
                        <button key={tab.name} onClick={() => handleViewChange(tab.name)}
                         className={`flex flex-col items-center justify-center gap-1 p-3 w-full text-sm font-medium transition-colors ${view === tab.name ? 'text-primary-DEFAULT' : 'text-gray-500 dark:text-gray-400 hover:text-primary-dark dark:hover:text-primary-light'}`}>
                            <div className="w-6 h-6">{tab.icon}</div>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default App;