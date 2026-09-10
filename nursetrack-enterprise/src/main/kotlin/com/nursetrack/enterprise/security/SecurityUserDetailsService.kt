package com.nursetrack.enterprise.security

import com.nursetrack.enterprise.user.AppUserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class SecurityUserDetailsService(
    private val users: AppUserRepository
) : UserDetailsService {
    override fun loadUserByUsername(username: String): UserDetails {
        val user = users.findByEmailIgnoreCase(username.trim())
            ?: throw UsernameNotFoundException("Usuario no encontrado")

        return User.withUsername(user.email)
            .password(user.passwordHash)
            .roles(user.role.name)
            .disabled(!user.enabled)
            .build()
    }
}
