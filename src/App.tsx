/**
 * App.tsx
 * Application router — decides which page to render based on the URL path.
 *
 * Routes:
 *   /          → Landing page (animated hero, "Start" button)
 *   /builder   → Chatbot Flow Builder canvas
 *
 * ReactRouter's BrowserRouter is provided in main.tsx so this component
 * can use hooks like useNavigate and useLocation.
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Landing from './pages/Landing';
import Builder from './pages/Builder';

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing page — entry point */}
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Landing />
          </motion.div>
        } />

        {/* Flow builder canvas */}
        <Route path="/builder" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Builder />
          </motion.div>
        } />

        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
