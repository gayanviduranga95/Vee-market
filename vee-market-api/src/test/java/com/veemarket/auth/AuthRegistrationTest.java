package com.veemarket.auth;

import com.veemarket.auth.dto.RegisterRequest;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthRegistrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private String suffix;

    @BeforeEach
    void setUp() {
        suffix = String.valueOf(System.nanoTime());
    }

    @Test
    void farmerCanRegisterWithoutDeviceId() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Sunil Bandara");
        request.setEmail("farmer." + suffix + "@test.com");
        request.setPassword("password123");
        request.setPhone("0771234567");
        request.setRole("FARMER");
        request.setDeviceNumber(null); // No device ID during registration

        User user = authService.register(request);

        assertNotNull(user.getId());
        assertEquals("farmer." + suffix + "@test.com", user.getEmail());
        assertEquals(Role.FARMER, user.getRole());
        assertNull(user.getDeviceNumber());
    }

    @Test
    void publicAdminRegistrationIsRejected() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Attacker Admin");
        request.setEmail("admin.attempt." + suffix + "@test.com");
        request.setPassword("password123");
        request.setPhone("0770000000");
        request.setRole("ADMIN");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );

        assertTrue(ex.getMessage().contains("ADMIN"));
    }
}
