package org.example.server.controllers;

import org.example.server.DTO.RequestListDTO;
import org.example.server.models.Request;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class HomeController {

    @GetMapping(value = "/")
    public String home(){
        return "index";
    }

}
