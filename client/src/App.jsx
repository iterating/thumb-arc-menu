import { useState } from 'react'
import { AppBarComponent } from '@syncfusion/ej2-react-navigations'
import { BadgeComponent } from '@syncfusion/ej2-react-notifications'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons'
import './App.css'

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [startPoint, setStartPoint] = useState(null)

  const onDragStart = (args) => {
    setStartPoint({
      x: args.originalEvent.clientX,
      y: args.originalEvent.clientY
    })
    
    const { velocityX, velocityY } = args
    if (Math.abs(velocityX) > 0 || Math.abs(velocityY) > 0) {
      setIsDragging(true)
    }
  }
  
  const onDrag = (args) => {
    if (isDragging) {
      // Handle rainbow menu updates
      console.log('Dragging', args)
    }
  }
  
  const onDragStop = () => {
    setIsDragging(false)
  }

  return (
    <div className="app">
      <AppBarComponent
        colorMode="Primary"
        allowDragging={true}
        drag={onDrag}
        dragStart={onDragStart}
        dragStop={onDragStop}
        touchThreshold={10}
      >
        <BadgeComponent content="3">
          <ButtonComponent iconCss="e-icons e-phone">📱</ButtonComponent>
        </BadgeComponent>
        <BadgeComponent content="1">
          <ButtonComponent iconCss="e-icons e-location">📍</ButtonComponent>
        </BadgeComponent>
        <ButtonComponent iconCss="e-icons e-camera">📷</ButtonComponent>
        <ButtonComponent iconCss="e-icons e-settings">⚙️</ButtonComponent>
        <ButtonComponent iconCss="e-icons e-add">➕</ButtonComponent>
      </AppBarComponent>
    </div>
  )
}

export default App
