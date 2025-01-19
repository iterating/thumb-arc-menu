import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { text: 'Home', icon: 'home' },
    { text: 'Search', icon: 'search' },
    { text: 'Add', icon: 'add' },
    { text: 'Like', icon: 'favorite' },
    { text: 'Profile', icon: 'person' }
  ];

  return (
    <div className="app-container">
      <div className="content-area">
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
