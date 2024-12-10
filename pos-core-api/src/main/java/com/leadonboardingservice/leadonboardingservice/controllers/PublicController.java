package com.leadonboardingservice.leadonboardingservice.controllers;

import com.leadonboardingservice.leadonboardingservice.dtos.GenericResponse;
import com.leadonboardingservice.leadonboardingservice.dtos.response.RemarksDto;
import com.leadonboardingservice.leadonboardingservice.mappers.RemarksDtoRemarksMapper;
import com.leadonboardingservice.leadonboardingservice.models.Remarks;
import com.leadonboardingservice.leadonboardingservice.repositories.RemarksRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/v1")
@AllArgsConstructor
@Slf4j
public class PublicController {

    private final RemarksDtoRemarksMapper remarksDtoRemarksMapper;

    private final RemarksRepository remarksRepository;

    @PostMapping("/remarks")
    GenericResponse<RemarksDto> addRemarks(@Valid @RequestBody RemarksDto remarksDto){
        Remarks remarks = remarksDtoRemarksMapper.toEntity(remarksDto);
        Remarks savedRemark = remarksRepository.save(remarks);
        RemarksDto responseDto = remarksDtoRemarksMapper.toDto(savedRemark);
        return GenericResponse.<RemarksDto>builder()
                .message("Remarks added successfully")
                .data(responseDto)
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @GetMapping("/remarks")
    GenericResponse<List<RemarksDto>> fetchRemarksList(@RequestParam("category") String category){
        List<Remarks> remarks = remarksRepository.findByCategory(category);
        List<RemarksDto> remarksDtoList = new ArrayList<>();
        for(Remarks remark : remarks){
            remarksDtoList.add(remarksDtoRemarksMapper.toDto(remark));
        }
        return GenericResponse.<List<RemarksDto>>builder()
                .message("Remarks list fetched successfully")
                .data(remarksDtoList)
                .statusCode(HttpStatus.OK.value())
                .build();
    }
}
