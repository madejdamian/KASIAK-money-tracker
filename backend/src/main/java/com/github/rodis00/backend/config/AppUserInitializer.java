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
 * The app has a single household account, protected by a password only. The password comes
 * from the environment (APP_PASSWORD) so that it is not stored in the repository.
 * On startup the existing account is updated, or created if there is none yet.
 */
@Component
public class AppUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // internal JWT subject only; users never see or type it
    private static final String USERNAME = "household";

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
        if (password.isBlank()) {
            return;
        }

        List<UserEntity> users = userRepository.findAll();
        UserEntity user = users.isEmpty() ? new UserEntity() : users.get(0);

        user.setUsername(USERNAME);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}
