package com.veemarket.business;

import com.veemarket.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_profiles")
public class BusinessProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 20)
    private BusinessType businessType;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(length = 255)
    private String location;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BusinessType getBusinessType() { return businessType; }
    public void setBusinessType(BusinessType businessType) { this.businessType = businessType; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
