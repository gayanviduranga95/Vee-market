package com.veemarket.deal;

import com.veemarket.bid.Bid;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deals")
public class Deal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bid_id", nullable = false, unique = true)
    private Bid bid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DealStatus status = DealStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

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

    public Long getId() { return id; }
    public Bid getBid() { return bid; }
    public void setBid(Bid bid) { this.bid = bid; }
    public DealStatus getStatus() { return status; }
    public void setStatus(DealStatus status) { this.status = status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public DeliveryStatus getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(DeliveryStatus deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
