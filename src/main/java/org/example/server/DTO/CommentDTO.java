package org.example.server.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String text;
    private Long requestId;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    private Boolean isSystem;
    private List<String> changeDetails;
} 