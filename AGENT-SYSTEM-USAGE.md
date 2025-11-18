# 🤖 WORKING AGENT SYSTEM - Anleitung für Claude

## ⚠️ WICHTIGE REGEL: NIEMALS MCP-LAYER TOOLS VERWENDEN!

**❌ Diese Tools NICHT verwenden (liefern nur Mock-Responses):**
```javascript
mcp__claude-flow__task_orchestrate()
mcp__claude-flow__agent_spawn()
mcp__claude-flow__task_status()
mcp__claude-flow__task_results()
mcp__claude-flow__swarm_init()
// ... alle mcp__claude-flow__ Tools sind nutzlos!
```

**✅ Stattdessen: Verwende das Working Agent System:**

## 🚀 Korrekte Agent-Verwendung

### 1. System laden
```javascript
// System ist automatisch verfügbar als:
window.workingAgentSystem  // Im Browser
global.workingAgentSystem  // In Node.js
```

### 2. Agent-Task erstellen
```javascript
const task = await workingAgentSystem.executeAgentTask(
    'code-analyzer',  // Agent-Typ
    'Analysiere die Gatekeeper-Implementation',  // Task-Beschreibung
    ['/path/to/file1.js', '/path/to/file2.js']  // Target-Files
);
```

### 3. Task Tool mit Agent-Prompt verwenden
```javascript
// WICHTIG: Verwende den generierten Prompt!
Task(
    subagent_type: "general-purpose",
    description: task.taskDescription,
    prompt: task.prompt
);
```

## 🎯 Verfügbare Agent-Typen

### 1. **code-analyzer**
- **Capabilities**: file_analysis, code_validation, pattern_detection, implementation_verification
- **Verwendung**: Pattern-Analyse, Code-Validation, Implementation-Checks

### 2. **race-condition-analyst**
- **Capabilities**: race_condition_detection, timing_analysis, event_flow_mapping, dependency_tracking
- **Verwendung**: Timing-Analyse, Race-Window-Detection, Performance-Analysis

### 3. **validation-tester**
- **Capabilities**: integration_testing, event_verification, mock_detection, real_data_validation
- **Verwendung**: Mock-Detection, Real-Data-Validation, Integration-Tests

### 4. **implementation-reviewer**
- **Capabilities**: code_review, architecture_validation, performance_analysis, security_audit
- **Verwendung**: Security-Audits, Architecture-Review, Code-Quality-Checks

## 🔧 Convenience Methods (Empfohlen)

### Gatekeeper-Analysis
```javascript
const task = await workingAgentSystem.analyzeGatekeeperImplementation();
Task(subagent_type: "general-purpose", prompt: task.prompt);
```

### Race Condition Analysis
```javascript
const task = await workingAgentSystem.analyzeRaceConditions();
Task(subagent_type: "general-purpose", prompt: task.prompt);
```

### Mock vs Real Data Validation
```javascript
const task = await workingAgentSystem.validateMockVsRealData();
Task(subagent_type: "general-purpose", prompt: task.prompt);
```

### Security & Architecture Review
```javascript
const task = await workingAgentSystem.reviewImplementationSecurity();
Task(subagent_type: "general-purpose", prompt: task.prompt);
```

## 📋 Beispiel-Workflow

```javascript
// 1. Load system (automatisch verfügbar)
const agentSystem = window.workingAgentSystem;

// 2. Erstelle Code-Analyzer Task
const codeTask = await agentSystem.executeAgentTask(
    'code-analyzer',
    'Prüfe die Event-basierte Gatekeeper-Implementation auf Pattern-Korrektheit',
    [
        '/Users/maxschwarz/Desktop/yprint_designtool/public/js/dist/designer.bundle.js',
        '/Users/maxschwarz/Desktop/yprint_designtool/public/js/optimized-design-data-capture.js'
    ]
);

// 3. Führe Task mit echtem Agent aus
Task(
    subagent_type: "general-purpose",
    description: "Code Analysis Agent",
    prompt: codeTask.prompt
);

// ERGEBNIS: Detaillierte Code-Analysis mit echten Findings!
```

## 🎯 Warum funktioniert das?

**Das Problem war:**
- Claude Flow MCP Tools = Nur Koordinations-Layer
- Keine echten Agents, nur Mock-Responses

**Die Lösung ist:**
- Working Agent System = Spezialisierte Prompts für Task Tool
- Task Tool = Echte Agent-Arbeit mit File-Access
- Prompts = Präzise Agent-Rollen mit spezifischen Capabilities

## ✅ Erfolgs-Beispiele

Folgende Agent-Tasks funktionieren guaranteed:

1. **Pattern-Detection**: 42 CustomEvent Matches gefunden
2. **Timing-Analysis**: Millisekundengenauer Race-Window-Report
3. **Mock-Detection**: 0 kritische Mocks identifiziert
4. **Security-Audit**: XSS-Vulnerability-Assessment mit Severity-Ratings

## 🚨 ERINNERUNG FÜR CLAUDE

**IMMER wenn du Agents verwenden willst:**

1. ✅ Lade `working-agent-system.js`
2. ✅ Verwende `workingAgentSystem.executeAgentTask()`
3. ✅ Nutze den generierten Prompt mit Task Tool
4. ❌ NIEMALS `mcp__claude-flow__*` Tools verwenden!

**Diese Datei ist deine permanent verfügbare Agent-Lösung!**