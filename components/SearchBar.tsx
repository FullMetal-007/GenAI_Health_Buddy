
import React from 'react';
import { SearchIcon } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="search"
        name="search"
        placeholder="Search for a medicine (e.g., Dolo 650)..."
        className="w-full p-4 pl-12 text-lg border-2 border-gray-200 dark:border-dark-border rounded-full bg-primary-light dark:bg-dark-surface text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent outline-none transition-shadow"
        disabled={isLoading}
      />
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="w-6 h-6 text-gray-400" />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="absolute inset-y-0 right-0 m-2 px-6 py-2 bg-primary-DEFAULT text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;