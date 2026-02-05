import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    і
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="content">
          <div className="emptyCenter">
            <div className="emptyCard">
              <h2>Ой… щось зламалось 🙈</h2>
              <p className="muted">
                {this.state.error?.message || "Невідома помилка"}
              </p>
              <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                Відкрий консоль (F12 → Console) і скинь сюди перший червоний error — я доб’ю до ідеалу.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
