import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { KeenIcon } from "@/components";

const DatePicker = ({ date, setDate }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id="date"
       
          className={cn(
            "input data-[state=open]:border-primary",
            !date && "text-muted-foreground"
          )}
        >
          <KeenIcon icon="calendar" className="-ms-0.5" />
          {date ? format(date, "LLL dd, y") : <span>Pick a date</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={(selected) => {
            setDate(selected);
            setOpen(false);
          }}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
