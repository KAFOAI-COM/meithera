# Raya Chain — architecture (proposed; simulated in the MVP)

Raya Chain is the ledger Raya Software Limited proposes to operate for Meithera. In the demonstration it is **simulated in the browser** (`src/lib/chain/raya.ts`): deterministic hashing, no network, no wallets, no token contracts. This document describes the intended design and how the simulator mirrors it.

## 1. Master record

- One permissioned chain, operated by Raya under the authorised entity’s policies, holds the **single master record** of every issuance, transfer, payout, repayment, freeze, correction, anchor and attestation.
- Today (Stage 2) the **off-chain register is legally authoritative** and Raya Chain is a reconciled mirror. Making Raya Chain the register itself is Stage 4 and depends on the reformed EU DLT Pilot Regime.
- Blocks carry `height`, `timestamp`, `prevHash`, `merkleRoot` and the transaction ids. Each transaction carries the **compliance rule evaluated** when it was processed, so the rule travels with the asset.

Transaction types: `ISSUE`, `TRANSFER`, `DISTRIBUTION`, `REPAYMENT`, `FREEZE`, `CORRECTION`, `ANCHOR`, `ATTEST` (passport events).

## 2. Anchors (proofs travel, the record does not)

Every Nth block’s Merkle root is posted to other networks — in the demo, illustrative “Chain B” and “Chain C” — and the receipt is acknowledged back with an `ANCHOR` transaction. Anyone holding a block root can prove a Raya Chain transaction was included without the master record moving. In Stage 4, holdings themselves could move across chains while their compliance rules remain enforced by Raya Chain as a Layer Zero.

## 3. Identity mapping

- On-chain identifiers are **salted pseudonyms** (`ID-…`). No personal data is ever written to the chain.
- The mapping from pseudonym to person lives only in the **authorised entity’s identity store**, so GDPR rights (access, erasure) are honoured off-chain without altering the ledger.
- The supervisor sees pseudonyms by default and can request resolution from the authorised entity.

## 4. Smart-contract controls

Instead of free-form tokens, each instrument is governed by a small set of enforced rules:

| Rule | Enforced on |
|---|---|
| Recipient must be a **verified wallet** (allowlist) and not frozen | `TRANSFER`, `CORRECTION` |
| Sender must hold the units and not be frozen | `TRANSFER` |
| Issuance only within the offer cap and after onboarding checks | `ISSUE` |
| Payouts only to holders of record at period end; amounts from the finance engine | `DISTRIBUTION`, `REPAYMENT` |
| Freeze and correction require a **reason code**, an authorised operator and (for corrections) dual approval and an off-chain order reference | `FREEZE`, `CORRECTION` |

Rejected transactions are **recorded**, with their reason code, so attempts are visible to the supervisor.

## 5. Transfer restrictions

- Lock-ups per offer; no transfers during the ECSPR reflection period (a withdrawal is a `CORRECTION` back to the company treasury).
- Secondary transfers only between verified wallets, which is how an ECSPR bulletin-board match could settle. Open transferability is a Stage 4 question.

## 6. Reconciliation

- Nightly reconciliation of the off-chain register against on-chain holdings (`EntitlementLedger.reconcile`): matched / mismatch / missing per record.
- Any mismatch halts distributions for the affected SPV until resolved and is reported to the supervisor.

## 7. Security

- Permissioned validators operated by Raya and (proposed) the authorised partner; key custody with HSMs; dual control for operator actions.
- Hashing: production would use SHA-256; the simulator uses a deterministic FNV-based digest so it can run and be verified synchronously in the browser (“Verify chain” recomputes every hash, root and link).
- No private keys in the browser in any stage; wallets are custodial under the authorised entity or a Stage 4 custodian.

## 8. Recovery and disputes

- Lost access → `FREEZE` (reason `LOST_KEY`) then `CORRECTION` to a re-verified wallet after identity re-verification.
- Court orders → `FREEZE` (`COURT_ORDER`) and `CORRECTION` (`COURT_ORDER_CORRECTION`) referencing the order. The original transactions are never rewritten; the correction is a new, reason-coded transaction.
- Complaints flow through the ECSPR complaints procedure; the chain provides the evidential trail.

## 9. Cross-chain compliance

A holding mirrored or moved to another chain carries its Raya Chain rule set. Transfers that violate the allowlist on a foreign chain are not recognised by the master record, so the supervisor’s view (anchored to Raya Chain) stays authoritative. Regulated euro stablecoin payouts and central-bank-money settlement are Stage 4 and depend on EU reform.

## Simulator ↔ design map

| Design element | Simulator |
|---|---|
| Blocks, Merkle roots, links | `commit()`, `merkleRoot()`, `verifyChain()` |
| Allowlist, freeze, correction | `checkTransfer()`, store actions `freezeHolding`, `correctHolding`, `attemptTransfer` |
| Anchors | `ANCHOR_EVERY_N_BLOCKS`, `anchorNow()`, `ANCHOR` ack txs |
| Pseudonyms | `pseudonym()` in `src/lib/ledger.ts` |
| Supervisor feed | `/supervisor`, `/chain` |
