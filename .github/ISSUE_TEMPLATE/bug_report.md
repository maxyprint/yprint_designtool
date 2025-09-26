---
name: 🐛 Bug Report
about: Create a report to help us improve the precision system
title: '[BUG] '
labels: 'bug, needs-triage'
assignees: ''
---

## 🐛 Bug Description

### Summary
<!-- A clear and concise description of what the bug is -->

### Expected Behavior
<!-- A clear and concise description of what you expected to happen -->

### Actual Behavior
<!-- A clear and concise description of what actually happened -->

## 📐 Precision System Impact

### Affected Components
<!-- Mark all that apply -->

- [ ] 🧮 Precision Calculator
- [ ] 📏 Measurement Tools
- [ ] 🎯 DPI Calculations
- [ ] 📊 Validation System
- [ ] 🔄 Data Conversion
- [ ] 🖥️ User Interface
- [ ] ⚙️ Admin Panel
- [ ] 🔗 API Endpoints

### Precision Tolerance
- [ ] ❌ **CRITICAL**: Results outside ±0.1mm tolerance
- [ ] ⚠️ **WARNING**: Results approaching tolerance limits
- [ ] ℹ️ **INFO**: Precision-related but within tolerance

### DPI Values Affected
<!-- Mark all affected DPI values -->

- [ ] 72 DPI
- [ ] 96 DPI
- [ ] 150 DPI
- [ ] 300 DPI
- [ ] Other: _____ DPI

## 🔍 Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Minimal Reproducible Example
<!-- Provide the smallest possible example that reproduces the issue -->

```php
// Add code example here if applicable
```

## 🖥️ Environment Information

### System Details
- **WordPress Version**: [e.g. 6.3]
- **PHP Version**: [e.g. 8.1.0]
- **Plugin Version**: [e.g. 1.2.3]
- **Browser**: [e.g. Chrome 118, Safari 16]
- **Operating System**: [e.g. Windows 11, macOS 13, Ubuntu 22.04]

### Server Configuration
- **Memory Limit**: [e.g. 256M]
- **Max Execution Time**: [e.g. 30s]
- **Database**: [e.g. MySQL 8.0]
- **Server**: [e.g. Apache 2.4, Nginx 1.20]

### Plugin Configuration
<!-- Share relevant plugin settings (remove sensitive information) -->

```json
{
  "precision_tolerance": "0.1mm",
  "supported_dpis": [72, 96, 150, 300],
  "calculation_method": "...",
  "debug_mode": false
}
```

## 📸 Screenshots/Evidence

### Visual Evidence
<!-- Add screenshots, videos, or other visual evidence -->

### Error Messages
<!-- Include any error messages, stack traces, or console output -->

```
Error message goes here
```

### Browser Console
<!-- Include browser console errors if applicable -->

```javascript
// Console errors go here
```

## 📊 Data and Calculations

### Input Values
<!-- Provide the input values that cause the issue -->

- **Width**: ___ pixels
- **Height**: ___ pixels
- **DPI**: ___
- **Expected Output**: ___ mm
- **Actual Output**: ___ mm

### Calculation Details
<!-- Show the mathematical breakdown if applicable -->

```
Expected: width_px / dpi * 25.4 = ___ mm
Actual: ___ mm
Difference: ___ mm (±___ mm from expected)
```

## 🔄 Workaround

### Temporary Solution
<!-- Describe any workaround you've found -->

### Impact Assessment
- [ ] 🔴 **BLOCKING**: Prevents core functionality
- [ ] 🟠 **HIGH**: Significantly impacts user experience
- [ ] 🟡 **MEDIUM**: Minor impact on functionality
- [ ] 🟢 **LOW**: Cosmetic or edge case issue

## 🧪 Testing Information

### Testing Performed
<!-- Describe what testing you've done -->

- [ ] Tested on multiple browsers
- [ ] Tested with different DPI values
- [ ] Tested with various input sizes
- [ ] Verified with manual calculations
- [ ] Checked in different environments

### Test Data
<!-- Provide specific test cases that fail -->

| Input Width | Input Height | DPI | Expected (mm) | Actual (mm) | Difference |
|-------------|--------------|-----|---------------|-------------|------------|
| 96px        | 96px         | 96  | 25.4mm        | ___mm       | ±___mm     |

## 🏷️ Additional Context

### Related Issues
<!-- Link to related issues or PRs -->

- Related to #___
- Might be caused by #___
- Similar to #___

### Business Impact
<!-- Describe the impact on users or business operations -->

### Urgency Level
- [ ] 🚨 **CRITICAL**: System down or data loss
- [ ] 🔥 **URGENT**: Major functionality broken
- [ ] ⚡ **HIGH**: Important feature affected
- [ ] 📋 **NORMAL**: Standard bug fix priority
- [ ] 🕐 **LOW**: Can be addressed in future releases

## ✅ Bug Report Checklist

### Pre-submission
- [ ] 🔍 Searched existing issues for duplicates
- [ ] 🧪 Reproduced the issue consistently
- [ ] 📊 Gathered all relevant data and evidence
- [ ] 🏷️ Applied appropriate labels
- [ ] 📝 Provided clear, actionable description

### Quality Assurance
- [ ] 📐 Verified precision calculations manually
- [ ] 🔄 Tested across multiple DPI values
- [ ] 🖥️ Tested in different environments
- [ ] 📸 Included visual evidence
- [ ] 📋 Completed all relevant sections

---

**Additional Notes:**
<!-- Any other context, concerns, or information that might help -->

**For Maintainers:**
<!-- This section will be filled by maintainers during triage -->

- **Priority**:
- **Milestone**:
- **Assignee**:
- **Labels**:
- **Estimated Effort**: