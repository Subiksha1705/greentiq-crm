import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Users } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="w-full border border-[#E5E7EB] rounded-2xl bg-white p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shadow-xs">
          <FileQuestion className="h-8 w-8 text-[#16A34A]" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h2 className="text-[22px] font-bold text-[#1A1D23] tracking-tight">
            Page Not Found
          </h2>
          <p className="text-[14px] text-[#6B7280] leading-relaxed">
            The page you are looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Button
            asChild
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[14px] gap-2 px-5 shadow-xs"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] text-[14px] gap-2"
          >
            <Link href="/customers">
              <Users className="h-4 w-4" />
              <span>Go to Customers</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
