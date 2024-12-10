--liquibase formatted sql
--changeset pratiksha:update_user_101020231122

ALTER TABLE tbl_user
ADD COLUMN is_joint_account boolean default NULL;