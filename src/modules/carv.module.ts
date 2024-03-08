import { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import { sleep } from '../utils/helpers/sleep.helper';
import { randomIntInRange } from '../utils/helpers/random.helper';
import { RPC_URL, errorRetryTimes, errorWaitSec } from '../config.const';
import { CARV_ABI, CARV_MINT_CHAINS, CHAIN_INFO, getCarvHeaders } from './carv.config';
import { getClient } from '../utils/helpers/axios-client.helper';
import { logger } from '../utils/helpers/logger.helper';

interface MintData {
  contract: string;
  permit: any;
  signature: string;
}

export class Carv {
  private headers: { [key: string]: string };
  private proxy: string;
  private client: AxiosInstance;

  private wallet: ethers.Wallet;

  private accountName: string;

  constructor(privateKey: string, accountName: string, proxy: string) {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(privateKey, provider);

    this.headers = getCarvHeaders();
    this.accountName = accountName;
    this.proxy = proxy;

    this.client = getClient(
      { proxy: this.proxy, errorRetryTimes: errorRetryTimes, errorWaitSec: errorWaitSec },
      this.headers
    );
  }

  async login(): Promise<void> {
    const unixtime = new Date().getTime();
    const message = `Hello! Please sign this message to confirm your ownership of the address. This action will not cost any gas fee. Here is a unique text: ${unixtime}`;
    const signature = await this.wallet.signMessage(message);

    const response = await this.client.post('https://interface.carv.io/protocol/login', {
      wallet_addr: this.wallet.address,
      text: message,
      signature: signature,
    });

    const token = `eoa:${response.data.data.token}`;
    this.headers['Authorization'] = 'bearer ' + Buffer.from(token).toString('base64');
    this.client = getClient(
      { proxy: this.proxy, errorRetryTimes: errorRetryTimes, errorWaitSec: errorWaitSec },
      this.headers
    );

    logger.info(`${this.accountName} | Successfully logged in`);
    await sleep(randomIntInRange(10000, 15000));
  }

  async checkMintStatus(chainId: number): Promise<string> {
    const response = await this.client.get(`https://interface.carv.io/airdrop/check_carv_status?chain_id=${chainId}`);
    return response.data.data.status;
  }

  async checkIn(chainId: number): Promise<any> {
    const response = await this.client.post('https://interface.carv.io/airdrop/mint/carv_soul', {
      chain_id: chainId,
    });

    return response.data;
  }

  async makeTransaction(chain: string, data: MintData): Promise<void> {
    const contractAddress = ethers.utils.getAddress(data.contract);
    const contract = new ethers.Contract(contractAddress, CARV_ABI, this.wallet);

    const mintData = [data.permit.account, data.permit.amount, data.permit.ymd];

    const tx = await contract.populateTransaction.mintSoul(mintData, data.signature);

    const txResponse = await this.wallet.sendTransaction(tx);
    await txResponse.wait();

    logger.info(`${this.accountName} | ${chain} | Transaction successful with hash: ${txResponse.hash}`);
  }

  async execute(): Promise<void> {
    await this.login();

    for (const chain of CARV_MINT_CHAINS) {
      const chainId = CHAIN_INFO[chain].chain_id;
      const mintStatus = await this.checkMintStatus(chainId);

      if (mintStatus === 'not_started') {
        const response = await this.checkIn(chainId);
        if (chain !== 'ronin') {
          await this.makeTransaction(chain, response.data);
        }
        logger.info(`${this.accountName} | Successfully minted on ${chain}`);
      } else {
        logger.info(`${this.accountName} | Already minted on ${chain}`);
      }
    }
  }
}
