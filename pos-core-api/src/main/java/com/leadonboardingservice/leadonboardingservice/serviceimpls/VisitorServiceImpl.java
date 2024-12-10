package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.dtos.request.CreateVisitorRequestDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorDetailsDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.VisitorListPageDto;
import com.leadonboardingservice.leadonboardingservice.exceptions.InvalidRequestException;
import com.leadonboardingservice.leadonboardingservice.externals.IAMServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.helpers.NullAwareBeanUtilsBean;
import com.leadonboardingservice.leadonboardingservice.mappers.VisitorMapper;
import com.leadonboardingservice.leadonboardingservice.models.Visitor;
import com.leadonboardingservice.leadonboardingservice.repositories.VisitorRepository;
import com.leadonboardingservice.leadonboardingservice.services.VisitorService;
import com.leadonboardingservice.leadonboardingservice.validators.DuplicateVisitorValidator;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
public class VisitorServiceImpl implements VisitorService {
    private final VisitorRepository visitorRepository;
    private final IAMServiceApiHelper iamServiceApiHelper;
    private final VisitorMapper visitorMapper;
    private final DuplicateVisitorValidator duplicateVisitorValidator;

    public VisitorDetailsDto createVisitor(CreateVisitorRequestDto visitorRequestDto) throws Exception{
        log.info("creating visitor [visitor] {}", visitorRequestDto);
        Optional<String> error = duplicateVisitorValidator.validate(visitorRequestDto.getMobile());
        if (error.isPresent()) {
            throw new InvalidRequestException(error.get());
        }
        Visitor visitor = visitorMapper.toEntity(visitorRequestDto);
        visitor.addPiiFields();
        visitor.setId(UUID.randomUUID().toString());
        visitorRepository.save(visitor);
        VisitorDetailsDto newVistor = visitorMapper.toDto(visitor);
        return newVistor;

    }

    public VisitorListPageDto getMyVisitors(String userId, String name, Pageable pageable) {
        log.info("Fetching Visitors for [UserId] {} ", userId);
        Page<Visitor> visitorsPage = visitorRepository.findByAssignedSalesIamUuidAndNameContaining(userId, name, pageable);
        List<VisitorDetailsDto> visitorsList = visitorsPage.map(visitorMapper::toDto).getContent();
        VisitorListPageDto visitorListPageDto = new VisitorListPageDto();
        visitorListPageDto.setData(visitorsList);
        visitorListPageDto.setCurrentPageNumber(visitorsPage.getNumber());
        visitorListPageDto.setHasNext(visitorsPage.hasNext());
        if (visitorsPage.hasNext()) {
            visitorListPageDto.setNextPageNumber(visitorsPage.getNumber() + 1);
        }
        return visitorListPageDto;
    }

    public VisitorDetailsDto getVisitor(String id){
        log.info("Fetching visitor details for id {}", id);
        Optional<Visitor> visitorOptional = visitorRepository.findById(id);
        if(!visitorOptional.isEmpty()){
            VisitorDetailsDto visitorDetailsDto = visitorMapper.toDto(visitorOptional.get());
            return visitorDetailsDto;
        }
        throw new NoSuchElementException("Visitor not found with id = " + id);
    }
    public VisitorDetailsDto updateVisitor(String id, CreateVisitorRequestDto visitorRequestDto) throws Exception{
        log.info("updating visitor [visitor] {} ", visitorRequestDto );
        Optional<Visitor> existingVisitorOptional = visitorRepository.findById(id);
        if (existingVisitorOptional.isPresent()) {
            if (visitorRequestDto.getMobile() != null) {
                Optional<String> error = duplicateVisitorValidator.validate(visitorRequestDto.getMobile());
                if (error.isPresent()) {
                    throw new RuntimeException(error.get());
                }
            }
            Visitor existingVisitor = existingVisitorOptional.get();
            Visitor visitor = visitorMapper.toEntity(visitorRequestDto);
            visitor.addPiiFields();
            NullAwareBeanUtilsBean.copyNonNullProperties(visitor, existingVisitor);
            visitorRepository.save(existingVisitor);
            VisitorDetailsDto visitorDetails = visitorMapper.toDto(existingVisitor);
            return visitorDetails;
        }
        throw new NoSuchElementException("Visitor not found with id = " + id);
    }
}