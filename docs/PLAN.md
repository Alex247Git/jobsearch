# Plan: feat/test-hygiene

Goal: make the test suite real (no live MySQL, no fake tokens), fix the frontend
boilerplate test, and consolidate the dependency setup. Zero functional changes
to app behavior (except adding email validation on POST /users and removing the
'valid_token' auth backdoor, which is a security hole).

## Background findings

- 6/10 backend tests fail: 4 need a real JWT ('Bearer valid_token' is a literal
  string, and the middleware backdoor for it is being removed), 2 depend on a
  live DB. One test ("db connection fails") builds a mockDb that is never used.
- The PUT /users/:user_id email validation already exists; its failing test just
  never sends an Authorization header (receives 401 instead of 400).
- App.test.js is untouched CRA boilerplate looking for a "learn react" link that
  never existed.
- Root package.json holds ALL frontend deps; FrontEnd/package.json has only 3
  (works only via node_modules hoisting).

## Tasks (each = one atomic commit)

- [x] Phase 0: docs/PLAN.md + branch feat/test-hygiene
- [x] Phase 1: Extract authenticateToken into BackEnd/middleware/auth.js;
      remove the 'valid_token' backdoor (security).
- [x] Phase 2: Rewrite BackEnd/server.test.js with jest.mock('./db') fixtures
      and real jwt.sign() tokens. Criteria: 10/10 green without MySQL running.
- [x] Phase 3: Add email format validation to POST /users (parity with PUT).
- [x] Phase 4: Replace App.test.js with a smoke test (render App, mock global
      fetch). Criteria: 1/1 green.
- [x] Phase 5: Move all frontend deps to FrontEnd/package.json; root keeps
      backend deps only. Try removing react-is. Verify: jest + CRA test + build.
- [x] Phase 6: PR #2 -> merge -> delete branches.

## Out of scope (later branches)

- Split Register.js (1476 lines) / Jobs.js (712) — unblocked once tests are real.
- npm audit / react-scripts upgrade.
- Central Express error handler, shared auth middleware adoption in other routes.
