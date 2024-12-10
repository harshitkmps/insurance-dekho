package com.leadonboardingservice.leadonboardingservice.serviceimpls;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.StringTermsBucket;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.JsonData;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.leadonboardingservice.leadonboardingservice.constants.ESConstants;
import com.leadonboardingservice.leadonboardingservice.dtos.PaginationDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadListResponseDto;
import com.leadonboardingservice.leadonboardingservice.dtos.response.LeadResponseDto;
import com.leadonboardingservice.leadonboardingservice.models.es.Lead;
import com.leadonboardingservice.leadonboardingservice.services.LeadSearchService;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;


@Service
@AllArgsConstructor
@Slf4j
public class LeadsSearchServiceImpl implements LeadSearchService {

    private final ElasticsearchClient elasticsearchClient;
    private final ObjectMapper objectMapper;

    @SneakyThrows
    @Override
    public LeadListResponseDto searchLeads(Map<String, Object> searchParams) {
        SearchResponse<Lead> response = queryLeadsInElastic(searchParams);
        log.info("elastic search response {}", response);
        Integer totalCount = Math.toIntExact(response.hits().total().value());
        Integer pageSize = (Integer) searchParams.get("size");
        List<LeadResponseDto> leadResponseDtoList= convertLeadList(response);
        PaginationDto paginationDto;
        if (response.hits().hits().isEmpty()) {
            paginationDto = PaginationDto.builder()
                    .count(totalCount)
                    .currentPageLastRow(null)
                    .currentPageFirstRow(null)
                    .pageSize(pageSize)
                    .hasNext(false)
                    .build();
        }
        else if(searchParams.containsKey("prevPage")){
            Collections.reverse(leadResponseDtoList);
            paginationDto = PaginationDto.builder()
                    .count(totalCount)
                    .currentPageLastRow(response.hits().hits().get(0).sort().get(0))
                    .currentPageFirstRow(response.hits().hits().get(response.hits().hits().size()-1).sort().get(0))
                    .pageSize(pageSize)
                    .hasNext(response.hits().hits().size() >= pageSize).build();
        }
        else{
            paginationDto = PaginationDto.builder()
                    .count(totalCount)
                    .currentPageFirstRow(response.hits().hits().get(0).sort().get(0))
                    .currentPageLastRow(response.hits().hits().get(response.hits().hits().size()-1).sort().get(0))
                    .pageSize(pageSize)
                    .hasNext(response.hits().hits().size() >= pageSize).build();
        }
        return LeadListResponseDto
                .builder()
                .data(leadResponseDtoList)
                .paginationDto(paginationDto)
                .build();
    }

    public List<LeadResponseDto> convertLeadList(SearchResponse<Lead> response){
        List<Hit<Lead>> leadHitList = response.hits().hits();
        List<LeadResponseDto> leadResponseList = new ArrayList<>();
        leadHitList.forEach(
                leadHit -> {
                    LeadResponseDto leadResponseDto = new LeadResponseDto();
                    Lead lead = leadHit.source();
                    BeanUtils.copyProperties(lead,leadResponseDto);
                    leadResponseDto.setCreatedAt(LocalDateTime.parse(lead.getCreatedAt()));
                    leadResponseDto.setUpdatedAt(LocalDateTime.parse(lead.getUpdatedAt()));
                    leadResponseList.add(leadResponseDto);
                }
        );
        return leadResponseList;
    }

    @Override
    public LeadListResponseDto searchLeadsWithAggregation(Map<String, Object> searchParams) {
        SearchResponse<Lead> response = queryLeadsAggregationsInElastic(searchParams);
        Map<String,Object> searchExamAggParams = new HashMap<>(searchParams);
        searchExamAggParams.put("leadState","reg_requested");
        SearchResponse<Lead> aggregationResponse = queryLeadsAggregationsInElastic(searchExamAggParams);
        ObjectNode bucketResponse =  mapBucketResponse(response,aggregationResponse);
        return LeadListResponseDto
                .builder()
                .data(convertLeadList(response))
                //.next(response.hits().hits().get(response.hits().hits().size()-1).sort())
                .buckets(bucketResponse)
                .build();
    }

    private ObjectNode mapBucketResponse(SearchResponse<Lead> response,SearchResponse<Lead> aggregationResponse) {
        ObjectNode objectNode = objectMapper.createObjectNode();
        ArrayNode leadBucketArray = objectMapper.createArrayNode();
        ArrayNode lifeBucketArray = objectMapper.createArrayNode();
        ArrayNode generalBucketArray = objectMapper.createArrayNode();
        List<StringTermsBucket> leadBucket = response.aggregations().get("lead_bucket_count").sterms().buckets().array();
        List<StringTermsBucket> generalBucket = aggregationResponse.aggregations().get("general_bucket_count").nested().aggregations().get("exam_status").sterms().buckets().array();
        List<StringTermsBucket> generalIrdaBucket = aggregationResponse.aggregations().get("general_bucket_count").nested().aggregations().get("irda_status").sterms().buckets().array();
        Long generalExamCleared = aggregationResponse.aggregations().get("general_bucket_count").nested().aggregations().get("exam_cleared").filter().docCount();
        List<StringTermsBucket> lifeBucket = aggregationResponse.aggregations().get("life_bucket_count").nested().aggregations().get("exam_status").sterms().buckets().array();
        List<StringTermsBucket> lifeIrdaBucket = aggregationResponse.aggregations().get("life_bucket_count").nested().aggregations().get("irda_status").sterms().buckets().array();
        Long lifeExamCleared = aggregationResponse.aggregations().get("life_bucket_count").nested().aggregations().get("exam_cleared").filter().docCount();
        leadBucket.forEach(x -> {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("key",x.key());
            node.put("docCount",x.docCount());
            leadBucketArray.add(node);
        });
        lifeBucket.forEach(x -> {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("key",x.key());
            node.put("docCount",x.docCount());
            if(x.key().equals("exam_cleared"))
                node.put("docCount",lifeExamCleared);
            lifeBucketArray.add(node);
        });
        lifeIrdaBucket.forEach(x -> {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("key",x.key());
            node.put("docCount",x.docCount());
            lifeBucketArray.add(node);
        });
        generalBucket.forEach(x -> {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("key",x.key());
            node.put("docCount",x.docCount());
            if(x.key().equals("exam_cleared"))
                node.put("docCount",generalExamCleared);
            generalBucketArray.add(node);
        });
        generalIrdaBucket.forEach(x -> {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("key",x.key());
            node.put("docCount",x.docCount());
            generalBucketArray.add(node);
        });
        objectNode.set("leadSummary",leadBucketArray);
        objectNode.set("generalInsuranceSummary",generalBucketArray);
        objectNode.set("lifeInsuranceSummary",lifeBucketArray);
        return objectNode;
    }

    @SneakyThrows
    private SearchResponse<Lead> queryLeadsInElastic(Map<String, Object> searchParams) {
        SearchRequest.Builder searchRequestBuilder = buildSearchRequest(searchParams);
        SearchRequest searchRequest = searchRequestBuilder.build();
        log.info("elastic search query generated {}",searchRequest);
        SearchResponse<Lead> response = elasticsearchClient
                .search(searchRequest,
                        Lead.class
                );
        return response;
    }

    @SneakyThrows
    private SearchResponse<Lead> queryLeadsAggregationsInElastic(Map<String, Object> searchParams) {
        SearchRequest.Builder searchRequestBuilder = buildSearchRequest(searchParams);

        searchRequestBuilder
                .aggregations("lead_bucket_count", l -> l
                        .terms(x -> x
                                .field("lead_state")))
                .aggregations("general_bucket_count", a -> a
                        .nested(v -> v
                        .path("general_insurance_reg"))
                        .aggregations("exam_status", e -> e
                                .terms(t -> t
                                        .field("general_insurance_reg.exam_status"))
                        )
                        .aggregations("irda_status", e -> e
                                .terms(t -> t
                                        .field("general_insurance_reg.irda_status"))
                        )
                        .aggregations("exam_cleared", e-> e
                                .filter(f -> f
                                        .bool( b -> b
                                                .must( m -> m
                                                        .term(t-> t
                                                                .field("general_insurance_reg.exam_status")
                                                                .value("exam_cleared")
                                                        )
                                                )
                                                .mustNot( m -> m
                                                        .term(t-> t
                                                                .field("general_insurance_reg.irda_status")
                                                                .value("irda_registered")
                                                        )
                                                )
                                        )
                                )
                        )
                )
                .aggregations("life_bucket_count", a -> a
                        .nested(v -> v
                                .path("life_insurance_reg"))
                        .aggregations("exam_status", e -> e
                                .terms(t -> t
                                        .field("life_insurance_reg.exam_status"))
                        )
                        .aggregations("irda_status", e -> e
                                .terms(t -> t
                                        .field("life_insurance_reg.irda_status"))
                        )
                        .aggregations("exam_cleared", e-> e
                                .filter(f -> f
                                        .bool( b -> b
                                                .must( m -> m
                                                        .term(t-> t
                                                                .field("life_insurance_reg.exam_status")
                                                                .value("exam_cleared")
                                                        )
                                                )
                                                .mustNot( m -> m
                                                        .term(t-> t
                                                                .field("life_insurance_reg.irda_status")
                                                                .value("irda_registered")
                                                        )
                                                )
                                        )
                                )
                        )
                );
        SearchRequest searchRequest = searchRequestBuilder.build();
        log.info("elastic search query generated {}",searchRequest);
        SearchResponse<Lead> response = elasticsearchClient
                .search(searchRequest,
                        Lead.class
                );
        return response;
    }

    private BoolQuery.Builder buildBoolQuery(Map<String, Object> searchParams) {
        BoolQuery.Builder queryBuilders = QueryBuilders.bool();
        Object dateFilterFieldObj = searchParams.get("dateFilterField");
        String dateFilterField = dateFilterFieldObj != null ? dateFilterFieldObj.toString() : "created_at";
        if (searchParams.containsKey("from") && searchParams.containsKey("to") && !searchParams.containsKey("filterInput")) {
            queryBuilders.must(RangeQuery.of(q -> q
                    .field(dateFilterField)
                    .gte(JsonData.of(searchParams.get("from")))
                    .lte(JsonData.of(searchParams.get("to")))
            )._toQuery());
        } else if (searchParams.containsKey("from") && !searchParams.containsKey("filterInput") ) {
            queryBuilders.must(RangeQuery.of(q -> q
                    .field(dateFilterField)
                    .gte(JsonData.of(searchParams.get("from")))
            )._toQuery());
        } else if (searchParams.containsKey("to") && !searchParams.containsKey("filterInput") ) {
            queryBuilders.must(RangeQuery.of(q -> q
                    .field(dateFilterField)
                    .lte(JsonData.of(searchParams.get("to")))
            )._toQuery());
        }
        if (searchParams.containsKey("leadUuid")) {
            queryBuilders.must(MatchQuery.of(q -> q
                    .field("uuid")
                    .query((String) searchParams.get("leadUuid"))
            )._toQuery());
        }
        if (searchParams.containsKey("leadState")) {
            queryBuilders.must(MatchQuery.of(q -> q
                    .field("lead_state")
                    .query((String) searchParams.get("leadState"))
            )._toQuery());
        }
        if (searchParams.containsKey("tenantId")) {
            queryBuilders.must(MatchQuery.of(q -> q
                    .field("tenant_id")
                    .query((int) searchParams.get("tenantId"))
            )._toQuery());
        }
        if(searchParams.containsKey("referDealerId")) {
            queryBuilders.must(MatchQuery.of(q -> q
                    .field("refer_dealer_id")
                    .query((String) searchParams.get("referDealerId"))
            )._toQuery());
        }
        if (searchParams.containsKey("generalInsuranceExamStatus") || searchParams.containsKey("lifeInsuranceExamStatus")) {
            if (searchParams.containsKey("generalInsuranceExamStatus")) {
                if(searchParams.get("generalInsuranceExamStatus").equals("irda_registered")){
                    queryBuilders.must(NestedQuery.of(n -> n
                            .path("general_insurance_reg")
                            .query(MatchPhraseQuery.of(a -> a
                                    .field("general_insurance_reg.irda_status")
                                    .query((String) searchParams.get("generalInsuranceExamStatus")
                                    )
                            )._toQuery())
                    )._toQuery());
                } else{
                    queryBuilders.must(NestedQuery.of(n -> n
                            .path("general_insurance_reg")
                            .query(MatchPhraseQuery.of(a -> a
                                    .field("general_insurance_reg.exam_status")
                                    .query((String) searchParams.get("generalInsuranceExamStatus")
                                    )
                            )._toQuery())
                    )._toQuery());
                    if(searchParams.get("generalInsuranceExamStatus").equals("exam_cleared")){
                        queryBuilders.mustNot(NestedQuery.of(n -> n
                                .path("general_insurance_reg")
                                .query(MatchPhraseQuery.of(a -> a
                                        .field("general_insurance_reg.irda_status")
                                        .query("irda_registered")
                                )._toQuery())
                        )._toQuery());
                    }
                }

            }
            if (searchParams.containsKey("lifeInsuranceExamStatus")) {
                if(searchParams.get("lifeInsuranceExamStatus").equals("irda_registered")){
                    queryBuilders.must(NestedQuery.of(n -> n
                            .path("life_insurance_reg")
                            .query(MatchPhraseQuery.of(a -> a
                                    .field("life_insurance_reg.irda_status")
                                    .query((String) searchParams.get("lifeInsuranceExamStatus")
                                    )
                            )._toQuery())
                    )._toQuery());
                }
                else{
                    queryBuilders.must(NestedQuery.of(n -> n
                            .path("life_insurance_reg")
                            .query(MatchPhraseQuery.of(a -> a
                                    .field("life_insurance_reg.exam_status")
                                    .query((String) searchParams.get("lifeInsuranceExamStatus")
                                    )
                            )._toQuery())
                    )._toQuery());
                    if(searchParams.get("lifeInsuranceExamStatus").equals("exam_cleared")){
                        queryBuilders.mustNot(NestedQuery.of(n -> n
                                .path("life_insurance_reg")
                                .query(MatchPhraseQuery.of(a -> a
                                        .field("life_insurance_reg.irda_status")
                                        .query("irda_registered")
                                )._toQuery())
                        )._toQuery());
                    }
                }
            }

            queryBuilders.must(MatchQuery.of(q -> q
                    .field("lead_state")
                    .query("reg_requested")
            )._toQuery());
        }
//        if(searchParams.containsKey("irdaRegistered") && ((int) searchParams.get("irdaRegistered") ==1)) {
//            queryBuilders.must(NestedQuery.of(n -> n
//                    .path("general_insurance_reg")
//                    .query(MatchPhraseQuery.of(a -> a
//                            .field("general_insurance_reg.irda_status")
//                            .query("irda_registered")
//                    )._toQuery())
//            )._toQuery());
//            queryBuilders.must(NestedQuery.of(n -> n
//                    .path("life_insurance_reg")
//                    .query(MatchPhraseQuery.of(a -> a
//                            .field("life_insurance_reg.irda_status")
//                            .query("irda_registered")
//                    )._toQuery())
//            )._toQuery());
//        }
        if ((searchParams.containsKey("getAllLeads")) && ((int) searchParams.get("getAllLeads") == 1)) {
            queryBuilders.must(MatchAllQuery.of(a -> a)._toQuery());
        } else {
            queryBuilders.must(MatchPhraseQuery.of(a -> a
                    .field("path")
                    .query((String) searchParams.get("uuid"))
            )._toQuery());
        }
        if (searchParams.containsKey("reRegister")) {
            if(searchParams.get("reRegister").equals("1")) {
                queryBuilders.must(MatchPhraseQuery.of(q -> q
                        .field("is_noc_required")
                        .query("true")
                )._toQuery());
            } else if (searchParams.get("reRegister").equals("2")) {
                queryBuilders.must(MatchPhraseQuery.of(q -> q
                        .field("is_noc_required")
                        .query("false")
                )._toQuery());
            } else {
                queryBuilders.must(MatchPhraseQuery.of(q -> q
                        .field("is_re_register")
                        .query("true")
                )._toQuery());
            }
        }
        if (searchParams.containsKey("filterInput")) {
            if (searchParams.containsKey("name")) {
                queryBuilders.must(MultiMatchQuery.of(a -> a
                        .fields("name")
                        .fields("gcd_code")
                        .query((String) searchParams.get("filterInput"))
                        .type(TextQueryType.valueOf("PhrasePrefix"))
                        .lenient(true)
                )._toQuery());
            } else {
                queryBuilders.must(MultiMatchQuery.of(a -> a
                        .fields("id")
                        .fields("mobile_hash")
                        .fields("email_hash")
                        .query((String) searchParams.get("filterInput"))
                        .lenient(true)
                )._toQuery());
            }
        }

        if (searchParams.containsKey("utmSource")) {
            queryBuilders.must(MatchPhraseQuery.of(q -> q
                    .field("utm_source")
                    .query((String) searchParams.get("utmSource"))
            )._toQuery());
        }
        return queryBuilders;
    }

    private SearchRequest.Builder buildSearchRequest(Map<String, Object> searchParams) {
        SearchRequest.Builder searchRequestBuilder= new SearchRequest.Builder();
        searchRequestBuilder.index(ESConstants.LEADS_INDEX);
        if(searchParams.containsKey("size")){
            searchRequestBuilder.size((Integer) searchParams.get("size"));
        }
        if(searchParams.containsKey("prevPage")&& searchParams.containsKey("searchAfter") ) {
            searchRequestBuilder
                    .sort(SortOptions.of(x -> x
                            .field(s -> s
                                    .field("id")
                                    .order(SortOrder.Asc))
                    ));
        }
        else{
            searchRequestBuilder
                    .sort(SortOptions.of(x -> x
                            .field(s -> s
                                    .field("id")
                                    .order(SortOrder.Desc))
                    ));
        }
        if(searchParams.containsKey("searchAfter")){
            List<String> searchAfter = (List<String>) searchParams.get("searchAfter");
            searchRequestBuilder
                    .searchAfter(searchAfter);
        }
        BoolQuery.Builder queryBuilders = buildBoolQuery(searchParams);
        BoolQuery boolQuery = queryBuilders.build();
        searchRequestBuilder.query(boolQuery._toQuery());
        return searchRequestBuilder;
    }
}
