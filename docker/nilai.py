import os
import base64
import json
import requests
import blindfold
from nilai_py import (
    Client,
    AuthType,
    DelegationTokenResponse,
)

def get_user_data(base_url, collection_id, document_id, nuc_token):
    url = f"{base_url}/v1/users/data/{collection_id}/{document_id}"
    
    headers = {
        "Authorization": f"Bearer {nuc_token}"
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

def main():

    delegation_tokens_b64 = os.getenv("DELEGATION_TOKENS")
    collection_id = os.getenv("COLLECTION_ID")
    document_id = os.getenv("DOCUMENT_ID")
    delegation_tokens_json = base64.b64decode(delegation_tokens_b64).decode("utf-8")
    delegation_tokens = json.loads(delegation_tokens_json)

    print("DELEGATION_TOKEN.0:", delegation_tokens[0]["token"])

    # nilDB
    try:
        data = get_user_data(delegation_tokens[0]["url"], collection_id, document_id, delegation_tokens[0]["token"])
        print("Success:", data)
        secret_key = blindfold.SecretKey.generate({'nodes': [{}]}, {'store': True})
        plaintext = "abc"
        ciphertext = blindfold.encrypt(secret_key, plaintext)
        decrypted = blindfold.decrypt(secret_key, ciphertext)
        print("Decrypted:", decrypted)
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"Error: {e}")
    

    # nilAI part
    # dt = DelegationTokenResponse(
    #     delegation_token=delegation_tokens[0]["token"],
    # )
    # print("DELEGATION_TOKEN field 'dt':", dt)

    # client = Client(
    #     base_url="https://nilai-a779.nillion.network/v1/",
    #     auth_type=AuthType.DELEGATION_TOKEN,
    #     # For production instances, use the following:
    #     # nilauth_instance=NilAuthInstance.PRODUCTION,
    # )
    
    # # >>> Client sets internally the delegation token
    # client.update_delegation(dt)

    # # >>> Client uses the delegation token to make a request
    # response = client.chat.completions.create(
    #     model="meta-llama/Llama-3.2-3B-Instruct",
    #     messages=[
    #         {"role": "user", "content": "Hello! Can you help me with something?"}
    #     ],
    # )

    # print(f"Response: {response.choices[0].message.content}")


if __name__ == "__main__":
    main()