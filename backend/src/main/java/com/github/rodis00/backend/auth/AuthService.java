package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.config.jwt.JwtService;
import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.exception.*;
import com.github.rodis00.backend.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse authenticate(AuthRequest request) {
        // single household account: login is by password only
        UserEntity user = userRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new InvalidPasswordException("Invalid password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new InvalidPasswordException("Invalid password.");

        String jwtToken = jwtService.generateToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());
        Cookie cookie = jwtService.createCookie(refreshToken);

        return new AuthResponse(jwtToken, cookie);
    }

    public AuthResponse refreshToken(
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

        // the refresh token is renewed too, so the login lasts as long as the app is used
        String accessToken = jwtService.generateToken(user.getUsername());
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, jwtService.createCookie(newRefreshToken));
    }
}
