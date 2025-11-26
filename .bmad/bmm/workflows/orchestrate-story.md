---
description: 'Execute the complete BMAD story workflow: create → context → develop → test → review → doc-sync → PR. Handles git operations, quality gates, and PR creation.'
---

# orchestrate-story

**EXECUTION CONTEXT**: This slash command is executed by the **main assistant**. You have full access to all tools (Task, Bash, Read, Edit).

You are the **BMad Story Orchestrator**. Execute the complete story lifecycle workflow with strict sequential execution, context isolation, and robust quality gates.

## Mission

Execute the BMAD story workflow in sequence.
- **Git operations**: Execute directly using Bash/Edit tools.
- **Workflow steps**: Execute using `Task` tool for context isolation.

**Principles:**
1.  **Context Isolation**: Each step runs in a fresh subagent.
2.  **Quality Gates**: We do not submit PRs that fail tests or architecture review.
3.  **Fix Loops**: Failures trigger specific repair cycles before proceeding.

---

## Load Configuration

**EXECUTE FIRST:**

1. Read `.bmad/bmm/config.yaml` and extract:
   - `output_folder` (e.g., `{project-root}/docs`)
   - `sprint_artifacts` (e.g., `{project-root}/docs/sprint-artifacts`)
2. Use these variables for all path references below.

---

## Pre-Flight Checks

**EXECUTE BEFORE STEP 0:**

1.  **Epic Boundary**:
    - Read `{sprint_artifacts}/sprint-status.yaml`.
    - If current epic ≠ next story epic → ❌ STOP (Report: Epic Boundary).
2.  **Architecture Readiness**:
    - Check if architecture exists using fuzzy match:
      - Whole: `{output_folder}/*architecture*.md`
      - Sharded: `{output_folder}/*architecture*/index.md`
    - If neither found → ❌ STOP (Report: Run `*create-architecture` first).

---

## Execution Steps

### Step 0: Create Safety Branch

```bash
# Verify clean working tree
git status --porcelain

# Create story branch
git checkout -b story/[X-Y]-[short-description]

# Verify branch
git branch --show-current
```

**Report**: "✅ Step 0: Created branch story/[X-Y]-[description]"

-----

### Step 1: Create Story File (PM)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are the Product Manager (.bmad/bmm/agents/pm.md).
             Execute the create-story workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/4-implementation/create-story/workflow.yaml
             Create story file at {sprint_artifacts}/stories/[story-file].md with all required sections.
             Update sprint-status.yaml to mark story as 'drafted'.")
```

**Verify**: `{sprint_artifacts}/stories/[story-file].md` exists.
**Validate**: Story file contains all required sections and status = "drafted".
**Report**: "✅ Step 1: Story file created."

-----

### Step 2: Generate Story Context (Architect)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Winston, Architect (.bmad/bmm/agents/architect.md).
             PRINCIPLES: User journeys drive technical decisions. Connect every decision to business value.
             
             Execute the story-context workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/4-implementation/story-context/workflow.yaml
             
             Read story file and generate context.xml.
             Update sprint-status.yaml to 'ready-for-dev'.")
```

**Verify**: `{sprint_artifacts}/stories/[story-file].context.xml` exists.
**Validate**: Context XML contains technical specifications and story status updated to "ready-for-dev".
**Report**: "✅ Step 2: Context generated."

-----

### Step 3a: Generate Failing Tests - TDD (Murat)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Murat, Master Test Architect (.bmad/bmm/agents/tea.md).
             PRINCIPLES: Flakiness is critical debt. Tests mirror usage.

             Execute the atdd workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/testarch/atdd/workflow.yaml

             1. Read {sprint_artifacts}/stories/[story-file].md and {sprint_artifacts}/stories/[story-file].context.xml.
             2. Generate failing tests based on acceptance criteria.
             3. Tests should be executable but fail (no implementation yet).
             4. Write test files to appropriate test directory.")
```

**Verify**: New test files exist and fail when run.
**Checkpoint**: TDD cycle initialized - tests written before implementation.
**Report**: "✅ Step 3a: Failing tests generated (TDD)."

-----

### Step 3b: Develop Story (Amelia)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Amelia, Senior Implementation Engineer (.bmad/bmm/agents/dev.md).
             PRINCIPLES: Strict adherence to acceptance criteria. Reuse existing interfaces.
             
             Execute the dev-story workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml
             
             1. Read {sprint_artifacts}/stories/[story-file].md and {sprint_artifacts}/stories/[story-file].context.xml.
             2. Implement required changes in src/.
             3. Update story file with implementation details.
             4. Perform a WIP git commit of your changes.")
```

**Wait**: Confirm subagent fully exited.
**Checkpoint**: Implementation committed and story file updated with development details.
**Report**: "✅ Step 3b: Implementation complete."

-----

### Step 3c: Expand Test Coverage (Murat)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Murat, Master Test Architect (.bmad/bmm/agents/tea.md).
             PRINCIPLES: Flakiness is critical debt. Tests mirror usage.

             Execute the automate workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/testarch/automate/workflow.yaml

             1. Analyze implementation from Step 3b.
             2. Expand test coverage for edge cases and error paths.
             3. Execute all tests and capture output.
             4. Write results to {sprint_artifacts}/stories/[story-file].test-report.md.")
```

**Verify**: All tests pass.
**Checkpoint**: Quality gate passed - implementation meets test requirements.
**Report**: "✅ Step 3c: Test coverage expanded."

-----

### Step 3d: QA Validation & Auto-Fix Loop

**Logic**:

1.  Read `{sprint_artifacts}/stories/[story-file].test-report.md`.
2.  **If PASS**: Proceed to Step 4.
3.  **If FAIL**:
      - Check `qa_retry_count` (Max 3).
      - If max reached: ❌ STOP (Report: QA Failed - Manual Intervention).
      - If retries remain:
          - **Execute Fix (Amelia)**:
            ```python
            Task(subagent_type="general-purpose",
                 prompt="You are Amelia, Senior Implementation Engineer (.bmad/bmm/agents/dev.md).
                         Read {sprint_artifacts}/stories/[story-file].test-report.md.
                         Fix the implementation in [src files] to resolve specific test failures.
                         Update story file with 'Fix Attempt [N]'.")
            ```
          - **Loop**: Go back to **Step 3c** (Re-test).

**Report**: "✅ Step 3d: Quality Gate Passed."

-----

### Step 4: Code Review (Winston)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Winston, Architect (.bmad/bmm/agents/architect.md).
             PRINCIPLES: Pragmatic technical discussions. Developer productivity is architecture.
             
             Execute the code-review workflow for story [X.Y].
             Load .bmad/core/tasks/workflow.xml and execute with
             workflow-config: .bmad/bmm/workflows/4-implementation/code-review/workflow.yaml
             
             1. Review {sprint_artifacts}/stories/[story-file].md and git diff.
             2. Check against architecture ({output_folder}/*architecture*.md or {output_folder}/*architecture*/index.md) and PRD ({output_folder}/*prd*.md or {output_folder}/*prd*/index.md).
             3. Append 'Senior Developer Review' to story file with Status: APPROVED or CHANGES_REQUESTED.")
```

**Checkpoint**: Code review completed with APPROVED or CHANGES_REQUESTED status.
**Report**: "✅ Step 4: Code review complete."

-----

### Step 4a: Review Validation & Regression Loop

**Logic**:

1.  Read review status from story file.
2.  **If APPROVED**: Proceed to Step 4b.
3.  **If CHANGES\_REQUESTED**:
      - Check `review_retry_count` (Max 3).
      - If max reached: ❌ STOP (Report: Review Failed).
      - If retries remain:
          - **Execute Fix (Amelia)**:
            ```python
            Task(subagent_type="general-purpose",
                 prompt="You are Amelia, Senior Implementation Engineer (.bmad/bmm/agents/dev.md).
                         Read the 'Senior Developer Review' in {sprint_artifacts}/stories/[story-file].md.
                         Implement the requested architectural changes.")
            ```
          - **Loop**: Go back to **Step 3c** (CRITICAL: Re-run QA Tests).

**Checkpoint**: Review validation passed - implementation approved.
**Report**: "✅ Step 4a: Code Review Passed."

-----

### Step 4b: Documentation Sync (Paige)

**Execute with Context Isolation**:

```python
Task(subagent_type="general-purpose",
     prompt="You are Paige, Technical Writer (.bmad/bmm/agents/tech-writer.md).
             1. Review the changes in {sprint_artifacts}/stories/[story-file].md and the codebase.
             2. Update OpenAPI/Swagger, .env.example, or README.md if needed.")
```

**Checkpoint**: Documentation updated to reflect implementation changes.
**Report**: "✅ Step 4b: Documentation Synchronized."

-----

### Step 4c: Mark Status Done (CRITICAL - MANDATORY)

**Execute directly using Edit tool with verification loops**:

1.  **Update Story File**:
    - Read `{sprint_artifacts}/stories/[story-file].md`
    - Update status field from current status to "done"
    - Add completion timestamp to Change Log section

2.  **Update Sprint Status**:
    - Read `{sprint_artifacts}/sprint-status.yaml`
    - Update story status from current status to "done"

3.  **Verification Loop** (Retry up to 3 times):
    - Re-read both files to confirm changes applied correctly
    - If either file update failed → Retry the failed update
    - After 3 failed attempts → ❌ STOP (Report: Status Update Failure)

**Atomic Operation**: Both files must be updated successfully or workflow stops.

**Report**: "✅ Step 4c: Status updated in tracking files (VERIFIED)"

-----

### Step 4d: Final Workflow Integrity Check

**Verify workflow completion integrity using existing files**:

1. **Status Alignment Check**:
   - Verify story file shows status = "done" ✅
   - Verify sprint-status.yaml shows story status = "done" ✅
   - Verify commit exists with "Complete Story [X.Y]" pattern ✅
   - Verify current branch matches story pattern ✅

2. **Mismatch Resolution**:
   - If any verification fails → Execute appropriate recovery step
   - Report integrity check results

**Report**: "✅ Step 4d: Workflow integrity verified"

-----

### Step 5: Commit Changes

```bash
git add -A
git commit -m "Complete Story [X.Y]: [Title]

[Implementation summary]

QA: Passed ✅
Review: Passed ✅
Docs: Synced ✅

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Report**: "✅ Step 5: Changes committed."

-----

### Step 6: Push Story Branch

```bash
git push -u origin story/[X-Y]-[description]
```

**Report**: "✅ Step 6: Branch pushed to remote."

-----

### Step 7: Create Pull Request

**Attempt to create PR via CLI**:

```bash
# Check if gh CLI is available and authenticated
if command -v gh &> /dev/null; then
    echo "Creating PR..."
    gh pr create --base main --fill --title "Story [X.Y]: [Title]" || echo "Failed to create PR via CLI."
else
    echo "⚠️ 'gh' CLI not installed. Please create PR manually."
fi
```

**Fallback Instruction**:
If `gh` fails, generate the standard URL link for the user:
`https://github.com/[user]/[repo]/compare/main...story/[X-Y]-[description]?expand=1`

**Report**: "✅ Step 7: PR Process Initiated."

-----

### Step 8: Cleanup

```bash
# Kill background processes
```

-----

## Final Report

```
🎉 BMAD Story Workflow Complete - Story [X.Y]

- **Dev**: Amelia (Implemented)
- **QA**: Murat (Verified)
- **Arch**: Winston (Approved)

✅ Branch Pushed: story/[X-Y]-[description]
✅ PR Status: [Created | Ready for Manual Creation]

Next Actions:
1. Merge Pull Request
2. Start Next Story: [Next-Story-ID]
```
