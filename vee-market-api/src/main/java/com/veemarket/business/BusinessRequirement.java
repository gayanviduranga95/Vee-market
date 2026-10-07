package com.veemarket.business;

import com.veemarket.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_requirements")
public class BusinessRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_user_id", nullable = false)
    private User businessUser;

    @Column(name = "rice_type", nullable = false, length = 100)
    private String riceType;

    @Column(name = "quantity_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantityKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequirementFrequency frequency;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public User getBusinessUser() { return businessUser; }
    public void setBusinessUser(User businessUser) { this.businessUser = businessUser; }
    public String getRiceType() { return riceType; }
    public void setRiceType(String riceType) { this.riceType = riceType; }
    public BigDecimal getQuantityKg() { return quantityKg; }
    public void setQuantityKg(BigDecimal quantityKg) { this.quantityKg = quantityKg; }
    public RequirementFrequency getFrequency() { return frequency; }
    public void setFrequency(RequirementFrequency frequency) { this.frequency = frequency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
