import { KanbanBoard } from "@/components/features/kanban/board";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">Kanban Board</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="h-[calc(100vh-120px)]">
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}
