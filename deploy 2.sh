#!/bin/bash

# LineSmart Platform - Google Cloud Deployment Script
# Run this script to deploy your application to Google Cloud

set -e

echo "🚀 LineSmart Platform - Google Cloud Deployment"
echo "=============================================="

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get project ID (user can override)
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "📝 Enter your Google Cloud Project ID:"
    read -p "Project ID: " PROJECT_ID
else
    PROJECT_ID=$GOOGLE_CLOUD_PROJECT
fi

# Set the project
echo "🔧 Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy
echo "🏗️  Building and deploying application..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/linesmart-platform

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy linesmart-platform \
    --image gcr.io/$PROJECT_ID/linesmart-platform \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be available at:"
gcloud run services describe linesmart-platform --region us-central1 --format 'value(status.url)'

echo ""
echo "📊 To view logs:"
echo "gcloud logs tail /projects/$PROJECT_ID/logs/run.googleapis.com"
