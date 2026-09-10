package com.nursetrack.enterprise.medical

import com.nursetrack.enterprise.encounter.AccessDeniedException
import com.nursetrack.enterprise.encounter.EncounterWriteGuard
import com.nursetrack.enterprise.nursing.SignedDocumentLockedException
import com.nursetrack.enterprise.patient.PatientRepository
import com.nursetrack.enterprise.security.CurrentUser
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.security.MessageDigest
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/patients/{patientId}/medical")
class MedicalController(
    private val notes: MedicalNoteRepository,
    private val diagnoses: MedicalDiagnosisRepository,
    private val procedures: MedicalProcedureRepository,
    private val patients: PatientRepository,
    private val currentUser: CurrentUser,
    private val encounterWriteGuard: EncounterWriteGuard
) {
    data class DiagnosisInput(val code: String, val description: String? = null, val primary: Boolean = false)
    data class ProcedureInput(val codeSystem: String = "CPT", val code: String, val label: String? = null, val units: Double = 1.0)
    data class SaveMedicalRequest(
        val encounterId: UUID? = null,
        val chiefComplaint: String? = null,
        val hpi: String? = null,
        val assessment: String? = null,
        val plan: String? = null,
        val notes: String? = null,
        val diagnoses: List<DiagnosisInput> = emptyList(),
        val procedures: List<ProcedureInput> = emptyList()
    )
    data class MedicalView(
        val note: MedicalNote,
        val diagnoses: List<MedicalDiagnosis>,
        val procedures: List<MedicalProcedure>
    )

    @GetMapping
    fun list(@PathVariable patientId: UUID, authentication: Authentication): List<MedicalView> {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        return notes.findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(patient.companyId, patientId).map(::view)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','PHYSICIAN')")
    @Transactional
    fun create(
        @PathVariable patientId: UUID,
        authentication: Authentication,
        @Valid @RequestBody request: SaveMedicalRequest
    ): MedicalView {
        val patient = patients.findById(patientId).orElseThrow { IllegalArgumentException("Paciente no encontrado") }
        if (!currentUser.canAccessCompany(authentication, patient.companyId)) throw AccessDeniedException()
        encounterWriteGuard.requireOpen(patient.companyId, patientId, request.encounterId)

        val user = currentUser.require(authentication)
        val note = notes.save(
            MedicalNote(
                companyId = patient.companyId,
                patientId = patientId,
                encounterId = request.encounterId,
                providerUserId = user.id ?: error("Usuario sin id"),
                providerName = user.displayName,
                chiefComplaint = request.chiefComplaint?.trim(),
                hpi = request.hpi?.trim(),
                assessment = request.assessment?.trim(),
                plan = request.plan?.trim(),
                notes = request.notes?.trim()
            )
        )
        replaceCodes(note, request)
        return view(note)
    }

    @PutMapping("/{noteId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','PHYSICIAN')")
    @Transactional
    fun update(
        @PathVariable patientId: UUID,
        @PathVariable noteId: UUID,
        authentication: Authentication,
        @RequestBody request: SaveMedicalRequest
    ): MedicalView {
        val note = notes.findById(noteId).orElseThrow { IllegalArgumentException("Nota médica no encontrada") }
        if (note.patientId != patientId || !currentUser.canAccessCompany(authentication, note.companyId)) throw AccessDeniedException()
        if (note.status == "SIGNED") throw SignedDocumentLockedException()
        encounterWriteGuard.requireOpen(note.companyId, patientId, request.encounterId ?: note.encounterId)

        note.encounterId = request.encounterId
        note.chiefComplaint = request.chiefComplaint?.trim()
        note.hpi = request.hpi?.trim()
        note.assessment = request.assessment?.trim()
        note.plan = request.plan?.trim()
        note.notes = request.notes?.trim()
        notes.save(note)
        replaceCodes(note, request)
        return view(note)
    }

    @PostMapping("/{noteId}/sign")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','PHYSICIAN')")
    @Transactional
    fun sign(
        @PathVariable patientId: UUID,
        @PathVariable noteId: UUID,
        authentication: Authentication
    ): MedicalView {
        val note = notes.findById(noteId).orElseThrow { IllegalArgumentException("Nota médica no encontrada") }
        if (note.patientId != patientId || !currentUser.canAccessCompany(authentication, note.companyId)) throw AccessDeniedException()
        if (note.status == "SIGNED") return view(note)
        encounterWriteGuard.requireOpen(note.companyId, patientId, note.encounterId)

        val currentDiagnoses = diagnoses.findAllByMedicalNoteIdOrderByPrimaryDiagnosisDescCreatedAtAsc(noteId)
        val currentProcedures = procedures.findAllByMedicalNoteIdOrderByCreatedAtAsc(noteId)
        note.status = "SIGNED"
        note.signedAt = Instant.now()
        note.signatureHash = sha256(signingMaterial(note, currentDiagnoses, currentProcedures))
        notes.save(note)
        return MedicalView(note, currentDiagnoses, currentProcedures)
    }

    private fun replaceCodes(note: MedicalNote, request: SaveMedicalRequest) {
        val id = note.id ?: error("Nota médica sin id")
        diagnoses.deleteAllByMedicalNoteId(id)
        procedures.deleteAllByMedicalNoteId(id)
        if (request.diagnoses.isNotEmpty()) {
            diagnoses.saveAll(request.diagnoses.filter { it.code.isNotBlank() }.map {
                MedicalDiagnosis(
                    companyId = note.companyId,
                    patientId = note.patientId,
                    medicalNoteId = id,
                    code = it.code.trim().uppercase(),
                    description = it.description?.trim(),
                    primaryDiagnosis = it.primary
                )
            })
        }
        if (request.procedures.isNotEmpty()) {
            procedures.saveAll(request.procedures.filter { it.code.isNotBlank() }.map {
                MedicalProcedure(
                    companyId = note.companyId,
                    patientId = note.patientId,
                    medicalNoteId = id,
                    codeSystem = it.codeSystem.trim().uppercase().ifBlank { "CPT" },
                    code = it.code.trim().uppercase(),
                    label = it.label?.trim(),
                    units = if (it.units > 0) it.units else 1.0
                )
            })
        }
    }

    private fun view(note: MedicalNote): MedicalView {
        val id = note.id ?: return MedicalView(note, emptyList(), emptyList())
        return MedicalView(
            note,
            diagnoses.findAllByMedicalNoteIdOrderByPrimaryDiagnosisDescCreatedAtAsc(id),
            procedures.findAllByMedicalNoteIdOrderByCreatedAtAsc(id)
        )
    }

    private fun signingMaterial(note: MedicalNote, d: List<MedicalDiagnosis>, p: List<MedicalProcedure>): String = buildString {
        append(listOf(note.id,note.companyId,note.patientId,note.encounterId,note.providerUserId,note.providerName,note.chiefComplaint,note.hpi,note.assessment,note.plan,note.notes).joinToString("|") { it?.toString() ?: "" })
        append("|DX:")
        append(d.joinToString(";") { "${it.code}:${it.description ?: ""}:${it.primaryDiagnosis}" })
        append("|PX:")
        append(p.joinToString(";") { "${it.codeSystem}:${it.code}:${it.label ?: ""}:${it.units}" })
    }

    private fun sha256(value: String): String = MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(Charsets.UTF_8))
        .joinToString("") { "%02x".format(it) }
}
