import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-splitbuttons/styles/material.css';
import './PageHeader.css';

function PageHeader({ children }) {
  const navigate = useNavigate();

  const handleMenuSelect = (args) => {
    switch (args.item.id) {
      case 'settings':
        navigate('/settings');
        break;
      case 'dashboard':
        navigate('/');
        break;
      case 'profile':
        navigate('/profile');
        break;
      // Add other cases as needed
    }
  };

  return (
    <div className="page-header">
      <div className="header-container">
        <div className="header-left">
          <DropDownButtonComponent
            items={[
              { text: 'Dashboard', id: 'dashboard' },
              { text: 'Profile', id: 'profile' },
              { separator: true },
              { text: 'Settings', id: 'settings' },
              { text: 'Help', id: 'help' },
              { separator: true },
              { text: 'Logout', id: 'logout' }
            ]}
            cssClass="hamburger-menu"
            iconCss="e-icons e-menu-icon"
            select={handleMenuSelect}
          />
        </div>
        <div className="header-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
