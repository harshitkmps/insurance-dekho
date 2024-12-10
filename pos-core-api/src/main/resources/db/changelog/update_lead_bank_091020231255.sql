--liquibase formatted sql
--changeset pratiksha:update_lead_bank_091020231255

ALTER TABLE lead_bank_detail
ADD COLUMN is_joint_account boolean default NULL;