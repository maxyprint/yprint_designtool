# Issue #23 Precision Testing System - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
composer install

# Run all tests
composer test

# Run with coverage
composer test:coverage

# View coverage report
open coverage-html/index.html
```

## 📋 Test Commands

| Command | Description | Example |
|---------|-------------|---------|
| `composer test` | Run all test suites | Full system validation |
| `composer test:unit` | Unit tests only | Fast component testing |
| `composer test:integration` | Integration tests | WordPress environment testing |
| `composer test:performance` | Performance benchmarks | Speed and memory validation |
| `composer test:coverage` | Generate coverage report | HTML coverage analysis |
| `composer test:coverage-clover` | XML coverage for CI/CD | Codecov integration |

## 🎯 Precision Validation

```bash
# Core precision tests
php tests/precision-validation.php

# Enhanced precision suite
php tests/enhanced-precision-tests.php

# Standalone precision tests
php tests/standalone-precision-tests.php

# Debug precision issues
php tests/debug-precision-issues.php

# Final validation report
php tests/final-precision-validation.php
```

## ⚡ Performance Benchmarks

```bash
# Run performance benchmark suite
php tests/Performance/PerformanceBenchmarkRunner.php

# Individual performance tests
./vendor/bin/phpunit tests/Performance/CalculationPerformanceTest.php
./vendor/bin/phpunit tests/Performance/APIPipelinePerformanceTest.php
./vendor/bin/phpunit tests/Performance/ResourceUtilizationTest.php
```

## 📊 CI/CD Pipeline

The system includes automated GitHub Actions workflow:

- **Multi-PHP testing**: 7.4, 8.0, 8.1, 8.2
- **Multi-WordPress**: 6.0, 6.1, 6.2, latest
- **Automated coverage**: Codecov integration
- **Performance monitoring**: Automated benchmarking
- **Precision validation**: ±0.1mm compliance checking

## 🎯 Quality Gates

| Metric | Target | Status |
|--------|--------|--------|
| Overall Coverage | > 90% | ✅ |
| PrecisionCalculator Coverage | > 95% | ✅ |
| Calculation Time | < 100ms | ✅ |
| Memory Usage | < 512MB | ✅ |
| Precision Tolerance | ±0.1mm | ✅ |

## 🔧 Configuration

### PHPUnit Configuration

Key settings in `phpunit.xml`:

```xml
<const name="MEASUREMENT_PRECISION_TOLERANCE" value="0.1" />
<const name="MAX_CALCULATION_TIME_MS" value="100" />
<const name="MAX_API_RESPONSE_TIME_MS" value="2000" />
```

### Test Data

Automatic fixtures in `tests/bootstrap.php`:
- Test template ID: 999
- Size measurements: S, M, L, XL
- DPI support: 72, 96, 150, 300

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| PHPUnit not found | `composer install --dev` |
| Database connection failed | Check MySQL and create `wordpress_test` database |
| WordPress test suite missing | Run `bash bin/install-wp-tests.sh wordpress_test root password localhost latest` |
| Memory limits | Increase PHP memory_limit to 512M |
| Precision tests failing | Check PrecisionCalculator class and measurement data |

## 📚 Documentation

- **Complete Documentation**: [ISSUE-23-PRECISION-TESTING.md](ISSUE-23-PRECISION-TESTING.md)
- **API Reference**: Detailed method documentation with examples
- **Integration Guide**: WordPress/WooCommerce setup instructions
- **Mathematical Standards**: Precision formulas and algorithms

## 🎯 Key Features

### ✅ Mathematical Precision
- ±0.1mm tolerance compliance
- Advanced rounding algorithms
- DPI-aware conversion formulas
- Template-aware scaling

### ✅ Comprehensive Testing
- 90%+ test coverage
- Unit, integration, and performance tests
- Automated precision validation
- WordPress environment testing

### ✅ Production Ready
- CI/CD automation
- Performance monitoring
- Memory optimization
- Error handling and validation

### ✅ Developer Friendly
- Clear documentation
- Comprehensive examples
- Troubleshooting guides
- Performance benchmarks

---

For complete documentation, see [ISSUE-23-PRECISION-TESTING.md](ISSUE-23-PRECISION-TESTING.md)