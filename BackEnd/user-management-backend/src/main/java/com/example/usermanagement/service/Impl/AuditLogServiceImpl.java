package com.example.usermanagement.service.Impl;

import com.example.usermanagement.entity.AuditLog;
import com.example.usermanagement.repository.AuditLogRepository;
import com.example.usermanagement.service.AuditLogService;
import org.springframework.stereotype.Service;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void log(String performedBy, String action, String details) {
        AuditLog log = new AuditLog();
        log.setPerformedBy(performedBy);
        log.setAction(action);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}