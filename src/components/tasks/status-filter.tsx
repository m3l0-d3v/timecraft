"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { cn } from "@/lib/utils";
import { StatusIcon } from "./status-icon";
import { STATUSES, type TaskStatus } from "./constants";

type StatusFilterProps = {
  activeFilters: Set<TaskStatus>;
  counts: Record<TaskStatus, number>;
  onToggle: (status: TaskStatus) => void;
  onClear: () => void;
};

export function StatusFilter({
  activeFilters,
  counts,
  onToggle,
  onClear,
}: StatusFilterProps) {
  const hasFilters = activeFilters.size > 0;
  const sliderRef = useRef<Slider | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelLockRef = useRef(false);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const settings = {
    dots: false,
    infinite: false,
    speed: 220,
    arrows: false,
    swipeToSlide: true,
    draggable: true,
    variableWidth: true,
    focusOnSelect: false,
    slidesToScroll: 1,
    afterChange: (current: number) => {
      setAtStart(current === 0);
      setAtEnd(current >= STATUSES.length - 1);
    },
  };

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.shiftKey) return;

    event.preventDefault();

    if (wheelLockRef.current) return;

    const delta = event.deltaY || event.deltaX;
    if (delta === 0) return;

    wheelAccumulatorRef.current += delta;

    const threshold = 40;

    if (Math.abs(wheelAccumulatorRef.current) >= threshold) {
      if (wheelAccumulatorRef.current > 0) {
        sliderRef.current?.slickNext();
      } else {
        sliderRef.current?.slickPrev();
      }

      wheelAccumulatorRef.current = 0;
      wheelLockRef.current = true;

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 260);
    }
  }, []);

  const scrollPrev = useCallback(() => {
    sliderRef.current?.slickPrev();
  }, []);

  const scrollNext = useCallback(() => {
    sliderRef.current?.slickNext();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
            Filtrar
          </span>

          {hasFilters && (
            <button
              onClick={onClear}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 shrink-0"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={atStart}
            aria-label="Anterior"
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              atStart
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={atEnd}
            aria-label="Próximo"
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              atEnd
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="-mx-1 status-filter-slider" onWheel={handleWheel}>
        <Slider ref={sliderRef} {...settings}>
          {STATUSES.map((status) => {
            const active = activeFilters.has(status.value);
            const count = counts[status.value] ?? 0;

            return (
              <div key={status.value} className="px-1">
                <button
                  onClick={() => onToggle(status.value)}
                  onDragStart={(event) => event.preventDefault()}
                  title={status.label}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-7 px-2 rounded-md border text-[11px] whitespace-nowrap transition-colors select-none",
                    active
                      ? "border-foreground/40 bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <StatusIcon
                    status={status.value}
                    className={cn("w-3 h-3 shrink-0", status.color)}
                  />
                  <span className="leading-none">{status.label}</span>
                  <span className="leading-none tabular-nums text-[10px] opacity-70 w-4 text-center">
                    {count}
                  </span>
                </button>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}
