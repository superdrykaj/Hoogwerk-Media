import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { ZipArchive } from "archiver";
import { expect, it } from "vitest";

it("archives nested files using glob filters with the patched minimatch", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb-zip-compat-"));
  try {
    fs.mkdirSync(path.join(dir, "nested"));
    fs.writeFileSync(path.join(dir, "photo.txt"), "first-file-content");
    fs.writeFileSync(path.join(dir, "nested", "video.txt"), "nested-file-content");
    fs.writeFileSync(path.join(dir, "nested", "private.tmp"), "exclude-me");
    const archive = new ZipArchive({ store: true });
    const out = new PassThrough();
    const entries: string[] = [];
    const chunks: Buffer[] = [];
    const complete = new Promise<Buffer>((resolve, reject) => {
      archive.on("error", reject);
      out.on("error", reject);
      out.on("data", (chunk: Buffer) => chunks.push(chunk));
      out.on("end", () => resolve(Buffer.concat(chunks)));
    });
    archive.on("entry", (entry) => entries.push(entry.name));
    archive.pipe(out);
    archive.glob("**/*.txt", { cwd: dir, ignore: ["**/*.tmp"] });
    await archive.finalize();
    const zip = await complete;
    expect(entries.sort()).toEqual(["nested/video.txt", "photo.txt"]);
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.includes(Buffer.from("first-file-content"))).toBe(true);
    expect(zip.includes(Buffer.from("nested-file-content"))).toBe(true);
    expect(zip.includes(Buffer.from("exclude-me"))).toBe(false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
