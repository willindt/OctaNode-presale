import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as PresaleContract } from "../abi/Presale.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import { NodeHelper } from "../helpers/NodeHelper";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";

const initialState = {
  loading: false,
  loadingMarketPrice: false,
};

export const loadAppDetails = createAsyncThunk(
  "app/loadAppDetails",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch }) => {
    const presaleContract = new ethers.Contract(
      addresses[networkID].PRESALE_ADDRESS as string,
      PresaleContract,
      provider,
    );
    const percentReleased = await presaleContract.getPercentReleased();
    const isList = await presaleContract.isList();
    const isPresaleOpen = await presaleContract.isPresaleOpen();
    const maxBusdLimit = await presaleContract.maxBusdLimit();
    const minBusdLimit = await presaleContract.minBusdLimit();
    const rate = await presaleContract.rate();
    const price = 1000000000 / rate;
    const totalTokenAmountToDistribute = await presaleContract.totalpTokenAmountToDistribute();
    

    return {
      percentReleased,
      isList,
      isPresaleOpen,
      maxBusdLimit,
      minBusdLimit,
      price,
      totalTokenAmountToDistribute,
    } as IPresaleData;
  },
);

/**
 * checks if app.slice has marketPrice already
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
  "app/findOrLoadMarketPrice",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch, getState }) => {
    const state: any = getState();
    let marketPrice;
    // check if we already have loaded market price
    if (state.app.loadingMarketPrice === false && state.app.marketPrice) {
      // go get marketPrice from app.state
      marketPrice = state.app.marketPrice;
    } else {
      // we don't have marketPrice in app.state, so go get it
      try {
        const originalPromiseResult = await dispatch(
          loadMarketPrice({ networkID: networkID, provider: provider }),
        ).unwrap();
        marketPrice = originalPromiseResult?.marketPrice;
      } catch (rejectedValueOrSerializedError) {
        // handle error here
        console.error("Returned a null response from dispatch(loadMarketPrice)");
        return;
      }
    }
    return { marketPrice };
  },
);

/**
 * - fetches the OHM price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ohm-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("app/loadMarketPrice", async ({ networkID, provider }: IBaseAsyncThunk) => {
  let marketPrice: number;
  try {
    marketPrice = await getMarketPrice({ networkID, provider });
    marketPrice = marketPrice / Math.pow(10, 9);
  } catch (e) {
    marketPrice = await getTokenPrice("hector");
  }
  return { marketPrice };
});

interface IAppData {
  readonly circSupply: number;
  readonly currentIndex?: string;
  readonly currentBlock?: number;
  readonly fiveDayRate?: number;
  readonly oldfiveDayRate?: number;
  readonly marketCap: number;
  readonly marketPrice: number;
  readonly stakingAPY?: number;
  readonly stakingRebase?: number;
  readonly old_stakingRebase?: number;
  readonly stakingTVL: number;
  readonly totalSupply: number;
  readonly treasuryBalance?: number;
  readonly endBlock?: number;
  readonly runway?: number;
}

interface IPresaleData {
  readonly percentReleased: number;
  readonly isList: boolean;
  readonly isPresaleOpen: boolean;
  readonly maxBusdLimit: number;
  readonly minBusdLimit: number;
  readonly price: number;
  readonly totalTokenAmountToDistribute: number;
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      // .addCase(loadMarketPrice.pending, (state, action) => {
      //   state.loadingMarketPrice = true;
      // })
      // .addCase(loadMarketPrice.fulfilled, (state, action) => {
      //   setAll(state, action.payload);
      //   state.loadingMarketPrice = false;
      // })
      // .addCase(loadMarketPrice.rejected, (state, { error }) => {
      //   state.loadingMarketPrice = false;
      //   console.error(error.name, error.message, error.stack);
      // });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
