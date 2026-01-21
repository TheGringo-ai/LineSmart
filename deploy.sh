#!/bin/bash

# LineSmart Platform - Google Cloud Deployment Script
# Deploys both frontend (React) and backend (Express API) to Cloud Run

set -e

echo "🚀 LineSmart Platform - Google Cloud Deployment"
echo "================================================"
echo ""

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
gcloud services enable secretmanager.googleapis.com

REGION="us-central1"

# ==========================================
# DEPLOY FRONTEND
# ==========================================
echo ""
echo "🏗️  Building and deploying FRONTEND..."
echo "--------------------------------------"

# Build frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/linesmart-web .

# Deploy frontend to Cloud Run
gcloud run deploy linesmart-web \
    --image gcr.io/$PROJECT_ID/linesmart-web \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1

FRONTEND_URL=$(gcloud run services describe linesmart-web --region $REGION --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

# ==========================================
# DEPLOY BACKEND API
# ==========================================
echo ""
echo "🏗️  Building and deploying BACKEND API..."
echo "------------------------------------------"

# Build backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/linesmart-api ./server

# Deploy backend to Cloud Run with environment variables
gcloud run deploy linesmart-api \
    --image gcr.io/$PROJECT_ID/linesmart-api \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --set-env-vars "NODE_ENV=production,FRONTEND_URL=$FRONTEND_URL"

API_URL=$(gcloud run services describe linesmart-api --region $REGION --format 'value(status.url)')
echo "✅ Backend API deployed at: $API_URL"

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "=============================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🌐 Frontend:  $FRONTEND_URL"
echo "🔌 API:       $API_URL"
echo ""
echo "⚠️  IMPORTANT: Set your API secrets in Cloud Run:"
echo ""
echo "gcloud run services update linesmart-api --region $REGION \\"
echo "  --set-env-vars \"OPENAI_API_KEY=your_key,FIREBASE_PROJECT_ID=your_project\""
echo ""
echo "📊 To view logs:"
echo "gcloud logs tail --project=$PROJECT_ID"
echo ""
echo "💡 Using gpt-4o-mini model (66x cheaper than gpt-4-turbo)"
