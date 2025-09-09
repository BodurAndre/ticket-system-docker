package org.example.server.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
@Slf4j
public class CSRFController {
    @GetMapping("/csrf-token")
    public @ResponseBody Map<String, String> getCsrfToken(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        Map<String, String> response = new HashMap<>();
        response.put("headerName", token.getHeaderName());
        response.put("token", token.getToken());
        return response;
    }
}
