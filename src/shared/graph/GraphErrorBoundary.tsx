import { Component, type ReactNode } from 'react';
export default class GraphErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">
        The interactive explorer could not load. Close it to use the diagram and
        relationship list.
      </p>
    ) : (
      this.props.children
    );
  }
}
