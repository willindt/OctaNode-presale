import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import TabPanel from "../../components/TabPanel";
import { changeApproval, changeDeposit } from "../../slices/PresaleThunk";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Zoom,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@material-ui/core";
import { trim } from "../../helpers";
import "./presale.scss";
import { Skeleton } from "@material-ui/lab";
import { error, info } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";

function Presale() {
  const dispatch = useDispatch();
  let isLoad = false;
  const { provider, address, connected, connect, chainID } = useWeb3Context();
  const [quantity, setQuantity] = useState("");
  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });
  const price = useSelector(state => {
    return state.app.price;
  });
  const busdBalance = useSelector(state => {
    return state.account.balances && state.account.balances.busd;
  });
  const isAddedWhitelist = useSelector(state => {
    return state.account.presale && state.account.presale.isWhiteList;
  });
  const minbusdBalance = useSelector(state => {
    return state.app.minBusdLimit;
  });
  const tokenAmount = useSelector(state => {
    return state.app.totalTokenAmount
  }); 
  const totalTokenAmountToDistribute = useSelector(state => {
    return state.app.totalTokenAmountToDistribute;
  });
  const isList = useSelector(state => {
    return state.app.isList;
  });
  const isPresaleOpen = useSelector(state => {
    return state.app.isPresaleOpen;
  });
  if (!isLoad && busdBalance && (Number(busdBalance) - Number(minbusdBalance) < 0)) {
    dispatch(info("You got not enough $BUSD."));
    isLoad = true;
  }
  if (isList && !isAddedWhitelist) {
    dispatch(info("You are not on the whitelist."));
  }
  const setMax = () => {
    setQuantity(busdBalance);
  };
  const onSeekApproval = async token => {
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };
  const presaleAllowance = useSelector(state => {
    return state.account.presale && state.account.presale.presaleAllowance;
  });
  const tokenBought = totalTokenAmountToDistribute / 1000000000;
  const tokensRemain = tokenAmount - tokenBought;
  const onChangeDeposit = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "ether");

    if (action === "presale" && gweiValue.gt(ethers.utils.parseUnits(busdBalance, "ether"))) {
      return dispatch(error("You cannot deposit more than your BUSD balance."));
    }
    await dispatch(changeDeposit({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };
  const hasAllowance = useCallback(
    token => {
      if (token === "busd") return presaleAllowance > 0;
      return 0;
    },
    [presaleAllowance],
  );
  const isAllowanceDataLoading = presaleAllowance == null;
  return (
    <div id="dashboard-view">
      <div className="presale-header">
        <h1>Presale</h1>
        <p>Whitelist is needed for this presale!</p>
      </div>
      <Paper className={`ohm-card`}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <div className="card-header">
              <Typography variant="h5">Presale</Typography>
            </div>
          </Grid>
          {/* <Grid item>
            <div className="stake-top-metrics">
              <Typography className="presale-items">You are able to purchase up to 250 <span style={{color: "#FE4C4F"}}>$OCTA</span> tokens.</Typography>
              <Typography className="presale-items">You have until *** to purchase your desired <span style={{color: "#FE4C4F"}}>$OCTA</span> tokens.</Typography>
            </div>
          </Grid> */}
          {totalTokenAmountToDistribute && totalTokenAmountToDistribute && 
            <Grid item>
              <div className="stake-top-metrics data-row-centered" style={{marginBottom: "18px"}}>
                <Typography className="presale-items">Tokens bought:</Typography>
                <Typography className="presale-items" style={{marginLeft: "16px"}}><span style={{color: "#FE4C4F"}}>{tokenBought.toFixed(3)} $OCTA</span></Typography>
              </div>
              <div className="stake-top-metrics data-row-centered" style={{marginBottom: "18px"}}>
                <Typography className="presale-items">Tokens left:</Typography>
                <Typography className="presale-items" style={{marginLeft: "16px"}}><span style={{color: "#FE4C4F"}}>{tokensRemain.toFixed(3)} $OCTA</span></Typography>
              </div>
            </Grid>
          }
          
          {isPresaleOpen ? <Grid item>
            <div className="stake-top-metrics" style={{ whiteSpace: "normal" }}>
              <Box alignItems="center" justifyContent="center" flexDirection="column" display="flex">
                {address && !isAllowanceDataLoading ? (
                  !hasAllowance("busd") ? (
                    <Box className="help-text">
                      <Typography variant="body1" className="stake-note" color="textSecondary">
                        <>
                          First time deposit <b>BUSD</b>?
                          <br />
                          Please approve OctaNode to use your <b>BUSD</b> for presale.
                        </>
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* <Grid item xs={12} sm={3} md={3} lg={3} /> */}
                      <Box item xs={12} sm={6} md={6} lg={6}>
                        <FormControl className="ohm-input" variant="outlined" color="primary">
                          <InputLabel htmlFor="amount-input"></InputLabel>
                          <OutlinedInput
                            id="amount-input"
                            type="number"
                            placeholder="Enter an amount"
                            className="stake-input"
                            value={quantity}
                            width="100%"
                            onChange={e => setQuantity(e.target.value)}
                            labelWidth={0}
                            endAdornment={
                              <InputAdornment position="end">
                                <Button variant="text" onClick={setMax} color="inherit">
                                  Max
                                </Button>
                              </InputAdornment>
                            }
                          />
                        </FormControl>
                      </Box>
                    </>
                  )
                ) : (
                  <Skeleton width="35%" />
                )}

                {isAllowanceDataLoading ? (
                  <Skeleton width="35%" />
                ) : address && hasAllowance("busd") ? (
                  <>
                    {/* <Grid item xs={12} sm={2} md={2} lg={2} /> */}
                    <Box alignItems="center" justifyContent="center" flexDirection="column" display="flex">
                      <Typography style={{marginTop: "16px"}}>1 $OCTA = 5 $BUSD</Typography>
                      <Typography style={{marginTop: "16px"}}>Enter Amount in $BUSD</Typography>
                      <Button
                        className="stake-button"
                        variant="contained"
                        color="primary"
                        disabled={isPendingTxn(pendingTransactions, "deposit")}
                        style={{marginTop: "16px"}}
                        onClick={() => {
                          onChangeDeposit("presale");
                        }}
                      >
                        {txnButtonText(pendingTransactions, "deposit", "BUY")}
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box>
                    <Button
                      className="stake-button"
                      variant="contained"
                      color="primary"
                      disabled={isPendingTxn(pendingTransactions, "approve_deposit")}
                      onClick={() => {
                        onSeekApproval("busd");
                      }}
                    >
                      {txnButtonText(pendingTransactions, "approve_deposit", "Approve")}
                    </Button>
                  </Box>
                )}
              </Box>
            </div>
          </Grid>
          :
          <Grid item>
            <Typography className="presale-items" varient="h4">Presale is not started</Typography>
          </Grid>
          }
        </Grid>
      </Paper>
    </div>
  );
}

export default Presale;
