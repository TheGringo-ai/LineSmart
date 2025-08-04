import React, { useState } from 'react';
import { Settings, Key, Database, Cloud, Shield, CheckCircle, AlertCircle, TestTube } from 'lucide-react';

const StorageConfiguration = ({ currentConfig, onConfigUpdate, onTestConnection }) => {
  const [selectedProvider, setSelectedProvider] = useState(currentConfig?.provider || 'secure-db');
  const [config, setConfig] = useState(currentConfig?.config || {});
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState({});

  const storageProviders = {
    'secure-db': {
      name: 'Secure Database (Recommended)',
      description: 'Our SOC2-compliant, encrypted database with automatic backups',
      icon: Shield,
      color: 'bg-green-50 border-green-200 text-green-800',
      features: [
        'End-to-end encryption',
        'SOC2 Type II certified',
        'GDPR compliant',
        'Automatic daily backups',
        'Real-time virus scanning',
        '99.9% uptime SLA'
      ],
      pricing: 'Included in your subscription',
      setup: 'No setup required - ready to use',
      fields: []
    },
    'google-cloud': {
      name: 'Google Cloud Storage',
      description: 'Use your own Google Cloud Storage bucket for full control',
      icon: Cloud,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      features: [
        'Your own GCS bucket',
        'Full data control',
        'Custom retention policies',
        'Regional/multi-regional storage',
        'Lifecycle management',
        'Direct Google Cloud billing'
      ],
      pricing: 'Google Cloud Storage pricing',
      setup: 'Requires GCS bucket and service account',
      fields: [
        { id: 'projectId', label: 'Project ID', type: 'text', required: true, placeholder: 'my-gcp-project' },
        { id: 'bucketName', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-training-documents' },
        { id: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea', required: true, placeholder: 'Paste your service account JSON key here...' },
        { id: 'region', label: 'Region', type: 'select', required: true, options: [
          { value: 'us-central1', label: 'US Central (Iowa)' },
          { value: 'us-east1', label: 'US East (South Carolina)' },
          { value: 'us-west1', label: 'US West (Oregon)' },
          { value: 'europe-west1', label: 'Europe West (Belgium)' },
          { value: 'asia-east1', label: 'Asia East (Taiwan)' }
        ]}
      ]
    },
    'aws-s3': {
      name: 'Amazon S3',
      description: 'Use your own AWS S3 bucket with full AWS integration',
      icon: Cloud,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      features: [
        'Your own S3 bucket',
        'Full data control',
        'Intelligent tiering',
        'Cross-region replication',
        'Advanced security features',
        'Direct AWS billing'
      ],
      pricing: 'AWS S3 pricing',
      setup: 'Requires S3 bucket and IAM credentials',
      fields: [
        { id: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true, placeholder: 'AKIA...' },
        { id: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true, placeholder: 'Your secret access key' },
        { id: 'bucketName', label: 'Bucket Name', type: 'text', required: true, placeholder: 'my-training-bucket' },
        { id: 'region', label: 'Region', type: 'select', required: true, options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'Europe (Ireland)' },
          { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
          { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
        ]}
      ]
    },
    'azure-blob': {
      name: 'Azure Blob Storage',
      description: 'Use your own Azure Storage account with enterprise features',
      icon: Cloud,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      features: [
        'Your own storage account',
        'Full data control',
        'Hot/Cool/Archive tiers',
        'Global distribution',
        'Advanced threat protection',
        'Direct Azure billing'
      ],
      pricing: 'Azure Blob Storage pricing',
      setup: 'Requires storage account and connection string',
      fields: [
        { id: 'accountName', label: 'Storage Account Name', type: 'text', required: true, placeholder: 'mystorageaccount' },
        { id: 'accountKey', label: 'Account Key', type: 'password', required: true, placeholder: 'Your storage account key' },
        { id: 'containerName', label: 'Container Name', type: 'text', required: true, placeholder: 'training-documents' },
        { id: 'endpoint', label: 'Endpoint (Optional)', type: 'text', required: false, placeholder: 'https://mystorageaccount.blob.core.windows.net/' }
      ]
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResults({});

    try {
      const result = await onTestConnection?.(selectedProvider, config);
      setTestResults({
        success: result.success,
        message: result.message,
        details: result.details
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: error.message || 'Connection test failed',
        details: error.details
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfiguration = () => {
    onConfigUpdate?.({
      provider: selectedProvider,
      config: config
    });
  };

  const renderConfigFields = () => {
    const provider = storageProviders[selectedProvider];
    if (!provider.fields || provider.fields.length === 0) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Ready to use!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            No configuration required. Your documents will be stored securely in our encrypted database.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {provider.fields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={config[field.id] || ''}
                onChange={(e) => handleConfigChange(field.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={field.required}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={config[field.id] || ''}
                onChange={(e) => handleConfigChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={field.required}
              />
            ) : (
              <input
                type={field.type}
                value={config[field.id] || ''}
                onChange={(e) => handleConfigChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={field.required}
              />
            )}
          </div>
        ))}

        {/* Test Connection Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          {testResults.success !== undefined && (
            <div className={`flex items-center space-x-2 ${
              testResults.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {testResults.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{testResults.message}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">⚙️ Storage Configuration</h3>
      </div>

      {/* Provider Selection */}
      <div className="space-y-4 mb-8">
        <h4 className="font-medium text-gray-900">Choose Your Storage Provider</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(storageProviders).map(([id, provider]) => {
            const IconComponent = provider.icon;
            return (
              <div
                key={id}
                onClick={() => setSelectedProvider(id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider === id ? provider.color : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className="h-6 w-6 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium mb-1">{provider.name}</h5>
                    <p className="text-sm opacity-75 mb-3">{provider.description}</p>
                    
                    <div className="space-y-1 mb-3">
                      {provider.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="text-xs flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {provider.features.length > 3 && (
                        <div className="text-xs opacity-75">+{provider.features.length - 3} more features</div>
                      )}
                    </div>
                    
                    <div className="text-xs">
                      <div className="font-medium">💰 {provider.pricing}</div>
                      <div className="opacity-75 mt-1">🔧 {provider.setup}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="space-y-6">
        <h4 className="font-medium text-gray-900">
          Configure {storageProviders[selectedProvider].name}
        </h4>
        
        {renderConfigFields()}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveConfiguration}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageConfiguration;
