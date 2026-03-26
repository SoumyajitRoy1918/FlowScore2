"use client";

import { useMemo } from "react";
import { DatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { parseDate } from "@internationalized/date";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date (optional)",
  className,
}: AppDatePickerProps) {
  const parsedValue = useMemo(() => {
    if (!value) {
      return [];
    }

    try {
      return [parseDate(value)];
    } catch {
      return [];
    }
  }, [value]);

  return (
    <div className={cn("w-full", className)}>
      <DatePicker.Root
        value={parsedValue}
        selectionMode="single"
        onValueChange={(details) => onChange(details.valueAsString[0] ?? "")}
      >
        <DatePicker.Label className="mb-2 block text-sm font-medium text-slate-200">
          {label}
        </DatePicker.Label>

        <DatePicker.Control className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 shadow-sm backdrop-blur-xl focus-within:ring-2 focus-within:ring-white/20">
          <DatePicker.ValueText
            placeholder={placeholder}
            className="flex-1 truncate text-sm text-white"
          />
          <DatePicker.Trigger className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <Calendar size={18} />
          </DatePicker.Trigger>
          {value ? (
            <DatePicker.ClearTrigger className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200">
              <X size={16} />
            </DatePicker.ClearTrigger>
          ) : null}
        </DatePicker.Control>

        <Portal>
          <DatePicker.Positioner className="z-[90]">
            <DatePicker.Content className="mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-slate-950/96 p-3 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.95)] backdrop-blur-2xl">
              <div className="mb-3 flex gap-2">
                <DatePicker.YearSelect
                  className="app-date-picker-select h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  style={{ colorScheme: "dark", backgroundColor: "#020617", color: "#ffffff" }}
                />
                <DatePicker.MonthSelect
                  className="app-date-picker-select h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  style={{ colorScheme: "dark", backgroundColor: "#020617", color: "#ffffff" }}
                />
              </div>

              <DatePicker.View view="day">
                <DatePicker.Context>
                  {(datePicker) => (
                    <>
                      <DatePicker.ViewControl className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200">
                        <DatePicker.PrevTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronLeft size={18} />
                        </DatePicker.PrevTrigger>
                        <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-3 py-2 transition hover:bg-white/10">
                          <DatePicker.RangeText />
                        </DatePicker.ViewTrigger>
                        <DatePicker.NextTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronRight size={18} />
                        </DatePicker.NextTrigger>
                      </DatePicker.ViewControl>

                      <DatePicker.Table className="w-full border-separate border-spacing-1 text-center text-sm">
                        <DatePicker.TableHead>
                          <DatePicker.TableRow>
                            {datePicker.weekDays.map((weekDay, index) => (
                              <DatePicker.TableHeader key={index} className="py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                {weekDay.short}
                              </DatePicker.TableHeader>
                            ))}
                          </DatePicker.TableRow>
                        </DatePicker.TableHead>
                        <DatePicker.TableBody>
                          {datePicker.weeks.map((week, weekIndex) => (
                            <DatePicker.TableRow key={weekIndex}>
                              {week.map((day, dayIndex) => (
                                <DatePicker.TableCell key={dayIndex} value={day}>
                                  <DatePicker.TableCellTrigger className="flex h-10 w-10 items-center justify-center rounded-xl text-sm text-slate-200 transition hover:bg-white/10 data-[selected]:bg-white data-[selected]:text-slate-950 data-[today]:border data-[today]:border-white/30 data-[outside-range]:opacity-30">
                                    {day.day}
                                  </DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                        </DatePicker.TableBody>
                      </DatePicker.Table>
                    </>
                  )}
                </DatePicker.Context>
              </DatePicker.View>

              <DatePicker.View view="month">
                <DatePicker.Context>
                  {(datePicker) => (
                    <>
                      <DatePicker.ViewControl className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200">
                        <DatePicker.PrevTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronLeft size={18} />
                        </DatePicker.PrevTrigger>
                        <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-3 py-2 transition hover:bg-white/10">
                          <DatePicker.RangeText />
                        </DatePicker.ViewTrigger>
                        <DatePicker.NextTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronRight size={18} />
                        </DatePicker.NextTrigger>
                      </DatePicker.ViewControl>

                      <DatePicker.Table className="w-full border-separate border-spacing-1 text-sm">
                        <DatePicker.TableBody>
                          {datePicker.getMonthsGrid({ columns: 4, format: "short" }).map((months, rowIndex) => (
                            <DatePicker.TableRow key={rowIndex}>
                              {months.map((month, monthIndex) => (
                                <DatePicker.TableCell key={monthIndex} value={month.value}>
                                  <DatePicker.TableCellTrigger className="flex h-10 w-full items-center justify-center rounded-xl px-2 text-slate-200 transition hover:bg-white/10 data-[selected]:bg-white data-[selected]:text-slate-950">
                                    {month.label}
                                  </DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                        </DatePicker.TableBody>
                      </DatePicker.Table>
                    </>
                  )}
                </DatePicker.Context>
              </DatePicker.View>

              <DatePicker.View view="year">
                <DatePicker.Context>
                  {(datePicker) => (
                    <>
                      <DatePicker.ViewControl className="mb-2 flex items-center justify-between text-sm font-medium text-slate-200">
                        <DatePicker.PrevTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronLeft size={18} />
                        </DatePicker.PrevTrigger>
                        <DatePicker.ViewTrigger className="cursor-pointer rounded-lg px-3 py-2 transition hover:bg-white/10">
                          <DatePicker.RangeText />
                        </DatePicker.ViewTrigger>
                        <DatePicker.NextTrigger className="rounded-lg p-2 transition hover:bg-white/10">
                          <ChevronRight size={18} />
                        </DatePicker.NextTrigger>
                      </DatePicker.ViewControl>

                      <DatePicker.Table className="w-full border-separate border-spacing-1 text-sm">
                        <DatePicker.TableBody>
                          {datePicker.getYearsGrid({ columns: 4 }).map((years, rowIndex) => (
                            <DatePicker.TableRow key={rowIndex}>
                              {years.map((year, yearIndex) => (
                                <DatePicker.TableCell key={yearIndex} value={year.value}>
                                  <DatePicker.TableCellTrigger className="flex h-10 w-full items-center justify-center rounded-xl px-2 text-slate-200 transition hover:bg-white/10 data-[selected]:bg-white data-[selected]:text-slate-950">
                                    {year.label}
                                  </DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                        </DatePicker.TableBody>
                      </DatePicker.Table>
                    </>
                  )}
                </DatePicker.Context>
              </DatePicker.View>
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal>
      </DatePicker.Root>
    </div>
  );
}
