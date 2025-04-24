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
        
        // Import-Modul laden
        self::load_import_module();
        
        // Transform-Modul laden
        self::load_transform_module();
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
     * Import-Modul laden
     */
    private static function load_import_module() {
        // Importer-Klasse
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/import/Importer.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/import/Importer.php';
        }
    }
    
    /**
     * Transform-Modul laden
     */
    private static function load_transform_module() {
        // Transform-Klasse
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/transform/Transform.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/transform/Transform.php';
        }
    }
    
    /**
     * AJAX-Handler registrieren
     */
    private static function register_ajax_handlers() {
        // Vectorizer AJAX-Handler
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/vectorizerajax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/vectorizerajax.php';
        } elseif (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/VectorizerAjax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/VectorizerAjax.php';
        }
        
        // SVG-Handler AJAX-Funktionen
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/document/svghandlerajax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/document/svghandlerajax.php';
        } elseif (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/document/SVGHandlerAjax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/document/SVGHandlerAjax.php';
        }
        
        // Export AJAX-Handler
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/export/exporterajax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/export/exporterajax.php';
        } elseif (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/export/ExporterAjax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/export/ExporterAjax.php';
        }
    
        
        // Import AJAX-Handler
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/import/ImporterAjax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/import/ImporterAjax.php';
        }
        
        // Transform AJAX-Handler
        if (file_exists(YPRINT_DESIGNTOOL_PATH . 'core/transform/TransformAjax.php')) {
            require_once YPRINT_DESIGNTOOL_PATH . 'core/transform/TransformAjax.php';
        }
    }
}