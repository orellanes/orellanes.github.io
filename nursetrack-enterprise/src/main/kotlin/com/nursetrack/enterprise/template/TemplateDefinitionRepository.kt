package com.nursetrack.enterprise.template

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TemplateDefinitionRepository : JpaRepository<TemplateDefinition, UUID> {
    fun findTopByTemplateKeyAndLanguageAndActiveTrueAndCompanyIdOrderByVersionDesc(templateKey: String, language: String, companyId: UUID): TemplateDefinition?
    fun findTopByTemplateKeyAndLanguageAndActiveTrueAndCompanyIdIsNullOrderByVersionDesc(templateKey: String, language: String): TemplateDefinition?
}
