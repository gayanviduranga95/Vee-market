package com.veemarket.listing;

import com.veemarket.farm.Farm;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "paddy_lots")
public class PaddyLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "product_type", nullable = false, length = 50)
    private String productType;

    @Column(name = "rice_type", length = 100)
    private String riceType;

    @Column(name = "quantity_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantityKg;

    @Column(name = "asking_price_per_kg", nullable = false, precision = 12, scale = 2)
    private BigDecimal askingPricePerKg;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private Boolean locked = false;

    @Column(name = "lot_code", length = 100)
    private String lotCode;

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

    public Farm getFarm() {
        return farm;
    }

    public void setFarm(Farm farm) {
        this.farm = farm;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public String getRiceType() {
        return riceType;
    }

    public void setRiceType(String riceType) {
        this.riceType = riceType;
    }

    public BigDecimal getQuantityKg() {
        return quantityKg;
    }

    public void setQuantityKg(BigDecimal quantityKg) {
        this.quantityKg = quantityKg;
    }

    public BigDecimal getAskingPricePerKg() {
        return askingPricePerKg;
    }

    public void setAskingPricePerKg(BigDecimal askingPricePerKg) {
        this.askingPricePerKg = askingPricePerKg;
    }

    public LocalDate getAvailableDate() {
        return availableDate;
    }

    public void setAvailableDate(LocalDate availableDate) {
        this.availableDate = availableDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getLocked() {
        return locked != null && locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getLotCode() {
        if (lotCode != null && !lotCode.isBlank()) {
            return lotCode;
        }
        return id != null ? "L" + id : "L0";
    }

    public void setLotCode(String lotCode) {
        this.lotCode = lotCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}