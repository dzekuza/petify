"use client";

import { Button } from "@/components/ui/button";
import { CalendarBooking } from "@/components/ui/calendar-booking";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useState } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateTimePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  timeSlots?: TimeSlot[];
  disabled?: (date: Date) => boolean;
}

export function DateTimePicker({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  timeSlots = [],
  disabled
}: DateTimePickerProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(selectedDate || today);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateSelect(newDate);
    // Reset time selection when date changes
    if (newDate && newDate !== selectedDate) {
      onTimeSelect('');
    }
  };

  const defaultTimeSlots: TimeSlot[] = [
    { time: "09:00", available: false },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: false },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: false },
    { time: "15:00", available: false },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];

  const slots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;

  return (
    <div>
      <div className="rounded-lg border border-border">
        <div className="flex w-full max-sm:flex-col">
          <CalendarBooking
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="p-2 sm:pe-5 bg-background flex-1"
            disabled={disabled || [{ before: today }]}
          />
          <div className="relative w-full max-sm:h-48 sm:w-64">
            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
              <ScrollArea className="h-full border-border sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">
                      {date ? format(date, "EEEE, d") : "Select a date"}
                    </p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {slots.map(({ time: timeSlot, available }) => (
                      <Button
                        key={timeSlot}
                        variant={selectedTime === timeSlot ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => onTimeSelect(timeSlot)}
                        disabled={!available}
                      >
                        {timeSlot}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
