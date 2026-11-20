#!/usr/bin/env bash
# Ejecuta la colección de API contra el staging y escribe result.json (formato del lab).
#   SUITE=api  ./run.sh        (SUITE se limpia a caracteres de slug; solo existe la suite "api")
# Con STG_SECRET_KEY reserva y resetea el staging (como el resto de herramientas); sin ella
# (ejecución local rápida) lanza solo las pruebas. Sin QA_PASSWORD los casos con login salen "omitidos".
set -euo pipefail
cd "$(dirname "$0")"
SUITE=$(printf %s "${SUITE:-api}" | tr -cd 'a-z0-9,-')
export SUITE
rm -f newman-report.json result.json
run() {
  local args=(run collections/api.postman_collection.json -e environments/staging.postman_environment.json
    -r cli,json --reporter-json-export newman-report.json --env-var "qa_password=${QA_PASSWORD:-}")
  [ -n "${GREP:-}" ] && args+=(--folder "$GREP")
  [ -n "${BASE_URL_API:-}" ] && args+=(--env-var "base_url=$BASE_URL_API")
  npx newman "${args[@]}" || true
  node to-result.js newman-report.json result.json
}
if [ -n "${STG_SECRET_KEY:-}" ] && [ -f shared/reset-staging/with-staging.js ]; then
  export -f run; exec node shared/reset-staging/with-staging.js -- bash -c run
else
  run
fi
