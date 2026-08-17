import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { classifyAttackerSession, generateHoneypotSSHResponse } from '@/server/services/ai.service';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { command, history = [], honeypotId = 'hp-cowrie-01' } = await req.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ success: false, error: 'Command is required' }, { status: 400 });
    }


    const { output, delayMs } = await generateHoneypotSSHResponse(command, history);


    const fullHistory = [...history, command];
    const classification = await classifyAttackerSession(fullHistory);


    const db = readDb();
    const sessionId = 'sess-interactive-demo';
    const timestamp = new Date().toISOString();
    const entropyScore = Number((Math.random() * 2 + 3).toFixed(2));
    const dnaHash = crypto.createHash('sha256').update(fullHistory.join(';')).digest('hex').substring(0, 8).toUpperCase();

    let event = db.events.find((e) => e.sessionId === sessionId);
    if (!event) {
      event = {
        id: `evt-${Date.now().toString(36)}`,
        sessionId,
        honeypotId,
        honeypotName: 'SSH Core Decoy (Interactive Sandbox)',
        attackerIp: '194.26.29.112',
        location: 'Bucharest, Romania (TOR Exit Node)',
        kind: 'command_exec',
        payload: command,
        timestamp,
        commands: [],
      };
      db.events.unshift(event);
    }

    event.commands.push({
      id: `cmd-${Date.now().toString(36)}`,
      sessionId,
      honeypotId,
      timestamp,
      command,
      output,
      executionDelayMs: delayMs,
      entropyScore,
    });

    writeDb(db);

    appendAuditBlock('INTERACTIVE_COMMAND_EXECUTIVE', {
      command,
      outputSnippet: output.substring(0, 40),
      delayMs,
      dna: `DNA: ${dnaHash}`,
    });

    return NextResponse.json({
      success: true,
      command,
      output,
      delayMs,
      entropyScore,
      classification,
      dnaFingerprint: `DNA: ${dnaHash}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
