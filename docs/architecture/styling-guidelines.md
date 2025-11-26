# Styling Guidelines

## Styling Approach

[cite\_start]We will use **Tailwind CSS**[cite: 1, 938]. All styling should be done with utility classes directly in the `tsx` files. Avoid writing custom CSS files.

## Global Theme Variables

The theme is configured in `tailwind.config.js` and `index.css`. [cite\_start]This is where we will implement the colors from Sally's UI/UX spec[cite: 1, 707].

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#005A9C',
        'recommend': '#0F7512',
        'danger': '#D91E18',
        'light-gray': '#F5F5F5',
        'medium-gray': '#E0E0E0',
        'dark-gray': '#212121',
      }
    },
  },
  plugins: [],
}
```

```css
/* /src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```
