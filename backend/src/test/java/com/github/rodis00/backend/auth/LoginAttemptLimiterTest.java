package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.exception.TooManyAttemptsException;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LoginAttemptLimiterTest {

    private Instant now = Instant.parse("2026-01-01T10:00:00Z");
    private final LoginAttemptLimiter limiter = new LoginAttemptLimiter(() -> now);

    private void failTimes(String client, int times) {
        for (int i = 0; i < times; i++) {
            limiter.recordFailure(client);
        }
    }

    @Test
    void shouldRefuseAfterTooManyFailuresAndAllowAgainOnceTheyAgeOut() {
        failTimes("1.2.3.4", LoginAttemptLimiter.MAX_FAILURES);

        assertThrows(TooManyAttemptsException.class, () -> limiter.checkAllowed("1.2.3.4"));

        now = now.plus(LoginAttemptLimiter.WINDOW).plusSeconds(1);
        assertDoesNotThrow(() -> limiter.checkAllowed("1.2.3.4"));
    }

    @Test
    void shouldNotRefuseBeforeTheLimitAndKeepClientsApart() {
        failTimes("1.2.3.4", LoginAttemptLimiter.MAX_FAILURES - 1);
        failTimes("5.6.7.8", LoginAttemptLimiter.MAX_FAILURES);

        assertDoesNotThrow(() -> limiter.checkAllowed("1.2.3.4"));
        assertThrows(TooManyAttemptsException.class, () -> limiter.checkAllowed("5.6.7.8"));
    }

    @Test
    void shouldRefuseEveryoneWhenManyAddressesTogetherFailTooOften() {
        for (int i = 0; i < LoginAttemptLimiter.MAX_GLOBAL_FAILURES; i++) {
            limiter.recordFailure("10.0.0." + i);
        }

        assertThrows(TooManyAttemptsException.class, () -> limiter.checkAllowed("9.9.9.9"));
    }

    @Test
    void shouldForgetFailuresAfterASuccessfulLogin() {
        failTimes("1.2.3.4", LoginAttemptLimiter.MAX_FAILURES - 1);
        limiter.reset("1.2.3.4");
        failTimes("1.2.3.4", LoginAttemptLimiter.MAX_FAILURES - 1);

        assertDoesNotThrow(() -> limiter.checkAllowed("1.2.3.4"));
    }
}
