--liquibase formatted sql
--changeset varun:leads_index_160220232150

CREATE INDEX idx_leads_irda_id ON leads (irda_id, is_deleted);