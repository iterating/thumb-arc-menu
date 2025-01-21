# How to Add and Display New Fields in Kanban Cards

## Adding a New Field

1. First, add the field to your card data in `constants.js`:
```javascript
// Example: Adding a "Category" field
data: [
  {
    Id: 1,
    Title: 'Travel the world',
    Status: 'Dreams',
    Summary: 'Visit at least 10 countries in 5 years',
    Category: 'Adventure'  // New field
  },
  // ... other cards
]
```

## Displaying the Field in the Template

1. Locate the card template in `KanbanBoard.jsx`:
```javascript
const cardTemplate = (props) => {
  // Add your new field where you want it to appear
  // Example: Adding Category between Title and Summary
  return (
    <div className="card-template">
      <div className="e-card-content">
        <div className="card-header">
          <h3>{props.Title || 'Untitled'}</h3>
          {props.Priority && (
            <span className={`priority-tag ${props.Priority.toLowerCase()}`}>
              {props.Priority}
            </span>
          )}
        </div>
        {props.Category && (  // New field display
          <div className="card-category">
            {props.Category}
          </div>
        )}
        <div className="card-body">
          {props.Summary}
        </div>
      </div>
    </div>
  );
};
```

2. Add CSS for your new field in `KanbanBoard.css`:
```css
.card-category {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    /* Add any other styling you need */
}
```

## Best Practices

1. Always add null checks (`&&`) for optional fields
2. Follow the existing naming conventions
3. Keep the styling consistent with other card elements
4. Consider the card's layout and spacing when adding new fields

## Example: Adding Different Field Types

- Text field: Just display the value directly
- Date field: Consider formatting it (e.g., `new Date(props.Date).toLocaleDateString()`)
- Tags: Map through array and display each tag
- Status/Priority: Use color-coded spans like the priority tag
- Links: Wrap in an anchor tag
- Numbers: Consider formatting (e.g., currency, percentages)
