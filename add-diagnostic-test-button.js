/**
 * 🔧 DIAGNOSTIC TEST BUTTON - NEBEN VIEW DESIGN PREVIEW
 *
 * Fügt einen zusätzlichen "Test Functions" Button neben dem originalen Button hinzu
 * Testet alle Funktionen und protokolliert Ergebnisse in der Console
 *
 * USAGE: Dieses Skript in Browser Console einfügen
 */

(function() {
    'use strict';

    console.log('🔧 DIAGNOSTIC TEST BUTTON wird hinzugefügt...');

    // Finde den originalen Design Preview Button
    const originalButton = document.getElementById('design-preview-btn');

    if (!originalButton) {
        console.log('⚠️ Original Design Preview Button nicht gefunden - erstelle Test-Button trotzdem');
    } else {
        console.log('✅ Original Design Preview Button gefunden:', originalButton);
    }

    // Erstelle den Test-Button
    function createTestButton() {
        // Prüfe ob Test-Button bereits existiert
        if (document.getElementById('diagnostic-test-btn')) {
            console.log('ℹ️ Test-Button existiert bereits');
            return;
        }

        const testButton = document.createElement('button');
        testButton.id = 'diagnostic-test-btn';
        testButton.type = 'button';
        testButton.className = 'button button-secondary';
        testButton.innerHTML = '🔧 Test Functions';

        // Styling ähnlich dem Original-Button
        testButton.style.cssText = `
            margin-left: 10px !important;
            background-color: #0073aa !important;
            border-color: #0073aa !important;
            color: white !important;
            padding: 6px 12px !important;
            font-size: 13px !important;
            border-radius: 3px !important;
            cursor: pointer !important;
        `;

        // Test-Funktionalität beim Klick
        testButton.onclick = function(e) {
            e.preventDefault();
            console.group('🔧 === DIAGNOSTIC FUNCTION TEST START ===');
            console.log('🕐 Test gestartet um:', new Date().toLocaleString('de-DE'));

            runDiagnosticTests();

            console.log('🕐 Test beendet um:', new Date().toLocaleString('de-DE'));
            console.groupEnd();
        };

        // Füge den Button neben dem Original hinzu
        let insertLocation = null;

        if (originalButton && originalButton.parentElement) {
            // Neben dem Original-Button einfügen
            insertLocation = originalButton.parentElement;
            insertLocation.appendChild(testButton);
            console.log('✅ Test-Button neben Original-Button eingefügt');
        } else {
            // Fallback: In design-preview-section einfügen
            const designSection = document.getElementById('design-preview-section');
            if (designSection) {
                insertLocation = designSection;
                designSection.appendChild(testButton);
                console.log('✅ Test-Button in design-preview-section eingefügt');
            } else {
                // Fallback: In WooCommerce Order Data
                const orderData = document.querySelector('#woocommerce-order-data .inside');
                if (orderData) {
                    insertLocation = orderData;
                    orderData.appendChild(testButton);
                    console.log('✅ Test-Button in WooCommerce Order Data eingefügt');
                } else {
                    // Letzter Fallback: An body anhängen
                    document.body.appendChild(testButton);
                    testButton.style.position = 'fixed';
                    testButton.style.top = '150px';
                    testButton.style.right = '20px';
                    testButton.style.zIndex = '9999';
                    console.log('✅ Test-Button als fixed Element eingefügt');
                }
            }
        }

        return testButton;
    }

    // Haupt-Test-Funktionen
    function runDiagnosticTests() {
        console.log('🎯 Target Button ID: design-preview-btn');

        // Test 1: Button Existenz und Eigenschaften
        testButtonExistence();

        // Test 2: CSS Eigenschaften
        testCSSProperties();

        // Test 3: Event Handler
        testEventHandlers();

        // Test 4: JavaScript Umgebung
        testJavaScriptEnvironment();

        // Test 5: WordPress/WooCommerce Kontext
        testWordPressContext();

        // Test 6: AJAX Funktionalität
        testAJAXFunctionality();

        // Test 7: Browser Kompatibilität
        testBrowserCompatibility();

        // Test 8: DOM Manipulation
        testDOMManipulation();

        // Test 9: Synthethischer Button Klick
        testSyntheticClick();

        // Zusammenfassung
        generateTestSummary();
    }

    // Test 1: Button Existenz
    function testButtonExistence() {
        console.group('📍 Test 1: Button Existenz');

        const button = document.getElementById('design-preview-btn');

        if (button) {
            console.log('✅ PASS: Button gefunden');
            console.log('   - Tag:', button.tagName);
            console.log('   - Type:', button.type || 'nicht gesetzt');
            console.log('   - Classes:', button.className || 'keine');
            console.log('   - Disabled:', button.disabled);
            console.log('   - ID:', button.id);

            // Data Attributes
            const dataAttrs = {};
            Array.from(button.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    dataAttrs[attr.name] = attr.value;
                }
            });
            console.log('   - Data Attributes:', dataAttrs);

        } else {
            console.log('❌ FAIL: Button nicht im DOM gefunden');

            // Suche nach ähnlichen Elementen
            const similarButtons = document.querySelectorAll('button[class*="preview"], button[class*="design"], [id*="preview"], [id*="design"]');
            console.log('   - Ähnliche Elemente gefunden:', similarButtons.length);
            similarButtons.forEach((btn, index) => {
                console.log(`     ${index + 1}. ${btn.tagName}#${btn.id}.${btn.className}`);
            });
        }

        console.groupEnd();
        return !!button;
    }

    // Test 2: CSS Eigenschaften
    function testCSSProperties() {
        console.group('🎨 Test 2: CSS Eigenschaften');

        const button = document.getElementById('design-preview-btn');

        if (!button) {
            console.log('❌ SKIP: Button nicht verfügbar für CSS Test');
            console.groupEnd();
            return;
        }

        const styles = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();

        console.log('📐 Computed Styles:');
        console.log('   - display:', styles.display);
        console.log('   - visibility:', styles.visibility);
        console.log('   - opacity:', styles.opacity);
        console.log('   - pointer-events:', styles.pointerEvents);
        console.log('   - position:', styles.position);
        console.log('   - z-index:', styles.zIndex);
        console.log('   - background-color:', styles.backgroundColor);
        console.log('   - color:', styles.color);
        console.log('   - border:', styles.border);
        console.log('   - cursor:', styles.cursor);

        console.log('📏 Position & Größe:');
        console.log('   - left:', Math.round(rect.left), 'px');
        console.log('   - top:', Math.round(rect.top), 'px');
        console.log('   - width:', Math.round(rect.width), 'px');
        console.log('   - height:', Math.round(rect.height), 'px');
        console.log('   - in viewport:', rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight);

        // CSS Probleme identifizieren
        const cssIssues = [];
        if (styles.display === 'none') cssIssues.push('display: none');
        if (styles.visibility === 'hidden') cssIssues.push('visibility: hidden');
        if (parseFloat(styles.opacity) < 0.1) cssIssues.push('opacity zu niedrig');
        if (styles.pointerEvents === 'none') cssIssues.push('pointer-events: none');
        if (rect.width < 10 || rect.height < 10) cssIssues.push('zu kleine Abmessungen');

        if (cssIssues.length > 0) {
            console.log('❌ CSS Probleme gefunden:', cssIssues);
        } else {
            console.log('✅ PASS: Keine CSS Probleme erkannt');
        }

        // Element am Klick-Punkt testen
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtCenter = document.elementFromPoint(centerX, centerY);

        if (elementAtCenter === button) {
            console.log('✅ PASS: Button ist am Klick-Punkt erreichbar');
        } else {
            console.log('❌ FAIL: Anderes Element am Klick-Punkt:', elementAtCenter?.tagName + '#' + elementAtCenter?.id);
        }

        console.groupEnd();
    }

    // Test 3: Event Handler
    function testEventHandlers() {
        console.group('⚡ Test 3: Event Handler');

        const button = document.getElementById('design-preview-btn');

        if (!button) {
            console.log('❌ SKIP: Button nicht verfügbar für Event Test');
            console.groupEnd();
            return;
        }

        console.log('🔍 Event Handler Analyse:');

        // Onclick Handler
        if (button.onclick) {
            console.log('✅ Inline onclick Handler gefunden:');
            console.log('   - Function:', button.onclick.toString().substring(0, 100) + '...');
        } else {
            console.log('❌ Kein inline onclick Handler');
        }

        // addEventListener Check
        console.log('   - addEventListener verfügbar:', typeof button.addEventListener === 'function');

        // jQuery Event Check
        if (typeof jQuery !== 'undefined' && jQuery._data) {
            try {
                const jqEvents = jQuery._data(button, 'events');
                if (jqEvents) {
                    console.log('✅ jQuery Events gefunden:', Object.keys(jqEvents));
                    Object.entries(jqEvents).forEach(([eventType, handlers]) => {
                        console.log(`   - ${eventType}: ${handlers.length} handler(s)`);
                    });
                } else {
                    console.log('❌ Keine jQuery Events gefunden');
                }
            } catch (e) {
                console.log('⚠️ jQuery Events Prüfung fehlgeschlagen:', e.message);
            }
        } else {
            console.log('❌ jQuery nicht verfügbar für Event-Prüfung');
        }

        // Global handlePreviewClick Function
        if (typeof window.handlePreviewClick === 'function') {
            console.log('✅ handlePreviewClick Funktion global verfügbar');
            console.log('   - Function Preview:', window.handlePreviewClick.toString().substring(0, 100) + '...');
        } else {
            console.log('❌ handlePreviewClick Funktion nicht global verfügbar');
        }

        console.groupEnd();
    }

    // Test 4: JavaScript Umgebung
    function testJavaScriptEnvironment() {
        console.group('🌐 Test 4: JavaScript Umgebung');

        console.log('📚 Library Verfügbarkeit:');
        console.log('   - jQuery:', typeof jQuery !== 'undefined' ? '✅ v' + (jQuery.fn.jquery || 'unknown') : '❌ nicht verfügbar');
        console.log('   - jQuery ready:', typeof jQuery !== 'undefined' ? (jQuery.isReady ? '✅ ready' : '❌ not ready') : '❌ n/a');
        console.log('   - ajaxurl:', typeof ajaxurl !== 'undefined' ? '✅ verfügbar: ' + ajaxurl : '❌ nicht verfügbar');
        console.log('   - wp object:', typeof wp !== 'undefined' ? '✅ verfügbar' : '❌ nicht verfügbar');

        console.log('🔧 JavaScript Features:');
        console.log('   - Promise:', typeof Promise !== 'undefined' ? '✅' : '❌');
        console.log('   - fetch:', typeof fetch !== 'undefined' ? '✅' : '❌');
        console.log('   - JSON:', typeof JSON !== 'undefined' ? '✅' : '❌');
        console.log('   - localStorage:', typeof localStorage !== 'undefined' ? '✅' : '❌');
        console.log('   - console:', typeof console !== 'undefined' ? '✅' : '❌');

        console.log('📄 Document Status:');
        console.log('   - readyState:', document.readyState);
        console.log('   - querySelector:', typeof document.querySelector === 'function' ? '✅' : '❌');
        console.log('   - addEventListener:', typeof document.addEventListener === 'function' ? '✅' : '❌');

        console.groupEnd();
    }

    // Test 5: WordPress/WooCommerce Kontext
    function testWordPressContext() {
        console.group('🌐 Test 5: WordPress/WooCommerce Kontext');

        const url = window.location.href;
        const params = new URLSearchParams(window.location.search);

        console.log('🔗 URL Analysis:');
        console.log('   - Full URL:', url);
        console.log('   - Is WP Admin:', url.includes('/wp-admin/') ? '✅' : '❌');
        console.log('   - Is WC Orders:', url.includes('page=wc-orders') ? '✅' : '❌');
        console.log('   - Is Edit Action:', url.includes('action=edit') ? '✅' : '❌');
        console.log('   - Order ID:', params.get('id') || 'nicht gefunden');

        console.log('📦 WordPress Elements:');
        console.log('   - Admin Bar:', !!document.getElementById('wpadminbar') ? '✅' : '❌');
        console.log('   - Admin Menu:', !!document.getElementById('adminmenu') ? '✅' : '❌');
        console.log('   - WC Order Data:', !!document.getElementById('woocommerce-order-data') ? '✅' : '❌');
        console.log('   - Design Section:', !!document.getElementById('design-preview-section') ? '✅' : '❌');

        console.log('🎨 Body Classes:');
        const bodyClasses = Array.from(document.body.classList);
        console.log('   - wp-admin:', bodyClasses.includes('wp-admin') ? '✅' : '❌');
        console.log('   - folded (collapsed menu):', bodyClasses.includes('folded') ? '✅' : '❌');
        console.log('   - All classes:', bodyClasses.join(', '));

        console.groupEnd();
    }

    // Test 6: AJAX Funktionalität
    function testAJAXFunctionality() {
        console.group('🌐 Test 6: AJAX Funktionalität');

        if (typeof ajaxurl === 'undefined') {
            console.log('❌ ajaxurl nicht verfügbar - AJAX Tests übersprungen');
            console.groupEnd();
            return;
        }

        console.log('🔗 AJAX Configuration:');
        console.log('   - ajaxurl:', ajaxurl);
        console.log('   - XMLHttpRequest:', typeof XMLHttpRequest !== 'undefined' ? '✅' : '❌');
        console.log('   - jQuery.ajax:', typeof jQuery !== 'undefined' && typeof jQuery.ajax === 'function' ? '✅' : '❌');

        // Test AJAX Call (ohne tatsächlich auszuführen)
        console.log('🧪 AJAX Test Preparation:');
        const orderId = new URLSearchParams(window.location.search).get('id') || '5374';
        console.log('   - Order ID für Test:', orderId);
        console.log('   - Action:', 'octo_load_design_preview');

        // Nur Vorbereitung, kein echter AJAX Call
        console.log('⚠️ HINWEIS: Echter AJAX Call wird nicht ausgeführt (nur Test der Verfügbarkeit)');

        // Test ob wir einen AJAX Call erstellen könnten
        if (typeof jQuery !== 'undefined' && typeof jQuery.ajax === 'function') {
            console.log('✅ PASS: AJAX Call wäre möglich');

            // Zeige wie der Call aussehen würde
            console.log('   - Hypothetischer AJAX Call:');
            console.log('     jQuery.ajax({');
            console.log('         url: "' + ajaxurl + '",');
            console.log('         type: "POST",');
            console.log('         data: {');
            console.log('             action: "octo_load_design_preview",');
            console.log('             order_id: ' + orderId + ',');
            console.log('             nonce: "test_nonce"');
            console.log('         }');
            console.log('     })');
        } else {
            console.log('❌ FAIL: AJAX Call nicht möglich');
        }

        console.groupEnd();
    }

    // Test 7: Browser Kompatibilität
    function testBrowserCompatibility() {
        console.group('🌍 Test 7: Browser Kompatibilität');

        console.log('🔍 Browser Information:');
        console.log('   - User Agent:', navigator.userAgent);
        console.log('   - Platform:', navigator.platform);
        console.log('   - Language:', navigator.language);
        console.log('   - Cookies Enabled:', navigator.cookieEnabled);
        console.log('   - Online:', navigator.onLine);

        console.log('⚡ JavaScript Capabilities:');
        console.log('   - ES6 Arrow Functions:', (() => true)() ? '✅' : '❌');
        console.log('   - ES6 const/let:', (() => { try { eval('const x = 1'); return true; } catch(e) { return false; } })() ? '✅' : '❌');
        console.log('   - Template Literals:', (() => { try { eval('`test`'); return true; } catch(e) { return false; } })() ? '✅' : '❌');

        console.log('🎨 CSS Capabilities:');
        console.log('   - Flexbox:', testCSSFeature('display', 'flex') ? '✅' : '❌');
        console.log('   - CSS Grid:', testCSSFeature('display', 'grid') ? '✅' : '❌');
        console.log('   - Transform:', testCSSFeature('transform', 'translateX(0)') ? '✅' : '❌');
        console.log('   - Transition:', testCSSFeature('transition', 'opacity 0.3s') ? '✅' : '❌');

        console.groupEnd();
    }

    // CSS Feature Test Helper
    function testCSSFeature(property, value) {
        const element = document.createElement('div');
        try {
            element.style[property] = value;
            return element.style[property] === value;
        } catch (e) {
            return false;
        }
    }

    // Test 8: DOM Manipulation
    function testDOMManipulation() {
        console.group('📝 Test 8: DOM Manipulation');

        const button = document.getElementById('design-preview-btn');

        console.log('🔧 DOM Methods:');
        console.log('   - getElementById:', typeof document.getElementById === 'function' ? '✅' : '❌');
        console.log('   - querySelector:', typeof document.querySelector === 'function' ? '✅' : '❌');
        console.log('   - createElement:', typeof document.createElement === 'function' ? '✅' : '❌');

        if (button) {
            console.log('   - Button Methods:');
            console.log('     - focus():', typeof button.focus === 'function' ? '✅' : '❌');
            console.log('     - click():', typeof button.click === 'function' ? '✅' : '❌');
            console.log('     - getAttribute():', typeof button.getAttribute === 'function' ? '✅' : '❌');
            console.log('     - classList:', 'classList' in button ? '✅' : '❌');
            console.log('     - dataset:', 'dataset' in button ? '✅' : '❌');
        }

        // Test Element Creation
        try {
            const testEl = document.createElement('div');
            testEl.id = 'test-element';
            testEl.textContent = 'Test';
            console.log('✅ Element Creation: Erfolgreich');

            // Test Style Manipulation
            testEl.style.display = 'none';
            console.log('✅ Style Manipulation: Erfolgreich');

        } catch (e) {
            console.log('❌ DOM Manipulation Fehler:', e.message);
        }

        console.groupEnd();
    }

    // Test 9: Synthetischer Button Klick
    function testSyntheticClick() {
        console.group('🖱️ Test 9: Synthetischer Button Klick');

        const button = document.getElementById('design-preview-btn');

        if (!button) {
            console.log('❌ SKIP: Button nicht verfügbar für Klick-Test');
            console.groupEnd();
            return;
        }

        console.log('🎯 Klick-Test Vorbereitung...');

        // Test Event Creation
        try {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            console.log('✅ MouseEvent Creation: Erfolgreich');

            // Test dispatchEvent (aber nicht ausführen auf Original Button)
            console.log('✅ dispatchEvent verfügbar:', typeof button.dispatchEvent === 'function');

            console.log('⚠️ HINWEIS: Synthetischer Klick wird NICHT ausgeführt um Original-Funktion nicht zu stören');
            console.log('   - Event würde so aussehen:', clickEvent);
            console.log('   - Ausführung wäre: button.dispatchEvent(clickEvent)');

            // Test nur die Verfügbarkeit der click() Methode
            if (typeof button.click === 'function') {
                console.log('✅ button.click() Methode verfügbar');
                console.log('⚠️ HINWEIS: button.click() wird NICHT aufgerufen');
            } else {
                console.log('❌ button.click() Methode nicht verfügbar');
            }

        } catch (e) {
            console.log('❌ Event Creation Fehler:', e.message);
        }

        console.groupEnd();
    }

    // Zusammenfassung generieren
    function generateTestSummary() {
        console.group('📊 === TEST ZUSAMMENFASSUNG ===');

        const button = document.getElementById('design-preview-btn');

        console.log('🎯 HAUPT-ERGEBNISSE:');
        console.log('   - Button existiert:', button ? '✅ JA' : '❌ NEIN');

        if (button) {
            const styles = window.getComputedStyle(button);
            const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0.1;
            const isClickable = !button.disabled && styles.pointerEvents !== 'none';
            const hasHandlers = !!button.onclick || (typeof jQuery !== 'undefined' && jQuery._data && jQuery._data(button, 'events')) || typeof window.handlePreviewClick === 'function';

            console.log('   - Button sichtbar:', isVisible ? '✅ JA' : '❌ NEIN');
            console.log('   - Button klickbar:', isClickable ? '✅ JA' : '❌ NEIN');
            console.log('   - Event Handlers:', hasHandlers ? '✅ JA' : '❌ NEIN');

            const functionalityScore = [isVisible, isClickable, hasHandlers].filter(Boolean).length;
            console.log('   - Funktionalitäts-Score:', functionalityScore + '/3');

            if (functionalityScore === 3) {
                console.log('✅ DIAGNOSE: Button sollte funktionsfähig sein');
            } else if (functionalityScore >= 2) {
                console.log('⚠️ DIAGNOSE: Button hat kleinere Probleme');
            } else {
                console.log('❌ DIAGNOSE: Button hat schwerwiegende Probleme');
            }
        } else {
            console.log('❌ DIAGNOSE: Button existiert nicht - Plugin Integration Problem');
        }

        console.log('🔧 NÄCHSTE SCHRITTE:');
        if (!button) {
            console.log('   1. Plugin Aktivierung prüfen');
            console.log('   2. WordPress Hook Integration überprüfen');
            console.log('   3. Template/Theme Kompatibilität testen');
        } else if (button.disabled) {
            console.log('   1. Button Enable Logik überprüfen');
            console.log('   2. Design Data Verfügbarkeit prüfen');
        } else {
            console.log('   1. Event Handler Binding überprüfen');
            console.log('   2. JavaScript Errors in Console suchen');
            console.log('   3. CSS Konflikte beheben');
        }

        console.log('⏰ Test completed:', new Date().toLocaleString('de-DE'));
        console.groupEnd();
    }

    // Button erstellen und hinzufügen
    const testButton = createTestButton();

    if (testButton) {
        console.log('✅ DIAGNOSTIC TEST BUTTON erfolgreich hinzugefügt!');
        console.log('🔧 Klicken Sie auf "Test Functions" um alle Tests auszuführen');
        console.log('📊 Ergebnisse werden in der Console protokolliert');

        // Mache Test-Button sichtbar mit kurzer Animation
        testButton.style.animation = 'testButtonPulse 1s ease-in-out 3';

        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
            @keyframes testButtonPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(0,115,170,0.5); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(pulseStyle);

    } else {
        console.log('❌ Fehler beim Hinzufügen des Test-Buttons');
    }

})();