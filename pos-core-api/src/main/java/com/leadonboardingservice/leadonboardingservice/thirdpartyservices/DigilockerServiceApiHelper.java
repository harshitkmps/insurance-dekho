package com.leadonboardingservice.leadonboardingservice.thirdpartyservices;

import com.leadonboardingservice.leadonboardingservice.constants.OnboardingConstants;
import com.leadonboardingservice.leadonboardingservice.enums.DocumentType;
import com.leadonboardingservice.leadonboardingservice.helpers.GenericRestClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.tools.imageio.ImageIOUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.StringReader;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigilockerServiceApiHelper {
    private final GenericRestClient restClient;
    private final RestTemplate restTemplate;

    @Value("${ide.digilocker.web.client-id}")
    private String clientId;

    @Value("${ide.digilocker.web.client-secret}")
    private String clientSecret;

    @Value("${ide.digilocker.web.redirect-uri}")
    private String redirectUri;

    @Value("${ide.digilocker.response-type}")
    private String responseType;

    @Value("${ide.digilocker.grant-type}")
    private String grantType;

    @Value("${ide.digilocker.host}")
    private String host;

    @Value("${ide.digilocker.path}")
    private String path;

    @Value("${ide.digilocker.app.client-id}")
    private String appClientId;

    @Value("${ide.digilocker.app.client-secret}")
    private String appClientSecret;

    @Value("${ide.digilocker.app.redirect-uri}")
    private String appRedirectUri;



    public String getClientId(String source) {
        if(source.equals(OnboardingConstants.POSAPP)){
            return appClientId;
        }
        return clientId;
    }
    public String getClientSecret(String source) {
        if(source.equals(OnboardingConstants.POSAPP)) {
            return appClientSecret;
        }
        return clientSecret;
    }
    public String getRedirectUri(String source) {
        if(source.equals(OnboardingConstants.POSAPP)){
            return appRedirectUri;
        }
        return redirectUri;
    }

    public String getGrantType() {
        return grantType;
    }
    public String getHost() {
        return host;
    }
    public String getPath() {
        return path;
    }


    public Object ToObject(String xmlResponse, Object obj) {
        JAXBContext jaxbContext;
        Object aadharDetails = null;
        try {
            jaxbContext = JAXBContext.newInstance(obj.getClass());
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            aadharDetails = jaxbUnmarshaller.unmarshal(new StringReader(xmlResponse));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return aadharDetails;
    }

    public DocumentType mapDocType(String docType) {
        switch (docType) {
            case OnboardingConstants.PANCR:
                return DocumentType.PAN;

            case OnboardingConstants.SPCER:
                return DocumentType.EDUCATION_CERTIFICATE;

            case OnboardingConstants.ADHAR:
                return DocumentType.AADHAAR_FRONT;

            case "PHOTO":
                return DocumentType.USER_PHOTO;
        }
        return null;
    }

    public void PdfToImage(String pdfFile, String docType, String token) {
        try {
            File file = new File(pdfFile);
            if(file.exists()){
                PDDocument document = PDDocument.load(file);
                PDPage pd;
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                pd = document.getPage(0);
                pd.setCropBox(new PDRectangle(0, 0, 900, 900));
                BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB);
                ImageIOUtil.writeImage(bim, docType + token + ".jpg", 300);
                document.close();
            }
        } catch (Exception ex) {
            System.out.println("error" + ex);
        }
    }

}
