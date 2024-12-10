package com.leadonboardingservice.leadonboardingservice.controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api")
@AllArgsConstructor
public class Index {

    @GetMapping("/serverHealth")
    String serverHealth() {
        return HttpStatus.OK.getReasonPhrase();
    }
}
