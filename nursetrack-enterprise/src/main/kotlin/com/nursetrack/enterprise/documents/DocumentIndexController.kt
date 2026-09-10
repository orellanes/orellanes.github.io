package com.nursetrack.enterprise.documents

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.medical.MedicalNoteRepository
import com.nursetrack.enterprise.nursing.NursingNoteRepository
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.phq9.Phq9Repository
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.social.SocialWorkAssessmentRepository
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/documents")
class DocumentIndexController(
    private val patients: PatientRepository,
    private val nursing: NursingNoteRepository,
    private val social: SocialWorkAssessmentRepository,
    private val medical: MedicalNoteRepository,
    private val phq9: Phq9Repository,
    private val currentUser: CurrentUser
) {
    data class DocumentItem(
        val id: UUID?,
        val type: String,
        val title: String,
        val status: String,
        val createdAt: Instant,
        val signedAt: Instant?,
        val module: String
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<DocumentItem> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()

        val nursingDocs = nursing.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { DocumentItem(it.id, "NURSING", "Enfermería — ${it.visitType}", it.status, it.createdAt, it.signedAt, "nursing") }
        val socialDocs = social.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { DocumentItem(it.id, "SOCIAL_WORK", "Trabajo Social — Entrevista / Manejo de Casos", it.status, it.createdAt, it.signedAt, "social") }
        val medicalDocs = medical.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
            .map { DocumentItem(it.id, "MEDICAL", "Medicina — ${it.providerName}", it.status, it.createdAt, it.signedAt, "medical") }
        val phqDocs = phq9.findAllByCompanyIdAndPatientIdOrderByScreeningDateDescCreatedAtDesc(patient.companyId, patientId)
            .map { DocumentItem(it.id, "PHQ9", "PHQ-9 — ${it.totalScore}/27 · ${it.severity.replace('_', ' ')}", it.status, it.createdAt, it.signedAt, "phq9") }

        return (nursingDocs + socialDocs + medicalDocs + phqDocs).sortedByDescending { it.createdAt }
    }
}
