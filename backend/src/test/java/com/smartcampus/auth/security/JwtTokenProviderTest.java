package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtTokenProvider.
 * 
 * Tests cover:
 * - Token generation with correct claims
 * - Token validation (valid, expired, malformed)
 * - Claim extraction (userId, email, role, name)
 */
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private User testUser;

    // Test secret key (> 256 bits for HS256)
    private static final String TEST_SECRET = "testSecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256Algorithm";
    private static final long ACCESS_TOKEN_EXPIRATION = 900000L; // 15 minutes

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(TEST_SECRET, ACCESS_TOKEN_EXPIRATION);
        
        testUser = User.builder()
                .id(1L)
                .email("test@smartcampus.edu")
                .name("Test User")
                .role(Role.USER)
                .provider("GOOGLE")
                .providerId("google-123")
                .build();
    }

    @Test
    @DisplayName("Should generate valid access token with correct claims")
    void generateAccessToken_ShouldContainCorrectClaims() {
        // Act
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        
        // Verify claims can be extracted
        assertEquals(1L, jwtTokenProvider.extractUserId(token));
        assertEquals("test@smartcampus.edu", jwtTokenProvider.extractEmail(token));
        assertEquals(Role.USER, jwtTokenProvider.extractRole(token));
        assertEquals("Test User", jwtTokenProvider.extractName(token));
    }

    @Test
    @DisplayName("Should validate a valid token")
    void validateToken_WithValidToken_ShouldReturnTrue() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should reject malformed token")
    void validateToken_WithMalformedToken_ShouldReturnFalse() {
        // Arrange
        String malformedToken = "not.a.valid.jwt.token";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject empty token")
    void validateToken_WithEmptyToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken("");

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject null token")
    void validateToken_WithNullToken_ShouldReturnFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject token with invalid signature")
    void validateToken_WithInvalidSignature_ShouldReturnFalse() {
        // Arrange - Generate token with different secret
        JwtTokenProvider differentProvider = new JwtTokenProvider(
                "differentSecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForHS256", 
                ACCESS_TOKEN_EXPIRATION
        );
        String tokenWithDifferentSignature = differentProvider.generateAccessToken(testUser);

        // Act - Validate with original provider
        boolean isValid = jwtTokenProvider.validateToken(tokenWithDifferentSignature);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should extract correct user ID from token")
    void extractUserId_ShouldReturnCorrectId() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        Long userId = jwtTokenProvider.extractUserId(token);

        // Assert
        assertEquals(1L, userId);
    }

    @Test
    @DisplayName("Should extract correct email from token")
    void extractEmail_ShouldReturnCorrectEmail() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        String email = jwtTokenProvider.extractEmail(token);

        // Assert
        assertEquals("test@smartcampus.edu", email);
    }

    @Test
    @DisplayName("Should extract correct role from token")
    void extractRole_ShouldReturnCorrectRole() {
        // Arrange
        testUser.setRole(Role.ADMIN);
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        Role role = jwtTokenProvider.extractRole(token);

        // Assert
        assertEquals(Role.ADMIN, role);
    }

    @Test
    @DisplayName("Should correctly identify non-expired token")
    void isTokenExpired_WithValidToken_ShouldReturnFalse() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        boolean isExpired = jwtTokenProvider.isTokenExpired(token);

        // Assert
        assertFalse(isExpired);
    }

    @Test
    @DisplayName("Should correctly identify expired token")
    void isTokenExpired_WithExpiredToken_ShouldReturnTrue() {
        // Arrange - Create provider with 0ms expiration
        JwtTokenProvider expiredProvider = new JwtTokenProvider(TEST_SECRET, 0L);
        String token = expiredProvider.generateAccessToken(testUser);

        // Act
        boolean isExpired = jwtTokenProvider.isTokenExpired(token);

        // Assert
        assertTrue(isExpired);
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void generateAccessToken_ForDifferentUsers_ShouldGenerateDifferentTokens() {
        // Arrange
        User anotherUser = User.builder()
                .id(2L)
                .email("another@smartcampus.edu")
                .name("Another User")
                .role(Role.TECHNICIAN)
                .provider("GOOGLE")
                .providerId("google-456")
                .build();

        // Act
        String token1 = jwtTokenProvider.generateAccessToken(testUser);
        String token2 = jwtTokenProvider.generateAccessToken(anotherUser);

        // Assert
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Token should have valid expiration date")
    void getExpirationDate_ShouldReturnFutureDate() {
        // Arrange
        String token = jwtTokenProvider.generateAccessToken(testUser);

        // Act
        java.util.Date expirationDate = jwtTokenProvider.getExpirationDate(token);

        // Assert
        assertNotNull(expirationDate);
        assertTrue(expirationDate.after(new java.util.Date()));
    }
}
