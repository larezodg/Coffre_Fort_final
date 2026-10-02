package com.example.Coffre_Fort_Backend.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class DocumentTypeConverter implements AttributeConverter<Document.DocumentType, String> {

    @Override
    public String convertToDatabaseColumn(Document.DocumentType type) {
        return type == null ? null : type.getValue();
    }

    @Override
    public Document.DocumentType convertToEntityAttribute(String value) {
        if (value == null) return null;
        for (Document.DocumentType type : Document.DocumentType.values()) {
            if (type.getValue().equals(value)) return type;
        }
        throw new IllegalArgumentException("Type de document inconnu en base : " + value);
    }
}
