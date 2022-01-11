import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sBHD } from "../abi/Presale.json";
import { abi as pBHD } from "../abi/Presale.json";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { Bond, NetworkID } from "src/lib/Bond"; // TODO: this type definition needs to move out of BOND.
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const bhdContract = new ethers.Contract(addresses[networkID].PRESALE_ADDRESS as string, ierc20Abi, provider);
    const bhdBalance = await bhdContract.balanceOf(address);
    const sbhdContract = new ethers.Contract(addresses[networkID].PRESALE_ADDRESS as string, sBHD, provider);
    const sbhdBalance = await sbhdContract.balanceOf(address);
    let poolBalance = 0;
    const poolTokenContract = new ethers.Contract(addresses[networkID].PT_TOKEN_ADDRESS as string, ierc20Abi, provider);
    poolBalance = await poolTokenContract.balanceOf(address);

    return {
      balances: {
        bhd: ethers.utils.formatUnits(bhdBalance, "gwei"),
        sbhd: ethers.utils.formatUnits(sbhdBalance, "gwei"),
        pool: ethers.utils.formatUnits(poolBalance, "gwei"),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {
    let bhdBalance = 0;
    let sbhdBalance = 0;
    let pbhdBalance = 0;
    let busdBalance = 0;
    let presaleAllowance = 0;
    let claimAllowance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let daiBondAllowance = 0;
    let poolAllowance = 0;

    // const daiContract = new ethers.Contract(addresses[networkID].DAI_ADDRESS as string, ierc20Abi, provider);
    // const daiBalance = await daiContract.balanceOf(address);

    const busdContract = new ethers.Contract(addresses[networkID].BUSD_ADDRESS as string, ierc20Abi, provider);
    busdBalance = await busdContract.balanceOf(address);

    // const pbhdContract = new ethers.Contract(addresses[networkID].PBHD_ADDRESS as string, pBHD, provider);
    // pbhdBalance = await pbhdContract.balanceOf(address);

    const bhdContract = new ethers.Contract(addresses[networkID].BHD_ADDRESS as string, ierc20Abi, provider);
    bhdBalance = await bhdContract.balanceOf(address);
    // stakeAllowance = await bhdContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    // const sbhdContract = new ethers.Contract(addresses[networkID].SBHD_ADDRESS as string, sBHD, provider);
    // sbhdBalance = await sbhdContract.balanceOf(address);
    // unstakeAllowance = await sbhdContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    // poolAllowance = await sbhdContract.allowance(address, addresses[networkID].PT_PRIZE_POOL_ADDRESS);

    if (addresses[networkID].BUSD_ADDRESS) {
      presaleAllowance = await busdContract.allowance(address, addresses[networkID].PRESALE_ADDRESS);
    }

    if (addresses[networkID].BHD_ADDRESS) {
      claimAllowance = await bhdContract.allowance(address, addresses[networkID].PRESALE_ADDRESS);
    }

    return {
      balances: {
        dai: 0,
        busd: ethers.utils.formatEther(busdBalance),
        bhd: ethers.utils.formatUnits(bhdBalance, "gwei"),
        sbhd: ethers.utils.formatUnits(sbhdBalance, "gwei"),
        pbhd: ethers.utils.formatUnits(pbhdBalance, "gwei"),
      },
      presale: {
        presaleAllowance: +presaleAllowance,
      },
      claim: {
        claimAllowance: +claimAllowance,
      },
      staking: {
        bhdStake: +stakeAllowance,
        bhdUnstake: +unstakeAllowance,
      },
      bonding: {
        daiAllowance: daiBondAllowance,
      },
      pooling: {
        sbhdPool: +poolAllowance,
      },
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationBlock: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
      balance = 0;
    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    // formatEthers takes BigNumber => String
    // let balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    let deciamls = 18;
    if (bond.name == "usdc") {
      deciamls = 6;
    }
    const balanceVal = balance / Math.pow(10, deciamls);
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: balanceVal.toString(),
      interestDue,
      bondMaturationBlock,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    bhd: string;
    sbhd: string;
    pbhd: string;
    dai: string;
    busd: string;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { bhd: "", sbhd: "", pbhd: "", dai: "", busd: "" },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
