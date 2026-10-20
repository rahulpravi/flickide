# ⚡ FlickIDE

<p align="center">
  <img src="public/icon.png" alt="FlickIDE Logo" width="100" height="100" style="border-radius: 20%;" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>A mobile-first, lightweight web-based code editor and execution environment with a built-in Multi-AI assistant.</strong>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-automated-android-apk-builds">Android CI/CD</a> •
  <a href="#-how-the-ai-integration-works">AI Architecture</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" />
</p>

---

## 📖 Overview

**FlickIDE** is an ultra-fast, mobile-optimized IDE designed for developers who want to write, test, and preview code seamlessly on phones, tablets, or modern browsers. Built with Next.js static export and wrapped with Capacitor, FlickIDE pairs a full-featured CodeMirror editor with an offline-first file explorer, interactive runtime debugging, and an intelligent multi-model AI coding assistant.

Whether you are sketching a quick HTML/CSS mockup on your Android phone, testing JavaScript algorithms on the go, or generating code using cutting-edge AI models, FlickIDE delivers a frictionless development environment without requiring complex server infrastructure or heavy desktop software.

---

## ✨ Key Features

- 📁 **Local File System Explorer**
  - Full CRUD operations: Create, rename, delete, and inspect files and folders entirely on-device.
  - Offline-first persistence backed by **IndexedDB**, ensuring zero data loss across reloads.
  - Tree-view navigation with search, expand/collapse, and file metadata badges.

- 💻 **Smart Mobile-First Code Editor**
  - Powered by **CodeMirror 6** with language support for **JavaScript, HTML, CSS, and JSON**.
  - Sleek **One Dark** color theme with syntax highlighting and auto-completion.
  - **Quick-Key Row**: Mobile-friendly accessory bar with high-frequency coding symbols (`{`, `}`, `(`, `)`, `[`, `]`, `;`, `"`, `'`, `=`, `<`, `>`, `/`, `Tab`) and subtle haptic touch feedback.
  - Built-in **Prettier** document formatting (`Fmt` button).

- ⚡ **Live Execution Engine & Sandboxed Debugger**
  - **Interactive Webview (iframe)**: Instant real-time rendering for HTML/CSS pages.
  - **Sandboxed JavaScript Runner**: Safely executes JS code inside an isolated environment.
  - **Intercepted Virtual Console**: Real-time logging capturing `console.log`, `console.info`, `console.warn`, and `console.error` with timestamps and sub-millisecond execution benchmarking.

- 🤖 **Multi-AI Chat Assistant**
  - Unified AI panel supporting multiple industry-leading LLM providers:
    - **Google Gemini** (`gemini-2.5-flash` / Free tier)
    - **ChatGPT / OpenAI** (`gpt-4o-mini`)
    - **Grok / xAI** (`grok-2-latest`)
    - **Groq** (`llama-3.3-70b-versatile` / ultra-fast inference)
    - **OpenRouter** (`deepseek/deepseek-chat` and any open-source model)
  - One-click code insertion directly into the active editor buffer.

- 🔑 **1-Click AI Login (OpenRouter OAuth PKCE)**
  - Sign in seamlessly with your Google/Gmail account via OpenRouter PKCE OAuth.
  - Eliminates tedious manual API key generation, copying, and pasting.
  - Smart automatic provider detection when manually pasting API keys (`AIza` ➔ Gemini, `gsk_` ➔ Groq, `xai-` ➔ Grok, `sk-` ➔ OpenAI, `sk-or-` ➔ OpenRouter).

- 📱 **Automated Android APK CI/CD**
  - Pre-configured GitHub Actions workflow automatically builds an **Android Debug APK** on every Git push.
  - Zero local Android Studio setup needed to generate testable mobile binaries.

---

## 🛠️ Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Core Framework** | [Next.js 14](https://nextjs.org/) (Static Export) | High-performance SPA frontend with static HTML/JS compilation (`output: 'export'`) |
| **UI & Styling** | [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) | Mobile-responsive design, dark aesthetics, and sleek layout controls |
| **Icons & Design** | [Lucide React](https://lucide.dev/) | Clean, consistent icons for IDE navigation and tools |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight, reactive state stores for files, tabs, UI, and AI rotation |
| **Code Editor** | [CodeMirror 6](https://codemirror.net/) | Modular code editor core, language packs, syntax highlighting, and themes |
| **Storage** | [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via [idb](https://github.com/jakearchibald/idb) | Client-side persistent storage for file trees and user configurations |
| **Formatter** | [Prettier](https://prettier.io/) | In-browser code beautification and formatting |
| **Mobile Shell** | [Capacitor 6](https://capacitorjs.com/) | Native runtime bridge converting web assets to an Android package (`com.flickide.app`) |
| **CI / CD** | [GitHub Actions](https://github.com/features/actions) | Cloud build pipeline with Java Temurin 21 and Gradle to produce APK artifacts |
| **AI Integration** | REST APIs + [OpenRouter OAuth](https://openrouter.ai/) | PKCE OAuth flow and OpenAI-compatible multi-provider endpoints |

---

## 🚀 Getting Started / Local Setup

Follow these steps to run FlickIDE locally on your development machine:

### Prerequisites

- **Node.js**: v18.x or v20.x or higher
- **npm**: v9.x or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/flickide.git
cd flickide
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. You can toggle responsive device mode (`Ctrl + Shift + M` / `Cmd + Shift + M`) in Chrome or Firefox DevTools to experience the mobile layout.

### 4. Build Static Production Bundle

FlickIDE is configured for static web export:

```bash
npm run build
```

This compiles your application and outputs all static HTML, CSS, and JavaScript files to the `out/` folder, ready for deployment or Capacitor native synchronization.

---

## 🤖 How the AI Integration Works

FlickIDE features an intelligent, multi-tier AI subsystem designed for accessibility and privacy.

```
                    ┌───────────────────────────────┐
                    │      FlickIDE AI Panel        │
                    └──────────────┬────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────┐             ┌─────────────────────────────┐
│ 1-Click OpenRouter OAuth    │             │  Direct API Key / Manual    │
│ (PKCE Authorization Flow)   │             │  (Auto-Detect Provider)     │
└──────────────┬──────────────┘             └──────────────┬──────────────┘
               │                                           │
               ▼                                           ▼
       Google / Gmail Login                   Gemini | OpenAI | Grok | Groq
               │                                           │
               └───────────────────┬───────────────────────┘
                                   ▼
                    ┌─────────────────────────────┐
                    │    Unified AI Service       │
                    │  (lib/ai/multiAiService.ts) │
                    └──────────────┬──────────────┘
                                   ▼
                    Streaming Code Suggestions &
                    1-Click Insertion into Editor
```

### 1. 1-Click OpenRouter OAuth (PKCE Flow)
Instead of forcing users to sign up for developer consoles, generate tokens, and paste secrets, FlickIDE leverages **OAuth 2.0 PKCE** (`lib/ai/openrouterOAuth.ts`):
1. **Challenge Generation**: Creates a cryptographically random code verifier (`window.crypto`) and computes a SHA-256 code challenge.
2. **Google Auth**: Directs the user to OpenRouter's Google authorization screen.
3. **Key Exchange**: The callback exchanges the temporary authorization code for an API key entirely in-browser, storing it securely in client storage.

### 2. Direct API Key Multi-Provider Support
If you prefer bringing your own dedicated keys, FlickIDE supports:
- **Google Gemini**: Uses the official Google Generative Language REST API (`gemini-2.5-flash`).
- **OpenAI / ChatGPT**: Connects to `api.openai.com/v1/chat/completions` (`gpt-4o-mini`).
- **Grok (xAI)**: High-performance coding completions via `api.x.ai/v1`.
- **Groq**: Near-instant inference using `llama-3.3-70b-versatile`.
- **Key Auto-Detection**: When you paste an API key into the Key Manager, FlickIDE identifies the provider prefix automatically (e.g., `AIza...` triggers Google Gemini).

---

## 📱 Automated Android APK Builds (GitHub Actions)

FlickIDE is fully wired with an automated CI/CD pipeline (`.github/workflows/android-build.yml`). You don't need Android Studio installed locally to build an APK!

### How the Workflow Operates:

1. **Trigger**: Pushing code to `main` or `master` branches (or triggering manually via GitHub's **Actions** tab `workflow_dispatch`).
2. **Environment Setup**: Provisions an `ubuntu-latest` runner with **Node.js 20** and **Java Temurin 21**.
3. **Web Build**: Runs `npm install` and compiles the Next.js app to static assets in `out/`.
4. **Capacitor Android Sync**:
   - Installs `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`.
   - Initializes `FlickIDE` (`com.flickide.app`) targeting the `out` web directory.
   - Syncs all web assets into the native Android Gradle project.
5. **Gradle Build**: Runs `./gradlew assembleDebug` to produce the compiled binary.
6. **Artifact Output**: The resulting `app-debug.apk` is uploaded as an artifact named **`FlickIDE-Debug-APK`**.

### Downloading the Android APK:

1. Navigate to your repository on GitHub.
2. Click on the **Actions** tab at the top.
3. Select the latest run of **Build Android APK**.
4. Scroll down to the **Artifacts** section at the bottom of the summary page.
5. Click **FlickIDE-Debug-APK** to download the ZIP file containing the installable `.apk`.
6. Transfer the `.apk` to your Android device and install it (enable "Install unknown apps" if prompted).

### Optional: Local Android Run (For Android Developers)

If you have Android Studio and Android SDK installed locally:

```bash
# Build static web assets
npm run build

# Install Capacitor packages
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize and sync Android platform
npx cap add android
npx cap sync android

# Open project in Android Studio
npx cap open android
```

---

## 📂 Project Structure

```
FlickIDE/
├── .github/
│   └── workflows/
│       └── android-build.yml       # Automated Android APK CI/CD pipeline
├── app/
│   ├── globals.css                 # Global styling & Tailwind utilities
│   ├── layout.tsx                  # Root Next.js layout & metadata
│   ├── manifest.ts                 # Progressive Web App (PWA) manifest
│   └── page.tsx                    # Main IDE orchestrator view
├── components/
│   ├── ai/
│   │   ├── AIChatPanel.tsx         # Slide-over AI chat interface
│   │   ├── KeyManagerModal.tsx     # Provider selection & OAuth login modal
│   │   └── MessageItem.tsx         # Rendered chat message with code actions
│   ├── editor/
│   │   ├── CodeEditor.tsx          # CodeMirror 6 editor component
│   │   └── QuickKeyRow.tsx         # Mobile accessory keyboard bar
│   ├── files/
│   │   └── FileExplorer.tsx        # File tree explorer with CRUD actions
│   ├── layout/
│   │   ├── BottomNav.tsx           # Mobile navigation tab bar
│   │   ├── Header.tsx              # Top app bar with actions and status
│   │   └── StatusBar.tsx           # Editor footer showing line, col & file size
│   ├── panel/
│   │   ├── BottomPanel.tsx         # Drawer holding terminal, debug & problems
│   │   ├── DebugTab.tsx            # Live HTML preview & JS sandboxed runner
│   │   ├── ProblemsTab.tsx         # Linter and diagnostic reports
│   │   └── TerminalTab.tsx         # Interactive virtual shell
│   └── ui/
│       └── Logo.tsx                # FlickIDE branding component
├── lib/
│   ├── ai/
│   │   ├── multiAiService.ts       # Unified LLM provider integration
│   │   └── openrouterOAuth.ts      # OpenRouter PKCE OAuth handler
│   ├── db/
│   │   └── indexedDB.ts            # IndexedDB schema and operations
│   └── utils/
│       └── formatters.ts           # File size, date, and string formatting
├── stores/
│   ├── apiRotationStore.ts         # Multi-key rotation & provider state
│   ├── fileSystemStore.ts          # Zustand store for file tree state
│   └── uiStore.ts                  # Layout and panel visibility state
├── next.config.mjs                 # Next.js static export configuration
├── tailwind.config.ts              # Tailwind dark color scheme & animations
└── package.json                    # Project dependencies and build scripts
```

---

## 🤝 Contributing

Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions to FlickIDE are **greatly appreciated**!

1. **Fork the Project**
2. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<p align="center">
  Built with ❤️ for mobile-first developers everywhere.
</p>
