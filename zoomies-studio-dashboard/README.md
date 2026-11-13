# Zoomies Studio Dashboard

Private-use business dashboard. The page is public, the **data is not**: every number sits behind a login (email + password + authenticator code) and a database check that only lets the owner read it.

See SECURITY.md. No secrets are stored here - the only key in `config.js` is Supabase's public publishable key, which is designed to be public.
