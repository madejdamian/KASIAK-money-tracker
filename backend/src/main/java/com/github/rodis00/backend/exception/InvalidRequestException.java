package com.github.rodis00.backend.exception;

public class InvalidRequestException extends RuntimeException implements FieldName {
    public InvalidRequestException(String message) {
        super(message);
    }

    @Override
    public String getFieldName() {
        return Fields.error.name();
    }
}
