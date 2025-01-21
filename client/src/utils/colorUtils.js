export const cssVarToHex = (cssVar) => {
  if (!cssVar?.startsWith('var(')) return cssVar;
  
  const el = document.createElement('div');
  document.body.appendChild(el);
  el.style.color = cssVar;
  const color = window.getComputedStyle(el).color;
  document.body.removeChild(el);
  
  // Convert rgb(r, g, b) to hex
  const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
};
