package com.leadonboardingservice.leadonboardingservice.config;


import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class ElasticSearchConfig {

    @Value("${esClient.endpoint}")
    private String elasticSearchEndpoint;
    @Value("${esClient.username}")
    private String elasticAuthUserName;
    @Value("${esClient.password}")
    private String elasticAuthPassword;

    // Create the low-level client
    @Bean
    public ElasticsearchTransport transport() {
        final CredentialsProvider credentialsProvider =
                new BasicCredentialsProvider();
        credentialsProvider.setCredentials(AuthScope.ANY,
                new UsernamePasswordCredentials(elasticAuthUserName, elasticAuthPassword));
        RestClient restClient = RestClient.builder(
                new HttpHost(elasticSearchEndpoint, 9200))
                .setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {
                    @Override
                    public HttpAsyncClientBuilder customizeHttpClient(
                            HttpAsyncClientBuilder httpClientBuilder) {
                        return httpClientBuilder
                                .setDefaultCredentialsProvider(credentialsProvider);
                    }
                }).build();

        // Create the transport with a Jackson mapper
        return new RestClientTransport(
                restClient, new JacksonJsonpMapper());
    }

    // And create the API client
    @Bean
    public ElasticsearchClient elasticsearchClient() {
        return new ElasticsearchClient(transport());
    }
}
