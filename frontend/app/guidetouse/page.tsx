"use client";

import { Appbar } from "@/components/Appbar";

export default function GuidePage() {
  return (
    <>
      <Appbar />
      
      <div className="max-w-4xl mx-auto p-6 space-y-12">
        <h1 className="text-3xl font-bold">📘 Zapflow Integration Docs</h1>
        <p className="text-gray-600">
          Zapflow helps you automate workflows by connecting <b>Triggers</b> (events)
          with <b>Actions</b> (tasks). When a trigger fires, its data is passed to
          actions using placeholders like <code>{"{{name}}"}</code>.
        </p>

        {/* Webhook */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🔔 Webhook Trigger</h2>

          <p className="text-sm text-gray-700">
            A Webhook Trigger allows any external system (backend, frontend,
            Postman, CI/CD, etc.) to start a Zapflow workflow by sending an HTTP
            request.
          </p>

          <p className="text-sm text-gray-700">
            Zapflow generates a unique webhook URL. Whenever data is sent to this
            URL, the workflow starts and the request payload becomes available
            inside actions.
          </p>

          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Create a Zap and copy the generated webhook URL.</li>
            <li>Send a <b>POST</b> request with JSON data.</li>
            <li>Use payload fields as placeholders in actions.</li>
          </ol>

          <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST {{WEBHOOK_URL}} \\
-H "Content-Type: application/json" \\
-d '{"name":"Ankit","email":"ankit@example.com"}'`}
          </pre>

          <p className="text-sm">
            Available placeholders:
            <br />
            <code>{"{{name}}"}</code> → User name<br />
            <code>{"{{email}}"}</code> → User email
          </p>
        </section>

        {/* Google Form */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">📝 Google Form Trigger</h2>

          <p className="text-sm text-gray-700">
            Google Forms do not support webhooks natively. To solve this, Zapflow
            uses <b>Google Apps Script</b> to forward form submissions to a webhook.
          </p>

          <p className="text-sm text-gray-700">
            Every time a user submits a form, the script collects all answers,
            converts them into JSON, and sends them to Zapflow.
          </p>

          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Open your Google Form.</li>
            <li>Click ⋮ → <b>Script editor</b>.</li>
            <li>Paste the script below.</li>
            <li>Add an <b>On form submit</b> trigger.</li>
          </ol>

          <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`var POST_URL = "YOUR_WEBHOOK_URL";

function onSubmit(e) {
  var responses = e.response.getItemResponses();
  var payload = {};

  responses.forEach(r => {
    payload[r.getItem().getTitle()] = r.getResponse();
  });

  UrlFetchApp.fetch(POST_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}`}
          </pre>

          <p className="text-sm">
            Example placeholders:
            <br />
            <code>{"{{Name}}"}</code> → Name field<br />
            <code>{"{{Email}}"}</code> → Email field
          </p>
        </section>

        {/* GitHub */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🐙 GitHub Trigger</h2>

          <p className="text-sm text-gray-700">
            GitHub Triggers allow Zapflow to react to repository events such as
            pushes, pull requests, issues, and stars.
          </p>

          <p className="text-sm text-gray-700">
            GitHub sends an event payload to Zapflow’s webhook whenever a selected
            event occurs. You can then use this data in actions.
          </p>

          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>Go to GitHub → Repository → Settings → Webhooks</li>
            <li>Add Zapflow Webhook URL</li>
            <li>Set content type to <code>application/json</code></li>
            <li>Select events (Push, PR, Issues, Stars)</li>
          </ol>

          <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "pull_request": {
    "title": "Add feature",
    "user": { "login": "ankit" }
  }
}`}
          </pre>

          <ul className="list-disc pl-5 text-sm">
            <li><code>{"{{pull_request.title}}"}</code> → PR title</li>
            <li><code>{"{{pull_request.user.login}}"}</code> → PR author</li>
          </ul>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">⚡ Actions</h2>

          <p className="text-sm text-gray-700">
            Actions define what happens <b>after a trigger fires</b>. Zapflow
            supports multiple action types, all of which can use placeholders
            from trigger data.
          </p>

          <h3 className="font-semibold">📧 Email Action</h3>
          <h3 className="font-semibold">📧 Email Action</h3>

<p className="text-sm text-gray-700">
  The Email Action allows you to send emails automatically when a trigger
  fires. The email content can be fully dynamic using data received from the
  trigger (Webhook, Google Form, GitHub, etc.).
</p>

<p className="text-sm text-gray-700">
  This is commonly used for sending confirmations, notifications, alerts,
  or follow-up emails without any manual intervention.
</p>

<ul className="list-disc pl-5 text-sm space-y-1">
  <li>
    <b>To</b>: Recipient email address. This can be static
    (<code>user@example.com</code>) or dynamic using placeholders like
    <code>{" {{email}}"}</code>.
  </li>
  <li>
    <b>Subject</b>: The subject line of the email. Supports placeholders.
    <br />
    Example: <code>New submission from {"{{name}}"}</code>
  </li>
  <li>
    <b>Body</b>: The main email content. You can write plain text or formatted
    content and insert placeholders anywhere.
  </li>
</ul>

<p className="text-sm mt-2">
  <b>Example Email Configuration:</b>
</p>

<pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`To: {{email}}
Subject: Thanks for contacting us, {{name}}

Hello {{name}},

We have received your message and will get back to you shortly.

Regards,
Zapflow Team`}
</pre>

<p className="text-sm text-gray-700">
  In the above example, <code>{"{{email}}"}</code> and <code>{"{{name}}"}</code>
  are automatically replaced with actual values from the trigger payload.
</p>


          <h3 className="font-semibold">💬 Discord Action</h3>

<p className="text-sm text-gray-700">
  The Discord Action allows you to send automated messages to a Discord channel
  whenever a Zapflow trigger fires. This is useful for team notifications,
  alerts, and real-time updates.
</p>

<p className="text-sm text-gray-700">
  Zapflow uses <b>Discord Webhooks</b>, which let external services post messages
  directly into a channel without requiring a bot.
</p>

<ul className="list-disc pl-5 text-sm space-y-1">
  <li>
    Go to your Discord server → <b>Server Settings</b> → <b>Integrations</b>.
  </li>
  <li>
    Create a new <b>Webhook</b> and select the target channel.
  </li>
  <li>
    Copy the generated Webhook URL.
  </li>
  <li>
    Paste the Webhook URL into the Discord Action in Zapflow.
  </li>
</ul>

<p className="text-sm mt-2">
  <b>Message Field:</b>  
  You can write any message and include placeholders from the trigger payload.
</p>

<pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`🚀 New GitHub Pull Request!

Repository: {{repository.name}}
Title: {{pull_request.title}}
Author: {{pull_request.user.login}}`}
</pre>

<p className="text-sm text-gray-700">
  When the trigger fires, Zapflow replaces the placeholders with actual data and
  sends the formatted message to your Discord channel.
</p>
<h3 className="font-semibold">📨 Telegram Action</h3>

<p className="text-sm text-gray-700">
  The Telegram Action allows Zapflow to send messages directly to a Telegram chat
  or group using a Telegram bot. This is ideal for instant alerts on mobile.
</p>

<p className="text-sm text-gray-700">
  Telegram actions work using the <b>Telegram Bot API</b>, which requires a bot
  token and a chat ID.
</p>

<ul className="list-disc pl-5 text-sm space-y-1">
  <li>
    Open Telegram and start a chat with <b>@BotFather</b>.
  </li>
  <li>
    Create a new bot and copy the <b>Bot Token</b>.
  </li>
  <li>
    Add the bot to your chat or group.
  </li>
  <li>
    Get the <b>Chat ID</b> using Telegram API or helper bots.
  </li>
</ul>

<p className="text-sm mt-2">
  <b>Message Field:</b>  
  Write the message content and insert placeholders anywhere.
</p>

<pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto">
{`📩 New Form Submission

Name: {{Name}}
Email: {{Email}}
Message: {{Message}}`}
</pre>

<p className="text-sm text-gray-700">
  Zapflow automatically replaces placeholders with real submission values and
  delivers the message instantly to your Telegram chat.
</p>

        </section>
        <section className="space-y-6 border-t pt-10">
  <div className="flex items-center gap-3">
    
    <h2 className="text-2xl font-semibold">✨ Building with AI</h2>
  </div>

  <p className="text-sm text-gray-700">
    Zapflow's AI Builder allows you to create complex automations using <b>Natural Language</b>. 
    Instead of manually picking triggers and actions, you can simply describe your workflow, and the 
    AI will architect the logic for you.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
      <h4 className="font-bold text-blue-900 mb-2 text-sm uppercase">How to use</h4>
      <ul className="list-disc pl-5 text-sm space-y-2 text-blue-800">
        <li>Navigate to the <b>AI Builder</b> from the Create page.</li>
        <li>Describe your workflow (e.g., <i>"When I get a new GitHub PR, send a message to Discord"</i>).</li>
        <li>The AI generates the sequence of <b>ZapCells</b> automatically.</li>
        <li>Review and <b>Publish</b>.</li>
      </ul>
    </div>

    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
      <h4 className="font-bold text-purple-900 mb-2 text-sm uppercase">Pro Tips</h4>
      <ul className="list-disc pl-5 text-sm space-y-2 text-purple-800">
        <li><b>Be specific:</b> Mention the app names (Discord, Gmail, Telegram).</li>
        <li><b>Multi-step:</b> You can ask for multiple actions at once.</li>
        <li><b>Placeholder mapping:</b> The AI is smart enough to map <code>{"{{email}}"}</code> from a webhook to the "To" field in an Email action.</li>
      </ul>
    </div>
  </div>

  <div className="space-y-3">
    <p className="font-medium text-sm">Example Prompts:</p>
    <div className="space-y-2">
      {[
        "Send an email to the customer and a Discord alert when a new Webhook is received.",
        "When someone stars my GitHub repo, send me a Telegram message with their username.",
        "Create a Notion database item whenever a Google Form is submitted."
      ].map((prompt, i) => (
        <div key={i} className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-600 italic border-l-4 border-blue-500">
          "{prompt}"
        </div>
      ))}
    </div>
  </div>
</section>
      </div>
      {/* AI Builder Section */}

    </>
  );
}
