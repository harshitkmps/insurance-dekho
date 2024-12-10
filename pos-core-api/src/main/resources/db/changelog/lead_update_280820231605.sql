--liquibase formatted sql
--changeset pratiksha:lead_update_280820231605

ALTER TABLE `leads` ADD `rejection_remarks_id` INT(11) NULL DEFAULT NULL AFTER `rejection_reason`;