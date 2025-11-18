# PROJECT GENESIS - Projektstruktur

## Übersicht
Diese Dokumentation definiert die standardisierte Ordner- und Dateistruktur für alle Projekte, die mit dem Project Genesis Framework erstellt werden. Die Struktur ist darauf optimiert, dass autonome Sub-Agenten effizient miteinander über das Dateisystem kommunizieren können.

## Hauptverzeichnis-Struktur

```
project-name/
├── docs/                    # Alle Projektdokumentationen
├── src/                     # Quellcode der Anwendung
├── tests/                   # Alle Tests und QA-Berichte
├── prompts/                 # Agent-Prompts für das aktuelle Projekt
├── config/                  # Konfigurationsdateien
├── assets/                  # Statische Ressourcen
├── .genesis/                # Framework-spezifische Metadaten
├── README.md                # Finale Projektdokumentation
├── package.json            # Abhängigkeiten und Skripte
└── .gitignore              # Git-Ausschlussliste
```

## `/docs` - Dokumentationsverzeichnis

Dieses Verzeichnis enthält alle projektspezifischen Dokumentationen, die von den Sub-Agenten erstellt und gelesen werden.

```
docs/
├── project_brief.md         # Ursprüngliche Projektidee und Anforderungen
├── architecture.md          # Technische Architektur (ArchitectAgent)
├── ux_research.md          # User Stories und User Flows (UX_ResearcherAgent)
├── ui_design.md            # Wireframes und Design-System (UI_DesignerAgent)
├── api_specification.md    # API-Endpunkte und Datenmodelle (Backend_DeveloperAgent)
├── frontend_specification.md # Frontend-Komponenten und Routing (Frontend_DeveloperAgent)
├── qa_report.md            # Test-Ergebnisse und Fehlerberichte (QA_Agent)
├── deployment_guide.md     # Deployment-Anweisungen
└── changelog.md            # Versions- und Änderungshistorie
```

### Wichtige Dateien im Detail:

**`project_brief.md`** - Die Grundlage aller Agent-Aktionen
- Ursprüngliche App-Idee
- Zielgruppe und Ziele
- Funktionale Anforderungen
- Nicht-funktionale Anforderungen
- Technologie-Präferenzen

**`architecture.md`** - Technische Blaupause
- Gewählter Tech-Stack mit Begründung
- System-Architektur-Diagramm
- Datenbank-Schema
- Sicherheitskonzepte
- Skalierungsstrategien

## `/src` - Quellcode-Verzeichnis

Die Struktur richtet sich nach dem gewählten Tech-Stack, aber folgt immer diesen Prinzipien:

```
src/
├── components/             # Wiederverwendbare UI-Komponenten
├── pages/                  # Seiten/Views der Anwendung
├── services/              # Business Logic und API-Aufrufe
├── utils/                 # Hilfsfunktionen und Utilities
├── hooks/                 # Custom Hooks (React) oder ähnliche Patterns
├── stores/                # State Management (Redux, Zustand, etc.)
├── styles/                # CSS/SCSS/Styled-Components
├── types/                 # TypeScript Typdefinitionen
├── constants/             # App-weite Konstanten
├── config/                # Laufzeit-Konfigurationen
└── main.js|tsx            # Haupt-Entry-Point
```

### Backend-spezifische Ergänzungen (falls vorhanden):
```
src/
├── controllers/           # Route-Handler
├── models/               # Datenmodelle
├── middleware/           # Express/Fastify Middleware
├── routes/               # API-Route-Definitionen
├── database/             # Migrations und Seeders
└── server.js|ts          # Server-Entry-Point
```

## `/tests` - Test-Verzeichnis

```
tests/
├── unit/                  # Unit-Tests für einzelne Funktionen
├── integration/           # Integration-Tests für APIs
├── e2e/                   # End-to-End Tests
├── mocks/                 # Mock-Daten und -Services
├── fixtures/              # Test-Daten
├── qa_report.md           # Detaillierter QA-Bericht vom QA_Agent
└── test_results.json      # Maschinell lesbare Testergebnisse
```

## `/prompts` - Agent-Prompts Verzeichnis

Enthält projektspezifische Anpassungen der Master-Prompts:

```
prompts/
├── current_phase.txt      # Aktuelle Entwicklungsphase
├── custom_architect.md    # Angepasster Architect-Prompt
├── custom_frontend.md     # Angepasster Frontend-Prompt
├── custom_backend.md      # Angepasster Backend-Prompt
├── custom_qa.md          # Angepasster QA-Prompt
└── context_summary.md    # Zusammenfassung aller bisherigen Entscheidungen
```

## `/config` - Konfigurationsverzeichnis

```
config/
├── development.json       # Entwicklungsumgebung
├── production.json        # Produktionsumgebung
├── database.json         # Datenbank-Konfigurationen
├── api_keys.example.json # Beispiel für benötigte API-Keys
└── deployment.yml        # Docker/Kubernetes Konfigurationen
```

## `/assets` - Statische Ressourcen

```
assets/
├── images/               # Bilder und Icons
├── fonts/                # Webfonts
├── videos/               # Video-Dateien
├── documents/            # PDFs und andere Dokumente
└── icons/                # SVG-Icons und Favicons
```

## `/.genesis` - Framework-Metadaten

```
.genesis/
├── agent_log.json        # Log aller Agent-Aktionen
├── phase_status.json     # Status jeder Entwicklungsphase
├── dependencies.json     # Abhängigkeiten zwischen Agenten
├── context_checksum.md   # Checksumme für Kontext-Validierung
└── version.json          # Framework-Version
```

## Wichtige Stammverzeichnis-Dateien

**`README.md`** - Finale Projektdokumentation
- Vom DocuWriterAgent erstellt
- Benutzerfreundliche Installationsanleitung
- API-Dokumentation
- Deployment-Anweisungen
- Fehlerbehebung

**`package.json`** - Projektmetadaten
- Alle npm/yarn Abhängigkeiten
- Skripte für Entwicklung, Build, Test
- Projekt-Metadaten

## Kontext-Weitergabe zwischen Agenten

Die Agenten kommunizieren über standardisierte Dateien:

1. **Input-Dateien**: Jeder Agent liest spezifische Dateien aus `/docs`
2. **Output-Dateien**: Jeder Agent schreibt seine Ergebnisse in definierte Dateien
3. **Status-Files**: In `/.genesis` wird der aktuelle Status gespeichert
4. **Validierung**: Checksummen stellen sicher, dass kein Kontext verloren geht

## Namenskonventionen

- **Ordner**: lowercase mit Bindestrichen (`user-management`)
- **Dateien**: lowercase mit Unterstrichen (`user_service.js`)
- **Komponenten**: PascalCase (`UserProfile.tsx`)
- **Konstanten**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Variablen/Funktionen**: camelCase (`getUserProfile`)

## Skalierbarkeit und Erweiterbarkeit

Die Struktur ist darauf ausgelegt, dass:
- Neue Agenten einfach hinzugefügt werden können
- Projekte unterschiedlicher Größe unterstützt werden
- Multi-Language/Multi-Framework Projekte möglich sind
- Versionierung und Branching problemlos funktioniert

Diese Projektstruktur gewährleistet, dass autonome Sub-Agenten effizient arbeiten können, der Kontext nie verloren geht und neue Entwickler sich schnell zurechtfinden.