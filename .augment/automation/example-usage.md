# Augment Automation Examples
## Practical Usage of Claude Code-style Automation in Augment

This document shows real examples of how to use the Augment automation framework in your daily development workflow.

## 🚀 **Example 1: Feature Development with Quality Gates**

### **Scenario**: Adding a new HELOC calculation feature

```javascript
// 1. Start with task planning
await add_tasks({
  tasks: [{
    name: "Add Advanced HELOC Calculation",
    description: "Implement new payment optimization algorithm with automated quality validation"
  }]
});

// 2. Run pre-development health check
await launch-process({
  command: 'npm run augment:pre-edit',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 60
});

// 3. Check current diagnostics
await diagnostics({ paths: ['src/lib/calculations.ts'] });

// 4. Make the code changes
await str-replace-editor({
  command: 'str_replace',
  path: 'src/lib/calculations.ts',
  instruction_reminder: 'ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH.',
  old_str: '// existing calculation logic',
  new_str: '// new optimized calculation logic'
});

// 5. Run post-edit quality workflow
await launch-process({
  command: 'npm run augment:workflow:post',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 120
});

// 6. Update task status based on results
await update_tasks({
  tasks: [{ task_id: "calculation-feature-id", state: "COMPLETE" }]
});
```

## 🎨 **Example 2: UI Component Development with Visual Validation**

### **Scenario**: Updating the Calculator form component

```javascript
// 1. Create UI development task
await add_tasks({
  tasks: [{
    name: "Enhance Calculator Form UI",
    description: "Improve form layout and add validation indicators"
  }]
});

// 2. Take baseline screenshot using Browser Tools MCP
await browser_navigate_Playwright({ url: 'http://localhost:3000' });
await browser_take_screenshot_Playwright({ 
  filename: 'calculator-form-before.png',
  fullPage: true 
});

// 3. Run UI-specific pre-checks
await launch-process({
  command: 'npm run augment:ui-check',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 60
});

// 4. Make UI changes
await str-replace-editor({
  command: 'str_replace',
  path: 'src/components/CalculatorForm.tsx',
  instruction_reminder: 'ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH.',
  old_str: 'className="form-input"',
  new_str: 'className="form-input focus:ring-2 focus:ring-blue-500"'
});

// 5. Run UI validation workflow
await launch-process({
  command: 'npm run augment:workflow:ui',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 90
});

// 6. Take after screenshot and compare
await browser_take_screenshot_Playwright({ 
  filename: 'calculator-form-after.png',
  fullPage: true 
});

// 7. Run accessibility check
await browser_snapshot_Playwright();

// 8. Update task with validation results
await update_tasks({
  tasks: [{ task_id: "ui-enhancement-id", state: "COMPLETE" }]
});
```

## 🔄 **Example 3: Automated Code Review Workflow**

### **Scenario**: Preparing code for review/deployment

```javascript
// 1. Create comprehensive review task
await add_tasks({
  tasks: [{
    name: "Pre-Deployment Code Review",
    description: "Comprehensive quality validation before deployment"
  }]
});

// 2. Run complete deployment readiness workflow
await launch-process({
  command: 'npm run augment:workflow:deploy',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 300
});

// 3. Check for any remaining diagnostics issues
await diagnostics({ 
  paths: ['src/', 'pages/', 'components/'] 
});

// 4. Run E2E tests with Browser Tools MCP
await browser_navigate_Playwright({ url: 'http://localhost:3000' });
await browser_click_Playwright({ 
  element: 'Calculate button',
  ref: 'button[data-testid="calculate-btn"]'
});
await browser_wait_for_Playwright({ text: 'Results' });

// 5. Generate deployment report
await launch-process({
  command: 'echo "Deployment readiness report:" && npm run augment:session',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 30
});

// 6. Update task with final status
await update_tasks({
  tasks: [{ task_id: "review-task-id", state: "COMPLETE" }]
});
```

## 🧠 **Example 4: Complex Problem Solving with Sequential Thinking**

### **Scenario**: Debugging a calculation accuracy issue

```javascript
// 1. Use Sequential Thinking MCP for systematic debugging
await sequentialthinking_Sequential_thinking({
  thought: "I need to debug a HELOC calculation accuracy issue. Let me break this down systematically: 1) Identify the specific calculation that's wrong, 2) Check the input validation, 3) Verify the mathematical formulas, 4) Test edge cases.",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 5
});

// 2. Create debugging task workflow
await add_tasks({
  tasks: [{
    name: "Debug HELOC Calculation Accuracy",
    description: "Systematic debugging of calculation discrepancies"
  }]
});

// 3. Run diagnostic checks on calculation files
await diagnostics({ paths: ['src/lib/calculations.ts', 'src/lib/validation.ts'] });

// 4. Use PostgreSQL MCP to check database calculations
await postgresql_query({
  query: "SELECT * FROM calculation_logs WHERE accuracy_flag = false LIMIT 10"
});

// 5. Continue sequential thinking
await sequentialthinking_Sequential_thinking({
  thought: "Based on the diagnostics and database query, I can see the issue is in the interest calculation formula. Let me verify the mathematical accuracy and check for edge cases.",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
});

// 6. Run targeted tests
await launch-process({
  command: 'npm test -- --testNamePattern="calculation accuracy"',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 60
});

// 7. Update task with findings
await update_tasks({
  tasks: [{ task_id: "debug-task-id", state: "IN_PROGRESS" }]
});
```

## 📊 **Example 5: Automated Quality Monitoring**

### **Scenario**: Setting up continuous quality monitoring

```javascript
// 1. Create monitoring task
await add_tasks({
  tasks: [{
    name: "Quality Monitoring Setup",
    description: "Establish automated quality monitoring for the project"
  }]
});

// 2. Run session status to get baseline
await launch-process({
  command: 'npm run augment:session',
  cwd: '/Users/elliotnoteware/Documents/heloc_accel/heloc-accelerator',
  wait: true,
  max_wait_seconds: 30
});

// 3. Store quality standards in project memory
await write_memory_serena({
  memory_name: 'automated-quality-standards',
  content: `
# Automated Quality Standards for HELOC Accelerator

## Code Quality Gates
- TypeScript: Strict mode, no any types
- Linting: ESLint with financial services rules
- Testing: 80% coverage minimum
- Build: Must pass without warnings

## UI Standards  
- WCAG AA compliance (4.5:1 contrast ratio)
- Design system components only
- Mobile-first responsive design
- Financial data formatting standards

## Security Requirements
- No sensitive data in code
- Input validation on all forms
- Secure API endpoints
- Regular dependency audits

## Automation Triggers
- Pre-edit: Health check + TypeScript validation
- Post-edit: Quality workflow + security scan
- UI changes: Accessibility + design system check
- Deployment: Full validation suite + E2E tests
  `
});

// 4. Set up automated task creation for quality issues
await add_tasks({
  tasks: [{
    name: "Weekly Quality Review",
    description: "Automated weekly quality metrics review and improvement planning"
  }]
});

// 5. Update monitoring task
await update_tasks({
  tasks: [{ task_id: "monitoring-task-id", state: "COMPLETE" }]
});
```

## 🔧 **Integration with Existing Workflows**

### **Adding to Your Current Development Process**

```javascript
// Before making any code changes:
await launch-process({ command: 'npm run augment:pre-edit', wait: true });

// After making changes:
await launch-process({ command: 'npm run augment:post-edit', wait: true });

// For UI work:
await launch-process({ command: 'npm run augment:ui-check', wait: true });

// Before deployment:
await launch-process({ command: 'npm run augment:workflow:deploy', wait: true });
```

### **Task Management Integration**

```javascript
// Create quality-focused task hierarchies
await add_tasks({
  tasks: [
    {
      name: "Feature Development",
      description: "Main feature development task"
    },
    {
      name: "Quality Validation",
      description: "Automated quality checks",
      parent_task_id: "feature-task-id"
    },
    {
      name: "UI Consistency Check", 
      description: "Design system compliance",
      parent_task_id: "quality-task-id"
    }
  ]
});
```

## 🎯 **Benefits Summary**

1. **Explicit Control**: Unlike Claude Code hooks, you see exactly what's running
2. **Task Integration**: Quality checks become part of your project planning
3. **MCP Leverage**: Uses your existing MCP servers for specialized validation
4. **Flexible Automation**: Can skip or modify workflows as needed
5. **Progress Tracking**: Quality metrics tracked in task system

This approach gives you Claude Code-style automation while working within Augment's strengths!
