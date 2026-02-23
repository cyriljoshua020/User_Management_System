package com.example.usermanagement.service;

public interface AuditLogService {

    void log(String performedBy, String action, String details);
}