package com.nursetrack.enterprise.vitals

import com.nursetrack.enterprise.encounter.EncounterWriteGuard
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID
import kotlin.math.round

@Service
class VitalsService(
    private val repository: VitalSetRepository,
    private val encounterWriteGuard: EncounterWriteGuard
) {

    data class Input(
        val encounterId: UUID? = null,
        val systolic: Int? = null,
        val diastolic: Int? = null,
        val heartRate: Int? = null,
        val respiratoryRate: Int? = null,
        val temperatureF: Double? = null,
        val spo2: Int? = null,
        val weightLb: Double? = null,
        val heightIn: Double? = null,
        val painScore: Int? = null,
        val notes: String? = null,
        val source: String = "MANUAL"
    )

    fun save(companyId: UUID, patientId: UUID, userId: UUID, input: Input): VitalSet? {
        encounterWriteGuard.requireOpen(companyId, patientId, input.encounterId)

        val hasAny = listOf(
            input.systolic, input.diastolic, input.heartRate, input.respiratoryRate,
            input.temperatureF, input.spo2, input.weightLb, input.heightIn, input.painScore
        ).any { it != null } || !input.notes.isNullOrBlank()
        if (!hasAny) return null

        val row = input.encounterId?.let {
            repository.findByCompanyIdAndPatientIdAndEncounterId(companyId, patientId, it)
        } ?: VitalSet(companyId = companyId, patientId = patientId, createdByUserId = userId)

        row.encounterId = input.encounterId
        row.measuredAt = Instant.now()
        row.systolic = input.systolic
        row.diastolic = input.diastolic
        row.heartRate = input.heartRate
        row.respiratoryRate = input.respiratoryRate
        row.temperatureC = input.temperatureF?.let { round1((it - 32.0) * 5.0 / 9.0) }
        row.spo2 = input.spo2
        row.weightKg = input.weightLb?.let { round1(it * 0.45359237) }
        row.heightCm = input.heightIn?.let { round1(it * 2.54) }
        row.bmi = bmi(row.weightKg, row.heightCm)
        row.painScore = input.painScore
        row.notes = input.notes?.trim()?.ifBlank { null }
        row.source = input.source.trim().uppercase().ifBlank { "MANUAL" }
        return repository.save(row)
    }

    fun saveFromNursing(
        companyId: UUID,
        patientId: UUID,
        encounterId: UUID?,
        userId: UUID,
        bloodPressure: String?,
        pulse: Int?,
        respirations: Int?,
        temperatureF: Double?,
        spo2: Int?,
        weightLb: Double?,
        heightIn: Double?
    ): VitalSet? {
        val bp = bloodPressure?.trim()?.split('/')
        val systolic = bp?.getOrNull(0)?.trim()?.toIntOrNull()
        val diastolic = bp?.getOrNull(1)?.trim()?.toIntOrNull()
        return save(
            companyId, patientId, userId,
            Input(
                encounterId = encounterId,
                systolic = systolic,
                diastolic = diastolic,
                heartRate = pulse,
                respiratoryRate = respirations,
                temperatureF = temperatureF,
                spo2 = spo2,
                weightLb = weightLb,
                heightIn = heightIn,
                source = "NURSING"
            )
        )
    }

    private fun bmi(weightKg: Double?, heightCm: Double?): Double? {
        if (weightKg == null || heightCm == null || weightKg <= 0 || heightCm <= 0) return null
        val meters = heightCm / 100.0
        return round1(weightKg / (meters * meters))
    }

    private fun round1(value: Double): Double = round(value * 10.0) / 10.0
}
