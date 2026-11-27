import Table from "../tables/table.model.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { makeTableCode } from "../tables/tableCode.js";

const MAX_TABLES = 100;

const fail = (res, status, code, message, fields) =>
  res.status(status).json({ success: false, error: { code, message, ...(fields ? { fields } : {}) } });
const validId = (id) => /^[a-f\d]{24}$/i.test(id);
const view = (t) => ({ id: t._id, label: t.label, code: t.code, active: t.active });

// GET /api/v1/manage/tables
export const listTables = asyncHandler(async (req, res) => {
  const items = await Table.find({ businessId: req.business._id }).lean();
  items.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  res.json({ success: true, data: { items: items.map(view) } });
});

// POST /api/v1/manage/tables  { count }  -> creates "Table N", continuing the numbering
export const createTables = asyncHandler(async (req, res) => {
  const { count } = req.body;
  const existing = await Table.find({ businessId: req.business._id }).select("label").lean();

  if (existing.length + count > MAX_TABLES) {
    return fail(res, 409, "LIMIT", "Please review the submitted information.", {
      count: `You can have up to ${MAX_TABLES} tables (you have ${existing.length}).`,
    });
  }

  const taken = new Set(existing.map((t) => t.label));
  let n = existing.reduce((max, t) => {
    const m = /^Table (\d+)$/.exec(t.label);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);

  const docs = [];
  while (docs.length < count) {
    n += 1;
    const label = `Table ${n}`;
    if (taken.has(label)) continue;
    docs.push({ businessId: req.business._id, label, code: makeTableCode() });
  }

  try {
    await Table.insertMany(docs);
  } catch (err) {
    if (err?.code === 11000) {
      return fail(res, 409, "CONFLICT", "Your tables changed while adding. Refresh the page and try again.");
    }
    throw err;
  }
  res.status(201).json({ success: true, data: { added: docs.length } });
});

// PATCH /api/v1/manage/tables/:id  { label?, active? }
export const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return fail(res, 404, "NOT_FOUND", "Table not found.");

  const set = {};
  if (req.body.label !== undefined) set.label = req.body.label;
  if (req.body.active !== undefined) set.active = req.body.active;

  try {
    // Scoped to THIS business, so owners can never touch someone else's tables
    const t = await Table.findOneAndUpdate({ _id: id, businessId: req.business._id }, { $set: set }, { new: true });
    if (!t) return fail(res, 404, "NOT_FOUND", "Table not found.");
    res.json({ success: true, data: { table: view(t) } });
  } catch (err) {
    if (err?.code === 11000) {
      return fail(res, 409, "DUPLICATE", "Please review the submitted information.", {
        label: "You already have a table with this name.",
      });
    }
    throw err;
  }
});

// POST /api/v1/manage/tables/:id/rotate  -> new code; the printed QR stops working
export const rotateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return fail(res, 404, "NOT_FOUND", "Table not found.");

  const t = await Table.findOneAndUpdate(
    { _id: id, businessId: req.business._id },
    { $set: { code: makeTableCode() } },
    { new: true }
  );
  if (!t) return fail(res, 404, "NOT_FOUND", "Table not found.");
  res.json({ success: true, data: { table: view(t) } });
});