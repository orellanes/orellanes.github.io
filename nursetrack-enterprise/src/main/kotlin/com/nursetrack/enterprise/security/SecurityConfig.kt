package com.nursetrack.enterprise.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.csrf.CookieCsrfTokenRepository

@Configuration
@EnableMethodSecurity
class SecurityConfig {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { csrf ->
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers(
                    "/login.html",
                    "/login.js",
                    "/styles.css",
                    "/favicon.ico",
                    "/api/public/**",
                    "/actuator/health",
                    "/actuator/health/**"
                ).permitAll()
                auth.requestMatchers("/api/admin/**").hasRole("SUPERADMIN")
                auth.anyRequest().authenticated()
            }
            .formLogin { form ->
                form.loginPage("/login.html")
                    .loginProcessingUrl("/login")
                    .defaultSuccessUrl("/", true)
                    .failureUrl("/login.html?error=1")
                    .permitAll()
            }
            .logout { logout ->
                logout.logoutUrl("/logout")
                    .logoutSuccessUrl("/login.html?logout=1")
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID", "XSRF-TOKEN")
            }
            .sessionManagement { session ->
                session.sessionFixation { fixation -> fixation.migrateSession() }
                session.maximumSessions(1)
            }
            .headers { headers ->
                headers.frameOptions { frame -> frame.deny() }
                headers.contentSecurityPolicy { csp ->
                    csp.policyDirectives("default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
                }
            }

        return http.build()
    }
}
