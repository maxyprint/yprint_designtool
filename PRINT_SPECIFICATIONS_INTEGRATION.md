# Print Specifications Integration

## Overview

The print specifications integration has been enhanced to provide better validation, user feedback, and seamless integration with the API preview and connection systems. This ensures that technical print specifications are properly configured and validated before being sent to the print provider.

## Key Improvements

### 1. Enhanced Validation
- **Required Field Validation**: All print specification fields are now validated for completeness
- **Value Range Validation**: Resolution (72-600 DPI), Bleed (0-10mm), and other fields are validated against acceptable ranges
- **Format Validation**: Units, reference points, and other fields are validated against allowed values
- **Real-time Feedback**: Validation errors are displayed immediately in the admin interface

### 2. Improved API Preview
- **Print Specifications Summary**: The API preview now includes a detailed summary of print specifications for each template/position
- **Validation Status**: Each specification shows whether it's valid or has errors
- **Visual Indicators**: ✅ for valid specifications, ⚠️ for invalid ones with error details

### 3. Enhanced Admin Interface
- **Better Organization**: Print specifications are clearly organized with descriptive headers
- **Validation Button**: New "Validate Specifications" button for immediate feedback
- **Improved Styling**: Better visual design with responsive layout
- **Error Highlighting**: Invalid fields are highlighted with red borders

## Configuration

### Admin Settings Location
Navigate to: **WordPress Admin → Print Designer → Print Provider API**

### Print Specifications Table
The print specifications table allows you to configure:

| Field | Description | Validation |
|-------|-------------|------------|
| **Template/Position** | Template ID and print position (front, back, left, right) | Required |
| **Unit** | Measurement unit (mm, cm, px) | Must be mm, cm, or px |
| **Reference Point** | Coordinate reference point (top-left, center, top-center) | Must be valid reference point |
| **Resolution (DPI)** | Print resolution in dots per inch | 72-600 DPI |
| **Color Profile** | Color space (sRGB, AdobeRGB, CMYK) | Must be valid color profile |
| **Bleed (mm)** | Bleed margin in millimeters | 0-10mm |
| **Scaling** | Image scaling method (proportional, stretch, fit) | Must be valid scaling option |
| **Print Quality** | Print quality level (standard, premium, eco) | Must be valid quality option |

### Adding New Specifications
1. Click the **"+ Add Print Specifications"** button
2. Fill in all required fields
3. Click **"🔍 Validate Specifications"** to check for errors
4. Save the settings

## API Integration

### Print Specifications in API Payload
Print specifications are automatically included in the API payload:

```json
{
  "printPositions": [
    {
      "position": "front",
      "width": 35.8,
      "height": 36.6,
      "unit": "mm",
      "offsetX": 45.2,
      "offsetY": 28.5,
      "offsetUnit": "mm",
      "referencePoint": "top-left",
      "resolution": 300,
      "colorProfile": "sRGB",
      "bleed": 2,
      "scaling": "proportional",
      "printQuality": "standard",
      "printFile": "https://..."
    }
  ]
}
```

### Validation in API Preview
The API preview now shows a print specifications summary:

```
📋 Print Specifications Summary
✅ tshirt_001 (front): 300 DPI, sRGB, standard
⚠️ hoodie_002 (back): 300 DPI, sRGB, standard - Invalid reference point
```

## Error Handling

### Validation Errors
- **Missing Fields**: Required fields that are empty
- **Invalid Values**: Values outside acceptable ranges
- **Invalid Formats**: Unsupported units, reference points, etc.

### Error Messages
- Clear, descriptive error messages
- Field-specific validation feedback
- Visual indicators in the admin interface

### Fallback Behavior
- If no specifications are configured, default values are used
- Warning messages are logged for missing configurations
- API continues to function with default specifications

## Testing

### Test File
Run `test_print_specifications.php` to verify:
1. Print specifications configuration
2. Validation of all fields
3. API integration functionality
4. Credentials and settings

### Manual Testing
1. Configure print specifications in admin
2. Validate specifications using the validation button
3. Preview API payload to see specifications summary
4. Send test order to verify integration

## Troubleshooting

### Common Issues

#### 1. "No print specifications found" Warning
**Cause**: No specifications configured for a template/position
**Solution**: Add specifications in admin settings

#### 2. Validation Errors
**Cause**: Invalid values in specification fields
**Solution**: Check field values against validation rules

#### 3. API Preview Not Showing Specifications
**Cause**: Specifications not properly configured or validated
**Solution**: Validate specifications and check for errors

### Debug Information
- Check WordPress error logs for validation messages
- Use the test file to verify configuration
- Review API preview for detailed specification information

## Best Practices

### 1. Template Configuration
- Configure specifications for all templates used in your store
- Use consistent naming for template IDs
- Test specifications with actual orders

### 2. Validation
- Always validate specifications before saving
- Review validation errors carefully
- Test with API preview before sending orders

### 3. Documentation
- Document template-specific requirements
- Keep specifications up to date with print provider changes
- Maintain a list of tested configurations

## Future Enhancements

### Planned Improvements
1. **Bulk Import/Export**: Import/export specifications from CSV
2. **Template Presets**: Pre-configured specifications for common templates
3. **Advanced Validation**: More sophisticated validation rules
4. **Performance Optimization**: Caching of specifications for faster API calls

### Integration Points
- WooCommerce order processing
- Print provider API communication
- Admin interface enhancements
- Error reporting and logging

## Support

For issues with print specifications integration:
1. Check the test file output
2. Review WordPress error logs
3. Validate specifications in admin
4. Test with API preview functionality 