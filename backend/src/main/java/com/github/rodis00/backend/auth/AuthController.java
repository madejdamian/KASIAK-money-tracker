package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.config.jwt.TokenResponse;
import com.github.rodis00.backend.exception.InvalidPasswordException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("expense-tracker/api/v1/auth")
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;
    private final LoginAttemptLimiter loginAttemptLimiter;

    public AuthController(AuthService authService, LoginAttemptLimiter loginAttemptLimiter) {
        this.authService = authService;
        this.loginAttemptLimiter = loginAttemptLimiter;
    }

    @Operation(
            summary = "Authenticate existing user and retrieve JWT Token"
    )
    @PostMapping("/authenticate")
    public ResponseEntity<TokenResponse> authenticate(
            @RequestBody @Valid AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        // behind the reverse proxy this is the real client address (forward headers are enabled)
        String client = httpRequest.getRemoteAddr();
        loginAttemptLimiter.checkAllowed(client);

        AuthResponse authResponse;
        try {
            authResponse = authService.authenticate(request);
        } catch (InvalidPasswordException e) {
            loginAttemptLimiter.recordFailure(client);
            throw e;
        }
        loginAttemptLimiter.reset(client);
        response.addCookie(authResponse.getCookie());

        return ResponseEntity.ok(new TokenResponse(authResponse.getToken()));
    }

    @Operation(
            summary = "Retrieve a new JWT Token"
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.refreshToken(request);
        response.addCookie(authResponse.getCookie());

        return ResponseEntity.ok(new TokenResponse(authResponse.getToken()));
    }

}
