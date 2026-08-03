export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row h-24 items-center justify-center sm:justify-between px-6 pl-20 sm:pl-6">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
          © {new Date().getFullYear()} Pokewiki. Design focado em usabilidade.
        </p>
      </div>
    </footer>
  );
}
