-- Run this in the D1 Console to add the password column
-- Cloudflare Dashboard → D1 → reverential-portal → Console

ALTER TABLE clients ADD COLUMN password_hash TEXT;
