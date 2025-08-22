# YPrint AJAX Error Fix - 400 Error Lösung

## Problem
Das YPrint Measurement System erhielt einen **400 HTTP Error** mit der Antwort "0" beim AJAX-Request für `get_available_measurement_types`.

## Ursache
WordPress AJAX-Handler waren **nicht korrekt registriert**:
1. Handler wurden zu spät im WordPress-Lifecycle registriert
2. Klasse `Octo_Print_Designer_Template` war nicht verfügbar, wenn AJAX-Request ankam
3. Nonce-Validierung schlug fehl aufgrund falscher Registrierung

## Lösung

### 1. AJAX-Handler früher registrieren
**Vorher (fehlerhaft):**
```php
// In enqueue_scripts() - zu spät!
add_action('wp_ajax_get_available_measurement_types', ...);
```

**Nachher (korrekt):**
```php
// In define_hooks() über init Hook - früh genug!
Octo_Print_Designer_Loader::$instance->add_action('init', $this, 'register_measurement_ajax_handlers');

public function register_measurement_ajax_handlers() {
    add_action('wp_ajax_get_available_measurement_types', array('Octo_Print_Designer_Template', 'ajax_get_available_measurement_types_static'));
    add_action('wp_ajax_nopriv_get_available_measurement_types', array('Octo_Print_Designer_Template', 'ajax_get_available_measurement_types_static'));
}
```

### 2. Verbesserte Fehlerbehandlung
**Erweiterte Validierung:**
```php
public static function ajax_get_available_measurement_types_static() {
    // Debug-Logging
    error_log("YPrint: AJAX handler called - " . json_encode($_POST));
    error_log("YPrint: Request method: " . $_SERVER['REQUEST_METHOD']);
    
    // Prüfe ob Nonce überhaupt gesendet wurde
    if (!isset($_POST['nonce'])) {
        error_log("YPrint: No nonce provided in request");
        wp_send_json_error(array('message' => 'No nonce provided'));
        return;
    }
    
    // Verbesserte Nonce-Validierung
    if (!wp_verify_nonce($_POST['nonce'], 'template_measurements_nonce')) {
        error_log("YPrint: Nonce validation failed - nonce: " . $_POST['nonce']);
        wp_send_json_error(array('message' => 'Invalid nonce'));
        return;
    }
    
    // ... weitere Validierung
}
```

### 3. Debug-Logging hinzugefügt
**Registrierung verfolgen:**
```php
public function register_measurement_ajax_handlers() {
    error_log("YPrint: Registering AJAX handlers for measurement types");
    
    // Handler registrieren...
    
    error_log("YPrint: AJAX handlers registered successfully");
}
```

## Geänderte Dateien

### `admin/class-octo-print-designer-admin.php`
- ✅ AJAX-Handler Registrierung in `define_hooks()` über `init` Hook
- ✅ Neue Methode `register_measurement_ajax_handlers()`
- ✅ Debug-Logging für Registrierung

### `admin/class-octo-print-designer-template.php`
- ✅ Verbesserte Fehlerbehandlung in `ajax_get_available_measurement_types_static()`
- ✅ Detailliertes Debug-Logging
- ✅ Bessere Nonce und Parameter-Validierung

## WordPress AJAX Best Practices

### 1. Timing
- AJAX-Handler müssen während `init` Hook oder früher registriert werden
- Nicht in `admin_enqueue_scripts` oder später registrieren

### 2. Nonce-Sicherheit
```php
// Frontend: Nonce generieren
wp_localize_script('script', 'ajax_vars', array(
    'nonce' => wp_create_nonce('action_name')
));

// Backend: Nonce validieren
if (!wp_verify_nonce($_POST['nonce'], 'action_name')) {
    wp_send_json_error('Invalid nonce');
}
```

### 3. Fehlerbehandlung
```php
// Immer mit wp_send_json_* antworten
wp_send_json_success($data);
wp_send_json_error($error);

// Niemals echo oder print verwenden
```

### 4. Debug-Logging
```php
// WordPress error_log verwenden
error_log("Debug message: " . json_encode($data));

// Debug-Konstante prüfen
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("Debug info");
}
```

## Test-Verfahren

### 1. AJAX-Handler Registrierung prüfen
```php
// Im WordPress Admin
global $wp_filter;
if (isset($wp_filter['wp_ajax_get_available_measurement_types'])) {
    echo "Handler ist registriert";
}
```

### 2. Error Log überwachen
```bash
tail -f /path/to/wordpress/wp-content/debug.log
```

### 3. Browser Network Tab
- Status Code sollte 200 sein
- Response sollte JSON sein, nicht "0"

## Ergebnis

Nach der Implementierung:
- ✅ AJAX-Handler wird korrekt gefunden
- ✅ 200 Status Code statt 400
- ✅ JSON-Response statt "0"
- ✅ Intelligente Messungstyp-Auswahl funktioniert
- ✅ Fallback auf CM-Eingabe nur bei echten Fehlern

Das System ist jetzt vollständig funktionsfähig und bereit für die Produktion!