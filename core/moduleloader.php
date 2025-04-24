<?php
/**
 * Module Loader für YPrint DesignTool
 * 
 * Lädt alle benötigten Module und Komponenten des Plugins
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_ModuleLoader {
    /**
     * Alle Module laden
     */
    public static function load_modules() {
        // Core-Module laden
        self::load_core_modules();
        
        // UI-Module laden
        self::load_ui_modules();
        
        // AJAX-Handler registrieren
        self::register_ajax_handlers();
    }
    
    /**
     * Core-Module laden
     */
    private static function load_core_modules() {
        // Vectorizer-Module
        require_once YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/vectorizer.php';
        
        // Document-Module (SVG-Handler)
        require_once YPRINT_DESIGNTOOL_PATH . 'core/document/svghandler.php';
        
        // Export-Module
        require_once YPRINT_DESIGNTOOL_PATH . 'core/export/exporter.php';
        
        // Shapes-Module - wird später implementiert
        // require_once YPRINT_DESIGNTOOL_PATH . 'core/shapes/ShapeFactory.php';
        
        // Transforms-Module - wird später implementiert
        // require_once YPRINT_DESIGNTOOL_PATH . 'core/transforms/TransformHandler.php';
    }
    
    /**
     * UI-Module laden
     */
    private static function load_ui_modules() {
        // Admin-UI wird später implementiert
        // require_once YPRINT_DESIGNTOOL_PATH . 'ui/Admin.php';
        
        // Canvas wird später implementiert
        // require_once YPRINT_DESIGNTOOL_PATH . 'ui/canvas/Canvas.php';
        
        // Tools werden später implementiert
        // require_once YPRINT_DESIGNTOOL_PATH . 'ui/tools/ToolManager.php';
    }
    
    /**
     * AJAX-Handler registrieren
     */
    private static function register_ajax_handlers() {
        // Vectorizer AJAX-Handler
        require_once YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/vectorizerajax.php';
        
        // SVG-Handler AJAX-Funktionen
        require_once YPRINT_DESIGNTOOL_PATH . 'core/document/svghandlerajax.php';
        
        // Export AJAX-Handler
        require_once YPRINT_DESIGNTOOL_PATH . 'core/export/exporterajax.php';
    }
}