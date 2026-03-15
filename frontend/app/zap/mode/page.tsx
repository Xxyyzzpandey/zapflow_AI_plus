"use client";
import { useRouter } from "next/navigation";
import { Appbar } from "@/components/Appbar";

export default function ZapCreatePage() {
  const router = useRouter();

  return (
    <div className="bg-slate-50 min-h-screen">
      <Appbar />
      <div className="max-w-5xl mx-auto pt-20 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900">Create a new Zap</h1>
          <p className="text-slate-600 mt-4">Choose how you want to start building your automation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Path 1: AI Builder */}
          <div 
            onClick={() => router.push("/zap/aicreate")}
            className="group relative cursor-pointer bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-blue-600 transition-all hover:shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">✨</span>
            </div>
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Build with AI</h2>
            <p className="text-slate-600">Just describe what you want in plain English. Our AI will map the triggers and actions for you.</p>
            <div className="mt-6 text-blue-600 font-bold group-hover:translate-x-2 transition-transform">Start with a prompt →</div>
          </div>

          {/* Path 2: Manual Builder */}
          <div 
            onClick={() => router.push("/zap/create")}
            className="group relative cursor-pointer bg-white border-2 border-slate-200 p-8 rounded-3xl hover:border-orange-600 transition-all hover:shadow-xl overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl">🛠️</span>
            </div>
            <div className="bg-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Custom Builder</h2>
            <p className="text-slate-600">Hand-pick every step. Ideal for complex workflows or when you know exactly what you need.</p>
            <div className="mt-6 text-orange-600 font-bold group-hover:translate-x-2 transition-transform">Configure manually →</div>
          </div>
        </div>
      </div>
    </div>
  );
}