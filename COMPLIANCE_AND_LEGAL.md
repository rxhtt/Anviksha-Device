# Compliance & Legal Strategy: Anviksha AI

## Pillar 4: The Judge-Improviser

### 1. Digital Personal Data Protection (DPDP) Act 2023 Checklist
Anviksha AI is designed as a "Data Fiduciary" with the following mandatory features:
- [ ] **Consent Manager**: A dedicated screen asking for explicit consent before processing any medical image.
- [ ] **Notice in Local Languages**: Privacy notice available in Kannada, Hindi, and English.
- [ ] **Right to Erasure**: A 'Delete My Data' button in user settings that triggers an S3 lifecycle delete.
- [ ] **Data Principal Rights**: Dashboard for users to view what health data is stored and for what purpose.

### 2. CDSCO Roadmap (Medical Device Rule 2017)
To achieve Class C (Medium-High Risk) certification in India:
- [ ] **Algorithm Version Control**: Every diagnostic output must tag the specific Model ID and System Instruction version (Immutable logging).
- [ ] **Technical Logs**: Maintain logs of "Reasoning Paths" for 10 years (Auditable trail).
- [ ] **Post-Market Surveillance**: Feedback loop where Doctors flag AI errors to retune the specialist personas.
- [ ] **ISO 13485**: Align software development lifecycle (SDLC) with Quality Management Systems for medical devices.

### 3. Liability & B2B Terms Summary
*   **Disclaimer**: "Anviksha AI is a Diagnostic Support Tool (DST) designed for Registered Medical Practitioners (RMPs) and not a replacement for clinical judgment. No doctor-patient relationship is formed by using the AI Manager."
*   **Zero-Persistence Policy Option**: For B2B partners, we offer a 'Stateless Mode' where data is processed in RAM and never hits the disk.
*   **Indemnity**: Standard B2B clause stating the software is provided "as-is" for research and screening support.

### 4. Implementation Logic
*   **JWT Security**: HS256 algorithm with 15-minute expiry for sessions, refreshing only on biometric re-auth.
*   **E2E Encryption**: Patient-specific keys generated on-device (Web Crypto API) so even Anviksha servers cannot read the raw medical image without the user's key.
