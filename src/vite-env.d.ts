/// <reference types="vite/client" />

// Declare CSS Module type so TypeScript recognises *.module.css imports.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Declare plain CSS imports (e.g. reactflow/dist/style.css).
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
