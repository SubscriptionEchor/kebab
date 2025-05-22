import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
console.log('CommonHeader component loaded');

const Header = ({ languages }: any) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  // Set up available language options (or use passed prop)
  const languageOptions = languages || [
    { code: 'en', label: t('language.english') },
    { code: 'tr', label: t('language.turkish') },
    { code: 'de', label: t('language.german') },
     { code: 'hi', label: t('language.hindi') }
    // Add more languages as needed
  ];
  // Initialize the selected language from localStorage (or i18n.language) if available
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const storedLang = localStorage.getItem('selectedLanguage');
    return storedLang || i18n.language || languageOptions[0].code;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);


  // Toggle the dropdown open/closed
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // When a language is selected, update state, store in localStorage, and change i18n language
  const handleLanguageSelect = (langCode) => {
    // window.location.reload();
    setSelectedLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    i18n.changeLanguage(langCode);
    setIsDropdownOpen(false);
    
  };

  // 3. Close the dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Determine the label of the selected language
  const currentLanguageLabel =
    languageOptions.find((lang) => lang.code === selectedLanguage)?.label ||
    'Select Language';

  // Inline SVGs for the up and down arrows
  const arrowDown = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const arrowUp = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 14l-5-5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Choose which arrow to show based on dropdown state
  const arrowIcon = isDropdownOpen ? arrowUp : arrowDown;

  return (
    <header
      style={{
        padding: '10px',
        marginBottom: '5px',
        marginTop: '- 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className="logo">

      </div>
      <div
        className="language-dropdown"
        ref={dropdownRef}
        style={{ position: 'relative' }}
      >
        <button
          onClick={handleDropdownToggle}
          style={{
            padding: '5px 10px',
            cursor: 'pointer',
            border: '1px solid #ccc', // Added border
            borderRadius: '4px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px', // adds space between label & arrow

          }}
        >
          <span>{currentLanguageLabel}</span>
          {arrowIcon}
        </button>
        {isDropdownOpen && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '5px',
              position: 'absolute',
              top: '100%',
              right: 0,
              background: '#fff',
              border: '1px solid #ccc',
              zIndex: 1000,
            }}
          >
            {languageOptions.map((lang, index) => (
              <li
                key={index}
                onClick={() => handleLanguageSelect(lang.code)}
                style={{
                  padding: '5px',
                  cursor: 'pointer',
                  background:
                    lang.code === selectedLanguage ? '#eaeaea' : 'transparent',
                }}
              >
                {lang.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;
