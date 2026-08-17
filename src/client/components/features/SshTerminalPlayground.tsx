'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import React, { useEffect, useRef, useState } from 'react';
import {
  RiCpuLine,
  RiFingerprintLine,
  RiPlayFill,
  RiTerminalBoxLine,
  RiTimeLine
} from 'react-icons/ri';

interface TerminalHistoryEntry {
  command: string;
  output: string;
  delayMs: number;
  dnaFingerprint: string;
  timestamp: string;
}

interface SshTerminalPlaygroundProps {
  onCommandExecuted?: () => void;
}

export const SshTerminalPlayground: React.FC<SshTerminalPlaygroundProps> = ({ onCommandExecuted }) => {
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([
    {
      command: 'cat /etc/passwd',
      output: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:admin:/home/admin:/bin/bash\npostgres:x:105:111:PostgreSQL server:/var/lib/postgresql:/bin/bash',
      delayMs: 340,
      dnaFingerprint: 'DNA: 7F-A2-91',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputCommand, setInputCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [lastDna, setLastDna] = useState('DNA: 7F-A2-91');
  const [lastDelay, setLastDelay] = useState(340);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, executing]);

  async function handleRunCommand(cmdToRun?: string) {
    const cmd = cmdToRun || inputCommand;
    if (!cmd.trim() || executing) return;

    setExecuting(true);
    setInputCommand('');

    const priorCommands = history.map((h) => h.command);

    try {
      const res = await fetch('/api/ai/ssh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, history: priorCommands }),
      });

      if (res.ok) {
        const data = await res.json() as {
          output: string;
          delayMs: number;
          dnaFingerprint: string;
        };

        const newEntry: TerminalHistoryEntry = {
          command: cmd,
          output: data.output,
          delayMs: data.delayMs,
          dnaFingerprint: data.dnaFingerprint,
          timestamp: new Date().toLocaleTimeString(),
        };

        setHistory((prev) => [...prev, newEntry]);
        setLastDna(data.dnaFingerprint);
        setLastDelay(data.delayMs);

        if (onCommandExecuted) {
          onCommandExecuted();
        }
      }
    } catch {
      // error
    } finally {
      setExecuting(false);
    }
  }

  return (
    <Card className="bg-slate-950 text-slate-100 border-slate-800 shadow-xl overflow-hidden font-mono flex flex-col h-[420px]">
      {/* Terminal Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between font-sans shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2 flex items-center gap-1.5 font-mono">
            <RiTerminalBoxLine className="w-4 h-4 text-indigo-400" />
            admin@ciphernest-decoy: ~ (OpenCode AI Live Sandbox)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-indigo-300 font-mono text-[11px]">
            <RiFingerprintLine className="w-3.5 h-3.5" />
            <span>{lastDna}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-emerald-400 font-mono text-[11px]">
            <RiTimeLine className="w-3.5 h-3.5" />
            <span>{lastDelay}ms Jitter</span>
          </div>
        </div>
      </div>

      {/* Preset Quick Command Buttons */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px] font-sans shrink-0">
        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0">Quick Attacks:</span>
        <button
          onClick={() => handleRunCommand('ls -la /home/admin')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 transition-colors shrink-0"
        >
          ls -la
        </button>
        <button
          onClick={() => handleRunCommand('find / -name "*.pem" 2>/dev/null')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 transition-colors shrink-0"
        >
          find *.pem
        </button>
        <button
          onClick={() => handleRunCommand('cat /etc/passwd')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 transition-colors shrink-0"
        >
          cat /etc/passwd
        </button>
        <button
          onClick={() => handleRunCommand('python3 -c "import socket; print(socket.gethostname())"')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 transition-colors shrink-0"
        >
          python probe
        </button>
      </div>

      {/* Output Console Log View */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs leading-relaxed text-slate-300 select-text">
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300">
              <span className="text-emerald-400 font-bold">admin@ciphernest-decoy:~$</span>
              <span className="font-semibold text-white">{entry.command}</span>
              <span className="text-[10px] text-slate-500 font-sans ml-auto">{entry.timestamp} ({entry.delayMs}ms)</span>
            </div>
            <pre className="text-slate-400 font-mono text-[11px] whitespace-pre-wrap pl-4 border-l-2 border-slate-800 bg-slate-900/30 py-1 rounded">
              {entry.output}
            </pre>
          </div>
        ))}

        {executing && (
          <div className="flex items-center gap-2 text-indigo-400 animate-pulse pt-1">
            <RiCpuLine className="w-4 h-4 animate-spin" />
            <span>Synthesizing OpenCode AI Response & Extracting Attacker DNA...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Command Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunCommand();
        }}
        className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center gap-2 shrink-0"
      >
        <span className="text-emerald-400 font-bold text-xs pl-2 font-mono">admin@decoy:~$</span>
        <input
          type="text"
          value={inputCommand}
          placeholder="Type live shell command (e.g. ls, cat /etc/passwd, nmap, python)..."
          onChange={(e) => setInputCommand(e.target.value)}
          disabled={executing}
          className="flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
        />
        <Button
          type="submit"
          disabled={executing || !inputCommand.trim()}
          size="sm"
          variant="primary"
          className="rounded-lg text-xs font-semibold px-3 py-1 bg-indigo-600 hover:bg-indigo-500"
        >
          <RiPlayFill className="w-3.5 h-3.5" />
          <span>Execute</span>
        </Button>
      </form>
    </Card>
  );
};
