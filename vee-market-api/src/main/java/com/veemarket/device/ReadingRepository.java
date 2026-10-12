package com.veemarket.device;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {
    Optional<Reading> findBySessionId(Long sessionId);
    Optional<Reading> findFirstByLotIdOrderByIdDesc(Long lotId);
}
