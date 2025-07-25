import React, { useState, useRef } from 'react';
import { PlusIcon } from './Icons';

interface UserInfo {
    name: string;
    phone: string;
}

interface PrescriptionUploaderProps {
    onAnalyze: (file: File, userInfo: UserInfo) => void;
    isLoading: boolean;
}

const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({ onAnalyze, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', phone: '' });
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
             if (error && error.includes("image")) {
                setError(null);
            }
        }
    };

    const handleUserInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
        if (error && (error.includes("name") || error.includes("number"))) {
            setError(null);
        }
    };

    const handleAnalyzeClick = () => {
        if (!userInfo.name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!userInfo.phone.trim()) {
            setError("Please enter your WhatsApp number.");
            return;
        }
        if (!file) {
            setError("Please select a prescription image.");
            return;
        }
        setError(null);
        onAnalyze(file, userInfo);
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-4">Analyze a Prescription</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Upload an image of your prescription and enter your details to get a digital summary.</p>
            
            <div className="space-y-4">
                 <input 
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleUserInfoChange}
                    placeholder="Your Name"
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-dark-border rounded-lg bg-primary-light dark:bg-dark-surface text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent outline-none"
                    disabled={isLoading}
                    aria-label="Your Name"
                />
                 <input 
                    type="tel"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleUserInfoChange}
                    placeholder="Your WhatsApp Number (e.g., +1234567890)"
                    className="w-full p-4 text-lg border-2 border-gray-200 dark:border-dark-border rounded-lg bg-primary-light dark:bg-dark-surface text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent outline-none"
                    disabled={isLoading}
                    aria-label="Your WhatsApp Number"
                />
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="mt-4 w-full p-8 border-4 border-dashed border-gray-300 dark:border-dark-border rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:border-primary-DEFAULT transition-all duration-300 flex flex-col items-center justify-center space-y-3"
            >
                <PlusIcon className="w-12 h-12" />
                <span className="font-semibold text-lg">{file ? `Selected: ${file.name}` : 'Click to Upload Image'}</span>
                <span className="text-sm">PNG, JPG, or WEBP accepted</span>
            </button>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button 
                onClick={handleAnalyzeClick} 
                disabled={isLoading || !file || !userInfo.name || !userInfo.phone} 
                className="mt-6 w-full p-4 bg-secondary-DEFAULT text-white rounded-lg font-bold text-lg hover:bg-secondary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Prescription'}
            </button>
        </div>
    );
};

export default PrescriptionUploader;