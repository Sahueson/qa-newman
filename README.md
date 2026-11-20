# qa-newman

Pruebas de API con Postman/Newman contra el staging de Tactical Calendar (Supabase REST + Auth).
17 casos (`TC-API01..17`): RLS para usuario anónimo, validación de apikey/login y visibilidad por
rol (jugador MAD/FOE, bloqueado, super admin). Los 11 casos anónimos no necesitan credenciales; los
6 con login se omiten si no hay `QA_PASSWORD`.

    npm ci
    QA_PASSWORD=... ./run.sh        # escribe result.json en el formato común del lab

`environments/staging.postman_environment.json` solo lleva la URL pública del staging y su clave
publicable (anon), la misma que viaja en el bundle del demo. Nada secreto.
En GitHub Actions: `.github/workflows/run-tests.yml` (inputs: run_id, suite, grep).
