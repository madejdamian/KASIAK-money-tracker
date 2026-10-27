package com.github.rodis00.backend.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String SECRET_KEY;

    @Value("${application.security.jwt.jwt-expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.jwt-refresh-expiration}")
    private long refreshTokenExpiration;

    private final String cookiePath = "/expense-tracker/api/v1/auth/refresh-token";

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", TokenType.ACCESS);

        return buildToken(claims, username, jwtExpiration);
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", TokenType.REFRESH);

        return buildToken(claims, username, refreshTokenExpiration);
    }

    private String buildToken(
            Map<String, Object> claims,
            String username,
            long expiration
    ) {
        return Jwts.builder()
                .claims()
                .add(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .and()
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean isTokenValid(
            String token,
            UserDetails userDetails
    ) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isRefreshToken(String token) {
        String tokenType = extractClaim(token, claims -> claims.get("typ").toString());
        return tokenType.equals(TokenType.REFRESH.toString());
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Cookie createCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setSecure(true);
        cookie.setHttpOnly(true);
        // cookie is added only to the refresh token endpoint (cookiePath)
        cookie.setPath(cookiePath);
        int cookieMaxAge = (int) (refreshTokenExpiration / 1000);
        cookie.setMaxAge(cookieMaxAge);
        return cookie;
    }
}
