"use client";

import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Appbar } from "@/components/Appbar";
import {toast} from "react-toastify"

const CONFIG: Record<string, string[]> = {
  discord: ["webhookUrl"],
  telegram: ["botToken", "chatId"],
  notion: ["notionKey", "databaseId"],
  solana: ["address", "amount"],
  email:["from","to","subject","body","sender name"]
};

export default function ConnectionPage() {
  const [integration, setIntegration] = useState("discord");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving ,setSaving]=useState(false);

 const saveConnection = async () => {
    setSaving(true);
  try {
    
    await axios.post(
      `${BACKEND_URL}/api/v2/secret`,
      {
        integrationType: integration,
        secret: formData
      },
      {
        headers: {
           Authorization: localStorage.getItem("token")
        }
      }
    );
    toast.success("Saved successfully!");

  } catch (error) {
    console.error(error);
    toast.error("Failed to save connection");
  }finally{
    setSaving(false);
  }
};

  return (<>
  <Appbar/>
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Connections</h1>
      
      <select 
        className="w-full p-2 border rounded mb-4"
        onChange={(e) => { setIntegration(e.target.value); setFormData({}); }}
      >
        {Object.keys(CONFIG).map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
      </select>

      {CONFIG[integration].map(field => (
        <input
          key={field}
          className="w-full p-2 border rounded mb-3"
          placeholder={field}
          onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
        />
      ))}

      <PrimaryButton onClick={saveConnection}>{saving?"saving...":"Save Connection"}</PrimaryButton>
    </div>
  </>);
}