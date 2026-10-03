package com.veemarket.moisture;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MoistureReadingRepository
        extends JpaRepository<MoistureReading, Long> {

    List<MoistureReading> findByLotId(Long lotId);

    List<MoistureReading> findByLotIdOrderByMeasuredAtDesc(Long lotId);

    Optional<MoistureReading> findTopByLotIdOrderByMeasuredAtDesc(Long lotId);
}
