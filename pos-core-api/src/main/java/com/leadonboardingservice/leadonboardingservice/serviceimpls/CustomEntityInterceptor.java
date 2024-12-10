package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import com.leadonboardingservice.leadonboardingservice.annotations.event.Event;
import com.leadonboardingservice.leadonboardingservice.annotations.event.EventType;
import com.leadonboardingservice.leadonboardingservice.annotations.event.Events;
import com.leadonboardingservice.leadonboardingservice.config.SpringContext;
import com.leadonboardingservice.leadonboardingservice.helpers.AuditLogUtil;
import com.leadonboardingservice.leadonboardingservice.models.BaseEntity;
import com.leadonboardingservice.leadonboardingservice.models.IAuditLog;
import com.leadonboardingservice.leadonboardingservice.models.Lead;
import com.leadonboardingservice.leadonboardingservice.models.LeadEvents;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadEventsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Component
@Slf4j
public class CustomEntityInterceptor extends EmptyInterceptor {
    private Set inserts = ConcurrentHashMap.newKeySet();
    private Set updates = ConcurrentHashMap.newKeySet();
    private Map<String,Object> eventMap = new ConcurrentHashMap<>();
    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        log.info("onSave event executed for entity {}", entity);
        addAuditLog(entity, id, state, null, propertyNames, types, false);
        addEvent(entity, id, state, null, propertyNames, types, false);
        return super.onSave(entity, id, state, propertyNames, types);
    }

    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        log.info("onFlushDirty event executed for entity {}", entity);
        addAuditLog(entity, id, currentState, previousState, propertyNames, types, true);
        addEvent(entity, id, currentState, previousState, propertyNames, types, true);
        return super.onFlushDirty(entity, id, currentState, previousState, propertyNames, types);
    }

    private void addEvent(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types, boolean isFlushDirty) {
        try {
            Class<?> clazz = entity.getClass();
            for (Field field : clazz.getDeclaredFields()) {
                field.setAccessible(true);
                if (field.isAnnotationPresent(Events.class)) {
                    Annotation[] annotations = field.getDeclaredAnnotations();
                    for (Annotation annotation : annotations) {
                        if (annotation instanceof Events) {
                            Events events = (Events) annotation;
                            String eventName = !events.defaultName().isEmpty()?events.defaultName():String.valueOf(field.get(entity));
                            String prefixField = "";
                            if (!events.prefixField().isEmpty()) {
                                Field field1 = clazz.getDeclaredField(events.prefixField());
                                field1.setAccessible(true);
                                prefixField = String.valueOf(field1.get(entity));
                                eventName = prefixField + "_" + eventName;
                            }
                            if(isFlushDirty) {
                                int index = Arrays.asList(propertyNames).indexOf(field.getName());
                                if (index != -1) {
                                    if (previousState[index]!=null && !previousState[index].toString().equalsIgnoreCase(String.valueOf(field.get(entity)))) {
                                        createEvent(entity, clazz, eventName);
                                    }
                                }
                            }else {
                                for(Event event: events.event()){
                                    if(event.type().equals(EventType.CREATE)){
                                        if(field.get(entity).toString().equalsIgnoreCase(event.name())){
                                            createEvent(entity, clazz, eventName);
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }catch (Exception e){
            e.printStackTrace();
            log.error("error occurred while adding event "+e.getMessage());
        }
    }

    private void createEvent(Object entity, Class<?> clazz, String eventName) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        if(!eventMap.containsKey(eventName+ MDC.get("requestId"))) {
            LeadEventsRepository leadEventsRepository = SpringContext.getBean(LeadEventsRepository.class);
            Lead lead = null;
            if (entity instanceof Lead) {
                lead = (Lead) entity;
            } else {
                lead = (Lead) clazz.getMethod("getLead").invoke(entity);
            }
            LeadEvents leadEvent = LeadEvents.builder()
                    .lead(lead)
                    .event(eventName)
                    .timeStamp(LocalDateTime.now())
                    .build();
            leadEvent.addCreatedBy();
            leadEvent.addUpdatedBy();
            log.info("saving event {}", leadEvent);
            leadEventsRepository.save(leadEvent);
            eventMap.put(eventName+ MDC.get("requestId"),entity);
        }
    }

    private void addAuditLog(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types, boolean isFlushDirty) {
        if (entity instanceof IAuditLog){
            if(isFlushDirty) {
                for (Iterator it = inserts.iterator(); it.hasNext();) {
                    IAuditLog e = (IAuditLog) it.next();
                    if(e.getId() != null &&  ((IAuditLog) entity).getId() != null && e.getId().toString().equalsIgnoreCase(String.valueOf(((IAuditLog) entity).getId()))){
                        return;
                    }
                }
                updates.add(entity);
                if(entity instanceof BaseEntity){
                    ((BaseEntity) entity).addUpdatedBy();
                    for (int i = 0; i < propertyNames.length; i++) {
                        if ("modifiedBy".equals(propertyNames[i])) {
                            currentState[i] = ((BaseEntity) entity).getModifiedBy();
                            break;
                        }
                    }
                }
                return;
            }
            if(!inserts.contains(entity)) {
                if(entity instanceof BaseEntity){
                    ((BaseEntity) entity).addCreatedBy();
                    ((BaseEntity) entity).addUpdatedBy();
                }
                inserts.add(entity);
            }
        }
    }

    @Override
    public void postFlush(Iterator iterator) {
        super.postFlush(iterator);
        log.info("inside postFlush");
        AuditLogUtil auditLogUtil = SpringContext.getBean(AuditLogUtil.class);
        try{

            for (Iterator it = inserts.iterator(); it.hasNext();) {
                IAuditLog entity = (IAuditLog) it.next();
                log.info("postFlush - insert");
                auditLogUtil.LogIt("CREATED",(IAuditLog) entity);
            }

            for (Iterator it = updates.iterator(); it.hasNext();) {
                IAuditLog entity = (IAuditLog) it.next();
                log.info("postFlush - update");
                auditLogUtil.LogIt("UPDATE",(IAuditLog) entity);
            }
        } finally {
            inserts.clear();
            updates.clear();
            eventMap.clear();
        }
    }
}
