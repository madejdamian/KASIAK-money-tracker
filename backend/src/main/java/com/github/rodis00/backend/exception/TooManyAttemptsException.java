package com.github.rodis00.backend.exception;

public class TooManyAttemptsException extends RuntimeException implements FieldName {
    public TooManyAttemptsException(String message) {
        super(message);
    }

    @Override
    public String getFieldName() {
        return Fields.password.name();
    }
}
