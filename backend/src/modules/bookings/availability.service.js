import Staff from "../staff/staff.model.js";
import BookingSlot from "./bookingSlot.model.js";
import { toMinutes, fromMinutes, zonedToUtc, todayInZone, addDays, weekdayOf } from "../../utils/time.js";
import { SLOT_MINUTES, START_STEP_MINUTES, MAX_DAYS_AHEAD, MIN_LEAD_MINUTES, slotsNeeded } from "./booking.constants.js";
import { isDateOff } from "../../utils/time.js";

const SLOT_MS = SLOT_MINUTES * 60_000;

// Returns { times: [{ time: "09:00", startAt: Date, staffIds: [...] }], message }
export async function getDayAvailability({ business, service, date, staffId = null, now = new Date() }) {
  const tz = business.timezone;
  const today = todayInZone(tz, now);

  if (date < today) return { times: [], message: "This date has passed." };
  if (date > addDays(today, MAX_DAYS_AHEAD)) {
    return { times: [], message: `Bookings open up to ${MAX_DAYS_AHEAD} days ahead.` };
  }

  const weekday = weekdayOf(date);
  const hours = business.openingHours.find((h) => h.day === weekday);
  if (!hours || hours.closed) return { times: [], message: "Closed on this day." };

  const bizOpen = toMinutes(hours.open);
  let bizClose = toMinutes(hours.close);
  if (bizClose <= bizOpen) bizClose = 24 * 60;

  // Only active staff of THIS business who perform THIS service
  const staffFilter = { businessId: business._id, active: true, serviceIds: service._id };
  if (staffId) staffFilter._id = staffId;
  const staffList = await Staff.find(staffFilter).lean();
  if (!staffList.length) return { times: [], message: "No professionals available for this service." };

  // Blocks already reserved that day
  const dayStart = zonedToUtc(date, 0, tz);
  const dayEnd = zonedToUtc(addDays(date, 1), 0, tz);
  const taken = await BookingSlot.find({
    staffId: { $in: staffList.map((s) => s._id) },
    slotStart: { $gte: dayStart, $lt: dayEnd },
  })
    .select("staffId slotStart")
    .lean();
  const takenKeys = new Set(taken.map((t) => `${t.staffId}|${t.slotStart.getTime()}`));

  const needed = slotsNeeded(service.durationMinutes);
  const occupied = needed * SLOT_MINUTES;
  const earliest = now.getTime() + MIN_LEAD_MINUTES * 60_000;

  const byTime = new Map();

  for (const member of staffList) {
    if (isDateOff(member.timeOff, date)) continue;

    let from = bizOpen;
    let to = bizClose;
    let breakStart = null;
    let breakEnd = null;

    if (member.workingHours?.length) {
      const shift = member.workingHours.find((h) => h.day === weekday);
      if (!shift || shift.off) continue; // day off
      from = Math.max(from, toMinutes(shift.start));
      to = Math.min(to, toMinutes(shift.end));
      if (shift.breakStart && shift.breakEnd) {
        breakStart = toMinutes(shift.breakStart);
        breakEnd = toMinutes(shift.breakEnd);
      }
    }

    const first = Math.ceil(from / START_STEP_MINUTES) * START_STEP_MINUTES;
    for (let m = first; m + occupied <= to; m += START_STEP_MINUTES) {
      if (breakStart !== null && m < breakEnd && m + occupied > breakStart) continue;

      const startAt = zonedToUtc(date, m, tz);
      if (startAt.getTime() < earliest) continue;

      let free = true;
      for (let i = 0; i < needed; i++) {
        if (takenKeys.has(`${member._id}|${startAt.getTime() + i * SLOT_MS}`)) {
          free = false;
          break;
        }
      }
      if (!free) continue;

      const time = fromMinutes(m);
      if (!byTime.has(time)) byTime.set(time, { time, startAt, staffIds: [] });
      byTime.get(time).staffIds.push(String(member._id));
    }
  }

  const times = [...byTime.values()].sort((a, b) => a.startAt - b.startAt);
  return { times, message: times.length ? "" : "No times left on this day." };
}