package com.nursetrack.enterprise.company

import com.nursetrack.enterprise.security.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class CompanyController(
    private val companies: CompanyRepository,
    private val currentUser: CurrentUser
) {
    data class CompanyUpdateRequest(
        @field:NotBlank val name: String,
        val legalName: String? = null,
        val addressLine1: String? = null,
        val addressLine2: String? = null,
        val city: String? = null,
        val state: String? = "PR",
        val postalCode: String? = null,
        val phone: String? = null,
        val logoUrl: String? = null
    )

    data class CreateCompanyRequest(
        @field:NotBlank val name: String,
        val legalName: String? = null
    )

    @GetMapping("/api/v1/company")
    fun current(authentication: Authentication): Company {
        val companyId = currentUser.requireCompanyId(authentication)
        return companies.findById(companyId).orElseThrow { CompanyNotFoundException() }
    }

    @PatchMapping("/api/v1/company")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    fun updateCurrent(
        authentication: Authentication,
        @Valid @RequestBody request: CompanyUpdateRequest
    ): Company {
        val companyId = currentUser.requireCompanyId(authentication)
        return updateCompany(companyId, request)
    }

    @GetMapping("/api/admin/companies")
    fun listAll(): List<Company> = companies.findAllByOrderByNameAsc()

    @PostMapping("/api/admin/companies")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateCompanyRequest): Company =
        companies.save(Company(name = request.name.trim(), legalName = request.legalName?.trim()))

    @PatchMapping("/api/admin/companies/{id}")
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CompanyUpdateRequest
    ): Company = updateCompany(id, request)

    private fun updateCompany(id: UUID, request: CompanyUpdateRequest): Company {
        val company = companies.findById(id).orElseThrow { CompanyNotFoundException() }
        company.name = request.name.trim()
        company.legalName = request.legalName?.trim()
        company.addressLine1 = request.addressLine1?.trim()
        company.addressLine2 = request.addressLine2?.trim()
        company.city = request.city?.trim()
        company.state = request.state?.trim()
        company.postalCode = request.postalCode?.trim()
        company.phone = request.phone?.trim()
        company.logoUrl = request.logoUrl?.trim()
        return companies.save(company)
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class CompanyNotFoundException : RuntimeException("Compañía no encontrada")
