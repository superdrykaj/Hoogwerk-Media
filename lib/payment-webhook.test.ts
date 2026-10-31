import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hb-webhook-audit-'));
process.env.DATA_DIR = tmp;
process.env.SEED_ON_EMPTY = 'false';
process.env.AUTH_SECRET = 'audit-only-secret-at-least-sixteen';
process.env.MOLLIE_API_KEY = 'test_local_mock_only';
let db: typeof import('./db');
let invoices: typeof import('./invoices');
let access: typeof import('./delivery-access');
let webhook: typeof import('../app/api/mollie/webhook/route');
let links: typeof import('./delivery-links');
beforeAll(async () => {
  db = await import('./db'); invoices = await import('./invoices');
  access = await import('./delivery-access'); links = await import('./delivery-links');
  webhook = await import('../app/api/mollie/webhook/route');
});
afterEach(() => vi.unstubAllGlobals());
afterAll(() => { db?.getDb().close(); fs.rmSync(tmp, { recursive: true, force: true }); });
let seq = 0;
function createInvoice() {
  const d = db.getDb();
  d.prepare("INSERT OR IGNORE INTO services (id, slug, name, duration_minutes) VALUES (1,'audit','Audit',60)").run();
  const n = ++seq;
  const b = d.prepare("INSERT INTO bookings(reference, service_id, start_utc, end_utc, status, name, email, created_utc, updated_utc) VALUES (?,1,0,1,'confirmed','Audit','audit@example.test',0,0)").run('AUDIT-'+n);
  const inv = invoices.saveInvoiceDraft(Number(b.lastInsertRowid), { amountCents:100, description:'Audit', payBeforeDownload:true, customer:{name:'Audit',address:'Test 1',postcode:'1000 AA',city:'Test',country:'Nederland',vatId:''},deliveryDate:'2026-10-31',paymentTermDays:14 }).invoice;
  invoices.setMolliePaymentId(inv.id, 'tr_audit'+n);
  return invoices.getInvoice(inv.id)!;
}
function remote(inv: ReturnType<typeof createInvoice>, status:string, refunded='0.00', invoiceId=String(inv.id)) {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({status,amount:{value:'1.00',currency:'EUR'},amountRefunded:{value:refunded,currency:'EUR'},metadata:{invoiceId}})));
}
async function post(inv: ReturnType<typeof createInvoice>) {
  return webhook.POST(new Request('https://local.test/api/mollie/webhook',{method:'POST',body:new URLSearchParams({id:inv.molliePaymentId!})}));
}
it('Failed blocks downloads; Paid opens them; refund webhook revokes old file and ZIP links',async()=>{
  const inv=createInvoice();
  const targets=[{kind:'file' as const,fileId:1},{kind:'zip' as const}];
  const saved=targets.map(t=>({t,url:'https://local.test/download?'+links.signedQuery(inv.token,t,process.env.AUTH_SECRET!)}));
  remote(inv,'failed');expect((await post(inv)).status).toBe(200);
  expect(invoices.getInvoice(inv.id)!.status).not.toBe('paid');
  for(const s of saved){const a=access.authorizeDownload(new Request(s.url),inv.token,s.t);expect(!a.ok&&a.response.status).toBe(402);}
  remote(inv,'paid');expect((await post(inv)).status).toBe(200);
  expect(invoices.getInvoice(inv.id)!.status).toBe('paid');
  for(const s of saved)expect(access.authorizeDownload(new Request(s.url),inv.token,s.t).ok).toBe(true);
  remote(inv,'paid','1.00');expect((await post(inv)).status).toBe(200);
  expect(invoices.getInvoice(inv.id)!.status).toBe('refunded');
  for(const s of saved){const a=access.authorizeDownload(new Request(s.url),inv.token,s.t);expect(!a.ok&&a.response.status).toBe(410);}
  expect((await post(inv)).status).toBe(200);expect(invoices.getInvoice(inv.id)!.status).toBe('refunded');
});
it('wrong invoice metadata does not mark paid',async()=>{
  const inv=createInvoice();remote(inv,'paid','0.00','other-invoice');await post(inv);expect(invoices.getInvoice(inv.id)!.status).not.toBe('paid');
});
it('Mollie outage returns 503 so webhook can be retried',async()=>{
  const inv=createInvoice();vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('simulated outage')}));expect((await post(inv)).status).toBe(503);expect(invoices.getInvoice(inv.id)!.status).not.toBe('paid');
});
it('partial refund keeps access paid',async()=>{
  const inv=createInvoice();invoices.markPaid(inv.id,'mollie');remote(inv,'paid','0.50');expect((await post(inv)).status).toBe(200);expect(invoices.getInvoice(inv.id)!.status).toBe('paid');
});

