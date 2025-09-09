package org.example.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.server.DTO.CommentCreateDTO;
import org.example.server.DTO.CommentDTO;
import org.example.server.models.Comment;
import org.example.server.models.Request;
import org.example.server.models.User;
import org.example.server.repositories.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final RequestService requestService;
    private final UserService userService;
    
    public CommentService(CommentRepository commentRepository, 
                         RequestService requestService, 
                         UserService userService) {
        this.commentRepository = commentRepository;
        this.requestService = requestService;
        this.userService = userService;
    }
    
    public CommentDTO createComment(CommentCreateDTO commentCreateDTO, String userEmail) {
        Request request = requestService.getRequest(commentCreateDTO.getRequestId());
        if (request == null) {
            throw new IllegalArgumentException("Заявка не найдена");
        }
        
        User user = userService.getUserByEmail(userEmail);
        if (user == null) {
            throw new IllegalArgumentException("Пользователь не найден");
        }
        
        Comment comment = new Comment();
        comment.setText(commentCreateDTO.getText());
        comment.setRequest(request);
        comment.setUser(user);
        comment.setIsSystem(commentCreateDTO.getIsSystem() != null ? commentCreateDTO.getIsSystem() : false);
        
        // Сохраняем детали изменений как JSON строку
        if (commentCreateDTO.getChangeDetails() != null && !commentCreateDTO.getChangeDetails().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                comment.setChangeDetails(mapper.writeValueAsString(commentCreateDTO.getChangeDetails()));
            } catch (Exception e) {
                // Если не удалось сериализовать, сохраняем как простую строку
                comment.setChangeDetails(String.join("; ", commentCreateDTO.getChangeDetails()));
            }
        }
        
        Comment savedComment = commentRepository.save(comment);
        return mapToDTO(savedComment);
    }
    
    public List<CommentDTO> getCommentsByRequestId(Long requestId) {
        List<Comment> comments = commentRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
        return comments.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private CommentDTO mapToDTO(Comment comment) {
        List<String> changeDetails = null;
        if (comment.getChangeDetails() != null && !comment.getChangeDetails().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                changeDetails = mapper.readValue(comment.getChangeDetails(), List.class);
            } catch (Exception e) {
                // Если не удалось десериализовать, разбиваем по разделителю
                changeDetails = Arrays.asList(comment.getChangeDetails().split("; "));
            }
        }
        
        return new CommentDTO(
                comment.getId(),
                comment.getText(),
                comment.getRequest().getId(),
                comment.getUser().getId(),
                comment.getUser().getFirstName() + " " + comment.getUser().getLastName(),
                comment.getUser().getEmail(),
                comment.getCreatedAt(),
                comment.getIsSystem(),
                changeDetails
        );
    }
} 