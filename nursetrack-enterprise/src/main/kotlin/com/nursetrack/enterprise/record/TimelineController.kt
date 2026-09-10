package com.nursetrack.enterprise.record

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.encounter.EncounterRepository
import com.nursetrack.enterprise.medical.MedicalNoteRepository
import com.nursetrack.enterprise.nursing.NursingNoteRepository
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.phq9.Phq9Repository
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.social.SocialWorkAssessmentRepository
import com.nursetrack.enterprise.vitals.VitalSetRepository
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/timeline")
class TimelineController(
    private val patients: PatientRepository,
    private val encounters: EncounterRepository,
    private val nursing: NursingNoteRepository,
    private val social: SocialWorkAssessmentRepository,
    private val medical: MedicalNoteRepository,
    private val phq9: Phq9Repository,
    private val vitals: VitalSetRepository,
    private val currentUser: CurrentUser
) {
    data class TimelineItem(
        val id: UUID?,
        val type: String,
        val title: String,
        val status: String,
        val occurredAt: Instant
    )

    @GetMapping
    fun timeline(@PathVariable patientId: UUID, authentication: Authentication): List<TimelineItem> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()

        val encounterItems = encounters.findAllByCompanyIdAndPatientIdOrderByStartedAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "ENCOUNTER", "Encuentro ${it.encounterType}", it.status, it.startedAt) }
        val nursingItems = nursing.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "NURSING", "Enfermería — ${it.visitType}", it.status, it.createdAt) }
        val socialItems = social.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "SOCIAL_WORK", "Trabajo Social — Entrevista / Manejo de Casos", it.status, it.createdAt) }
        val medicalItems = medical.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "MEDICAL", "Medicina — ${it.providerName}", it.status, it.createdAt) }
        val phqItems = phq9.findAllByCompanyIdAndPatientIdOrderByScreeningDateDescCreatedAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "PHQ9", "PHQ-9 — ${it.totalScore}/27 · ${it.severity.replace('_', ' ')}", it.status, it.createdAt) }
        val vitalItems = vitals.findAllByCompanyIdAndPatientIdOrderByMeasuredAtDesc(patient.companyId, patientId)
            .map { TimelineItem(it.id, "VITALS", "Signos vitales", "RECORDED", it.measuredAt) }

        return (encounterItems + nursingItems + socialItems + medicalItems + phqItems + vitalItems)
            .sortedByDescending { it.occurredAt }
    }
}
