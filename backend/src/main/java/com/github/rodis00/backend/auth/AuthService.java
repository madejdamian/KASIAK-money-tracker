package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.config.jwt.JwtService;
import com.github.rodis00.backend.config.jwt.TokenResponse;
import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.exception.*;
import com.github.rodis00.backend.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse authenticate(AuthRequest request) {
        UserEntity user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidUsernameException("User does not exist."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new InvalidPasswordException("Invalid password.");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String jwtToken = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());
        Cookie cookie = jwtService.createCookie(refreshToken);

        return new AuthResponse(jwtToken, cookie);
    }

    public TokenResponse refreshToken(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            throw new InvalidTokenException("Required cookie, received undefined");
        }

        final String username;
        final String refreshToken = Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals("refreshToken"))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new InvalidTokenException("No refresh token found"));

        username = jwtService.extractUsername(refreshToken);

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user) || !jwtService.isRefreshToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token is not valid");
        }

        String accessToken = jwtService.generateToken(user.getUsername());

        return new TokenResponse(accessToken);
    }
}
