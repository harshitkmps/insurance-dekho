--liquibase formatted sql
--changeset chirag:lead_email_drop_contraints_100520241318.sql

ALTER TABLE leads
MODIFY COLUMN email_hashed VARCHAR(255) DEFAULT NULL,
MODIFY COLUMN email_masked VARCHAR(255) DEFAULT NULL,
MODIFY COLUMN email_encrypted VARCHAR(255) DEFAULT NULL;

