package com.github.rodis00.backend.auth;

import com.github.rodis00.backend.exception.TooManyAttemptsException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.function.Supplier;

/**
 * Slows down guessing of the password: after {@value #MAX_FAILURES} wrong passwords from one client
 * within the window, that client is refused until the oldest failure falls out of the window.
 * Kept in memory, so a restart clears it (enough for a single-user app).
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 5;
    // all clients together: guessing from many addresses at once does not get around the limit
    static final int MAX_GLOBAL_FAILURES = 30;
    static final Duration WINDOW = Duration.ofMinutes(15);
    private static final String EVERYONE = "*";

    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();
    private final Supplier<Instant> clock;

    public LoginAttemptLimiter() {
        this(Instant::now);
    }

    LoginAttemptLimiter(Supplier<Instant> clock) {
        this.clock = clock;
    }

    public void checkAllowed(String client) {
        if (recentFailures(client) >= MAX_FAILURES || recentFailures(EVERYONE) >= MAX_GLOBAL_FAILURES) {
            throw new TooManyAttemptsException("Too many failed attempts. Try again in a few minutes.");
        }
    }

    public void recordFailure(String client) {
        Instant time = clock.get();
        failures.computeIfAbsent(client, key -> new ConcurrentLinkedDeque<>()).add(time);
        failures.computeIfAbsent(EVERYONE, key -> new ConcurrentLinkedDeque<>()).add(time);
    }

    public void reset(String client) {
        failures.remove(client);
    }

    private int recentFailures(String client) {
        Deque<Instant> times = failures.get(client);
        if (times == null) {
            return 0;
        }

        Instant cutoff = clock.get().minus(WINDOW);
        times.removeIf(time -> time.isBefore(cutoff));
        if (times.isEmpty()) {
            failures.remove(client, times);
        }
        return times.size();
    }
}
