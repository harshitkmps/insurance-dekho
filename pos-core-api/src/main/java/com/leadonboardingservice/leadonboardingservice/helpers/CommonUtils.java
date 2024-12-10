package com.leadonboardingservice.leadonboardingservice.helpers;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.tools.imageio.ImageIOUtil;

import java.awt.image.BufferedImage;
import java.io.File;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
public class CommonUtils {
    private static boolean isValidMobile(String phone) {
        boolean check=false;
        if(Pattern.matches("(0/91)?[6-9][0-9]{9}", phone)) {
            return true;
        }
        return check;
    }
    private static boolean isValidMail(String email) {
        boolean check;
        Pattern p;
        Matcher m;

        String EMAIL_STRING = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
                + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";

        p = Pattern.compile(EMAIL_STRING);

        m = p.matcher(email);
        check = m.matches();
        return check;
    }
    public static boolean isNumeric(String str)
    {
        return str.matches("-?\\d+(\\.\\d+)?");  //match a number with optional '-' and decimal.
    }

    public static boolean isMobileOrEmail(String value) {
        if(isValidMobile(value)){
            return true;
        }
        if(isValidMail(value)){
            return true;
        }
        return false;
    }

    public static String extractDomain(String email) {
        return StringUtils.substringAfter(email, "@");
    }

    public static void main(String[] args) {
        isValidMobile("6878746807");
    }

    public static void PdfToImage(String pdfFile, String fileName) {
        log.info("converting pdf {} to image {}", pdfFile, fileName);
        try {
            File file = new File(pdfFile);
            if(file.exists()){
                PDDocument document = PDDocument.load(file);
                PDPage pd;
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                pd = document.getPage(0);
                pd.setCropBox(new PDRectangle(0, 0, 900, 900));
                BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB);
                ImageIOUtil.writeImage(bim, fileName, 300);
                document.close();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            log.error("error while converting pdf to image {}", ex.getMessage());
        }
    }

    public static <T, K> Map<K, T> convertListToMap(
            List<T> entityList,
            Function<T, K> keyExtractor) {

        return Optional.ofNullable(entityList)
                .orElse(Collections.emptyList())
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(
                        keyExtractor,
                        entity -> entity,
                        (existingEntity, newEntity) -> newEntity
                ));
    }
}
