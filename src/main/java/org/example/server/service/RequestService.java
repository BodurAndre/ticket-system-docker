package org.example.server.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.RequestUpdateDTO;
import org.example.server.models.Request;
import org.example.server.models.User;
import org.example.server.repositories.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RequestService {
    private final RequestRepository requestRepository;

    @Autowired
    public RequestService(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    /*NEW VERSION*/

    public List<Request> getAllRequests() {
        List<Request> requests = requestRepository.findAll();
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    public List<Request> getRequestsByCreatorEmail(String email) {
        List<Request> requests = requestRepository.findByCreateUser_Email(email);
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    /*NEW VERSION*/

    public List<Request> getAllRequestsWithStatusOpen() {
        List<Request> requests = requestRepository.findByStatus("OPEN");
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    public List<Request> getAllRequestsWithStatusClose() {
        List<Request> requests = requestRepository.findByStatus("CLOSED");
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    public Request setRequest(Request request) {
        return requestRepository.save(request);
    }

    public Request saveRequest(Request request) {
        return requestRepository.save(request);
    }

    public Request getRequest(long id) {
        // Используйте Optional для безопасного получения данных
        return requestRepository.findById(id)
                .orElse(new Request()); // Возвращает пустой объект Request, если не найдено
    }

    public void closeRequest(long id) {
        // Находим заявку по ID
        Optional<Request> optionalRequest = requestRepository.findById(id);

        if (optionalRequest.isPresent()) {
            // Если заявка найдена, обновляем статус
            Request request = optionalRequest.get();
            request.setStatus("CLOSED");
            requestRepository.save(request);  // Сохраняем обновленный объект
        } else {
            throw new EntityNotFoundException("Request not found with id " + id);
        }
    }

    public void reopenRequest(long id) {
        // Находим заявку по ID
        Optional<Request> optionalRequest = requestRepository.findById(id);

        if (optionalRequest.isPresent()) {
            // Если заявка найдена, обновляем статус
            Request request = optionalRequest.get();
            request.setStatus("OPEN");
            requestRepository.save(request);  // Сохраняем обновленный объект
        } else {
            throw new EntityNotFoundException("Request not found with id " + id);
        }
    }

    public List<Request> getOpenRequestsByCreatorEmail(String email) {
        List<Request> requests = requestRepository.findByStatusAndCreateUser_Email("OPEN", email);
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    public List<Request> getCloseRequestsByCreatorEmail(String email) {
        List<Request> requests =  requestRepository.findByStatusAndCreateUser_Email("CLOSED", email);
        return requests.isEmpty() ? new ArrayList<>() : requests;
    }

    public List<Request> filterRequests(String status, String priority, Long companyId, Long assigneeId, Long creatorId, String date) {
        // Обработка относительных дат
        String processedDate = null;
        if (date != null && !date.equals("ALL")) {
            LocalDate today = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            
            switch (date) {
                case "TODAY":
                    processedDate = today.format(formatter);
                    break;
                case "YESTERDAY":
                    processedDate = today.minusDays(1).format(formatter);
                    break;
                case "WEEK":
                    // Для недели пока не фильтруем по дате, возвращаем все
                    processedDate = null;
                    break;
                case "MONTH":
                    // Для месяца пока не фильтруем по дате, возвращаем все
                    processedDate = null;
                    break;
                default:
                    // Если это конкретная дата в формате dd.MM.yyyy, используем как есть
                    processedDate = date;
                    break;
            }
        }
        
        return requestRepository.filterRequests(
            status != null && !status.equals("ALL") ? status : null,
            priority != null && !priority.equals("ALL") ? priority : null,
            companyId != null && companyId != -1 ? companyId : null,
            assigneeId != null && assigneeId != -1 ? assigneeId : null,
            creatorId != null && creatorId != -1 ? creatorId : null,
            processedDate
        );
    }
}
