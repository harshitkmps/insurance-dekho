package com.leadonboardingservice.leadonboardingservice.dtos.response;

import lombok.*;

import java.util.List;
@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitorListPageDto {
    private List<VisitorDetailsDto> data;
    private int currentPageNumber;
    private boolean hasNext;
    private int nextPageNumber;
}
