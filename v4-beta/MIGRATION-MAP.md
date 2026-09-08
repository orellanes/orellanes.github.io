# NurseTrack v4 Beta — mapa de preservación

## Regla principal

- No borrar datos de Supabase durante la migración.
- No crear tablas paralelas si ya existe una tabla canónica.
- No duplicar pacientes, visitas, plantillas, órdenes, documentos, cargos ni membresías.
- v4 debe leer y escribir sobre las estructuras existentes, respetando `company_id`, RLS y permisos.
- La versión actual permanece intacta hasta que v4 se pruebe y se apruebe.

## Núcleo

| Área | Tabla / estructura existente | Estado v4 |
|---|---|---|
| Usuarios / perfil | `nursetrack_profiles` | Login conectado; identidad conectada |
| Compañías | `nursetrack_companies`, `nursetrack_company_users` | Resolución de compañía conectada |
| Pacientes | `nursetrack_patients_v2` | Búsqueda y expediente conectados |
| Asignaciones | `nursetrack_patient_assignments` | Pendiente UI v4 |
| Visitas | `nursetrack_visits`, `nursetrack_visit_sync_keys` | Historial y nueva visita de Enfermería conectados |
| Vitales | `nursetrack_vitals` | Formulario v4 conectado mediante RPC existente |
| Registros clínicos | `nursetrack_clinical_records` | Guardado de Enfermería conectado mediante RPC existente |
| PHQ-9 | `nursetrack_phq9` | Pendiente formulario v4 |
| Plantillas | `nursetrack_templates`, `nursetrack_template_versions` | Preservadas; editor pendiente |
| Documentos | `nursetrack_documents`, `nursetrack_patient_documents` | Preservados; UI pendiente |
| Firmas | `nursetrack_signature_profiles` | Pendiente UI v4 |

## Disciplinas clínicas

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Enfermería | visitas + vitales + registros clínicos + plantillas | **Conectado:** Evaluación inicial, Seguimiento, Reevaluación, Readmisión, vitales, narrativa, guardar abierto y guardar/cerrar |
| Trabajo Social | plantillas + cloud modules + documentos | Pendiente UI v4 |
| Medicina | `nursetrack_medical_encounters`, `nursetrack_medical_diagnoses`, `nursetrack_medical_procedures`, `nursetrack_medical_amendments`, `nursetrack_medical_favorites` | Pendiente UI v4 |
| Recetas | `nursetrack_prescriptions`, `nursetrack_prescription_items` | Pendiente UI v4 |
| Nutrición | plantillas / módulos existentes | Pendiente UI v4 |
| Salud Mental / Psiquiatría | `nursetrack_mental_health_catalog`, `nursetrack_mental_health_billing_crosswalk`, `nursetrack_mental_health_sources`, PHQ-9 | Pendiente UI v4 |
| Uso de sustancias / Toxicología | módulos / plantillas existentes | Pendiente UI v4 |
| Vacunas / Tratamientos | `nursetrack_vaccine_treatment_records` | Pendiente UI v4 |
| Medicamentos / seguridad | `nursetrack_medication_reviews`, `nursetrack_medication_safety_rules` | Pendiente UI v4 |
| Laboratorios | `nursetrack_lab_catalog`, `nursetrack_lab_orders`, `nursetrack_labs` | Pendiente UI v4 |

## Operación

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Citas | `nursetrack_appointments` | Pendiente UI v4 |
| Recordatorios | `nursetrack_reminder_outbox` | Pendiente UI v4 |
| Notificaciones | `nursetrack_notifications` | Pendiente UI v4 |
| Tareas | `nursetrack_tasks`, `nursetrack_clinical_tasks` | Pendiente UI v4 |
| Estaciones | `nursetrack_station_assignments` | Pendiente UI v4 |
| Inventario | `nursetrack_inventory_items` | Pendiente UI v4 |
| Departamentos | `nursetrack_departments` | Pendiente UI v4 |
| Localidades | `nursetrack_locations` | Pendiente UI v4 |
| Reportes | datos existentes + auditoría | Pendiente UI v4 |

## Facturación y clearinghouse

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Catálogo HCPCS/CPT autorizado | `nursetrack_billing_codes`, historial e import batches | Preservado |
| Diagnósticos | `nursetrack_diagnosis_codes` | Preservado |
| Cargos | `nursetrack_service_billing_codes` | Preservado |
| Reclamaciones | `nursetrack_claims`, `nursetrack_claim_lines`, `nursetrack_claim_events`, `nursetrack_claim_transmissions` | Pendiente UI v4 |
| Clearinghouse | `nursetrack_clearinghouses`, `nursetrack_company_clearinghouse_connections`, `nursetrack_clearinghouse_responses`, `nursetrack_clearinghouse_payer_transactions` | Pendiente UI v4 |
| Elegibilidad | `nursetrack_eligibility_checks` | Pendiente UI v4 |
| Autorizaciones | `nursetrack_authorizations` | Pendiente UI v4 |
| Remesas | `nursetrack_remittances`, `nursetrack_remittance_lines` | Pendiente UI v4 |

## Membresía y pagos

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Planes | `nursetrack_membership_plans` | Preservado |
| Membresías | `nursetrack_memberships`, `nursetrack_account_memberships` | Preservadas |
| Pagos | `nursetrack_membership_payments`, payment intents, renewals, status history, provider events | Preservados |
| Suscripción por compañía | `nursetrack_company_subscriptions` y tablas relacionadas | Preservada |
| Suscripción por usuario | `nursetrack_user_subscriptions` y tablas relacionadas | Preservada |
| Proveedores de pago | `nursetrack_payment_provider_settings` | Preservado |

## Administración, seguridad y respaldo

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Roles | `nursetrack_roles` | Preservados |
| Permisos | `nursetrack_permissions`, `nursetrack_user_permissions`, historial | Preservados |
| Auditoría | `nursetrack_audit_events` | Preservada |
| Backups | `nursetrack_backups`, `nursetrack_recovery_snapshots` | Preservados |
| Recuperación | `nursetrack_recovery_codes` | Preservada |
| Estado del sistema | `nursetrack_system_health`, `nursetrack_releases`, `nursetrack_state` | Preservado |
| Cloud modules | `nursetrack_cloud_modules`, `nursetrack_modules` | Preservados |
| Archivos personales | `nursetrack_personal_documents`, `nursetrack_personal_document_files`, `nursetrack_excel_documents` | Preservados |

## Conteos de referencia antes de seguir migrando

- Pacientes v2: 1
- Plantillas: 13
- Cloud modules: 13
- Citas: 8
- Órdenes de laboratorio: 4
- Documentos de paciente: 1
- Backups: 13
- Eventos de auditoría: 95,253

Los conteos en cero de algunas tablas clínicas/financieras no significan que el módulo se haya eliminado; la estructura existe y debe conservarse para v4.
