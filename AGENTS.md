# AGENTS.md - Coding Guidelines for Valentine Strands Game

## Project Overview
A React-based Strands word puzzle game built with Vite. Features drag-to-select gameplay, animated intro, and pastel pink theme.

## Build & Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Code Style Guidelines

### JavaScript/React
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings
- **Indentation**: 2 spaces
- **Functions**: Use arrow functions for callbacks, regular functions for components
- **Components**: PascalCase (e.g., `StrandsGame`)
- **Variables**: camelCase (e.g., `selectedCells`)
- **Constants**: UPPER_SNAKE_CASE at module level (e.g., `THEME_WORDS`)
- **Imports**: Group React imports first, then CSS, then components
  ```javascript
  import { useState, useEffect } from 'react';
  import './App.css';
  import Component from './Component';
  ```
- **Export**: Use `export default` for components
- **Hooks**: Destructure hooks from 'react', not React.useState
- **Event Handlers**: Prefix with `handle` (e.g., `handleCellClick`)

### CSS
- **Naming**: Use kebab-case for class names
- **Structure**: Component-specific styles in `App.css`, global in `index.css`
- **Units**: Use `rem` for font sizes, `px` for fixed dimensions
- **Colors**: Use hex codes (e.g., `#FFDEE3`)
- **Flex/Grid**: Prefer CSS Grid for layouts, Flexbox for alignment

### File Organization
- Components: `src/ComponentName.jsx`
- Styles: `src/App.css` for component styles
- Assets: `public/` for static files
- One component per file

## React Patterns

### State Management
- Use `useState` for local component state
- Use `useCallback` for event handlers passed to children
- Use `useEffect` for side effects with proper cleanup
- Use `useRef` for DOM references and persistent values

### Component Structure
```javascript
export default function ComponentName() {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Refs
  const ref = useRef(null);
  
  // Effects
  useEffect(() => {
    // logic
    return () => cleanup();
  }, [dependencies]);
  
  // Handlers
  const handleEvent = useCallback(() => {
    // logic
  }, [dependencies]);
  
  // Render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}
```

### Performance
- Memoize callbacks with `useCallback`
- Clean up timers/animations in `useEffect` return
- Avoid inline function definitions in render

## Error Handling
- Check for null/undefined before accessing object properties
- Use optional chaining sparingly
- Validate user inputs before processing
- Provide fallbacks for dynamic content

## Git Commit Messages
Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `style:` for formatting changes
- `refactor:` for code restructuring

Example: `feat: add animated intro sequence with envelope emoji`

## Accessibility
- Use semantic HTML elements
- Include proper ARIA labels for interactive elements
- Ensure color contrast meets WCAG guidelines
- Support keyboard navigation

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile touch support required
- Use `-webkit-` and `-moz-` prefixes for CSS properties as needed

## Testing

### Running Tests
```bash
# Run all tests (when test framework is added)
npm test

# Run a single test file
npm test -- ComponentName.test.jsx

# Run tests in watch mode
npm test -- --watch
```

Note: This project currently does not have a test framework configured. Consider adding Vitest or Jest for testing.

## Dependencies

### Core
- React 19.2.0
- React DOM 19.2.0
- Vite 7.3.1

### Linting
- ESLint 9.39.1
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh

### Adding New Dependencies
```bash
npm install <package>
```

For dev dependencies:
```bash
npm install -D <package>
```

## CSS Animation Guidelines

### Performance
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly on elements that will animate

### Timing
- Keep animations under 500ms for micro-interactions
- Use 2-4 seconds for intro/loading animations
- Prefer `ease-out` for enter animations, `ease-in` for exit

### Accessibility
- Respect `prefers-reduced-motion` media query
- Provide fallback static states

## Notes
- Grid is 8x6 letters for Strands game
- Words must be selected by dragging adjacent letters
- Theme words highlight in blue (#87CEEB), spangram in yellow (#FFD700)
- Intro animation uses pastel pink (#FFDEE3) and pink (#FFBBC1) accents
- Font: Roboto from Google Fonts
- Touch and mouse drag events both supported
