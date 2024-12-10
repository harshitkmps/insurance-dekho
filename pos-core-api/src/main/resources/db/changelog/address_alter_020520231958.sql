--liquibase formatted sql
--changeset varun:address_alter_020520231958.sql

ALTER TABLE lead_address ADD COLUMN address_encrypted varchar(255) after address;
ALTER TABLE lead_address ADD COLUMN address_masked varchar(255) after address;