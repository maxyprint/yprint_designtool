-- SCHRITT 1.5: Template-Bild-Meta für Template 3657 hinzufügen
-- Dieses SQL-Script fügt das Template-Bild-Meta-Feld für Template 3657 (Shirt SS25) hinzu

INSERT INTO deo6_postmeta (post_id, meta_key, meta_value) 
VALUES (3657, '_template_image_path', 'shirt_front_template.jpg')
ON DUPLICATE KEY UPDATE meta_value = 'shirt_front_template.jpg';

-- Verifikation: Prüfe ob das Meta-Feld erfolgreich hinzugefügt wurde
SELECT post_id, meta_key, meta_value 
FROM deo6_postmeta 
WHERE post_id = 3657 AND meta_key = '_template_image_path';
