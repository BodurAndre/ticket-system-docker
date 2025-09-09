package org.example.server.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "tikets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "data")
    private String data;

    @Column(name = "time")
    private String time;

    @Column(name = "tema")
    private String tema;

    @ManyToOne
    @JoinColumn(name = "company_id") // внешний ключ в таблице tikets
    private Company company;

    @ManyToOne
    @JoinColumn(name = "server_id") // внешний ключ для сервера
    private Server server;

    @Column(name = "contacts")
    private String contacts;

    @ManyToOne
    @JoinColumn(name = "create_user_id") // внешний ключ в таблице tikets
    private User createUser;

    @ManyToOne
    @JoinColumn(name = "assignee_user_id") // внешний ключ для исполнителя заявки
    private User assigneeUser;

    @ManyToOne
    @JoinColumn(name = "closed_by_user_id") // внешний ключ для пользователя, закрывшего заявку
    private User closedByUser;

    @Column(name = "status")
    private String status;

    @Column(name = "priority")
    private String priority;

    @Column(name = "description")
    private String description;
}
