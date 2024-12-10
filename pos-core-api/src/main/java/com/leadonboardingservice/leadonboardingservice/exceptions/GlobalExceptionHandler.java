package com.leadonboardingservice.leadonboardingservice.exceptions;

import com.leadonboardingservice.leadonboardingservice.dtos.ErrorDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.*;
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ForbiddenRequestException.class)
    public ResponseEntity<?> forbiddenRequestException(ForbiddenRequestException ex, WebRequest request) {
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        return new ResponseEntity<>(errorDetails, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<?> invalidRequestException(InvalidRequestException ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DownstreamAPIException.class)
    ResponseEntity<?> downstreamAPIException(DownstreamAPIException ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        if(ex.getHttpStatus() != null){
            httpStatus = ex.getHttpStatus();
        }
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

   @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) ->{

            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(fieldName, message);
        });
        ErrorDetails errorDetails = new ErrorDetails(new Date(), "Request validation failed", request.getDescription(false), errors);
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ValidationException.class)
    ResponseEntity<?> validationException(ValidationException ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        HttpStatus httpStatus = HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

    @ExceptionHandler(LimitExceedException.class)
    ResponseEntity<?> limitExceededException(LimitExceedException ex, WebRequest request){
        ErrorDetails errorDetails = new ErrorDetails(new Date(), ex.getMessage(), request.getDescription(false), null);
        HttpStatus httpStatus = HttpStatus.TOO_MANY_REQUESTS;
        return new ResponseEntity<>(errorDetails, httpStatus);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionHandler(Exception ex, WebRequest request) {
        List<Throwable> exlist = new ArrayList<>();
        List<String> errorList = new ArrayList<>();
        Throwable throwable = ex.getCause();
        if(throwable == null || throwable.getCause() == null) {
            errorList.add(ex.getMessage());
        } else {
            while (throwable != null && exlist.size() < 4) {
                if(throwable.getCause() == null) {
                    exlist.add(throwable.getCause());
                    throwable = throwable.getCause();
                } else {
                    errorList.add(throwable.getMessage());
                    break;
                }
            }
        }
        Map<String,String> errorMap = new HashMap<>();
        if(!errorList.isEmpty()){
            errorMap.put("error",errorList.toString());
        } else {
            errorMap.put("error", exlist.toString());
        }
        ErrorDetails errorDetails = new ErrorDetails(new Date(), errorList.toString(), request.getDescription(false), errorMap);
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
