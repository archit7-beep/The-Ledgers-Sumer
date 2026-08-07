---
name: zero-hallucination-agent-config
description: Strict system configuration for Antigravity autonomous coding agents during high-speed hackathon execution. Enforces zero-hallucination code generation, model restrictions, strict type/style validation, and secrets protection.
---

# Zero-Hallucination Agent Config (v1.1.0)

Strict system configuration for Antigravity autonomous coding agents during high-speed hackathon execution. Enforces zero-hallucination code generation, model restrictions, strict type/style validation, and secrets protection.

## Agent Governance

### Hallucination Policy (Mode: strict)
- NEVER assume, invent, fabricate, or infer functions, methods, fields, props, endpoints, or schema properties that are not explicitly present in the provided project context, uploaded files, or confirmed documentation.
- If a required symbol, type, or API is not found in context, the agent MUST halt and request clarification instead of generating placeholder or guessed implementations.
- All external library usage must be cross-referenced against actual installed package versions in package.json / lockfile before use.
- No silent assumptions about backend contracts, database schemas, or API response shapes; all must be explicitly sourced or stubbed with clearly marked TODO placeholders.
- Agent must cite the source file or context snippet justifying any non-trivial code generation when ambiguity exists.

**On Violation:** block_and_request_clarification

### Model Policy

**Banned Models:**
- llama3
- llama-3-8b
- llama3-70b-8192
- llama-3-70b
- llama3.1
- llama-3.1-8b-instant
- llama-3.1-70b-versatile

**Ban Reason:** Documented performance inaccuracies and inconsistent instruction-following unsuitable for zero-hallucination requirements.
**Enforcement:** hard_block

**Model Selection Priority:**
1. highest_free_output_quota_model
2. highest_context_window_model
3. lowest_hallucination_benchmark_score

**Fallback Behavior:** reject_request_if_only_banned_models_available

### Code Generation Validation

#### TypeScript
- strict_mode: true
- enforce_explicit_types: true
- no_implicit_any: true
- no_unchecked_indexed_access: true
- validate_component_interfaces: true
- fail_build_on_type_error: true

#### TailwindCSS
- validate_against_official_utility_classes: true
- reject_unknown_or_invented_classes: true
- enforce_config_defined_theme_tokens: true
- class_source_of_truth: tailwind.config + official Tailwind CSS documentation

#### General
- require_lint_pass: true
- require_build_pass_before_completion: true
- disallow_todo_stubs_in_final_output: false
- disallow_unverified_api_calls: true

### Secrets and Credentials Policy (Mode: strict)

**Rules:**
- NEVER hardcode API keys, tokens, passwords, secrets, connection strings, or credentials directly into any source file, config file, comment, or commit.
- All secrets MUST be referenced via environment variables (e.g., process.env.VAR_NAME) or a designated secrets manager, never inlined as literal string values.
- Agent MUST auto-generate or update a .env.example file with placeholder keys only (no real values) whenever a new secret variable is introduced.
- Agent MUST verify .env, .env.local, and any credential-bearing files are listed in .gitignore before writing them.
- Agent MUST scan generated diffs/output for patterns resembling API keys, JWTs, private keys, AWS/GCP/Azure credentials, or high-entropy secret strings before finalizing output, and redact or block if found.
- NEVER print, log, echo, or include secret values in terminal output, error messages, chat responses, or generated documentation.
- NEVER commit .env files, credential JSON files (e.g., service-account.json, firebase-adminsdk*.json), or key files (.pem, .key, .pfx) to version control.
- If a secret is discovered already present in code or history during agent execution, agent MUST flag it and recommend rotation instead of silently removing or exposing it in output.

**Detection:**
- scan_before_output: true
- patterns_checked:
  - api_keys
  - bearer_tokens
  - jwt_tokens
  - private_keys
  - database_connection_strings
  - cloud_provider_credentials
  - oauth_client_secrets
  - generic_high_entropy_strings
- on_detection: redact_and_block_output

**Enforcement:** hard_block

### Context Sourcing

**Allowed Sources:**
- explicit_user_provided_files
- project_repository_contents
- confirmed_package_manifests
- official_library_documentation_when_explicitly_fetched

**Disallowed Sources:**
- model_internal_memory_for_api_signatures
- unverified_training_data_assumptions

### Execution Mode
- environment: hackathon_high_speed
- autonomy_level: supervised_agentic
- require_human_confirmation_on:
  - schema_ambiguity
  - missing_type_definitions
  - banned_model_fallback_trigger
  - detected_secret_or_credential_in_output
