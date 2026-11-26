function stamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function downloadBookingCalendar(booking) {
  const name = booking.business?.name || "Appointment";
  const place = [booking.business?.address?.line, booking.business?.address?.area, booking.business?.address?.city]
    .filter(Boolean)
    .join(", ");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookEasy ET//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@bookeasy.et`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(booking.startAt)}`,
    `DTEND:${stamp(booking.endAt)}`,
    `SUMMARY:${name} — ${booking.serviceName}`,
    place ? `LOCATION:${place}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const blob = new Blob([body], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookeasy-appointment.ics";
  a.click();
  URL.revokeObjectURL(url);
}
