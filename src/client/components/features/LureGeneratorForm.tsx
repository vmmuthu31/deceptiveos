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
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RiFileShield2Line className="w-5 h-5 text-indigo-400" />
          <CardTitle>Semantic Lure Synthesizer</CardTitle>
        </div>
        <CardDescription>
          Uses local Ollama LLM to generate realistic company-specific lure documents embedded with steganographic tracking watermarks.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Document Title / File Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0E17] border border-[#1E293B] rounded text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Document Format</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as 'PDF' | 'DOCX' | 'XLSX' | 'JSON' | 'ENV')}
              className="w-full px-3 py-2 bg-[#0B0E17] border border-[#1E293B] rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="XLSX">Spreadsheet (.xlsx)</option>
              <option value="JSON">API Credentials (.json)</option>
              <option value="ENV">Environment Secrets (.env)</option>
              <option value="PDF">Executive PDF (.pdf)</option>
              <option value="DOCX">Internal Memo (.docx)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Company Context</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0E17] border border-[#1E293B] rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
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
            className="w-full px-3 py-2 bg-[#0B0E17] border border-[#1E293B] rounded text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <RiCpuLine className="w-3.5 h-3.5 text-indigo-400" /> Steganographic Canary Token: Embedded
          </span>
          <Button type="submit" disabled={loading} variant="primary">
            <RiMagicLine className="w-3.5 h-3.5" />
            <span>{loading ? 'Synthesizing Document...' : 'Generate Lure & Watermark'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};

