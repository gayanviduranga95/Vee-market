package com.veemarket.bid;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByLotId(Long lotId);

    Optional<Bid> findByLotIdAndMillUserId(Long lotId, Long millUserId);

    List<Bid> findByMillUserId(Long millUserId);

    List<Bid> findByLotIdOrderByBidPricePerKgDesc(Long lotId);

    List<Bid> findByLotIdAndStatus(Long lotId, BidStatus status);
}
