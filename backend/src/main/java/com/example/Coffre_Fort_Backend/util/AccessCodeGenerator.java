package com.example.Coffre_Fort_Backend.util;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class AccessCodeGenerator {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Génère un code d'accès au format PAT-XXXX-XXX
     */
    public String generate() {
        return "PAT-" + randomPart(4) + "-" + randomPart(3);
    }

    private String randomPart(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
