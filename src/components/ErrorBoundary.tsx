import React from 'react';

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: String(err?.message ?? err) };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-5">
          <div className="card card-pad">
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 whitespace-pre-wrap">
              {this.state.message || 'Unknown error'}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
