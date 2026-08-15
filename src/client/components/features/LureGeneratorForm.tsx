'use client';

import { Button } from '@/client/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { LureDocument } from '@/shared/types';
import React, { useState } from 'react';
import { RiCpuLine, RiFileShield2Line, RiMagicLine } from 'react-icons/ri';

interface LureGeneratorFormProps {
  onLureGenerated: (lure: LureDocument, content: string) => void;
}

export const LureGeneratorForm: React.FC<LureGeneratorFormProps> = ({ onLureGenerated }) => {
  const [title, setTitle] = useState('Q3_Executive_Compensation_2026.xlsx');
  const [docType, setDocType] = useState<'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV'>('XLSX');
  const [targetCompany, setTargetCompany] = useState('Acme Cyber Systems');
  const [industry, setIndustry] = useState('Financial Services & Defense');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/lures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, docType, targetCompany, industry }),
      });

      if (res.ok) {
        const data = await res.json() as { lure: LureDocument; content: string };
        onLureGenerated(data.lure, data.content);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-800/80">
      <CardHeader>
        <div>
          <div className="flex items-center gap-2">
            <RiFileShield2Line className="w-5 h-5 text-emerald-400" />
            <CardTitle>Semantic Lure Document Generator</CardTitle>
          </div>
          <CardDescription>
            Uses local Ollama LLM to generate realistic company-specific lure documents embedded with steganographic tracking watermarks.
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Document Title / File Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as 'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV')}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="XLSX">Spreadsheet (XLSX)</option>
              <option value="JSON">API Config (JSON)</option>
              <option value="ENV">Environment File (ENV)</option>
              <option value="PDF">PDF Contract</option>
              <option value="DOCX">DOCX Memo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Company Context</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Industry Context</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
            <RiCpuLine className="w-3.5 h-3.5 text-cyan-400" /> Steganographic Watermark: Auto-Embedded
          </span>
          <Button type="submit" disabled={loading}>
            <RiMagicLine className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Document...' : 'Generate Lure & Watermark'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};
