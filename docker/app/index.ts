import 'dotenv/config';

import { SecretVaultBuilderClient, SecretVaultUserClient, Uuid } from '@nillion/secretvaults';
import {
    Command,
    Keypair,
    Did,
} from '@nillion/nuc';
import { SecretKey, encrypt, decrypt, ClusterKey } from '@nillion/blindfold';
import {
  NilaiOpenAIClient,
  DelegationTokenServer,
  AuthType,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  NilAuthInstance,
} from "@nillion/nilai-ts";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import express from 'express';

const app = express();
const PORT = 8080;

const extractJSON = (text: string): Record<string, unknown> => {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return { raw: text };
  }
}

let status = {
  state: 'pending',
  result: null,
  error: null
};

app.get('/status', (req, res) => {
  res.json(status);
});

// Your actual application logic
async function runLogic() {

    status.state = 'processing';
    
    try {

        const documentId = process.env.DOCUMENT_ID as string;
        const collectionId = process.env.COLLECTION_ID as string;
        const tokensPayload = process.env.DELEGATION_TOKENS as string;
        const jsonPayload = JSON.parse(Buffer.from(tokensPayload, 'base64').toString('utf-8'));
        const responses = await Promise.all(
            jsonPayload.map((item: any) =>
                fetch(`${item.url}/v1/users/data/${collectionId}/${documentId}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${item.token}`,
                    },
                })
            )
        );
        const data = await Promise.all(responses.map(res => res.json()));
        const urls: object[] = jsonPayload.map((item: any) => { return { "url": item.url } });
        const secretKey = await ClusterKey.generate({"nodes": urls}, {"store": true});
        const deciphered = await decryptAndConcatenate(secretKey, data);

        const pdfBuffer = Buffer.from(deciphered, "base64");
    
        const pdfData = new Uint8Array(pdfBuffer);

        const loadingTask = getDocument({ data: pdfData });
        const pdfDoc = await loadingTask.promise;

        let pdfText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        pdfText += content.items.map((item: any) => item.str).join(" ") + "\n";
        }

        const server = new DelegationTokenServer(
        "1ce2a82a51bfedb409cb42efff3b4b029e885ac3bdfda4dbb2e12d86c024c163",
        {
            nilauthInstance: NilAuthInstance.SANDBOX,
            expirationTime: 10, // 10 seconds validity of delegation tokens
            tokenMaxUses: 1,    // 1 use of a delegation token
        },
        );
        
        const client = new NilaiOpenAIClient({
        baseURL: "https://nilai-a779.nillion.network/v1/",
        authType: AuthType.DELEGATION_TOKEN,
        // For production instances, use the following:
        //nilauthInstance: NilAuthInstance.PRODUCTION,
        });

        // >>> Client produces a delegation request
        const delegationRequest: DelegationTokenRequest = client.getDelegationRequest();

        // <<< Server creates a delegation token
        const delegationToken: DelegationTokenResponse = await server.createDelegationToken(
        delegationRequest
        );

        // >>> Client sets internally the delegation token
        client.updateDelegation(delegationToken);

        // >>> Client uses the delegation token to make a request
        const response = await client.chat.completions.create(
        {
            model: "google/gemma-3-27b-it",
            messages: [
            {
                role: "user",
                content: `Here is a bank statement:\n\n${pdfText}\n\nCan you summarize the content? I want to gather insights and also have transactions categorized by type (e.g., groceries, utilities, entertainment)? The output should be in JSON format with this structure interface InsightsSummaryProps {insights: {totalIncome: number;totalExpenses: number;balance: number;transactionCount: number;categories: Array<{name: string;amount: number;percentage: number;color: string;}>;trends: {incomeChange: number;expenseChange: number;};};}. The overall tone should be professional and concise and it should include a text field with 3 Smart Insights and another text field with 3 Summary Stats.CRITICAL: Respond ONLY with valid JSON. Do not include markdown code fences, explanations, or any text outside the JSON object. Your entire response must be a single valid JSON object that starts with { and ends with }. Get the currency code from the text.`,
            }
            ],
        }
        );

        const result = { message: extractJSON(response.choices[0].message.content) };
        status = {
            state: 'completed',
            result: result,
            error: null
        };
        
        console.log('Logic completed successfully'); 
        
    } catch (error: any) {
        console.log('⚠️ Error:', JSON.stringify(error, null, 2));
        status = {
            state: 'failed',
            result: null,
            error: error.message
        };
    }

}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Starting application logic...');
  runLogic();
});

async function decryptAndConcatenate(secretKey, data) {
  const numChunks = data[0].data.statement_chunks.length;
  let result = "";
  
  for (let i = 0; i < numChunks; i++) {
    const shares = data.map(item => item.data.statement_chunks[i]['%share']);
    const decrypted = await decrypt(secretKey, shares);

    result += decrypted;
  }
  
  return result;
}