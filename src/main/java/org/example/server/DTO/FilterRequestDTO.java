package org.example.server.DTO;

import lombok.Data;

@Data
public class FilterRequestDTO {
    private String status;
    private String priority;
    private Long companyId;
    private Long assigneeId;
    private Long creatorId;
    private String date;
} 