package com.veemarket.device;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface TestSessionRepository extends JpaRepository<TestSession, Long> {

    Optional<TestSession> findFirstByDeviceIdAndStatus(Long deviceId, String status);

    @Modifying
    @Query("UPDATE TestSession s SET s.status = 'expired' WHERE s.status = 'open' AND s.expiresAt <= :now")
    int expireDueSessions(@Param("now") Instant now);
}
