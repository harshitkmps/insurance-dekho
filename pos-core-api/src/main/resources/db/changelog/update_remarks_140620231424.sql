--liquibase formatted sql
--changeset varun:update_remarks_140620231424

insert into remarks(category,text) values('LEAD_CLOSED', 'Fraudulent');