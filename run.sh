#!/usr/bin/env bash
# Ejecuta suites de la colección de API contra el staging y escribe result.json (formato del lab).
#   SUITE=a-auth[,b-eventos...]  GREP='TC-A01 Anónimo…|TC-A02 …' (opcional, nombres separados por |)  ./run.sh
# SUITE se limpia a caracteres de slug; GREP se parte en nombres y cada uno va como argumento (nunca por el shell).
# Con STG_SECRET_KEY reserva y resetea el staging; sin ella (local) solo lanza las pruebas.
# Sin QA_PASSWORD los casos con login salen "omitidos".
set -euo pipefail
cd "$(dirname "$0")"
ALL="a-auth,b-eventos,c-inscripciones,d-asistencia,e-gobernanza,f-excedencias,g-jugadores,h-calendario,i-normas"
SUITE=$(printf %s "${SUITE:-$ALL}" | tr -cd 'a-z0-9,-')
export SUITE
rm -f newman-report.json result.json
run() {
  local args=(run collections/api.postman_collection.json -e environments/staging.postman_environment.json
    -r cli,json --reporter-json-export newman-report.json --env-var "qa_password=${QA_PASSWORD:-}")
  [ -n "${BASE_URL_API:-}" ] && args+=(--env-var "base_url=$BASE_URL_API")
  if [ -n "${GREP:-}" ]; then
    IFS='|' read -ra names <<< "$GREP"
    for n in "${names[@]}"; do n="${n#^}"; n="${n%\$}"; n="${n//\\/}"; [ -n "$n" ] && args+=(--folder "$n"); done
  else
    IFS=',' read -ra list <<< "$SUITE"
    for s in "${list[@]}"; do [ -n "$s" ] && args+=(--folder "$s"); done
  fi
  npx newman "${args[@]}" || true
  node to-result.js newman-report.json result.json
}
if [ -n "${STG_SECRET_KEY:-}" ] && [ -f shared/reset-staging/with-staging.js ]; then
  export -f run; exec node shared/reset-staging/with-staging.js -- bash -c run
else
  run
fi
