'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  parseCustomerFile,
  downloadSampleTemplate,
  ParsedImportResult,
} from '@/lib/export-import';
import { bulkImportCustomers } from '@/lib/api/customers';
import { customerKeys } from '@/lib/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  X,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/common/status-badge';

interface ImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportModal({ isOpen, onOpenChange }: ImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedImportResult | null>(null);
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
      const result = await parseCustomerFile(file);
      if (result.validCustomers.length === 0 && result.invalidRows.length === 0) {
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
    if (!parseResult || parseResult.validCustomers.length === 0) return;

    try {
      setIsImporting(true);
      const res = await bulkImportCustomers(parseResult.validCustomers);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });

      toast.success(`Successfully imported ${res.importedCount} customer account(s)!`);
      onOpenChange(false);
      handleReset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import customers.');
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center border border-[#BBF7D0]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold text-[#1A1D23]">
                Import Customers
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#6B7280]">
                Upload an Excel (.xlsx) or CSV file to bulk import customer records into your workspace.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Download Sample Templates Bar */}
          <div className="p-3.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[13px] font-semibold text-[#1A1D23] block">
                Need a formatted template?
              </span>
              <span className="text-[12px] text-[#6B7280]">
                Download our sample spreadsheet with headers and sample records.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadSampleTemplate('xlsx')}
                className="h-8 text-[12px] font-medium border-[#D1D5DB] bg-white gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Sample Excel</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadSampleTemplate('csv')}
                className="h-8 text-[12px] font-medium border-[#D1D5DB] bg-white gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Sample CSV</span>
              </Button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          {!parseResult ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-[12px] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-[#16A34A] bg-[#F0FDF4]'
                  : 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF] hover:bg-[#FAFAFA]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="h-12 w-12 rounded-full bg-[#F1F5F9] text-[#6B7280] flex items-center justify-center">
                {isParsing ? (
                  <RefreshCw className="h-6 w-6 animate-spin text-[#16A34A]" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[#1A1D23]">
                  {isParsing ? 'Parsing dataset...' : 'Click to upload or drag and drop file'}
                </p>
                <p className="text-[12px] text-[#6B7280]">
                  Supports Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
              </div>
            </div>
          ) : (
            /* Uploaded File Summary & Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] border border-[#E5E7EB] bg-white shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1D23]">
                      {selectedFile?.name}
                    </h4>
                    <p className="text-[12px] text-[#6B7280]">
                      {((selectedFile?.size || 0) / 1024).toFixed(1)} KB • {parseResult.totalRows} rows detected
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-[#6B7280] hover:text-[#EF4444]"
                >
                  Choose Different File
                </Button>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[13px] font-bold text-[#166534]">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  <span>{parseResult.validCustomers.length} Valid Records Ready</span>
                </div>
                {parseResult.invalidRows.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] text-[13px] font-bold text-[#991B1B]">
                    <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                    <span>{parseResult.invalidRows.length} Rows Skipped</span>
                  </div>
                )}
              </div>

              {/* Invalid Rows Warning Box */}
              {parseResult.invalidRows.length > 0 && (
                <div className="p-3.5 rounded-[8px] border border-[#FEE2E2] bg-[#FEF2F2]/50 space-y-1 text-xs text-[#991B1B]">
                  <span className="font-bold">Skipped row details:</span>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                    {parseResult.invalidRows.map((inv, idx) => (
                      <li key={idx}>
                        Row {inv.row}: {inv.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="space-y-2">
                <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  Dataset Preview (First {Math.min(5, parseResult.validCustomers.length)} rows)
                </span>
                <div className="border border-[#E5E7EB] rounded-[8px] overflow-x-auto bg-white max-h-52">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Company</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Last Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] text-[#374151]">
                      {parseResult.validCustomers.slice(0, 5).map((cust, idx) => (
                        <tr key={idx} className="hover:bg-[#FAFAFA]">
                          <td className="p-2.5 font-medium text-[#1A1D23]">{cust.name}</td>
                          <td className="p-2.5 font-mono">{cust.email}</td>
                          <td className="p-2.5 font-mono">{cust.phone}</td>
                          <td className="p-2.5">{cust.company}</td>
                          <td className="p-2.5">
                            <StatusBadge status={cust.status} />
                          </td>
                          <td className="p-2.5 font-mono">{cust.lastContactDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Parse Error Display */}
          {parseError && (
            <div className="p-3.5 rounded-[8px] border border-[#FEE2E2] bg-[#FEF2F2] flex items-center gap-2 text-[13px] text-[#991B1B]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isImporting}
            className="border-[#D1D5DB] text-[13px]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.validCustomers.length === 0 || isImporting}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[13px] gap-2 shadow-xs"
          >
            {isImporting ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Importing...
              </span>
            ) : (
              `Import ${parseResult ? parseResult.validCustomers.length : 0} Customers`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
