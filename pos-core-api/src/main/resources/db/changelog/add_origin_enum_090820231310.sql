--liquibase formatted sql
--changeset avinash:add_origin_enum_090820231310.sql
ALTER TABLE leads MODIFY COLUMN lead_origin enum('POS','POS_APP','CAMPAIGNS');