import Navbar from "./components/Navbar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
    </>
  );
}
