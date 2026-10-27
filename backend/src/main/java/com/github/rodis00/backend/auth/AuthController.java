package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.config.jwt.TokenResponse;
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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
            summary = "Authenticate existing user and retrieve JWT Token"
    )
    @PostMapping("/authenticate")
    public ResponseEntity<TokenResponse> authenticate(
            @RequestBody @Valid AuthRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.authenticate(request);
        response.addCookie(authResponse.getCookie());

        return ResponseEntity.ok(new TokenResponse(authResponse.getToken()));
    }

    @Operation(
            summary = "Retrieve a new JWT Token"
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

}
