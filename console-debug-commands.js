// 🔍 QUICK DEBUG COMMANDS - Kopiere in Browser Console

// 1. Script Loading Check
console.log('🔍 SCRIPT CHECK:');
['high-dpi-png-export-engine.js', 'png-only-system-integration.js', 'save-only-png-generator.js'].forEach(name => {
  const found = Array.from(document.querySelectorAll('script[src]')).find(s => s.src.includes(name));
  console.log(`${found ? '✅' : '❌'} ${name}: ${found ? 'LOADED' : 'MISSING'}`);
});

// 2. Engine Availability
console.log('🔍 ENGINE CHECK:');
console.log('HighDPIPrintExportEngine:', typeof window.HighDPIPrintExportEngine);
console.log('SaveOnlyPNGGenerator:', typeof window.SaveOnlyPNGGenerator);
console.log('PNGOnlySystemIntegration:', typeof window.PNGOnlySystemIntegration);

// 3. Template ID Detection
console.log('🔍 TEMPLATE CHECK:');
const urlParams = new URLSearchParams(window.location.search);
console.log('Template ID from URL:', urlParams.get('template_id'));
console.log('Template element:', document.querySelector('[data-template-id]')?.dataset.templateId);

// 4. WordPress Config
console.log('🔍 WORDPRESS CONFIG:');
console.log('octo_print_designer_config:', !!window.octo_print_designer_config);
console.log('AJAX URL:', window.octo_print_designer_config?.ajax_url || 'MISSING');
console.log('Nonce:', window.octo_print_designer_config?.nonce ? 'PRESENT' : 'MISSING');

// 5. Canvas Status
console.log('🔍 CANVAS CHECK:');
console.log('fabric.js:', !!window.fabric);
console.log('designerWidgetInstance:', !!window.designerWidgetInstance);
if (window.designerWidgetInstance?.fabricCanvas) {
  const objects = window.designerWidgetInstance.fabricCanvas.getObjects();
  console.log('Canvas objects:', objects.length);
  objects.forEach((obj, i) => console.log(`  ${i}: ${obj.type} (${obj.isBackground ? 'bg' : 'design'})`));
}

// 6. Manual PNG Test
console.log('🔍 PNG TEST:');
if (window.generateDesignData) {
  try {
    const data = window.generateDesignData();
    console.log('✅ generateDesignData works:', !!data.canvas);
  } catch(e) {
    console.log('❌ generateDesignData error:', e.message);
  }
} else {
  console.log('❌ generateDesignData missing');
}

console.log('🔍 DEBUG COMPLETE - Send these logs to analyze the problem!');