import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    const { hasError } = (this as any).state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-brand-900 mb-2">Oops!</h2>
            <p className="text-brand-600 mb-6">Something went wrong. Please try again.</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
