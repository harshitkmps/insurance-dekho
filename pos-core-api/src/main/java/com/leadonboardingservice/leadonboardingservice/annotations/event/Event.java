package com.leadonboardingservice.leadonboardingservice.annotations.event;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Event {
    /*LeadEvent name();*/
    String name() default "";
    EventType type() default EventType.UPDATE;
    //String type();
}
