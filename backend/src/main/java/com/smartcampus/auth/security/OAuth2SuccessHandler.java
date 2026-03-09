package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.RefreshTokenRepository;
import com.smartcampus.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handler executed after successful OAuth2 authentication.
 * 
 * Responsibilities:
 * - Generate JWT access token
 * - Generate and store refresh token in database
 * - Set tokens in HttpOnly cookies
 * - Redirect to frontend callback URL
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Long userId = oAuth2User.getAttribute("userId");

        if (userId == null) {
            log.error("User ID not found in OAuth2User attributes");
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication failed");
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 authentication"));

        log.info("OAuth2 authentication successful for user: {}", user.getEmail());

        // Generate access token (JWT)
        String accessToken = jwtTokenProvider.generateAccessToken(user);

        // Generate and store refresh token (UUID in database)
        String refreshToken = generateAndStoreRefreshToken(user);

        // Set cookies
        addTokenCookie(response, "accessToken", accessToken, 15 * 60); // 15 minutes
        addTokenCookie(response, "refreshToken", refreshToken, 7 * 24 * 60 * 60); // 7 days

        // Clear authentication attributes and redirect to frontend
        clearAuthenticationAttributes(request);
        
        log.debug("Redirecting to: {}", redirectUri);
        getRedirectStrategy().sendRedirect(request, response, redirectUri);
    }

    /**
     * Generate a unique refresh token and store it in the database.
     */
    private String generateAndStoreRefreshToken(User user) {
        // Revoke any existing refresh tokens for this user (optional: for single-session)
        // refreshTokenRepository.revokeAllByUser(user);

        String tokenValue = UUID.randomUUID().toString();
        
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .revoked(false)
                .build();
        
        refreshTokenRepository.save(refreshToken);
        
        log.debug("Refresh token generated for user: {}", user.getEmail());
        return tokenValue;
    }

    /**
     * Add a cookie to the response with security settings.
     * 
     * HttpOnly: prevents JavaScript access (XSS protection)
     * Secure: only sent over HTTPS (disabled for localhost development)
     * SameSite: Lax for CSRF protection while allowing OAuth redirects
     */
    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        // Note: SameSite attribute requires manual header setting in older servlet versions
        response.addCookie(cookie);
        
        // Add SameSite=Lax via header for browsers that support it
        String headerValue = String.format("%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", 
                                           name, value, maxAgeSeconds);
        response.addHeader("Set-Cookie", headerValue);
    }
}
