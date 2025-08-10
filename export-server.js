const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const app = express();
const PORT = process.env.PORT || 3001;

// See all project files (except big system folders)
const SKIP = new Set(["node_modules",".git",".cache",".next","dist","build",".local",".upm"]);
function addDir(archive, dir, base="") {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    if (SKIP.has(e.name)) continue;
    const abs = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g,"/");
    if (e.isDirectory()) addDir(archive, abs, rel);
    else archive.file(abs, { name: rel });
  }
}

app.get("/_list", (_req, res) => {
  function walk(dir, base="") {
    const out = [];
    for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
      if (SKIP.has(e.name)) continue;
      const abs = path.join(dir, e.name);
      const rel = path.join(base, e.name).replace(/\\/g,"/");
      if (e.isDirectory()) out.push(...walk(abs, rel));
      else out.push(rel);
    }
    return out;
  }
  res.json({ ok:true, files: walk(process.cwd()) });
});

app.get("/_zip", (req, res) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="buildwiseai-project.zip"');
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", err => { throw err; });
  archive.pipe(res);
  addDir(archive, process.cwd());
  archive.finalize();
});

// If you already have a built frontend, this serves it (optional)
if (fs.existsSync(path.join(__dirname,"dist","index.html"))) {
  app.use(express.static("dist"));
}

app.listen(PORT, () => console.log("Export server ready on port", PORT));