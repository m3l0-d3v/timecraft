"use client";

import { useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Maximize,
  PictureInPicture,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "work" | "short" | "long";

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const LABELS: Record<Mode, string> = {
  work: "Foco",
  short: "Pausa curta",
  long: "Pausa longa",
};

export default function Timer({
  mode,
  onFinish,
}: {
  mode: Mode;
  onFinish?: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS[mode]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsLeft(DURATIONS[mode]);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          onFinish?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onFinish]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const total = DURATIONS[mode];
  const progress = ((total - secondsLeft) / total) * 100;
  const radius = 190;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  const reset = () => {
    setRunning(false);
    setSecondsLeft(DURATIONS[mode]);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-[min(440px,55vh)] h-[min(440px,55vh)] flex items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90 w-full h-full"
          viewBox="0 0 440 440"
          fill="none"
        >
          <circle
            cx="220"
            cy="220"
            r={radius}
            stroke="var(--border)"
            strokeWidth="4"
          />
          <circle
            cx="220"
            cy="220"
            r={radius}
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-500 ease-linear"
          />
        </svg>

        <div className="flex flex-col items-center">
          <span className="text-sm uppercase tracking-[0.35em] text-muted-foreground mb-4">
            {LABELS[mode]}
          </span>
          <div className="text-[clamp(4rem,13vh,7rem)] font-bold tabular-nums tracking-tight leading-none">
            {minutes}:{seconds}
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center items-center mt-10">
        <Button
          onClick={() => setRunning((r) => !r)}
          size="lg"
          className="px-12 h-14 text-base rounded-xl"
        >
          {running ? (
            <>
              <Pause className="w-5 h-5" /> Pausar
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> Iniciar
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          aria-label="Reiniciar"
          className="h-14 w-14 rounded-xl"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();
          }}
          aria-label="Tela cheia"
          className="h-14 w-14 rounded-xl"
        >
          <Maximize className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Picture in picture"
          className="h-14 w-14 rounded-xl"
        >
          <PictureInPicture className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
