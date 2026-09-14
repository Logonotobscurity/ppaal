/**
 * PAL — Meaning-to-Action Intelligence
 * Root Application Component
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-ivory text-charcoal">
        <header className="border-b border-charcoal/10">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-semibold tracking-tight">PAL</h1>
            <p className="text-sm text-charcoal/60">Meaning-to-Action Intelligence</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold mb-4">
              Welcome to PAL
            </h2>
            <p className="text-lg text-charcoal/70 mb-6">
              Voice-first AI operating system for African commerce.
              Transform code-switched speech into structured business state.
            </p>

            <div className="grid gap-4 md:grid-cols-2 mt-8">
              <div className="p-6 rounded-2xl border border-charcoal/10 bg-white/50">
                <h3 className="font-medium mb-2">ASK 🔍</h3>
                <p className="text-sm text-charcoal/60">
                  Read from memory with cited answers. Bypasses Gs gate.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-charcoal/10 bg-white/50">
                <h3 className="font-medium mb-2">LEARN 🧠</h3>
                <p className="text-sm text-charcoal/60">
                  Write to memory. Unblockable, always succeeds.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-charcoal/10 bg-white/50 md:col-span-2">
                <h3 className="font-medium mb-2">DO ⚡</h3>
                <p className="text-sm text-charcoal/60">
                  Execute actions. Gated by Gs score + approval when Gs ≥ 3.0
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
