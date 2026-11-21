// newman-report.json -> result.json (formato común de ivan-qa-lab-shared/schema)
const fs = require("fs");
const [, , input, output] = process.argv;
const rep = JSON.parse(fs.readFileSync(input, "utf8"));
const roles = {"TC-A01":"Anónimo","TC-A02":"Anónimo","TC-A03":"Jugador MAD","TC-A04":"Anónimo","TC-A05":"Jugador MAD","TC-A06":"Bloqueado","TC-A07":"Sin equipo","TC-A08":"Jugador MAD","TC-B01":"Anónimo","TC-B02":"Anónimo","TC-B03":"Anónimo","TC-B04":"Jugador MAD","TC-B05":"Jugador FOE","TC-B06":"Bloqueado","TC-B07":"Jugador MAD","TC-B08":"Super Admin","TC-B09":"Jugador FOE","TC-B10":"Admin MAD","TC-C01":"Anónimo","TC-C02":"Anónimo","TC-C03":"Sin equipo","TC-C04":"Bloqueado","TC-C05":"Jugador MAD","TC-C06":"Jugador FOE","TC-D01":"Anónimo","TC-D02":"Jugador FOE","TC-D03":"Jugador MAD","TC-D04":"Super Admin","TC-E01":"Anónimo","TC-E02":"Anónimo","TC-E03":"Jugador MAD","TC-E04":"Jugador FOE","TC-E05":"Admin FOE","TC-E06":"Jugador MAD","TC-E07":"Jugador FOE","TC-E08":"Jugador FOE","TC-F01":"Anónimo","TC-F02":"Anónimo","TC-F03":"Bloqueado","TC-F04":"Jugador FOE","TC-F05":"Jugador FOE","TC-G01":"Super Admin","TC-G02":"Jugador MAD","TC-G03":"Jugador FOE","TC-G04":"Jugador MAD","TC-G05":"Jugador MAD","TC-H01":"Anónimo","TC-H02":"Anónimo","TC-H03":"Jugador MAD","TC-H04":"Jugador MAD","TC-H05":"Jugador MAD","TC-I01":"Anónimo","TC-I02":"Jugador MAD","TC-I03":"Jugador MAD","TC-I04":"Jugador MAD","TC-I05":"Anónimo","TC-I06":"Anónimo"};
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
  tool: "newman", target: "tactical-calendar", suite: process.env.SUITE || "all",
  started_at: new Date(ts.started).toISOString(), finished_at: new Date(ts.completed).toISOString(),
  duration_ms: ts.completed - ts.started,
  summary: { total: tests.length, passed: count("passed"), failed: count("failed"), skipped: count("skipped") },
  tests,
};
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`result.json: ${result.summary.passed}/${result.summary.total} pasan, ${result.summary.skipped} omitidos`);
