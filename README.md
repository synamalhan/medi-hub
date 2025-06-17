# MediHub Platform

A modern healthcare web application for medical students and professionals. Built with React, TypeScript, Vite, Tailwind CSS, Zustand, and Supabase.

## 🚀 Features
- **Research Paper Summarizer**: Upload and summarize research papers using AI.
- **Flashcards**: Create, review, and manage medical flashcards with spaced repetition.
- **Deadlines**: Track and manage important deadlines (exams, assignments, rotations, etc.).
- **Mnemonics**: Generate and store mnemonics for medical concepts.
- **Patient Simulator**: Practice clinical reasoning with simulated patient cases.
- **User Stats**: Track your study progress and activity.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage)
- **AI/ML**: OpenAI, Facebook BART (for summarization)

## 📦 Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/synamalhan/medi-hub.git
   cd medi-hub
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials and any API keys.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Supabase setup:**
   - Make sure your Supabase project is set up and migrations are applied (see `supabase/migrations`).

## 🧑‍💻 Usage
- Access the app at `http://localhost:5173` (or the port shown in your terminal).
- Register/login to use all features.
- Use the navigation bar to access Flashcards, Deadlines, Research Summarizer, and more.

## 🤝 Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

## 📄 License
This project is licensed under the MIT License.

---

*Made with ❤️ by the MediHub team.* 