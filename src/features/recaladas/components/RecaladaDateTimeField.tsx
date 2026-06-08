// src/features/recaladas/components/RecaladaDateTimeField.tsx
//
// Selector operativo de fecha/hora específico de recaladas.
// NO reemplaza ni modifica GlassDateTimeInput (compartido con atenciones/turnos).
// Maneja strings locales "YYYY-MM-DDTHH:mm"; el padre sigue enviando
// new Date(valor).toISOString() sin cambios de lógica de negocio.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Anchor, CalendarDays, Clock, X, Ship } from "lucide-react";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_CAP = MESES.map((m) => m[0].toUpperCase() + m.slice(1));
const DIAS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Minutos operativos: 00 / 15 / 30 / 45
const MINUTOS = ["00", "15", "30", "45"];
// Horas comunes de operación portuaria (valor 24h interno; se etiqueta en 12h).
const HORAS_COMUNES = ["06:00", "08:00", "12:00", "18:00"];

/** Formatea hora a 12h con A.M./P.M. -> "08:00 A.M." */
function fmtTime12(h24: number, m: number): string {
  const period = h24 >= 12 ? "P.M." : "A.M.";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function parseLocal(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Convierte un ISO/string a "YYYY-MM-DDTHH:mm" en hora LOCAL real (no slice). */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function summary(value: string): { fecha: string; hora: string } | null {
  const d = parseLocal(value);
  if (!d) return null;
  const dia = DIAS_LARGO[d.getDay()];
  const fecha = `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  const hora = fmtTime12(d.getHours(), d.getMinutes());
  return { fecha, hora };
}

export interface RecaladaDateTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Marca el campo como opcional (ej. fecha de salida). */
  optional?: boolean;
  error?: string;
  disabled?: boolean;
  /** Tipo de hito operativo, ajusta icono/acento. */
  variant?: "arrival" | "departure";
  /** Valor mínimo "YYYY-MM-DDTHH:mm" (ej. la llegada para la salida): bloquea días previos. */
  minValue?: string;
}

export function RecaladaDateTimeField({
  value,
  onChange,
  label,
  optional = false,
  error,
  disabled = false,
  variant = "arrival",
  minValue,
}: RecaladaDateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [pos, setPos] = useState<
    | { mode: "sheet" }
    | { mode: "anchored"; left: number; width: number; maxHeight: number; top?: number; bottom?: number }
    | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date();
  const parsed = parseLocal(value);
  const minDate = parseLocal(minValue ?? "");

  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
  const [hours, setHours] = useState(parsed ? String(parsed.getHours()).padStart(2, "0") : "08");
  const [minutes, setMinutes] = useState(parsed ? String(parsed.getMinutes()).padStart(2, "0") : "00");

  useEffect(() => {
    const d = parseLocal(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setHours(String(d.getHours()).padStart(2, "0"));
      setMinutes(String(d.getMinutes()).padStart(2, "0"));
    }
  }, [value]);

  const updatePos = useCallback(() => {
    if (!containerRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // En pantallas pequeñas el panel se comporta como bottom sheet a pantalla completa.
    if (vw < 640) {
      setPos({ mode: "sheet" });
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const left = Math.max(12, Math.min(rect.left, vw - width - 12));
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    // Abre hacia arriba si abajo no cabe y arriba hay más sitio.
    const openUp = spaceBelow < 380 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(220, Math.min(560, openUp ? spaceAbove : spaceBelow));
    setPos(
      openUp
        ? { mode: "anchored", left, width, maxHeight, bottom: vh - rect.top + 6 }
        : { mode: "anchored", left, width, maxHeight, top: rect.bottom + 6 }
    );
  }, []);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  const DURATION = reduce ? 0 : 180;

  const openMenu = () => {
    if (disabled) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updatePos();
    setMounted(true);
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  const closeMenu = () => {
    setShown(false);
    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMounted(false), DURATION);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Grilla del calendario
  const cells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const out: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewYear, viewMonth]);

  const selectedDay =
    parsed && parsed.getMonth() === viewMonth && parsed.getFullYear() === viewYear
      ? parsed.getDate()
      : null;
  const todayDay =
    today.getMonth() === viewMonth && today.getFullYear() === viewYear ? today.getDate() : null;

  const isDayDisabled = (day: number): boolean => {
    if (!minDate) return false;
    const cellEnd = new Date(viewYear, viewMonth, day, 23, 59, 59, 999);
    return cellEnd < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const emit = (dateStr: string, h: string, m: string) => onChange(`${dateStr}T${h}:${m}`);

  const selectDay = (day: number) => {
    if (isDayDisabled(day)) return;
    emit(toDateStr(viewYear, viewMonth, day), hours, minutes);
  };

  const setTime = (h: string, m: string) => {
    setHours(h);
    setMinutes(m);
    const dateStr = value ? value.slice(0, 10) : toDateStr(viewYear, viewMonth, today.getDate());
    emit(dateStr, h, m);
  };

  // Derivados 12h (A.M./P.M.)
  const h24 = parseInt(hours, 10) || 0;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;

  const setHour12 = (h: number, p: "AM" | "PM" = period) => {
    const next = p === "PM" ? (h % 12) + 12 : h % 12;
    setTime(String(next).padStart(2, "0"), minutes);
  };
  const setPeriod = (p: "AM" | "PM") => setHour12(hour12, p);

  const prevMonth = () =>
    viewMonth === 0 ? (setViewYear((y) => y - 1), setViewMonth(11)) : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setViewYear((y) => y + 1), setViewMonth(0)) : setViewMonth((m) => m + 1);

  const accent =
    variant === "departure" ? "rgb(var(--color-accent))" : "rgb(var(--color-primary))";
  const accentSoft =
    variant === "departure" ? "rgba(var(--color-accent), 0.12)" : "rgba(var(--color-primary), 0.12)";

  const sum = summary(value);
  const Icon = variant === "departure" ? Anchor : Ship;

  const panel = (
    <>
      {/* Encabezado de navegación de mes */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(var(--color-border), 0.08)" }}
      >
        <button
          type="button"
          onClick={prevMonth}
          className="grid place-items-center w-7 h-7 rounded-lg transition-colors hover:bg-[rgba(var(--color-fg),0.06)]"
          aria-label="Mes anterior"
        >
          <span style={{ color: "rgb(var(--color-fg))" }}>‹</span>
        </button>
        <span className="text-sm font-semibold" style={{ color: "rgb(var(--color-fg))" }}>
          {MESES_CAP[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="grid place-items-center w-7 h-7 rounded-lg transition-colors hover:bg-[rgba(var(--color-fg),0.06)]"
          aria-label="Mes siguiente"
        >
          <span style={{ color: "rgb(var(--color-fg))" }}>›</span>
        </button>
      </div>

      {/* Encabezados de días */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DIAS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium py-1 uppercase tracking-wide"
            style={{ color: "rgb(var(--color-muted))" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {cells.map((day, i) => {
          if (day == null) return <div key={`e-${i}`} />;
          const disabledDay = isDayDisabled(day);
          const isSel = day === selectedDay;
          const isToday = day === todayDay;
          return (
            <button
              key={day}
              type="button"
              disabled={disabledDay}
              onMouseDown={() => selectDay(day)}
              className="aspect-square flex items-center justify-center rounded-lg text-sm transition-colors"
              style={{
                background: isSel ? accent : isToday ? accentSoft : "transparent",
                color: isSel
                  ? "#fff"
                  : disabledDay
                  ? "rgba(var(--color-muted), 0.4)"
                  : isToday
                  ? accent
                  : "rgb(var(--color-fg))",
                fontWeight: isSel || isToday ? 600 : 400,
                cursor: disabledDay ? "not-allowed" : "pointer",
                opacity: disabledDay ? 0.5 : 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Hora (selector custom 12h, tema oscuro) */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(var(--color-border), 0.08)" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Clock className="w-3.5 h-3.5" style={{ color: "rgb(var(--color-muted))" }} />
          <span className="text-xs font-medium" style={{ color: "rgb(var(--color-muted))" }}>
            Hora
          </span>
          <span className="ml-auto text-sm font-bold tabular-nums" style={{ color: accent }}>
            {fmtTime12(h24, parseInt(minutes, 10) || 0)}
          </span>
        </div>

        {/* Toggle A.M. / P.M. */}
        <div
          className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-2.5"
          style={{ background: "rgba(var(--color-fg), 0.05)" }}
        >
          {(["AM", "PM"] as const).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onMouseDown={() => setPeriod(p)}
                className="text-sm font-bold rounded-lg py-1.5 transition-colors"
                style={{
                  background: active ? accent : "transparent",
                  color: active ? "#fff" : "rgb(var(--color-muted))",
                }}
              >
                {p === "AM" ? "A.M." : "P.M."}
              </button>
            );
          })}
        </div>

        {/* Grilla de horas 1–12 */}
        <div className="grid grid-cols-6 gap-1 mb-3">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const active = h === hour12;
            return (
              <button
                key={h}
                type="button"
                onMouseDown={() => setHour12(h)}
                className="text-sm font-semibold rounded-lg py-1.5 transition-colors tabular-nums"
                style={{
                  background: active ? accent : "rgba(var(--color-fg), 0.04)",
                  color: active ? "#fff" : "rgb(var(--color-fg))",
                  border: `1px solid ${active ? accent : "rgba(var(--color-border), 0.12)"}`,
                }}
              >
                {h}
              </button>
            );
          })}
        </div>

        {/* Minutos 00 / 15 / 30 / 45 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "rgb(var(--color-muted))" }}>
            Min
          </span>
          <div className="grid grid-cols-4 gap-1 flex-1">
            {MINUTOS.map((m) => {
              const active = m === minutes;
              return (
                <button
                  key={m}
                  type="button"
                  onMouseDown={() => setTime(hours, m)}
                  className="text-sm font-semibold rounded-lg py-1.5 transition-colors tabular-nums"
                  style={{
                    background: active ? accent : "rgba(var(--color-fg), 0.04)",
                    color: active ? "#fff" : "rgb(var(--color-fg))",
                    border: `1px solid ${active ? accent : "rgba(var(--color-border), 0.12)"}`,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Horas comunes (solo fijan la hora) */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {HORAS_COMUNES.map((hc) => {
            const [h, m] = hc.split(":");
            const active = hours === h && minutes === m;
            return (
              <button
                key={hc}
                type="button"
                onMouseDown={() => setTime(h, m)}
                className="text-xs font-medium rounded-full px-3 py-1 transition-colors"
                style={{
                  background: active ? accentSoft : "transparent",
                  color: active ? accent : "rgb(var(--color-muted))",
                  border: `1px solid ${active ? accent : "rgba(var(--color-border), 0.15)"}`,
                }}
              >
                {fmtTime12(parseInt(h, 10), parseInt(m, 10))}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer (sticky: Limpiar / Listo siempre accesibles) */}
      <div
        className="flex justify-between items-center px-3 py-2.5 border-t"
        style={{
          borderColor: "rgba(var(--color-border), 0.06)",
          position: "sticky",
          bottom: 0,
          background: "rgb(var(--color-bg-elevated))",
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onMouseDown={() => { onChange(""); closeMenu(); }}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors hover:bg-[rgba(var(--color-fg),0.06)]"
          style={{ color: "rgb(var(--color-muted))" }}
        >
          Limpiar
        </button>
        <button
          type="button"
          onMouseDown={() => closeMenu()}
          className="text-xs px-3 py-1 rounded-lg font-semibold transition-colors"
          style={{ color: "#fff", background: accent }}
        >
          Listo
        </button>
      </div>
    </>
  );

  const popover = mounted && pos ? (
    pos.mode === "sheet" ? (
      <>
        <div
          onMouseDown={() => closeMenu()}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9998,
            opacity: shown ? 1 : 0,
            transition: `opacity ${DURATION}ms ease`,
          }}
        />
        <div
          ref={popoverRef}
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 9999,
            background: "rgb(var(--color-bg-elevated))",
            borderRadius: "20px 20px 0 0",
            boxShadow: "var(--shadow-lg)",
            maxHeight: "85dvh", overflowY: "auto",
            overscrollBehavior: "contain",
            paddingBottom: "env(safe-area-inset-bottom, 8px)",
            transform: shown ? "translateY(0)" : "translateY(100%)",
            transition: `transform ${DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
            willChange: "transform",
          }}
        >
          <div
            style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(var(--color-fg), 0.15)", margin: "8px auto 0" }}
          />
          {panel}
        </div>
      </>
    ) : (
      <div
        ref={popoverRef}
        style={{
          position: "fixed",
          left: pos.left, width: pos.width,
          top: pos.top, bottom: pos.bottom,
          maxHeight: pos.maxHeight, overflowY: "auto",
          overscrollBehavior: "contain",
          zIndex: 9999,
          background: "rgb(var(--color-bg-elevated))",
          border: "1px solid rgba(var(--color-border), 0.1)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          transformOrigin: pos.top ? "top" : "bottom",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0) scale(1)" : `translateY(${pos.top ? -6 : 6}px) scale(0.98)`,
          transition: `opacity ${DURATION}ms ${shown ? "ease-out" : "ease-in"}, transform ${DURATION}ms ${shown ? "ease-out" : "ease-in"}`,
          willChange: "transform, opacity",
        }}
      >
        {panel}
      </div>
    )
  ) : null;

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-sm font-semibold" style={{ color: "rgb(var(--color-fg))" }}>
          {label}
        </label>
        {optional ? (
          <span className="text-[11px] font-medium" style={{ color: "rgb(var(--color-muted))" }}>
            · opcional
          </span>
        ) : (
          <span style={{ color: "rgb(var(--color-danger))" }}>*</span>
        )}
      </div>

      {/* Tarjeta-control */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => { if (!disabled) (open ? closeMenu() : openMenu()); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!disabled) (open ? closeMenu() : openMenu()); }
          if (e.key === "Escape") closeMenu();
        }}
        className="relative flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition-all duration-200"
        style={{
          borderRadius: "var(--radius-md)",
          background: "rgb(var(--color-bg-elevated))",
          border: error
            ? "1.5px solid rgb(var(--color-danger))"
            : open
            ? `1.5px solid ${accent}`
            : "1px solid rgba(var(--color-border), 0.15)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <div
          className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: accentSoft, color: accent }}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {sum ? (
            <>
              <p className="text-sm font-semibold truncate" style={{ color: "rgb(var(--color-fg))" }}>
                {sum.fecha}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: accent }}>
                {sum.hora}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium" style={{ color: "rgb(var(--color-muted))" }}>
              Seleccionar fecha y hora
            </p>
          )}
        </div>

        {value && !disabled ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="shrink-0 grid place-items-center w-7 h-7 rounded-lg transition-colors hover:bg-[rgba(var(--color-fg),0.06)]"
            aria-label="Limpiar fecha"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" style={{ color: "rgb(var(--color-muted))" }} />
          </button>
        ) : (
          <CalendarDays className="shrink-0 w-4 h-4" style={{ color: "rgb(var(--color-muted))" }} />
        )}
      </div>

      {typeof document !== "undefined" && popover ? createPortal(popover, document.body) : null}

      {error && (
        <p className="mt-1.5 text-sm font-medium" style={{ color: "rgb(var(--color-danger))" }}>
          {error}
        </p>
      )}
    </div>
  );
}
