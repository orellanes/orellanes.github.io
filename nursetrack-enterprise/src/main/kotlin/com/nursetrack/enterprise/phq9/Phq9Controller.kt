package com.nursetrack.enterprise.phq9

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.security.MessageDigest
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/phq9")
class Phq9Controller(
    private val repository: Phq9Repository,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser
) {
    data class SavePhq9Request(
        val encounterId: UUID? = null,
        @field:NotNull val screeningDate: LocalDate,
        @field:Min(0) @field:Max(3) val q1: Int,
        @field:Min(0) @field:Max(3) val q2: Int,
        @field:Min(0) @field:Max(3) val q3: Int,
        @field:Min(0) @field:Max(3) val q4: Int,
        @field:Min(0) @field:Max(3) val q5: Int,
        @field:Min(0) @field:Max(3) val q6: Int,
        @field:Min(0) @field:Max(3) val q7: Int,
        @field:Min(0) @field:Max(3) val q8: Int,
        @field:Min(0) @field:Max(3) val q9: Int,
        val actionTaken: String? = null,
        val notes: String? = null
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<Phq9Assessment> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return repository.findAllByCompanyIdAndPatientIdOrderByScreeningDateDescCreatedAtDesc(patient.companyId, patientId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE','SOCIAL_WORK','PHYSICIAN')")
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SavePhq9Request
    ): Phq9Assessment {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        if (request.q9 > 0 && request.actionTaken.isNullOrBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "PHQ-9 pregunta 9 positiva: documente la acción clínica tomada")
        }
        val user = currentUser.require(authentication)
        val answers = listOf(request.q1, request.q2, request.q3, request.q4, request.q5, request.q6, request.q7, request.q8, request.q9)
        val total = answers.sum()
        return repository.save(
            Phq9Assessment(
                companyId = patient.companyId,
                patientId = patientId,
                encounterId = request.encounterId,
                screeningDate = request.screeningDate,
                q1 = request.q1,
                q2 = request.q2,
                q3 = request.q3,
                q4 = request.q4,
                q5 = request.q5,
                q6 = request.q6,
                q7 = request.q7,
                q8 = request.q8,
                q9 = request.q9,
                totalScore = total,
                severity = severity(total),
                suicidalIdeation = request.q9 > 0,
                followUpRequired = total >= 5 || request.q9 > 0,
                actionTaken = request.actionTaken?.trim()?.ifBlank { null },
                notes = request.notes?.trim()?.ifBlank { null },
                createdByUserId = user.id ?: error("Usuario sin id")
            )
        )
    }

    @PostMapping("/{assessmentId}/sign")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE','SOCIAL_WORK','PHYSICIAN')")
    fun sign(
        @PathVariable patientId: UUID,
        @PathVariable assessmentId: UUID,
        authentication: Authentication
    ): Phq9Assessment {
        val row = repository.findById(assessmentId).orElseThrow { IllegalArgumentException("PHQ-9 no encontrado") }
        if (row.patientId != patientId || !currentUser.canAccessCompany(authentication, row.companyId)) throw AccessDeniedException()
        if (row.status == "SIGNED") return row
        val user = currentUser.require(authentication)
        row.status = "SIGNED"
        row.signedByUserId = user.id
        row.signedAt = java.time.Instant.now()
        row.signatureHash = sha256(signingMaterial(row))
        return repository.save(row)
    }

    private fun severity(total: Int): String = when (total) {
        in 0..4 -> "MÍNIMA"
        in 5..9 -> "LEVE"
        in 10..14 -> "MODERADA"
        in 15..19 -> "MODERADAMENTE_SEVERA"
        else -> "SEVERA"
    }

    private fun signingMaterial(row: Phq9Assessment): String = listOf(
        row.id, row.companyId, row.patientId, row.encounterId, row.screeningDate,
        row.q1, row.q2, row.q3, row.q4, row.q5, row.q6, row.q7, row.q8, row.q9,
        row.totalScore, row.severity, row.suicidalIdeation, row.followUpRequired,
        row.actionTaken, row.notes
    ).joinToString("|") { it?.toString() ?: "" }

    private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(Charsets.UTF_8))
        .joinToString("") { "%02x".format(it) }
}
