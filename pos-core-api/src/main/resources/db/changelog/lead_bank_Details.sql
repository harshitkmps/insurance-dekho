--liquibase formatted sql
--changeset varun:leads_create_250920222032
drop table if exists bank_detail;

CREATE TABLE lead_bank_detail(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    bank_name varchar(256),
    bank_branch_name varchar(256),
    ifsc_masked varchar(256),
    ifsc_encrypted varchar(256),
    ifsc_hashed varchar(256),
    account_number_encrypted varchar(256),
    account_number_hashed varchar(256),
    account_number_masked varchar(256),
    beneficiary_name varchar(256),
    beneficiary_id varchar(256),
    is_bank_verified boolean default 0,
    is_active boolean default 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);

drop table if exists lead_address;

CREATE TABLE lead_address(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    type ENUM('HOME','SHOP','WORK'),
    pincode varchar(10),
    address varchar(256),
    locality varchar(256),
    gst_number varchar(20),
    city_id int,
    state_id int,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);

drop table if exists lead_document;

CREATE TABLE lead_document(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    type enum('PAN', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'AADHAAR', 'CANCELLED_CHEQUE', 'EDUCATION_CERTIFICATE', 'USER_PHOTO') not null,
    status enum('UPLOADED','APPROVED','REJECTED') not null,
    source enum('MANUAL','AUTOMATED') not null,
    url varchar(255),
    document_id varchar(256),
    is_verified boolean not null default 0,
    verified_at TIMESTAMP,
    reject_status_remark_id int(11) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);

drop table if exists lead_followup;

CREATE TABLE lead_followup(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    status ENUM('CREATED', 'ACKNOWLEDGED') not null,
    followup_at TIMESTAMP,
    followup_by varchar(256),
    remarks varchar(256),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_active boolean not null default 0,
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);

drop table if exists lead_training;

CREATE TABLE lead_training(
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT not null,
    product ENUM('GENERAL', 'LIFE') not null,
    status ENUM('TRAINING_MATERIAL_SHARED', 'TRAINING_MATERIAL_DOWNLOADED', 'TEST_LINK_SHARED', 'TEST_STARTED', 'TEST_FAILED', 'AGREEMENT_PENDING', 'COMPLETED') not null,
    agreement_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(256),
    modified_by varchar(256),
    is_deleted boolean NOT NULL DEFAULT 0,
    CONSTRAINT FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`)
);

