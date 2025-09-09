package org.example.server.DTO;

import lombok.Data;

@Data
public class RequestUpdateDTO {
    private String tema;
    private String priority;
    private String description;
    private Long userId;
    private Long requestId;
    private Long companyId;
    private Long serverId;
    private String contacts;
    private Long assigneeUserId;
}
