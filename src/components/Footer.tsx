export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row h-24 items-center justify-center sm:justify-between px-6">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Pokewiki. Design focado em usabilidade.
        </p>
      </div>
    </footer>
  );
}
