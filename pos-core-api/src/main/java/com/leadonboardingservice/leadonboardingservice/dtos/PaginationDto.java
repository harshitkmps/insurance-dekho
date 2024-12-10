package com.leadonboardingservice.leadonboardingservice.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaginationDto {

    private Integer count;
    private Integer pageSize;
    private boolean hasNext;
    private String currentPageFirstRow;
    private String currentPageLastRow;
}
