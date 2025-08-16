---
type: "always_apply"
---

# AUGMENT MCP ORCHESTRATION RULES

## Tool Selection Priority by Task Type

### 🔍 CODE EXPLORATION & DEVELOPMENT

**Primary: Serena MCP**

- Use get_symbols_overview, find_symbol, activate_project
- Semantic code understanding over text search
- Symbol-level editing with replace_symbol_body
- Reference project memories for context

### 📚 LIBRARY & API RESEARCH

**Primary: Context7 MCP**

- Use resolve-library-id + get-library-docs for any external library questions
- Get up-to-date documentation for React, Next.js, TypeScript, etc.
- Verify API usage and best practices

### 🌐 UI TESTING & BROWSER AUTOMATION

**Primary: Playwright MCP**

- E2E testing of calculator functionality
- UI interaction testing
- Cross-browser compatibility checks
- Automated form testing

### 🧠 COMPLEX PROBLEM SOLVING

**Primary: Sequential Thinking MCP**

- Multi-step feature planning
- Complex debugging workflows
- Architecture decisions
- Breaking down large tasks

### 🗄️ DATABASE OPERATIONS

**Primary: PostgreSQL MCP**

- Direct SQL queries and schema inspection
- Read-only data analysis and reporting
- Database performance analysis
  **Secondary: Supabase MCP**
- API-level database operations
- Real-time features and subscriptions
- Database schema changes via Supabase dashboard

## 🔄 WORKFLOW ORCHESTRATION

### Feature Development Workflow:

1. **Sequential Thinking**: Plan the feature implementation
2. **Serena**: Explore existing code structure
3. **Context7**: Research any new libraries/APIs needed
4. **Serena**: Implement changes semantically
5. **Playwright**: Create E2E tests
6. **Serena**: Update project memories

### Debugging Workflow:

1. **Sequential Thinking**: Analyze the problem systematically
2. **Serena**: Find relevant code symbols and references
3. **PostgreSQL MCP**: Check database state and query performance (if data-related)
4. **Playwright**: Reproduce the issue in browser (if UI-related)
5. **Context7**: Check library documentation for known issues
6. **Serena**: Implement fix at symbol level

### Research & Learning:

1. **Context7**: Get latest documentation
2. **Sequential Thinking**: Plan learning approach
3. **Serena**: Find relevant code examples in project
4. **Playwright**: Test implementation

## 🎯 DEFAULT BEHAVIORS

- **Always start complex tasks** with Sequential Thinking for planning
- **Always use Serena** for code operations (reading, editing, exploring)
- **Always use Context7** when mentioning external libraries
- **Always use Playwright** for UI/browser-related testing
- **Always use PostgreSQL MCP** for database queries, schema inspection, and data analysis
- **Chain MCPs together** for comprehensive solutions

## 🚀 PROJECT CONTEXT

- Project: HELOC Accelerator (Next.js TypeScript financial calculator)
- Database: PostgreSQL via Supabase
- Testing: Jest + Playwright
- Key libraries: Next.js, React, Recharts, NextAuth, Tailwind
