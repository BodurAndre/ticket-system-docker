package org.example.server.repositories;

import org.example.server.models.Request;
import org.example.server.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    @Query("SELECT u FROM User u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    User findUserByEmail(@Param("email") String email);
    List<User> findAllByEmailNotAndRoleNot(String email, String role);
    List<User> findAllByEmailNot(String email);
    User findByEmail(String email);
}
