CREATE TABLE IF NOT EXISTS nt_vital_sets (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES nt_companies(id),
    patient_id UUID NOT NULL REFERENCES nt_patients(id),
    encounter_id UUID NULL REFERENCES nt_encounters(id),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    systolic INTEGER NULL,
    diastolic INTEGER NULL,
    heart_rate INTEGER NULL,
    respiratory_rate INTEGER NULL,
    temperature_c DOUBLE PRECISION NULL,
    spo2 INTEGER NULL,
    weight_kg DOUBLE PRECISION NULL,
    height_cm DOUBLE PRECISION NULL,
    bmi DOUBLE PRECISION NULL,
    pain_score INTEGER NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'MANUAL',
    notes TEXT NULL,
    created_by_user_id UUID NOT NULL REFERENCES nt_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nt_vitals_patient_date ON nt_vital_sets(company_id, patient_id, measured_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_nt_vitals_encounter ON nt_vital_sets(company_id, patient_id, encounter_id) WHERE encounter_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS nt_phq9_assessments (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES nt_companies(id),
    patient_id UUID NOT NULL REFERENCES nt_patients(id),
    encounter_id UUID NULL REFERENCES nt_encounters(id),
    screening_date DATE NOT NULL,
    q1 INTEGER NOT NULL,
    q2 INTEGER NOT NULL,
    q3 INTEGER NOT NULL,
    q4 INTEGER NOT NULL,
    q5 INTEGER NOT NULL,
    q6 INTEGER NOT NULL,
    q7 INTEGER NOT NULL,
    q8 INTEGER NOT NULL,
    q9 INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    severity VARCHAR(40) NOT NULL,
    suicidal_ideation BOOLEAN NOT NULL DEFAULT FALSE,
    follow_up_required BOOLEAN NOT NULL DEFAULT FALSE,
    action_taken TEXT NULL,
    notes TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by_user_id UUID NOT NULL REFERENCES nt_users(id),
    signed_by_user_id UUID NULL REFERENCES nt_users(id),
    signed_at TIMESTAMPTZ NULL,
    signature_hash VARCHAR(64) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_nt_phq9_answers CHECK (
      q1 BETWEEN 0 AND 3 AND q2 BETWEEN 0 AND 3 AND q3 BETWEEN 0 AND 3 AND
      q4 BETWEEN 0 AND 3 AND q5 BETWEEN 0 AND 3 AND q6 BETWEEN 0 AND 3 AND
      q7 BETWEEN 0 AND 3 AND q8 BETWEEN 0 AND 3 AND q9 BETWEEN 0 AND 3
    )
);
CREATE INDEX IF NOT EXISTS idx_nt_phq9_patient_date ON nt_phq9_assessments(company_id, patient_id, screening_date DESC, created_at DESC);
