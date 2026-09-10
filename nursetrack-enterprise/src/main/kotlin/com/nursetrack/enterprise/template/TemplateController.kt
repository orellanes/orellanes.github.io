package com.nursetrack.enterprise.template

import com.nursetrack.enterprise.security.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class TemplateController(
    private val templates: TemplateDefinitionRepository,
    private val currentUser: CurrentUser
) {
    data class SaveTemplateRequest(
        val companyId: UUID? = null,
        @field:NotBlank val templateKey: String,
        @field:NotBlank val discipline: String,
        val language: String = "es",
        val version: Int = 1,
        @field:NotBlank val title: String,
        @field:NotBlank val schemaJson: String,
        val active: Boolean = true
    )

    @GetMapping("/api/v1/templates/{templateKey}")
    fun getActive(
        @PathVariable templateKey: String,
        authentication: Authentication,
        @RequestParam(required = false, defaultValue = "es") language: String
    ): TemplateDefinition {
        val companyId = currentUser.require(authentication).companyId
        if (companyId != null) {
            templates.findTopByTemplateKeyAndLanguageAndActiveTrueAndCompanyIdOrderByVersionDesc(templateKey, language, companyId)?.let { return it }
        }
        return templates.findTopByTemplateKeyAndLanguageAndActiveTrueAndCompanyIdIsNullOrderByVersionDesc(templateKey, language)
            ?: throw TemplateNotFoundException()
    }

    @PostMapping("/api/admin/templates")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPERADMIN')")
    fun create(@Valid @RequestBody request: SaveTemplateRequest): TemplateDefinition = templates.save(
        TemplateDefinition(
            companyId = request.companyId,
            templateKey = request.templateKey.trim(),
            discipline = request.discipline.trim().uppercase(),
            language = request.language.trim().lowercase(),
            version = request.version,
            title = request.title.trim(),
            schemaJson = request.schemaJson,
            active = request.active
        )
    )
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class TemplateNotFoundException : RuntimeException("Plantilla no encontrada")
