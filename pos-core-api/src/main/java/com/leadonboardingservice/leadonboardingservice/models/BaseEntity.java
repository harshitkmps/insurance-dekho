package com.leadonboardingservice.leadonboardingservice.models;

import com.google.common.base.CaseFormat;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiTypeAndValue;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.Pii;
import com.leadonboardingservice.leadonboardingservice.annotations.pii.PiiType;
import com.leadonboardingservice.leadonboardingservice.config.SpringContext;
import com.leadonboardingservice.leadonboardingservice.helpers.IamContextUtils;
import com.leadonboardingservice.leadonboardingservice.helpers.EncryptionHelper;
import lombok.Data;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
@Slf4j
@Data
@MappedSuperclass
public abstract class BaseEntity {

    @Column(name="created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    private String createdBy;
    private String modifiedBy;
    @Column(name="is_deleted",columnDefinition="BOOLEAN DEFAULT false")
    private Boolean isDeleted = false;

    public void addPiiFields() throws Exception {
        List<PiTypeAndValue> piTypeAndValueList = new ArrayList<>();
        EncryptionHelper encryptionHelper = SpringContext.getBean(EncryptionHelper.class);
        Class<?> clazz = this.getClass();
        for(Field field: clazz.getDeclaredFields()){
            field.setAccessible(true);
            if(field.isAnnotationPresent(Pii.class)){
                Annotation[] annotations = field.getDeclaredAnnotations();
                for(Annotation annotation:annotations){
                    if(annotation instanceof Pii){
                        Pii piiAnnotation = (Pii) annotation;
                        if(piiAnnotation.transform() && field.get(this) != null){
                            PiTypeAndValue element = new PiTypeAndValue(piiAnnotation.field(), field.get(this).toString());
                            piTypeAndValueList.add(element);
                        }
                    }
                }
            }
        }
        Map<String, String> response = encryptionHelper.encrypt(piTypeAndValueList);
        for(Map.Entry<String,String> entry:response.entrySet()){
            try {
                String key = CaseFormat.LOWER_UNDERSCORE.to(CaseFormat.LOWER_CAMEL, entry.getKey());
                Field field = clazz.getDeclaredField(key);
                if (field.isAnnotationPresent(Pii.class)) {
                    Pii annotation = field.getAnnotation(Pii.class);
                    if (!annotation.transform()) {
                        field.setAccessible(true);
                        field.set(this, entry.getValue());
                    }
                }
            }catch (Exception e){
                log.warn("Exception while adding pii fields {}",e.getMessage());
            }
        }
    }

    @SneakyThrows
    public void decryptAllPiiFields() {
        EncryptionHelper encryptionHelper = SpringContext.getBean(EncryptionHelper.class);
        Class<?> clazz = this.getClass();
        List<PiTypeAndValue> encryptedValuesList = new ArrayList<>();
        for(Field field: clazz.getDeclaredFields()) {
            field.setAccessible(true);
            if(field.isAnnotationPresent(Pii.class)){
                Annotation[] annotations = field.getDeclaredAnnotations();
                for(Annotation annotation:annotations){
                    if(annotation instanceof Pii){
                        Pii piiAnnotation = (Pii) annotation;
                        if(piiAnnotation.type().equals(PiiType.ENCRYPTED)){
                            if(field.get(this) != null && !field.get(this).toString().isEmpty()) {
                                PiTypeAndValue element = new PiTypeAndValue(piiAnnotation.decryptField(), field.get(this).toString());
                                encryptedValuesList.add(element);
                            }
                        }
                    }
                }
            }
        }
        if(!encryptedValuesList.isEmpty()) {
            Map<String,String> decryptedResponse = encryptionHelper.decrypt(encryptedValuesList);
            for(Field field: clazz.getDeclaredFields()) {
                if (field.isAnnotationPresent(Pii.class)) {
                    Annotation[] annotations = field.getDeclaredAnnotations();
                    for (Annotation annotation : annotations) {
                        if (annotation instanceof Pii) {
                            Pii piiAnnotation = (Pii) annotation;
                            if (piiAnnotation.type().equals(PiiType.DECRYPTED)) {
                                if(decryptedResponse.containsKey(piiAnnotation.field())){
                                    field.setAccessible(true);
                                    field.set(this,decryptedResponse.get(piiAnnotation.field()));
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public void addCreatedBy(){
        IamContextUtils iamContextUtils = SpringContext.getBean(IamContextUtils.class);
        if(iamContextUtils.getIamUUID().isPresent()) {
            this.setCreatedBy(iamContextUtils.getIamUUID().get());
        }
    }

    public void addUpdatedBy(){
        IamContextUtils iamContextUtils = SpringContext.getBean(IamContextUtils.class);
        if(iamContextUtils.getIamUUID().isPresent()) {
            this.setModifiedBy(iamContextUtils.getIamUUID().get());
        }
    }
}