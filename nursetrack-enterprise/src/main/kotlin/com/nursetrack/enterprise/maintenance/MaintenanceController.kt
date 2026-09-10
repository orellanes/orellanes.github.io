package com.nursetrack.enterprise.maintenance

import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.template.TemplateDefinitionRepository
import com.nursetrack.enterprise.user.AppUserRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
@RequestMapping("/api/admin/maintenance")
class MaintenanceController(
    private val patients: PatientRepository,
    private val users: AppUserRepository,
    private val templates: TemplateDefinitionRepository
) {
    data class MaintenanceStatus(
        val serverTime: Instant,
        val application: String,
        val architecture: String,
        val databaseReachable: Boolean,
        val patientRows: Long,
        val userRows: Long,
        val templateRows: Long
    )

    @GetMapping("/status")
    fun status(): MaintenanceStatus {
        val patientRows = patients.count()
        val userRows = users.count()
        val templateRows = templates.count()
        return MaintenanceStatus(
            serverTime = Instant.now(),
            application = "NurseTrack Enterprise",
            architecture = "Spring Boot modular monolith + PostgreSQL",
            databaseReachable = true,
            patientRows = patientRows,
            userRows = userRows,
            templateRows = templateRows
        )
    }
}
