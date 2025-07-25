import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Health Buddy Icon"
    >
        {/* Body */}
        <path d="M8 28C8 26.8954 8.89543 26 10 26H38C39.1046 26 40 26.8954 40 28V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V28Z" className="fill-[#0A2540] dark:fill-dark-foreground"/>
        
        {/* Heart */}
        <path d="M24 38.6L22.2 37.04C18.4 33.76 16 31.6 16 28.8C16 26.728 17.728 25 19.8 25C21.44 25 23 26 24 27.4C25 26 26.56 25 28.2 25C30.272 25 32 26.728 32 28.8C32 31.6 29.6 33.76 25.8 37.04L24 38.6Z" className="fill-[#60B4D5]"/>

        {/* Head */}
        <path d="M11 10C11 8.89543 11.8954 8 13 8H35C36.1046 8 37 8.89543 37 10V26H11V10Z" className="fill-[#0A2540] dark:fill-dark-foreground"/>
        
        {/* Eyes */}
        <circle cx="19" cy="17" r="3" className="fill-[#00A3BF]"/>
        <circle cx="29" cy="17" r="3" className="fill-[#00A3BF]"/>
        
        {/* Pupils */}
        <circle cx="19" cy="17" r="1.2" className="fill-white dark:fill-dark-surface"/>
        <circle cx="29" cy="17" r="1.2" className="fill-white dark:fill-dark-surface"/>
    </svg>
);


export const Logo: React.FC<{ className?: string; textClassName?: string; iconClassName?: string; }> = ({ className, textClassName, iconClassName }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`} aria-label="GenAI Health Buddy Logo">
            <LogoIcon className={iconClassName} />
            <div className={`flex flex-col leading-tight ${textClassName}`}>
                <span className="font-bold text-[#0A2540] dark:text-primary-light">GenAI</span>
                <span className="font-bold text-[#00A3BF] dark:text-secondary">Health Buddy</span>
            </div>
        </div>
    );
};
