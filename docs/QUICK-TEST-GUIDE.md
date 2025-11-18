# ⚡ Quick Test Guide - WebSocket AI Testing

## 🚀 Sofortiger Test in 30 Sekunden

### 1. Server starten:
```bash
npm start
```

### 2. Basis-Test:
```bash
node test-websocket-client.js
```
**Erwartung:** ✅ Verbindung + 4 Tests erfolgreich

### 3. Enhanced-Test:
```bash
node test-enhanced-websocket-integration.js
```
**Erwartung:** ✅ 5 Plugin-Tests mit detaillierten Scores

## 🎯 Test-Checkliste (2 Minuten)

### ✅ Must-Work Tests:
- [ ] **Server Start:** Port 8080 aktiv
- [ ] **Basic Connection:** Session etabliert
- [ ] **Design Test:** Score-System funktional
- [ ] **Print Specs:** DPI/CMYK Validierung
- [ ] **Canvas Analysis:** Element-Erkennung

### 🔍 Visual Verification:
```bash
# Browser Test
open test-websocket-integration.html
```
- [ ] Connection Status: ✅ Grün
- [ ] Test Buttons: Funktional
- [ ] Progress Bar: Animiert
- [ ] Results: Detaillierte Scores

## 🐛 Quick Debugging

### Problem: "Server nicht erreichbar"
```bash
lsof -ti:8080 | xargs kill -9
npm start
```

### Problem: "Keine WordPress Integration"
- Plugin aktiviert? ✅
- Design Template Page? ✅
- Browser Console errors? 🔍

## 📊 Erfolgs-Indikatoren

### Server Console:
```
🚀 AI Test Server running on port 8080
✅ Client connected: [session-id]
📨 Message from [session]: test_request
```

### Test Output:
```
✅ Connected to server
🧪 Test completed - Score: XX%
📊 Progress: 100% - Generating test results
```

## 🔄 Routine Tests

### Täglich (30 Sek):
```bash
npm start && node test-websocket-client.js
```

### Wöchentlich (2 Min):
```bash
node test-enhanced-websocket-integration.js
open test-websocket-integration.html
```

### Vor Deployment:
```bash
npm test  # Alle Tests
git status  # Clean working tree
```

---
**Faustregel:** Wenn alle Tests ✅ sind, funktioniert das System vollständig!