package com.veemarket.business;

public record BusinessProfileResponse(
        Long id,
        BusinessType businessType,
        String businessName,
        String location
) {}
