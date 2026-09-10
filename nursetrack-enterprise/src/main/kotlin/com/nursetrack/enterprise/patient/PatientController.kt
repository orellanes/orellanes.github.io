package com.nursetrack.enterprise.patient

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients")
class PatientController(private val repository: PatientRepository) {

    data class CreatePatientRequest(
        @field:NotNull val companyId: UUID,
        @field:NotBlank val mrn: String,
        @field:NotBlank val firstName: String,
        @field:NotBlank val lastName: String,
        val dateOfBirth: LocalDate? = null,
        val phone: String? = null,
        val email: String? = null
    )

    @GetMapping("/{id}")
    fun get(@PathVariable id: UUID): Patient = repository.findById(id)
        .orElseThrow { PatientNotFoundException() }

    @GetMapping
    fun search(
        @RequestParam companyId: UUID,
        @RequestParam(required = false) mrn: String?,
        @RequestParam(required = false, defaultValue = "") lastName: String
    ): List<Patient> {
        if (!mrn.isNullOrBlank()) {
            return listOfNotNull(repository.findByCompanyIdAndMrnIgnoreCase(companyId, mrn.trim()))
        }
        return repository.findTop50ByCompanyIdAndLastNameContainingIgnoreCaseOrderByLastNameAsc(companyId, lastName.trim())
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreatePatientRequest): Patient {
        repository.findByCompanyIdAndMrnIgnoreCase(request.companyId, request.mrn.trim())?.let {
            throw DuplicateMrnException()
        }
        return repository.save(
            Patient(
                companyId = request.companyId,
                mrn = request.mrn.trim(),
                firstName = request.firstName.trim(),
                lastName = request.lastName.trim(),
                dateOfBirth = request.dateOfBirth,
                phone = request.phone?.trim(),
                email = request.email?.trim()
            )
        )
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class PatientNotFoundException : RuntimeException("Paciente no encontrado")

@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateMrnException : RuntimeException("Ya existe un paciente con ese MRN en la compañía")
