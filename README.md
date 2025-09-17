# Registro de eventos con QR (React + Supabase)

## Requisitos
- Node.js LTS (https://nodejs.org)
- Cuenta de Supabase

## Pasos
1. Abre una terminal **CMD** (no PowerShell) en esta carpeta.
2. Ejecuta:
   ```bash
   npm install
   npm start
   ```
3. En `src/App.jsx` reemplaza `SUPABASE_URL` y `SUPABASE_ANON_KEY` con los de tu proyecto.
4. En el panel de **Supabase → SQL**, pega y ejecuta el archivo `supabase_schema.sql` (incluido en este proyecto).

## Roles
- Para ser **admin**, después de registrarte cambia tu `role` a `admin` en la tabla `profiles`.

---

## Esquema SQL
Consulta el archivo `supabase_schema.sql` en la raíz del proyecto.
