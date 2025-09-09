package org.example.server.controllers;

import org.example.server.DTO.CommentCreateDTO;
import org.example.server.DTO.CommentDTO;
import org.example.server.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class CommentController {
    
    private final CommentService commentService;
    
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }
    
    @PostMapping("/api/comments")
    @ResponseBody
    public ResponseEntity<?> createComment(@RequestBody CommentCreateDTO commentCreateDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            CommentDTO comment = commentService.createComment(commentCreateDTO, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при создании комментария\"}");
        }
    }
    
    @GetMapping("/api/comments/{requestId}")
    @ResponseBody
    public ResponseEntity<?> getCommentsByRequestId(@PathVariable Long requestId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsByRequestId(requestId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при получении комментариев\"}");
        }
    }
} 