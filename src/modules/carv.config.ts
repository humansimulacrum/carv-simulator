import { UserAgents } from '../utils/assets/user-agents.asset';
import { choose } from '../utils/helpers/random.helper';

export const CARV_MINT_CHAINS = ['ronin', 'opbnb'] as const;

export const CHAIN_INFO = {
  zksync: {
    rpc: ['https://rpc.ankr.com/zksync_era'],
    explorer: 'https://explorer.zksync.io/tx/',
    token: 'ETH',
    eip1559: true,
    chain_id: 324,
  },
  linea: {
    rpc: ['https://linea.drpc.org', 'https://1rpc.io/linea', 'https://rpc.linea.build'],
    explorer: 'https://lineascan.build/tx/',
    token: 'ETH',
    eip1559: false,
    chain_id: 59144,
  },
  opbnb: {
    rpc: ['https://opbnb.publicnode.com', 'https://1rpc.io/opbnb', 'https://opbnb-mainnet-rpc.bnbchain.org'],
    explorer: 'https://opbnbscan.com/tx/',
    token: 'BNB',
    eip1559: false,
    chain_id: 204,
  },
  ronin: {
    rpc: ['https://ronin.drpc.org'],
    explorer: 'https://app.roninchain.com/tx/',
    token: 'RON',
    eip1559: true,
    chain_id: 2020,
  },
};

export const getCarvHeaders = () => ({
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Origin: 'https://protocol.carv.io',
  Referer: 'https://protocol.carv.io/',
  'Content-Type': 'application/json',
  'User-Agent': choose(UserAgents),
});

export const CARV_ABI = [
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: 'mintData',
        internalType: 'struct Soul.MintData',
        type: 'tuple',
        components: [
          {
            name: 'account',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'amount',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'ymd',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        internalType: 'bytes',
        type: 'bytes',
      },
    ],
    name: 'mintSoul',
    outputs: [],
  },
] as const;
