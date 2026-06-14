package com.esports.league.service;

/** Thrown when a requested entity does not exist. Mapped to HTTP 404 by the global handler. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
