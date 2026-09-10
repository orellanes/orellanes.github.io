package com.nursetrack.enterprise.dashboard

import com.nursetrack.enterprise.encounter.EncounterRepository
import com.nursetrack.enterprise.medical.MedicalNoteRepository
import com.nursetrack.enterprise.nursing.NursingNoteRepository
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.phq9.Phq9Repository
import com.nursetrack.enterprise.security.CurrentUser
import com.nursetrack.enterprise.social.SocialWorkAssessmentRepository
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/dashboard")
class DashboardController(
    private val patients: PatientRepository,
    private val encounters: EncounterRepository,
    private val nursing: NursingNoteRepository,
    private val social: SocialWorkAssessmentRepository,
    private val medical: MedicalNoteRepository,
    private val phq9: Phq9Repository,
    private val currentUser: CurrentUser
) {
    data class DashboardSummary(
        val activePatients: Long,
        val activeEncounters: Long,
        val nursingDrafts: Long,
        val socialWorkDrafts: Long,
        val medicalDrafts: Long,
        val phq9FollowUps: Long,
        val pendingDocuments: Long
    )

    @GetMapping
    fun summary(authentication: Authentication): DashboardSummary {
        val companyId = currentUser.requireCompanyId(authentication)
        val nursingDrafts = nursing.countByCompanyIdAndStatusIgnoreCase(companyId, "DRAFT")
        val socialDrafts = social.countByCompanyIdAndStatusIgnoreCase(companyId, "DRAFT")
        val medicalDrafts = medical.countByCompanyIdAndStatusIgnoreCase(companyId, "DRAFT")
        return DashboardSummary(
            activePatients = patients.countByCompanyIdAndStatusIgnoreCase(companyId, "ACTIVE"),
            activeEncounters = encounters.countByCompanyIdAndStatusIn(companyId, listOf("OPEN", "IN_PROGRESS")),
            nursingDrafts = nursingDrafts,
            socialWorkDrafts = socialDrafts,
            medicalDrafts = medicalDrafts,
            phq9FollowUps = phq9.countByCompanyIdAndFollowUpRequiredTrue(companyId),
            pendingDocuments = nursingDrafts + socialDrafts + medicalDrafts
        )
    }
}
