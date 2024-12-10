--liquibase formatted sql
--changeset varun:lead_events_131020221657
drop table if exists lead_event;

CREATE TABLE lead_event(
   id INT PRIMARY KEY AUTO_INCREMENT,
   lead_id INT,
   event varchar(50) not null,
   time_stamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_by varchar(256),
   modified_by varchar(256),
   is_deleted boolean NOT NULL DEFAULT 0,
   CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);