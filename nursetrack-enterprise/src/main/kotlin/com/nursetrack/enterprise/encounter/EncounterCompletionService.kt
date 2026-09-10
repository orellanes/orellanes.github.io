package com.nursetrack.enterprise.encounter

import com.nursetrack.enterprise.medical.MedicalNoteRepository
import com.nursetrack.enterprise.nursing.NursingNoteRepository
import com.nursetrack.enterprise.phq9.Phq9Repository
import com.nursetrack.enterprise.social.SocialWorkAssessmentRepository
import com.nursetrack.enterprise.vitals.VitalSetRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.UUID

@Service
class EncounterCompletionService(
    private val nursing: NursingNoteRepository,
    private val social: SocialWorkAssessmentRepository,
    private val medical: MedicalNoteRepository,
    private val phq9: Phq9Repository,
    private val vitals: VitalSetRepository
) {
    data class Readiness(
        val encounterId: UUID,
        val canClose: Boolean,
        val clinicalItems: Int,
        val unsignedDocuments: Int,
        val blockers: List<String>
    )

    fun readiness(encounter: Encounter): Readiness {
        val encounterId = encounter.id ?: error("Encuentro sin id")
        val nursingRows = nursing.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(encounter.companyId, encounter.patientId)
            .filter { it.encounterId == encounterId }
        val socialRows = social.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(encounter.companyId, encounter.patientId)
            .filter { it.encounterId == encounterId }
        val medicalRows = medical.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(encounter.companyId, encounter.patientId)
            .filter { it.encounterId == encounterId }
        val phqRows = phq9.findAllByCompanyIdAndPatientIdOrderByScreeningDateDescCreatedAtDesc(encounter.companyId, encounter.patientId)
            .filter { it.encounterId == encounterId }
        val vital = vitals.findByCompanyIdAndPatientIdAndEncounterId(encounter.companyId, encounter.patientId, encounterId)

        val blockers = mutableListOf<String>()
        val unsignedNursing = nursingRows.count { !it.status.equals("SIGNED", ignoreCase = true) }
        val unsignedSocial = socialRows.count { !it.status.equals("SIGNED", ignoreCase = true) }
        val unsignedMedical = medicalRows.count { !it.status.equals("SIGNED", ignoreCase = true) }
        val unsignedPhq = phqRows.count { !it.status.equals("SIGNED", ignoreCase = true) }

        if (unsignedNursing > 0) blockers += "Enfermería tiene $unsignedNursing documento(s) sin firmar"
        if (unsignedSocial > 0) blockers += "Trabajo Social tiene $unsignedSocial documento(s) sin firmar"
        if (unsignedMedical > 0) blockers += "Medicina tiene $unsignedMedical documento(s) sin firmar"
        if (unsignedPhq > 0) blockers += "PHQ-9 tiene $unsignedPhq evaluación(es) sin firmar"

        val clinicalItems = nursingRows.size + socialRows.size + medicalRows.size + phqRows.size + if (vital != null) 1 else 0
        if (clinicalItems == 0) blockers += "La visita está vacía; documente la atención antes de cerrarla"

        val unsigned = unsignedNursing + unsignedSocial + unsignedMedical + unsignedPhq
        return Readiness(
            encounterId = encounterId,
            canClose = blockers.isEmpty(),
            clinicalItems = clinicalItems,
            unsignedDocuments = unsigned,
            blockers = blockers
        )
    }

    fun requireReady(encounter: Encounter): Readiness {
        val readiness = readiness(encounter)
        if (!readiness.canClose) throw EncounterNotReadyException(readiness.blockers.joinToString(". "))
        return readiness
    }
}

@ResponseStatus(HttpStatus.CONFLICT)
class EncounterNotReadyException(message: String) : RuntimeException(message)
