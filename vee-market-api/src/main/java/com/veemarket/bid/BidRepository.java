package com.veemarket.bid;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByLotId(Long lotId);

    List<Bid> findByMillUserId(Long millUserId);

    List<Bid> findByLotIdOrderByBidPricePerKgDesc(Long lotId);
}
