--liquibase formatted sql
--changeset harshit:remarks_create_311020221229

drop table if exists remarks;

CREATE TABLE remarks(
   id INT PRIMARY KEY AUTO_INCREMENT,
   category VARCHAR(100) not null,
   text VARCHAR(100) not null,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   created_by varchar(256),
   modified_by varchar(256),
   is_deleted boolean NOT NULL DEFAULT 0
);

insert into remarks(category,text) values('LEAD_CLOSED', 'Unable to connect- Even after multiple follow-ups');
insert into remarks(category,text) values('LEAD_CLOSED', 'Unable to connect - Wrong contact details');
insert into remarks(category,text) values('LEAD_CLOSED', 'Already registered with InsuranceDekho');
insert into remarks(category,text) values('LEAD_CLOSED', 'Unavailability of required documents');
insert into remarks(category,text) values('LEAD_CLOSED', 'KYC Mismatch');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested - Already working with multiple GI Companies and online platforms');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Prefers to work with GI companies / Lack of trust on Insurtech platform');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Need better payout terms');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Unavailability of required product line/LOB');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Need support of local office/branch');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Not satisfied with ID offerings, Claim Support, and local field support');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested – Previously worked with InsuranceDekho');
insert into remarks(category,text) values('LEAD_CLOSED', 'Not interested in Insurance business');
insert into remarks(category,text) values('LEAD_CLOSED', 'Others');

insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Document is not correct');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Document is blur');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Not Uploaded');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Incorrect Name');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Incorrect DOB');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Incorrect IFSC Code');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Incomplete Marksheet');
insert into remarks(category,text) values('LEAD_DOCUMENT_REJECT', 'Without Aadhar Number');