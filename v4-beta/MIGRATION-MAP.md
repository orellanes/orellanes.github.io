# NurseTrack v4 Beta — mapa de preservación

## Regla principal

- No borrar datos de Supabase durante la migración.
- No crear tablas paralelas si ya existe una tabla canónica.
- No duplicar pacientes, visitas, plantillas, órdenes, documentos, cargos, reclamaciones ni membresías.
- v4 debe leer y escribir sobre las estructuras existentes, respetando `company_id`, RLS, permisos y RPCs canónicos.
- La versión actual permanece intacta hasta que v4 se pruebe y se apruebe.
- Los módulos de v4 se cargan desde un solo loader en `supabase-config.js`; no se crean rutas duplicadas.

## Núcleo

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Usuarios / perfil | `nursetrack_profiles` | Login e identidad conectados |
| Compañías | `nursetrack_companies`, `nursetrack_company_users` | Resolución de compañía conectada |
| Pacientes | `nursetrack_patients_v2` | Búsqueda y expediente conectados |
| Asignaciones | `nursetrack_patient_assignments` | Pendiente UI v4 |
| Visitas | `nursetrack_visits`, `nursetrack_visit_sync_keys` | Historial y nueva visita de Enfermería conectados |
| Vitales | `nursetrack_vitals` | Formulario conectado mediante RPC existente |
| Registros clínicos | `nursetrack_clinical_records` | Enfermería, Nutrición, Salud Mental, Sustancias y Toxicología conectados |
| PHQ-9 | `nursetrack_phq9` | Conectado: formulario, puntuación, pregunta 9, acción, notas, historial e impresión |
| Plantillas | `nursetrack_templates`, `nursetrack_template_versions` | Lectura de plantillas publicadas conectada; editor administrativo pendiente |
| Documentos | `nursetrack_documents`, `nursetrack_patient_documents` | Conectado: listado, borrador clínico, archivos y firma |
| Firmas | `nursetrack_signature_profiles`, `nursetrack_sign_document()` | Firma de documentos conectada; editor de perfil de firma pendiente |

## Disciplinas clínicas

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Enfermería | visitas + vitales + registros clínicos + plantillas | **Conectado:** Inicial, Seguimiento, Reevaluación, Readmisión, vitales, narrativa, guardar abierto y cerrar sin duplicar visita |
| Trabajo Social | `nursetrack_templates` + `nursetrack_documents` | **Conectado:** inicial, seguimiento, formulario desde `schema_json`, borrador único, firma e impresión |
| Medicina | encuentros + diagnósticos + procedimientos | **Conectado núcleo:** borrador, HPI, assessment, plan, diagnósticos, procedimientos y firma; enmiendas/favoritos pendientes |
| Recetas | `nursetrack_prescriptions`, `nursetrack_prescription_items`, RPC de receta | **Conectado:** receta firmada ligada al encuentro; impresión avanzada pendiente |
| Nutrición | `nursetrack_clinical_records` (`module_type=nutrition`) | **Conectado:** conserva campos clínicos de la versión anterior; registro activo se actualiza y al completar se inicia seguimiento nuevo |
| Salud Mental / Psiquiatría | `nursetrack_clinical_records` + catálogos MH + PHQ-9 | **Conectado núcleo:** evaluación mental y PHQ-9; catálogos/crosswalk avanzado pendiente |
| Uso de sustancias | `nursetrack_clinical_records` (`module_type=substance_use`) | **Conectado:** sustancia, frecuencia, vía, último uso, sobredosis, buprenorfina, educación y plan |
| Toxicología | `nursetrack_clinical_records` (`module_type=toxicology_monitoring`) | **Conectado:** orden/estado/fecha de resultado y seguimiento, sin interpretación automática |
| Vacunas / Tratamientos | `nursetrack_vaccine_treatment_records` | **Conectado:** vacuna/tratamiento, dosis, vía, sitio, lote, expiración, fabricante, estado, observación, reacción, educación y orden |
| Medicamentos / seguridad | `nursetrack_medication_reviews`, `nursetrack_medication_safety_rules` | Pendiente UI v4 |
| Laboratorios | catálogo + órdenes + resultados | **Conectado:** catálogo, órdenes, diagnósticos, prioridad, profesional, instrucciones y resultados; `client_order_key` evita duplicados |

## Operación

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Citas | `nursetrack_appointments` | **Conectado:** listado, nueva cita, proveedor, localidad, estado y preferencias SMS/email |
| Recordatorios | `nursetrack_reminder_outbox` | Preferencias conectadas; envío/outbox pendiente |
| Reportes | datos clínicos existentes | **Conectado núcleo:** rango de fechas, pacientes, visitas, citas, PHQ-9, laboratorios, vacunas/tratamientos, documentos y cargos |
| Notificaciones | `nursetrack_notifications` | Pendiente UI v4 |
| Tareas | `nursetrack_tasks`, `nursetrack_clinical_tasks` | Pendiente UI v4 |
| Estaciones | `nursetrack_station_assignments` | Pendiente UI v4 |
| Inventario | `nursetrack_inventory_items` | Pendiente UI v4 |
| Departamentos | `nursetrack_departments` | Pendiente UI v4 |
| Localidades | `nursetrack_locations` | Pendiente UI v4 |

## Facturación y clearinghouse

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Catálogo HCPCS/CPT autorizado | `nursetrack_billing_codes` | **Conectado:** búsqueda solo de códigos activos/validados; no se afirma CPT completo |
| Diagnósticos | `nursetrack_diagnosis_codes` | **Conectado:** búsqueda de ICD activo/validado |
| Cargos | `nursetrack_service_billing_codes`, `nursetrack_save_service_charge()` | **Conectado:** cargo clínico con clave estable y reutilización sin duplicado |
| Reclamaciones | claims + lines + events + transmissions | **Conectado núcleo:** borrador desde servicios, validar, marcar lista y enviar a cola |
| Clearinghouse | conexiones + respuestas + payer transactions | **Conectado lectura:** respuestas/estado/referencia; procesamiento externo sigue usando infraestructura existente |
| Elegibilidad | `nursetrack_eligibility_checks` | Pendiente UI v4 |
| Autorizaciones | `nursetrack_authorizations` | Pendiente UI v4 |
| Remesas 835 | `nursetrack_remittances`, `nursetrack_remittance_lines`, ingest 835 | Pendiente UI v4 |

## Membresía y pagos

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Planes | `nursetrack_membership_plans` | **Conectado lectura** |
| Membresías | `nursetrack_memberships` | **Conectado:** listado y alta mediante RPC existente |
| Pagos | `nursetrack_membership_payments` | **Conectado:** registrar pago mediante RPC existente |
| Renovaciones | `nursetrack_membership_renewals` | **Conectado:** renovación mediante RPC existente |
| Suscripción por compañía | `nursetrack_company_subscriptions` y relacionadas | Preservada; UI v4 pendiente |
| Suscripción por usuario | `nursetrack_user_subscriptions` y relacionadas | Preservada; UI v4 pendiente |
| PayPal / proveedor | Edge Functions y settings existentes | Preservado; checkout v4 pendiente |

## Administración, seguridad y respaldo

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Súper Administrador | Edge Function `admin-users` | **Conectado:** listar/crear usuarios, activar/desactivar, ficha, contraseña temporal y permisos |
| Roles | `nursetrack_roles` | Preservados; edición avanzada pendiente |
| Permisos | catálogo + user permissions + historial | **Conectado desde Súper Administrador** |
| Auditoría | `nursetrack_audit_events` | Preservada; visor v4 pendiente |
| Backups | `nursetrack_backups`, `nursetrack_recovery_snapshots` | Preservados; visor/restauración UI pendiente |
| Recuperación | códigos + Edge Functions existentes | Preservada |
| Estado del sistema | health + releases + state | Preservado; panel v4 pendiente |
| Cloud modules | `nursetrack_cloud_modules`, `nursetrack_modules` | Preservados |
| Archivos personales | personal docs/files/excel | Preservados; UI v4 pendiente |

## Archivos v4 cargados por un único loader

- `v4-beta/index.html`
- `v4-beta/social-documents.js`
- `v4-beta/patient-tools.js`
- `v4-beta/labs.js`
- `v4-beta/medicine.js`
- `v4-beta/nutrition-behavioral.js`
- `v4-beta/vaccines-treatments-v4.js`
- `v4-beta/reports-membership.js`
- `v4-beta/billing-admin.js`
- `v4-beta/navigation.js`

## Conteos de referencia previos a la migración

- Pacientes v2: 1
- Plantillas: 13
- Cloud modules: 13
- Citas: 8
- Órdenes de laboratorio: 4
- Documentos de paciente: 1
- Backups: 13
- Eventos de auditoría: 95,253

Los conteos en cero de algunas tablas no significan que el módulo se haya eliminado; la estructura se conserva para v4.
