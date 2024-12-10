package com.leadonboardingservice.leadonboardingservice.config;

import io.jsonwebtoken.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

public class JWTAuthorizationFilter extends OncePerRequestFilter {

    private final String HEADER = "Authorization";
    private final String PREFIX = "Bearer ";
    private final String SECRET = "mySecretKey";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        try {
            if (checkJWTToken(request, response)) {
                Claims claims = validateToken(request);
                if (claims.get("data") != null) {
                    setUpSpringAuthentication(claims,request);
                } else {
                    SecurityContextHolder.clearContext();
                }
            }else {
                SecurityContextHolder.clearContext();
            }
            chain.doFilter(request, response);
        } catch (ExpiredJwtException | UnsupportedJwtException | MalformedJwtException e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            ((HttpServletResponse) response).sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
            return;
        }
    }

    private Claims validateToken(HttpServletRequest request) {
        String jwtToken = request.getHeader(HEADER).replace(PREFIX, "");
        //parsing without claims
        int i = jwtToken.lastIndexOf('.');
        String withoutSignature = jwtToken.substring(0, i+1);
        return Jwts.parser().parseClaimsJwt(withoutSignature).getBody();
    }

    /**
     * Authentication method in Spring flow
     *
     * @param claims
     * @param request
     */
    @SuppressWarnings("unchecked")
    private void setUpSpringAuthentication(Claims claims, HttpServletRequest request) {
        if(claims.get("data") != null) {
            Map<String, Object> map = (Map<String, Object>) claims.get("data");
            map.get("uuid");
            map.put("authorization",request.getHeader(HEADER));
            PreAuthenticatedAuthenticationToken preAuthenticatedAuthenticationToken = new PreAuthenticatedAuthenticationToken(claims.get("data"), null);
            SecurityContextHolder.getContext().setAuthentication(preAuthenticatedAuthenticationToken);
        }
    }

    private boolean checkJWTToken(HttpServletRequest request, HttpServletResponse res) {
        String authenticationHeader = request.getHeader(HEADER);
        if (authenticationHeader == null || !authenticationHeader.startsWith(PREFIX))
            return false;
        return true;
    }

}
