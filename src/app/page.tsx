"use client";

import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Timer from "../components/timer";
import Clock from "../components/clock";
import Sessions from "../components/sessions";
import Tasks from "../components/tasks";
import ModeSwitcher from "../components/mode-switcher";
import type { Mode } from "../components/mode-switcher";

type Tool = "timer" | "clock";

const Page = () => {
  const [mode, setMode] = useState<Mode>("work");
  const [tool, setTool] = useState<Tool>("timer");
  const [cycles, setCycles] = useState(0);
  const totalCycles = 8;

  const handleFinish = () => {
    if (mode === "work") {
      setCycles((c) => Math.min(c + 1, totalCycles));
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      <Header />

      <Tasks />
      <Sessions cycles={cycles} totalCycles={totalCycles} />

      <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center px-6 lg:px-80">
        <div className="w-full max-w-4xl flex flex-col items-center">
          {tool === "timer" && (
            <div className="mb-10">
              <ModeSwitcher value={mode} onChange={setMode} />
            </div>
          )}

          <div className="flex items-center justify-center">
            {tool === "timer" ? (
              <Timer mode={mode} onFinish={handleFinish} />
            ) : (
              <Clock />
            )}
          </div>
        </div>
      </main>

      <Footer tool={tool} onToolChange={setTool} />
    </div>
  );
};

export default Page;
