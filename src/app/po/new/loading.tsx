import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-screen p-4 sm:p-6 space-y-6 animate-pulse bg-slate-50">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-28 bg-slate-200 rounded-xl hidden sm:block"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-6 w-32 bg-slate-300 rounded"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-5 w-36 bg-slate-200 rounded"></div>
          <div className="h-9 w-44 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-xl border border-slate-100"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
