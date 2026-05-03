# VoteIndia - AI-Powered Election Assistant 🇮🇳

An enterprise-grade, production-ready AI Election Assistant designed for Indian voters. Built using the Next.js App Router, Tailwind CSS, Framer Motion, and Google's Gemini Vertex AI to provide a highly interactive, multilingual, and accessible experience.

## 🚀 Features

- **Google AI Chat Assistant**: Conversational agent powered by Gemini (`@google/genai`), guiding users on how to vote, required documents, and polling information.
- **Multilingual Support**: Switch seamlessly between English, Hindi, Tamil, Telugu, Bengali, and Marathi.
- **Voice Interaction**: Speech-to-Text and Text-to-Speech support for answering queries out loud, increasing accessibility for all users.
- **First-Time Voter Mode**: A personalized, interactive step-by-step checklist to guide new voters from registration to voting day.
- **Gamification**: "Are you ready to vote?" Quiz to engage users and test their electoral knowledge.
- **Interactive Election Timeline**: A visual timeline detailing the stages of an election process.
- **Location-Based Polling Info**: An interactive map view allowing users to detect their location and view nearby polling stations.

## 🛠️ Tech Stack (Google Tech Stack Integration)

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **AI**: Google Gemini (Vertex AI / `@google/genai`)
- **Speech**: Web Speech API (Chrome/Google STT & TTS natively)
- **UI & Icons**: Lucide React, Framer Motion

## 📦 Setup & Installation

1. **Clone the repository / Navigate to directory**:
   ```bash
   cd votingAwareness
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy the example environment file and add your actual API keys:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Add your `GEMINI_API_KEY` to `.env.local` to enable the AI assistant.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Architecture & Design
- **Accessibility First**: Semantic HTML and voice assistance for better inclusivity.
- **Responsive Layout**: Designed for mobile-first with Tailwind CSS, ensuring accessibility across devices.
- **Performance**: Edge-ready API routes and optimized Next.js server components.

## 🤝 Next Steps / Potential Integrations
- Integrate `Firebase Auth` for personalized user journey persistence across devices.
- Store Gamification high scores inside `Firebase Firestore`.
- Configure `Firebase Hosting` for rapid deployment.
