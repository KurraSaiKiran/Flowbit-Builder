/**
 * Landing.tsx
 * Landing page for the Chatbot Flow Builder.
 *
 * Displays the animated BackgroundPaths hero with:
 *   - "FlowBot Builder" as the animated headline
 *   - A "Start Building" CTA button that navigates to the flow builder
 *
 * React Router's useNavigate handles the navigation — no page reload.
 */
import { useNavigate } from "react-router-dom";
import { BackgroundPaths } from "@/components/ui/background-paths";

const Landing = () => {
  // useNavigate returns a function that programmatically changes the route.
  const navigate = useNavigate();

  /**
   * handleStart
   * Called when the user clicks the "Start" button.
   * Navigates to /builder — the Chatbot Flow Builder canvas.
   */
  const handleStart = () => {
    navigate("/builder");
  };

  return (
    <BackgroundPaths
      title="FlowBot Builder"
      buttonLabel="Start"
      onAction={handleStart}
    />
  );
};

export default Landing;
