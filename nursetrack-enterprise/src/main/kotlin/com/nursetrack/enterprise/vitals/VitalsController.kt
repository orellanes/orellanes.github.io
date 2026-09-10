package com.nursetrack.enterprise.vitals

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/vitals")
class VitalsController(
    private val repository: VitalSetRepository,
    private val service: VitalsService,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser
) {
    data class SaveVitalsRequest(
        val encounterId: UUID? = null,
        val systolic: Int? = null,
        val diastolic: Int? = null,
        val heartRate: Int? = null,
        val respiratoryRate: Int? = null,
        val temperatureF: Double? = null,
        @field:Min(0) @field:Max(100) val spo2: Int? = null,
        val weightLb: Double? = null,
        val heightIn: Double? = null,
        @field:Min(0) @field:Max(10) val painScore: Int? = null,
        val notes: String? = null
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<VitalSet> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return repository.findAllByCompanyIdAndPatientIdOrderByMeasuredAtDesc(patient.companyId, patientId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','NURSE','PHYSICIAN')")
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SaveVitalsRequest
    ): VitalSet {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        val user = currentUser.require(authentication)
        return service.save(
            patient.companyId,
            patientId,
            user.id ?: error("Usuario sin id"),
            VitalsService.Input(
                encounterId = request.encounterId,
                systolic = request.systolic,
                diastolic = request.diastolic,
                heartRate = request.heartRate,
                respiratoryRate = request.respiratoryRate,
                temperatureF = request.temperatureF,
                spo2 = request.spo2,
                weightLb = request.weightLb,
                heightIn = request.heightIn,
                painScore = request.painScore,
                notes = request.notes,
                source = "MANUAL"
            )
        ) ?: throw IllegalArgumentException("Debe documentar al menos un signo vital")
    }
}
