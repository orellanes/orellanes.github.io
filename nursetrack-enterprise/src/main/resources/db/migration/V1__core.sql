create table if not exists nt_companies (
    id uuid primary key,
    name varchar(180) not null,
    legal_name varchar(180),
    address_line1 varchar(220),
    address_line2 varchar(220),
    city varchar(100),
    state varchar(40),
    postal_code varchar(20),
    phone varchar(40),
    logo_url varchar(250),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table if not exists nt_users (
    id uuid primary key,
    company_id uuid references nt_companies(id),
    email varchar(180) not null,
    password_hash varchar(255) not null,
    display_name varchar(180) not null,
    role varchar(40) not null,
    enabled boolean not null default true,
    must_change_password boolean not null default false,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_nt_users_email unique(email)
);
create index if not exists ix_nt_users_company on nt_users(company_id);

create table if not exists nt_patients (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    mrn varchar(80) not null,
    first_name varchar(120) not null,
    middle_name varchar(120),
    last_name varchar(120) not null,
    date_of_birth date,
    birth_place varchar(120),
    sex varchar(30),
    marital_status varchar(40),
    children_count integer,
    phone varchar(40),
    email varchar(160),
    residential_address varchar(300),
    postal_address varchar(300),
    preferred_language varchar(20),
    status varchar(24) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    constraint uq_nt_patients_company_mrn unique(company_id, mrn)
);
create index if not exists ix_nt_patients_company_last_name on nt_patients(company_id, last_name);

create table if not exists nt_encounters (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    encounter_type varchar(40) not null,
    status varchar(24) not null,
    started_at timestamptz not null,
    closed_at timestamptz,
    created_by_user_id uuid not null references nt_users(id),
    created_at timestamptz not null,
    updated_at timestamptz not null
);
create index if not exists ix_nt_encounters_patient_time on nt_encounters(company_id, patient_id, started_at desc);

create table if not exists nt_nursing_notes (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    encounter_id uuid references nt_encounters(id),
    visit_type varchar(40) not null,
    blood_pressure varchar(20),
    pulse integer,
    respirations integer,
    temperature_f double precision,
    spo2 integer,
    weight_lb double precision,
    height_in double precision,
    bmi double precision,
    findings_json text,
    narrative text not null,
    education_json text,
    interventions_json text,
    plan text,
    discharge_note text,
    status varchar(20) not null,
    created_by_user_id uuid not null references nt_users(id),
    signed_by_user_id uuid references nt_users(id),
    signed_at timestamptz,
    signature_hash varchar(64),
    created_at timestamptz not null,
    updated_at timestamptz not null
);
create index if not exists ix_nt_nursing_patient_time on nt_nursing_notes(company_id, patient_id, created_at desc);

create table if not exists nt_social_work_assessments (
    id uuid primary key,
    company_id uuid not null references nt_companies(id),
    patient_id uuid not null references nt_patients(id),
    encounter_id uuid references nt_encounters(id),
    template_key varchar(80) not null,
    page1_json text not null,
    page2_json text not null,
    page3_json text not null,
    page4_json text not null,
    narrative text,
    status varchar(20) not null,
    created_by_user_id uuid not null references nt_users(id),
    signed_by_user_id uuid references nt_users(id),
    signed_at timestamptz,
    signature_hash varchar(64),
    created_at timestamptz not null,
    updated_at timestamptz not null
);
create index if not exists ix_nt_social_patient_time on nt_social_work_assessments(company_id, patient_id, created_at desc);

create table if not exists nt_template_definitions (
    id uuid primary key,
    company_id uuid references nt_companies(id),
    template_key varchar(100) not null,
    discipline varchar(40) not null,
    language varchar(12) not null,
    version integer not null,
    title varchar(180) not null,
    schema_json text not null,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);
create index if not exists ix_nt_templates_lookup on nt_template_definitions(template_key, language, active, company_id, version desc);

create table if not exists nt_audit_events (
    id uuid primary key,
    company_id uuid references nt_companies(id),
    patient_id uuid references nt_patients(id),
    actor_user_id uuid not null references nt_users(id),
    action varchar(80) not null,
    resource_type varchar(80) not null,
    resource_id uuid,
    details_json text,
    occurred_at timestamptz not null
);
create index if not exists ix_nt_audit_company_time on nt_audit_events(company_id, occurred_at desc);
create index if not exists ix_nt_audit_patient_time on nt_audit_events(company_id, patient_id, occurred_at desc);
