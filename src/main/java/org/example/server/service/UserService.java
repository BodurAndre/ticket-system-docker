package org.example.server.service;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.UserCreateDTO;
import org.example.server.DTO.UserUpdateDTO;
import org.example.server.models.Request;
import org.example.server.models.User;
import org.example.server.repositories.UserRepository;
import org.springframework.stereotype.Service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerNewUser(User user){
        if (userRepository.findUserByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("Пользователь с таким именем уже существует.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User newUser = userRepository.save(user);
        userRepository.flush();
        return newUser;
    }

    public void createUser(UserCreateDTO userCreateDTO, String password){
        if (userRepository.findUserByEmail(userCreateDTO.getEmail()) != null) {
            throw new IllegalArgumentException("Пользователь с таким Email уже существует.");
        }
        User user = new User();
        user.setEmail(userCreateDTO.getEmail());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(userCreateDTO.getFirstName());
        user.setLastName(userCreateDTO.getLastName());
        user.setGender(userCreateDTO.getGender());
        user.setDateOfBirth(userCreateDTO.getDateOfBirth());
        user.setRole(userCreateDTO.getRole());
        user.setFirstLogin(true);
        userRepository.save(user);
        userRepository.flush();
    }

    public List<User> getAllUsersWithoutCurrentUser(String username) {
        List<User> users = userRepository.findAllByEmailNot(username);
        return users.isEmpty() ? new ArrayList<>() : users;
    }

    public List<User> getAllUsersWithoutCurrentUserAndUser(String username) {
        List<User> users = userRepository.findAllByEmailNotAndRoleNot(username,"USER");
        return users.isEmpty() ? new ArrayList<>() : users;
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь с id=" + id + " не найден"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public void updateUser(UserUpdateDTO userUpdateDTO) {
        User user = getUser(userUpdateDTO.getUserId());
        user.setEmail(userUpdateDTO.getEmail());
        user.setFirstName(userUpdateDTO.getFirstName());
        user.setLastName(userUpdateDTO.getLastName());
        user.setRole(userUpdateDTO.getRole());
        user.setDateOfBirth(userUpdateDTO.getDateOfBirth());
        user.setGender(userUpdateDTO.getGender());
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUser(id);
        userRepository.delete(user);
    }

    public void resetPasswordUser(Long id, String generatedPassword) {
        User user = getUser(id);
        user.setPassword(passwordEncoder.encode(generatedPassword));
        userRepository.save(user);
    }

    public long countUsers() {
        return userRepository.count();
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.isEmpty() ? new ArrayList<>() : users;
    }
}