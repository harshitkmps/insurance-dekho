--liquibase formatted sql
--changeset chirag:update_user_080320241735

ALTER TABLE tbl_user
ADD COLUMN re_register boolean default NULL,
ADD COLUMN noc_required boolean default NULL;
