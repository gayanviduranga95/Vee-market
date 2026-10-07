package com.veemarket.auth;

import com.veemarket.auth.dto.LoginRequest;
import com.veemarket.auth.dto.RegisterRequest;
import com.veemarket.security.JwtService;
import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.business.BusinessProfile;
import com.veemarket.business.BusinessProfileRepository;
import com.veemarket.business.BusinessType;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FarmerProfileRepository farmerProfileRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final com.veemarket.mill.MillProfileRepository millProfileRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            FarmerProfileRepository farmerProfileRepository,
            BusinessProfileRepository businessProfileRepository,
            com.veemarket.mill.MillProfileRepository millProfileRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.farmerProfileRepository = farmerProfileRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.millProfileRepository = millProfileRepository;
    }

    @Transactional
    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        if (request.getDeviceNumber() != null
                && !request.getDeviceNumber().isBlank()
                && userRepository.existsByDeviceNumber(request.getDeviceNumber())) {
            throw new IllegalArgumentException("Device number is already registered");
        }

        Role role;

        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid role. Use FARMER, MILL, BUYER, or ADMIN"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(role);
        user.setDeviceNumber(request.getDeviceNumber());

        User savedUser = userRepository.save(user);

        if (role == Role.FARMER) {
            FarmerProfile farmerProfile = new FarmerProfile();
            farmerProfile.setUser(savedUser);
            farmerProfileRepository.save(farmerProfile);
        }

        if (role == Role.BUYER) {
            if (request.getBusinessType() == null
                    || request.getBusinessName() == null
                    || request.getBusinessName().isBlank()) {
                throw new IllegalArgumentException(
                        "Business type and business name are required for shop or hotel registration"
                );
            }

            BusinessType businessType;
            try {
                businessType = BusinessType.valueOf(
                        request.getBusinessType().toUpperCase()
                );
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Business type must be SHOP or HOTEL");
            }

            BusinessProfile profile = new BusinessProfile();
            profile.setUser(savedUser);
            profile.setBusinessType(businessType);
            profile.setBusinessName(request.getBusinessName().trim());
            profile.setLocation(request.getBusinessLocation());
            businessProfileRepository.save(profile);
        }

        if (role == Role.MILL) {
            com.veemarket.mill.MillProfile millProfile = new com.veemarket.mill.MillProfile();
            millProfile.setUser(savedUser);
            millProfile.setMillName(
                request.getBusinessName() != null && !request.getBusinessName().isBlank()
                    ? request.getBusinessName().trim()
                    : savedUser.getName() + " Rice Mill"
            );
            millProfile.setLocation(
                request.getBusinessLocation() != null
                    ? request.getBusinessLocation().trim()
                    : ""
            );
            millProfile.setRegistrationNumber(
                request.getDeviceNumber() != null && !request.getDeviceNumber().isBlank()
                    ? request.getDeviceNumber().trim()
                    : "REG-" + savedUser.getId()
            );
            millProfile.setMillingCapacityKgPerDay(new java.math.BigDecimal("2000.00"));
            millProfile.setVerificationStatus(com.veemarket.farmer.VerificationStatus.PENDING);
            millProfileRepository.save(millProfile);
        }

        return savedUser;
    }

    public LoginResult login(LoginRequest request) {

        User user = userRepository.findByEmail(
                request.getEmail().toLowerCase()
        ).orElseThrow(() ->
                new IllegalArgumentException("Invalid email or password")
        );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return new LoginResult(
                jwtService.generateToken(user),
                user
        );
    }

    public record LoginResult(String token, User user) {}
}