package com.veemarket.business;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessRequirementRepository extends JpaRepository<BusinessRequirement, Long> {
    List<BusinessRequirement> findByBusinessUserIdOrderByCreatedAtDesc(Long userId);
}
