package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.BookingConflictCheckResponse;
import com.smartcampus.auth.dto.BookingCreateRequest;
import com.smartcampus.auth.dto.BookingRejectRequest;
import com.smartcampus.auth.dto.BookingResourceOptionResponse;
import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.dto.RecurringBookingCreateRequest;
import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import com.smartcampus.auth.entity.NotificationType;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.RelatedEntityType;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.ConflictException;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.BookingRepository;
import com.smartcampus.auth.repository.ResourceRepository;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Set<BookingStatus> ACTIVE_STATUSES = Set.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public BookingConflictCheckResponse checkConflict(String resourceId, LocalDateTime start, LocalDateTime end) {
        validateTimeRange(start, end);
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        ACTIVE_STATUSES,
                        end,
                        start
                );
        return BookingConflictCheckResponse.builder()
                .conflict(!conflicts.isEmpty())
                .conflictingBookingIds(conflicts.stream().map(Booking::getId).collect(Collectors.toList()))
                .build();
    }

    public BookingResponse createBooking(String userId, BookingCreateRequest request) {
        validateTimeRange(request.getStartTime(), request.getEndTime());
        if (isConflict(request.getResourceId(), request.getStartTime(), request.getEndTime())) {
            throw new ConflictException("Booking conflicts with an existing booking");
        }

        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .userId(userId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(trimOrNull(request.getPurpose()))
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        notifyAdminsNewPending(saved);
        return toResponse(saved);
    }

    public List<BookingResponse> listMyBookings(String userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return toResponses(bookings);
    }

    public BookingResponse getBookingForViewer(String bookingId, String viewerId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!isAdmin && (booking.getUserId() == null || !booking.getUserId().equals(viewerId))) {
            throw new AccessDeniedException("You can only view your own bookings");
        }
        return toResponse(booking);
    }

    public List<BookingResponse> adminListBookings(BookingStatus status) {
        return adminListBookings(status, null, null);
    }

    public List<BookingResponse> adminListBookings(BookingStatus status, String userQuery, String resourceQuery) {
        List<Booking> bookings = status != null ? bookingRepository.findByStatus(status) : bookingRepository.findAll();
        List<BookingResponse> responses = toResponses(bookings);
        String uq = normalize(userQuery);
        String rq = normalize(resourceQuery);
        return responses.stream()
                .filter(b -> uq == null || containsIgnoreCase(b.getUserName(), uq) || containsIgnoreCase(b.getUserId(), uq))
                .filter(b -> rq == null || containsIgnoreCase(b.getResourceName(), rq) || containsIgnoreCase(b.getResourceId(), rq))
                .collect(Collectors.toList());
    }

    public List<BookingResourceOptionResponse> listResourceOptions() {
        return resourceRepository.findAllResourceOptions().stream()
                .map(r -> BookingResourceOptionResponse.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .location(r.getLocation())
                        .build())
                .collect(Collectors.toList());
    }

    public BookingResponse approve(String bookingId, String adminUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be approved");
        }
        if (isConflictExcludingBooking(booking.getResourceId(), booking.getStartTime(), booking.getEndTime(), booking.getId())) {
            throw new ConflictException("Booking now conflicts with an existing booking");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setDecisionBy(adminUserId);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setRejectionReason(null);
        Booking saved = bookingRepository.save(booking);

        notifyStatus(saved, BookingStatus.APPROVED, "Your booking request has been approved.");
        return toResponse(saved);
    }

    public BookingResponse reject(String bookingId, String adminUserId, BookingRejectRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setDecisionBy(adminUserId);
        booking.setRejectedAt(LocalDateTime.now());
        booking.setRejectionReason(trimOrNull(request.getReason()));
        Booking saved = bookingRepository.save(booking);

        notifyStatus(saved, BookingStatus.REJECTED, "Your booking request has been rejected.");
        return toResponse(saved);
    }

    public BookingResponse cancel(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getUserId() == null || !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Only APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        notifyAdminsBookingCancelled(saved);
        return toResponse(saved);
    }

    public List<BookingResponse> createRecurringAutoApproved(String lecturerId, RecurringBookingCreateRequest request) {
        List<LocalDateTime[]> slots = buildRecurringSlots(request);

        for (LocalDateTime[] slot : slots) {
            if (isConflict(request.getResourceId(), slot[0], slot[1])) {
                throw new ConflictException("Recurring booking conflicts with an existing booking");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        List<Booking> created = slots.stream()
                .map(slot -> Booking.builder()
                        .resourceId(request.getResourceId())
                        .userId(lecturerId)
                        .startTime(slot[0])
                        .endTime(slot[1])
                        .purpose(trimOrNull(request.getPurpose()))
                        .status(BookingStatus.APPROVED)
                        .decisionBy(lecturerId)
                        .approvedAt(now)
                        .build())
                .collect(Collectors.toList());

        List<Booking> saved = bookingRepository.saveAll(created);
        return toResponses(saved);
    }

    private boolean isConflict(String resourceId, LocalDateTime start, LocalDateTime end) {
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        resourceId,
                        ACTIVE_STATUSES,
                        end,
                        start
                );
        return !conflicts.isEmpty();
    }

    private boolean isConflictExcludingBooking(String resourceId, LocalDateTime start, LocalDateTime end, String excludedBookingId) {
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                        resourceId,
                        ACTIVE_STATUSES,
                        end,
                        start,
                        excludedBookingId
                );
        return !conflicts.isEmpty();
    }

    private static void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void notifyStatus(Booking booking, BookingStatus status, String message) {
        String ownerId = booking.getUserId();
        if (ownerId == null) return;

        if (status == BookingStatus.APPROVED) {
            notificationService.createNotification(
                    ownerId,
                    NotificationType.BOOKING_APPROVED,
                    "Booking approved",
                    message,
                    booking.getId(),
                    RelatedEntityType.BOOKING
            );
        } else if (status == BookingStatus.REJECTED) {
            notificationService.createNotification(
                    ownerId,
                    NotificationType.BOOKING_REJECTED,
                    "Booking rejected",
                    message,
                    booking.getId(),
                    RelatedEntityType.BOOKING
            );
        }
    }

    private void notifyAdminsNewPending(Booking booking) {
        String userName = userRepository.findById(booking.getUserId()).map(User::getName).orElse("A user");
        String resourceName = resolveResourceName(booking.getResourceId());
        String message = userName + " requested booking for " + resourceName + ".";
        notifyAllAdmins(
                "New booking pending approval",
                message,
                booking.getId()
        );
    }

    private void notifyAdminsBookingCancelled(Booking booking) {
        String userName = userRepository.findById(booking.getUserId()).map(User::getName).orElse("A user");
        String resourceName = resolveResourceName(booking.getResourceId());
        String message = userName + " cancelled booking for " + resourceName + ".";
        notifyAllAdmins(
                "Booking cancelled",
                message,
                booking.getId()
        );
    }

    private void notifyAllAdmins(String title, String message, String bookingId) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            if (admin == null || admin.getId() == null) continue;
            notificationService.createNotification(
                    admin.getId(),
                    NotificationType.BOOKING_UPDATE,
                    title,
                    message,
                    bookingId,
                    RelatedEntityType.BOOKING
            );
        }
    }

    private String resolveResourceName(String resourceId) {
        if (resourceId == null || resourceId.isBlank()) return "resource";
        return resourceRepository.findResourceNamesByIdIn(List.of(resourceId)).stream()
                .findFirst()
                .map(ResourceRepository.ResourceNameView::getName)
                .filter(v -> v != null && !v.isBlank())
                .orElse(resourceId);
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isBlank() ? null : t;
    }

    private static String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed.toLowerCase();
    }

    private static boolean containsIgnoreCase(String source, String needle) {
        if (source == null || needle == null) return false;
        return source.toLowerCase().contains(needle);
    }

    private List<LocalDateTime[]> buildRecurringSlots(RecurringBookingCreateRequest request) {
        if (hasWeekdayRecurrence(request)) {
            return buildWeekdaySlots(request);
        }
        if (hasAnyWeekdayRecurrenceField(request)) {
            throw new IllegalArgumentException(
                    "Recurring weekday booking requires startDate, endDate, slotStartTime, slotEndTime, and at least one day"
            );
        }
        validateTimeRange(request.getStartTime(), request.getEndTime());
        if (request.getOccurrences() < 1) {
            throw new IllegalArgumentException("Occurrences must be at least 1");
        }
        if (request.getIntervalDays() < 1) {
            throw new IllegalArgumentException("Interval days must be at least 1");
        }
        List<LocalDateTime[]> slots = new ArrayList<>();
        for (int i = 0; i < request.getOccurrences(); i++) {
            slots.add(new LocalDateTime[]{
                    request.getStartTime().plusDays((long) i * request.getIntervalDays()),
                    request.getEndTime().plusDays((long) i * request.getIntervalDays())
            });
        }
        return slots;
    }

    private boolean hasWeekdayRecurrence(RecurringBookingCreateRequest request) {
        return request.getStartDate() != null
                && request.getEndDate() != null
                && request.getSlotStartTime() != null
                && request.getSlotEndTime() != null
                && request.getDaysOfWeek() != null
                && !request.getDaysOfWeek().isEmpty();
    }

    private boolean hasAnyWeekdayRecurrenceField(RecurringBookingCreateRequest request) {
        return request.getStartDate() != null
                || request.getEndDate() != null
                || request.getSlotStartTime() != null
                || request.getSlotEndTime() != null
                || (request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty());
    }

    private List<LocalDateTime[]> buildWeekdaySlots(RecurringBookingCreateRequest request) {
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();
        LocalTime slotStart = request.getSlotStartTime();
        LocalTime slotEnd = request.getSlotEndTime();
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be on or after start date");
        }
        if (!slotEnd.isAfter(slotStart)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        Set<DayOfWeek> selectedDays = request.getDaysOfWeek().stream()
                .map(this::toDayOfWeek)
                .collect(Collectors.toSet());
        if (selectedDays.isEmpty()) {
            throw new IllegalArgumentException("Select at least one day of week");
        }
        List<LocalDateTime[]> slots = new ArrayList<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            if (selectedDays.contains(cursor.getDayOfWeek())) {
                slots.add(new LocalDateTime[]{
                        LocalDateTime.of(cursor, slotStart),
                        LocalDateTime.of(cursor, slotEnd)
                });
            }
            cursor = cursor.plusDays(1);
        }
        if (slots.isEmpty()) {
            throw new IllegalArgumentException("No dates match the selected weekday pattern");
        }
        return slots;
    }

    private DayOfWeek toDayOfWeek(Integer value) {
        if (value == null || value < 0 || value > 6) {
            throw new IllegalArgumentException("Day of week must be between 0 and 6");
        }
        int javaDay = value == 0 ? 7 : value;
        return DayOfWeek.of(javaDay);
    }

    private BookingResponse toResponse(Booking b) {
        String userName = null;
        if (b.getUserId() != null) {
            userName = userRepository.findById(b.getUserId()).map(User::getName).orElse(null);
        }
        String resourceName = null;
        if (b.getResourceId() != null) {
            resourceName = resourceRepository.findResourceNamesByIdIn(List.of(b.getResourceId())).stream()
                    .findFirst()
                    .map(ResourceRepository.ResourceNameView::getName)
                    .orElse(null);
        }
        return BookingResponse.fromEntity(b, userName, resourceName);
    }

    private List<BookingResponse> toResponses(List<Booking> bookings) {
        Set<String> userIds = bookings.stream().map(Booking::getUserId).filter(id -> id != null && !id.isBlank()).collect(Collectors.toSet());
        Set<String> resourceIds = bookings.stream().map(Booking::getResourceId).filter(id -> id != null && !id.isBlank()).collect(Collectors.toSet());

        Map<String, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName, (a, c) -> a));
        Map<String, String> resourceNames = resourceRepository.findResourceNamesByIdIn(resourceIds).stream()
                .collect(Collectors.toMap(ResourceRepository.ResourceNameView::getId, ResourceRepository.ResourceNameView::getName, (a, c) -> a));

        return bookings.stream()
                .map(b -> BookingResponse.fromEntity(
                        b,
                        userNames.get(b.getUserId()),
                        resourceNames.get(b.getResourceId())
                ))
                .collect(Collectors.toList());
    }
}

