import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public declare props: Props;
  public declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught component error gracefully:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0c0c0e] text-white flex flex-col items-center justify-center p-6 text-center font-cairo">
          <div className="max-w-md w-full bg-[#18181b] border border-[#c5a059]/30 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <h1 className="font-display text-3xl font-bold tracking-wider text-[#c5a059] mb-3">
              TOUZA
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              جاري مزامنة بيانات المتجر، يرجى إعادة تنشيط الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#c5a059] hover:bg-[#b38e47] text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
