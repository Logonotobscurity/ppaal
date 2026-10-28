import { useState } from 'react';
import { CommandOrb } from '@/components/voice/CommandOrb';
import { LiveSession } from '@/components/voice/LiveSession';
import { SpeechPanel } from '@/components/workspace/SpeechPanel';
import { MeaningPanel } from '@/components/workspace/MeaningPanel';
import { ActionPanel } from '@/components/workspace/ActionPanel';
import { BenchmarkDashboard } from '@/components/intelligence/BenchmarkDashboard';
import { ActivityAuditTrail } from '@/components/intelligence/ActivityAuditTrail';
import { useWorkspaceStore, type PalMode } from '@/stores/workspace-store';

/**
 * @component AppShell
 * @description Main application shell with mode switcher and screen routing.
 *              Desktop: persistent sidebar + 3-column workspace canvas.
 *              Mobile: bottom tab bar (safe-area aware).
 */

type Screen = 'command' | 'workspace' | 'approvals' | 'intelligence' | 'activity';

const NAV: Array<{ id: Screen; label: string }> = [
  { id: 'command', label: 'Command' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'activity', label: 'Activity' },
];

const MODES: Array<{ id: PalMode; label: string; hint: string }> = [
  { id: 'ask', label: 'ASK 🔍', hint: 'Read from memory — cited answers' },
  { id: 'learn', label: 'LEARN 🧠', hint: 'Write to memory — always succeeds' },
  { id: 'do', label: 'DO ⚡', hint: 'Execute actions — gated by Gs + approval' },
];

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('command');
  const mode = useWorkspaceStore((s) => s.mode);
  const setMode = useWorkspaceStore((s) => s.setMode);
  // Presentational props for the workspace panels — populated by the
  // meaning pipeline / executor when wired to live data.
  const entities: React.ComponentProps<typeof MeaningPanel>['entities'] = [];
  const nodes: React.ComponentProps<typeof ActionPanel>['nodes'] = [];

  return (
    <div className="flex min-h-screen bg-ivory text-charcoal">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-56 shrink-0 border-r border-charcoal/10 p-4 md:block">
        <h1 className="text-xl font-semibold tracking-tight">PAL</h1>
        <p className="mb-6 text-xs text-charcoal/50">Meaning-to-Action Intelligence</p>
        <nav aria-label="Primary" className="space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScreen(item.id)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                screen === item.id
                  ? 'bg-violet/10 font-medium text-violet'
                  : 'text-charcoal/70 hover:bg-charcoal/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">
        {/* Mode switcher */}
        <div className="border-b border-charcoal/10 px-6 py-3">
          <div role="tablist" aria-label="PAL modes" className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                title={m.hint}
                onClick={() => setMode(m.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  mode === m.id
                    ? 'border-violet bg-violet text-white'
                    : 'border-charcoal/15 text-charcoal/70 hover:border-violet/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <section className="px-6 py-8">
          {screen === 'command' && (
            <div className="flex flex-col items-center gap-8 pt-10">
              <CommandOrb />
              <LiveSession />
            </div>
          )}

          {screen === 'workspace' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <SpeechPanel />
              <MeaningPanel entities={entities} />
              <ActionPanel nodes={nodes} />
            </div>
          )}

          {screen === 'approvals' && (
            <div className="max-w-3xl">
              <h2 className="mb-4 text-lg font-semibold">Approval Queue</h2>
              <ActionPanel nodes={nodes} />
            </div>
          )}

          {screen === 'intelligence' && <BenchmarkDashboard />}

          {screen === 'activity' && <ActivityAuditTrail />}
        </section>
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-charcoal/10 bg-white/90 px-2 py-2 backdrop-blur md:hidden"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setScreen(item.id)}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              screen === item.id ? 'font-semibold text-violet' : 'text-charcoal/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
