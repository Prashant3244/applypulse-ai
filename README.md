# ⚡ ApplyPulse AI: Universal Workday & ATS Job Application Copilot

**ApplyPulse AI** is a high-performance Chrome Extension (Manifest V3) engineered to automate the most dreaded part of job hunting: manually re-filling hundreds of repetitive fields on Workday, Greenhouse, Lever, Ashby, BambooHR, and corporate career portals.

---

## 🚀 Key Features

1. **⚡ 1-Click Form Autofill**
   - Intelligently populates Personal Information, Contact, Address, Education, Work Experience, and EEOC/Work Authorization fields.
   - Built with framework-native synthetic event dispatchers to guarantee compatibility with modern SPA frameworks (React, Angular, Vue, and Workday custom DOMs).

2. **✨ Contextual AI Answer Generator**
   - Automatically detects open-ended questions (*"Why do you want to work here?"*, *"Describe a technical challenge"*, *"Salary expectations"*).
   - Injects a `✨ AI Draft Answer` badge directly above textareas that writes tailored, high-converting 2-3 sentence answers matching the candidate's skills and the company's domain.

3. **📊 Built-in Job Tracker CRM & CSV Export**
   - Save any job application with one click directly from the floating HUD.
   - Track application stages (`Applied`, `Interviewing`, `Offer`, `Rejected`).
   - Export your entire pipeline directly into a clean CSV spreadsheet ready for Google Sheets or Excel.

4. **🔒 Privacy-First Architecture**
   - 100% local in-browser storage.
   - Zero selling or tracking of personal resume data.
   - Safe "Human-in-the-loop" execution—never blindly submits applications without candidate review.

5. **💰 Zero-Server Monetization Engine (ExtensionPay / Stripe)**
   - Free Tier: 5 autofills/day.
   - Pro Tier ($14.99/mo): Unlimited autofills, AI question answers, and multi-profile switcher.
   - Built-in Developer Test Mode switch in Settings to test Pro features locally.

---

## 🛠️ How to Install & Test Locally

1. Open Google Chrome, Brave, Edge, or Kiwi Browser (Android).
2. Navigate to: `chrome://extensions`
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the directory:
   ```bash
   /data/data/com.termux/files/home/applypulse-extension
   ```
   *(Or the mirrored copy in `/storage/emulated/0/Download/applypulse-extension`)*
6. The extension will appear with the vibrant indigo/cyan **ApplyPulse AI** icon.

---

## 🧪 Testing the Extension

1. Open any job application link (e.g. any Workday jobs link `https://*.myworkdayjobs.com/*`, Greenhouse `https://boards.greenhouse.io/*`, or Lever `https://jobs.lever.co/*`).
2. The **ApplyPulse AI** pill appears at the bottom-right corner.
3. Click **⚡ Autofill**: watch inputs populate and highlight with subtle emerald rings.
4. Look for any open-ended text questions: click the **✨ AI Draft Answer** badge to generate a contextual response.
5. Click **💾 Save to Job Tracker** to record the application.
6. Click the extension icon in your Chrome toolbar to view your saved applications or export them to CSV.
