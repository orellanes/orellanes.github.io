package com.nursetrack.enterprise.bootstrap

import com.nursetrack.enterprise.company.Company
import com.nursetrack.enterprise.company.CompanyRepository
import com.nursetrack.enterprise.user.AppUser
import com.nursetrack.enterprise.user.AppUserRepository
import com.nursetrack.enterprise.user.UserRole
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.env.Environment
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class BootstrapData(
    private val env: Environment,
    private val companies: CompanyRepository,
    private val users: AppUserRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {
    override fun run(args: ApplicationArguments) {
        val email = env.getProperty("BOOTSTRAP_ADMIN_EMAIL")?.trim()?.lowercase()?.takeIf { it.isNotBlank() } ?: return
        val password = env.getProperty("BOOTSTRAP_ADMIN_PASSWORD")?.takeIf { it.length >= 12 } ?: return
        if (users.findByEmailIgnoreCase(email) != null) return

        val companyName = env.getProperty("BOOTSTRAP_COMPANY_NAME")?.trim()?.takeIf { it.isNotBlank() } ?: "NurseTrack"
        val company = companies.save(Company(name = companyName))
        users.save(
            AppUser(
                companyId = company.id,
                email = email,
                passwordHash = passwordEncoder.encode(password),
                displayName = "Super Administrador",
                role = UserRole.SUPERADMIN,
                mustChangePassword = true
            )
        )
    }
}
