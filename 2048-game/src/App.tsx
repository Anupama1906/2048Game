// src/App.tsx
import Target2048App from './Target2048';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Target2048App />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;