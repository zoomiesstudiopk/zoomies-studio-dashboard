# Security design

- **No data in this repo.** All business numbers live in Supabase and are only returned by database functions that check the caller.
- **Login:** email + password (12+ chars) + 6-digit authenticator code (TOTP). Once the code is set up, the database itself refuses any session that has not passed it (aal2).
- **Owner only:** the functions check the signed-in email against a private admin table and require a confirmed email. Other people who sign up get nothing: "not allowed".
- **Tables are closed:** Row Level Security is on and no table policy exists, so the public API cannot read or write any table directly.
- **Public key only:** `config.js` contains the Supabase publishable key (public by design). Never add a service_role or secret key to this repo.
- **Browser hardening:** strict Content-Security-Policy (only this site + the Supabase URL), no referrer, noindex, framing blocked, auto-lock after 15 idle minutes, login slow-down after 5 wrong tries.
- **Account creation** is hidden. After the owner account exists, turn off "Allow new users to sign up" in Supabase -> Authentication.
- Report a problem: open an issue without any private data in it.
