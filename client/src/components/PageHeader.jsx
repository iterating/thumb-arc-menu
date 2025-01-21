import React from 'react';
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-splitbuttons/styles/material.css';
import './PageHeader.css';

function PageHeader({ children }) {
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
            iconCss="e-icons e-menu"
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
