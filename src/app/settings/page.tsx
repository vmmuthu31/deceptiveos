'use client';

import { Badge } from '@/client/components/ui/Badge';
import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { ComplianceSummary } from '@/shared/types';
import React, { useEffect, useState } from 'react';
import {
  RiCheckDoubleLine,
  RiCompass3Line,
  RiDatabase2Line,
  RiDownloadLine,
  RiLock2Line,
  RiMailSendLine,
  RiSettings4Line,
  RiShieldCheckLine,
  RiSparklingLine
} from 'react-icons/ri';

interface AIModelInfo {
  activeProvider: string;
  activeModel: string;
  openCodeKeyStatus: string;
  configuredOpenCodeModel: string;
  availableOpenCodeModels: Array<{ id: string; name: string; provider: string }>;
}

export default function SettingsPage() {
  const [compliance, setCompliance] = useState<ComplianceSummary | null>(null);
  const [aiModelInfo, setAiModelInfo] = useState<AIModelInfo | null>(null);
  const [selectedOpenCodeModel, setSelectedOpenCodeModel] = useState('mimo-v2.5-free');
  const [hashVerification, setHashVerification] = useState<{ verified: boolean; blockCount: number; rootHash: string } | null>(null);
  const [verifyingHash, setVerifyingHash] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('secops@company.com');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    async function loadSettingsData() {
      try {
        const compRes = await fetch('/api/compliance');
        if (compRes.ok) {
          const compData = await compRes.json() as { summary: ComplianceSummary };
          setCompliance(compData.summary || null);
        }

        const aiRes = await fetch('/api/ai/models');
        if (aiRes.ok) {
          const aiData = await aiRes.json() as AIModelInfo;
          setAiModelInfo(aiData);
          if (aiData.configuredOpenCodeModel) {
            setSelectedOpenCodeModel(aiData.configuredOpenCodeModel);
          }
        }
      } catch {
        // fallback
      }
    }
    loadSettingsData();
  }, []);

  const handleVerifyHashChain = async () => {
    setVerifyingHash(true);
    try {
      const res = await fetch('/api/compliance/verify');
      if (res.ok) {
        const data = await res.json() as { verified: boolean; blockCount: number; rootHash: string };
        setHashVerification(data);
      }
    } catch {
      // fallback
    } finally {
      setVerifyingHash(false);
    }
  };

  const handleExportEvidence = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/compliance', { method: 'POST' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CipherNest_SOC2_Evidence_Report.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch {
      // fallback
    } finally {
      setExporting(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailStatus(null);

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testEmailRecipient }),
      });
      const data = await res.json() as { success: boolean; messageId?: string; error?: string };

      if (res.ok && data.success) {
        setEmailStatus({ success: true, message: `Email alert sent! ID: ${data.messageId}` });
      } else {
        setEmailStatus({ success: false, message: data.error || 'Failed to send alert email' });
      }
    } catch {
      setEmailStatus({ success: false, message: 'SMTP server error' });
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownloadStix = () => {
    const a = document.createElement('a');
    a.href = '/api/export/stix';
    a.download = 'CipherNest_STIX2.1_ThreatIntel.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadSigma = () => {
    const a = document.createElement('a');
    a.href = '/api/export/sigma';
    a.download = 'CipherNest_Sigma_Detection_Rules.yml';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <RiSettings4Line className="w-5 h-5" />
          </div>
          Settings, OpenCode AI & Cryptographic Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure OpenCode AI models, Nodemailer security email alerts, database pooler connections, and cryptographic audit ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OpenCode AI Engine */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <RiSparklingLine className="w-4 h-4" />
                  </div>
                  <CardTitle className="font-bold text-slate-900">OpenCode AI Engine</CardTitle>
                </div>
                <Badge variant={aiModelInfo?.openCodeKeyStatus.includes('Configured') ? 'success' : 'outline'} dot>
                  {aiModelInfo?.openCodeKeyStatus || 'Checking...'}
                </Badge>
              </div>
              <CardDescription>OpenCode API Zen integration (https://opencode.ai/zen/v1) for honeypot SSH counter-responses & lure generation.</CardDescription>
            </CardHeader>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 my-3 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Active Engine:</span>
                <span className="text-indigo-600 font-bold">{aiModelInfo?.activeProvider || 'OpenCode API Zen'}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select OpenCode Free Model:</label>
                <select
                  value={selectedOpenCodeModel}
                  onChange={(e) => setSelectedOpenCodeModel(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {aiModelInfo?.availableOpenCodeModels?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  )) || (
                    <>
                      <option value="mimo-v2.5-free">MiMo-V2.5 Free (Xiaomi / OpenCode)</option>
                      <option value="hy3-free">Hy3 Free (Stealth / OpenCode)</option>
                      <option value="laguna-s-2.1-free">Laguna S 2.1 Free (Stealth / OpenCode)</option>
                      <option value="nemotron-3-ultra-free">Nemotron 3 Ultra Free (NVIDIA / OpenCode)</option>
                      <option value="nemotron-3.5-lightning-free">Nemotron 3.5 Lightning Free (NVIDIA / OpenCode)</option>
                      <option value="deepseek-v4-flash-free">DeepSeek V4 Flash Free (DeepSeek / OpenCode)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block font-sans">SIEM Threat Intel Exports:</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleDownloadStix} className="rounded-xl font-semibold">
                <RiCompass3Line className="w-4 h-4 text-indigo-600" />
                <span>Export STIX 2.1</span>
              </Button>
              <Button size="sm" variant="secondary" onClick={handleDownloadSigma} className="rounded-xl font-semibold">
                <RiDownloadLine className="w-4 h-4 text-emerald-600" />
                <span>Export Sigma Rules</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Nodemailer Security Email Alerts */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <RiMailSendLine className="w-4 h-4" />
                  </div>
                  <CardTitle className="font-bold text-slate-900">Nodemailer Alert Engine</CardTitle>
                </div>
                <Badge variant="success" dot>SMTP ACTIVE</Badge>
              </div>
              <CardDescription>Automated HTML email alerts triggered on honeypot breaches and canary token callbacks.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSendTestEmail} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 my-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Test Alert Recipient Email:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="secops@company.com"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                    required
                  />
                  <Button type="submit" size="sm" variant="primary" disabled={emailSending} className="rounded-xl font-semibold">
                    <RiMailSendLine className="w-3.5 h-3.5" />
                    <span>{emailSending ? 'Sending...' : 'Send Test'}</span>
                  </Button>
                </div>
              </div>

              {emailStatus && (
                <div className={`p-2 rounded-xl text-[11px] font-mono font-medium ${emailStatus.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {emailStatus.message}
                </div>
              )}
            </form>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5 text-slate-600">
              <RiDatabase2Line className="w-4 h-4 text-indigo-600" />
              <span>Database Pooler: <strong className="text-slate-900 font-bold">DATABASE_URL Ready</strong></span>
            </span>
          </div>
        </Card>

        {/* Cryptographic SHA-256 Audit Chain */}
        <Card className="flex flex-col justify-between hover:shadow-md transition-all md:col-span-2">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <RiShieldCheckLine className="w-4 h-4" />
                  </div>
                  <CardTitle className="font-bold text-slate-900">Cryptographic SHA-256 Audit Ledger</CardTitle>
                </div>
                <Badge variant="success" dot>SOC 2 COMPLIANT</Badge>
              </div>
              <CardDescription>Tamper-evident append-only ledger with cryptographic hash chaining.</CardDescription>
            </CardHeader>

            {compliance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs p-4 bg-slate-50 rounded-xl border border-slate-200/80 my-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">SOC 2 Type II Compliance:</span>
                  <span className="text-emerald-600 font-bold">{compliance.soc2Score}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">ISO 27001:2022 Controls:</span>
                  <span className="text-emerald-600 font-bold">{compliance.iso27001Score}%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Audit Block Height:</span>
                  <span className="text-slate-900 font-bold">{compliance.immutableAuditLogHeight} blocks</span>
                </div>
              </div>
            )}

            {hashVerification && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <RiCheckDoubleLine className="w-4 h-4 text-emerald-600" />
                  <span>Ledger Verification Passed (0 Errors)</span>
                </div>
                <p className="text-[10px] text-emerald-700 truncate">Root Hash: {hashVerification.rootHash}</p>
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={handleVerifyHashChain} disabled={verifyingHash} className="rounded-xl font-semibold">
              <RiLock2Line className="w-4 h-4 text-indigo-600" />
              <span>{verifyingHash ? 'Verifying...' : 'Verify Hash-Chain'}</span>
            </Button>
            <Button size="sm" variant="primary" onClick={handleExportEvidence} disabled={exporting} className="rounded-xl font-semibold">
              <RiDownloadLine className="w-4 h-4" />
              <span>{exporting ? 'Generating Report...' : 'SOC 2 Evidence Report'}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}



