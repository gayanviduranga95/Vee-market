package com.veemarket.deal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Long> {
    Optional<Deal> findByBidId(Long bidId);
}
