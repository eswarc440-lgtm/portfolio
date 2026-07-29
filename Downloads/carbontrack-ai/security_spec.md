# Security Rules Specification

This document details the security constraints, relational access policies, and validation gates enforced within the Firestore database rules.

## 1. Data Invariants

- **Ownership Integrity**: A user can only create, update, or delete their own `users` profile, `activities`, and `goals`.
- **Admin Control**: Only authenticated users whose `uid` is in the administrative registry can modify custom `emissionFactors`.
- **System Constraints**:
  - All numeric properties (`quantity`, `emissions`, `factor`, `carbonScore`, `totalXp`, `currentStreak`) must be non-negative.
  - All ID values must conform to valid alphanumeric character matches.
  - Timestamps and dates must conform to rigid size constraints (e.g., date is exactly 10 characters `YYYY-MM-DD`).

---

## 2. The "Dirty Dozen" Vulnerability Payloads

These payloads represent attempts to compromise system integrity. The security rules will render each of these `PERMISSION_DENIED`.

1. **Self-Elevated Privilege**: Standard user attempt to change `role` to `"ADMIN"` in their profile document.
2. **Identity Theft (Profile)**: Attempt by `userA` to create or update profile document `users/userB`.
3. **Identity Spoofing (Activity)**: Attempt to create an activity in `activities/act-1` with `userId` set to `userB` while logged in as `userA`.
4. **Volume Poisoning**: Attempt to log an activity with notes field size exceeding 1000 characters.
5. **Coefficient Hijack**: Attempt by a standard user to update an entry in `emissionFactors/EV`.
6. **Immortal Field Corruption**: Attempt to alter the immutable `createdAt` timestamp on an activity or goal.
7. **Negative Values**: Attempt to log an activity with negative `quantity` or negative `emissions`.
8. **Orphaned Write**: Attempt to create an activity log without a valid logged-in user context.
9. **Junk ID Poisoning**: Attempt to write a document with a non-alphanumeric, 1.5KB long ID (e.g., `activities/!!!invalid_id_with_huge_size_1000_chars!!!`).
10. **State Shortcutting**: Attempt to update a goal's status from `failed` to `active` after the deadline has expired.
11. **PII Blanket Scrape**: Unauthenticated or blanket list read query on the `users` collection without scoping filters.
12. **Malicious Client Timestamping**: Attempt to set a custom historical timestamp instead of checking against server request time for audit fields.

---

## 3. Test Runner Design

All security tests must be structured to verify that attempts to issue the above payloads result in complete permission denials.
- **Rule Verification**: Standard unit tests checking the security rules against a mock firestore emulator.
- **Verification Criteria**:
  - `get`, `create`, `update`, `delete` are constrained.
  - `list` is blocked unless filtered by the owner's `userId`.
