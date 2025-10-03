const nilDbTestServers = [
  {
    name: 'Nillion Staging 1',
    id: 'nildb-stg-n1',
    url: 'https://nildb-stg-n1.nillion.network',
    publicKey: '02e3846c455dbceef9eff8a84127c3be1b9719ac05415efbf72790f31fa9f8027a',
  },
  {
    name: 'Nillion Staging 2',
    id: 'nildb-stg-n2',
    url: 'https://nildb-stg-n2.nillion.network',
    publicKey: '025792e96a68c0b7ef7794960327dc570704c6dd565cf2cacf206bdc72d6123f90',
  },
  {
    name: 'Nillion Staging 3',
    id: 'nildb-stg-n3',
    url: 'https://nildb-stg-n3.nillion.network',
    publicKey: '0304001592c3d2a4af4fd049f75a5623e10939b37c38cc64c264801a5567b493ab',
  },
];

export const nillionNetworkConfig = {
  nildb: {
    servers: nilDbTestServers,
  },
  nilauth: {
    url: "https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz",
    publicKey: "03e3ba1eb887b4e972fbf395d479ff6cdb2cec91ba477ffc287b2b9cb5ec2161aa",
  },
  nilchain: {
    url: "https://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz"
  },
};
