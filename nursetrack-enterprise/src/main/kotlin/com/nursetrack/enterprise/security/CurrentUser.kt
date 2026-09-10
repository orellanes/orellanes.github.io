package com.nursetrack.enterprise.security

import com.nursetrack.enterprise.user.AppUser
import com.nursetrack.enterprise.user.AppUserRepository
import com.nursetrack.enterprise.user.UserRole
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CurrentUser(
    private val users: AppUserRepository
) {
    fun require(authentication: Authentication): AppUser =
        users.findByEmailIgnoreCase(authentication.name)
            ?: error("Authenticated user is not registered")

    fun requireCompanyId(authentication: Authentication): UUID {
        val user = require(authentication)
        return user.companyId ?: error("User is not assigned to a company")
    }

    fun canAccessCompany(authentication: Authentication, companyId: UUID): Boolean {
        val user = require(authentication)
        return user.role == UserRole.SUPERADMIN || user.companyId == companyId
    }
}
