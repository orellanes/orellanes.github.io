package com.nursetrack.enterprise.patient

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.user.UserRole
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients")
class PatientController(
    private val repository: PatientRepository,
    private val currentUser: CurrentUser
) {
    data class CreatePatientRequest(
        val companyId: UUID? = null,
        @field:NotBlank val mrn: String,
        @field:NotBlank val firstName: String,
        val middleName: String? = null,
        @field:NotBlank val lastName: String,
        val dateOfBirth: LocalDate? = null,
        val birthPlace: String? = null,
        val sex: String? = null,
        val maritalStatus: String? = null,
        val childrenCount: Int? = null,
        val phone: String? = null,
        val email: String? = null,
        val residentialAddress: String? = null,
        val postalAddress: String? = null,
        val preferredLanguage: String? = "es"
    )

    @GetMapping("/{id}")
    fun get(@PathVariable id: UUID, authentication: Authentication): Patient {
        val patient = repository.findById(id).orElseThrow { PatientNotFoundException() }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return patient
    }

    @GetMapping
    fun search(
        authentication: Authentication,
        @RequestParam(required = false) companyId: UUID?,
        @RequestParam(required = false) mrn: String?,
        @RequestParam(required = false, defaultValue = "") lastName: String
    ): List<Patient> {
        val scopedCompany = resolveCompany(authentication, companyId)
        if (!mrn.isNullOrBlank()) {
            return listOfNotNull(repository.findByCompanyIdAndMrnIgnoreCase(scopedCompany, mrn.trim()))
        }
        return repository.findTop50ByCompanyIdAndLastNameContainingIgnoreCaseOrderByLastNameAsc(scopedCompany, lastName.trim())
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        authentication: Authentication,
        @Valid @RequestBody request: CreatePatientRequest
    ): Patient {
        val companyId = resolveCompany(authentication, request.companyId)
        repository.findByCompanyIdAndMrnIgnoreCase(companyId, request.mrn.trim())?.let {
            throw DuplicateMrnException()
        }
        return repository.save(
            Patient(
                companyId = companyId,
                mrn = request.mrn.trim(),
                firstName = request.firstName.trim(),
                middleName = request.middleName?.trim(),
                lastName = request.lastName.trim(),
                dateOfBirth = request.dateOfBirth,
                birthPlace = request.birthPlace?.trim(),
                sex = request.sex?.trim(),
                maritalStatus = request.maritalStatus?.trim(),
                childrenCount = request.childrenCount,
                phone = request.phone?.trim(),
                email = request.email?.trim(),
                residentialAddress = request.residentialAddress?.trim(),
                postalAddress = request.postalAddress?.trim(),
                preferredLanguage = request.preferredLanguage?.trim()?.ifBlank { "es" } ?: "es"
            )
        )
    }

    private fun resolveCompany(authentication: Authentication, requested: UUID?): UUID {
        val user = currentUser.require(authentication)
        if (user.role == UserRole.SUPERADMIN) {
            return requested ?: user.companyId ?: throw MissingCompanyException()
        }
        val own = user.companyId ?: throw MissingCompanyException()
        if (requested != null && requested != own) throw AccessDeniedException()
        return own
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class PatientNotFoundException : RuntimeException("Paciente no encontrado")

@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateMrnException : RuntimeException("Ya existe un paciente con ese MRN en la compañía")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class MissingCompanyException : RuntimeException("Debe seleccionar una compañía")
