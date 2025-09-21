#!/usr/bin/env node

/**
 * Direct Race Condition Test
 * Testet die Race Condition ohne Docker - direkt mit deinem Code
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 DIRECT RACE CONDITION TEST');
console.log('===============================');

// Simuliere WordPress DOM Environment
global.window = {
    fabric: {
        Canvas: function() {
            return {
                width: 800,
                height: 600,
                getObjects: () => [
                    {
                        type: 'i-text',
                        text: 'Test Text',
                        left: 100,
                        top: 50,
                        width: 120,
                        height: 30,
                        scaleX: 1,
                        scaleY: 1,
                        angle: 0,
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: '#333333'
                    }
                ]
            };
        }
    },
    addEventListener: () => {},
    dispatchEvent: () => {}
};

global.document = {
    addEventListener: (event, callback) => {
        console.log(`📅 Document event listener registered: ${event}`);
        if (event === 'DOMContentLoaded') {
            // Simuliere DOMContentLoaded mit verschiedenen Delays
            setTimeout(() => {
                console.log('🔥 DOMContentLoaded Event 1 (sofort)');
                callback();
            }, 0);
        }
    },
    querySelector: (selector) => {
        if (selector === '.mockup-design-area') {
            return {
                getBoundingClientRect: () => ({
                    left: 50,
                    top: 100,
                    width: 800,
                    height: 600
                }),
                offsetWidth: 800,
                offsetHeight: 600
            };
        }
        return null;
    },
    querySelectorAll: (selector) => {
        if (selector === 'canvas') {
            // Simuliere Race Condition: Canvas ist nicht sofort verfügbar
            const elapsed = Date.now() - startTime;

            if (elapsed < 1000) {
                console.log(`⏰ Canvas query at ${elapsed}ms: NO CANVASES YET`);
                return [];
            } else {
                console.log(`⏰ Canvas query at ${elapsed}ms: CANVAS NOW AVAILABLE`);
                return [
                    {
                        __fabric: new global.window.fabric.Canvas(),
                        getBoundingClientRect: () => ({
                            left: 60,
                            top: 110,
                            width: 780,
                            height: 580
                        }),
                        closest: () => ({
                            getBoundingClientRect: () => ({
                                left: 50,
                                top: 100
                            })
                        })
                    }
                ];
            }
        }
        return [];
    },
    readyState: 'complete'
};

global.console = console;

// Messe Start-Zeit für Race Condition Simulation
const startTime = Date.now();

async function testRaceCondition() {
    console.log('🏁 Testing Race Condition Scenario...');

    try {
        // Lade das Comprehensive Capture System
        const captureCode = fs.readFileSync('./public/js/comprehensive-design-data-capture.js', 'utf8');

        // Entferne Browser-spezifische Teile
        const modifiedCode = captureCode
            .replace(/document\.addEventListener\('DOMContentLoaded'.*?\}\);/gs, '')
            .replace(/if \(document\.readyState === 'loading'\).*?}\)/gs, '');

        console.log('📝 Comprehensive capture code loaded');

        // Test Szenario 1: Sofortige Ausführung (Race Condition)
        console.log('\n🔬 SZENARIO 1: Sofortige Canvas-Suche (Race Condition)');
        console.log('================================================================');

        eval(modifiedCode);
        const capture1 = new ComprehensiveDesignDataCapture();

        const result1 = capture1.generateDesignData();
        console.log('📊 Ergebnis sofortige Ausführung:', result1 ? 'SUCCESS' : 'FAILED');

        if (result1 && result1.error) {
            console.log('❌ Fehler:', result1.error);
        }

        // Warte und teste erneut
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('\n🔬 SZENARIO 2: Verzögerte Canvas-Suche (Nach Race Condition)');
        console.log('================================================================');

        // Erstelle neue Instanz für Test nach Delay
        eval(modifiedCode);
        const capture2 = new ComprehensiveDesignDataCapture();

        const result2 = capture2.generateDesignData();
        console.log('📊 Ergebnis verzögerte Ausführung:', result2 ? 'SUCCESS' : 'FAILED');

        if (result2 && result2.elements) {
            console.log(`✅ Elemente gefunden: ${result2.elements.length}`);
        }

        // Analyse der Race Condition
        console.log('\n🎯 RACE CONDITION ANALYSE:');
        console.log('=========================');

        const raceConditionDetected = (!result1 || result1.error) && (result2 && result2.elements && result2.elements.length > 0);

        if (raceConditionDetected) {
            console.log('🚨 RACE CONDITION ERKANNT!');
            console.log('   - Sofortige Ausführung: FAILED');
            console.log('   - Verzögerte Ausführung: SUCCESS');
            console.log('   - Problem: Canvas ist bei DOMContentLoaded noch nicht verfügbar');
        } else {
            console.log('✅ Keine Race Condition erkannt oder beide Tests fehlgeschlagen');
        }

        return raceConditionDetected;

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        return false;
    }
}

// Simuliere DesignerWidget Bundle Loading mit Delay
setTimeout(() => {
    console.log('📦 DesignerWidget Bundle "geladen" - Canvas wird erstellt');
}, 1000);

// Führe Test aus
testRaceCondition().then(raceConditionFound => {
    console.log('\n📋 TEST ZUSAMMENFASSUNG:');
    console.log('========================');

    if (raceConditionFound) {
        console.log('🎯 ERGEBNIS: Race Condition reproduziert!');
        console.log('🔧 LÖSUNG ERFORDERLICH: Timing-basierte Canvas-Detection');
        console.log('');
        console.log('💡 Empfohlene Fixes:');
        console.log('   1. Polling-basierte Canvas-Detection statt DOMContentLoaded');
        console.log('   2. MutationObserver für Canvas-Creation');
        console.log('   3. Event-Listener für DesignerWidget-Ready');
        console.log('   4. Retry-Mechanismus mit exponential backoff');
    } else {
        console.log('❓ Race Condition nicht reproduziert oder anderes Problem');
    }

    console.log('');
    console.log('✅ Direct Race Condition Test abgeschlossen');
}).catch(error => {
    console.error('❌ Test failed:', error);
});