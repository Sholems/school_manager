-- ==============================================================================
-- SEED DEFAULT SETTINGS (Single School - No Multi-Tenancy)
-- Run this after schema.sql to create the initial school settings
-- ==============================================================================

INSERT INTO settings (
    school_name,
    school_address,
    school_email,
    school_phone,
    school_tagline,
    current_session,
    current_term,
    subjects_global,
    terms,
    show_position,
    show_skills,
    promotion_threshold,
    show_bank_details,
    invoice_due_days
) VALUES (
    'Fruitful Vine Heritage Schools',
    '21, Agric Road, James Estate, Ajara-Topa, Badagry, Lagos State',
    'info@fruitfulvineheritageschools.org.ng',
    '0803 483 2855, 0806 475 0268',
    '...reaching the highest height',
    '2025/2026',
    'First Term',
    ARRAY[
        'Mathematics',
        'Phonics/Spellings',
        'Comprehension',
        'Creative Writing',
        'Poetry',
        'Grammar',
        'Library and Information Science',
        'Creative Science',
        'Christian Religious Studies',
        'Information Communication Technology',
        'Home Economics',
        'Social Studies',
        'Creative Art',
        'Verbal Reasoning',
        'Non-Verbal Reasoning',
        'Quantitative Reasoning'
    ],
    ARRAY['First Term', 'Second Term', 'Third Term'],
    TRUE,
    TRUE,
    50,
    FALSE,
    14
);

-- Verify
SELECT id, school_name, current_session, current_term FROM settings;
