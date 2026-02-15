# Changelog

All notable changes to n8n-nodes-camunda7 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-02-15

### Added
- Camunda 7 community node for n8n
- Process Definition: Start Instance (with business key, variables,
  and withVariablesInReturn option)
- Process Instance: Get Variables (with deserialize toggle)
- Task: Complete (with optional variables)
- Task: Query (filter by process instance, assignee, task key, name;
  with pagination)
- Message: Send (with correlation by business key or process instance ID)
- Auto-detect variable types (String, Integer, Long, Double, Boolean,
  Date, Json)
- Camunda7Api credential type with Basic Authentication and connection test
