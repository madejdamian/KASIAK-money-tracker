package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.config.jwt.JwtService;
import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.exception.InvalidTokenException;
import com.github.rodis00.backend.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldIssueNewAccessTokenAndRenewRefreshCookie() {
        UserEntity user = new UserEntity();
        user.setUsername("household");
        Cookie newCookie = new Cookie("refreshToken", "new-refresh");

        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "old-refresh")});
        when(jwtService.extractUsername("old-refresh")).thenReturn("household");
        when(userRepository.findByUsername("household")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("old-refresh", user)).thenReturn(true);
        when(jwtService.isRefreshToken("old-refresh")).thenReturn(true);
        when(jwtService.generateToken("household")).thenReturn("new-access");
        when(jwtService.generateRefreshToken("household")).thenReturn("new-refresh");
        when(jwtService.createCookie("new-refresh")).thenReturn(newCookie);

        AuthResponse response = authService.refreshToken(request);

        assertEquals("new-access", response.getToken());
        assertSame(newCookie, response.getCookie());
    }

    @Test
    void shouldRejectRequestWithoutCookies() {
        when(request.getCookies()).thenReturn(null);

        assertThrows(InvalidTokenException.class, () -> authService.refreshToken(request));
    }

    @Test
    void shouldRejectAccessTokenUsedAsRefreshToken() {
        UserEntity user = new UserEntity();
        user.setUsername("household");

        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("refreshToken", "access")});
        when(jwtService.extractUsername("access")).thenReturn("household");
        when(userRepository.findByUsername("household")).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid("access", user)).thenReturn(true);
        when(jwtService.isRefreshToken("access")).thenReturn(false);

        assertThrows(InvalidTokenException.class, () -> authService.refreshToken(request));
        verify(jwtService, never()).generateRefreshToken(any());
    }
}
