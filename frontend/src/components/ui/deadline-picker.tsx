import { useState } from "react"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DeadlinePickerProps = {
  value?: Date
  onChange: (value?: Date) => void
  placeholder?: string
  className?: string
}

const displayDeadline = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value)

export function DeadlinePicker({
  value,
  onChange,
  placeholder = "Pick a deadline",
  className,
}: DeadlinePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={className ?? "w-full justify-between border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CalendarDays size={16} className="shrink-0 text-cyan-200" />
            <span className="truncate text-left leading-none">{value ? displayDeadline(value) : placeholder}</span>
          </span>

        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0">
        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.24em] text-white/50">Deadline</div>
          <div className="mt-1 text-sm text-white/70">
            {value ? displayDeadline(value) : "Choose a day from the calendar."}
          </div>
        </div>

        <Calendar
          mode="single"
          selected={value}
          onSelect={(selectedDate) => {
            onChange(selectedDate ?? undefined)
            setOpen(false)
          }}
          initialFocus
        />

        <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/5 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(undefined)}
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 hover:opacity-95"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}