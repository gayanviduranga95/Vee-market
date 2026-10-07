package com.veemarket.business;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequirementOfferRepository extends JpaRepository<RequirementOffer, Long> {
    List<RequirementOffer> findByRequirementIdOrderByCreatedAtDesc(Long requirementId);
    List<RequirementOffer> findByMillUserIdOrderByCreatedAtDesc(Long millUserId);
    Optional<RequirementOffer> findByRequirementIdAndMillUserId(Long requirementId, Long millUserId);
}