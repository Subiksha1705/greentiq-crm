'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  parseCompanyFile,
  downloadCompanySampleTemplate,
  ParsedCompanyImportResult,
} from '@/lib/export-import';
import { bulkImportCompanies } from '@/lib/api/companies';
import { companyKeys } from '@/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface CompanyImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyImportModal({ isOpen, onOpenChange }: CompanyImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedCompanyImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setParseError(null);
    setIsParsing(false);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);

    try {
      const result = await parseCompanyFile(file);
      if (result.validCompanies.length === 0 && result.invalidRows.length === 0) {
        setParseError('The uploaded file is empty.');
        setParseResult(null);
      } else {
        setParseResult(result);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file.');
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validCompanies.length === 0) return;

    try {
      setIsImporting(true);
      const res = await bulkImportCompanies(parseResult.validCompanies);
      queryClient.invalidateQueries({ queryKey: companyKeys.all });

      toast.success(`Successfully imported ${res.importedCount} company record(s)!`);
      onOpenChange(false);
      handleReset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-2xl bg-[var(--card)] border-[var(--border-default)] p-6 rounded-[12px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-default)]">
          <div>
            <DialogTitle className="text-[18px] font-bold text-[var(--text-primary)]">
              Import Companies
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[var(--text-tertiary)] mt-1">
              Upload an Excel (.xlsx) or CSV (.csv) file to import or update company accounts in bulk.
            </DialogDescription>
          </div>
        </div>

        {/* Template Download Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-[8px] mt-4">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-5 w-5 text-[var(--primary)] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                Sample Spreadsheet Template
              </p>
              <p className="text-[12px] text-[var(--text-tertiary)]">
                Use this pre-formatted template with standard industry and tier headers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCompanySampleTemplate('xlsx')}
              className="h-8 px-2.5 text-[12px] font-medium border-[var(--border-default)] bg-[var(--card)] hover:bg-[var(--surface-tertiary)]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Excel (.xlsx)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCompanySampleTemplate('csv')}
              className="h-8 px-2.5 text-[12px] font-medium border-[var(--border-default)] bg-[var(--card)] hover:bg-[var(--surface-tertiary)]"
            >
              <FileText className="h-3.5 w-3.5 mr-1 text-blue-600" />
              CSV (.csv)
            </Button>
          </div>
        </div>

        {/* Drop Zone / Upload Area */}
        {!parseResult && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-[10px] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-[var(--primary)] bg-[var(--accent)]/20'
                : 'border-[var(--border-strong)] hover:border-[var(--primary)] bg-[var(--surface-secondary)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {isParsing ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 text-[var(--primary)] animate-spin" />
                <p className="text-[14px] font-medium text-[var(--text-primary)]">Parsing company data...</p>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                    Supports .xlsx, .xls, and .csv files up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error message */}
        {parseError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[8px] text-[13px] text-red-700 dark:text-red-300 mt-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="flex-1">{parseError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-[12px] text-red-600 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Preview Validated Data */}
        {parseResult && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] border border-[var(--border-default)] rounded-[8px]">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {selectedFile?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {parseResult.validCompanies.length} Valid
                </Badge>
                {parseResult.invalidRows.length > 0 && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[11px] font-semibold">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {parseResult.invalidRows.length} Invalid
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 px-2 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  Change File
                </Button>
              </div>
            </div>

            {/* Valid Rows Preview Table */}
            {parseResult.validCompanies.length > 0 && (
              <div className="border border-[var(--border-default)] rounded-[8px] overflow-hidden max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[var(--surface-secondary)] sticky top-0 border-b border-[var(--border-default)] text-[11px] font-semibold uppercase text-[var(--text-tertiary)]">
                    <tr>
                      <th className="p-2.5">Company Name</th>
                      <th className="p-2.5">Industry</th>
                      <th className="p-2.5">Tier</th>
                      <th className="p-2.5">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {parseResult.validCompanies.slice(0, 15).map((comp, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-tertiary)]">
                        <td className="p-2.5 font-medium text-[var(--text-primary)]">{comp.name}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">{comp.industry}</td>
                        <td className="p-2.5 text-[var(--text-secondary)]">{comp.tier}</td>
                        <td className="p-2.5 text-[var(--text-tertiary)]">{comp.location || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-[var(--border-default)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isImporting}
            className="text-[13px] border-[var(--border-default)]"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.validCompanies.length === 0 || isImporting}
            className="text-[13px] font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5"
          >
            {isImporting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            <span>
              {isImporting
                ? 'Importing...'
                : `Import ${parseResult?.validCompanies.length || 0} Companies`}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
