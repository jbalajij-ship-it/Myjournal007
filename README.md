# Journal and Reflection Assistant (ReflectAI)

A secure, private, user-authenticated journaling and reflection assistant powered by **Google Gemini 3.6 Flash** and **Cloud Firestore**, with federated Google Authentication and strict cryptographic user data isolation.

---

## 🛡️ Architecture & Threat Model Summary

| Threat Zone | Potential Vulnerability | OWASP Mapping | Countermeasure Implemented |
| :--- | :--- | :--- | :--- |
| **Input Surfaces** | Malformed payloads, malicious injections in reflections | OWASP A03 / LLM02 | Express `body-parser` JSON decoding mounted first; recursive undefined-stripping prior to Firestore writes; 20k character limit. |
| **Planning & Reasoning** | System prompt subversion via journal context | OWASP LLM01 | User entries are enclosed within clear boundary markers; Gemini is guided by immutable empathy and reflective guidelines. |
| **Tool Execution** | API key leakage or model unavailability | OWASP A01 / LLM05 | Zero client-side API keys; `GEMINI_API_KEY` stored exclusively server-side; automated multi-model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`). |
| **Memory & State** | Cross-tenant document snooping | OWASP A01 | Zero insecure rules (`allow read, write: if true;` banned). User isolation enforced at `/users/{userId}/interactions/{interactionId}` with `request.auth.uid == userId`. |
| **Inter-System Communication** | Token leakage during auth | OWASP A02 / A07 | Federated Google Sign-In via Firebase Auth; token verification and direct Firestore SDK socket connections. |

---

## 📋 Prerequisites & Cloud Setup

### 1. Enable Required Google Cloud APIs

```bash
# Set your active GCP project ID
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable Cloud Run, Secret Manager, and Firestore APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

### 2. Secret Manager Configuration

Store your Gemini API key in Google Cloud Secret Manager and grant the Cloud Run runtime service account read access:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Obtain your project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🔒 Cloud Firestore Security Rules

Deploy the following security rules to guarantee complete isolation between users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 🚀 Google Cloud Run Deployment

### 1. Build and Deploy Container

Deploy directly to Google Cloud Run with Secret Manager environment injection:

```bash
gcloud run deploy reflect-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### 2. Mandatory Challenge Verification Label

Apply the campaign verification label to the service:

```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Walkthrough & Test Cases

The following test cases cover all user interactions and workflows across the application:

### Test Case 1: Landing Page & Unauthenticated State
- **Precondition**: User is logged out.
- **Action**: Load the application URL.
- **Expected Outcome**:
  - Landing page displays with hero text, security assurance pills, and feature breakdown cards.
  - "Sign In with Google" button is prominently displayed in both navigation bar and hero section.
  - Private dashboard and reflections remain completely hidden.

### Test Case 2: Federated Google Authentication Flow
- **Action**: Click "Sign In with Google".
- **Expected Outcome**:
  - Google OAuth popup dialog opens.
  - User chooses account and grants access.
  - User is immediately transitioned to their private dashboard with their profile photo/initial and email displayed.
  - Real-time Firestore snapshot listener initializes for the user's `uid`.

### Test Case 3: Initial Journal Creation & Inspiration Prompts
- **Precondition**: Authenticated user with blank workspace.
- **Action**: View empty reflection prompt. Click any inspiration prompt chip (e.g., "Deconstruct Feelings").
- **Expected Outcome**:
  - The textarea is populated with the prompt text and focused.
  - The mode indicator reflects the current reflection mode.

### Test Case 4: Gemini Reflection & Multi-Turn Conversation
- **Action**: Type a journal entry into the textarea and press `Enter` (or click `Send`).
- **Expected Outcome**:
  - Input field clears immediately, user entry card renders in the stream.
  - Sync indicator transitions to "Saving to Firestore...".
  - Thinking indicator displays: "Reflecting with Gemini 3.6 Flash...".
  - Gemini response streams/renders in styled Markdown with a model badge (`gemini-3.6-flash`).
  - If titled "Untitled Reflection", Gemini suggests a poetic 3-6 word title automatically.
  - Both prompt and response are persisted to Firestore under `/users/{uid}/interactions/{entryId}`.
  - Sync status updates to "Synced to Cloud Firestore".

### Test Case 5: Reflection Modes Switcher
- **Action**: Toggle between "Reflect & Deepen", "Actionable Summary", and "Brainstorm Ideas".
- **Expected Outcome**:
  - Active button highlights with associated icon.
  - Subsequent submissions pass the corresponding mode to `/api/gemini/reflect`, tailoring Gemini's prompt instructions accordingly.
  - Mode is saved in the Firestore document.

### Test Case 6: Inline Title Renaming
- **Action**: Click the reflection title or edit icon in the header, input a new title, and press `Enter` or click `Save`.
- **Expected Outcome**:
  - Title updates inline in the active view and in the sidebar list.
  - Updated title is committed to Cloud Firestore.

### Test Case 7: Search and Filter Past History
- **Precondition**: User has 2 or more saved reflections.
- **Action**: Type keywords into the history search bar; click mode filter buttons ("Reflect", "Summary", "Ideas").
- **Expected Outcome**:
  - The history list dynamically filters items matching the search query and mode.
  - Clicking any reflection loads its full conversation history into the main workspace.

### Test Case 8: Secure Deletion Flow
- **Action**: Hover over an entry in the sidebar and click the Trash icon.
- **Expected Outcome**:
  - Confirmation modal opens with title of entry.
  - Clicking "Cancel" closes the modal without changes.
  - Clicking "Delete Forever" deletes the document from Firestore and removes it from the list.

### Test Case 9: Error Recovery & Resilience
- **Scenario**: Simulated network timeout or API exhaustion.
- **Expected Outcome**:
  - Backend automatically traverses the model fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`).
  - If all fail, an accessible error banner appears with a "Retry" option without losing user input buffer.

### Test Case 10: Sign Out Flow
- **Action**: Click the Sign Out icon next to user profile.
- **Expected Outcome**:
  - Firebase Auth clears the session.
  - App state resets and user is returned to the Landing Page.
