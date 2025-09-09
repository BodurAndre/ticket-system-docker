package org.example.server.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateDTO {
    private String text;
    private Long requestId;
    private Boolean isSystem = false;
    private List<String> changeDetails;
} 