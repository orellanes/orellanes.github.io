package com.nursetrack.enterprise.patient

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PatientRepository : JpaRepository<Patient, UUID> {
    fun findByCompanyIdAndMrnIgnoreCase(companyId: UUID, mrn: String): Patient?
    fun findTop50ByCompanyIdAndLastNameContainingIgnoreCaseOrderByLastNameAsc(companyId: UUID, lastName: String): List<Patient>
}
