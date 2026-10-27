package com.github.rodis00.backend.config;

import com.github.rodis00.backend.entity.UserEntity;
import com.github.rodis00.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * The app has a single household account. Its credentials come from the environment
 * (APP_USERNAME / APP_PASSWORD) so that no password is stored in the repository.
 * On startup the existing account is updated, or created if there is none yet.
 */
@Component
public class AppUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.user.username:}")
    private String username;

    @Value("${application.user.password:}")
    private String password;

    public AppUserInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username.isBlank() || password.isBlank()) {
            return;
        }

        List<UserEntity> users = userRepository.findAll();
        UserEntity user = users.isEmpty() ? new UserEntity() : users.get(0);

        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}
