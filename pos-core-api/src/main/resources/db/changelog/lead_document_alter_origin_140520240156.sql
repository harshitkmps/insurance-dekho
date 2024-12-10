--liquibase formatted sql
--changeset chirag:lead_document_alter_origin_140520240156.sql

ALTER TABLE lead_document MODIFY COLUMN origin ENUM('CKYC', 'DIGILOCKER', 'SIGNZY', 'UIDAI');