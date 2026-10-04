package com.veemarket.bid;

import com.veemarket.farmer.FarmerProfile;
import com.veemarket.farmer.FarmerProfileRepository;
import com.veemarket.listing.PaddyLot;
import com.veemarket.listing.PaddyLotRepository;
import com.veemarket.user.Role;
import com.veemarket.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final PaddyLotRepository paddyLotRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public BidService(
            BidRepository bidRepository,
            PaddyLotRepository paddyLotRepository,
            FarmerProfileRepository farmerProfileRepository
    ) {
        this.bidRepository = bidRepository;
        this.paddyLotRepository = paddyLotRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    // =========================================================
    // MILL - CREATE BID
    // =========================================================

    @Transactional
    public BidResponse createBid(
            User user,
            Long lotId,
            BidRequest request
    ) {
        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException(
                    "Only mill users can place bids"
            );
        }

        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Paddy lot not found"
                        )
                );

        if (!"ACTIVE".equalsIgnoreCase(lot.getStatus())) {
            throw new IllegalArgumentException(
                    "Lot is not available for bidding"
            );
        }

        if (
                request == null ||
                request.getBidPricePerKg() == null ||
                request.getBidPricePerKg()
                        .compareTo(BigDecimal.ZERO) <= 0
        ) {
            throw new IllegalArgumentException(
                    "Bid price must be greater than zero"
            );
        }

        if (
                bidRepository
                        .findByLotIdAndMillUserId(
                                lotId,
                                user.getId()
                        )
                        .isPresent()
        ) {
            throw new IllegalArgumentException(
                    "You have already placed a bid on this lot"
            );
        }

        Bid bid = new Bid();

        bid.setLot(lot);
        bid.setMillUser(user);
        bid.setBidPricePerKg(
                request.getBidPricePerKg()
        );
        bid.setStatus(BidStatus.PENDING);

        return toResponse(
                bidRepository.save(bid)
        );
    }

    // =========================================================
    // MILL - GET MY BIDS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BidResponse> getMyBids(User user) {

        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException(
                    "Only mill users can access their bids"
            );
        }

        return bidRepository
                .findByMillUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // MILL - GET ONE BID
    // =========================================================

    @Transactional(readOnly = true)
    public BidResponse getMyBid(
            User user,
            Long bidId
    ) {

        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException(
                    "Only mill users can access their bids"
            );
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Bid not found"
                        )
                );

        if (
                !bid.getMillUser()
                        .getId()
                        .equals(user.getId())
        ) {
            throw new AccessDeniedException(
                    "You can only view your own bids"
            );
        }

        return toResponse(bid);
    }

    // =========================================================
    // FARMER - GET BIDS FOR ONE LOT
    // =========================================================

    @Transactional(readOnly = true)
    public List<BidResponse> getLotBids(
            User user,
            Long lotId
    ) {

        if (user.getRole() != Role.FARMER) {
            throw new AccessDeniedException(
                    "Only farmers can view lot bids"
            );
        }

        PaddyLot lot = paddyLotRepository.findById(lotId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Paddy lot not found"
                        )
                );

        FarmerProfile farmerProfile =
                farmerProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Farmer profile not found"
                                )
                        );

        if (
                !lot.getFarm()
                        .getFarmer()
                        .getId()
                        .equals(farmerProfile.getId())
        ) {
            throw new AccessDeniedException(
                    "You can only view bids for your own lots"
            );
        }

        return bidRepository
                .findByLotIdOrderByBidPricePerKgDesc(lotId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // FARMER - GET ALL BIDS FOR THEIR LOTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<BidResponse> getFarmerBids(User user) {

        if (user.getRole() != Role.FARMER) {
            throw new AccessDeniedException(
                    "Only farmers can access their bids"
            );
        }

        FarmerProfile farmerProfile =
                farmerProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Farmer profile not found"
                                )
                        );

        return bidRepository
                .findAll()
                .stream()
                .filter(bid ->
                        bid.getLot()
                                .getFarm()
                                .getFarmer()
                                .getId()
                                .equals(farmerProfile.getId())
                )
                .sorted(
                        (a, b) ->
                                b.getCreatedAt()
                                        .compareTo(a.getCreatedAt())
                )
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // FARMER - ACCEPT BID
    // =========================================================

    @Transactional
    public BidResponse acceptBid(
            User user,
            Long bidId
    ) {

        if (user.getRole() != Role.FARMER) {
            throw new AccessDeniedException(
                    "Only farmers can accept bids"
            );
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Bid not found"
                        )
                );

        FarmerProfile farmerProfile =
                farmerProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Farmer profile not found"
                                )
                        );

        if (
                !bid.getLot()
                        .getFarm()
                        .getFarmer()
                        .getId()
                        .equals(farmerProfile.getId())
        ) {
            throw new AccessDeniedException(
                    "You can only accept bids for your own lots"
            );
        }

        if (bid.getStatus() == BidStatus.WITHDRAWN) {
            throw new IllegalArgumentException(
                    "Cannot accept a withdrawn bid"
            );
        }

        if (bid.getStatus() == BidStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Cannot accept a rejected bid"
            );
        }

        if (bid.getStatus() == BidStatus.ACCEPTED) {
            throw new IllegalArgumentException(
                    "This bid has already been accepted"
            );
        }

        bid.setStatus(BidStatus.ACCEPTED);

        // Reject all other pending bids on this lot
        List<Bid> otherBids =
                bidRepository.findByLotIdAndStatus(
                        bid.getLot().getId(),
                        BidStatus.PENDING
                );

        for (Bid otherBid : otherBids) {

            if (!otherBid.getId().equals(bid.getId())) {
                otherBid.setStatus(BidStatus.REJECTED);
            }
        }

        bidRepository.saveAll(otherBids);

        return toResponse(
                bidRepository.save(bid)
        );
    }

    // =========================================================
    // FARMER - REJECT BID
    // =========================================================

    @Transactional
    public BidResponse rejectBid(
            User user,
            Long bidId
    ) {

        if (user.getRole() != Role.FARMER) {
            throw new AccessDeniedException(
                    "Only farmers can reject bids"
            );
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Bid not found"
                        )
                );

        FarmerProfile farmerProfile =
                farmerProfileRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Farmer profile not found"
                                )
                        );

        if (
                !bid.getLot()
                        .getFarm()
                        .getFarmer()
                        .getId()
                        .equals(farmerProfile.getId())
        ) {
            throw new AccessDeniedException(
                    "You can only reject bids for your own lots"
            );
        }

        if (bid.getStatus() == BidStatus.ACCEPTED) {
            throw new IllegalArgumentException(
                    "Cannot reject an accepted bid"
            );
        }

        if (bid.getStatus() == BidStatus.WITHDRAWN) {
            throw new IllegalArgumentException(
                    "Cannot reject a withdrawn bid"
            );
        }

        bid.setStatus(BidStatus.REJECTED);

        return toResponse(
                bidRepository.save(bid)
        );
    }

    // =========================================================
    // MILL - WITHDRAW BID
    // =========================================================

    @Transactional
    public BidResponse withdrawBid(
            User user,
            Long bidId
    ) {

        if (user.getRole() != Role.MILL) {
            throw new AccessDeniedException(
                    "Only mill users can withdraw bids"
            );
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Bid not found"
                        )
                );

        if (
                !bid.getMillUser()
                        .getId()
                        .equals(user.getId())
        ) {
            throw new AccessDeniedException(
                    "You can only withdraw your own bids"
            );
        }

        if (
                bid.getStatus() == BidStatus.ACCEPTED ||
                bid.getStatus() == BidStatus.REJECTED
        ) {
            throw new IllegalArgumentException(
                    "This bid cannot be withdrawn after a decision has been made"
            );
        }

        bid.setStatus(BidStatus.WITHDRAWN);

        return toResponse(
                bidRepository.save(bid)
        );
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private BidResponse toResponse(Bid bid) {

        return new BidResponse(
                bid.getId(),
                bid.getLot().getId(),
                bid.getMillUser().getId(),
                bid.getBidPricePerKg(),
                bid.getStatus(),
                bid.getCreatedAt(),
                bid.getUpdatedAt()
        );
    }
}
