import React from 'react';
import PageHeader from '../components/PageHeader';
import './Settings.css';

function Settings({ currentTheme, onThemeChange, themes }) {
  return (
    <div className="settings-page">
      <PageHeader>Settings</PageHeader>
      <div className="settings-content">
        <div className="settings-section">
          <h2>Theme</h2>
          <div className="setting-item">
            <label>Select Theme:</label>
            <select 
              value={currentTheme}
              onChange={onThemeChange}
              className="theme-select"
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.text}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
