package org.example.server.configurations;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

public class AuthenticationSuccessHandler {
    @Component
    // Сделаем CustomAuthSuccessHandler статическим
    public static class CustomAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                            Authentication authentication) throws IOException {
            // Получаем роль пользователя
            String role = authentication.getAuthorities().iterator().next().getAuthority();

            // Перенаправляем на success-login с параметром роли
            response.sendRedirect("/success-login?role=" + role);
        }
    }
}