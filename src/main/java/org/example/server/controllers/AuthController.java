package org.example.server.controllers;

import jakarta.servlet.http.HttpServletResponse;
import org.example.server.models.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.example.server.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("")
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @RequestMapping(value = "/register",method = RequestMethod.GET)
    public String register(Model model){
        User user = new User();
        model.addAttribute("user",user);
        return "register";
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public String createNewUser(HttpServletRequest request, @ModelAttribute("user") User user, RedirectAttributes redirectAttributes) {
        try {
            String rawPassword = user.getPassword();
            user.setRole("USER");

            User newUser = userService.registerNewUser(user);
            if (newUser == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Ошибка: Не удалось создать пользователя.");
                return "redirect:/register";
            }
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user.getEmail(), rawPassword);

            Authentication authentication = authenticationManager.authenticate(authToken);

            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

            return "redirect:/";

        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Ошибка: " + e.getMessage());
            return "redirect:/register";
        }
    }

    @RequestMapping(value = "/login",method = RequestMethod.GET)
    public String login(){
        return "login";
    }

    @RequestMapping(value = "/logout",method = RequestMethod.GET)
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession();
        session.invalidate();
        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(null);
        return "redirect:/login";
    }

    @GetMapping("/success-login")
    public String successLoginPage(@RequestParam("role") String role, Model model) {
        model.addAttribute("role", role);
        return "success-login";
    }
}