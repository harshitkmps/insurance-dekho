--liquibase formatted sql
--changeset prince:visitors_030420241250
drop table if exists visitors;

CREATE TABLE visitors (
    id varchar(36) NOT NULL PRIMARY KEY,
    uuid varchar(100),
    name varchar(100),
    mobile_hashed varchar(256) not null,
    mobile_masked varchar(256) not null,
    mobile_encrypted varchar(256) not null,
    email_hashed varchar(256),
    email_masked varchar(256),
    email_encrypted varchar(256),
    status enum('CREATED', 'CONVERTED_TO_LEAD', 'REJECTED') not null,
    assigned_sales_iam_uuid varchar(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0
);