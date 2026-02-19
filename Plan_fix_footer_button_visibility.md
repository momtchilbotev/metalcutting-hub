# Fix: Modernize Footer Buttons and Fix Visibility

## Context

The footer component (`src/scripts/components/Footer.js`) contains a subscription form with a button that is not visible or lacks proper styling. The footer uses a dark background (`bg-dark`) but the button styling relies only on Bootstrap's default `btn-primary` class without any footer-specific custom styles. This can cause visibility and contrast issues.

## Implementation Plan

### Files to Modify

1. **`src/styles/main.css`** - Add footer button styling (after line 273)

### Changes

#### 1. Add Footer Button Styles (`src/styles/main.css`)

After the existing footer styles (around line 273), add:

```css
/* === Footer Buttons === */
footer .btn {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
  padding: 0.5rem 1.25rem;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

footer .btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #0a58ca 100%);
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

footer .btn-primary:hover {
  background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%);
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
  transform: translateY(-2px);
}

footer .btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(13, 110, 253, 0.3);
}

/* Footer form input styling */
footer .form-control {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

footer .form-control:focus {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  color: #fff;
}

footer .form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
```

### Key Improvements

1. **Visibility**: High contrast button with gradient background
2. **Modern Look**:
   - Gradient background instead of flat color
   - Subtle box-shadow for depth
   - Hover animation (lift effect)
   - Uppercase text with letter-spacing
3. **Better UX**:
   - Enhanced form input styling with semi-transparent backgrounds
   - Proper placeholder text color for readability
   - Smooth transitions

### Verification

1. Build the project: `npm run build`
2. Start the dev server: `npm run dev`
3. Navigate to any page that displays the footer
4. Verify:
   - The subscription button is clearly visible with blue gradient
   - Hover effect works smoothly (button lifts up)
   - Email input has proper contrast with visible placeholder text
   - The button has modern appearance with shadows
