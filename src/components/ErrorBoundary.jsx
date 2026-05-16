import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 560,
            margin: '40px auto',
            color: '#fecaca',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ color: '#f0fdfa', fontSize: '1.25rem' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', marginTop: 12 }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            type="button"
            style={{
              marginTop: 16,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(248,113,113,0.4)',
              background: 'rgba(127,29,29,0.3)',
              color: '#fecaca',
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
