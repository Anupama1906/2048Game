import Target2048App from './Target2048';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Target2048App />
    </ErrorBoundary>
  );
}

export default App;