package com.veemarket.business;

import com.veemarket.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "requirement_offers", uniqueConstraints = @UniqueConstraint(columnNames = {"requirement_id", "mill_user_id"}))
public class RequirementOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requirement_id", nullable = false)
    private BusinessRequirement requirement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mill_user_id", nullable = false)
    private User millUser;

    @Column(name = "price_per_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequirementOfferStatus status = RequirementOfferStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public BusinessRequirement getRequirement() { return requirement; }
    public void setRequirement(BusinessRequirement requirement) { this.requirement = requirement; }
    public User getMillUser() { return millUser; }
    public void setMillUser(User millUser) { this.millUser = millUser; }
    public BigDecimal getPricePerKg() { return pricePerKg; }
    public void setPricePerKg(BigDecimal pricePerKg) { this.pricePerKg = pricePerKg; }
    public RequirementOfferStatus getStatus() { return status; }
    public void setStatus(RequirementOfferStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
