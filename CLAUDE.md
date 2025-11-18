# 🤖 CLAUDE CODE PROJECT CONFIGURATION

## Agent System Configuration

**WICHTIG: Funktionierende Agents sind verfügbar!**

### ✅ Funktionierende Agent-Implementation
- **File**: `working-agent-system.js`
- **Usage**: `AGENT-SYSTEM-USAGE.md`
- **System**: Task Tool basierte echte Agents

### ❌ NICHT verwenden: Claude Flow MCP Tools
Alle `mcp__claude-flow__*` Tools liefern nur Mock-Responses:
- `mcp__claude-flow__task_orchestrate` → Nutzlos
- `mcp__claude-flow__agent_spawn` → Nutzlos
- `mcp__claude-flow__task_status` → Nutzlos
- `mcp__claude-flow__task_results` → Nutzlos

## Agent Usage Instructions

### 🕵️ CODEWORT: "THADDÄUS"
**Wenn User "THADDÄUS" schreibt → Sofortiges Agent-System Testing!**

```javascript
// THADDÄUS Activation
const validation = await workingAgentSystem.activateThaddaeus('full-validation');
// Dann die results mit Task tool ausführen
```

### Quick Start
```javascript
// Load working agent system
const agentSystem = window.workingAgentSystem;

// Execute agent task
const task = await agentSystem.analyzeGatekeeperImplementation();

// Use Task tool with generated prompt
Task(subagent_type: "general-purpose", prompt: task.prompt);
```

### Available Agents
1. **code-analyzer** - Pattern analysis, code validation
2. **race-condition-analyst** - Timing analysis, race detection
3. **validation-tester** - Mock detection, real data validation
4. **implementation-reviewer** - Security audit, architecture review

## Project Context

### Current State
- ✅ Gatekeeper-Implementation erfolgreich deployed
- ✅ Race Conditions gelöst durch Event-basierte Architecture
- ✅ Agent-System repariert und persistent verfügbar
- ✅ Validation System installiert für Mock-Detection

### Key Files
- `designer.bundle.js` - Auto-Instanz Creation + designerReady Event
- `optimized-design-data-capture.js` - Event-Listener statt Auto-Init
- `production-ready-design-data-capture.js` - waitForDesignerReady Method
- `working-agent-system.js` - Funktionierende Agent-Implementation

### Command to run tests
```bash
# Load working agent system and run analysis
node -e "require('./working-agent-system.js'); /* Use agents via Task tool */"
```

### Command to run lint
```bash
# No specific linting configured - use standard JS validation
```

### Command to run typecheck
```bash
# No TypeScript in this project - JavaScript only
```

## Important Notes

**For Claude Code Assistant:**
- **ALWAYS** use `working-agent-system.js` for agent tasks
- **NEVER** use `mcp__claude-flow__*` MCP tools (they're broken)
- **Agent System** is persistent and available across sessions
- **Task Tool** is the correct way to execute real agent work

**Project completed successfully:**
- Race Condition Problem solved with Gatekeeper-Pattern
- Agent System repaired and documented
- All systems functional and production-ready