package com.nursetrack.enterprise.encounter

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.UUID

@Component
class EncounterWriteGuard(
    private val encounters: EncounterRepository
) {
    fun requireOpen(companyId: UUID, patientId: UUID, encounterId: UUID?) {
        if (encounterId == null) return
        val encounter = encounters.findById(encounterId)
            .orElseThrow { EncounterNotFoundException() }
        if (encounter.companyId != companyId || encounter.patientId != patientId) {
            throw AccessDeniedException()
        }
        if (!encounter.status.equals("OPEN", ignoreCase = true)) {
            throw EncounterClosedException()
        }
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
class EncounterNotFoundException : RuntimeException("Encuentro no encontrado")

@ResponseStatus(HttpStatus.LOCKED)
class EncounterClosedException : RuntimeException("La visita está cerrada y no acepta cambios clínicos")
