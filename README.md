# Francis's Portfolio OS

An interactive, desktop-OS themed personal portfolio and blog built with vanilla web technologies. It features a custom floating window manager, draggable application windows, and dynamic content rendering.

## 🚀 Features

- **OS-Style Window Manager:** Fully draggable and focusable windows that mimic a desktop environment.
- **Dynamic Articles (Supabase):** A built-in "publishing platform" that fetches articles from a Supabase PostgreSQL database.
- **Markdown Rendering:** Secure, on-the-fly markdown parsing and rendering (powered by `marked` and `DOMPurify`) inside the OS windows.
- **Responsive & Fast:** Built without heavy frameworks, utilizing Vite for fast bundling and optimized assets.
- **Custom Theming:** CSS variables for easily tweaking the aesthetic, including colors and dark/light modes.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Build Tool:** Vite
- **Database / Backend:** Supabase (PostgreSQL)
- **Libraries:** `marked` (Markdown parsing), `dompurify` (HTML sanitization)
- **Deployment:** Vercel

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/francis-p-n/Portfolio-Site.git
   cd Portfolio-Site
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🗄️ Database Setup

To enable the articles feature, you need a Supabase project.
Run the SQL script provided in `supabase_setup.sql` in your Supabase SQL Editor to create the necessary `articles` table and seed data.

## 👨‍💻 Author

**Francis**
- [GitHub](https://github.com/francis-p-n)
- [LinkedIn](https://www.linkedin.com/in/francis-narcis/)
