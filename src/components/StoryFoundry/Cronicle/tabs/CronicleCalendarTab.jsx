/**
 * @file CronicleCalendarTab.jsx
 * @description Custom Sci-Fi Campaign Calendar, Moon Phase Tracker & Scheduled Campaign Events tab inside CronicleDeckModal.
 */

import React, { useState } from 'react';
import { Calendar, Moon, Plus, Trash2, ChevronRight, Settings } from 'lucide-react';
import {
  CALENDAR_PRESETS,
  createDefaultCalendarState,
  advanceCalendarDate,
  formatCalendarDate,
  getMoonPhases,
  getHolidaysForDate
} from '../../../../services/campaignCalendarService';

export default function CronicleCalendarTab({
  calendarState,
  onUpdateCalendar,
  isStoryReadOnly = false
}) {
  const cal = calendarState?.config ? calendarState : createDefaultCalendarState('galactic_standard');
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('mission');
  const [eventNotes, setEventNotes] = useState('');
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayMonth, setHolidayMonth] = useState(0);
  const [holidayDay, setHolidayDay] = useState(1);

  const formattedCurrent = formatCalendarDate(cal.currentDate, cal.config);
  const moons = getMoonPhases(cal.currentDate, cal.config);
  const activeHolidays = getHolidaysForDate(cal.currentDate, cal.config);

  const handlePresetChange = (presetId) => {
    if (isStoryReadOnly) return;
    const fresh = createDefaultCalendarState(presetId);
    onUpdateCalendar?.({
      ...cal,
      config: fresh.config,
      currentDate: fresh.currentDate
    });
  };

  const handleAdvanceDays = (delta) => {
    if (isStoryReadOnly) return;
    const nextDate = advanceCalendarDate(cal.currentDate, delta, cal.config);
    onUpdateCalendar?.({
      ...cal,
      currentDate: nextDate
    });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (isStoryReadOnly) return;
    if (!eventTitle.trim()) return;
    const evt = {
      id: `cal_evt_${Date.now()}`,
      title: eventTitle.trim(),
      date: { ...cal.currentDate },
      category: eventCategory,
      notes: eventNotes.trim() || undefined
    };
    onUpdateCalendar?.({
      ...cal,
      events: [evt, ...(cal.events || [])]
    });
    setEventTitle('');
    setEventNotes('');
  };

  const handleDeleteEvent = (id) => {
    if (isStoryReadOnly) return;
    onUpdateCalendar?.({
      ...cal,
      events: (cal.events || []).filter((ev) => ev.id !== id)
    });
  };

  return (
    <div className="space-y-4 font-mono text-xs text-slate-200">
      {/* Header Controls & Preset Picker */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
            <Calendar size={12} /> Active Campaign Epoch Date
          </div>
          <div className="text-base font-bold text-white mt-0.5">{formattedCurrent}</div>
          {activeHolidays.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {activeHolidays.map((h) => (
                <span
                  key={h.id}
                  className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-200 text-[10px] font-bold"
                >
                  ✦ Holiday: {h.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCustomEditor((v) => !v)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-400 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
            title="Customize Era, Months & Holidays"
          >
            <Settings size={11} />
            <span>Custom</span>
          </button>
          <select
            aria-label="Calendar Preset"
            value={cal.config.presetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-indigo-200"
          >
            {Object.values(CALENDAR_PRESETS).map((p) => (
              <option key={p.presetId} value={p.presetId}>
                {p.name}
              </option>
            ))}
          </select>
          {[1, 7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleAdvanceDays(d)}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              <span>+{d}d</span>
              <ChevronRight size={10} />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Era, Months & Holidays Configurator */}
      {showCustomEditor && (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-indigo-500/40 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Era Abbreviation</label>
              <input
                type="text"
                aria-label="Custom Era Name"
                value={cal.config.eraName}
                onChange={(e) =>
                  onUpdateCalendar?.({
                    ...cal,
                    config: { ...cal.config, presetId: 'custom', eraName: e.target.value }
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">First Month Label</label>
              <input
                type="text"
                aria-label="Custom Month Name"
                value={cal.config.months[0]?.name || ''}
                onChange={(e) => {
                  const nextMonths = cal.config.months.map((m, idx) =>
                    idx === 0 ? { ...m, name: e.target.value } : m
                  );
                  onUpdateCalendar?.({
                    ...cal,
                    config: { ...cal.config, presetId: 'custom', months: nextMonths }
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2 border-t border-slate-800 pt-2">
            <div className="flex-1 min-w-[160px]">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Add Recurring Holiday</label>
              <input
                type="text"
                aria-label="Holiday Name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="Founders Day..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
              />
            </div>
            <select
              aria-label="Holiday Month"
              value={holidayMonth}
              onChange={(e) => setHolidayMonth(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              {cal.config.months.map((m, idx) => (
                <option key={m.name + idx} value={idx}>{m.name}</option>
              ))}
            </select>
            <input
              type="number"
              aria-label="Holiday Day"
              min={1}
              max={60}
              value={holidayDay}
              onChange={(e) => setHolidayDay(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (!holidayName.trim()) return;
                const nextHolidays = [
                  ...(cal.config.holidays || []),
                  { id: `hol_${Date.now()}`, name: holidayName.trim(), monthIndex: holidayMonth, day: holidayDay }
                ];
                onUpdateCalendar?.({
                  ...cal,
                  config: { ...cal.config, holidays: nextHolidays }
                });
                setHolidayName('');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs cursor-pointer"
            >
              + Holiday
            </button>
          </div>
        </div>
      )}

      {/* Moon Phases Row */}
      {moons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {moons.map((m) => (
            <div key={m.name} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-cyan-200">
                <Moon size={13} className="text-amber-300" />
                {m.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {m.phaseLabel} ({m.illuminationPct}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Scheduled Campaign Event */}
      <form onSubmit={handleAddEvent} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400">
          Log Event on Current Date
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Event title (e.g. Orbital Resupply Freighter Arrival)"
            className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
          />
          <select
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
          >
            <option value="mission">Mission</option>
            <option value="faction">Faction Shift</option>
            <option value="celestial">Celestial</option>
            <option value="deadline">Deadline</option>
            <option value="log">Chronicle Log</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} /> Add Event
          </button>
        </div>
      </form>

      {/* Event Ledger */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {(cal.events || []).length === 0 ? (
          <div className="text-[11px] text-slate-500 italic p-3 text-center">
            No scheduled calendar events logged yet.
          </div>
        ) : (
          cal.events.map((ev) => (
            <div key={ev.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-[9px] uppercase">
                    {ev.category}
                  </span>
                  <span className="font-bold text-white truncate">{ev.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {formatCalendarDate(ev.date, cal.config)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteEvent(ev.id)}
                className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                aria-label="Delete Event"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
