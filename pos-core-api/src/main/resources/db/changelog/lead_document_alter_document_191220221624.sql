--liquibase formatted sql
--changeset varun:leads_create_191220221624

ALTER TABLE lead_document MODIFY COLUMN source ENUM('AUTOMATED', 'MANUAL', 'KYC_RE_UPLOADED');