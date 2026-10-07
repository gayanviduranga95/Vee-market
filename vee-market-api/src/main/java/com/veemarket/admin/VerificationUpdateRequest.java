package com.veemarket.admin;

import com.veemarket.farmer.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class VerificationUpdateRequest {
    @NotNull
    private VerificationStatus status;

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }
}
