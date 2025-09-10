import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log eventueel naar externe service
		console.error("[ErrorBoundary]", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 32, color: 'red', background: '#fff' }}>
					<h1>Er is een fout opgetreden</h1>
					<pre>{this.state.error?.message}</pre>
				</div>
			);
		}
		return this.props.children;
	}
}
