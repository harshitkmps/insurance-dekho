--liquibase formatted sql
--changeset varun:leads_create_180920222309
drop table if exists leads;

CREATE TABLE leads(
   id INT PRIMARY KEY AUTO_INCREMENT,
   old_lead_id INT default null,
   name VARCHAR(100),
   uuid VARCHAR(100) not null,
   mobile_hashed varchar(256) not null,
   mobile_masked varchar(256) not null,
   mobile_encrypted varchar(256) not null,
   email_hashed varchar(256) not null,
   email_masked varchar(256) not null,
   email_encrypted varchar(256) not null,
   city_id int(11) DEFAULT NULL,
   lead_origin ENUM('POS', 'POS_APP') not null,
   referrer_iam_uuid varchar(100),
   assigned_sales_iam_uuid varchar(100),
   closed_status_remark_id int(11) DEFAULT NULL,
   rejection_reason varchar(256) DEFAULT NULL,
   channel_partner_id varchar(255),
   lead_originated_by ENUM('SALES', 'ADMIN', 'EXECUTIVE', 'SELF', 'DEALER') not null,
   status enum('CREATED','REGISTRATION_REQUESTED','DOCUMENTS_REUPLOAD_REQUIRED','REJECTED','CLOSED','VERIFIED','REGISTERED') not null,
   tenant_id int not null,
   irda_id varchar(255) DEFAULT NULL,
   irda_reporting_date datetime DEFAULT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_by varchar(256),
   modified_by varchar(256),
   is_deleted boolean NOT NULL DEFAULT 0
);