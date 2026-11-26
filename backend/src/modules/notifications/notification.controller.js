import Notification from "./notification.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fail } from "../../utils/http.js";

export const listMine = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(40).lean();
  const unread = items.filter((n) => !n.readAt).length;
  res.json({
    success: true,
    data: {
      unread,
      items: items.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
    },
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { readAt: new Date() },
    { new: true }
  );
  if (!item) return fail(res, 404, "NOT_FOUND", "Notification not found.");
  res.json({ success: true, data: { id: item._id, readAt: item.readAt } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, readAt: null }, { readAt: new Date() });
  res.json({ success: true, data: { ok: true } });
});
