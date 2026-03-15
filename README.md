# ⚡ ZapFlow AI

**ZapFlow AI** is a next-generation workflow automation platform that bridges the gap between natural language intent and robust technical execution. Whether you prefer the speed of **AI-driven generation** or the granular control of a **Manual Builder**, ZapFlow allows you to create complex, multi-step workflows that automate your busy work.



---

## 🚀 Key Capabilities

### 🤖 AI-Powered Workflow Generation
Stop configuring triggers and actions manually. Simply describe your workflow in plain English, and our Llama 3.3-powered engine will architect the logic, map the fields, and configure the metadata for you.
* **Prompt:** *"When I receive a webhook response, send a Discord message with the user's name and email."*
* **Result:** A fully configured, multi-step automation ready to publish.

### 🛠 Manual Workflow Builder
For complex logic that requires precise configuration, use our **Manual Builder**.
* Hand-pick your triggers (Webhook, GitHub, Google Forms).
* Chain multiple actions (Discord, Telegram, Email, Notion).
* Fine-tune action metadata and dynamic placeholder mapping.

### ⚡ Distributed Event-Driven Engine
Built for scale and reliability, ZapFlow utilizes an asynchronous, decoupled architecture.
* **Pipeline:** `Trigger` → `Queue (Kafka/Redis)` → `Worker` → `Action`.
* Ensures fault tolerance, high throughput, and seamless handling of background tasks.

---

## 🧠 Dynamic Execution Flow

ZapFlow uses an intelligent **Placeholder Mapping** system. Trigger payloads (e.g., from a GitHub Webhook) are parsed and passed to downstream actions as variables.



---

## 🔐 Security First: The Credential Vault
We take security seriously. All user credentials (API tokens, bot tokens, webhooks) are **encrypted at rest** in our PostgreSQL database. Secrets are only injected into workflow metadata during the final execution step, ensuring sensitive data is never exposed in plain text.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **AI Engine** | Groq SDK (Llama 3.3 70B) |
| **Infrastructure** | Kafka/Redis (Queues), PostgreSQL (Data) |
| **Frontend** | Next.js, React, TailwindCSS |
| **Deployment** | Docker, AWS EC2 |

---



## 🔐 Secure Secret Management

User credentials are encrypted before storage.

Secrets are automatically injected into action metadata during workflow execution.

Example metadata:

```json
{
 "message": "New response from {{response.name}} {{response.email}}",
 "botToken": "encrypted_token",
 "chatId": "-50587562054"
}
```

---

## 🧠 Dynamic Variables

ZapFlow supports runtime variables.

Examples:

```
{{response.name}}
{{response.email}}
{{comment.amount}}
```

These variables are replaced with real data when the workflow runs.

---

# 🏗️ Architecture

```
                Frontend (Next.js)
                        │
                        ▼
                 API Server (Node.js)
                        │
                        ▼
                AI Workflow Engine
                  (Groq LLM)
                        │
                        ▼
                PostgreSQL Database
                        │
                        ▼
                   Event Queue
                 (Redis / Kafka)
                        │
                        ▼
                   Worker Engine
                Executes Automations
```

---

# 🛠 Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM

### AI
- Groq SDK
- Llama 3.3 70B

### Database
- PostgreSQL

### Queue
- Redis / Kafka

### Frontend
- Next.js
- React
- TailwindCSS

---



# ⚙️ Installation

### 1. Clone the repository

```
git clone https://github.com/Xxyyzzpandey/zapflow_AI.git
cd zapflow_AI
```

### 2. Install dependencies

```
npm install
```

### 3. Setup environment variables

Create `.env` file:

```
DATABASE_URL=
GROQ_API_KEY=
JWT_SECRET=
REDIS_URL=
```

### 4. Run database migrations

```
npx prisma migrate dev
```

### 5. Start the development server

```
npm run dev
```

---

# 📌 Example Workflow

Prompt:

```
When webhook receives payment response send telegram message with user email and amount
```

Generated workflow:

```
Webhook Trigger
      ↓
Telegram Send Message
```

Telegram message sent:

```
New payment from {{response.email}} of {{response.amount}}
```

---

# 🔮 Future Improvements

- Automation marketplace
- AI workflow suggestions

---

# 👨‍💻 Author

**Ankit Pandey**

---

# ⭐ Support

If you found this project useful, please give it a **star ⭐ on GitHub**.