// Let op: dit bestand draait alleen op de server (leest en schrijft de database).
import "server-only";

import { getDb } from "./db";
import type { RevisionRequest, RevisionRequestStatus } from "./types";

type Row = {
  id: number;
  invoice_id: number;
  message: string;
  status: string;
  created_utc: number;
  updated_utc: number;
};

function map(row: Row): RevisionRequest {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    message: row.message,
    status: row.status as RevisionRequestStatus,
    createdUtc: row.created_utc,
    updatedUtc: row.updated_utc,
  };
}

export function createRevisionRequest(invoiceId: number, message: string): RevisionRequest {
  const now = Date.now();
  const result = getDb()
    .prepare(
      `INSERT INTO revision_requests (invoice_id, message, status, created_utc, updated_utc)
       VALUES (?, ?, 'open', ?, ?)`,
    )
    .run(invoiceId, message, now, now);
  return map(
    getDb()
      .prepare("SELECT * FROM revision_requests WHERE id = ?")
      .get(Number(result.lastInsertRowid)) as Row,
  );
}

export function listRevisionRequests(invoiceId: number): RevisionRequest[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM revision_requests WHERE invoice_id = ? ORDER BY created_utc DESC",
    )
    .all(invoiceId) as Row[];
  return rows.map(map);
}

export function countOpenRevisionRequests(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM revision_requests WHERE status = 'open'")
    .get() as { n: number };
  return row.n;
}

export function setRevisionRequestStatus(id: number, status: RevisionRequestStatus): void {
  getDb()
    .prepare("UPDATE revision_requests SET status = ?, updated_utc = ? WHERE id = ?")
    .run(status, Date.now(), id);
}
