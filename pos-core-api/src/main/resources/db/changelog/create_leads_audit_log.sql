--liquibase formatted sql
--changeset varun:leads_audit_log_031120222111
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS lead_audit_log;
CREATE TABLE  lead_audit_log (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `detail` text NOT NULL,
  request_id varchar(50),
  entity_id bigint(20) NOT NULL,
  entity_name varchar(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by varchar(256),
  PRIMARY KEY (`id`)
);