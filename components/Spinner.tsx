
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Analyzing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-16 h-16 border-4 border-primary-dark border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-foreground dark:text-dark-foreground">{message}</p>
    </div>
  );
};

export default Spinner;
