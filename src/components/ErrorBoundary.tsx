import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state and props to satisfy TypeScript compiler
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error inside React tree:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-coral-50 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white border border-coral-200 shadow-xl rounded-2xl p-8 max-w-md w-full space-y-5">
            <div className="bg-red-50 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-red-100 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-coral-950">Aplikasi Mengalami Kendala</h2>
              <p className="text-xs text-coral-500 leading-relaxed">
                Terjadi kesalahan sistem yang tidak terduga pada halaman ini. Silakan coba muat
                ulang halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-coral-50/50 border border-coral-100 rounded-xl p-3 text-left max-h-40 overflow-y-auto font-mono text-[10px] text-coral-700 leading-normal">
                <strong>Error:</strong> {this.state.error.message}
                <pre className="mt-1 opacity-80 overflow-x-auto">{this.state.error.stack}</pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-800 hover:bg-coral-900 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang</span>
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-coral-100 hover:bg-coral-200 text-coral-800 rounded-xl text-xs font-bold transition-all border border-coral-200/50"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
