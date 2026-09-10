package com.nursetrack.enterprise.encounter

import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/encounters")
class EncounterController(
    private val encounters: EncounterRepository,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser
) {
    data class CreateEncounterRequest(@field:NotBlank val encounterType: String)

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<Encounter> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return encounters.findAllByCompanyIdAndPatientIdOrderByStartedAtDesc(patient.companyId, patientId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE','SOCIAL_WORK','PHYSICIAN')")
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: CreateEncounterRequest
    ): Encounter {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        val user = currentUser.require(authentication)
        return encounters.save(
            Encounter(
                companyId = patient.companyId,
                patientId = patientId,
                encounterType = request.encounterType.trim().uppercase(),
                createdByUserId = user.id ?: error("Usuario sin id")
            )
        )
    }

    @PostMapping("/{encounterId}/close")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE','SOCIAL_WORK','PHYSICIAN')")
    fun close(
        @PathVariable patientId: UUID,
        @PathVariable encounterId: UUID,
        authentication: Authentication
    ): Encounter {
        val encounter = encounters.findById(encounterId).orElseThrow { IllegalArgumentException("Encuentro no encontrado") }
        if (encounter.patientId != patientId || !currentUser.canAccessCompany(authentication, encounter.companyId)) throw AccessDeniedException()
        encounter.status = "CLOSED"
        encounter.closedAt = Instant.now()
        return encounters.save(encounter)
    }
}

@ResponseStatus(HttpStatus.FORBIDDEN)
class AccessDeniedException : RuntimeException("Acceso no autorizado a este expediente")
