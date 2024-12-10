--liquibase formatted sql
--changeset varun:leads_create_301120221214

alter table lead_document add column is_re_uploaded boolean not null default false after reject_status_remark_id;