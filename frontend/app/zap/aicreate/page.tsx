"use client";

import { useState ,useEffect} from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { useRouter } from "next/navigation";
import {toast} from "react-toastify"

export default function AIZapBuilder() {

  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAuthenticated,setIsAuthenticated]=useState(false);

   // ✅ Check login on mount
      useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          setIsAuthenticated(true);
          return;
        }
      }, []);
    
      
    
      if (!isAuthenticated) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Appbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200 p-8 border border-slate-100 text-center space-y-6">
          {/* Visual Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Access Protected
            </h1>
            <p className="text-slate-500">
              Please sign in to your account to access your automations and AI builder.
            </p>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <PrimaryButton 
              onClick={() => router.push("/login")} 
              //@ts-ignore
              className="w-full py-3 text-lg font-medium shadow-md hover:shadow-blue-200 transition-all"
            >
              Log In
            </PrimaryButton>
            
            <button 
              onClick={() => router.push("/signup")}
              className="w-full py-3 text-slate-600 font-medium hover:text-blue-600 transition-colors"
            >
              Don't have an account? <span className="underline decoration-blue-200 underline-offset-4">Sign Up</span>
            </button>
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Secure Cloud Automation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

  async function generateZap() {
    if (!prompt) {
      toast.warn("Please enter a prompt");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${BACKEND_URL}/api/v2/zap`,
        { prompt },
        {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        }
      );
      console.log(res.data);
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        "Something went wrong while generating the Zap";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    setPrompt("");
    setResult(null);
  }

  return (

    <div className="bg-slate-200 min-h-screen">

      <Appbar />

      <div className="flex flex-col items-center pt-20">

        {/* Prompt Box */}

        <div className="bg-white shadow-xl rounded-xl p-8 w-[650px]">

          <h1 className="text-2xl font-bold mb-6 text-center">
            AI Zap Builder
          </h1>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: When I receive a telegram message send it to discord"
            className="w-full border p-3 rounded-md h-28"
          />

          <div className="pt-6 flex justify-center">

            <PrimaryButton
              onClick={generateZap}
              //@ts-ignore
              disabled={!prompt || loading}
            >
              {loading ? "Generating..." : "Generate Zap"}
            </PrimaryButton>

          </div>

          {loading && (
            <div className="text-center mt-4 text-gray-500 animate-pulse">
              AI is generating your automation...
            </div>
          )}

        </div>

        {/* RESULT */}

        {result && (

  <div className="bg-white shadow-xl border rounded-xl p-6 mt-10 w-[650px]">

```
{/* Success Banner */}

<div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
  <p className="text-green-700 font-medium">
    AI successfully generated your automation
  </p>
</div>

<h2 className="text-xl font-semibold mb-4">
  AI Generated Workflow
</h2>

{/* AI Explanation */}

{result.explanation && (

  <div className="bg-slate-100 p-4 rounded-lg mb-6 text-sm text-slate-700">
    <b>AI Explanation:</b> {result.explanation}
  </div>

)}

{/* Workflow Visualization */}

<div className="mt-6 flex flex-col items-center space-y-4">

  {/* Trigger */}

  <div className="bg-white shadow-md border rounded-xl px-6 py-4 w-80 text-center">

    <div className="text-xs text-gray-500 mb-1">
      TRIGGER
    </div>

    <div className="font-semibold text-lg">
      {result.trigger?.name}
    </div>

  </div>

  {/* Arrow */}

  <div className="text-gray-400 text-2xl">↓</div>

  {/* Actions */}

  {result.actions?.map((a: any, i: number) => (

    <div key={i} className="flex flex-col items-center">

      <div className="bg-white shadow-md border rounded-xl px-6 py-4 w-80 text-center">

        <div className="text-xs text-gray-500 mb-1">
          ACTION
        </div>

        <div className="font-semibold text-lg">
          {a?.name}
        </div>

      </div>

      {i !== result.actions.length - 1 && (
        <div className="text-gray-400 text-2xl">↓</div>
      )}

    </div>

  ))}

</div>

{/* Info Section */}

<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
  ℹ️ <b>Need to change something?</b><br/>
  You can edit action details like message, tokens, or settings later from  
  <b> Dashboard → Go button → Edit Action</b>.
</div>

{/* Buttons */}

<div className="pt-6 flex justify-between">

  <PrimaryButton onClick={regenerate}>
    Regenerate
  </PrimaryButton>

  <PrimaryButton
    onClick={() => router.push("/dashboard")}
  >
    Go to Dashboard
  </PrimaryButton>

</div>

  </div>

)}

      </div>

    </div>

  );

}