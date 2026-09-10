package com.nursetrack.enterprise.company

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CompanyRepository : JpaRepository<Company, UUID> {
    fun findAllByOrderByNameAsc(): List<Company>
}
