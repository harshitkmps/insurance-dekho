package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.utils.StringUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.leadonboardingservice.leadonboardingservice.externals.DocumentServiceApiHelper;
import com.leadonboardingservice.leadonboardingservice.externals.dtos.DocumentServiceResponseDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;

@Service
@RequiredArgsConstructor
@Slf4j
public class AwsS3ServiceApiHelper {

    private final DocumentServiceApiHelper documentServiceApiHelper;
    private S3AsyncClient s3client;

    @Value("${ide.s3.bucket-name}")
    private String bucketName;

    @Value("${ide.s3.region}")
    private String region;

    @Value("${ide.s3.access-key}")
    private String accessKey;

    @Value("${ide.s3.secret-key}")
    private String secretKey;

    @Bean
    public void intializeS3Client() {
        final AwsCredentialsProvider creds = () -> {
            return AwsBasicCredentials.create(accessKey, secretKey);
        };
        this.s3client = S3AsyncClient.builder()
                .region(Region.of(region))
                .credentialsProvider(creds)
                .build();
    }

    @Bean
    public AwsCredentialsProvider awsCredentialsProvider() {
        if (StringUtils.isBlank(accessKey)) {
            return DefaultCredentialsProvider.create();
        } else {
            return () -> {
                return AwsBasicCredentials.create(accessKey, secretKey);
            };
        }
    }

    /* Create a pre-signed URL to download an object in a subsequent GET request. */
    public String createPresignedGetUrl(String bucketName, String keyName) {
        try (S3Presigner presigner = S3Presigner.builder().region(Region.of(region)).credentialsProvider(awsCredentialsProvider()).build()) {

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // The URL will expire in 10 minutes.
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            log.info("Presigned URL: [{}]", presignedRequest.url().toString());
            log.info("HTTP method: [{}]", presignedRequest.httpRequest().method());
            presigner.close();
            return presignedRequest.url().toExternalForm();
        }
    }

    public DocumentServiceResponseDto uploadToDocService(String url) {
        DocumentServiceResponseDto documentServiceResponseDto = new DocumentServiceResponseDto();
        try {
            String updatedUrl = url.replace("gibpl-new", bucketName).replace("production/POS", "onboarding");
            int index = url.lastIndexOf('/');
            String filePath = url.substring(index + 1);
            URL uri = new URL(updatedUrl);
            try {
                String presignedUrl = createPresignedGetUrl("pos-v1",
                        URLDecoder.decode(uri.getPath().substring(1), "UTF-8"));
                saveContentToFile(presignedUrl, filePath);
            } catch (Throwable e) {
                e.printStackTrace();
                log.error("error in saving doc from s3 {}", e.getMessage());
                if (e instanceof FileNotFoundException) {
                    try {
                        String presignedUrl = createPresignedGetUrl("pos-v1",
                                uri.getPath().substring(1));
                        saveContentToFile(presignedUrl, filePath);
                    } catch (Exception error) {
                        throw error;
                    }
                }
                throw e;

            }
            documentServiceResponseDto = documentServiceApiHelper.uploadDocument(filePath);
            log.info("uploaded doc {}", documentServiceResponseDto);
            File file = new File(new ClassPathResource(filePath).getPath());
            file.delete();
        } catch (Exception err) {
            err.printStackTrace();
            log.error("Error while uploading to doc service {}", url);
        }
        return documentServiceResponseDto;

    }

    private void saveContentToFile(String presignedUrlString, String path) throws Exception {
        URL presignedUrl = new URL(presignedUrlString);
        HttpURLConnection connection = (HttpURLConnection) presignedUrl.openConnection();
        connection.setRequestMethod("GET");
        InputStream content = connection.getInputStream();
        OutputStream stream = new FileOutputStream(new ClassPathResource(path).getPath());
        stream.write(content.readAllBytes());
        stream.close();
    }

}
