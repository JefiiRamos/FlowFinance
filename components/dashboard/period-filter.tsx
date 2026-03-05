'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { addDays, format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type PeriodValue = 'today' | '7d' | 'month' | 'lastMonth' | 'custom'

interface PeriodFilterProps {
  value: PeriodValue
  onChange: (value: PeriodValue) => void
  customRange?: { from: Date; to: Date }
  onCustomRangeChange?: (range: { from: Date; to: Date }) => void
}

const PERIODS: { id: PeriodValue; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: '7d', label: '7 dias' },
  { id: 'month', label: 'Este mês' },
  { id: 'lastMonth', label: 'Mês passado' },
  { id: 'custom', label: 'Personalizado' },
]

export function PeriodFilter({ value, onChange, customRange, onCustomRangeChange }: PeriodFilterProps) {
  const [open, setOpen] = useState(false)
  const now = new Date()

  function getDateRange(): { from: Date; to: Date } {
    switch (value) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) }
      case '7d':
        return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) }
      case 'month':
        return { from: startOfMonth(now), to: endOfDay(now) }
      case 'lastMonth':
        const last = subMonths(now, 1)
        return { from: startOfMonth(last), to: endOfMonth(last) }
      case 'custom':
        return customRange ?? { from: startOfMonth(now), to: endOfDay(now) }
      default:
        return { from: startOfMonth(now), to: endOfDay(now) }
    }
  }

  const range = getDateRange()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.filter((p) => p.id !== 'custom').map((p) => (
        <Button
          key={p.id}
          variant={value === p.id ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={value === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1"
          >
            <CalendarIcon className="size-3.5" />
            Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={customRange ?? { from: range.from, to: range.to }}
            onSelect={(sel) => {
              if (sel?.from) {
                const to = sel.to ?? sel.from
                onCustomRangeChange?.({ from: sel.from, to })
                onChange('custom')
                setOpen(false)
              }
            }}
            locale={ptBR}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
