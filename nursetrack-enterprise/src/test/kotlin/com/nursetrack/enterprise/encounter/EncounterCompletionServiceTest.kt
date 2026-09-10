package com.nursetrack.enterprise.encounter

import com.nursetrack.enterprise.medical.MedicalNoteRepository
import com.nursetrack.enterprise.nursing.NursingNote
import com.nursetrack.enterprise.nursing.NursingNoteRepository
import com.nursetrack.enterprise.phq9.Phq9Repository
import com.nursetrack.enterprise.social.SocialWorkAssessmentRepository
import com.nursetrack.enterprise.vitals.VitalSetRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import java.util.UUID

class EncounterCompletionServiceTest {
    private val nursing = Mockito.mock(NursingNoteRepository::class.java)
    private val social = Mockito.mock(SocialWorkAssessmentRepository::class.java)
    private val medical = Mockito.mock(MedicalNoteRepository::class.java)
    private val phq9 = Mockito.mock(Phq9Repository::class.java)
    private val vitals = Mockito.mock(VitalSetRepository::class.java)
    private val service = EncounterCompletionService(nursing, social, medical, phq9, vitals)

    private val companyId = UUID.randomUUID()
    private val patientId = UUID.randomUUID()
    private val encounterId = UUID.randomUUID()
    private val userId = UUID.randomUUID()
    private val encounter = Encounter(
        id = encounterId,
        companyId = companyId,
        patientId = patientId,
        encounterType = "AMBULATORY",
        createdByUserId = userId
    )

    @BeforeEach
    fun emptyRepositories() {
        Mockito.`when`(nursing.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(emptyList())
        Mockito.`when`(social.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(emptyList())
        Mockito.`when`(medical.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(emptyList())
        Mockito.`when`(phq9.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByScreeningDateDescCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(emptyList())
        Mockito.`when`(vitals.findByCompanyIdAndPatientIdAndEncounterId(companyId, patientId, encounterId)).thenReturn(null)
    }

    @Test
    fun `empty visit cannot close`() {
        val result = service.readiness(encounter)
        assertThat(result.canClose).isFalse()
        assertThat(result.clinicalItems).isZero()
        assertThat(result.blockers).anyMatch { it.contains("visita está vacía", ignoreCase = true) }
    }

    @Test
    fun `draft nursing note blocks close`() {
        val note = NursingNote(
            companyId = companyId,
            patientId = patientId,
            encounterId = encounterId,
            visitType = "FOLLOW_UP",
            narrative = "Nota clínica",
            createdByUserId = userId,
            status = "DRAFT"
        )
        Mockito.`when`(nursing.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(listOf(note))

        val result = service.readiness(encounter)
        assertThat(result.canClose).isFalse()
        assertThat(result.unsignedDocuments).isEqualTo(1)
        assertThat(result.blockers).anyMatch { it.contains("Enfermería") }
    }

    @Test
    fun `signed nursing note allows close`() {
        val note = NursingNote(
            companyId = companyId,
            patientId = patientId,
            encounterId = encounterId,
            visitType = "FOLLOW_UP",
            narrative = "Nota clínica final",
            createdByUserId = userId,
            status = "SIGNED"
        )
        Mockito.`when`(nursing.findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(companyId, patientId, encounterId)).thenReturn(listOf(note))

        val result = service.readiness(encounter)
        assertThat(result.canClose).isTrue()
        assertThat(result.clinicalItems).isEqualTo(1)
        assertThat(result.unsignedDocuments).isZero()
    }
}
