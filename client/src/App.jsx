import { useState } from 'react';
import { ToolbarComponent } from '@syncfusion/ej2-react-navigations';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { text: 'Home', icon: 'e-icons e-home' },
    { text: 'Search', icon: 'e-icons e-search' },
    { text: 'Add', icon: 'e-icons e-plus' },
    { text: 'Favorites', icon: 'e-icons e-star' },
    { text: 'Profile', icon: 'e-icons e-user' }
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
            <i className={item.icon}></i>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
