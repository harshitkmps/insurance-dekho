--liquibase formatted sql
--changeset varun:leads_create_181020209050
drop table if exists lead_additional_detail;

CREATE TABLE lead_additional_detail(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    property_name varchar(50) not null,
    property_value varchar(50) not null,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);