export const EPOCH_INTERVAL = 9600;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 3;

interface IAddresses {
  [key: number]: { [key: string]: string };
}
export const addresses: IAddresses = {
  56: {
    BUSD_ADDRESS: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    TOKEN_ADDRESS: "0xf9c161f2fc4d54e36d2913ec9ad96fd4f2c2e254",
    PRESALE_ADDRESS: "0x5e039976966ff2F36574E91325bdC259663Bd8D6",
  },
};
