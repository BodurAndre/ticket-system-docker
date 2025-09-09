package org.example.server.repositories;

import org.example.server.models.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {
    List<Server> findAll();
    List<Server> findByCompanyId(Long companyId);
} 