# Augment Integration Guide

## Converting Claude Code Hooks to Augment Automation

This guide shows how to implement Claude Code-style automated rules using Augment's native tools and capabilities.

## 🎯 **Core Concept**

Instead of automatic hooks, Augment uses **explicit automation** through:

- **Task Management** - Structured quality workflows
- **Diagnostics Integration** - Real-time validation
- **MCP Orchestration** - Specialized automation
- **Memory-Driven Rules** - Project-specific standards

## 🔧 **Implementation Methods**

### **1. Pre-Edit Validation (replaces PreToolUse hooks)**

**Augment Approach**: Use `diagnostics` tool + custom validation

```javascript
// Before making changes, run:
await diagnostics({ paths: ["src/"] });
(await launch) -
  process({
    command: "node .augment/automation/quality-framework.js pre-edit",
    wait: true,
  });
```

**Integration with Editing Workflow**:

```javascript
// 1. Check current state
const issues = await diagnostics({ paths: filesToEdit });

// 2. Run pre-edit validation
const preCheck = await launch-process({
  command: 'node .augment/automation/quality-framework.js pre-edit',
  wait: true
});

// 3. Only proceed if validation passes
if (preCheck.returnCode === 0) {
  // Make edits using str-replace-editor
  await str-replace-editor({ ... });
}
```

### **2. Post-Edit Quality Assurance (replaces PostToolUse hooks)**

**Augment Approach**: Task-based quality workflows

```javascript
// After making changes, create quality assurance tasks
await add_tasks({
  tasks: [
    {
      name: "Post-Edit Quality Check",
      description: "Validate code changes meet quality standards",
    },
  ],
});

// Execute validation workflow
(await launch) -
  process({
    command: "node .augment/automation/task-workflows.js post-edit",
    wait: true,
  });

// Update task status based on results
await update_tasks({
  tasks: [{ task_id: "quality-check-id", state: "COMPLETE" }],
});
```

### **3. UI Consistency Automation (replaces UI hooks)**

**Augment Approach**: Browser Tools MCP + Playwright automation

```javascript
// When UI files are modified, run automated UI checks
await browser_navigate_Playwright({ url: "http://localhost:3000" });
await browser_take_screenshot_Playwright({ filename: "ui-before.png" });

// Run UI validation
(await launch) -
  process({
    command: "node .augment/automation/task-workflows.js ui",
    wait: true,
  });

// Check contrast and accessibility
(await launch) -
  process({
    command: "npm run check:contrast",
    wait: true,
  });
```

### **4. Session Context (replaces SessionStart hooks)**

**Augment Approach**: Memory system + project onboarding

```javascript
// Load project context from memories
const projectContext = await read_memory_serena({
  memory_file_name: "project-quality-standards.md",
});

// Run session status check
(await launch) -
  process({
    command: "node .augment/automation/quality-framework.js session-status",
    wait: true,
  });

// Create session tasks if needed
await add_tasks({
  tasks: [
    {
      name: "Session Quality Review",
      description: "Review current project state and quality metrics",
    },
  ],
});
```

## 🚀 **Practical Usage Examples**

### **Example 1: Automated Feature Development**

```javascript
// 1. Start with quality validation
await add_tasks({
  tasks: [
    {
      name: "Implement HELOC Calculator Feature",
      description: "Add new calculation algorithm with quality gates",
    },
  ],
});

// 2. Pre-development validation
(await launch) -
  process({
    command: "node .augment/automation/quality-framework.js pre-edit",
    wait: true,
  });

// 3. Make changes with validation
(await str) -
  replace -
  editor({
    path: "src/lib/calculations.ts",
    // ... changes
  });

// 4. Post-development quality check
(await launch) -
  process({
    command: "node .augment/automation/task-workflows.js post-edit",
    wait: true,
  });

// 5. Update task status
await update_tasks({
  tasks: [{ task_id: "feature-task-id", state: "COMPLETE" }],
});
```

### **Example 2: UI Component Development**

```javascript
// 1. Create UI development workflow
await add_tasks({
  tasks: [
    {
      name: "Update Button Component",
      description: "Enhance design system button with new variants",
    },
  ],
});

// 2. Take baseline screenshot
await browser_navigate_Playwright({
  url: "http://localhost:3000/design-system",
});
await browser_take_screenshot_Playwright({ filename: "button-before.png" });

// 3. Make UI changes
(await str) -
  replace -
  editor({
    path: "src/components/design-system/Button.tsx",
    // ... changes
  });

// 4. Run UI validation workflow
(await launch) -
  process({
    command: "node .augment/automation/task-workflows.js ui",
    wait: true,
  });

// 5. Take after screenshot and compare
await browser_take_screenshot_Playwright({ filename: "button-after.png" });

// 6. Update task with results
await update_tasks({
  tasks: [{ task_id: "ui-task-id", state: "COMPLETE" }],
});
```

## 📋 **Task Workflow Templates**

### **Quality Gate Workflow**

```json
{
  "name": "Quality Gate Validation",
  "tasks": [
    {
      "name": "TypeScript Check",
      "validation": "npx tsc --noEmit",
      "blocking": true
    },
    {
      "name": "Linting",
      "validation": "npm run lint",
      "autofix": "npm run lint:fix"
    },
    {
      "name": "Tests",
      "validation": "npm test",
      "blocking": false
    }
  ]
}
```

### **Deployment Readiness Workflow**

```json
{
  "name": "Deployment Readiness",
  "tasks": [
    {
      "name": "Build Check",
      "validation": "npm run build",
      "blocking": true
    },
    {
      "name": "E2E Tests",
      "validation": "npm run test:e2e",
      "blocking": true
    },
    {
      "name": "Security Audit",
      "validation": "npm audit",
      "blocking": false
    }
  ]
}
```

## 🔗 **MCP Integration**

### **Sequential Thinking for Complex Workflows**

```javascript
// Use Sequential Thinking MCP for complex quality decisions
await sequentialthinking_Sequential_thinking({
  thought: "Analyzing code quality issues and determining fix priority",
  // ... thinking process
});
```

### **Browser Tools for UI Validation**

```javascript
// Automated UI testing with Browser Tools MCP
await browser_navigate_Playwright({ url: "http://localhost:3000" });
await browser_click_Playwright({ element: "Calculate button" });
await browser_snapshot_Playwright(); // Check accessibility
```

### **Context7 for Library Standards**

```javascript
// Check library best practices
(await resolve) - library - id_Context_7({ libraryName: "next.js" });
(await get) -
  library -
  docs_Context_7({
    context7CompatibleLibraryID: "/vercel/next.js",
    topic: "best practices",
  });
```

## 💾 **Project Memory Integration**

Store quality standards in Serena memories:

```javascript
await write_memory_serena({
  memory_name: "quality-standards",
  content: `
# HELOC Accelerator Quality Standards

## TypeScript
- Strict mode enabled
- No any types
- All functions typed

## Testing  
- 80% coverage minimum
- E2E tests for critical paths
- Unit tests for calculations

## UI Standards
- WCAG AA compliance
- Design system components only
- Mobile-first responsive design
  `,
});
```

## 🎯 **Benefits Over Claude Code Hooks**

1. **Transparency**: All automation is visible in task lists
2. **Control**: Can skip or modify workflows as needed
3. **Integration**: Works with Augment's existing tools
4. **Flexibility**: Easy to customize for different scenarios
5. **Tracking**: Quality metrics tracked in task system

## 📊 **Usage Commands**

```bash
# Run individual quality checks
node .augment/automation/quality-framework.js pre-edit
node .augment/automation/quality-framework.js post-edit
node .augment/automation/quality-framework.js ui-check

# Run complete workflows
node .augment/automation/task-workflows.js pre-edit
node .augment/automation/task-workflows.js post-edit
node .augment/automation/task-workflows.js ui
node .augment/automation/task-workflows.js deployment

# Generate task templates
node .augment/automation/task-workflows.js generate preEdit
```

This approach gives you Claude Code-style automation while leveraging Augment's strengths in task management and explicit workflow control.
