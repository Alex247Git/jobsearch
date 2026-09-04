# Plan: feat/component-splits

Goal: break the two monolithic pages (Register 1476 lines, Jobs 712 lines) into
smaller components without changing behaviour. Real tests from feat/test-hygiene
are the safety net.

## Tasks (each = one atomic commit)

- [x] Phase 0: branch feat/component-splits
- [x] Phase 1: Split Register.js (1476 -> 390) into Register/ folder
      (Step1UserForm, Step2ProfileForm, Step3CandidateForm,
      Step3EmployerForm, Step4JobPostForm + index orchestrator)
- [x] Phase 2: Split Jobs.js (712 -> ~500) into Jobs/ folder
      (JobFilters, JobCard, MessageDialog + index orchestrator)
- [x] Phase 3: Behaviour tests for the new components (JobFilters, JobCard,
      MessageDialog) with mock props/callbacks.
- [ ] Phase 4: PR #3 -> merge -> delete branches.

## Out of scope

- npm audit / react-scripts upgrade (own branch).
- Auth middleware adoption in other routes (only users.js has it).
- Any UI redesign.

## Success criteria

- npx jest 10/10, CRA test green, build compiles.
- No JSX rendering diff for the split blocks (pure prop threading).
