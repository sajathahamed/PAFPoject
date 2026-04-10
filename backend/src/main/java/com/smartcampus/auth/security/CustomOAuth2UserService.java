package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom OAuth2 user service that handles user creation and updates
 * after successful OAuth2 authentication with Google.
 * 
 * On first login: creates a new user with default USER role.
 * On subsequent logins: updates lastLoginAt timestamp.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
        String providerId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.debug("OAuth2 login attempt: provider={}, email={}", provider, email);

        // Find existing user or create new one
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(existingUser -> updateExistingUser(existingUser, name, picture))
                .orElseGet(() -> createNewUser(email, name, picture, provider, providerId));

        // Create enhanced attributes map with user entity data
        Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("userId", user.getId());
        attributes.put("dbRole", user.getRole().name());

        // Return OAuth2User with role-based authority
        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                "email"
        );
    }

    /**
     * Update existing user's profile data and last login time.
     */
    private User updateExistingUser(User user, String name, String picture) {
        log.info("Updating existing user: {}", user.getEmail());
        user.setName(name);
        user.setProfilePicture(picture);
        user.updateLastLogin();
        return userRepository.save(user);
    }

    /**
     * Create a new user with default USER role.
     */
    @SuppressWarnings("null")
    private User createNewUser(String email, String name, String picture, 
                               String provider, String providerId) {
        log.info("Creating new user: email={}, provider={}", email, provider);
        
        User newUser = User.builder()
                .email(email)
                .name(name)
                .profilePicture(picture)
                .provider(provider)
                .providerId(providerId)
                .role(Role.STUDENT) // Default role
                .lastLoginAt(LocalDateTime.now())
                .build();
        
        return userRepository.save(newUser);
    }
}
