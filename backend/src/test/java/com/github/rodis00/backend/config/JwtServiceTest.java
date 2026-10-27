package com.github.rodis00.backend.config;

import com.github.rodis00.backend.config.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @Test
    void shouldKeepRefreshCookieForSixMonths() {
        JwtService jwtService = new JwtService();
        // 180 days in milliseconds does not fit into an int
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 180L * 24 * 60 * 60 * 1000);

        Cookie cookie = jwtService.createCookie("token");

        assertEquals(180 * 24 * 60 * 60, cookie.getMaxAge());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.getSecure());
        assertEquals("/expense-tracker/api/v1/auth/refresh-token", cookie.getPath());
    }
}
