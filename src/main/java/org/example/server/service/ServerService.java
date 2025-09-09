package org.example.server.service;

import org.example.server.models.Server;
import org.example.server.repositories.ServerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServerService {
    private final ServerRepository serverRepository;

    @Autowired
    public ServerService(ServerRepository serverRepository) {
        this.serverRepository = serverRepository;
    }

    public List<Server> getAllServers() {
        return serverRepository.findAll();
    }

    public List<Server> getServersByCompanyId(Long companyId) {
        return serverRepository.findByCompanyId(companyId);
    }

    public Server getServerById(Long id) {
        return serverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Сервер с id=" + id + " не найден"));
    }

    public Server saveServer(Server server) {
        return serverRepository.save(server);
    }
} 