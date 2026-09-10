package com.nursetrack.enterprise.security

import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/public")
class CsrfController {
    data class CsrfView(val headerName: String, val parameterName: String, val token: String)

    @GetMapping("/csrf")
    fun csrf(token: CsrfToken): CsrfView = CsrfView(token.headerName, token.parameterName, token.token)
}
