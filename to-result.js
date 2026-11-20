// newman-report.json -> result.json (formato común de ivan-qa-lab-shared/schema)
const fs = require("fs");
const [, , input, output] = process.argv;
const rep = JSON.parse(fs.readFileSync(input, "utf8"));
const roles = { "TC-API12": "Jugador MAD", "TC-API13": "Jugador MAD", "TC-API14": "Jugador FOE", "TC-API15": "Bloqueado", "TC-API16": "Jugador MAD", "TC-API17": "Super Admin" };
// pm.sendRequest (login previo) genera una ejecución extra con el mismo nombre: se agrupan
const byName = new Map();
for (const ex of rep.run.executions) {
  const g = byName.get(ex.item.name);
  if (!g) byName.set(ex.item.name, { ...ex, assertions: [...(ex.assertions || [])] });
  else { g.assertions.push(...(ex.assertions || [])); g.response = g.response || ex.response; }
}
const tests = [...byName.values()].map((ex) => {
  const a = ex.assertions || [];
  const failed = a.find((x) => x.error);
  const skipped = a.length > 0 && a.every((x) => x.skipped);
  const id = ex.item.name.split(" ")[0];
  return {
    name: ex.item.name,
    status: failed ? "failed" : skipped || a.length === 0 ? "skipped" : "passed",
    duration_ms: ex.response ? ex.response.responseTime : 0,
    role: roles[id] || "Anónimo",
    error: failed ? failed.error.message : null,
    evidence_url: null,
  };
});
const count = (s) => tests.filter((t) => t.status === s).length;
const ts = rep.run.timings;
const result = {
  tool: "newman", target: "tactical-calendar", suite: process.env.SUITE || "api",
  started_at: new Date(ts.started).toISOString(), finished_at: new Date(ts.completed).toISOString(),
  duration_ms: ts.completed - ts.started,
  summary: { total: tests.length, passed: count("passed"), failed: count("failed"), skipped: count("skipped") },
  tests,
};
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`result.json: ${result.summary.passed}/${result.summary.total} pasan, ${result.summary.skipped} omitidos`);
