package com.veemarket.bid;

import com.veemarket.listing.PaddyLot;
import com.veemarket.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false)
    private PaddyLot lot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mill_user_id", nullable = false)
    private User millUser;

    @Column(name = "bid_price_per_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal bidPricePerKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BidStatus status = BidStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public PaddyLot getLot() {
        return lot;
    }

    public void setLot(PaddyLot lot) {
        this.lot = lot;
    }

    public User getMillUser() {
        return millUser;
    }

    public void setMillUser(User millUser) {
        this.millUser = millUser;
    }

    public BigDecimal getBidPricePerKg() {
        return bidPricePerKg;
    }

    public void setBidPricePerKg(BigDecimal bidPricePerKg) {
        this.bidPricePerKg = bidPricePerKg;
    }

    public BidStatus getStatus() {
        return status;
    }

    public void setStatus(BidStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
