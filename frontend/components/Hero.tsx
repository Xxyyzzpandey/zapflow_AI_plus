"use client"
import { useRouter } from "next/navigation"
import { Feature } from "./Feature"
import { PrimaryButton } from "./buttons/PrimaryButton"
import { SecondaryButton } from "./buttons/SecondaryButton"

export const Hero = () => {
    const router = useRouter();

    const handleGetstarted = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/signup")
        } else {
            router.push("/zap/mode")
        }
    }

    return (
        <div className="bg-slate-200 min-h-screen">
            {/* Main Content Wrapper */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left Column: Text Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center space-x-2 bg-white border border-slate-300 px-3 py-1 rounded-full shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">New: AI Agent Workflows</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Automate <span className="text-blue-600">Faster</span> Than You Think.
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                            Zapflow connects your favorite apps and moves data automatically. Create powerful 
                    multi-step workflows that handle the busy work so you can focus on what matters.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <PrimaryButton onClick={handleGetstarted} size="big">
                                Get Started free
                            </PrimaryButton>
                            <SecondaryButton onClick={() => router.push("/prising")} size="big">
                                Contact Sales
                            </SecondaryButton>
                        </div>

                        <div className="flex items-center space-x-4 pt-4 text-sm text-slate-500">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-400" />
                                ))}
                            </div>
                            <p>Joined by 500+ creators this week</p>
                        </div>
                    </div>

                    {/* Right Column: Visual Element / Preview */}
                    <div className="hidden lg:block relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-10"></div>
                        <div className="relative bg-white border border-slate-300 rounded-3xl p-8 shadow-2xl">
                            {/* Decorative "Workflow" UI Mockup */}
                            <div className="space-y-4">
                                <div className="h-12 w-full bg-slate-100 rounded-xl flex items-center px-4 border-l-4 border-blue-500">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                                    <div className="h-2 w-32 bg-slate-300 rounded"></div>
                                </div>
                                <div className="flex justify-center py-2">
                                    <div className="w-0.5 h-8 bg-slate-300"></div>
                                </div>
                                <div className="h-12 w-full bg-slate-100 rounded-xl flex items-center px-4 border-l-4 border-purple-500">
                                    <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                                    <div className="h-2 w-48 bg-slate-300 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Features */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                        <Feature title={"Free Forever"} subtitle={"for core features"} />
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                        <Feature title={"More apps"} subtitle={"than any other platforms"} />
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-white/20">
                        <Feature title={"Cutting Edge"} subtitle={"AI Features"} />
                    </div>
                </div>
                {/* --- THE CRAZY INTERACTIVE PLAYGROUND --- */}
<div className="mt-32 pb-32 max-w-5xl mx-auto px-6">
    <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Stop dreaming, start building.</h2>
        <p className="text-slate-600 mt-2">Click the nodes to see the magic happen.</p>
    </div>

    <div className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Step 1: Trigger */}
            <div className="group cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-64 transform hover:-translate-y-2 transition-all">
                <div className="text-blue-400 text-xs font-bold mb-2 uppercase">When this happens...</div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="text-white font-medium">New Email</div>
                </div>
            </div>

            {/* Animated Connector Arrow */}
            <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 relative">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-white rounded-full animate-[ping_2s_infinite]"></div>
            </div>

            {/* Step 2: Action */}
            <div className="group cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full md:w-64 transform hover:-translate-y-2 transition-all border-l-4 border-l-purple-500">
                <div className="text-purple-400 text-xs font-bold mb-2 uppercase">Do this...</div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <div className="text-white font-medium">Send Slack</div>
                </div>
            </div>

            {/* Final CTA in the Box */}
            <div className="text-center md:text-left">
                <button 
                    onClick={handleGetstarted}
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-xl"
                >
                    Build yours now →
                </button>
            </div>
        </div>

        {/* Floating Particle "Code" snippets for the "Crazy" look */}
        <div className="absolute top-10 right-20 text-blue-500/20 font-mono text-xs rotate-12 hidden lg:block">
            POST /api/v1/zap HTTP/1.1
        </div>
        <div className="absolute bottom-10 left-40 text-purple-500/20 font-mono text-xs -rotate-12 hidden lg:block">
            Authorization: Bearer token...
        </div>
    </div>
</div>
            </div>
        </div>
    )
}