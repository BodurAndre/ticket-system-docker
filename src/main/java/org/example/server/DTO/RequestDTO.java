package org.example.server.DTO;

import lombok.Data;

@Data
public class RequestDTO {
    private String data;
    private String time;
    private String tema;
    private String status;
    private String priority;
    private String description;
    private Long companyId;
    private Long serverId;
    private Long assigneeUserId;
    private String contacts;
}
