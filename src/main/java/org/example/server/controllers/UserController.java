package org.example.server.controllers;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.RequestUpdateDTO;
import org.example.server.DTO.UserCreateDTO;
import org.example.server.DTO.UserDTO;
import org.example.server.DTO.UserUpdateDTO;
import org.example.server.models.Request;
import org.example.server.models.User;
import org.example.server.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@Slf4j
public class UserController {

    private final UserService userService;

    public UserController(final UserService userService) {
        this.userService = userService;
    }

    @GetMapping(value = "/getUsers", produces = "application/json")
    @ResponseBody
    public List<User> getAllUsers() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userService.getAllUsersWithoutCurrentUser(username);
    }

    @GetMapping(value = "/api/users", produces = "application/json")
    @ResponseBody
    public List<User> getApiUsers() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userService.getAllUsersWithoutCurrentUser(username);
    }

    @GetMapping(value = "/api/users/all", produces = "application/json")
    @ResponseBody
    public List<User> getAllUsersForFilters() {
        return userService.getAllUsers();
    }

    @GetMapping(value = "/getUser/{id}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getRequest(@PathVariable long id) {
        User user = userService.getUser(id);

        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Не найден пользователь");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping(value = "/getCurrentUser", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        User user = userService.getUserByEmail(username);

        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Не найден пользователь");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping(value = "/getDTOUser", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getDTOUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Недостаточно прав для доступа");
        }

        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        List<User> users = userService.getAllUsersWithoutCurrentUserAndUser(username);

        List<UserDTO> userDTO = users.stream()
                .map(user -> new UserDTO(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName()))
                .collect(Collectors.toList());
        log.warn("Пользователи" + userDTO);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping(value = "/users", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getAllUsersForStatistics() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error getting users for statistics: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при получении списка пользователей\"}");
        }
    }

    @PostMapping("/updateUser")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateDTO userUpdateDTO) {
        try {
            log.warn("userUpdateDTO - " + userUpdateDTO);
            userService.updateUser(userUpdateDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("{\"message\": \"Данные пользователя обновлены\"}");
        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при обновлении данных пользователя\"}");
        }
    }

    @PostMapping("/createUser")
    public ResponseEntity<?> createUser(@RequestBody UserCreateDTO userCreateDTO) {
        try {
            log.warn("userCreateDTO - " + userCreateDTO);

            String generatedPassword = generatePassword(8);
            String email = userCreateDTO.getEmail();
            userService.createUser(userCreateDTO, generatedPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Пользователь успешно создан");
            response.put("email", email);
            response.put("password", generatedPassword);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Ошибка при создании пользователя: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", e.getMessage()));

        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Ошибка при создании пользователя"));
        }
    }

    @PostMapping("/resetPasswordUser")
    public ResponseEntity<?> resetPasswordUser(@RequestBody String email,
                                               @RequestParam Long id) {
        try {
            log.warn("Email - " + email);
            log.warn("id - " + id);
            String generatedPassword = generatePassword(8);

            userService.resetPasswordUser(id, generatedPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Пароль успешно сброшен");
            response.put("email", email);
            response.put("password", generatedPassword);
            log.warn("Password - " + generatedPassword);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Ошибка при создании пользователя: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", e.getMessage()));

        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Ошибка при создании пользователя"));
        }
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("{\"message\": \"Пользователь успешно удален\"}");
        } catch (Exception e) {
            log.error("Ошибка при удалении пользователя: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при удалении пользователя\"}");
        }
    }

    private String generatePassword(int length) {
        String charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(charSet.length());
            password.append(charSet.charAt(index));
        }

        return password.toString();
    }
}
