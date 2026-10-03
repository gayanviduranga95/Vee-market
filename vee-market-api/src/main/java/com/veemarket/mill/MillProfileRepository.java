package com.veemarket.mill;

import com.veemarket.farmer.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MillProfileRepository extends JpaRepository<MillProfile, Long> {

    Optional<MillProfile> findByUserId(Long userId);

    List<MillProfile> findByVerificationStatus(VerificationStatus verificationStatus);
}
