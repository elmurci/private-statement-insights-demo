import {
    Command,
    NucTokenBuilder,
    Did,
    NucTokenEnvelope,
    Policy,
    DelegationBody,
    InvocationBody,
} from '@nillion/nuc';

export const tokenExpiration = 3600

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export const publicKeyToDid = (publicKey) => {
  return new Did(Uint8Array.from(Buffer.from(publicKey, 'hex')));
}

export const grantWriteAccessToUser = async (builder: SecretVaultBuilderClient, audience: Did) => {
  return generateToken(
    builder.rootToken,
    new Command(['nil', 'db', 'data', 'create']),
    audience,
    3600, // 1 hour
    builder.keypair.privateKey()
  )
}

export const generateToken = async (
  parentToken,
  command,
  audience,
  tokenExpirySeconds,
  privateKey,
  invocation = false,
  subject = null,
) => {
  const token = parentToken ? NucTokenBuilder.extending(parentToken) : NucTokenBuilder.invocation({});

  token.command(command)
  .audience(audience)
  .expiresAt(Math.floor(Date.now() / 1000) + tokenExpirySeconds);

  if (invocation) token.body(new InvocationBody({}));
  if (subject) token.subject(subject);

  return token.build(privateKey);
}