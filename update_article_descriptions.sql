-- R-04 — replace topic-label descriptions with thesis statements (15-30 words each).
-- Matched by title, so each statement is a safe no-op if that article isn't published yet.

UPDATE articles
SET description = 'Words carry the weight of life and death, and the pause before speaking is not hesitation but the discipline in which wisdom and grace are formed.'
WHERE title = 'Before You Speak';

UPDATE articles
SET description = 'Most people invert this ratio and call the resulting scramble talent; execution fails precisely where preparation was rationed, not where effort ran short.'
WHERE title = '80% Preparation, 20% Execution';

UPDATE articles
SET description = 'Pentecost is not an event the Church commemorates but one it still inhabits: the same Spirit commissioning ordinary people into work they did not choose.'
WHERE title = 'Pentecost: A Modern Reality';
