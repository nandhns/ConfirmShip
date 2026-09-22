# ConfirmShip

### Smarter Shipping. Safer Trade.

ConfirmShip is an AI-assisted shipping document verification platform designed to reduce manual effort and human error when reviewing shipping documentation.

The system processes incoming shipping-related emails, identifies their intent, extracts information from attached shipping documents, and compares key fields between Shipping Instructions (SI) and Bills of Lading (BL). Potential discrepancies and cases that cannot be confidently processed are surfaced for review instead of being silently accepted.

---

## Problem Statement

Shipping documentation involves large amounts of repetitive manual verification.

For workflows involving Shipping Instructions (SI) and Bills of Lading (BL), operators may need to inspect documents and compare important shipment information field by field. This process can be time-consuming and susceptible to overlooked discrepancies, particularly when document formats and values are inconsistent.

ConfirmShip aims to assist this process by providing an automated pipeline that can:

* Understand the purpose of incoming shipping emails.
* Process attached shipping documents.
* Extract important shipment information.
* Compare SI and BL data consistently.
* Identify mismatches and uncertain cases.
* Present verification results clearly to the user.

The goal is not simply to automate document comparison, but to make shipping-document verification faster, more consistent, and easier to review.

---

## Key Features

### Email Classification

Incoming emails are classified into supported categories:

* `BL_COMPARISON`
* `SI_REQUEST`
* `INVOICE_QUERY`
* `GENERAL`
* `SPAM`

Classification results can also retain confidence and uncertainty information so that ambiguous cases can be handled appropriately.

### Shipping Document Extraction

ConfirmShip processes shipping-document attachments and converts relevant information into a common structured representation.

Supported canonical fields include:

* Shipper
* Consignee
* Notify Party
* Port of Loading
* Port of Discharge
* Container Count
* Gross Weight

The extraction pipeline also records missing or uncertain fields rather than assuming that every value was successfully extracted.

### SI–BL Verification

For Bill of Lading comparison requests, ConfirmShip compares extracted SI and BL information field by field.

Each comparison retains:

* SI value
* BL value
* Normalised SI value
* Normalised BL value
* Match result
* Reason for the comparison result, where applicable

This allows the system to identify which specific fields contain discrepancies instead of returning only a generic pass/fail result.

### Uncertainty Handling

Not every shipping document can be processed confidently.

ConfirmShip explicitly supports review scenarios such as:

* Wrong document type
* Missing attachment
* Unreadable document
* Missing value
* Uncertain extraction

A case can therefore be marked for review instead of forcing an unreliable automated decision.

### Structured Verification Results

Processed emails produce structured results containing the email classification, extracted SI and BL documents where applicable, and the final verification result.

Verification outcomes distinguish between:

* No mismatch
* Mismatch
* Needs review

---

# Technical Architecture

ConfirmShip follows a modular client-server architecture that separates the user interface, API, processing logic, challenge data source, and external AI/document-processing capabilities.

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  React Frontend      │
                         │      Vercel          │
                         └──────────┬───────────┘
                                    │ HTTPS / REST
                                    ▼
                         ┌──────────────────────┐
                         │ FastAPI Backend      │
                         │       Render         │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼──────────────────┐
                  │                 │                  │
                  ▼                 ▼                  ▼
           Classification      Extraction         Verification
                  │                 │                  │
                  └─────────────────┼──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ AI / OCR Fallback    │
                         │ Gemini / OpenAI      │
                         └──────────────────────┘

                                    ▲
                                    │
                         ┌──────────┴───────────┐
                         │ Challenge Inbox      │
                         │       Render         │
                         └──────────────────────┘
```

### Processing Flow

A typical BL verification workflow follows:

```text
Incoming Email
      │
      ▼
Email Classification
      │
      ├── Non-BL request ──► Return classification/result
      │
      ▼
Identify SI / BL Attachments
      │
      ▼
Extract Document Content
      │
      ▼
Extract Canonical Fields
      │
      ▼
Normalise Values
      │
      ▼
Compare SI ↔ BL
      │
      ├── Matching ────────► No Mismatch
      │
      ├── Different ───────► Mismatch
      │
      └── Uncertain ───────► Needs Review
```

---

# Technology Stack

## Frontend

* React
* Vercel

## Backend

* Python
* FastAPI
* Pydantic
* REST APIs

## AI & Document Processing

* Gemini / OpenAI integration where required
* OCR / text extraction pipeline
* Structured field extraction
* Rule-based normalisation and comparison

## Infrastructure

* Vercel — frontend deployment
* Render — FastAPI backend deployment
* Render — challenge inbox/server deployment
* Environment-based configuration

---

# Implementation Details

## 1. Email Classification

The processing pipeline first determines what type of request an incoming email represents.

Rather than treating every email as a shipping-document comparison request, ConfirmShip separates emails into domain-specific categories before performing more expensive downstream processing.

Classification results contain the predicted category, confidence score, optional reason, and uncertainty information.

This separation allows later processing stages to respond differently depending on the email's purpose.

---

## 2. Document Extraction

Attachments associated with relevant emails are processed to obtain their contents.

ConfirmShip represents extracted documents using a common structure regardless of whether the source document is an SI or BL.

The system records:

* Document type
* Source path
* Whether the document was readable
* Extracted fields
* Missing fields
* Uncertain fields
* Extraction method
* Processing errors

This provides downstream verification logic with structured information while retaining information about extraction quality.

---

## 3. Canonical Field Representation

Shipping documents can represent equivalent information using different formatting.

ConfirmShip therefore converts extracted information into a predefined set of canonical fields before comparison.

Examples include:

```text
shipper
consignee
notify_party
port_of_loading
port_of_discharge
container_count
gross_weight_kg
```

Separating the raw extracted value from its normalised value allows the verification layer to compare semantically equivalent information more consistently.

---

## 4. SI–BL Comparison

Once both documents have been processed, ConfirmShip compares corresponding canonical fields.

Instead of producing only a single Boolean result, the comparison retains information for every field.

Conceptually:

```text
SI
"PORT KLANG"

        ↓ normalisation

"port klang"

        ↕ compare

"port klang"

        ↑ normalisation

BL
"Port Klang"
```

The final verification response includes individual field comparisons and a list of fields identified as defective.

---

## 5. Uncertainty and Review Handling

Automation should not silently make decisions when the underlying information is unreliable.

ConfirmShip therefore distinguishes a confirmed mismatch from a case that cannot be confidently verified.

For example:

```text
Readable SI + Readable BL
            │
            ▼
      Compare fields
            │
      ┌─────┴─────┐
      ▼           ▼
    Match      Difference
      │           │
      ▼           ▼
No Mismatch    Mismatch


Unreadable / Missing / Uncertain
            │
            ▼
       Needs Review
```

This creates a foundation for a human-in-the-loop workflow in future versions.

---

## 6. API Layer

The FastAPI backend exposes the processing functionality to the frontend through REST endpoints.

The API layer is separated from the underlying integration, extraction, verification, and review logic to keep the application modular and easier to extend.

FastAPI also provides interactive API documentation through Swagger for development and testing.

---

# Deployment Architecture

The deployed application consists of three main services:

```text
User
 │
 ▼
Vercel
ConfirmShip Frontend
 │
 │ REST API
 ▼
Render
ConfirmShip FastAPI Backend
 │
 │ CHALLENGE_SERVER_URL
 ▼
Render
Challenge Inbox Server
```

The challenge server acts as the inbox/data source supplied for the challenge, while the ConfirmShip backend contains the application's processing logic.

Environment variables allow different data sources and services to be used without hard-coding deployment-specific URLs.

For example:

```env
CHALLENGE_SERVER_URL=http://localhost:8081
```

can be used during local development, while the deployed backend can point to the hosted challenge server.

---

# Challenges Faced

## 1. Handling Inconsistent Shipping Documents

### Challenge

Shipping documents do not always represent information using identical labels, formatting, casing, spacing, or value representations.

Direct string comparison would therefore generate false mismatches.

### Approach

ConfirmShip separates extraction from normalisation. Raw values are retained while a normalised representation is produced specifically for verification.

This allows the verification logic to compare standardised values without losing the original document information.

---

## 2. Distinguishing Mismatches from Uncertainty

### Challenge

A missing value or failed extraction does not necessarily mean that two documents contradict each other.

Treating every extraction failure as a mismatch could produce misleading results.

### Approach

ConfirmShip models uncertainty explicitly.

Cases involving missing attachments, unreadable documents, missing values, incorrect document types, or uncertain extraction can be classified as `needs_review` instead of automatically being labelled as mismatches.

---

## 3. Integrating Multiple Processing Stages

### Challenge

The solution requires several stages to work together:

```text
Email
→ Classification
→ Attachment processing
→ Extraction
→ Normalisation
→ Verification
→ API response
```

Failures in an earlier stage can affect every downstream result.

### Approach

The backend was structured into separate API, integration, model, processing, and review responsibilities so that each stage can evolve independently while sharing well-defined data structures.

---

## 4. Integrating the Challenge Inbox with Deployment

### Challenge

During local development, the provided challenge inbox runs as a separate service on localhost.

Once ConfirmShip is deployed, the hosted backend can no longer access a service running on a developer's laptop.

### Approach

The challenge server and ConfirmShip API are deployed as separate services.

The backend obtains the challenge server address through the `CHALLENGE_SERVER_URL` environment variable, allowing the same integration code to work with local and hosted environments.

---

## 5. Reliable AI-Assisted Extraction

### Challenge

AI and OCR outputs may be incomplete or uncertain, especially when dealing with inconsistent or difficult documents.

### Approach

AI-assisted processing is treated as part of a structured extraction pipeline rather than as an unquestioned source of truth.

Extracted values retain confidence and uncertainty information, while problematic cases can be routed to review instead of being silently accepted.

---

# Testing and Validation

ConfirmShip's verification design supports validation at multiple levels:

* Email classification
* Attachment identification
* Document extraction
* Canonical field extraction
* Field normalisation
* SI–BL field comparison
* Missing-field handling
* Uncertain extraction handling
* Review-status determination

The repository also contains automated tests for review logic and scripts for testing the challenge loader.

Further quantitative evaluation will be added as the prototype is tested against the supplied challenge dataset.

---

# Project Structure

```text
ConfirmShip/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── integrations/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── review/
│   ├── scripts/
│   ├── tests/
│   └── requirements.txt
│
├── challenge/
│   ├── data_v2/
│   │   ├── attachments/
│   │   └── inbox/
│   │
│   └── server/
│
├── frontend/
│
├── docs/
│   └── ARCHITECTURE.MD
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# Local Setup

## Prerequisites

Ensure the following are installed:

* Python
* Node.js / npm
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/nandhns/ConfirmShip.git
cd ConfirmShip
```

---

## 2. Configure Environment Variables

Create your local `.env` based on `.env.example`.

For local challenge-server access:

```env
CHALLENGE_SERVER_URL=http://localhost:8081
```

Add any required AI/API credentials to the environment without committing secrets to the repository.

---

## 3. Start the Challenge Server

Start the provided challenge environment according to the challenge server configuration.

Confirm that the inbox endpoint is accessible before starting ConfirmShip.

---

## 4. Start the Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

The API will normally be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

## 5. Start the Frontend

```bash
cd frontend

npm install
npm run dev
```

Open the URL provided by the frontend development server.

---

# Future Roadmap

ConfirmShip is currently designed as a focused prototype for shipping-document verification. Several extensions could turn the prototype into a more complete operational platform.

### Human-in-the-Loop Review

Expand the review workflow so operators can inspect uncertain fields, correct extracted information, approve results, and provide feedback for future processing.

### Production Email Integration

Replace the challenge inbox with integration into real email systems so shipping emails and attachments can enter the processing pipeline automatically.

### Additional Document Types

Extend extraction beyond SI and BL documents to other shipping and trade documents, such as invoices, packing lists, and supporting documentation.

### Improved Document Intelligence

Expand OCR and AI-assisted extraction to support a wider variety of document layouts, scanned files, and difficult document formats.

### Audit Trail

Persist verification results, corrections, processing decisions, and timestamps to provide traceability for operational and compliance purposes.

### Authentication and Role-Based Access

Introduce authenticated users and roles for operators, reviewers, and administrators.

### Analytics and Monitoring

Provide dashboards for:

* Documents processed
* Mismatch frequency
* Common defect fields
* Review frequency
* Processing time
* Extraction confidence

### Scalability

Move document processing toward asynchronous/background jobs where appropriate, introduce persistent storage, and independently scale extraction and AI workloads as processing volume increases.

---

# Success Metrics

As development continues, ConfirmShip can be evaluated using metrics such as:

* Classification accuracy
* Field extraction accuracy
* Mismatch detection accuracy
* False-positive mismatch rate
* Percentage of cases requiring human review
* Average document-processing time
* Reduction in manual comparison effort

These metrics provide a path for evaluating both technical performance and operational value.

---

# Security and Configuration

Sensitive credentials must be supplied through environment variables and should never be committed to source control.

The repository includes `.env.example` to document required configuration while keeping actual credentials outside version control.

---

# Live Demo

**Frontend:**
`https://confirmship.vercel.app/`

**Backend API:**
`https://confirmship.onrender.com`

**API Documentation:**
`https://confirmship.onrender.com/docs`

---

# Repository

**GitHub:**
`https://github.com/nandhns/ConfirmShip.git`

---

# Team

**Team Name:** `Britiff`

**Project:** ConfirmShip

**Tagline:** *Smarter Shipping. Safer Trade.*

---

## About ConfirmShip

ConfirmShip demonstrates how AI-assisted document intelligence can support repetitive shipping-document verification while retaining visibility into mismatches and uncertainty.

Rather than treating automation as a replacement for human judgement, the system focuses on automating repetitive comparison work and making exceptions easier to identify and review.

**Smarter Shipping. Safer Trade.**

## Team
- Anis Nadiah 
- Muhammad Aiman 
- Muhammad Zulfaqa
- Syed Ahmad Wazif


## 🔗 Links
- Live Demo: https://youtu.be/hPz6wnGT9nA
- Deck: https://docs.google.com/presentation/d/1xasvfEhxCLQzPck7Y9f9_hh-IsV07hoD/edit?usp=drive_link&ouid=110217070522757834845&rtpof=true&sd=true
- Demo Link: https://confirmship.vercel.app/

Do note that we have limit our memory limit, thus why the data isn't being displayed correctly. 
