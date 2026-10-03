package com.veemarket.listing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaddyLotRepository extends JpaRepository<PaddyLot, Long> {

    List<PaddyLot> findByFarmId(Long farmId);

    List<PaddyLot> findByStatus(String status);
}