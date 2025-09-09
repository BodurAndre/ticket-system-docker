package org.example.server.repositories;

import org.example.server.models.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request,Long> {

    Optional<Request> findById(Long id);
    List<Request> findByStatus(String status);
    List<Request> findByStatusAndCreateUser_Email(String status, String email);
    List<Request> findByCreateUser_Email(String email);

    @Query("SELECT r FROM Request r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:priority IS NULL OR r.priority = :priority) AND " +
            "(:companyId IS NULL OR r.company.id = :companyId) AND " +
            "(:assigneeId IS NULL OR r.assigneeUser.id = :assigneeId) AND " +
            "(:creatorId IS NULL OR r.createUser.id = :creatorId) AND " +
            "(:date IS NULL OR r.data = :date)")
    List<Request> filterRequests(@Param("status") String status,
                                @Param("priority") String priority,
                                @Param("companyId") Long companyId,
                                @Param("assigneeId") Long assigneeId,
                                @Param("creatorId") Long creatorId,
                                @Param("date") String date);
}
