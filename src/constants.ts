export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/drondin/olympus-graph";
export const EPOCH_INTERVAL = 9600;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 3;

export const TOKEN_DECIMALS = 9;

export const POOL_GRAPH_URLS = {
  4: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
  1: "https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3",
};

interface IAddresses {
  [key: number]: { [key: string]: string };
}
export const addresses: IAddresses = {
  56: {
    BUSD_ADDRESS: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    DAI_ADDRESS: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", // duplicate
    USDC_ADDRESS: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    HEC_ADDRESS: "0x7D8461077e7D774a12F407124Af3c7CC06AD3Cbb",
    BHD_ADDRESS: "0xfCE28BE5df7B09C5ce8Bb47c2f627d8C9F26DeE3",
    STAKING_ADDRESS: "0x309a656b9e2516b5b49b004765f7b1b0b966f99c", // The new staking contract
    STAKING_HELPER_ADDRESS: "0xfc43a07c350d9c8b895af8a85eccc8345ba8764e", // Helper contract used for Staking only
    OLD_STAKING_ADDRESS: "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40",
    OLD_STAKING_HELPER_ADDRESS: "0x2ca8913173D36021dC56922b5db8C428C3fdb146",
    PRESALE_ADDRESS: "0x99d6Ef8A48AA752Bb1C2F664D9745D370e14B129",
    SHEC_ADDRESS: "0x2140ad95696cb3be694982db280dfe6324dbfe6c",
    OLD_SHEC_ADDRESS: "0x36F26880C6406b967bDb9901CDe43ABC9D53f106",
    MIGRATE_ADDRESS: "0xC7f56EC779cB9e60afA116d73F3708761197dB3d",
    DISTRIBUTOR_ADDRESS: "0x0b8D3Bd8df47da1d3635C90b4B71EBD90E769654",
    BONDINGCALC_ADDRESS: "0xbe88d6c88f572435bF5B6b00a1464f7E3248864F",
    TREASURY_ADDRESS: "0x4DcA68AdEE7C4eA75EAFD20d8b1755e3dF8013D9",
    REDEEM_HELPER_ADDRESS: "0x656dF1F51AD2ab96F271356A792BADb8c95b9bb3",
  },
};
