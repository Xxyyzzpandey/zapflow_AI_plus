"use client";

import { BACKEND_URL } from "@/app/config";
import { Appbar } from "@/components/Appbar";
import { ZapCell } from "@/components/ZapCell";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {toast} from "react-toastify"

import { Modal } from "@/app/Modals/models";
import { useAvailableActionsAndTriggers } from "@/app/custonHook/availableactionandtrigger";

export default function ZapBuilderPage() {
  const router = useRouter();
  const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false); // null = loading
  const [selectedTrigger, setSelectedTrigger] = useState<{ id: string; name: string }>();
  const [selectedActions, setSelectedActions] = useState<
    { index: number; availableActionId: string; availableActionName: string; metadata: any }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(null);
  const [publishing,setPublishing]=useState(false);
  const [triggerMetadata, setTriggerMetadata] = useState<any>({});


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

  // Actual Zap builder page
  return (
  <div className="bg-slate-200 min-h-screen">
    <Appbar />

    {/* Top Section: Docs & Publish Bar */}
    <div className="sticky top-0 z-10 bg-slate-200/80 backdrop-blur-md pb-4">
      {/* Documentation Link */}
      <div className="w-full pt-6 flex justify-center">
        <div className="bg-white border border-slate-300 px-6 py-2 rounded-xl flex items-center gap-3 shadow-sm hover:border-blue-400 transition-all">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-600">
            Need help? 
            <button 
              onClick={() => router.push("/guidetouse")} 
              className="ml-2 text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Read Documentation
            </button>
          </span>
        </div>
      </div>

      {/* Publish Button */}
      <div className="flex justify-end px-8 pt-4">
        <PrimaryButton
          onClick={async () => {
            if (!selectedTrigger?.id) return;
            setPublishing(true);
            try {
              await axios.post(`${BACKEND_URL}/api/v1/zap`, {
                availableTriggerId: selectedTrigger.id,
                triggerMetadata,
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: a.metadata,
                })),
              }, {
                headers: { Authorization: localStorage.getItem("token") || "" }
              });
              toast.success("zap created successfull")
              router.push("/dashboard");
            } catch (e) {
              // console.error(e);
              toast.error("error in creating zap try again");
            } finally {
              setPublishing(false);
            }
          }}
        >
          {publishing ? "Publishing..." : "Publish"}
        </PrimaryButton>
      </div>
    </div>

    {/* Main Builder Area */}
    <div className="flex flex-col items-center pt-10 pb-20">
      {/* Trigger Cell */}
      <ZapCell
        onClick={() => setSelectedModalIndex(1)}
        name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"}
        index={1}
      />

      {/* Dynamic Action Cells */}
      <div className="w-full">
        {selectedActions.map((action, index) => (
          <div key={index} className="pt-4 flex justify-center">
            <ZapCell
              onClick={() => setSelectedModalIndex(action.index)}
              name={action.availableActionName ? action.availableActionName : "Action"}
              index={action.index}
            />
          </div>
        ))}
      </div>

      {/* Add Action Button */}
      <div className="pt-8 flex justify-center">
        <PrimaryButton
          onClick={() =>
            setSelectedActions((a) => [
              ...a,
              { index: a.length + 2, availableActionId: "", availableActionName: "", metadata: {} },
            ])
          }
        >
          <div className="text-2xl px-2">+</div>
        </PrimaryButton>
      </div>
    </div>

    {/* Modal Logic */}
    {selectedModalIndex && (
      <Modal
        availableItems={selectedModalIndex === 1 ? availableTriggers : availableActions}
        onSelect={(props: any) => {
          if (props === null) {
            setSelectedModalIndex(null);
            return;
          }
          if (selectedModalIndex === 1) {
            setSelectedTrigger({ id: props.id, name: props.name });
            setTriggerMetadata(props.metadata || {});
          } else {
            setSelectedActions((a) => {
              let newActions = [...a];
              newActions[selectedModalIndex - 2] = {
                index: selectedModalIndex,
                availableActionId: props.id,
                availableActionName: props.name,
                metadata: props.metadata,
              };
              return newActions;
            });
          }
          setSelectedModalIndex(null);
        }}
        index={selectedModalIndex}
      />
    )}
  </div>
);
}
