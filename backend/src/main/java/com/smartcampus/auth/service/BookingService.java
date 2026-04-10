package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.*;
import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import com.smartcampus.auth.entity.ResourceStatus;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.BadRequestException;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.BookingRepository;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.bson.Document;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
    private static final String RESOURCES_COLLECTION = "resources";

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final MongoTemplate mongoTemplate;

    public ConflictCheckResponse checkConflict(String resourceId, LocalDateTime start, LocalDateTime end, String excludeBookingId) {
        validateTimeWindow(start, end);
        ensureActiveResource(resourceId);
        List<Booking> raw = bookingRepository.findByResourceIdAndStatusInAndStartTimeBeforeAndEndTimeAfter(
                resourceId, BLOCKING_STATUSES, end, start);
        List<Booking> conflicts = raw.stream()
                .filter(b -> excludeBookingId == null || !excludeBookingId.equals(b.getId()))
                .toList();
        List<BookingDTO> dtos = conflicts.stream().map(this::toDto).toList();
        return ConflictCheckResponse.builder()
                .hasConflict(!dtos.isEmpty())
                .conflictingBookings(dtos)
                .build();
    }

    @Transactional
    public BookingDTO create(BookingCreateRequest req) {
        User user = requireUser();
        if (user.getRole() != Role.STUDENT && user.getRole() != Role.LECTURER) {
            throw new BadRequestException("Only students and lecturers can create booking requests");
        }
        validateTimeWindow(req.getStartTime(), req.getEndTime());
        ensureActiveResource(req.getResourceId());
        assertNoConflict(req.getResourceId(), req.getStartTime(), req.getEndTime(), null);
        Booking b = Booking.builder()
                .resourceId(req.getResourceId())
                .userId(user.getId())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(BookingStatus.PENDING)
                .purpose(req.getPurpose())
                .build();
        return toDto(bookingRepository.save(b));
    }

    @Transactional
    public List<BookingDTO> createRecurring(RecurringBookingRequest req) {
        User user = requireUser();
        if (user.getRole() != Role.LECTURER) {
            throw new BadRequestException("Only lecturers can create recurring bookings");
        }
        validateTimeWindow(req.getFirstStart(), req.getFirstEnd());
        ensureActiveResource(req.getResourceId());
        for (Integer d : req.getRepeatOnDays()) {
            if (d == null || d < 1 || d > 7) {
                throw new BadRequestException("repeatOnDays must be values 1 (Monday) through 7 (Sunday)");
            }
        }
        LocalDate firstDay = req.getFirstStart().toLocalDate();
        if (req.getRecurrenceEndDate().isBefore(firstDay)) {
            throw new BadRequestException("recurrenceEndDate must be on or after the first booking date");
        }

        LocalTime startT = req.getFirstStart().toLocalTime();
        LocalTime endT = req.getFirstEnd().toLocalTime();

        List<LocalDateTime[]> slots = new ArrayList<>();
        for (LocalDate d = firstDay; !d.isAfter(req.getRecurrenceEndDate()); d = d.plusDays(1)) {
            int dow = d.getDayOfWeek().getValue();
            if (!req.getRepeatOnDays().contains(dow)) {
                continue;
            }
            LocalDateTime slotStart = LocalDateTime.of(d, startT);
            LocalDateTime slotEnd = LocalDateTime.of(d, endT);
            validateTimeWindow(slotStart, slotEnd);
            if (slotStart.isBefore(req.getFirstStart())) {
                continue;
            }
            slots.add(new LocalDateTime[]{slotStart, slotEnd});
        }

        if (slots.isEmpty()) {
            throw new BadRequestException("No booking occurrences fall in the selected range and weekdays");
        }

        for (LocalDateTime[] slot : slots) {
            assertNoConflict(req.getResourceId(), slot[0], slot[1], null);
        }

        String seriesId = UUID.randomUUID().toString();
        List<BookingDTO> created = new ArrayList<>();
        for (LocalDateTime[] slot : slots) {
            Booking b = Booking.builder()
                    .resourceId(req.getResourceId())
                    .userId(user.getId())
                    .startTime(slot[0])
                    .endTime(slot[1])
                    .status(BookingStatus.APPROVED)
                    .purpose(req.getPurpose())
                    .recurringSeriesId(seriesId)
                    .build();
            created.add(toDto(bookingRepository.save(b)));
        }
        log.info("Created {} recurring bookings (series {}) for user {}", created.size(), seriesId, user.getId());
        return created;
    }

    public List<BookingDTO> listMine() {
        User user = requireUser();
        return bookingRepository.findByUserIdOrderByStartTimeDesc(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public BookingDTO getById(String id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User user = requireUser();
        if (!b.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You cannot view this booking");
        }
        return toDto(b);
    }

    @Transactional
    public BookingDTO update(String id, BookingUpdateRequest req) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User user = requireUser();
        if (!b.getUserId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own bookings");
        }
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be edited");
        }
        validateTimeWindow(req.getStartTime(), req.getEndTime());
        ensureActiveResource(b.getResourceId());
        assertNoConflict(b.getResourceId(), req.getStartTime(), req.getEndTime(), id);
        b.setStartTime(req.getStartTime());
        b.setEndTime(req.getEndTime());
        if (req.getPurpose() != null) {
            b.setPurpose(req.getPurpose());
        }
        return toDto(bookingRepository.save(b));
    }

    @Transactional
    public void delete(String id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User user = requireUser();
        if (!b.getUserId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own bookings");
        }
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be deleted");
        }
        bookingRepository.delete(b);
    }

    @Transactional
    public BookingDTO approve(String id) {
        requireAdmin();
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved");
        }
        assertNoConflict(b.getResourceId(), b.getStartTime(), b.getEndTime(), id);
        b.setStatus(BookingStatus.APPROVED);
        b.setRejectionReason(null);
        b.clearRejectReasonLegacy();
        return toDto(bookingRepository.save(b));
    }

    @Transactional
    public BookingDTO reject(String id, String reason) {
        requireAdmin();
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A rejection reason is required");
        }
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }
        b.setStatus(BookingStatus.REJECTED);
        b.setRejectionReason(reason.trim());
        b.clearRejectReasonLegacy();
        return toDto(bookingRepository.save(b));
    }

    @Transactional
    public BookingDTO cancel(String id, ReasonRequest body) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        User user = requireUser();
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (isAdmin) {
            if (body == null || body.getReason() == null || body.getReason().isBlank()) {
                throw new BadRequestException("Administrators must provide a cancellation reason");
            }
            if (b.getStatus() != BookingStatus.PENDING && b.getStatus() != BookingStatus.APPROVED) {
                throw new BadRequestException("Only pending or approved bookings can be cancelled");
            }
        } else {
            if (!b.getUserId().equals(user.getId())) {
                throw new BadRequestException("You can only cancel your own bookings");
            }
            if (b.getStatus() != BookingStatus.PENDING && b.getStatus() != BookingStatus.APPROVED) {
                throw new BadRequestException("Only pending or approved bookings can be cancelled");
            }
        }

        b.setStatus(BookingStatus.CANCELLED);
        if (isAdmin) {
            b.setCancellationReason(body.getReason().trim());
        } else if (body != null && body.getReason() != null && !body.getReason().isBlank()) {
            b.setCancellationReason(body.getReason().trim());
        }
        return toDto(bookingRepository.save(b));
    }

    public List<BookingDTO> listForAdmin(BookingStatus status, String resourceId, String requesterName,
                                          LocalDateTime from, LocalDateTime to) {
        requireAdmin();
        Query q = new Query();
        if (status != null) {
            q.addCriteria(Criteria.where("status").is(status));
        }
        if (resourceId != null && !resourceId.isBlank()) {
            q.addCriteria(Criteria.where("resourceId").is(resourceId));
        }
        if (requesterName != null && !requesterName.isBlank()) {
            String term = requesterName.trim();
            Set<String> userIds = new LinkedHashSet<>();
            userRepository.findByNameContainingIgnoreCase(term).forEach(u -> userIds.add(u.getId()));
            userRepository.findByEmailContainingIgnoreCase(term).forEach(u -> userIds.add(u.getId()));
            userRepository.findById(term).ifPresent(u -> userIds.add(u.getId()));
            if (userIds.isEmpty()) {
                return List.of();
            }
            q.addCriteria(Criteria.where("userId").in(userIds));
        }
        if (from != null) {
            q.addCriteria(Criteria.where("startTime").gte(from));
        }
        if (to != null) {
            q.addCriteria(Criteria.where("startTime").lte(to));
        }
        q.with(Sort.by(Sort.Direction.DESC, "startTime"));
        List<Booking> list = mongoTemplate.find(q, Booking.class);
        return list.stream().map(this::toDto).toList();
    }

    @Transactional
    public List<BookingDTO> bulkApprove(BulkIdsRequest req) {
        requireAdmin();
        List<BookingDTO> out = new ArrayList<>();
        for (String id : req.getIds()) {
            try {
                out.add(approve(id));
            } catch (BadRequestException | ResourceNotFoundException e) {
                log.warn("bulkApprove skip id {}: {}", id, e.getMessage());
            }
        }
        return out;
    }

    @Transactional
    public List<BookingDTO> bulkReject(BulkRejectRequest req) {
        requireAdmin();
        List<BookingDTO> out = new ArrayList<>();
        for (String id : req.getIds()) {
            try {
                out.add(reject(id, req.getReason()));
            } catch (BadRequestException | ResourceNotFoundException e) {
                log.warn("bulkReject skip id {}: {}", id, e.getMessage());
            }
        }
        return out;
    }

    private void assertNoConflict(String resourceId, LocalDateTime start, LocalDateTime end, String excludeId) {
        ConflictCheckResponse c = checkConflict(resourceId, start, end, excludeId);
        if (c.isHasConflict()) {
            throw new BadRequestException("This time slot conflicts with an existing booking");
        }
    }

    private void validateTimeWindow(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BadRequestException("Start and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void ensureActiveResource(String resourceId) {
        Document d = mongoTemplate.findById(resourceId, Document.class, RESOURCES_COLLECTION);
        if (d == null) {
            throw new ResourceNotFoundException("Resource not found");
        }
        ResourceStatus st = ResourceStatus.fromStored(d.getString("status"));
        if (st != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking");
        }
    }

    private User requireUser() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new BadRequestException("Authentication required");
        }
        return user;
    }

    private void requireAdmin() {
        User user = requireUser();
        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException("Administrator access required");
        }
    }

    private BookingDTO toDto(Booking b) {
        BookingDTO dto = BookingDTO.fromEntity(b);
        Document rd = mongoTemplate.findById(b.getResourceId(), Document.class, RESOURCES_COLLECTION);
        if (rd != null) {
            dto.setResourceName(rd.getString("name"));
        }
        userRepository.findById(b.getUserId()).ifPresent(u -> {
            String n = u.getName();
            if (n != null && !n.isBlank()) {
                dto.setUserName(n);
            } else if (u.getEmail() != null && !u.getEmail().isBlank()) {
                dto.setUserName(u.getEmail());
            }
        });
        return dto;
    }
}
