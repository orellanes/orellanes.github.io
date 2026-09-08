# NurseTrack v4 Beta — mapa de preservación

## Regla principal

- No borrar datos de Supabase durante la migración.
- No crear tablas paralelas si ya existe una tabla canónica.
- No duplicar pacientes, visitas, plantillas, órdenes, documentos, cargos, reclamaciones, tareas ni membresías.
- v4 lee y escribe sobre las estructuras existentes, respetando `company_id`, RLS, permisos y RPCs canónicos.
- La versión actual permanece intacta hasta que v4 se pruebe y se apruebe.
- Todos los módulos de v4 se cargan desde un único loader en `supabase-config.js`.

## Núcleo

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Usuarios / perfil | `nursetrack_profiles` | **Conectado:** login e identidad |
| Compañías | `nursetrack_companies`, `nursetrack_company_users` | **Conectado:** compañía activa |
| Pacientes | `nursetrack_patients_v2` | **Conectado:** búsqueda y expediente |
| Asignaciones de pacientes | `nursetrack_patient_assignments` + RPC puente v4 | **Conectado:** listar/asignar/desasignar validando compañía, paciente, usuario y permisos; la UI no escribe directo en la tabla heredada |
| Visitas | `nursetrack_visits`, `nursetrack_visit_sync_keys` | **Conectado:** historial y nueva visita de Enfermería con clave idempotente |
| Vitales | `nursetrack_vitals` | **Conectado** mediante RPC existente |
| Registros clínicos | `nursetrack_clinical_records` | **Conectado** para Enfermería, Nutrición, Salud Mental, Sustancias y Toxicología |
| PHQ-9 | `nursetrack_phq9` | **Conectado:** formulario, puntuación, pregunta 9, acción, notas, historial e impresión |
| Plantillas | `nursetrack_templates`, `nursetrack_template_versions` | **Conectado:** biblioteca, edición, borrador y publicación versionada |
| Documentos | `nursetrack_documents`, `nursetrack_patient_documents` | **Conectado:** listado, borrador clínico, archivos y firma |
| Firma profesional | `nursetrack_signature_profiles`, `nursetrack_sign_document()` | **Conectado:** perfil propio + firma de documentos |

## Disciplinas clínicas

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Enfermería | visitas + vitales + registros clínicos + plantillas | **Conectado:** Inicial, Seguimiento, Reevaluación, Readmisión, vitales, narrativa, guardar y cerrar sin duplicar visita |
| Trabajo Social | templates + documents | **Conectado:** inicial, seguimiento, formulario desde `schema_json`, borrador único, firma e impresión |
| Medicina | encounters + diagnoses + procedures | **Conectado núcleo:** borrador, HPI, assessment, plan, diagnósticos, procedimientos y firma; enmiendas/favoritos avanzados pendientes |
| Recetas | prescriptions + items + RPC de receta | **Conectado:** receta firmada ligada al encuentro; formato avanzado de impresión pendiente |
| Nutrición | clinical records `module_type=nutrition` | **Conectado:** evaluación completa, antropometría, dieta, PES, plan, educación, seguimiento y alta |
| Salud Mental / Psiquiatría | clinical records + PHQ-9 + catálogos MH | **Conectado núcleo:** evaluación mental y PHQ-9; crosswalk/catálogos avanzados pendientes |
| Uso de sustancias | clinical records `module_type=substance_use` | **Conectado:** sustancia, frecuencia, vía, último uso, sobredosis, buprenorfina, educación y plan |
| Toxicología | clinical records `module_type=toxicology_monitoring` | **Conectado:** orden/estado/fecha y seguimiento, sin interpretación automática |
| Vacunas / Tratamientos | `nursetrack_vaccine_treatment_records` | **Conectado:** vacuna/tratamiento, dosis, vía, sitio, lote, expiración, fabricante, estado, observación, reacción, educación y orden |
| Medicamentos / seguridad | medication reviews + safety rules | **Conectado:** revisión profesional y reglas validadas cuando existan; actualmente no inventa alertas si el catálogo validado está vacío |
| Laboratorios | lab catalog + orders + results | **Conectado:** catálogo, órdenes, diagnósticos, prioridad, profesional, instrucciones y resultados; `client_order_key` evita duplicados |

## Operación

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Citas | `nursetrack_appointments` | **Conectado:** listado, nueva cita, proveedor, localidad, estado y preferencias SMS/email |
| Recordatorios | `nursetrack_reminder_outbox` + Edge Function `send-sms` | **Conectado:** cola por paciente/cita con protección contra duplicados; SMS inmediato usa proveedor real; email queda en cola y no se marca enviado sin proveedor configurado |
| Reportes | datos clínicos existentes | **Conectado núcleo:** rango, pacientes, visitas, citas, PHQ-9, labs, tratamientos, documentos y cargos |
| Tareas | `nursetrack_tasks` | **Conectado:** alta, actualización de tarea abierta equivalente y completar |
| Estaciones | `nursetrack_station_assignments` | **Conectado:** Estaciones 1–3 con upsert por compañía/fecha/estación |
| Inventario | `nursetrack_inventory_items` | **Conectado:** lista, alta y edición con RLS administrativa |
| Notificaciones | `nursetrack_notifications` | **Conectado:** listado por compañía/usuario, marcar leída y resolver |
| Departamentos / localidades | `nursetrack_departments`, `nursetrack_locations` | **Conectado:** lectura por compañía; alta/edición solo Súper Administrador y validación de código duplicado |

## Facturación y clearinghouse

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Catálogo HCPCS/CPT autorizado | `nursetrack_billing_codes` | **Conectado:** búsqueda solo de códigos activos/validados; no se afirma CPT completo |
| Diagnósticos | `nursetrack_diagnosis_codes` | **Conectado:** búsqueda ICD activa/validada |
| Cargos | `nursetrack_service_billing_codes`, `nursetrack_save_service_charge()` | **Conectado:** clave estable y reutilización sin duplicado |
| Reclamaciones | claims + lines + events + transmissions | **Conectado núcleo:** borrador desde servicios, validar, marcar lista y enviar a cola |
| Clearinghouse | connections + responses + payer transactions | **Conectado lectura:** respuestas, estado y referencia; transporte externo conserva infraestructura existente |
| Elegibilidad | `nursetrack_eligibility_checks` | **Conectado lectura:** verificaciones reales registradas; no se simula verificación en vivo |
| Autorizaciones | `nursetrack_authorizations` | **Conectado:** lista y guardar/actualizar autorización activa equivalente |
| Remesas 835 | remittances + lines + RPC de aplicación | **Conectado:** visor, matching y aplicación mediante RPC existente |

## Membresía y pagos

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Planes | `nursetrack_membership_plans` | **Conectado lectura** |
| Membresías | `nursetrack_memberships` | **Conectado:** listado y alta mediante RPC |
| Pagos | `nursetrack_membership_payments` | **Conectado:** registro de pago mediante RPC |
| Renovaciones | `nursetrack_membership_renewals` | **Conectado:** renovación mediante RPC |
| Suscripción por compañía | `nursetrack_company_subscriptions` y relacionadas | Preservada; UI/checkout v4 pendiente |
| Suscripción por usuario | `nursetrack_user_subscriptions` y relacionadas | Preservada; UI/checkout v4 pendiente |
| PayPal / proveedor | Edge Functions existentes | Backend preservado e idempotente; activación del checkout v4 pendiente de una URL pública estable para callback, porque el retorno actual apunta a `cloud-app.html` |

## Administración, seguridad y respaldo

| Área | Estructura existente | Estado v4 |
|---|---|---|
| Súper Administrador | Edge Function `admin-users` | **Conectado:** listar/crear usuario, ficha, activar/desactivar, contraseña temporal y permisos; no permite segundo súper admin |
| Roles | `nursetrack_roles` | Preservados; edición avanzada de catálogo pendiente |
| Permisos | permissions + user permissions + history | **Conectado** desde Súper Administrador |
| Auditoría | `nursetrack_audit_events` | **Conectado solo lectura:** filtros por fecha/acción/entidad; sin controles de eliminación |
| Backups | `nursetrack_backups`, `nursetrack_recovery_snapshots` | **Conectado lectura:** visor de respaldos; v4 no sobrescribe ni elimina respaldos |
| Recuperación | recovery codes + Edge Functions | Preservada |
| Estado del sistema | `nursetrack_system_health`, releases, state | **Conectado lectura:** panel de estado básico |
| Cloud modules | `nursetrack_cloud_modules`, `nursetrack_modules` | Preservados |
| Mis documentos | `nursetrack_personal_documents`, `nursetrack_personal_document_files`, `nursetrack_excel_documents` | **Conectado:** crear/editar documentos de texto y listar archivos/Excel existentes; carga binaria nueva pendiente de validar Storage/buckets |

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
- `v4-beta/operations-settings.js`
- `v4-beta/templates-editor.js`
- `v4-beta/revenue-safety.js`
- `v4-beta/personal-notifications.js`
- `v4-beta/assignments.js`
- `v4-beta/audit-viewer.js`
- `v4-beta/admin-catalogs.js`
- `v4-beta/navigation.js`

## Pendientes antes de convertir v4 en oficial

1. Prueba visual/funcional real en navegador de escritorio, iPhone y iPad; todavía no se ha afirmado E2E visual.
2. Entrega automática/programada de recordatorios y proveedor real de email; SMS manual ya usa la función real configurada.
3. Checkout PayPal / suscripciones por compañía y usuario después de publicar una URL v4 estable para retorno/callback.
4. Carga binaria nueva de archivos personales/Excel después de validar Storage y políticas del bucket.
5. Medicina avanzada: enmiendas, favoritos y algunas impresiones finales.
6. Elegibilidad en vivo solo cuando exista integración/transacción real con clearinghouse.
7. Catálogo CPT completo únicamente con fuente/licencia autorizada.
8. Recuperación/restauración de backups con controles de seguridad adicionales.
9. Edición avanzada de roles y algunos catálogos administrativos secundarios.
10. Validación final de permisos por rol y pruebas de no duplicación en un entorno seguro antes de publicar.

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
