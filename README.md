# Project LOOP — AI Customer-Feedback Intelligence Platform

**Project LOOP** ("Close the loop on customer feedback") is a corporate-grade, multi-tenant web application designed to help product and engineering teams ingest, synthesize, and act on high-volume customer feedback from multiple channels. It turns raw touchpoints into structured themes, sentiment trends, grounded Q&A, and Voice-of-Customer executive digests.

---

## 🌐 Live Application & Links

* **Live Deployment URL:** [https://project-loop.ai.studio](https://project-loop.ai.studio)[cite: 1]
* **GitHub Repository:** [https://github.com/ayushpatil004007/project-loop-ai](https://github.com/ayushpatil004007/project-loop-ai)[cite: 1]

---

## 🔑 Demo & Evaluator Accounts (RBAC)

Use the built-in 1-click role switcher or the credentials below to test Role-Based Access Control (RBAC) permissions:

| Role | Email | Permissions / Scope |
| :--- | :--- | :--- |
| **Admin** | `admin@loopdemo.com` | Full workspace management, member invitations, feedback triage, and data modification. |
| **Analyst**[cite: 1] | `analyst@loopdemo.com` | Feedback ingestion, status updates (`NEW` $\rightarrow$ `REVIEWED` $\rightarrow$ `ACTIONED`), AI re-classification, and VoC report generation[cite: 1]. |
| **Viewer**[cite: 1] | `viewer@loopdemo.com` | Read-only access across dashboards, inbox, themes, and reports. Mutating actions are restricted[cite: 1]. |

---

## 🚀 Key Features

* **Multi-Tenant Workspace Isolation:** Strict data boundaries ensuring queries and data records are filtered and scoped by `workspaceId`[cite: 1].
* **Multi-Channel Ingestion:** Manual single-entry form, CSV bulk upload parser, and one-click channel simulation (Support Tickets, App Store Reviews, NPS Surveys, Sales Call Notes, and Community Posts)[cite: 1].
* **Feedback Inbox & Triage:** Server-side paginated data table with full-text search, multi-filter dropdowns (Channel, Sentiment, Status, Date), and inline status workflows[cite: 1].
* **Analytics Dashboard:** Real-time metrics including total feedback count, percentage negative sentiment, active themes, and interactive charts (Volume over time, Sentiment breakdown donut, Top 5 themes)[cite: 1].
* **Theme Clustering & Spike Detection:** Automatic categorization of feedback items into high-level themes with week-over-week trend and spike indicators[cite: 1].
* **Ask LOOP (Grounded AI Q&A):** Semantic retrieval pipeline (RAG) that answers plain-English questions strictly from retrieved feedback context with explicit citations[cite: 1].
* **Voice-of-Customer (VoC) Digest:** Pre-computed statistical summaries highlighting sentiment shifts, top themes, verbatim quotes, and actionable recommendations with PDF/print export[cite: 1].

---

## 🛠️ Technology Stack

* **Frontend:** React / Next.js, Tailwind CSS, Lucide Icons, Chart.js / Recharts[cite: 1]
* **Backend & API:** RESTful API route handlers with role and workspace guards[cite: 1]
* **Data Layer:** PostgreSQL / Supabase with multi-tenant relational schemas[cite: 1]
* **AI & Intelligence:** Gemini / Claude API with structured JSON schemas and retrieval grounding[cite: 1]
* **Validation & Security:** Zod runtime schema validation, session management, and RBAC authorization[cite: 1]

---

## 📐 Data Architecture

The core data model enforces multi-tenancy across all tenant-owned entities[cite: 1]:

* `Workspace`: `id`, `name`, `createdAt`[cite: 1]
* `User`: `id`, `name`, `email`, `passwordHash`, `role` (`ADMIN` | `ANALYST` | `VIEWER`), `workspaceId`[cite: 1]
* `Feedback`: `id`, `content`, `channel`, `customerLabel`, `sentiment` (`POS` | `NEU` | `NEG`), `sentimentScore` (-1.0 to 1.0), `status` (`NEW` | `REVIEWED` | `ACTIONED`), `featureArea`, `createdAt`, `workspaceId`[cite: 1]
* `Theme`: `id`, `name`, `description`, `color`, `workspaceId`[cite: 1]
* `FeedbackTheme`: `feedbackId`, `themeId`, `confidence`[cite: 1]
* `Report`: `id`, `title`, `periodStart`, `periodEnd`, `contentJson`, `generatedBy`, `workspaceId`, `createdAt`[cite: 1]

---

## 💻 Local Setup & Development

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ayushpatil004007/project-loop-ai.git](https://github.com/ayushpatil004007/project-loop-ai.git)
   cd project-loop-ai
