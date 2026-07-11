import { Component, type ErrorInfo, type ReactNode } from 'react'
import { LifeBuoy, RotateCcw } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useStore } from '@/lib/store'

type Props = { children: ReactNode }
type State = { hasError: boolean }

/**
 * Last line of defense: any render error anywhere in the tree shows a
 * branded "reconnecting" card instead of a white screen or stack trace.
 * Retry resets demo state to the map so a crashing screen can't loop.
 *
 * Deliberately uses no ui/ components — if one of those is what threw,
 * the fallback still renders.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Console only — never surfaced to the user.
    console.error('[landfall] recovered from render error:', error, info)
  }

  handleRetry = () => {
    // Land back on the map with fresh seed state so whatever screen
    // crashed isn't immediately re-entered.
    useStore.getState().resetDemo()
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex h-full items-center justify-center bg-background p-6">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
          <LifeBuoy className="size-10 text-urgency-critical" />
          <p className="text-lg font-bold tracking-tight">{APP_NAME}</p>
          <p className="text-sm text-muted-foreground">
            Something went wrong — reconnecting…
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="size-4" /> Retry
          </button>
        </div>
      </div>
    )
  }
}
