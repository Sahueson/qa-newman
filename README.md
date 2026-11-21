# qa-newman

Pruebas de API con Postman/Newman contra el staging de Tactical Calendar (Supabase REST + Auth).
57 casos (`TC-A01..58`) en 9 suites, una carpeta por suite (a-auth … i-normas, los mismos dominios que Playwright):
RLS para usuario anónimo, validación de apikey y login, visibilidad por rol y escrituras que deben quedar bloqueadas.
Sin `QA_PASSWORD` se ejecutan los casos anónimos y los que necesitan login salen "omitidos".

    npm ci
    SUITE=a-auth,b-eventos QA_PASSWORD=... ./run.sh   # sin SUITE ejecuta las 9; escribe result.json (formato del lab)

Los casos salen de `ivan-qa-lab-shared/api-cases/spec.js` (misma fuente para Newman, Bruno, Karate y JMeter).
`environments/staging.postman_environment.json` solo lleva la URL pública del staging y su clave publicable (anon).
En GitHub Actions: `.github/workflows/run-tests.yml` (inputs: run_id, suite, grep).
