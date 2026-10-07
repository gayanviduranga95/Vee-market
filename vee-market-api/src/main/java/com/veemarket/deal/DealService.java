package com.veemarket.deal;

import com.veemarket.bid.Bid;
import com.veemarket.bid.BidRepository;
import com.veemarket.bid.BidStatus;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DealService {
    private final DealRepository dealRepository;
    private final BidRepository bidRepository;

    public DealService(
            DealRepository dealRepository,
            BidRepository bidRepository
    ) {
        this.dealRepository = dealRepository;
        this.bidRepository = bidRepository;
    }

    @Transactional
    public DealResponse createFromAcceptedBid(User user, Long bidId) {
        if (user.getRole() != Role.FARMER) {
            throw new AccessDeniedException("Only farmers can create deals");
        }

        Bid bid = getBid(bidId);
        validateFarmerOwnsBid(user, bid);

        if (bid.getStatus() != BidStatus.ACCEPTED) {
            throw new IllegalArgumentException("Only accepted bids can become deals");
        }

        if (dealRepository.findByBidId(bidId).isPresent()) {
            throw new IllegalArgumentException("A deal already exists for this bid");
        }

        Deal deal = new Deal();
        deal.setBid(bid);
        return toResponse(dealRepository.save(deal));
    }

    @Transactional(readOnly = true)
    public List<DealResponse> getDeals(User user) {
        return dealRepository.findAll().stream()
                .filter(deal -> isParticipant(user, deal.getBid()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DealResponse confirm(User user, Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found"));

        Bid bid = deal.getBid();
        if (!isParticipant(user, bid)) {
            throw new AccessDeniedException("You can only confirm your own deals");
        }

        if (deal.getStatus() == DealStatus.CONFIRMED) {
            return toResponse(deal);
        }

        boolean farmer = bid.getLot().getFarm().getFarmer().getUser().getId().equals(user.getId());
        if (farmer && deal.getStatus() == DealStatus.MILL_CONFIRMED) {
            deal.setStatus(DealStatus.CONFIRMED);
        } else if (!farmer && deal.getStatus() == DealStatus.FARMER_CONFIRMED) {
            deal.setStatus(DealStatus.CONFIRMED);
        } else if (farmer) {
            deal.setStatus(DealStatus.FARMER_CONFIRMED);
        } else {
            deal.setStatus(DealStatus.MILL_CONFIRMED);
        }

        return toResponse(dealRepository.save(deal));
    }

    @Transactional
    public DealResponse updatePayment(User user, Long dealId, String status) {
        Deal deal = getParticipantDeal(user, dealId);
        try {
            deal.setPaymentStatus(PaymentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Payment status must be PENDING, MARKED_PAID, or CONFIRMED");
        }
        return toResponse(dealRepository.save(deal));
    }

    @Transactional
    public DealResponse updateDelivery(User user, Long dealId, String status) {
        Deal deal = getParticipantDeal(user, dealId);
        try {
            deal.setDeliveryStatus(DeliveryStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Delivery status is invalid");
        }
        return toResponse(dealRepository.save(deal));
    }

    private Bid getBid(Long bidId) {
        return bidRepository.findById(bidId)
                .orElseThrow(() -> new EntityNotFoundException("Bid not found"));
    }

    private Deal getParticipantDeal(User user, Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found"));
        if (!isParticipant(user, deal.getBid())) {
            throw new AccessDeniedException("You can only update your own deals");
        }
        return deal;
    }

    private void validateFarmerOwnsBid(User user, Bid bid) {
        if (!bid.getLot().getFarm().getFarmer().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only create deals for your own lots");
        }
    }

    private boolean isParticipant(User user, Bid bid) {
        return bid.getMillUser().getId().equals(user.getId())
                || bid.getLot().getFarm().getFarmer().getUser().getId().equals(user.getId());
    }

    private DealResponse toResponse(Deal deal) {
        Bid bid = deal.getBid();
        return new DealResponse(
                deal.getId(),
                bid.getId(),
                bid.getLot().getId(),
                bid.getLot().getFarm().getFarmer().getUser().getId(),
                bid.getMillUser().getId(),
                bid.getBidPricePerKg(),
                bid.getLot().getQuantityKg(),
                deal.getStatus(),
                deal.getPaymentStatus(),
                deal.getDeliveryStatus(),
                deal.getCreatedAt(),
                deal.getUpdatedAt()
        );
    }
}
