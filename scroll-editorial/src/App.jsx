import EditorialScrollSection from "./components/EditorialScrollSection.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-200">
      <header className="border-b border-neutral-300 bg-[#F4F3EF] px-6 py-5 md:px-14">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
          Scroll editorial — single section
        </p>
      </header>
      <EditorialScrollSection />
      <footer className="flex min-h-[30vh] items-center justify-center bg-[#111] px-6 text-sm text-[#F4F3EF]/80">
        End of scroll track — one continuous block above
      </footer>
    </div>
  );
}
