import { Component } from "react";
import ErrorPage from "../pages/ErrorPage.jsx";

/**
 * Catches uncaught render errors anywhere below it so a bug in one
 * developer's screen shows a fallback page instead of a blank app.
 * Wraps <AppRoutes /> in App.jsx.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage code="generic" />;
    }
    return this.props.children;
  }
}
