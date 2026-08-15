'use client';

import { SessionEvent } from '@/shared/types';
import React, { useState } from 'react';
import { RiCommandLine, RiSendPlaneLine, RiTerminalBoxLine } from 'react-icons/ri';

interface TerminalReplayProps {
  initialEvent?: SessionEvent;
}

export const TerminalReplay: React.FC<TerminalReplayProps> = ({ initialEvent }) => {
  const [history, setHistory] = useState<Array<{ command: string; output: string; delayMs?: number }>>([
    {
      command: 'ssh root@127.0.0.1 -p 2222',
      output: 'CipherNest SSH Honeypot Node v2.0 (Ubuntu 24.04 LTS)\nAuthentication successful. Type "help" or Linux commands.',
    },
    ...(initialEvent?.commands.map((c) => ({
      command: c.command,
      output: c.output,
      delayMs: c.executionDelayMs,
    })) || []),
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim() || loading) return;

    const cmd = inputCommand.trim();
    setInputCommand('');
    setLoading(true);

    try {
      const priorCmds = history.map((h) => h.command);
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, history: priorCmds }),
      });

      if (res.ok) {
        const data = await res.json() as { output: string; delayMs: number };
        setHistory((prev) => [...prev, { command: cmd, output: data.output, delayMs: data.delayMs }]);
      } else {
        setHistory((prev) => [...prev, { command: cmd, output: `bash: ${cmd}: command executed` }]);
      }
    } catch {
      setHistory((prev) => [...prev, { command: cmd, output: `bash: ${cmd}: fallback execution` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden flex flex-col h-[480px]">
      {/* Terminal Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <RiTerminalBoxLine className="w-4 h-4 text-emerald-400" />
          <span>Interactive Counter-LLM Shell Simulator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 bg-slate-950/90">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <span>root@cipher-decoy:~#</span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
              {item.delayMs && (
                <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50 ml-auto">
                  +${item.delayMs}ms jitter
                </span>
              )}
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed pl-4 border-l-2 border-slate-800">
              {item.output}
            </pre>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse font-mono">
            <RiCommandLine className="w-4 h-4 animate-spin" />
            <span>Ollama counter-LLM calculating authentic response...</span>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleRunCommand} className="bg-slate-950 p-2 border-t border-slate-800/80 flex items-center gap-2">
        <span className="font-mono text-xs text-emerald-400 pl-2">root@cipher-decoy:~#</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="Type an SSH command (e.g. ls, uname -a, cat /etc/passwd)..."
          className="flex-1 bg-transparent font-mono text-xs text-slate-100 focus:outline-none placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs flex items-center gap-1 cursor-pointer transition-all"
        >
          <RiSendPlaneLine className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
