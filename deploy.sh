#!/bin/bash
set -e

echo "🚀 Deploying LineSmart Platform..."

# Set project if not already set
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-fredfix}
gcloud config set project $PROJECT_ID

# Deploy using Cloud Build
gcloud builds submit --config=cloudbuild.yaml

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://linesmart-platform-650169261019.us-central1.run.app"
