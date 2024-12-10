package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateVisitorRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorListPageDto;
import com.leadonboardingservice.leadonboardingservice.services.VisitorService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("api/v1")
@Slf4j
@SecurityRequirement(name = "los-api")
@AllArgsConstructor
public class VisitorController {
    private final VisitorService visitorService;

    @PostMapping("/visitors")
    @ResponseBody
    GenericResponse<VisitorDetailsDto> createVisitor(@RequestBody @Valid CreateVisitorRequestDto visitorRequestDto) throws Exception {
        VisitorDetailsDto visitor = visitorService.createVisitor(visitorRequestDto);
        return GenericResponse.<VisitorDetailsDto>builder()
                .message("Visitor created successfully")
                .data(visitor)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/visitors/{id}")
    @ResponseBody
    GenericResponse<VisitorDetailsDto> getVisitorDetails(@PathVariable String id) throws Exception {
        VisitorDetailsDto visitor = visitorService.getVisitor(id);
        return GenericResponse.<VisitorDetailsDto>builder()
                .message("Visitor fetched successfully")
                .data(visitor)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/visitors")
    @ResponseBody
    GenericResponse<VisitorListPageDto> getMyVisitors(
            @RequestParam String assignedSalesIamUuid,
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) throws Exception {
        Sort sort = Sort.by(Sort.Direction.DESC, "updatedAt");
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        VisitorListPageDto visitorList = visitorService.getMyVisitors(assignedSalesIamUuid, name, pageable);
        return GenericResponse.<VisitorListPageDto>builder()
                .message("Visitors fetched successfully")
                .data(visitorList)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @PutMapping("/visitors/{id}")
    @ResponseBody
    GenericResponse<VisitorDetailsDto> updateVisitor(@PathVariable String id,  @RequestBody CreateVisitorRequestDto visitorRequestDto) throws Exception {
        VisitorDetailsDto visitor = visitorService.updateVisitor(id, visitorRequestDto);
        return GenericResponse.<VisitorDetailsDto>builder()
                .message("Visitor updated successfully")
                .data(visitor)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}