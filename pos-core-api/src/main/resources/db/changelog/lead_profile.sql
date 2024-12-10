--liquibase formatted sql
--changeset varun:leads_create_240920222032
drop table if exists lead_profile;

CREATE TABLE lead_profile(
    lead_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    pan_masked varchar(256),
    pan_encrypted varchar(256),
    pan_hashed varchar(256),
    is_pan_verified boolean not null default 0,
    education_details varchar(256),
    date_of_birth DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);