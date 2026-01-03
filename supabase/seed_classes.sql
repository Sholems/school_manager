-- ==============================================================================
-- SEED CLASSES (Year 1 - Year 6)
-- Simplified for Single School (No school_id)
-- ==============================================================================

-- Define the Primary Curriculum
DO $$
DECLARE
    v_subjects TEXT[];
BEGIN
    v_subjects := ARRAY[
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
    ];

    -- Insert Classes (if not exists)
    INSERT INTO classes (name, subjects) 
    SELECT 'Playschool', ARRAY['Language','Numeracy','Sensorial','Practical Life','Cultural Studies','Art','Story Telling','C.R.S'] 
    WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Playschool');

    INSERT INTO classes (name, subjects) 
    SELECT 'Reception', ARRAY['Language','Numeracy','Sensorial','Practical Life','Cultural Studies','Art','Story Telling','C.R.S'] 
    WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Reception');

    INSERT INTO classes (name, subjects) 
    SELECT 'Kindergarten', ARRAY['Language','Numeracy','Sensorial','Practical Life','Cultural Studies','Art','Story Telling','C.R.S'] 
    WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Kindergarten');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 1', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 1');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 2', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 2');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 3', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 3');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 4', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 4');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 5', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 5');

    INSERT INTO classes (name, subjects) 
    SELECT 'Year 6', v_subjects WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Year 6');

    RAISE NOTICE 'Classes seeded successfully!';
END $$;

-- Verify
SELECT id, name, array_length(subjects, 1) as subject_count FROM classes ORDER BY name;
