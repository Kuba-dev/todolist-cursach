import * as React from "react"
import "react-day-picker/style.css"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl shadow-lg shadow-black/20",
        className
      )}
      classNames={classNames}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }