package com.nursetrack.enterprise.user

import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/admin/users")
class UserAdminController(
    private val users: AppUserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    data class CreateUserRequest(
        val companyId: UUID? = null,
        @field:Email @field:NotBlank val email: String,
        @field:NotBlank val displayName: String,
        @field:NotNull val role: UserRole,
        @field:NotBlank val temporaryPassword: String
    )

    data class UpdateUserRequest(
        val companyId: UUID? = null,
        val displayName: String? = null,
        val role: UserRole? = null,
        val enabled: Boolean? = null,
        val temporaryPassword: String? = null
    )

    @GetMapping
    fun list(@RequestParam(required = false) companyId: UUID?): List<AppUserView> {
        val rows = if (companyId == null) users.findAll() else users.findAllByCompanyIdOrderByDisplayNameAsc(companyId)
        return rows.sortedBy { it.displayName.lowercase() }.map(::view)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateUserRequest): AppUserView {
        if (users.findByEmailIgnoreCase(request.email.trim()) != null) throw DuplicateUserEmailException()
        val user = AppUser(
            companyId = request.companyId,
            email = request.email.trim().lowercase(),
            passwordHash = passwordEncoder.encode(request.temporaryPassword),
            displayName = request.displayName.trim(),
            role = request.role,
            mustChangePassword = true
        )
        return view(users.save(user))
    }

    @PatchMapping("/{id}")
    fun update(@PathVariable id: UUID, @RequestBody request: UpdateUserRequest): AppUserView {
        val user = users.findById(id).orElseThrow { UserNotFoundException() }
        request.companyId?.let { user.companyId = it }
        request.displayName?.trim()?.takeIf { it.isNotBlank() }?.let { user.displayName = it }
        request.role?.let { user.role = it }
        request.enabled?.let { user.enabled = it }
        request.temporaryPassword?.takeIf { it.isNotBlank() }?.let {
            user.passwordHash = passwordEncoder.encode(it)
            user.mustChangePassword = true
        }
        return view(users.save(user))
    }

    data class AppUserView(
        val id: UUID?,
        val companyId: UUID?,
        val email: String,
        val displayName: String,
        val role: UserRole,
        val enabled: Boolean,
        val mustChangePassword: Boolean
    )

    private fun view(user: AppUser) = AppUserView(
        user.id, user.companyId, user.email, user.displayName,
        user.role, user.enabled, user.mustChangePassword
    )
}

@ResponseStatus(HttpStatus.CONFLICT)
class DuplicateUserEmailException : RuntimeException("Ya existe un usuario con ese correo")

@ResponseStatus(HttpStatus.NOT_FOUND)
class UserNotFoundException : RuntimeException("Usuario no encontrado")
