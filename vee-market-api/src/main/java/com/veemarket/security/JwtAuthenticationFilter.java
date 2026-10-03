package com.veemarket.security;

import com.veemarket.user.User;
import com.veemarket.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        System.out.println("JWT FILTER: " + request.getRequestURI());

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("JWT FILTER: No Bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        System.out.println("JWT FILTER: Token received");

        try {
            String email = jwtService.extractEmail(token);

            System.out.println("JWT FILTER: Email = " + email);

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                System.out.println("JWT FILTER: User not found");
                filterChain.doFilter(request, response);
                return;
            }

            var authority = new SimpleGrantedAuthority(
                    "ROLE_" + user.getRole().name()
            );

            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(authority)
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println("JWT FILTER: AUTHENTICATED");

        } catch (Exception e) {

            System.out.println(
                    "JWT FILTER ERROR: " + e.getMessage()
            );
        }

        filterChain.doFilter(request, response);
    }
}