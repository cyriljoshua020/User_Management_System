package com.example.usermanagement.controller;

import com.example.usermanagement.entity.AuditLog;
import com.example.usermanagement.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:4200")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<AuditLog> getAllLogs() {
        // Later we can sort DESC by timestamp if needed
        return auditLogRepository.findAll();
    }
}