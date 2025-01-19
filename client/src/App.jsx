import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentTheme, setCurrentTheme] = useState('material');

  const themes = [
    { text: 'Material', value: 'material' },
    { text: 'Bootstrap', value: 'bootstrap' },
    { text: 'Fabric', value: 'fabric' },
    { text: 'High Contrast', value: 'highcontrast' },
    { text: 'Tailwind', value: 'tailwind' }
  ];

  const navItems = [
    { text: 'Home', icon: 'home' },
    { text: 'Search', icon: 'search' },
    { text: 'Add', icon: 'add' },
    { text: 'Like', icon: 'favorite' },
    { text: 'Profile', icon: 'person' }
  ];

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setCurrentTheme(newTheme);
    
    // Remove existing theme
    document.body.classList.forEach(className => {
      if (className.startsWith('e-')) {
        document.body.classList.remove(className);
      }
    });
    
    // Add new theme
    document.body.classList.add(`e-${newTheme}`);
  };

  // Initialize theme on mount
  useEffect(() => {
    document.body.classList.add(`e-${currentTheme}`);
  }, []);

  return (
    <div className={`app-container theme-${currentTheme}`}>
      <div className="content-area">
        <div className="theme-selector">
          <select 
            value={currentTheme}
            onChange={handleThemeChange}
            className="theme-select"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.text}
              </option>
            ))}
          </select>
        </div>
        <h1>Content Area</h1>
      </div>
      
      <div className="bottom-nav">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`nav-button ${activeTab === item.text.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(item.text.toLowerCase())}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
