--liquibase formatted sql
--changeset varun:leads_create_141120221407

alter table leads add constraint uc_leads_mobile unique (mobile_hashed,is_deleted);
alter table leads add constraint uc_leads_uuid unique (uuid,is_deleted);

alter table lead_profile add constraint uc_lead_profile_pan_hashed unique (pan_hashed, is_deleted);

alter table lead_bank_detail add constraint uc_bank_details unique (account_number_hashed, is_deleted);

CREATE INDEX idx_leads_mobile_hashed ON leads (mobile_hashed, is_deleted);
CREATE INDEX idx_leads_email_hashed ON leads (email_hashed, is_deleted);
CREATE INDEX idx_leads_uuid ON leads (uuid, is_deleted);
CREATE INDEX idx_leads_mobile_email_uuid ON leads (mobile_hashed, email_hashed, uuid, is_deleted);

CREATE INDEX idx_lead_profile_pan_hashed ON lead_profile (pan_hashed, is_deleted);
