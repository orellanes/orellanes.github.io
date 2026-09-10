package com.nursetrack.enterprise.nursing

import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.vitals.VitalsService
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.security.MessageDigest
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/nursing")
class NursingController(
    private val notes: NursingNoteRepository,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser,
    private val vitalsService: VitalsService
) {
    data class SaveNursingRequest(
        val encounterId: UUID? = null,
        @field:NotBlank val visitType: String,
        val bloodPressure: String? = null,
        val pulse: Int? = null,
        val respirations: Int? = null,
        val temperatureF: Double? = null,
        val spo2: Int? = null,
        val weightLb: Double? = null,
        val heightIn: Double? = null,
        val findingsJson: String? = null,
        @field:NotBlank val narrative: String,
        val educationJson: String? = null,
        val interventionsJson: String? = null,
        val plan: String? = null,
        val dischargeNote: String? = null
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<NursingNote> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return notes.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE')")
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SaveNursingRequest
    ): NursingNote {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        val user = currentUser.require(authentication)
        val userId = user.id ?: error("Usuario sin id")

        val note = request.encounterId?.let { encounterId ->
            notes.findFirstByCompanyIdAndPatientIdAndEncounterIdAndStatusOrderByCreatedAtDesc(
                patient.companyId, patientId, encounterId, "DRAFT"
            )
        } ?: fromRequest(patient.companyId, patientId, userId, request)

        if (note.id != null) applyRequest(note, request)
        val saved = notes.save(note)
        syncVitals(patient.companyId, patientId, userId, request)
        return saved
    }

    @PutMapping("/{noteId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE')")
    fun update(
        @PathVariable patientId: UUID,
        @PathVariable noteId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SaveNursingRequest
    ): NursingNote {
        val note = notes.findById(noteId).orElseThrow { IllegalArgumentException("Nota no encontrada") }
        if (note.patientId != patientId || !currentUser.canAccessCompany(authentication, note.companyId)) throw AccessDeniedException()
        if (note.status == "SIGNED") throw SignedDocumentLockedException()
        applyRequest(note, request)
        val user = currentUser.require(authentication)
        val saved = notes.save(note)
        syncVitals(note.companyId, patientId, user.id ?: error("Usuario sin id"), request)
        return saved
    }

    @PostMapping("/{noteId}/sign")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE')")
    fun sign(
        @PathVariable patientId: UUID,
        @PathVariable noteId: UUID,
        authentication: Authentication
    ): NursingNote {
        val note = notes.findById(noteId).orElseThrow { IllegalArgumentException("Nota no encontrada") }
        if (note.patientId != patientId || !currentUser.canAccessCompany(authentication, note.companyId)) throw AccessDeniedException()
        if (note.status == "SIGNED") return note
        val user = currentUser.require(authentication)
        note.status = "SIGNED"
        note.signedByUserId = user.id
        note.signedAt = java.time.Instant.now()
        note.signatureHash = sha256(signingMaterial(note))
        return notes.save(note)
    }

    private fun fromRequest(companyId: UUID, patientId: UUID, userId: UUID, request: SaveNursingRequest): NursingNote {
        val note = NursingNote(
            companyId = companyId,
            patientId = patientId,
            encounterId = request.encounterId,
            visitType = request.visitType.trim().uppercase(),
            narrative = request.narrative.trim(),
            createdByUserId = userId
        )
        applyRequest(note, request)
        return note
    }

    private fun applyRequest(note: NursingNote, request: SaveNursingRequest) {
        note.encounterId = request.encounterId
        note.visitType = request.visitType.trim().uppercase()
        note.bloodPressure = request.bloodPressure?.trim()
        note.pulse = request.pulse
        note.respirations = request.respirations
        note.temperatureF = request.temperatureF
        note.spo2 = request.spo2
        note.weightLb = request.weightLb
        note.heightIn = request.heightIn
        note.bmi = calculateBmi(request.weightLb, request.heightIn)
        note.findingsJson = request.findingsJson
        note.narrative = request.narrative.trim()
        note.educationJson = request.educationJson
        note.interventionsJson = request.interventionsJson
        note.plan = request.plan?.trim()
        note.dischargeNote = request.dischargeNote?.trim()
    }

    private fun syncVitals(companyId: UUID, patientId: UUID, userId: UUID, request: SaveNursingRequest) {
        vitalsService.saveFromNursing(
            companyId = companyId,
            patientId = patientId,
            encounterId = request.encounterId,
            userId = userId,
            bloodPressure = request.bloodPressure,
            pulse = request.pulse,
            respirations = request.respirations,
            temperatureF = request.temperatureF,
            spo2 = request.spo2,
            weightLb = request.weightLb,
            heightIn = request.heightIn
        )
    }

    private fun calculateBmi(weightLb: Double?, heightIn: Double?): Double? {
        if (weightLb == null || heightIn == null || weightLb <= 0 || heightIn <= 0) return null
        return kotlin.math.round((703.0 * weightLb / (heightIn * heightIn)) * 10.0) / 10.0
    }

    private fun signingMaterial(note: NursingNote): String = listOf(
        note.id, note.companyId, note.patientId, note.encounterId, note.visitType,
        note.bloodPressure, note.pulse, note.respirations, note.temperatureF, note.spo2,
        note.weightLb, note.heightIn, note.bmi, note.findingsJson, note.narrative,
        note.educationJson, note.interventionsJson, note.plan, note.dischargeNote
    ).joinToString("|") { it?.toString() ?: "" }

    private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(Charsets.UTF_8))
        .joinToString("") { "%02x".format(it) }
}

@ResponseStatus(HttpStatus.LOCKED)
class SignedDocumentLockedException : RuntimeException("El documento firmado es inmutable")
