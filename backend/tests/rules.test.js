import { describe, it, expect } from "vitest";
import { hasPermission, permissionsFor } from "../src/modules/memberships/permissions.js";
import { canTransitionOrder } from "../src/modules/orders/order.constants.js";
import { canTransitionBooking, slotsNeeded } from "../src/modules/bookings/booking.constants.js";
import { lineTotalMinor, sumMinor } from "../src/utils/money.js";
import { discountForCode } from "../src/utils/promo.js";
import { isDateOff } from "../src/utils/time.js";

describe("permissions", () => {
  it("gives owners every workspace permission", () => {
    const perms = permissionsFor({ role: "owner", status: "active", permissions: [] });
    expect(perms).toContain("subscription");
    expect(hasPermission({ role: "kitchen", status: "active", permissions: [] }, "subscription")).toBe(false);
  });

  it("uses a custom permission list when the owner set one", () => {
    const membership = { role: "manager", status: "active", permissions: ["bookings"] };
    expect(hasPermission(membership, "bookings")).toBe(true);
    expect(hasPermission(membership, "catalog")).toBe(false);
  });

  it("denies removed members", () => {
    expect(hasPermission({ role: "owner", status: "removed", permissions: [] }, "profile")).toBe(false);
  });
});

describe("status transitions", () => {
  it("accepts a pending order and then moves it through the kitchen", () => {
    expect(canTransitionOrder("pending", "accepted")).toBe(true);
    expect(canTransitionOrder("accepted", "preparing")).toBe(true);
    expect(canTransitionOrder("preparing", "ready")).toBe(true);
    expect(canTransitionOrder("ready", "completed")).toBe(true);
    expect(canTransitionOrder("completed", "preparing")).toBe(false);
    expect(canTransitionOrder("pending", "ready")).toBe(false);
  });

  it("lets a business confirm or reject a pending booking", () => {
    expect(canTransitionBooking("pending", "confirmed")).toBe(true);
    expect(canTransitionBooking("pending", "rejected")).toBe(true);
    expect(canTransitionBooking("confirmed", "completed")).toBe(true);
    expect(canTransitionBooking("cancelled", "confirmed")).toBe(false);
  });
});

describe("money and schedules", () => {
  it("ignores a client total and multiplies the stored price", () => {
    const lines = [{ lineTotalMinor: lineTotalMinor(15000, 2) }, { lineTotalMinor: lineTotalMinor(5000, 1) }];
    expect(sumMinor(lines)).toBe(35000);
  });

  it("reserves enough 15-minute blocks for the service duration", () => {
    expect(slotsNeeded(30)).toBe(2);
    expect(slotsNeeded(20)).toBe(2);
    expect(slotsNeeded(15)).toBe(1);
  });

  it("takes 10 percent off with BOOK10", () => {
    expect(discountForCode("book10", 18000)).toEqual({ code: "BOOK10", discountMinor: 1800, totalMinor: 16200 });
    expect(discountForCode("nope", 18000)).toBeNull();
  });

  it("treats a date inside time off as unavailable", () => {
    expect(isDateOff([{ startDate: "2026-11-01", endDate: "2026-11-03" }], "2026-11-02")).toBe(true);
    expect(isDateOff([{ startDate: "2026-11-01", endDate: "2026-11-03" }], "2026-11-04")).toBe(false);
  });
});
