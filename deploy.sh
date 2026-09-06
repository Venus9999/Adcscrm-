#!/usr/bin/env bash
set -e

echo "=== ADCS CRM 1-Click Cloud Run Deployer ==="

# 1. Get Project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo "Error: No active GCP project. Set it using: gcloud config set project <YOUR_PROJECT_ID>"
  exit 1
fi
echo "Project ID: $PROJECT_ID"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
echo "Project Number: $PROJECT_NUMBER"

# 2. Enable Required APIs
echo "Enabling Cloud Run, Cloud Build, and Artifact Registry APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 3. Grant Cloud Build permission to push container images to Artifact Registry
echo "Configuring Artifact Registry permissions for Cloud Build..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" --quiet || true

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.writer" --quiet || true

# 4. Deploy to Cloud Run
echo "Deploying ADCS CRM to Google Cloud Run (Region: europe-west2)..."
gcloud run deploy adcs-crm \
  --source . \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi

echo "=== Deployment Successful! ==="
