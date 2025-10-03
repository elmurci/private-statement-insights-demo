import { SecretVaultBuilderClient, SecretVaultUserClient, Uuid } from '@nillion/secretvaults';
import {
    Keypair,
    Command,
} from '@nillion/nuc';

import { grantWriteAccessToUser, bytesToHex, publicKeyToDid, generateToken } from '../lib/util'
import {
    SecretKey,
} from '@nillion/blindfold';
import { nillionNetworkConfig } from '../config';

// API service for external communication
export interface BankStatement {
  file: File;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface FinancialInsights {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  trends: {
    incomeChange: number;
    expenseChange: number;
  };
}

export interface ProcessingStep {
  step: string;
  message: string;
  completed: boolean;
  timestamp: Date;
}

export interface UploadResult {
  uploadId: string;
  fileName: string;
  fileSize: number;
  status: 'uploaded' | 'failed';
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // This would come from environment variables in a real app
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  /**
   * Upload bank statement file to the processing service
   */
  async uploadBankStatement(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  }

  /**
   * Start nilCC workload
   */
  async createNilCCWorkload(
    documentId: string,
    collectionId: string,
    delegationTokens: string
  ): Promise<{ status: string }> {
    try {
      console.log('🔧 Creating nilCC workload...');
      const composeResponse = await fetch('/docker/compose.yaml');
      const dockerCompose = await composeResponse.text();
      const response = await fetch('/api/v1/workloads/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "private-stamement-workload",
          artifactsVersion: "0.1.2",
          dockerCompose,
          envVars: {
            "DOCUMENT_ID": documentId,
            "COLLECTION_ID": collectionId,
            "DELEGATION_TOKENS": delegationTokens
          },
          publicContainerName: "private-statements",
          publicContainerPort: 8080,
          memory: 1024,
          cpus: 1,
          disk: 10,
          gpus: 0,
          workloadId: crypto.randomUUID(),
          creditRate: 0,
          status: "scheduled",
          accountId: "private-statements-account",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create workload: ${response.statusText}`);
      }

      const workloadData = await response.json();
      console.log('✅ nilCC workload created:', workloadData);
      return workloadData;
    } catch (error) {
      console.error('Failed to create nilCC workload:', error);
      throw new Error('Failed to create nilCC workload.');
    }
  }

  async deleteWorkload(workloadId: string): Promise<any> {
    try {
      const response = await fetch(`/api/v1/workloads/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            workloadId,
          }
        ),
      });
      
      if (!response.ok) {
        throw new Error(`Workload delete failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Workload delete error:', error);
      throw new Error('Failed to delete workload.');
    }
  }

  async getWorkloadStatus(workloadId: string): Promise<any> {
    try {
      const response = await fetch(`/api/v1/workloads/${workloadId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error('Failed to check processing status.');
    }
  }

  async getNilAIStatus(workloadId: string): Promise<any> {
    try {
      const response = await fetch(`/workload/${workloadId}/status`);

      console.log("response", response);
      
      if (!response.ok) {
        throw new Error(`nilAI status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('nilAI status check error:', error);
      throw new Error('Failed to check processing nilAI status.');
    }
  }


  async getProcessingStatus(uploadId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    steps: ProcessingStep[];
    progress: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${uploadId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error('Failed to check processing status.');
    }
  }

  /**
   * Get financial insights once processing is complete
   */
  async getFinancialInsights(uploadId: string): Promise<FinancialInsights> {
    try {
      const response = await fetch(`${this.baseUrl}/insights/${uploadId}`);
      
      if (!response.ok) {
        throw new Error(`Insights fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Insights fetch error:', error);
      throw new Error('Failed to fetch financial insights.');
    }
  }

  /**
   * Upload to nilDB
   */
  async uploadToNilDB(file: File): Promise<UploadResult> {
    const builderKey = import.meta.env.VITE_BUILDER_KEY;
    const nilChainUrl = nillionNetworkConfig.nilchain.url;
    const nilAuthUrl = nillionNetworkConfig.nilauth.url;
    const nilDbNodes = nillionNetworkConfig.nildb.servers.map(server => server.url);
    const collectionId = import.meta.env.VITE_COLLECTION_ID || "ce9b1d1c-8006-4053-a0c8-f46ad711fc26";
    
    try {
      const builderKeypair = Keypair.from(builderKey);
      const builder = await SecretVaultBuilderClient.from({
          keypair: builderKeypair,
          urls: {
            chain: nilChainUrl,
            auth: nilAuthUrl,
            dbs: nilDbNodes,
          },
          blindfold: {
            operation: "store",
          }
      });

      await builder.refreshRootToken();

      const pdfData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log("File", pdfData);

      const chunkSize = 4000;
      const chunks = [];
      for (let i = 0; i < pdfData.length; i += chunkSize) {
        const chunk = pdfData.slice(i, i + chunkSize);
        chunks.push({
          "%allot": chunk
        });
      }

      const secretKey = await SecretKey.generate({"nodes": nilDbNodes.map(url => ({ url }))}, {"store": true});
      console.log("secretKey", {"nodes": nilDbNodes.map(url => ({ url }))}, secretKey);
      const userKeypair = Keypair.from(bytesToHex(secretKey.material as Uint8Array));
      const userDid = userKeypair.toDid().toString();
      console.log("Generated user DID:", userDid);
      const user = await SecretVaultUserClient.from({
          baseUrls: nilDbNodes,
          keypair: userKeypair,
          blindfold: {
            operation: "store",
            useClusterKey: true,
          }
      });

      const delegation = await grantWriteAccessToUser(builder, userKeypair.toDid());

      // User's private data
      const userPrivateData = {
        "_id": crypto.randomUUID(),
        "statement_chunks": chunks
      };

      const newData = await user.createData(delegation, {
          owner: userDid,
          acl: {
              grantee: builder.did.toString(), // Grant access to the builder
              read: true, // Builder can read the data
              write: false, // Builder cannot modify the data
              execute: true, // Builder can run queries on the data
          },
          collection: collectionId,
          data: [userPrivateData],
      });

      const dataId = Object.values(newData)[0]?.data?.created?.[0];

      console.log("Data created:", dataId);

      const nucReadTokens = [];

      // Generate n tokens, one for each nilDB node
      for (const node of nillionNetworkConfig.nildb.servers) {
        const audience = publicKeyToDid(node.publicKey);
        const nucReadToken = await generateToken(
          null,
          new Command(['nil', 'db', 'users', 'read']),
          audience,
          64000, // TODO
          userKeypair.privateKey(),
          true,
          userKeypair.toDid(),
        );
        nucReadTokens.push({
          url: node.url,
          token: nucReadToken,
          publicKey: node.publicKey,
        });
      }

      console.log("Generated NUC read tokens:", nucReadTokens);

      return {
        uploadId: `upload_${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        documentId: dataId,
        collectionId,
        nucReadTokens: btoa(JSON.stringify(nucReadTokens)),
        status: 'uploaded',
      };
     } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  /**
   * Mock processing for development/demo purposes
   */
  async mockProcess(uploadId: string): Promise<FinancialInsights> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockInsights: FinancialInsights = {
      totalIncome: 8450.50,
      totalExpenses: 6230.75,
      balance: 2219.75,
      transactionCount: 124,
      categories: [
        { name: 'Food & Dining', amount: 1850.30, percentage: 32, color: '#EF4444' },
        { name: 'Transportation', amount: 980.45, percentage: 17, color: '#F97316' },
        { name: 'Shopping', amount: 1200.00, percentage: 21, color: '#8B5CF6' },
        { name: 'Utilities', amount: 650.00, percentage: 11, color: '#06B6D4' },
        { name: 'Entertainment', amount: 450.75, percentage: 8, color: '#84CC16' },
        { name: 'Others', amount: 650.25, percentage: 11, color: '#6B7280' },
      ],
      trends: {
        incomeChange: 12.5,
        expenseChange: -3.2,
      },
    };

    return mockInsights;
  }
}

export const apiService = new ApiService();