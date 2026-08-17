'use client';

import { SessionEvent } from '@/shared/types';
import React, { useState } from 'react';
import { RiCommandLine, RiDeleteBinLine, RiFileCopyLine, RiSendPlaneLine, RiTerminalBoxLine } from 'react-icons/ri';

interface TerminalReplayProps {
  initialEvent?: SessionEvent;
}

export const TerminalReplay: React.FC<TerminalReplayProps> = ({ initialEvent }) => {
  const [history, setHistory] = useState<Array<{ command: string; output: string; delayMs?: number }>>([
    {
      command: 'ssh root@127.0.0.1 -p 2222',
      output: 'CipherNest SSH Honeypot Node v2.4 (Ubuntu 24.04 LTS)\nAuthentication successful. Type "help" or Linux commands.',
    },
    ...(initialEvent?.commands.map((c) => ({
      command: c.command,
      output: c.output,
      delayMs: c.executionDelayMs,
    })) || []),
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLogs = () => {
    const text = history.map((h) => `$ ${h.command}\n${h.output}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearTerminal = () => {
    setHistory([
      {
        command: 'clear',
        output: 'Terminal session cleared.',
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden flex flex-col h-[480px] font-sans shadow-md">
      {}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <RiTerminalBoxLine className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Interactive Decoy Terminal Shell</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLogs}
              title="Copy Terminal Output"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors flex items-center gap-1 font-mono cursor-pointer"
            >
              <RiFileCopyLine className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleClearTerminal}
              title="Clear Terminal Log"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors flex items-center gap-1 font-mono cursor-pointer"
            >
              <RiDeleteBinLine className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 bg-slate-900">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="text-emerald-400">root@cipher-decoy:~#</span>
              <span className="text-slate-100 font-semibold">{item.command}</span>
              {item.delayMs && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 ml-auto">
                  +{item.delayMs}ms jitter
                </span>
              )}
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed pl-3 border-l border-slate-800">
              {item.output}
            </pre>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-indigo-400 animate-pulse font-mono text-xs">
            <RiCommandLine className="w-4 h-4 animate-spin" />
            <span>Ollama counter-LLM synthesizing authentic response...</span>
          </div>
        )}
      </div>

      {}
      <form onSubmit={handleRunCommand} className="bg-slate-950 p-2.5 border-t border-slate-800 flex items-center gap-2">
        <span className="font-mono text-xs text-emerald-400 pl-2 select-none">root@cipher-decoy:~#</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          placeholder="Type an SSH command (e.g. ls -la, cat /etc/passwd, uname -a)..."
          className="flex-1 bg-transparent font-mono text-xs text-slate-100 focus:outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors font-semibold"
        >
          <RiSendPlaneLine className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};


