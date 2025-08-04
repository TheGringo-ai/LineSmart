# Cloud Storage Setup Guide for RAG Document Management

This guide walks you through setting up different cloud storage providers for your LineSmart platform's RAG document management system.

## 🛡️ **Option 1: Secure Database (Recommended)**

**✅ No setup required!** Your documents are automatically stored in our SOC2-compliant, encrypted database.

**Features:**
- End-to-end encryption
- SOC2 Type II certified
- GDPR compliant
- Automatic daily backups
- Real-time virus scanning
- 99.9% uptime SLA

**Pricing:** Included in your subscription

---

## ☁️ **Option 2: Google Cloud Storage**

### Prerequisites
- Google Cloud Platform account
- Billing enabled
- Cloud Storage API enabled

### Step-by-Step Setup

#### 1. Create a Storage Bucket
```bash
# Install Google Cloud SDK if not already installed
curl https://sdk.cloud.google.com | bash
source ~/.bashrc
gcloud auth login

# Create a new project (or use existing)
gcloud projects create my-linesmart-storage --name="LineSmart Storage"
gcloud config set project my-linesmart-storage

# Enable required APIs
gcloud services enable storage.googleapis.com
gcloud services enable iam.googleapis.com

# Create storage bucket
gsutil mb -l us-central1 gs://my-linesmart-documents
```

#### 2. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create linesmart-storage \
    --display-name="LineSmart Storage Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding my-linesmart-storage \
    --member="serviceAccount:linesmart-storage@my-linesmart-storage.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create ~/linesmart-gcs-key.json \
    --iam-account=linesmart-storage@my-linesmart-storage.iam.gserviceaccount.com
```

#### 3. Configure in LineSmart
1. Go to RAG Documents → Storage Settings
2. Select "Google Cloud Storage"
3. Fill in:
   - **Project ID**: `my-linesmart-storage`
   - **Bucket Name**: `my-linesmart-documents`
   - **Service Account Key**: Copy the contents of `~/linesmart-gcs-key.json`
   - **Region**: `us-central1`
4. Click "Test Connection"
5. Save Configuration

### Security Best Practices
- Use least-privilege IAM roles
- Enable bucket versioning: `gsutil versioning set on gs://my-linesmart-documents`
- Set retention policy: `gsutil retention set 7d gs://my-linesmart-documents`
- Enable audit logging

### Estimated Costs
- Storage: $0.020/GB/month (Standard)
- Operations: $0.004/1000 operations
- Network: $0.12/GB egress

---

## 🔶 **Option 3: Amazon S3**

### Prerequisites
- AWS account
- AWS CLI installed
- Billing configured

### Step-by-Step Setup

#### 1. Create S3 Bucket
```bash
# Install AWS CLI
pip install awscli
aws configure

# Create bucket
aws s3 mb s3://my-linesmart-training-docs --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket my-linesmart-training-docs \
    --versioning-configuration Status=Enabled
```

#### 2. Create IAM User and Policy
```bash
# Create IAM user
aws iam create-user --user-name linesmart-s3-user

# Create policy
cat << EOF > linesmart-s3-policy.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::my-linesmart-training-docs",
                "arn:aws:s3:::my-linesmart-training-docs/*"
            ]
        }
    ]
}
EOF

# Apply policy
aws iam create-policy \
    --policy-name LineSmart-S3-Access \
    --policy-document file://linesmart-s3-policy.json

# Attach policy to user
aws iam attach-user-policy \
    --user-name linesmart-s3-user \
    --policy-arn arn:aws:iam::YOUR-ACCOUNT-ID:policy/LineSmart-S3-Access

# Create access keys
aws iam create-access-key --user-name linesmart-s3-user
```

#### 3. Configure in LineSmart
1. Go to RAG Documents → Storage Settings
2. Select "Amazon S3"
3. Fill in:
   - **Access Key ID**: From step 2
   - **Secret Access Key**: From step 2
   - **Bucket Name**: `my-linesmart-training-docs`
   - **Region**: `us-east-1`
4. Click "Test Connection"
5. Save Configuration

### Security Best Practices
- Enable bucket encryption
- Use bucket policies for additional security
- Enable CloudTrail for audit logging
- Set up lifecycle policies

### Estimated Costs
- Storage: $0.023/GB/month (Standard)
- Requests: $0.0004/1000 PUT requests
- Data transfer: $0.09/GB

---

## 🔷 **Option 4: Azure Blob Storage**

### Prerequisites
- Azure account
- Azure CLI installed
- Resource group created

### Step-by-Step Setup

#### 1. Create Storage Account
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login

# Create resource group
az group create \
    --name linesmart-storage-rg \
    --location eastus

# Create storage account
az storage account create \
    --name linesmartdocuments \
    --resource-group linesmart-storage-rg \
    --location eastus \
    --sku Standard_LRS \
    --kind StorageV2

# Create container
az storage container create \
    --name training-documents \
    --account-name linesmartdocuments
```

#### 2. Get Connection Details
```bash
# Get storage account key
az storage account keys list \
    --resource-group linesmart-storage-rg \
    --account-name linesmartdocuments \
    --output table

# Get connection string
az storage account show-connection-string \
    --resource-group linesmart-storage-rg \
    --name linesmartdocuments \
    --output tsv
```

#### 3. Configure in LineSmart
1. Go to RAG Documents → Storage Settings
2. Select "Azure Blob Storage"
3. Fill in:
   - **Storage Account Name**: `linesmartdocuments`
   - **Account Key**: From step 2
   - **Container Name**: `training-documents`
   - **Endpoint**: `https://linesmartdocuments.blob.core.windows.net/`
4. Click "Test Connection"
5. Save Configuration

### Security Best Practices
- Enable Azure Storage encryption
- Use Azure Active Directory for authentication
- Enable diagnostic logging
- Set up network access restrictions

### Estimated Costs
- Storage: $0.0184/GB/month (Hot tier)
- Operations: $0.0065/10,000 transactions
- Data transfer: $0.087/GB

---

## 🔄 **Migration Between Providers**

If you need to switch storage providers:

1. **Export existing documents** from current provider
2. **Configure new storage provider** following the guide above
3. **Upload documents** to new provider through RAG Documents interface
4. **Update storage configuration** in LineSmart
5. **Test functionality** to ensure everything works

---

## 🆘 **Troubleshooting**

### Common Issues

#### Google Cloud Storage
- **Error: "Access denied"** → Check service account permissions
- **Error: "Bucket not found"** → Verify bucket name and project ID
- **Error: "Invalid JSON key"** → Ensure complete JSON key is copied

#### Amazon S3
- **Error: "SignatureDoesNotMatch"** → Check access keys and region
- **Error: "BucketAlreadyExists"** → S3 bucket names must be globally unique
- **Error: "AccessDenied"** → Verify IAM policy permissions

#### Azure Blob Storage
- **Error: "Authentication failed"** → Check account name and key
- **Error: "Container not found"** → Verify container name and permissions
- **Error: "Invalid connection string"** → Get fresh connection string from Azure portal

### Getting Help

1. **Check the connection test** in storage settings
2. **Review error messages** for specific guidance
3. **Verify network connectivity** to cloud providers
4. **Contact support** if issues persist

---

## 📊 **Storage Comparison**

| Feature | Secure DB | Google Cloud | AWS S3 | Azure Blob |
|---------|-----------|--------------|--------|------------|
| Setup Complexity | None | Medium | Medium | Medium |
| Cost | Included | Pay-per-use | Pay-per-use | Pay-per-use |
| Data Control | Shared | Full | Full | Full |
| Compliance | SOC2/GDPR | SOC2/GDPR | SOC2/GDPR | SOC2/GDPR |
| Geographic Control | Limited | Full | Full | Full |
| Technical Expertise | None | Medium | Medium | Medium |

**Recommendation**: Start with **Secure Database** for simplicity, upgrade to cloud storage for compliance or data residency requirements.
