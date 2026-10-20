-- Row-level security for a Supabase deployment of the Meithera schema (optional).
-- Roles: investor (auth.uid() mapped to Investor.id via a claim), supervisor (read-only), admin.
-- The demonstration never uses this; it documents the intended production posture.

ALTER TABLE "Property"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Loan"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Spv"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PassportEntry"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Investor"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Investment"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DistributionRun"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Allocation"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EntitlementRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChainBlock"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChainTx"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChainAnchor"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint"         ENABLE ROW LEVEL SECURITY;

-- Helper: role claim from the JWT ('investor' | 'tenant' | 'supervisor' | 'admin').
CREATE OR REPLACE FUNCTION app_role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::json ->> 'app_role', 'anon');
$$;
CREATE OR REPLACE FUNCTION app_investor_id() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT current_setting('request.jwt.claims', true)::json ->> 'investor_id';
$$;

-- Public, read-only catalogue data (no personal data).
CREATE POLICY public_read_property  ON "Property"      FOR SELECT USING (true);
CREATE POLICY public_read_loan      ON "Loan"          FOR SELECT USING (true);
CREATE POLICY public_read_spv       ON "Spv"           FOR SELECT USING (true);
CREATE POLICY public_read_passport  ON "PassportEntry" FOR SELECT USING (true);
-- The chain is pseudonymous by design; blocks, txs and anchors are publicly readable.
CREATE POLICY public_read_block     ON "ChainBlock"    FOR SELECT USING (true);
CREATE POLICY public_read_tx        ON "ChainTx"       FOR SELECT USING (true);
CREATE POLICY public_read_anchor    ON "ChainAnchor"   FOR SELECT USING (true);
CREATE POLICY public_read_wallet    ON "Wallet"        FOR SELECT USING (true);

-- Investors see only their own rows.
CREATE POLICY investor_self        ON "Investor"          FOR SELECT USING (app_role() IN ('supervisor','admin') OR "id" = app_investor_id());
CREATE POLICY investment_self      ON "Investment"        FOR SELECT USING (app_role() IN ('supervisor','admin') OR "investorId" = app_investor_id());
CREATE POLICY allocation_self      ON "Allocation"        FOR SELECT USING (app_role() IN ('supervisor','admin') OR "investorId" = app_investor_id());
CREATE POLICY entitlement_self     ON "EntitlementRecord" FOR SELECT USING (app_role() IN ('supervisor','admin') OR "investorId" = app_investor_id());
CREATE POLICY complaint_self       ON "Complaint"         FOR SELECT USING (app_role() IN ('supervisor','admin') OR "investorId" = app_investor_id());
CREATE POLICY distribution_read    ON "DistributionRun"   FOR SELECT USING (true);

-- Supervisor and admin read the audit log; only the service role may insert; nobody updates or deletes.
CREATE POLICY audit_read ON "AuditEvent" FOR SELECT USING (app_role() IN ('supervisor','admin'));
REVOKE UPDATE, DELETE ON "AuditEvent" FROM PUBLIC;

-- Writes go through the application's service role (server actions / API), never from the browser.
-- Admin-only mutations are enforced in application code and by granting write privileges to the service role only.
