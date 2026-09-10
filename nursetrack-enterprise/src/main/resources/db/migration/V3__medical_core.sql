create table if not exists nt_medical_notes (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    encounter_id uuid references nt_encounters(id),
    provider_user_id uuid not null references nt_users(id),
    provider_name varchar(180) not null,
    chief_complaint text,
    hpi text,
    assessment text,
    plan text,
    notes text,
    status varchar(20) not null,
    signed_at timestamptz,
    signature_hash varchar(64),
    created_at timestamptz not null,
    updated_at timestamptz not null
);
create index if not exists ix_nt_medical_patient_time on nt_medical_notes(company_id, patient_id, created_at desc);

create table if not exists nt_medical_diagnoses (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    medical_note_id uuid not null references nt_medical_notes(id) on delete cascade,
    code varchar(30) not null,
    description varchar(500),
    primary_diagnosis boolean not null default false,
    created_at timestamptz not null
);
create index if not exists ix_nt_medical_dx_note on nt_medical_diagnoses(medical_note_id, primary_diagnosis desc, created_at);
create index if not exists ix_nt_medical_dx_code on nt_medical_diagnoses(company_id, code);

create table if not exists nt_medical_procedures (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    medical_note_id uuid not null references nt_medical_notes(id) on delete cascade,
    code_system varchar(20) not null,
    code varchar(30) not null,
    label varchar(500),
    units double precision not null default 1,
    created_at timestamptz not null
);
create index if not exists ix_nt_medical_px_note on nt_medical_procedures(medical_note_id, created_at);
create index if not exists ix_nt_medical_px_code on nt_medical_procedures(company_id, code_system, code);
