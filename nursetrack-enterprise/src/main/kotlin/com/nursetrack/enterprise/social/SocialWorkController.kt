package com.nursetrack.enterprise.social

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.nursing.SignedDocumentLockedException
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.security.MessageDigest
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/social-work")
class SocialWorkController(
    private val assessments: SocialWorkAssessmentRepository,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser
) {
    data class SaveAssessmentRequest(
        val encounterId: UUID? = null,
        val page1Json: String = "{}",
        val page2Json: String = "{}",
        val page3Json: String = "{}",
        val page4Json: String = "{}",
        val narrative: String? = null
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<SocialWorkAssessment> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return assessments.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SOCIAL_WORK')")
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SaveAssessmentRequest
    ): SocialWorkAssessment {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        val user = currentUser.require(authentication)
        return assessments.save(
            SocialWorkAssessment(
                companyId = patient.companyId,
                patientId = patientId,
                encounterId = request.encounterId,
                page1Json = request.page1Json,
                page2Json = request.page2Json,
                page3Json = request.page3Json,
                page4Json = request.page4Json,
                narrative = request.narrative?.trim(),
                createdByUserId = user.id ?: error("Usuario sin id")
            )
        )
    }

    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SOCIAL_WORK')")
    fun update(
        @PathVariable patientId: UUID,
        @PathVariable assessmentId: UUID,
        authentication: Authentication,
        @RequestBody request: SaveAssessmentRequest
    ): SocialWorkAssessment {
        val row = assessments.findById(assessmentId).orElseThrow { IllegalArgumentException("Evaluación no encontrada") }
        if (row.patientId != patientId || !currentUser.canAccessCompany(authentication, row.companyId)) throw AccessDeniedException()
        if (row.status == "SIGNED") throw SignedDocumentLockedException()
        row.encounterId = request.encounterId
        row.page1Json = request.page1Json
        row.page2Json = request.page2Json
        row.page3Json = request.page3Json
        row.page4Json = request.page4Json
        row.narrative = request.narrative?.trim()
        return assessments.save(row)
    }

    @PostMapping("/{assessmentId}/sign")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SOCIAL_WORK')")
    fun sign(
        @PathVariable patientId: UUID,
        @PathVariable assessmentId: UUID,
        authentication: Authentication
    ): SocialWorkAssessment {
        val row = assessments.findById(assessmentId).orElseThrow { IllegalArgumentException("Evaluación no encontrada") }
        if (row.patientId != patientId || !currentUser.canAccessCompany(authentication, row.companyId)) throw AccessDeniedException()
        if (row.status == "SIGNED") return row
        val user = currentUser.require(authentication)
        row.status = "SIGNED"
        row.signedByUserId = user.id
        row.signedAt = java.time.Instant.now()
        row.signatureHash = sha256(
            listOf(row.id, row.patientId, row.page1Json, row.page2Json, row.page3Json, row.page4Json, row.narrative)
                .joinToString("|") { it?.toString() ?: "" }
        )
        return assessments.save(row)
    }

    private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(Charsets.UTF_8))
        .joinToString("") { "%02x".format(it) }
}
