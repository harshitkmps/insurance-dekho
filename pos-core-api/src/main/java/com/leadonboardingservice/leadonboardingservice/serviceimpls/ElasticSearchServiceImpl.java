package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch.core.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.constants.ESConstants;
import com.leadonboardingservice.leadonboardingservice.constants.LeadConstants;
import com.leadonboardingservice.leadonboardingservice.models.es.Lead;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.consumer.LeadConsumer;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer.ESSyncFailureProducer;
import com.leadonboardingservice.leadonboardingservice.rabbitmq.producer.leadeventproducer.LeadEventProducer;
import com.leadonboardingservice.leadonboardingservice.repositories.LeadRepository;
import com.leadonboardingservice.leadonboardingservice.services.ElasticSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.ResponseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ElasticSearchServiceImpl implements ElasticSearchService, LeadConsumer {
    private final EsLeadMapperServiceImpl leadMapperService;
    private final ElasticsearchClient elasticsearchClient;
    private final LeadRepository leadRepository;
    private final LeadEventProducer leadEventProducer;
    private final ESSyncFailureProducer esSyncFailureProducer;
    private final ObjectMapper objectMapper;
    @Override
    public void upsertLead(Long id) {
        try {
            com.leadonboardingservice.leadonboardingservice.models.Lead leadDetails = leadRepository.findById(id).orElseThrow(() -> new RuntimeException("lead not found with leadId "+id));
            GetResponse<Lead> response = elasticsearchClient.get(g -> g
                            .index(ESConstants.LEADS_INDEX)
                            .id(String.valueOf(leadDetails.fetchId())),
                    Lead.class
            );
            Lead lead = leadMapperService.mapLead(id);
            log.info("elastic search get lead by id {}.", lead.getId());
            if (response.found()) {
                Long primaryTerm = response.primaryTerm();
                Long sequenceNumber = response.seqNo();
                log.info("upserting document in elastic search for lead {} with sequenceNumber {} ", lead.getUuid(), sequenceNumber);
                IndexRequest<Lead> request = IndexRequest.of(i -> i
                        .index(ESConstants.LEADS_INDEX)
                        .id(lead.getId().toString())
                        .ifPrimaryTerm(primaryTerm)
                        .ifSeqNo(sequenceNumber)
                        .document(lead)
                );
                index(request);
            } else {
                log.info("inserting document in elastic search for lead {}", lead.getUuid());
                IndexRequest<Lead> request = IndexRequest.of(i -> i
                        .index(ESConstants.LEADS_INDEX)
                        .id(lead.getId().toString())
                        .document(lead)
                );
                index(request);
            }
        } catch (ResponseException responseException) {
            responseException.printStackTrace();
            log.error("elastic response exception for lead {} Exception {}", id, responseException.getMessage());
            Response response = responseException.getResponse();
            if (response.getStatusLine().getStatusCode() == 409) {
                log.error("conflict occurred while updating document in elastic search for lead {}", id);
                throw new RuntimeException("conflict occurred while updating document in elastic search for lead " + id);
            }
        } catch (IOException | ElasticsearchException e) {
            log.error("error while upserting document in es for lead {} Message {}",id, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("conflict occurred while updating document in elastic search for lead " + id);
        } catch (Exception e){
            log.error("some error occurred while upserting in es for lead {} Message {}",id, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("some error occurred while upserting in es for lead " + id);
        }

    }

    private void index(IndexRequest<Lead> request) throws IOException {
        log.info("elastic search index request {}",request);
        IndexResponse result = elasticsearchClient.index(request);
        log.info("elastic search upsert response {}",result);
    }

    @Override
    public void consume(ObjectNode message) {
        try {
            log.info("lead event consumer message {}", message);
            Long leadId = message.get("leadId").asLong();
            upsertLead(leadId);
        }catch (Exception e){
            log.error("error while consuming lead event message {} Exception {}.", message, e.getMessage());
            ObjectNode objectNode = objectMapper.createObjectNode();
            objectNode.put("leadId", message.get("leadId").asLong());
            int retry = 0;
            if(message.has("retry"))
                retry = message.get("retry").asInt();
            objectNode.put("retry", retry+1);
            if(retry < LeadConstants.LEAD_EVENT_RETRY_COUNT) {
                esSyncFailureProducer.produce(objectNode);
            }
        }
    }
}
