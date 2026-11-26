export const SLOT_MINUTES = 15; // booking time is reserved in 15-minute blocks
export const START_STEP_MINUTES = 30; // start times offered every 30 minutes
export const MAX_DAYS_AHEAD = 30;
export const MIN_LEAD_MINUTES = 30; // can't book a time that starts in less than this

export const BOOKABLE_CATEGORIES = ["barbershop", "salon"];
export const BOOKING_STATUSES = ["pending", "confirmed", "rejected", "cancelled", "completed", "no_show"];
export const ACTIVE_STATUSES = ["pending", "confirmed"];

export const BOOKING_TRANSITIONS = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  rejected: [],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function canTransitionBooking(from, to) {
  return (BOOKING_TRANSITIONS[from] || []).includes(to);
}

export const slotsNeeded = (durationMinutes) => Math.ceil(durationMinutes / SLOT_MINUTES);