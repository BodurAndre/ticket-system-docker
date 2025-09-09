package org.example.server.DTO;

import lombok.Data;

@Data
public class RequestListDTO {
    private Long id;
    private String data;
    private String time;
    private String tema;
    private CompanyListDTO company;
    private ServerListDTO server;
    private String contacts;
    private UserListDTO createUser;
    private UserListDTO assigneeUser;
    private UserListDTO closedByUser;
    private String status;
    private String priority;
    private String description;

    @Data
    public static class UserListDTO {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
    }

    @Data
    public static class CompanyListDTO {
        private Long id;
        private String name;
    }

    @Data
    public static class ServerListDTO {
        private Long id;
        private String name;
    }
}
