import { useEffect, useRef, useState } from 'react';

const SearchBar = ({ onSearch, value = '', placeholder = 'Search BlogSpace...' }) => {
  const [inputValue, setInputValue] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="search-posts" className="visually-hidden">
        Search
      </label>
      <input
        id="search-posts"
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="premium-input"
      />
      <button type="submit" className="btn btn--secondary">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
