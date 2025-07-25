# GenAI Health Buddy 🤖

GenAI Health Buddy is an AI-powered web application designed to be a personal health assistant. It leverages the Google Gemini API to provide intelligent analysis of medical prescriptions, detailed information about medicines, preliminary symptom checks, and an interactive chat for health-related queries.

![GenAI Health Buddy Screenshot](https://storage.googleapis.com/pai-images/5903e1e2474847e1933e085698b6a378.png)

---

## ✨ Core Features

-   **📄 Prescription Analysis**: Upload a photo of a medical prescription. The AI extracts medications, dosages, timings, and other vital information into a clean, easy-to-read summary.
-   **📱 WhatsApp Integration**: Seamlessly send the generated prescription summary to a patient's WhatsApp number via the **Meta WhatsApp Business API**, ensuring information is accessible and shareable.
-   **💊 Medicine Information**: Search for any medicine to get a detailed overview, including its common uses, recommended dosage, potential side effects, and important precautions.
-   **🩺 Symptom Checker**: Describe your symptoms in plain language to receive a preliminary AI analysis, which includes possible conditions, actionable advice, and an urgency assessment.
-   **💬 Interactive Health Chat**: Engage in a conversation with an AI health buddy. Ask about medicine interactions, wellness tips, or general health questions in a friendly, chat-based interface.
-   **📥 Export to PDF**: Download and save prescription summaries or medicine information cards as PDF files for offline access or record-keeping.
-   **🎨 Sleek & Responsive UI**: A modern, mobile-first design built with React and Tailwind CSS, featuring a dark mode toggle for comfortable viewing in any lighting.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) for all generative tasks.
-   **Backend**: Node.js, Express
-   **Notifications**: **Meta WhatsApp Business API**
-   **Tooling**: A simple static file server (e.g., `npx serve`). The project uses a modern, no-build setup with native ES Modules and `importmap`.

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended for native `fetch` support)
-   `npm` or `yarn` package manager
-   A [Google Gemini API Key]
-   A [Meta Developer Account](https://developers.facebook.com/) and a configured Meta App with the WhatsApp Business Platform.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd genai-health-buddy
```

### 2. Configure Environment Variables

You'll need to create two `.env` files: one for the frontend (in the root directory) and one for the backend. The application code expects these to be loaded into the environment.

**A. Frontend API Key (Root Directory)**

1.  Create a file named `.env` in the project's root folder.
2.  Add your Google Gemini API key:

    ```env
    # .env
    API_KEY=your_api_key
    ```

**B. Backend Meta Credentials (`/backend` directory)**

1.  Navigate to the `backend` directory: `cd backend`
2.  Create a file named `.env` inside the `backend` folder.
3.  Add your Meta WhatsApp Business API credentials. You can get these from your app's dashboard under "WhatsApp" > "API Setup".

    ```env
    # backend/.env
    META_PHONE_NUMBER_ID=your_phone_number_id
    META_ACCESS_TOKEN=your_temporary_or_permanent_access_token
    ```

### 3. Install Dependencies & Run

You need to run the backend server and the frontend development server in two separate terminals.

**A. Start the Backend Server**

```bash
# In your first terminal, from the /backend directory
cd backend
npm install
node server.js
```

The backend server will start on `http://localhost:3001`.

**B. Start the Frontend App**

Since this project uses ES modules via an `importmap`, you don't need to run `npm install` for the frontend. You just need a simple local server to serve the `index.html` file.

A common way to do this is with the `serve` package:

```bash
# In your second terminal, from the project's root directory
npx serve
```

The server will provide a URL, typically `http://localhost:3000`. Open this URL in your browser to use the application.

---

## 🔐 Environment Variables Summary

| Variable                   | File Location      | Description                                                              |
| -------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `API_KEY`                  | `./.env`           | Your Google Gemini API Key for all AI-related features.                  |
| `META_PHONE_NUMBER_ID`     | `./backend/.env`   | The Phone Number ID from your Meta App's WhatsApp API setup page.        |
| `META_ACCESS_TOKEN`        | `./backend/.env`   | A valid access token for the Meta WhatsApp Business API.                 |

---

## ⚠️ Disclaimer

**This application is for demonstration purposes only.** The information it provides is generated by an AI and is **not a substitute for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
