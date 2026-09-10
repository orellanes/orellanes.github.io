package com.nursetrack.enterprise.user

import com.nursetrack.enterprise.security.CurrentUser
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/me")
class MeController(private val currentUser: CurrentUser) {
    data class MeView(
        val id: UUID?,
        val companyId: UUID?,
        val email: String,
        val displayName: String,
        val role: UserRole,
        val mustChangePassword: Boolean
    )

    @GetMapping
    fun me(authentication: Authentication): MeView {
        val user = currentUser.require(authentication)
        return MeView(user.id, user.companyId, user.email, user.displayName, user.role, user.mustChangePassword)
    }
}
