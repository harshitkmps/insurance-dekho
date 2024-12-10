--liquibase formatted sql
--changeset pratiksha:remarks_update_280820231516

INSERT INTO remarks (category, text) VALUES ('LEAD_REJECTED', 'Account already registered with PAN'), ('LEAD_REJECTED', 'Others');