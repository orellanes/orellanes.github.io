package com.nursetrack.enterprise.audit

import com.fasterxml.jackson.databind.ObjectMapper
import com.nursetrack.enterprise.user.AppUserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class ClinicalAuditFilter(
    private val users: AppUserRepository,
    private val audits: AuditEventRepository,
    private val objectMapper: ObjectMapper
) : OncePerRequestFilter() {

    private val patientPattern = Regex("/patients/([0-9a-fA-F-]{36})(?:/|$)")

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return !path.startsWith("/api/") ||
            path.startsWith("/api/public/") ||
            path == "/api/v1/me" ||
            path.startsWith("/api/admin/audit")
    }

    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        filterChain.doFilter(request, response)
        if (response.status >= 400) return

        val auth = SecurityContextHolder.getContext().authentication ?: return
        if (!auth.isAuthenticated || auth.name.isNullOrBlank() || auth.name == "anonymousUser") return
        val user = users.findByEmailIgnoreCase(auth.name) ?: return
        val userId = user.id ?: return
        val path = request.requestURI
        val patientId = patientPattern.find(path)?.groupValues?.getOrNull(1)?.let { runCatching { UUID.fromString(it) }.getOrNull() }

        val event = AuditEvent(
            companyId = user.companyId,
            patientId = patientId,
            actorUserId = userId,
            action = action(request.method, path),
            resourceType = resourceType(path),
            detailsJson = objectMapper.writeValueAsString(
                mapOf(
                    "method" to request.method,
                    "path" to path,
                    "status" to response.status
                )
            )
        )
        runCatching { audits.save(event) }
    }

    private fun action(method: String, path: String): String = when {
        path.endsWith("/sign") -> "SIGN"
        path.endsWith("/close") -> "CLOSE"
        method == "GET" -> "READ"
        method == "POST" -> "CREATE_OR_ACTION"
        method == "PUT" || method == "PATCH" -> "UPDATE"
        method == "DELETE" -> "DELETE"
        else -> method
    }

    private fun resourceType(path: String): String = when {
        path.contains("/nursing") -> "NURSING"
        path.contains("/social-work") -> "SOCIAL_WORK"
        path.contains("/medical") -> "MEDICAL"
        path.contains("/timeline") -> "TIMELINE"
        path.contains("/encounters") -> "ENCOUNTER"
        path.contains("/patients") -> "PATIENT"
        path.contains("/companies") || path.contains("/company") -> "COMPANY"
        path.contains("/users") -> "USER"
        path.contains("/templates") -> "TEMPLATE"
        path.contains("/maintenance") -> "MAINTENANCE"
        else -> "API"
    }
}
